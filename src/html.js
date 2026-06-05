// src/html.js
import { VERSION, FAST_IP_COUNT, AUTO_TEST_MAX_IPS, COLO_MAP } from './config.js';
import { verifyAdmin, getTokenConfig } from './auth.js';
import { getStoredIPs, getStoredSpeedIPs } from './ip.js';

function addAuthToUrl(url, sessionId, tokenConfig) {
    if (!sessionId && !tokenConfig) return url;
    const separator = url.includes('?') ? '&' : '?';
    if (tokenConfig && tokenConfig.token) return `${url}${separator}token=${encodeURIComponent(tokenConfig.token)}`;
    if (sessionId) return `${url}${separator}session=${encodeURIComponent(sessionId)}`;
    return url;
}

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

    // 已修正：最外層的反單引號 (`) 前方不加反斜線 (\)
    const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare 優選 IP 測速平台 (${VERSION})</title>
    <style>
        /* 基礎變數設定：採用現代質感 Indigo 與 Zinc 灰 */
        :root { 
            --primary: #4f46e5;         /* 莫蘭迪靛藍 */
            --primary-hover: #4338ca;
            --bg-main: #f8fafc;         /* 柔軟的淺灰藍背景 */
            --bg-card: #ffffff;         /* 純白卡片 */
            --bg-inner: #f1f5f9;        /* 輕柔的內部區塊背景 */
            --border: #e2e8f0;          /* 細緻的邊框線 */
            --text-main: #0f172a;       /* 深石瓦灰主字體 */
            --text-sub: #64748b;        /* 灰藍色副字體 */
            --radius: 12px;             /* 統一圓角弧度 */
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; background: var(--bg-main); color: var(--text-main); padding: 24px; transition: background 0.3s, color 0.3s; }
        .container { max-width: 1200px; margin: 0 auto; }
        
        /* 標頭設計 */
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 28px; padding-bottom: 20px; border-bottom: 1px solid var(--border); }
        .header h1 { font-size: 1.75rem; color: var(--text-main); font-weight: 800; letter-spacing: -0.025em; }
        .header p { font-size: 0.85rem; color: var(--text-sub); margin-top: 4px; font-weight: 500; }
        .social-link { padding: 6px 14px; border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text-sub); background: var(--bg-card); font-size: 0.85rem; font-weight: 600; transition: .2s; }
        .social-link:hover { color: var(--primary); border-color: var(--primary); background: var(--bg-main); }

        /* 卡片容器 */
        .card { background: var(--bg-card); border-radius: var(--radius); padding: 28px; margin-bottom: 24px; border: 1px solid var(--border); box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.05), 0 1px 2px -1px rgba(0, 0, 0, 0.05); }
        .card h2 { font-size: 1.15rem; color: var(--text-main); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; font-weight: 700; }
        
        /* 數據統計區塊 */
        .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 24px; }
        .stat { background: var(--bg-inner); padding: 18px; border-radius: var(--radius); text-align: center; border: 1px solid var(--border); transition: transform 0.2s; }
        .stat:hover { transform: translateY(-2px); }
        .stat-value { font-size: 2rem; font-weight: 800; color: var(--primary); letter-spacing: -0.05em; }
        .stat div:last-child { font-size: 0.85rem; color: var(--text-sub); font-weight: 600; margin-top: 4px; }
        
        /* 按鈕群組與基礎按鈕樣式 */
        .button-group { display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 20px; }
        .button { padding: 10px 18px; border: none; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.2s; background: var(--primary); color: white; display: inline-flex; align-items: center; gap: 6px; font-size: 0.9rem; text-decoration: none; height: 40px; box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05); }
        .button:hover { background: var(--primary-hover); transform: translateY(-1px); }
        .button:disabled { opacity: 0.6; cursor: not-allowed; transform: none; }
        
        /* 讓原本混雜的按鈕色彩變得更溫和、具一致性 */
        .button-success { background: #10b981; } .button-success:hover { background: #059669; }
        .button-secondary { background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border); } .button-secondary:hover { background: var(--bg-inner); }
        .button-purple { background: #6366f1; } .button-purple:hover { background: #4f46e5; }
        .button-warning { background: #f59e0b; } .button-warning:hover { background: #d97706; }
        .button-pink { background: #ec4899; } .button-pink:hover { background: #db2777; }
        .button-slate { background: #64748b; } .button-slate:hover { background: #475569; }

        /* 端口標籤樣式 */
        .port-box { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .port-tag { padding: 5px 12px; border-radius: 6px; font-family: monospace; font-size: 0.9rem; border: 1px solid transparent; font-weight: 700; }
        .tag-http { background: #fef2f2; color: #991b1b; border-color: #fee2e2; } 
        .tag-https { background: #f0f9ff; color: #075985; border-color: #e0f2fe; }

        /* 列表樣式 */
        .ip-list { max-height: 480px; overflow-y: auto; border: 1px solid var(--border); border-radius: var(--radius); }
        .ip-item { display: flex; justify-content: space-between; align-items: center; padding: 12px 20px; border-bottom: 1px solid var(--border); background: var(--bg-card); transition: background 0.2s; }
        .ip-item:hover { background: var(--bg-main); }
        .ip-item:last-child { border-bottom: none; }
        .ip-info { display: flex; align-items: center; gap: 14px; }
        .ip-address { font-family: monospace; font-weight: 700; font-size: 1rem; min-width: 145px; color: var(--text-main); }
        
        .colo-badge { font-size: 0.75rem; padding: 4px 10px; border-radius: 6px; background: #e0e7ff; color: #3730a3; font-weight: 700; text-align: center; white-space: nowrap; border: 1px solid #c7d2fe; }
        .speed-result { font-size: 0.8rem; padding: 4px 12px; border-radius: 6px; background: var(--bg-inner); min-width: 75px; text-align: center; font-weight: 700; border: 1px solid var(--border); color: var(--text-sub); }
        .speed-fast-bg { background: #ecfdf5; color: #065f46; border-color: #a7f3d0; } 
        
        .small-btn { padding: 5px 12px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-card); color: var(--text-main); font-size: 0.8rem; font-weight: 600; cursor: pointer; transition: .2s; }
        .small-btn:hover { background: var(--bg-inner); border-color: var(--text-sub); }

        /* 下拉選單 */
        .dropdown { position: relative; display: inline-block; }
        .dropdown-content { 
            display: none; 
            position: absolute; 
            background-color: var(--bg-card); 
            min-width: 230px; 
            box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); 
            z-index: 10; 
            border-radius: var(--radius); 
            border: 1px solid var(--border); 
            top: calc(100% + 4px); 
            left: 0; 
            /* 移除原本的 overflow: hidden; */
        }
        /* 解決滑鼠慢速移動時，因空隙導致下拉選單消失的問題 */
        .dropdown-content::before {
            content: '';
            position: absolute;
            top: -14px;            /* 向上延伸，完美覆蓋空隙與部分按鈕 */
            left: 0;
            right: 0;
            height: 14px;          /* 隱形高度 */
            background: transparent; 
        }
        .dropdown:hover .dropdown-content { display: block; }
        .dropdown-content a { color: var(--text-main); padding: 12px 18px; text-decoration: none; display: block; font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s; }
        .dropdown-content a:hover { background: var(--bg-inner); color: var(--primary); }
        /* 讓第一個與最後一個選項自己貼合外框圓角，視覺效果與原本完全相同 */
        .dropdown-content a:first-child { 
            border-top-left-radius: var(--radius); 
            border-top-right-radius: var(--radius); 
        }
        .dropdown-content a:last-child { 
            border-bottom-left-radius: var(--radius); 
            border-bottom-right-radius: var(--radius); 
            border-bottom: none; /* 最後一項不需要底線，美化細節 */
        }

        /* 終端日誌盒 */
        .log-box { background: #0f172a; color: #38bdf8; font-family: monospace; font-size: 0.8rem; padding: 18px; border-radius: var(--radius); margin-top: 24px; height: 180px; overflow-y: auto; border: 1px solid #1e293b; box-shadow: inset 0 2px 4px 0 rgba(0,0,0,0.06); }
        .log-line { margin-bottom: 4px; line-height: 1.4; }
        .log-error { color: #f87171; }
        .log-info { color: #34d399; }

        /* 彈窗設計 */
        .modal { display: none; position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(15, 23, 42, 0.4); backdrop-filter: blur(4px); z-index: 1000; justify-content: center; align-items: center; }
        .modal-content { background: var(--bg-card); color: var(--text-main); padding: 28px; border-radius: var(--radius); width: 90%; max-width: 440px; border: 1px solid var(--border); box-shadow: 0 20px 25px -5px rgba(0,0,0,0.1), 0 10px 10px -5px rgba(0,0,0,0.04); }
        .modal h3 { font-size: 1.25rem; margin-bottom: 12px; font-weight: 800; }
        
        .lock-input, .modal-input { width: 100%; padding: 10px 14px; margin: 12px 0; border: 1px solid var(--border); border-radius: 8px; font-size: 0.95rem; outline: none; background: var(--bg-card); color: var(--text-main); transition: .2s; }
        .lock-input:focus, .modal-input:focus { border-color: var(--primary); box-shadow: 0 0 0 3px rgba(79, 70, 229, 0.15); }
        
        /* 鎖定畫面與管理員徽章 */
        .admin-indicator { position: fixed; top: 24px; right: 24px; z-index: 900; }
        .admin-badge { background: #10b981; color: white; padding: 8px 16px; border-radius: 9999px; font-size: 0.85rem; font-weight: 700; cursor: pointer; display: flex; align-items: center; gap: 6px; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2); transition: .2s; }
        .admin-badge:hover { transform: scale(1.02); }
        .admin-badge.logged-out { background: #ef4444; box-shadow: 0 4px 12px rgba(239, 68, 68, 0.2); }
        .progress-bar { height: 6px; background: var(--border); border-radius: 9999px; overflow: hidden; margin: 12px 0; display: none; }
        .progress-fill { height: 100%; background: var(--primary); width: 0%; transition: width 0.3s; }

        /* 自然、柔和的深色模式 (Prefers Dark Mode) */
        @media (prefers-color-scheme: dark) {
            :root {
                --primary: #818cf8;             /* 輕盈的亮靛藍 */
                --primary-hover: #6366f1;
                --bg-main: #0b0f19;             /* 精緻的暗夜藍黑 */
                --bg-card: #151d30;             /* 深邃藍灰卡片 */
                --bg-inner: #1e293b;            /* 稍微明亮的暗色內區塊 */
                --border: #27354f;              /* 柔和的暗邊框 */
                --text-main: #f8fafc;           /* 高易讀白字 */
                --text-sub: #94a3b8;            /* 灰藍色副字 */
            }
            body { background: var(--bg-main); }
            .social-link { background: var(--bg-card); border-color: var(--border); color: var(--text-sub); }
            .social-link:hover { color: var(--primary); border-color: var(--primary); background: var(--bg-inner); }
            .button-secondary { background: var(--bg-card); color: var(--text-main); border-color: var(--border); }
            .button-secondary:hover { background: var(--bg-inner); }
            
            .colo-badge { background: #1e1b4b; color: #c7d2fe; border-color: #312e81; }
            .speed-fast-bg { background: #064e3b; color: #a7f3d0; border-color: #065f46; }
            
            .tag-http { background: #451a03; color: #fcd34d; border-color: #78350f; }
            .tag-https { background: #0c4a6e; color: #bae6fd; border-color: #075985; }
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
                <div class="stat"><div class="stat-value">${data.count || 0}</div><div>IP 總數</div></div>
                <div class="stat"><div class="stat-value">${data.lastUpdated ? new Date(data.lastUpdated).toLocaleTimeString() : '從未'}</div><div>更新時間</div></div>
                <div class="stat"><div class="stat-value">${fastIPs.length}</div><div>優質 IP</div></div>
            </div>
            <div class="button-group">
                <button class="button" onclick="updateIPs()" id="update-btn">🔄 立即更新庫</button>
                <button class="button button-warning" onclick="startSpeedTest()" id="speedtest-btn">⚡ 瀏覽器測速</button>
                
                <div class="dropdown"><button class="button button-success">🚀 下載中心 ▼</button>
                    <div class="dropdown-content">
                        <a href="${addAuthToUrl('/fast-ips.txt', sessionId, tokenConfig)}" download="cloudflare_fast_ips.txt">🚀 下載後端優選 IP</a>
                        <a onclick="downloadBrowserResults()">⚡ 下載本機測速結果</a>
                        <a href="${addAuthToUrl('/ips', sessionId, tokenConfig)}" download="all_ips.txt">📦 下載完整 IP 庫</a>
                    </div>
                </div>
                <div class="dropdown"><button class="button button-secondary">📄 線上查看 ▼</button>
                    <div class="dropdown-content">
                        <a href="${addAuthToUrl('/fast-ips.txt', sessionId, tokenConfig)}" target="_blank">🚀 查看後端優選 IP</a>
                        <a href="${addAuthToUrl('/browser-ips.txt', sessionId, tokenConfig)}" target="_blank">⚡ 查看本機測速結果</a>
                        <a href="${addAuthToUrl('/ip.txt', sessionId, tokenConfig)}" target="_blank">📦 查看完整 IP 庫</a>
                    </div>
                </div>
                <div class="dropdown"><button class="button button-purple">🔌 複製 API 連結 ▼</button>
                    <div class="dropdown-content">
                        <a onclick="copyApiUrl('fast')">🚀 複製後端優選 IP API</a>
                        <a onclick="copyApiUrl('browser')">⚡ 複製本機測速結果 API</a>
                        <a onclick="copyApiUrl('all')">📦 複製完整 IP 庫 API</a>
                    </div>
                </div>
                <button class="button button-pink" onclick="openItdogModal()">🌐 ITDog 測速</button>
                <button class="button button-slate" onclick="openTokenModal()">🔑 Token 管理</button>
            </div>
            <div id="log-box" class="log-box"></div>
            ${tokenConfig ? `<div style="margin-top: 15px; padding: 10px; background: var(--bg-inner); border-radius: 8px; font-size: 0.85rem; border: 1px solid var(--border);"><strong>當前 Token:</strong> <span style="font-family:monospace; background:var(--bg-card); padding:2px 6px; border-radius:4px;">${tokenConfig.token}</span></div>` : ''}
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
    <div class="modal" id="itdog-modal"><div class="modal-content"><h3>🌐 ITDog 測速</h3><p style="margin-bottom:15px;">複製 IP 至 ITDog 測試。</p><div style="text-align:right;"><button class="button button-secondary" onclick="document.getElementById('itdog-modal').style.display='none'">關閉</button><button class="button" onclick="copyIPsForItdog()">📋 複製前往</button></div></div></div>
    <div class="modal" id="login-modal"><div class="modal-content"><h3>🔐 管理員登入</h3><input type="password" id="admin-pass" class="modal-input" placeholder="輸入密碼"><div style="text-align:right; margin-top: 10px;"><button class="button" onclick="loginModal()">登入</button></div></div></div>
    <div class="modal" id="token-modal">
        <div class="modal-content">
            <h3>⚙️ Token 設定</h3>
            <!-- 並排輸入框與隨機按鈕 -->
            <div style="display: flex; gap: 8px; align-items: center; margin: 12px 0;">
                <input type="text" id="token-in" class="modal-input" style="margin: 0; flex: 1;" placeholder="輸入新 Token (留空自動生成)">
                <button class="small-btn" style="height: 40px; padding: 0 12px; font-size: 0.85rem; border-radius: 8px; font-weight: 700; background: var(--bg-inner);" onclick="generateRandomTokenInModal()">🎲 隨機</button>
            </div>
            <div style="margin-bottom:15px; font-size: 0.9rem; color: var(--text-sub); display: flex; align-items: center; gap: 10px;">
                <label style="cursor:pointer;"><input type="checkbox" id="never-expire" style="margin-right:4px;"> 永不過期</label>
                <div>或 <input type="number" id="expire-days" value="30" style="width:60px; padding:4px; border:1px solid var(--border); border-radius:4px; background:var(--bg-card); color:var(--text-main);"> 天後過期</div>
            </div>
            <div style="text-align:right;">
                <button class="button button-secondary" onclick="document.getElementById('token-modal').style.display='none'">取消</button>
                <button class="button" onclick="saveToken()">儲存</button>
            </div>
        </div>
    </div>

    <script>
        const COLO_MAP = ${JSON.stringify(COLO_MAP)};
        let sessionId = '${sessionId || ''}';
        let isLoggedIn = ${isLoggedIn};
        let tokenConfig = ${tokenConfig ? JSON.stringify(tokenConfig) : 'null'};
        const MAX_TEST = ${AUTO_TEST_MAX_IPS};
        const DISPLAY_COUNT = ${FAST_IP_COUNT};

        document.addEventListener('DOMContentLoaded', function() {
            document.addEventListener('keydown', function(e) {
                if (e.key === 'Enter') {
                    if (!isLoggedIn) {
                        e.preventDefault(); loginMain();
                    } else {
                        const loginModalEl = document.getElementById('login-modal');
                        if (loginModalEl && loginModalEl.style.display !== 'none') { e.preventDefault(); loginModal(); }
                        const tokenModalEl = document.getElementById('token-modal');
                        if (tokenModalEl && tokenModalEl.style.display !== 'none') { e.preventDefault(); saveToken(); }
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

                    setTimeout(()=>location.reload(), 1500); 
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
            const host = window.location.host; const parts = host.split('.');
            let url = parts.length >= 3 ? (parts[0]=type, parts.join('.')) : type+'.'+host;
            navigator.clipboard.writeText(url).then(()=>alert('已複製: '+url));
        }

        function openTokenModal() { document.getElementById('token-modal').style.display='flex'; }
        async function saveToken() {
            const tokenEl = document.getElementById('token-in');
            const neverExpireEl = document.getElementById('never-expire');
            const expireDaysEl = document.getElementById('expire-days');
            
            if(!tokenEl || !neverExpireEl || !expireDaysEl) return alert('系統錯誤：找不到輸入框');
            
            const token = tokenEl.value;
            const neverExpire = neverExpireEl.checked;
            const expiresDays = parseInt(expireDaysEl.value) || 30;
            
            const res = await api('/admin-token', 'POST', {token, neverExpire, expiresDays});
            if(res.success) {
                alert('Token 保存成功');
                location.reload();
            } else {
                alert('失敗: ' + res.error);
            }
        }
        
        function copyIP(ip) { navigator.clipboard.writeText(ip); alert('已複製'); }
        function copyAllFastIPs() { 
            const ips = Array.from(document.querySelectorAll('.ip-address')).map(el => el.innerText).join('\\n');
            navigator.clipboard.writeText(ips); alert('已複製');
        }
        function openItdogModal() { document.getElementById('itdog-modal').style.display='flex'; }
        function copyIPsForItdog() {
            const ips = Array.from(document.querySelectorAll('.ip-address')).map(el => el.innerText).join('\\n');
            if(ips) { navigator.clipboard.writeText(ips); window.open('https://www.itdog.cn/batch_tcping/', '_blank'); }
        }

        // 前端點選「隨機」按鈕時，自動生成隨機 Token 填入
        function generateRandomTokenInModal() {
            const tokenIn = document.getElementById('token-in');
            if(!tokenIn) return;
            let r = ''; 
            const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; 
            for(let i=0; i<32; i++) r += c.charAt(Math.floor(Math.random()*c.length)); 
            tokenIn.value = r;
        }
    </script>
</body>
</html>`;
