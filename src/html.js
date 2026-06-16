// src/html.js
import { VERSION, FAST_IP_COUNT, AUTO_TEST_MAX_IPS, BROWSER_TEST_MAX_IPS, COLO_MAP, CIDR_SOURCE_URLS } from './config.js';
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

    // 已確認：此處最外層開頭為乾淨的單個反單引號，無任何反斜線 (\)
    const html = `<!DOCTYPE html>
<html lang="zh-TW">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cloudflare 優選 IP 測速平台 (${VERSION})</title>
    <style>
        /* 專業級 Zinc & Obsidian 黑曜石與鋅灰配色變數設定 */
        :root { 
            --primary: #4f46e5;         /* 靛藍專注色 */
            --primary-hover: #4338ca;
            --bg-main: #fcfcfd;         /* 極簡灰白 */
            --bg-card: #ffffff;         /* 邊界卡片 */
            --bg-inner: #f4f4f5;        /* 鋅灰 Zinc-100 */
            --border: #e4e4e7;          /* 細線邊框 Zinc-200 */
            --text-main: #09090b;       /* 深黑 Obsidian */
            --text-sub: #71717a;        /* 灰色 Zinc-500 */
            --radius: 12px;             /* 統一圓角弧度 */
        }
        
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif; line-height: 1.5; background: var(--bg-main); color: var(--text-main); padding: 24px; transition: background 0.3s, color 0.3s; -webkit-font-smoothing: antialiased; }
        .container { max-width: 1280px; margin: 0 auto; }
        
        /* 頂部標頭 - 極簡風格 */
        .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; padding-bottom: 24px; border-bottom: 1px solid var(--border); }
        .header-content h1 { font-size: 1.5rem; color: var(--text-main); font-weight: 800; letter-spacing: -0.03em; }
        .header-content p { font-size: 0.8rem; color: var(--text-sub); margin-top: 4px; font-weight: 600; letter-spacing: 0.05em; text-transform: uppercase; }
        .social-link { padding: 6px 14px; border: 1px solid var(--border); border-radius: 8px; text-decoration: none; color: var(--text-sub); background: var(--bg-card); font-size: 0.8rem; font-weight: 600; transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); }
        .social-link:hover { color: var(--primary); border-color: var(--primary); background: var(--bg-main); }

        /* 卡片容器 - 扁平輕陰影 */
        .card { background: var(--bg-card); border-radius: var(--radius); padding: 28px; margin-bottom: 24px; border: 1px solid var(--border); box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.01); }
        .card h2 { font-size: 1.05rem; color: var(--text-main); margin-bottom: 20px; display: flex; align-items: center; gap: 8px; font-weight: 700; letter-spacing: -0.02em; }
        
        /* 雙欄式黃金分割排版 (Split-Pane Grid) */
        .dashboard-grid { display: grid; grid-template-columns: 1.5fr 1fr; gap: 24px; align-items: start; }
        @media (max-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr; } }
        
        /* 數據看板 - 工整左對齊監控版面 */
        .stats { display: grid; grid-template-columns: repeat(3, 1fr); gap: 16px; margin-bottom: 24px; }
        .stat { background: var(--bg-card); padding: 16px 20px; border-radius: var(--radius); border: 1px solid var(--border); text-align: left; display: flex; flex-direction: column; justify-content: space-between; }
        .stat:hover { border-color: var(--text-sub); }
        .stat-label { font-size: 0.725rem; color: var(--text-sub); font-weight: 700; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 6px; }
        .stat-value { font-size: 1.6rem; font-weight: 800; color: var(--text-main); letter-spacing: -0.04em; font-family: monospace; }
        
        /* 按鈕群組與基礎按鈕樣式 */
        .button-group { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
        .button { padding: 8px 16px; border: 1px solid transparent; border-radius: 8px; font-weight: 600; cursor: pointer; transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1); background: var(--primary); color: white; display: inline-flex; align-items: center; gap: 6px; font-size: 0.85rem; text-decoration: none; height: 38px; }
        .button:hover { background: var(--primary-hover); transform: translateY(-1px); }
        .button:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
        
        /* 高級半透明色調按鈕 (Tinted / Ghost Buttons) */
        .button-success { background: rgba(16, 185, 129, 0.08); color: #059669; border: 1px solid rgba(16, 185, 129, 0.15); } 
        .button-success:hover { background: rgba(16, 185, 129, 0.12); border-color: #059669; }
        
        .button-secondary { background: var(--bg-card); color: var(--text-main); border: 1px solid var(--border); } 
        .button-secondary:hover { background: var(--bg-inner); border-color: var(--text-sub); }
        
        .button-purple { background: rgba(99, 102, 241, 0.08); color: #4f46e5; border: 1px solid rgba(99, 102, 241, 0.15); } 
        .button-purple:hover { background: rgba(99, 102, 241, 0.12); border-color: #4f46e5; }
        
        .button-slate { background: rgba(113, 113, 122, 0.08); color: #71717a; border: 1px solid rgba(113, 113, 122, 0.15); }
        .button-slate:hover { background: rgba(113, 113, 122, 0.12); border-color: #71717a; }

        /* 支援端口資訊標籤 */
        .port-box { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .port-tag { padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; border: 1px solid transparent; font-weight: 700; }
        .tag-http { background: #fef2f2; color: #991b1b; border-color: #fee2e2; } 
        .tag-https { background: #f0f9ff; color: #075985; border-color: #e0f2fe; }

        /* 表格化優選列表設計 */
        .ip-table-header { display: grid; grid-template-columns: 130px 1fr 70px 60px; padding: 10px 20px; font-size: 0.725rem; font-weight: 700; color: var(--text-sub); text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid var(--border); border-bottom: none; background: var(--bg-inner); border-top-left-radius: var(--radius); border-top-right-radius: var(--radius); }
        .ip-list { border: 1px solid var(--border); border-bottom-left-radius: var(--radius); border-bottom-right-radius: var(--radius); overflow: hidden; }
        .ip-item { display: grid; grid-template-columns: 130px 1fr 70px 60px; align-items: center; padding: 10px 20px; border-bottom: 1px solid var(--border); background: var(--bg-card); transition: background 0.15s ease; }
        .ip-item:hover { background: var(--bg-inner); }
        .ip-item:last-child { border-bottom: none; }
        
        /* 利用 display: contents 讓子節點完全融入 Grid 中對齊 */
        .ip-info { display: contents; }
        
        /* 移除限制，加入 width: 100% 自適應、自動隱藏溢出與優雅省略號 */
        .colo-badge { font-size: 0.725rem; padding: 3px 6px; border-radius: 6px; background: var(--bg-inner); color: var(--text-sub); font-weight: 700; text-align: center; white-space: nowrap; border: 1px solid var(--border); width: 100%; display: inline-block; overflow: hidden; text-overflow: ellipsis; letter-spacing: 0.02em; }
        .ip-address { font-family: monospace; font-weight: 700; font-size: 0.9rem; color: var(--text-main); }
        .speed-result { font-size: 0.75rem; padding: 3px 10px; border-radius: 6px; background: var(--bg-inner); max-width: 65px; text-align: center; font-weight: 700; border: 1px solid var(--border); color: var(--text-sub); }
        .speed-fast-bg { background: rgba(16, 185, 129, 0.08); color: #065f46; border-color: rgba(16, 185, 129, 0.15); } 
        
        .small-btn { padding: 4px 10px; border: 1px solid var(--border); border-radius: 6px; background: var(--bg-card); color: var(--text-main); font-size: 0.75rem; font-weight: 600; cursor: pointer; transition: .15s; }
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

        /* 終端視窗 */
        .terminal-window { margin-top: 24px; border-radius: var(--radius); border: 1px solid #27272a; overflow: hidden; background: #09090b; box-shadow: 0 4px 12px rgba(0,0,0,0.15); }
        .terminal-header { background: #18181b; padding: 10px 18px; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #27272a; }
        .terminal-dots { display: flex; gap: 6px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; display: inline-block; }
        .dot-red { background: #ef4444; }
        .dot-yellow { background: #f59e0b; }
        .dot-green { background: #10b981; }
        .terminal-title { color: #a1a1aa; font-size: 0.725rem; font-weight: 700; font-family: monospace; text-transform: uppercase; letter-spacing: 0.06em; }
        .terminal-clear { background: transparent; border: none; color: #52525b; font-size: 0.725rem; font-weight: 600; cursor: pointer; font-family: monospace; transition: color 0.15s; }
        .terminal-clear:hover { color: #fafafa; }
        .log-box { background: #09090b; color: #38bdf8; font-family: "Fira Code", "JetBrains Mono", monospace; font-size: 0.75rem; padding: 16px 20px; height: 180px; overflow-y: auto; border: none; }
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

        /* 手機與行動裝置深度適配 (Mobile Responsive) */
        @media (max-width: 768px) {
            body { padding: 16px 12px; }
            .header { flex-direction: column; align-items: flex-start; gap: 12px; padding-bottom: 16px; margin-bottom: 20px; }
            .header div:last-child { width: 100%; }
            .social-link { display: block; text-align: center; width: 100%; }
            .card { padding: 20px 16px; margin-bottom: 16px; }
            .stats { grid-template-columns: 1fr; gap: 12px; }
            .stat { padding: 16px; }
            .button-group { gap: 8px; }
            .button { width: 100%; justify-content: center; }
            .dropdown { width: 100%; display: block; }
            .dropdown-content { width: 100%; position: absolute; z-index: 10; }
            .ip-table-header { grid-template-columns: 115px 1fr 65px 50px; padding: 8px 12px; font-size: 0.7rem; }
            .ip-item { grid-template-columns: 115px 1fr 65px 50px; padding: 10px 12px; }
            .ip-address { font-size: 0.8rem; }
            .colo-badge { font-size: 0.65rem; padding: 2px 4px; }
            .speed-result { min-width: 55px; font-size: 0.675rem; padding: 2px 6px; }
            .small-btn { padding: 4px 8px; font-size: 0.7rem; }
            .log-box { padding: 12px; height: 160px; }
        }

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
            
            .tag-http { background: #450a0a; color: #fecdd3; border-color: #78350f; }
            .tag-https { background: #082f49; color: #bae6fd; border-color: #075985; }
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
        <!-- 雙欄式黃金比例工作台 (Golden Split Workspace) -->
        <div class="dashboard-grid">
            
            <!-- 左欄主區塊：主控面板、支援端口、與日誌終端 -->
            <div class="pane-main">
                <div class="card">
                    <h2>📊 控制中心</h2>
                    
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
                        
                        <!-- 整合後的：線上查看與數據匯出選單 -->
                        <div class="dropdown"><button class="button button-secondary">📄 線上查看 ▼</button>
                            <div class="dropdown-content">
                                <a href="/fast-ips.txt" target="_blank">🚀 查看後端優選 IP</a>
                                <a href="/browser-ips.txt" target="_blank">⚡ 查看本機測速結果</a>
                                <a href="/ip.txt" target="_blank">📦 查看完整 IP 庫</a>
                                <a onclick="downloadBrowserResults()">📥 匯出本機測速結果</a>
                            </div>
                        </div>
                        
                        <div class="dropdown"><button class="button button-purple">🔌 複製 API 連結 ▼</button>
                            <div class="dropdown-content">
                                <a onclick="copyApiUrl('fast')">🚀 複製後端優選 IP API</a>
                                <a onclick="copyApiUrl('browser')">⚡ 複製本機測速結果 API</a>
                                <a onclick="copyApiUrl('all')">📦 複製完整 IP 庫 API</a>
                            </div>
                        </div>
                        
                        <button class="button button-slate" onclick="openSourcesModal()">⚙️ 來源管理</button>
                    </div>
                    
                    <!-- 擬真開發者終端盒 (Developer Terminal Console Container) -->
                    <div class="terminal-window">
                        <div class="terminal-header">
                            <div class="terminal-dots">
                                <span class="dot dot-red"></span>
                                <span class="dot dot-yellow"></span>
                                <span class="dot dot-green"></span>
                            </div>
                            <span class="terminal-title">Runner Console</span>
                            <button class="terminal-clear" onclick="clearLog()">Clear</button>
                        </div>
                        <div id="log-box" class="log-box"></div>
                    </div>
                </div>

                <!-- 支援端口資訊 (已由右側移至左欄下方，使版面配置更均衡) -->
                <div class="card">
                    <h2>📡 支援端口資訊</h2>
                    <div style="margin-bottom: 16px;">
                        <div style="color:#be123c; font-size:0.775rem; font-weight:700; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.05em;">HTTP 支援端口</div>
                        <div class="port-box"><span class="port-tag tag-http">80</span><span class="port-tag tag-http">8080</span><span class="port-tag tag-http">8880</span><span class="port-tag tag-http">2052</span><span class="port-tag tag-http">2082</span><span class="port-tag tag-http">2086</span><span class="port-tag tag-http">2095</span></div>
                    </div>
                    <div>
                        <div style="color:#1d4ed8; font-size:0.775rem; font-weight:700; margin-bottom:6px; text-transform:uppercase; letter-spacing:0.05em;">HTTPS 支援端口</div>
                        <div class="port-box"><span class="port-tag tag-https">443</span><span class="port-tag tag-https">2053</span><span class="port-tag tag-https">2083</span><span class="port-tag tag-https">2087</span><span class="port-tag tag-https">2096</span><span class="port-tag tag-https">8443</span></div>
                    </div>
                </div>
            </div>
            
            <!-- 右欄側邊區塊：單獨承載數據表格，享有完整高度 -->
            <div class="pane-side">
                
                <!-- 優選 IP 表格化名單 -->
                <div class="card" style="padding-bottom: 12px;">
                    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                        <h2>🏆 優選 IP 列表</h2>
                        <button class="small-btn" onclick="copyAllFastIPs()">📋 複製所有</button>
                    </div>
                    
                    <div class="progress-bar" id="progress"><div class="progress-fill" id="progress-fill"></div></div>
                    <div id="status-text" style="text-align:center; font-size:0.8rem; color:var(--text-sub); margin-bottom:10px;"></div>
                    
                    <!-- 表頭 -->
                    <div class="ip-table-header">
                        <span>機房</span>
                        <span>IP 位址</span>
                        <span>延遲</span>
                        <span style="text-align:right;">操作</span>
                    </div>
                    <div class="ip-list" id="ip-list">
                        ${fastIPs.length > 0 ? fastIPs.map(item => {
                            const speedClass = item.latency < 200 ? 'speed-fast-bg' : '';
                            const colo = item.colo || 'UNK';
                            const cnName = COLO_MAP[colo] ? ` (${COLO_MAP[colo]})` : '';
                            const coloDisplay = colo + cnName;
                            const coloStyle =['HKG', 'SJC', 'LAX', 'TPE'].includes(colo) ? 'background:#dcfce7; color:#166534;' : '';
                            return `<div class="ip-item" data-ip="${item.ip}"><div class="ip-info"><span class="colo-badge" style="${coloStyle}">${coloDisplay}</span><span class="ip-address">${item.ip}</span><span class="speed-result ${speedClass}">${item.latency}ms</span></div><button class="small-btn" onclick="copyIP('${item.ip}')">複製</button></div>`;
                        }).join('') : '<p style="text-align:center; padding:30px; color:#a1a1aa;">暫無數據，請點擊更新</p>'}
                    </div>
                </div>
                
            </div>
            
        </div>
        `}
    </div>

    <!-- Modals -->
    <div class="modal" id="login-modal"><div class="modal-content"><h3>🔐 管理員登入</h3><input type="password" id="admin-pass" class="modal-input" placeholder="輸入密碼"><div style="text-align:right; margin-top: 10px;"><button class="button" onclick="loginModal()">登入</button></div></div></div>

    <!-- 自訂來源網址管理彈窗 -->
    <div class="modal" id="sources-modal">
        <div class="modal-content" style="max-width: 550px; width: 95%;">
            <h3>⚙️ IP 來源網址管理</h3>
            <p style="font-size:0.775rem; color:var(--text-sub); margin-bottom:12px;">請輸入您的訂閱網址 (每行輸入一個 URL，留空儲存將會還原為系統預設值)：</p>
            <textarea id="sources-textarea" class="modal-input" style="height: 250px; font-family: monospace; font-size: 0.8rem; resize: vertical; line-height: 1.4;" placeholder="https://example.com/ips.txt"></textarea>
            <div style="text-align:right; margin-top: 16px; display: flex; justify-content: space-between; align-items: center;">
                <button class="small-btn" onclick="resetSourcesToDefault()" style="height: 36px; padding: 0 12px; font-size: 0.8rem; border-color: var(--border);">🔄 載入系統預設</button>
                <div>
                    <button class="small-btn" onclick="document.getElementById('sources-modal').style.display='none'" style="height: 36px; padding: 0 12px; font-size: 0.8rem; border-color: var(--border); margin-right: 8px;">取消</button>
                    <button class="button" onclick="saveSources()" style="height: 36px; padding: 0 16px; font-size: 0.8rem;">儲存變更</button>
                </div>
            </div>
        </div>
    </div>

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
                    const logBox = document.getElementById('log-box');
                    
                    // 1. 動畫化：以 150ms 延遲逐條印出每個來源的提取狀態，富有動感
                    if (res.results && res.results.length) {
                        res.results.forEach((item, index) => {
                            setTimeout(() => {
                                if (item.status === 'success') {
                                    addLog(\`➡️ 來源: \${item.name} | 提取: \${item.count} 個\`, 'info');
                                } else {
                                    addLog(\`❌ 來源: \${item.name} | 失敗: \s\${item.error}\`, 'error');
                                }
                                // 每跑出一行，就更新一次暫存，確保重新整理後保留最完整的終端畫面
                                if(logBox) sessionStorage.setItem('restore_logs', logBox.innerHTML);
                            }, (index + 1) * 150);
                        });
                    }

                    // 2. 所有明細動畫播完（約 4.3 秒）後，在最底部印出大字「成功彙總訊息」
                    const summaryDelay = (res.results ? res.results.length * 150 : 0) + 200;
                    setTimeout(() => {
                        addLog(\`✅ 更新成功！目前庫存: \${res.totalIPs} 個 IP (已套用網段隨機抽樣模式)\`);
                        if(logBox) sessionStorage.setItem('restore_logs', logBox.innerHTML);
                    }, summaryDelay);

                    // 3. 成功彙總印出後，再留 2 秒緩衝時間，隨後自動重新整理網頁
                    const reloadDelay = summaryDelay + 2000;
                    setTimeout(() => {
                        location.reload();
                    }, reloadDelay); 
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
