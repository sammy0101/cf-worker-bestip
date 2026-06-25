// src/auth.js
import { jsonResponse } from './utils.js';

export function generateToken() { 
    let r = ''; 
    const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
    for(let i=0; i<32; i++) r += c.charAt(Math.floor(Math.random() * c.length)); 
    return r; 
}

export async function getTokenConfig(env) { 
    try { 
        return JSON.parse(await env.IP_STORAGE.get('token_config')); 
    } catch { 
        return null; 
    } 
}

export async function verifyAdmin(request, env) {
    if (!env.ADMIN_PASSWORD) return true;
    try {
        const authHeader = request.headers.get('Authorization');
        if (authHeader && authHeader.startsWith('Bearer ')) { 
            if (await env.IP_STORAGE.get(`session_${authHeader.slice(7)}`)) return true; 
        }
        const url = new URL(request.url);
        if (url.searchParams.get('session') && await env.IP_STORAGE.get(`session_${url.searchParams.get('session')}`)) return true;
        
        const tc = await getTokenConfig(env);
        if (tc) {
            if (!tc.neverExpire && new Date(tc.expires) < new Date()) return false;
            const t = url.searchParams.get('token') || (authHeader && authHeader.startsWith('Token ') ? authHeader.slice(6) : null);
            if (t === tc.token) { 
                tc.lastUsed = new Date().toISOString(); 
                await env.IP_STORAGE.put('token_config', JSON.stringify(tc)); 
                return true; 
            }
        }
        return false;
    } catch { 
        return false; 
    }
}

export async function handleAdminLogin(request, env) {
    if (request.method !== 'POST') return jsonResponse({ error: 'Method not allowed' }, 405);
    try {
        const { password } = await request.json();
        if (!env.ADMIN_PASSWORD) return jsonResponse({ success: false, error: '未設置 ADMIN_PASSWORD' }, 400);
        if (password === env.ADMIN_PASSWORD) {
            let tokenConfig = await getTokenConfig(env);
            if (!tokenConfig) {
                tokenConfig = { token: generateToken(), expires: new Date(Date.now() + 30*24*60*60*1000).toISOString(), createdAt: new Date().toISOString(), lastUsed: null };
                await env.IP_STORAGE.put('token_config', JSON.stringify(tokenConfig));
            }
            const sessionId = generateToken();
            await env.IP_STORAGE.put(`session_${sessionId}`, JSON.stringify({ loggedIn: true, createdAt: new Date().toISOString() }), { expirationTtl: 86400 });
            return jsonResponse({ success: true, sessionId, tokenConfig, message: '登入成功' });
        } else return jsonResponse({ success: false, error: '密碼錯誤' }, 401);
    } catch (e) { return jsonResponse({ error: e.message }, 500); }
}

export async function handleAdminToken(request, env) {
    if (!await verifyAdmin(request, env)) return jsonResponse({ error: '需要權限' }, 401);
    if (request.method === 'GET') return jsonResponse({ tokenConfig: await getTokenConfig(env) });
    if (request.method === 'POST') {
        const { token, expiresDays, neverExpire } = await request.json();
        let newToken = token ? token.trim() : generateToken();
        let expiresDate = neverExpire ? new Date(Date.now() + 100*365*24*60*60*1000).toISOString() : new Date(Date.now() + expiresDays*24*60*60*1000).toISOString();
        const config = { token: newToken, expires: expiresDate, createdAt: new Date().toISOString(), lastUsed: null, neverExpire: neverExpire||false };
        await env.IP_STORAGE.put('token_config', JSON.stringify(config));
        return jsonResponse({ success: true, tokenConfig: config, message: 'Token更新成功' });
    }
    return jsonResponse({ error: 'Method not allowed' }, 405);
}

export async function handleAdminStatus(env) { 
    return jsonResponse({ hasAdminPassword: !!env.ADMIN_PASSWORD, hasToken: !!await getTokenConfig(env), tokenConfig: await getTokenConfig(env) }); 
}

export async function handleAdminLogout(request, env) { 
    try {
        const authHeader = request.headers.get('Authorization');
        let sessionId = null;
        if (authHeader && authHeader.startsWith('Bearer ')) { 
            sessionId = authHeader.slice(7);
        } else {
            const url = new URL(request.url);
            sessionId = url.searchParams.get('session');
        }
        if (sessionId) {
            await env.IP_STORAGE.delete(`session_${sessionId}`);
        }
    } catch (e) {}
    return jsonResponse({ success: true }); 
}
