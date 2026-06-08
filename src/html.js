// src/html.js
import { VERSION, FAST_IP_COUNT, AUTO_TEST_MAX_IPS, BROWSER_TEST_MAX_IPS, COLO_MAP } from './config.js';
import { verifyAdmin, getTokenConfig } from './auth.js';
import { getStoredIPs, getStoredSpeedIPs } from './ip.js';

export async function serveHTML(env, request) {
    const isLoggedIn = await verifyAdmin(request, env);
    const hasAdminPassword = !!env.ADMIN_PASSWORD;
    const tokenConfig = await getTokenConfig(env);
    
    let data = { count: 0, lastUpdated: null };
    let fastIPs = [];
    if (isLoggedIn) {
        data = await getStoredIPs(env);
        const speedData = await getStoredSpeedIPs(env);
        fastIPs = speedData.fastIPs || [];
    }
    
    let sessionId = null;
    if (isLoggedIn) {
      const url = new URL(request.url);
      sessionId = url.searchParams.get('session');
    }

    const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare 優選 IP 測速平台 (${VERSION})</title>
    <style>
        /* 專業級 Zinc & Obsidian 莫蘭迪灰度變數設定 */
        :root { 
            --primary: #4f46e5;         /* 靛藍專注色 */
            --primary-hover: #4338ca;
            --bg-main: #fafafa;         /* 極簡灰白 */
            --bg-card: #ffffff;         /* 邊界卡片 */
            --bg-inner: #f4f4f5;        /* 鋅灰 Zinc-100 */
            --border: #e4e4e7;          /* 細線邊框 Zinc-200 */
            --text-main: #09090b;       /* 深黑 Obsidian Zinc-950 */
            --text-sub: #71717a;        /* 灰色 Zinc-500 */
            --radius: 12px;             /* 幾何硬圓角 */
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; line-height: 1.5; background: var(--bg-main); color: var(--text-main); padding: 32px 24px; transition: background 0.3s, color 0.3s; -webkit-font-smoothing: antialiased; }
        .container { max-width: 1200px; margin: 0 auto; }
        
        /* 頂部標頭 - 極簡無裝飾 */
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
        .header-content h1 { font-size: 1.5rem; color: var(--text-main); font-weight: 800; letter-spacing: -0.03em; }
        .header-content p { font-size: 0.8rem; color: var(--text-sub); margin-top: 4px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
        .social-link { padding: 6px 14px; border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text-sub); background: var(--bg-card); font-size: 0.8rem; font-weight: 600; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .social-link:hover { color: var(--primary); border-color: var(--primary); background: var(--bg-main); }

        /* 卡片容器 - 扁平輕陰影 */
        .card { background: var(--bg-card); border-radius: var(--radius); padding: 32px; margin-bottom: 24px; border: 1px solid var(--border); box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.02); }
        .card h2 { font-size: 1.05rem; color: var(--text-main); margin-bottom: 24px; display: flex; align-items: center; gap: 8px; font-weight: 700; letter-spacing: -0.02em; }
        
        /* 數據看板 - 工整左對齊監控版面 */
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 20px; margin-bottom: 28px; }
        .stat { background: var(--bg-card); padding: 20px 24px; border-radius: var(--radius); border: 1px solid var(--border); text-align: left; transition: all 0.2s; position: relative; }
        .stat:hover { border-color: var(--text-sub); }
        .stat-label { font-size: 0.75rem; color: var(--text-sub); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .stat-value { font-size: 1.8rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.04em; font-family: monospace; }
        
        /* 高級半透明色調按鈕 (Tinted Buttons) */
        .button-group { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 12px; }
        .button { padding: 8px 18px; border: 1px solid transparent; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); background: var(--primary); color: white; display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; text-decoration: none; height: 38px; }
        .button:hover { background: var(--primary-hover); transform: translateY(-1px); }
        .button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        
        /* 優雅微色調按鈕（不再使用刺眼亮色，改用極簡柔和配色） */
        .button-success { background: rgba(16, 185, 129, 0.08); color: #059669; border: 1px solid rgba(16, 185, 129, 0.15); } 
        .button-success:hover { background: rgba(16, 185, 129, 0.12); border-color: #059669; }
        
        .button-secondary { background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border); } 
        .button-secondary:hover { background: var(--bg-inner); border-color: var(--text-sub); }
        
        .button-purple { background: rgba(99, 102, 241, 0.08); color: #4f46e5; border: 1px solid rgba(99, 102, 241, 0.15); } 
        .button-purple:hover { background: rgba(99, 102, 241, 0.12); border-color: #4f46e5; }
        
        .button-warning { background: rgba(245, 158, 11, 0.08); color: #d97706; border: 1px solid rgba(245, 158, 11, 0.15); } 
        .button-warning:hover { background: rgba(245, 158, 11, 0.12); border-color: #d97706; }

        /* 支援端口資訊標籤 */
        .port-box { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .port-tag { padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; border: 1px solid transparent; font-weight: 700; }
        .tag-http { background: #fff1f2; color: #991b1b; border-color: #ffe4e6; } 
        .tag-https { background: #f0f9ff; color: #075985; border-color: #e0f2fe; }

        /* 表格化優選列表 */
        .ip-list { border: 1px solid var(--border); border-radius: var(--radius); overflow: hidden; }
        .ip-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 24px; border-bottom: 1px solid var(--border); background: var(--bg-card); transition: background 0.15s ease; }
        .ip-item:hover { background: var(--bg-inner); }
        .ip-item:last-child { border-bottom: none; }
        .ip-info { display: flex; align-items: center; gap: 20px; flex: 1; }
        
        /* 表格欄位嚴格對齊 */
        .colo-badge { font-size: 0.725rem; padding: 4px 10px; border-radius: 6px; background: var(--bg-inner); color: var(--text-sub); font-weight: 700; text-align: center; white-space: nowrap; border: 1px solid var(--border); min-width: 90px; letter-spacing: 0.02em; }
        .ip-address { font-family: monospace; font-weight: 700; font-size: 0.95rem; min-width: 160px; color: var(--text-main); }
        .speed-result { font-size: 0.75rem; padding: 4px 12px; border-radius: 6px; background: var(--bg-inner); min-width: 75px; text-align: center; font-weight: 700; border: 1px solid var(--border); color: var(--text-sub); }
        .speed-fast-bg { background: rgba(16, 185, 129, 0.08); color: #065f46; border-color: rgba(16, 185, 129, 0.15); } 
        
        .small-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-card); color: var(--text-main); font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: .15s; }
        .small-btn:hover { background: var(--bg-inner); border-color: var(--text-sub); }

        /* 下拉選單與防消失感知橋樑 */
        .dropdown { position: relative; display: inline-block; }
        .dropdown-content { 
            display: none; 
            position: absolute; 
            background-color: var(--bg-card); 
            min-width: 210px; 
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.03), 0 4px 6px -4px rgba(0, 0, 0, 0.03); 
            z-index: 10; 
            border-radius: var(--radius); 
            border: 1px solid var(--border); 
            top: calc(100% + 4px); 
            left: 0; 
        }
        .dropdown-content::before {
            content: '';
            position: absolute;
            top: -14px;            
            left: 0;
            right: 0;
            height: 14px;          
            background: transparent; 
        }
        .dropdown:hover .dropdown-content { display: block; }
        .dropdown-content a { color: var(--text-main); padding: 10px 16px; text-decoration: none; display: block; font-size: 0.8rem; font-weight: 600; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.15s; }
        .dropdown-content a:hover { background: var(--bg-inner); color: var(--primary); }
        .dropdown-content a:first-child { border-top-left-radius: var(--radius); border-top-right-radius: var(--radius); }
        .dropdown-content a:last-child { border-bottom-left-radius: var(--radius); border-bottom-right-radius: var(--radius); border-bottom: none; }

        /* 終端日誌盒 - Obsidian 深色風格 */
        .log-box { background: #09090b; color: #38bdf8; font-family: monospace; font-size: 0.775rem; padding: 20px; border-radius: var(--radius); margin-top: 24px; height: 180px; overflow-y: auto; border: 1px solid #27272a; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.1); }
        .log-line { margin-bottom: 5px; line-height: 1.5; letter-spacing: 0.01em; }
        .log-error { color: #f87171; }
        .log-info { color: #34d399; }

        /* 彈窗設計 */
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(9, 9, 11, 0.4); backdrop-filter: blur(4px); z-index: 1000; justify-content: center; align-items: center; }
        .modal-content { background: var(--bg-card); color: var(--text-main); padding: 32px; border-radius: var(--radius); width: 90%; max-width: 400px; border: 1px solid var(--border); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.05), 0 10px 10px -5px rgba(0,0,0,0.02); }
        .modal h3 { font-size: 1.1rem; margin-bottom: 16px; font-weight: 700; letter-spacing: -0.02em; }
        
        .lock-input, .modal-input { width: 100%; padding: 10px 14px; margin: 12px 0; border: 1px solid var(--border); border-radius: 8px; font-size: 0.9rem; outline: none; background: var(--bg-card); color: var(--text-main); transition: .2s; }
        .lock-input:focus, .modal-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.1); }
        
        /* 鎖定與管理標章 */
        .admin-indicator { position: fixed; top: 24px; right: 24px; z-index: 900; }
        .admin-badge { background: #10b981; color: white; padding: 6px 14px; border-radius: 9999px; font-size: 0.775rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.15); transition: .2s; }
        .admin-badge:hover { transform: scale(1.02); }
        .admin-badge.logged-out { background: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.15); }
        .progress-bar { height: 4px; background: var(--border); border-radius: 9999px; overflow: hidden; margin: 16px 0 12px 0; display: none; }
        .progress-fill { height: 100%; background: var(--primary); width: 0%; transition: width 0.3s; }

        /* 自然優美的暗黑黑曜石模式 (Adaptive Dark Mode) */
        @media (prefers-color-scheme: dark) {
            :root {
                --primary: #818cf8;             
                --primary-hover: #6366f1;
                --bg-main: #09090b;             /* 黑曜石 Obsidian */
                --bg-card: #18181b;             /* 深碳黑 Zinc-900 */
                --bg-inner: #09090b;            
                --border: #27272a;              /* 邊框線 Zinc-800 */
                --text-main: #fafafa;           
                --text-sub: #a1a1aa;            
            }
            body { background: var(--bg-main); }
            .social-link { background: var(--bg-card); border-color: var(--border); color: var(--text-sub); }
            .social-link:hover { color: var(--primary); border-color: var(--primary); background: var(--bg-inner); }
            .button-secondary { background: var(--bg-card); color: var(--text-main); border-color: var(--border); }
            .button-secondary:hover { background: var(--bg-inner); }
            
            .colo-badge { background: #27272a; color: #e4e4e7; border-color: #3f3f46; }
            .speed-fast-bg { background: rgba(52, 211, 153, 0.08); color: #a7f3d0; border-color: rgba(52, 211, 153, 0.15); }
            
            .tag-http { background: #450a0a; color: #fecdd3; border-color: #7f1d1d; }
            .tag-https { background: #082f49; color: #bae6fd; border-color: #0c4a6e; }
            .progress-bar { background: var(--bg-inner); }
        }
    </style>
</head>
<body>
    <div class="admin-indicator">
        <div class="admin-badge ${isLoggedIn ? '' : 'logged-out'}" onclick="${isLoggedIn ? 'logout()' : ''}" id="admin-badge">${isLoggedIn ? '🔐 管理員' : '🔒 未登入'}</div>
        ${isLoggedIn ? `<div class="dropdown-content" id="admin-dropdown" style="display:none; position:absolute; right:0;"><a onclick="logout()">退出登入</a></div>` : ''}
    </div>

    <div class="container">
        <div class="header">
            <div class="header-content"><h1>Cloudflare 優選 IP 測速平台</h1><p>${VERSION}</p></div>
            <div><a href="https://github.com/sammy0101/cf-worker-bestip" target="_blank" class="social-link">GitHub</a></div>
        </div>

        ${!isLoggedIn ? `
        <!-- 鎖定畫面 -->
        <div class="card lock-screen" style="text-align: center; padding: 40px 20px;">
            <div style="font-size: 50px; margin-bottom: 10px;">🔒</div>
            <h2 style="justify-content: center;">系統已鎖定</h2>
            <p style="color:var(--text-sub); margin-bottom:20px;">請輸入管理員密碼以查看與下載數據。</p>
            <div style="max-width: 300px; margin: 0 auto; text-align: left;">
                <input type="password" id="main-pass" class="lock-input" placeholder="輸入密碼">
                <div style="margin: 10px 0 20px 0;">
                    <label style="cursor:pointer; color:var(--text-sub); font-size:0.95rem;">
                        <input type="checkbox" id="remember-pass-main" style="margin-right:6px;">記住密碼
                    </label>
                </div>
                <button class="button" onclick="loginMain()" style="width: 100%; justify-content: center;">登入系統</button>
            </div>
        </div>
        ` : `
        <!-- 主控台 -->
        <div class="card">
            <h2>📊 系統狀態</h2>
            <div class="stats">
                <div class="stat">
                    <div class="stat-label">IP 總數</div>
                    <div class="stat-value">${data.count || 0}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">更新時間</div>
                    <div class="stat-value">${data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString('en-US', { timeZone: 'Asia/Hong_Kong', hour12: false }) : '從未'}</div>
                </div>
                <div class="stat">
                    <div class="stat-label">優質 IP</div>
                    <div class="stat-value">${fastIPs.length}</div>
                </div>
            </div>
            <div class="button-group">
                <button class="button" onclick="updateIPs()" id="update-btn">🔄 立即更新庫</button>
                <button class="button button-warning" onclick="startSpeedTest()" id="speedtest-btn">⚡ 瀏覽器測速</button>
                
                <div class="dropdown"><button class="button button-success">🚀 下載中心 ▼</button>
                    <div class="dropdown-content">
                        <a href="/fast-ips.txt" download="cloudflare_fast_ips.txt">🚀 下載後端優選 IP</a>
                        <a onclick="downloadBrowserResults()">⚡ 下載本機測速結果</a>
                        <a href="/ips" download="all_ips.txt">📦 下載完整 IP 庫</a>
                    </div>
                </div>
                <div class="dropdown"><button class="button button-secondary">📄 線上查看 ▼</button>
                    <div class="dropdown-content">
                        <a href="/fast-ips.txt" target="_blank">🚀 查看後端優選 IP</a>
                        <a href="/browser-ips.txt" target="_blank">⚡ 查看本機測速結果</a>
                        <a href="/ip.txt" target="_blank">📦 查看完整 IP 庫</a>
                    </div>
                </div>
                <div class="dropdown"><button class="button button-purple">🔌 複製 API 連結 ▼</button>
                    <div class="dropdown-content">
                        <a onclick="copyApiUrl('fast')">🚀 複製後端優選 IP API</a>
                        <a onclick="copyApiUrl('browser')">⚡ 複製本機測速結果 API</a>
                        <a onclick="copyApiUrl('all')">📦 複製完整 IP 庫 API</a>
                    </div>
                </div>
            </div>
            <div id="log-box" class="log-box"></div>
        </div>

        <div class="card">
            <h2>📡 支援端口資訊</h2>
            <div style="margin-bottom: 20px;">
                <div style="color:#be123c; font-weight:600; margin-bottom:5px;">HTTP 支援端口：</div>
                <div class="port-box"><span class="port-tag tag-http">80</span><span class="port-tag tag-http">8080</span><span class="port-tag tag-http">8880</span><span class="port-tag tag-http">2052</span><span class="port-tag tag-http">2082</span><span class="port-tag tag-http">2086</span><span class="port-tag tag-http">2095</span></div>
            </div>
            <div>
                <div style="color:#1d4ed8; font-weight:600; margin-bottom:5px;">HTTPS 支援端口：</div>
                <div class="port-box"><span class="port-tag tag-https">443</span><span class="port-tag tag-https">2053</span><span class="port-tag tag-https">2083</span><span class="port-tag tag-https">2087</span><span class="port-tag tag-https">2096</span><span class="port-tag tag-https">8443</span></div>
            </div>
        </div>

        <div class="card">
            <div style="display:flex; justify-content:space-between; margin-bottom:15px;"><h2>🏆 優選 IP 列表</h2><button class="small-btn" onclick="copyAllFastIPs()">📋 複製所有 IP</button></div>
            <div class="progress-bar" id="progress"><div class="progress-fill" id="progress-fill"></div></div>
            <div id="status-text" style="text-align:center; font-size:0.85rem; color:var(--text-sub); margin-bottom:10px;"></div>
            <div class="ip-list" id="ip-list">
                ${fastIPs.length > 0 ? fastIPs.map(item => {
                    const speedClass = item.latency < 200 ? 'speed-fast-bg' : '';
                    const colo = item.colo || 'UNK';
                    const cnName = COLO_MAP[colo] ? ` (${COLO_MAP[colo]})` : '';
                    const coloDisplay = colo + cnName;
                    const coloStyle =['HKG', 'SJC', 'LAX', 'TPE'].includes(colo) ? 'background:#dcfce7; color:#166534;' : '';
                    return `<div class="ip-item" data-ip="${item.ip}"><div class="ip-info"><span class="colo-badge" style="${coloStyle}">${coloDisplay}</span><span class="ip-address">${item.ip}</span><span class="speed-result ${speedClass}">${item.latency}ms</span></div><button class="small-btn" onclick="copyIP('${item.ip}')">複製</button></div>`;
                }).join('') : '<p style="text-align:center; padding:30px; color:#94a3b8;">暫無數據，請點擊更新</p>'}
            </div>
        </div>
        `}
    </div>

    <!-- Modals -->
    <div class="modal" id="login-modal"><div class="modal-content"><h3>🔐 管理員登入</h3><input type="password" id="admin-pass" class="modal-input" placeholder="輸入密碼"><div style="text-align:right; margin-top: 10px;"><button class="button" onclick="loginModal()">登入</button></div></div></div>

    <script>
        const COLO_MAP = ${JSON.stringify(COLO_MAP)};
        let sessionId = '${sessionId || ''}';
        let isLoggedIn = ${isLoggedIn};
        let tokenConfig = ${tokenConfig ? JSON.stringify(tokenConfig) : 'null'};
        const MAX_TEST = ${BROWSER_TEST_MAX_IPS};
        const DISPLAY_COUNT = ${FAST_IP_COUNT};

        document.addEventListener('DOMContentLoaded', function() {
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    if (!isLoggedIn) {
                        e.preventDefault(); loginMain();
                    } else {
                        const loginModalEl = document.getElementById('login-modal');
                        if (loginModalEl && loginModalEl.style.display !== 'none') { e.preventDefault(); loginModal(); }
                    }
                }
            });

            if (!isLoggedIn) {
                const savedSession = localStorage.getItem('cf_session');
                if (savedSession) {
                    const url = new URL(window.location.href);
                    if (url.searchParams.get('session') !== savedSession) {
                        url.searchParams.set('session', savedSession);
                        window.location.href = url.toString();
                        return;
                    }
                }
                const savedPass = localStorage.getItem('cf_admin_pass');
                const passInput = document.getElementById('main-pass');
                const checkbox = document.getElementById('remember-pass-main');
                if (savedPass && passInput) {
                    passInput.value = savedPass;
                    if(checkbox) checkbox.checked = true;
                    passInput.focus();
                }
            } else {
                if(tokenConfig && tokenConfig.token) {
                    const tokenIn = document.getElementById('token-in');
                    if(tokenIn) tokenIn.value = tokenConfig.token;
                }
            }

            // === 網頁載入時還原重新整理前暫存的日誌 ===
            const savedLogs = sessionStorage.getItem('restore_logs');
            if (savedLogs) {
                const logBox = document.getElementById('log-box');
                if (logBox) {
                    logBox.innerHTML = savedLogs;
                    logBox.style.display = 'block';
                    logBox.scrollTop = logBox.scrollHeight;
                }
                sessionStorage.removeItem('restore_logs'); 
            }
        });

        function addLog(msg, type='normal') {
            const box = document.getElementById('log-box'); if(!box) return; box.style.display='block';
            box.innerHTML += \`<div class="log-line \${type==='error'?'log-error':type==='info'?'log-info':''}">[\${new Date().toLocaleTimeString()}] \${msg}</div>\`;
            box.scrollTop = box.scrollHeight;
        }
        function clearLog() { const box = document.getElementById('log-box'); if(box) box.innerHTML = ''; }

        async function api(path, method='GET', body=null) {
            const headers = { 'Content-Type': 'application/json' };
            if (sessionId) headers['Authorization'] = 'Bearer ' + sessionId;
            else if (tokenConfig) headers['Authorization'] = 'Token ' + tokenConfig.token;
            const opts = { method, headers };
            if (body) opts.body = JSON.stringify(body);
            let url = path + (method==='GET' && (sessionId||tokenConfig) ? (path.includes('?')?'&':'?') + (tokenConfig ? 'token='+tokenConfig.token : 'session='+sessionId) : '');
            return (await fetch(url, opts)).json();
        }

        async function loginMain() { 
            const pwd = document.getElementById('main-pass').value;
            const remember = document.getElementById('remember-pass-main').checked;
            performLogin(pwd, remember); 
        }
        
        async function loginModal() { 
            const pwd = document.getElementById('admin-pass').value;
            performLogin(pwd, false); 
        }

        async function performLogin(password, remember) {
            if(!password) return alert('請輸入密碼');
            const res = await api('/admin-login', 'POST', {password});
            if(res.success) {
                if(remember) {
                    localStorage.setItem('cf_session', res.sessionId);
                    localStorage.setItem('cf_admin_pass', password);
                } else {
                    localStorage.removeItem('cf_session');
                    localStorage.removeItem('cf_admin_pass');
                }
                const url = new URL(window.location.href); 
                url.searchParams.set('session', res.sessionId); 
                window.location.href = url.toString();
            } else alert(res.error);
        }
        
        async function logout() { 
            await api('/admin-logout', 'POST'); 
            localStorage.removeItem('cf_session');
            const url = new URL(window.location.href); 
            url.searchParams.delete('session'); 
            window.location.href = url.toString(); 
        }

        async function updateIPs() {
            const btn = document.getElementById('update-btn'); btn.disabled = true; btn.innerText = '更新中...';
            clearLog(); addLog('🚀 從 GitHub 抓取最新 IP 中...', 'info');
            try { 
                const res = await api('/update', 'POST'); 
                if(res.success) { 
                    addLog(\`✅ 更新成功！目前庫存: \${res.totalIPs} 個 IP (已套用網段隨機抽樣模式)\`); 
                    
                    // 重新整理前將日誌暫存至 sessionStorage
                    const logBox = document.getElementById('log-box');
                    if(logBox) sessionStorage.setItem('restore_logs', logBox.innerHTML);

                    // 迴圈讀取並逐條印出每個 CIDR 來源的提取數量
                    if (res.results && res.results.length) {
                        res.results.forEach(item => {
                            if (item.status === 'success') {
                                addLog(\`➡️ 來源: \${item.name} | 提取: \${item.count} 個\`, 'info');
                            } else {
                                addLog(\`❌ 來源: \${item.name} | 失敗: \${item.error}\`, 'error');
                            }
                        });
                    }

                    setTimeout(()=>location.reload(), 4000); 
                } else {
                    addLog('❌ 失敗: '+res.error, 'error'); 
                }
            } catch(e) { addLog('❌ '+e.message, 'error'); }
            btn.disabled = false; btn.innerText = '🔄 立即更新庫';
        }

        async function startSpeedTest() {
            const allIpElements = document.querySelectorAll('.ip-item');
            let allIps =[];
            try { const res = await api('/raw'); allIps = res.ips && res.ips.length ? res.ips :[]; } catch(e) {}
            if(!allIps.length) allIps = Array.from(allIpElements).map(el => el.dataset.ip);
            if(!allIps.length) return addLog('❌ 無 IP', 'error');

            clearLog(); addLog(\`🚀 測速開始 (\${allIps.length} IPs)\`, 'info');
            for (let i = allIps.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [allIps[i], allIps[j]] = [allIps[j], allIps[i]]; }
            const targets = allIps.slice(0, MAX_TEST);
            
            document.getElementById('progress').style.display = 'block';
            let count = 0, results =[];
            for(const ip of targets) {
                document.getElementById('status-text').innerText = \`測試 \${ip} (\${count+1}/\${targets.length})\`;
                try {
                    const start = performance.now();
                    const res = await fetch(\`/speedtest?ip=\${ip}\`);
                    const data = await res.json();
                    const lat = Math.round(performance.now() - start);
                    if(data.success) {
                        addLog(\`✅ [\${data.colo}] \${ip} - \${lat}ms\`, lat<200?'info':'normal');
                        results.push({ip, latency: lat, colo: data.colo || 'UNK'});
                    }
                } catch(e) {}
                count++;
                document.getElementById('progress-fill').style.width = (count/targets.length*100) + '%';
                await new Promise(r => setTimeout(r, 50));
            }
            if(results.length) {
                results.sort((a,b) => a.latency - b.latency);
                const topResults = results.slice(0, DISPLAY_COUNT);
                let newHtml = '';
                topResults.forEach(item => {
                    const colo = item.colo || 'UNK';
                    const cnName = COLO_MAP[colo] ? \` (\${COLO_MAP[colo]})\` : '';
                    const coloDisplay = colo + cnName;
                    const coloStyle =['HKG','SJC','LAX','TPE'].includes(item.colo) ? 'background:#dcfce7;color:#166534;' : '';
                    newHtml += \`<div class="ip-item" data-ip="\${item.ip}"><div class="ip-info"><span class="colo-badge" style="\${coloStyle}">\${coloDisplay}</span><span class="ip-address">\${item.ip}</span><span class="speed-result">\${item.latency}ms</span></div><button class="small-btn" onclick="copyIP('\${item.ip}')">複製</button></div>\`;
                });
                document.getElementById('ip-list').innerHTML = newHtml;
                try { await api('/upload-results', 'POST', { fastIPs: topResults }); addLog('✅ 結果已上傳'); } catch(e){}
            }
            document.getElementById('progress').style.display = 'none';
        }

        function downloadBrowserResults() {
            const items = document.querySelectorAll('.ip-item');
            if(!items.length) return alert('無數據');
            let txt = ''; items.forEach(i => txt += \`\${i.dataset.ip}#\${i.querySelector('.colo-badge').innerText}:\${i.querySelector('.speed-result').innerText}\\n\`);
            const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([txt], {type:'text/plain'})); a.download = 'speedtest.txt'; a.click();
        }

        function copyApiUrl(type) {
            const host = window.location.host;
            const parts = host.split('.');
            let subdomainHost = parts.length >= 3 ? (parts[0] = type, parts.join('.')) : type + '.' + host;
            let url = 'https://' + subdomainHost;
            navigator.clipboard.writeText(url).then(() => alert('已複製: ' + url));
        }
    </script>
</body>
</html>`;

    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
}
