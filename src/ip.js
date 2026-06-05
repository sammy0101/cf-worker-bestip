// src/ip.js
import { CIDR_SOURCE_URLS, COLO_MAP, AUTO_TEST_MAX_IPS, FAST_IP_COUNT, SAFE_SUBREQUEST_LIMIT, CLOUDFLARE_OFFICIAL_CIDRS } from './config.js';
import { ipToNum, numToIp, isValidIPv4, jsonResponse, isCloudflareIP } from './utils.js';
import { verifyAdmin } from './auth.js';

export async function getStoredIPs(env) { try { return JSON.parse(await env.IP_STORAGE.get('cloudflare_ips')) || {ips:[]}; } catch { return {ips:[]}; } }
export async function getStoredSpeedIPs(env) { try { return JSON.parse(await env.IP_STORAGE.get('cloudflare_fast_ips')) || {fastIPs:[]}; } catch { return {fastIPs:[]}; } }
export async function getStoredBrowserIPs(env) { try { return JSON.parse(await env.IP_STORAGE.get('browser_fast_ips')) || {fastIPs:[]}; } catch { return {fastIPs:[]}; } }

export async function updateAllIPs(env) {
    const urls = CIDR_SOURCE_URLS;
    const uniqueIPs = new Set();
    const results = [];
    const cidrRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?:\/(?:[0-9]{1,2}))?\b/gi;
    for (const url of urls) {
        try {
            const txt = await fetchURLWithTimeout(url);
            const matches = txt.match(cidrRegex) || [];
            let count = 0;
            matches.forEach(m => {
                if(m.includes('/')) {
                    expandCIDR(m).forEach(ip => { 
                        if(isValidIPv4(ip) && isCloudflareIP(ip, CLOUDFLARE_OFFICIAL_CIDRS)) { 
                            uniqueIPs.add(ip); 
                            count++; 
                        }
                    });
                } else if(isValidIPv4(m) && isCloudflareIP(m, CLOUDFLARE_OFFICIAL_CIDRS)) { 
                    uniqueIPs.add(m); 
                    count++; 
                }
            });
            results.push({ name: url, status: 'success', count });
        } catch(e) { results.push({ name: url, status: 'error', error: e.message }); }
    }
    return { uniqueIPs: Array.from(uniqueIPs).sort((a,b) => ipToNum(a)-ipToNum(b)), results };
}

export function expandCIDR(cidr, maxSample = 10) { 
    try { 
        const [ip, m] = cidr.split('/'); 
        const mask = parseInt(m); 
        if(isNaN(mask)||mask>32) return [ip]; 
        if(mask===32) return [ip]; 
        const start = ipToNum(ip); 
        const total = Math.pow(2, 32-mask); 
        const res = new Set(); 
        const sampleSize = total > maxSample ? maxSample : total; 
        
        if(total <= maxSample) {
            for(let i=0; i<total; i++) {
                res.add(numToIp(start + i));
            }
        } else {
            while (res.size < sampleSize) {
                const randomOffset = Math.floor(Math.random() * total);
                res.add(numToIp(start + randomOffset));
            }
        }
        return Array.from(res); 
    } catch { return []; } 
}

export async function autoSpeedTestAndStore(env, ips, limit = AUTO_TEST_MAX_IPS) {
    if (!ips || !ips.length) return null;
    let randomIPs = [...ips];
    for (let i = randomIPs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [randomIPs[i], randomIPs[j]] = [randomIPs[j], randomIPs[i]]; }
    
    const safeLimit = Math.min(limit, SAFE_SUBREQUEST_LIMIT);
    const targets = randomIPs.slice(0, safeLimit);
    const results = [];
    const BATCH = 5;
    for (let i = 0; i < targets.length; i += BATCH) {
      const batch = targets.slice(i, i + BATCH);
      const promises = batch.map(ip => testIPSpeed(ip));
      const outcomes = await Promise.allSettled(promises);
      for (const out of outcomes) { if (out.status === 'fulfilled' && out.value && out.value.success) results.push({ ip: out.value.ip, latency: Math.round(out.value.latency), colo: out.value.colo }); }
      if (i + BATCH < targets.length) await new Promise(r => setTimeout(r, 200));
    }
    results.sort((a, b) => a.latency - b.latency);
    const fastIPs = results.slice(0, FAST_IP_COUNT);
    await env.IP_STORAGE.put('cloudflare_fast_ips', JSON.stringify({ fastIPs, lastTested: new Date().toISOString(), count: fastIPs.length, source: 'backend_auto' }));
}

export async function handleSpeedTest(request, env) {
    const url = new URL(request.url);
    const ip = url.searchParams.get('ip');
    if (!ip) return jsonResponse({ error: 'IP required' }, 400);
    try {
      const testUrl = `https://speed.cloudflare.com/__down?bytes=1000`;
      const response = await fetch(testUrl, { 
        headers: { 'Host': 'speed.cloudflare.com' }, 
        cf: { resolveOverride: ip }, 
        signal: AbortSignal.timeout(2500)
      });
      if (!response.ok) throw new Error(response.statusText);
      await response.text(); 
      const ray = response.headers.get('cf-ray');
      return jsonResponse({ success: true, ip, colo: ray ? ray.split('-').pop() : null, time: new Date() });
    } catch (error) { return jsonResponse({ success: false, ip, error: error.message }, 200); }
}

export async function testIPSpeed(ip) {
    try {
      const start = Date.now();
      const res = await fetch(`https://speed.cloudflare.com/__down?bytes=1000`, { 
          headers: { 'Host': 'speed.cloudflare.com' }, 
          cf: { resolveOverride: ip }, 
          signal: AbortSignal.timeout(2500)
      });
      if (!res.ok) throw new Error('HTTP Error: ' + res.status);
      await res.text();
      const ray = res.headers.get('cf-ray');
      return { success: true, ip, latency: Date.now() - start, colo: ray ? ray.split('-').pop() : null };
    } catch (e) { return { success: false, ip, error: e.message }; }
}

export async function handleUploadResults(env, request) {
    if (!await verifyAdmin(request, env)) return jsonResponse({ error: '需要權限' }, 401);
    try {
        const { fastIPs } = await request.json();
        if (!fastIPs || !Array.isArray(fastIPs)) return jsonResponse({ error: '無效數據' }, 400);
        await env.IP_STORAGE.put('browser_fast_ips', JSON.stringify({
            fastIPs: fastIPs, lastTested: new Date().toISOString(), count: fastIPs.length, source: 'browser_upload'
        }));
        return jsonResponse({ success: true });
    } catch (e) { return jsonResponse({ error: e.message }, 500); }
}

export async function handleGetFastIPsText(env, request) {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    const data = await getStoredSpeedIPs(env);
    const list = data.fastIPs || [];
    let txt = '';
    if (format === 'ip') {
        txt = list.map(i => i.ip).join('\n');
    } else {
        txt = list.map(i => {
            const cn = COLO_MAP[i.colo] ? `(${COLO_MAP[i.colo]})` : '';
            return `${i.ip}#${i.colo}${cn}:${i.latency}ms`;
        }).join('\n');
    }
    return new Response(txt, { headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
}

export async function handleGetBrowserIPsText(env, request) {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    const data = await getStoredBrowserIPs(env);
    const list = data.fastIPs || [];
    let txt = '';
    if (format === 'ip') {
        txt = list.map(i => i.ip).join('\n');
    } else {
        txt = list.map(i => {
            const cn = COLO_MAP[i.colo] ? `(${COLO_MAP[i.colo]})` : '';
            return `${i.ip}#${i.colo}${cn}:${i.latency}ms`;
        }).join('\n');
    }
    return new Response(txt, { headers: { 'Content-Type': 'text/plain;charset=utf-8' } });
}

export async function handleGetFastIPs(env, request) { return jsonResponse(await getStoredSpeedIPs(env)); }
export async function handleGetIPs(env, request) { const d = await getStoredIPs(env); return new Response(d.ips.join('\n'), { headers: {'Content-Type': 'text/plain'} }); }
export async function handleRawIPs(env, request) { return jsonResponse(await getStoredIPs(env)); }
export async function handleItdogData(env, request) { const d = await getStoredSpeedIPs(env); return jsonResponse({ ips: (d.fastIPs||[]).map(i => i.ip) }); }

export async function handleUserIP(request) {
    const cf = request.cf;
    const ip = request.headers.get('CF-Connecting-IP');
    return jsonResponse({
        ip: ip,
        country: cf ? cf.country : 'UNK',
        city: cf ? cf.city : '',
        asn: cf ? cf.asn : '',
        colo: cf ? cf.colo : ''
    });
}

async function fetchURLWithTimeout(url) { 
    const res = await fetch(url, { 
        signal: AbortSignal.timeout(8000),
        headers: {'User-Agent': 'CF-Worker'} 
    }); 
    if(!res.ok) throw new Error('HTTP Error: ' + res.status + ' ' + res.statusText); 
    return await res.text(); 
}
