import { CIDR_SOURCE_URLS, AUTO_TEST_MAX_IPS, FAST_IP_COUNT } from './config.js';
import { ipToNum, numToIp, isValidIPv4 } from './utils.js';

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
                if(m.includes('/')) expandCIDR(m).forEach(ip => { if(isValidIPv4(ip)) { uniqueIPs.add(ip); count++; }});
                else if(isValidIPv4(m)) { uniqueIPs.add(m); count++; }
            });
            results.push({ name: url, status: 'success', count });
        } catch(e) { results.push({ name: url, status: 'error', error: e.message }); }
    }
    return { uniqueIPs: Array.from(uniqueIPs).sort((a,b) => ipToNum(a)-ipToNum(b)), results };
}

// 註：同理，將 expandCIDR, autoSpeedTestAndStore, testIPSpeed, handleSpeedTest 等函式
// 移入此處，並在最前方加上 `export`，以供其他檔案匯入。
