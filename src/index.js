// src/index.js
import { serveHTML } from './html.js';
import { handleCORS, jsonResponse } from './utils.js';
import { verifyAdmin, handleAdminLogin, handleAdminLogout, handleAdminStatus, handleAdminToken } from './auth.js';
import { updateAllIPs, autoSpeedTestAndStore, handleSpeedTest, handleUploadResults, handleGetFastIPsText, handleGetBrowserIPsText, handleGetFastIPs, handleGetIPs, handleRawIPs, handleItdogData, handleUserIP } from './ip.js';
import { AUTO_TEST_MAX_IPS } from './config.js';

export default {
    async scheduled(event, env, ctx) {
      ctx.waitUntil(handleScheduled(env));
    },
  
    async fetch(request, env, ctx) {
      const url = new URL(request.url);
      const path = url.pathname;
      const hostname = url.hostname.toLowerCase();
      
      if (!env.IP_STORAGE) return new Response('錯誤：KV 未綁定', {status: 500});
      if (request.method === 'OPTIONS') return handleCORS();

      try {
        if (hostname.startsWith('fast.') || hostname.startsWith('fast-')) return await handleGetFastIPsText(env, request);
        if (hostname.startsWith('browser.') || hostname.startsWith('web.')) return await handleGetBrowserIPsText(env, request);
        if (hostname.startsWith('all.') || hostname.startsWith('ips.') || hostname.startsWith('raw.')) return await handleGetIPs(env, request);

        switch (path) {
          case '/': return await serveHTML(env, request);
          case '/update': if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405); return await handleUpdate(env, request); 
          case '/upload-results': if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405); return await handleUploadResults(env, request);
          case '/ips': return await handleGetIPs(env, request);
          case '/ip.txt': return await handleGetIPs(env, request);
          case '/raw': return await handleRawIPs(env, request);
          case '/fast-ips': return await handleGetFastIPs(env, request);
          case '/fast-ips.txt': return await handleGetFastIPsText(env, request);
          case '/browser-ips.txt': return await handleGetBrowserIPsText(env, request);
          case '/speedtest': return await handleSpeedTest(request, env);
          case '/itdog-data': return await handleItdogData(env, request);
          case '/my-ip': return handleUserIP(request);
          case '/admin-login': return await handleAdminLogin(request, env);
          case '/admin-status': return await handleAdminStatus(env);
          case '/admin-logout': return await handleAdminLogout(env);
          case '/admin-token': return await handleAdminToken(request, env);
          default: return jsonResponse({ error: 'Endpoint not found' }, 404);
        }
      } catch (error) {
        return jsonResponse({ error: error.message }, 500);
      }
    }
};

async function handleScheduled(env) {
    const { uniqueIPs, results } = await updateAllIPs(env);
    await env.IP_STORAGE.put('cloudflare_ips', JSON.stringify({ ips: uniqueIPs, lastUpdated: new Date().toISOString(), count: uniqueIPs.length, sources: results }));
    await autoSpeedTestAndStore(env, uniqueIPs, AUTO_TEST_MAX_IPS);
}

async function handleUpdate(env, request) {
    if (!await verifyAdmin(request, env)) return jsonResponse({ error: '需要權限' }, 401);
    const start = Date.now();
    const { uniqueIPs, results } = await updateAllIPs(env);
    await env.IP_STORAGE.put('cloudflare_ips', JSON.stringify({
      ips: uniqueIPs, lastUpdated: new Date().toISOString(), count: uniqueIPs.length, sources: results
    }));
    // 修改：回傳資料中一併帶上 results 統計名單
    return jsonResponse({ 
      success: true, 
      duration: (Date.now()-start)+'ms', 
      totalIPs: uniqueIPs.length,
      results: results 
    });
}
