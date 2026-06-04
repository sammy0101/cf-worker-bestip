const VERSION = "V3.5.1"; // 系統版本號，修改此處即可同步更新網頁顯示

// --- 設定區域 ---
const FAST_IP_COUNT = 25; // 優質 IP 數量
const AUTO_TEST_MAX_IPS = 200; // 定時任務測速最大數量 (建議保持在 45 以下以契合免費版單次 50 次子請求限制)
const SAFE_SUBREQUEST_LIMIT = 200; // 子請求安全硬上限，防止免費方案部署時發生異常

// IP 來源網址列表 (亞洲優化庫)
const CIDR_SOURCE_URLS =[
    'https://bestcf.pages.dev/uouin/all.txt',
    'https://bestcf.pages.dev/wetest/ipv4.txt',
    'https://bestcf.pages.dev/moistr/all.txt',
    'https://bestcf.pages.dev/gslege/Cfxyz.txt',
    'https://bestcf.pages.dev/gslege/SG.txt',
    'https://bestcf.pages.dev/gslege/US.txt',
    'https://bestcf.pages.dev/gslege/JP.txt',
    'https://bestcf.pages.dev/cfyes/ipv4.txt',
    'https://bestcf.pages.dev/tiancheng2/all.txt',
    'https://bestcf.pages.dev/tiancheng2/sg.txt',
    'https://bestcf.pages.dev/tiancheng2/us.txt',
    'https://cf.junzhen.qzz.io/best_ips_bj.txt',
    'https://raw.githubusercontent.com/love-ztm/cfip/refs/heads/main/best_ips.txt',
    'https://bestcf.pages.dev/nirevil/ipv4.txt',
    'https://raw.githubusercontent.com/ymyuuu/IPDB/refs/heads/main/BestCF/bestcfv4.txt',
    'https://bestcf.pages.dev/zhixuanwang/ipv4-onlyip.txt',
    'https://raw.githubusercontent.com/joname1/BestCFip/refs/heads/main/ipv4.txt',
    'https://raw.githubusercontent.com/Senflare/Senflare-IP/refs/heads/main/IPlist-Pro.txt',
    'https://bestcf.pages.dev/vvhan/ipv4.txt',
    'https://bestcf.pages.dev/ircf/ipv4.txt',
    'https://raw.githubusercontent.com/gshtwy/CF-DNS-Clone/refs/heads/main/wetest-cloudflare-v4.txt',
    'https://bestcf.pages.dev/tiancheng/all.txt',
    'https://bestcf.pages.dev/tiancheng/sg.txt',
    'https://bestcf.pages.dev/tiancheng/jp.txt',
    'https://bestcf.pages.dev/tiancheng/tw.txt',
    'https://bestcf.pages.dev/tiancheng/kr.txt',
    'https://bestcf.pages.dev/tiancheng/us.txt',
    'https://090227.pages.dev/bestcf?isp=all&ips=20',
    'https://090227.pages.dev/bestcf?isp=ct&ips=50',
];

// 全球機房代碼對照表
const COLO_MAP = {
    'HKG': '香港', 'TPE': '台北', 'NRT': '東京', 'KIX': '大阪', 'ICN': '首爾', 'FUK': '福岡', 'OKA': '沖繩', 'CTS': '札幌', 'KHH': '高雄',
    'SIN': '新加坡', 'KUL': '吉隆坡', 'BKK': '曼谷', 'MNL': '馬尼拉', 'SGN': '胡志明市', 'HAN': '河內', 'CGK': '雅加達', 'KNO': '棉蘭', 'DPS': '峇里島', 'PNH': '金邊', 'RGN': '仰光', 'VTE': '永珍',
    'LAX': '洛杉磯', 'SJC': '聖荷西', 'SFO': '舊金山', 'SEA': '西雅圖', 'PDX': '波特蘭', 'YVR': '溫哥宇', 'SAN': '聖地牙哥', 'PHX': '鳳凰城', 'LAS': '拉斯維加斯', 'SMF': '沙加緬度', 'SLC': '鹽湖城',
    'JFK': '紐約', 'EWR': '紐華克', 'ORD': '芝加哥', 'IAD': '華盛頓', 'MIA': '邁阿密', 'DFW': '達拉斯', 'IAH': '休士頓', 'ATL': '亞特蘭大', 'YYZ': '多倫多', 'YUL': '蒙特婁', 'DEN': '丹佛', 'BOS': '波士頓', 'PHL': '費城', 'DTW': '底特律', 'MSP': '明尼阿波利斯',
    'LHR': '倫敦', 'AMS': '阿姆斯特丹', 'FRA': '法蘭克福', 'CDG': '巴黎', 'MAD': '馬德里', 'ZRH': '蘇黎世', 'MXP': '米蘭', 'VIE': '維也納', 'ARN': '斯德哥爾摩', 'OSL': '奧斯陸', 'CPH': '哥本哈根', 'HEL': '赫爾辛基', 'WAW': '華沙', 'PRG': '布拉格', 'BUD': '布達佩斯', 'OTP': '布加勒斯特', 'ATH': '雅典', 'IST': '伊斯坦堡', 'DUB': '都裂林', 'BRU': '布魯塞爾', 'MUC': '慕尼黑', 'TXL': '柏林', 'LIS': '里斯本', 'FCO': '羅馬', 'BCN': '巴塞隆納',
    'SYD': '雪梨', 'MEL': '墨爾本', 'BNE': '布里斯本', 'PER': '伯斯', 'AKL': '奧克蘭', 'ADL': '阿得雷德', 'CBR': '坎培拉',
    'SCL': '聖地亞哥', 'GRU': '聖保羅', 'EZE': '布宜諾斯艾利斯', 'BOG': '波哥大', 'LIM': '利馬', 'GIG': '里約熱內盧', 'QRO': '克雷塔羅',
    'DXB': '杜拜', 'TLV': '特拉維夫', 'DOH': '杜哈', 'JNB': '約翰尼斯堡', 'CPT': '開普敦', 'BOM': '孟買', 'DEL': '德里', 'MAA': '清奈', 'HYD': '海得拉巴', 'KWI': '科威特', 'RUH': '利雅德', 'MCT': '馬斯喀特'
};

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

  function addAuthToUrl(url, sessionId, tokenConfig) {
    if (!sessionId && !tokenConfig) return url;
    const separator = url.includes('?') ? '&' : '?';
    if (tokenConfig && tokenConfig.token) return `${url}${separator}token=${encodeURIComponent(tokenConfig.token)}`;
    if (sessionId) return `${url}${separator}session=${encodeURIComponent(sessionId)}`;
    return url;
  }

  // --- HTML 生成 ---
  async function serveHTML(env, request) {
    const isLoggedIn = await verifyAdmin(request, env);
    const hasAdminPassword = !!env.ADMIN_PASSWORD;
    const tokenConfig = await getTokenConfig(env);
    
    let data = { count: 0, lastUpdated: null };
    let fastIPs =[];
    if (isLoggedIn) {
        data = await getStoredIPs(env);
        const speedData = await getStoredSpeedIPs(env);
        fastIPs = speedData.fastIPs ||[];
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
        .dropdown-content { display: none; position: absolute; background-color: var(--bg-card); min-width: 230px; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1); z-index: 10; border-radius: var(--radius); border: 1px solid var(--border); top: calc(100% + 4px); left: 0; overflow: hidden; }
        .dropdown:hover .dropdown-content { display: block; }
        .dropdown-content a { color: var(--text-main); padding: 12px 18px; text-decoration: none; display: block; font-size: 0.85rem; font-weight: 600; border-bottom: 1px solid var(--border); cursor: pointer; transition: background 0.2s; }
        .dropdown-content a:hover { background: var(--bg-inner); color: var(--primary); }
        .dropdown-content a:last-child { border-bottom: none; }

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
            <input type="text" id="token-in" class="modal-input" placeholder="輸入新 Token (留空自動生成)">
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

            // === 新增：網頁載入時還原重新整理前暫存的日誌 ===
            const savedLogs = sessionStorage.getItem('restore_logs');
            if (savedLogs) {
                const logBox = document.getElementById('log-box');
                if (logBox) {
                    logBox.innerHTML = savedLogs;
                    logBox.style.display = 'block';
                    logBox.scrollTop = logBox.scrollHeight;
                }
                sessionStorage.removeItem('restore_logs'); // 還原後立即清除，避免手動重新整理網頁時重複跑出來
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
                    
                    // 重新整理前，將當前日誌內容暫存至 sessionStorage
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
    </script>
</body>
</html>`;
    
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } });
  }

  // ---------------- API 處理區 ----------------

  async function handleUpdate(env, request) {
    if (!await verifyAdmin(request, env)) return jsonResponse({ error: '需要權限' }, 401);
    const start = Date.now();
    const { uniqueIPs, results } = await updateAllIPs(env);
    await env.IP_STORAGE.put('cloudflare_ips', JSON.stringify({
      ips: uniqueIPs, lastUpdated: new Date().toISOString(), count: uniqueIPs.length, sources: results
    }));
    return jsonResponse({ success: true, duration: (Date.now()-start)+'ms', totalIPs: uniqueIPs.length });
  }

  async function handleUploadResults(env, request) {
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

  async function handleUserIP(request) {
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

  async function handleGetFastIPsText(env, request) {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    const data = await getStoredSpeedIPs(env);
    const list = data.fastIPs ||[];
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

  async function handleGetBrowserIPsText(env, request) {
    const url = new URL(request.url);
    const format = url.searchParams.get('format');
    const data = await getStoredBrowserIPs(env);
    const list = data.fastIPs ||[];
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

  async function handleGetFastIPs(env, request) { return jsonResponse(await getStoredSpeedIPs(env)); }
  async function handleGetIPs(env, request) { const d = await getStoredIPs(env); return new Response(d.ips.join('\n'), { headers: {'Content-Type': 'text/plain'} }); }
  async function handleRawIPs(env, request) { return jsonResponse(await getStoredIPs(env)); }
  async function handleItdogData(env, request) { const d = await getStoredSpeedIPs(env); return jsonResponse({ ips: (d.fastIPs||[]).map(i => i.ip) }); }

  async function autoSpeedTestAndStore(env, ips, limit = AUTO_TEST_MAX_IPS) {
    if (!ips || !ips.length) return null;
    let randomIPs = [...ips];
    for (let i = randomIPs.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [randomIPs[i], randomIPs[j]] = [randomIPs[j], randomIPs[i]]; }
    
    // 子請求超限保護：確保不會超過 Cloudflare 免費方案的 50 次限制
    const safeLimit = Math.min(limit, SAFE_SUBREQUEST_LIMIT);
    const targets = randomIPs.slice(0, safeLimit);
    const results =[];
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

  async function handleSpeedTest(request, env) {
    const url = new URL(request.url);
    const ip = url.searchParams.get('ip');
    if (!ip) return jsonResponse({ error: 'IP required' }, 400);
    try {
      const testUrl = `https://speed.cloudflare.com/__down?bytes=1000`;
      const response = await fetch(testUrl, { 
        headers: { 'Host': 'speed.cloudflare.com' }, 
        cf: { resolveOverride: ip }, 
        signal: AbortSignal.timeout(2500) // 使用現代化超時
      });
      if (!response.ok) throw new Error(response.statusText);
      await response.text(); 
      const ray = response.headers.get('cf-ray');
      return jsonResponse({ success: true, ip, colo: ray ? ray.split('-').pop() : null, time: new Date() });
    } catch (error) { return jsonResponse({ success: false, ip, error: error.message }, 200); }
  }

  async function testIPSpeed(ip) {
    try {
      const start = Date.now();
      const res = await fetch(`https://speed.cloudflare.com/__down?bytes=1000`, { 
          headers: { 'Host': 'speed.cloudflare.com' }, 
          cf: { resolveOverride: ip }, 
          signal: AbortSignal.timeout(2500) // 使用現代化超時
      });
      if (!res.ok) throw new Error('HTTP Error: ' + res.status);
      await res.text();
      const ray = res.headers.get('cf-ray');
      return { success: true, ip, latency: Date.now() - start, colo: ray ? ray.split('-').pop() : null };
    } catch (e) { return { success: false, ip, error: e.message }; }
  }

  // 隨機抽樣 IP 擴展，取代傳統的順序展開，避免 IP 集聚在網段頭部
  function expandCIDR(cidr, maxSample = 10) { 
      try { 
          const [ip, m] = cidr.split('/'); 
          const mask = parseInt(m); 
          if(isNaN(mask)||mask>32) return [ip]; 
          if(mask===32) return [ip]; 
          const start = ipToNum(ip); 
          const total = Math.pow(2, 32-mask); 
          const res = new Set(); 
          
          // 決定採樣大小 (若子網段總數小於單次隨機採樣最大值，則全取)
          const sampleSize = total > maxSample ? maxSample : total; 
          
          if(total <= maxSample) {
              for(let i=0; i<total; i++) {
                  res.add(numToIp(start + i));
              }
          } else {
              // 隨機採樣演算法
              while (res.size < sampleSize) {
                  const randomOffset = Math.floor(Math.random() * total);
                  res.add(numToIp(start + randomOffset));
              }
          }
          return Array.from(res); 
      } catch { return[]; } 
  }

  async function updateAllIPs(env) {
    const urls = CIDR_SOURCE_URLS;
    const uniqueIPs = new Set();
    const results =[];
    const cidrRegex = /\b(?:[0-9]{1,3}\.){3}[0-9]{1,3}(?:\/(?:[0-9]{1,2}))?\b/gi;
    for (const url of urls) {
        try {
            const txt = await fetchURLWithTimeout(url);
            const matches = txt.match(cidrRegex) ||[];
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

  async function handleAdminLogin(request, env) {
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

  async function handleAdminToken(request, env) {
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

  async function handleAdminStatus(env) { return jsonResponse({ hasAdminPassword: !!env.ADMIN_PASSWORD, hasToken: !!await getTokenConfig(env), tokenConfig: await getTokenConfig(env) }); }
  async function handleAdminLogout(env) { return jsonResponse({ success: true }); }
  async function getTokenConfig(env) { try { return JSON.parse(await env.IP_STORAGE.get('token_config')); } catch { return null; } }
  function generateToken() { let r = ''; const c = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'; for(let i=0; i<32; i++) r += c.charAt(Math.floor(Math.random()*c.length)); return r; }
  async function verifyAdmin(request, env) {
    if (!env.ADMIN_PASSWORD) return true;
    try {
      const authHeader = request.headers.get('Authorization');
      if (authHeader && authHeader.startsWith('Bearer ')) { if (await env.IP_STORAGE.get(`session_${authHeader.slice(7)}`)) return true; }
      const url = new URL(request.url);
      if (url.searchParams.get('session') && await env.IP_STORAGE.get(`session_${url.searchParams.get('session')}`)) return true;
      const tc = await getTokenConfig(env);
      if (tc) {
        if (!tc.neverExpire && new Date(tc.expires) < new Date()) return false;
        const t = url.searchParams.get('token') || (authHeader && authHeader.startsWith('Token ') ? authHeader.slice(6) : null);
        if (t === tc.token) { tc.lastUsed = new Date().toISOString(); await env.IP_STORAGE.put('token_config', JSON.stringify(tc)); return true; }
      }
      return false;
    } catch { return false; }
  }

  async function getStoredIPs(env) { try { return JSON.parse(await env.IP_STORAGE.get('cloudflare_ips')) || {ips:[]}; } catch { return {ips:[]}; } }
  async function getStoredSpeedIPs(env) { try { return JSON.parse(await env.IP_STORAGE.get('cloudflare_fast_ips')) || {fastIPs:[]}; } catch { return {fastIPs:[]}; } }
  async function getStoredBrowserIPs(env) { try { return JSON.parse(await env.IP_STORAGE.get('browser_fast_ips')) || {fastIPs:[]}; } catch { return {fastIPs:[]}; } }
  
  // 修正位元運算，改用乘法避免 JS 32位元有號整數溢出
  function ipToNum(ip) { return ip.split('.').reduce((a,b) => a * 256 + parseInt(b),0); }
  function numToIp(n) { return[(n>>>24)&255, (n>>>16)&255, (n>>>8)&255, n&255].join('.'); }
  function isValidIPv4(ip) { return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip); }
  
  async function fetchURLWithTimeout(url) { 
    const res = await fetch(url, { 
        signal: AbortSignal.timeout(8000), // 使用現代化超時
        headers: {'User-Agent': 'CF-Worker'} 
    }); 
    if(!res.ok) throw new Error('HTTP Error: ' + res.status + ' ' + res.statusText); 
    return await res.text(); 
  }
  
  function jsonResponse(data, status=200) { return new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } }); }
  function handleCORS() { return new Response(null, { headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type, Authorization' } }); }
