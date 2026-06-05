// 產生隨機 Token 函式
export function generateToken() { 
    let r = ''; 
    const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
    for(let i=0; i<32; i++) r += c.charAt(Math.floor(Math.random()*c.length)); 
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

// 註：handleAdminLogin, handleAdminToken, handleAdminStatus 等函式
// 移入此處時，需要在最前方加上 `export`。
