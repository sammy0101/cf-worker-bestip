# Complete Project Codebase
Generated on: Fri Jun 12 12:47:01 UTC 2026

## File: README.md
````md
# Cloudflare 優選 IP 測速平台

這是一個基於 Cloudflare Workers 運作的輕量化優選 IP 收集、測速與訂閱發佈平台。系統會定期從多個優良的第三方來源抓取 CIDR 網段，自動進行隨機抽樣、多執行緒測速、過濾，並保存最優質的節點 IP 提供下載。

本專案採用**優雅的模組化架構**設計，並導入了**動態官方 IP 安全過濾防線**，確保所有匯出的 IP 皆 100% 屬於官方原生機房節點。

---

## 🚀 一鍵部署 (One-Click Deploy)

點選下方按鈕，即可直接將此專案發佈至您的 Cloudflare 帳戶中：

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sammy0101/cf-worker-bestip)

> ⚠️ **一鍵部署後的重要提醒**：
> 1. 部署完成後，請務必至 Cloudflare Workers 後台建立一個 **KV 命名空間**，命名為 `IP_STORAGE`，並綁定至您的 Worker。
> 2. 請至 **「Settings」 (設定) -> 「Variables」 (變數)」** 設定您的加密管理員密碼 `ADMIN_PASSWORD` [3]。

---

## 🌟 核心功能特色

* 🛡️ **動態官方安全過濾（防範惡意 IP 注入）**：在 IP 導入第一關，系統會**動態從 Cloudflare 官方 API** (`https://api.cloudflare.com/client/v4/ips`) 獲取最新的官方 IPv4 網段 [1]，自動剔除任何意外混入的第三方「反代 IP」或惡意代理節點。
* 📊 **雙欄式黃金分割排版 (60/40 Split-Pane)**：比照 Vercel、Linear 等現代化 SaaS 產品，將版面重構為雙欄式設計：
  * **左側主面板 (60%)**：主控面板、一體化開發者終端盒與端口資訊，構成全能「控制中心」。
  * **右側側邊欄 (40%)**：專屬於優選 IP 列表，呈現工整嚴謹的專業監控級數據表。
* 🖥️ **一體化高階終端盒（Terminal Console）**：日誌盒升級為帶有視窗控制點、Console 狀態與一鍵 Clear 的擬真終端介面。
* 📏 **數據欄位網格對齊**：利用 CSS 的 `display: contents;` 對齊技術，使機房代碼、IP 位址、測速數值與複製按鈕呈現完美、無偏差的垂直對齊邊界。
* ⚡ **獨立的前/後端測速上限**：
  * **後台自動排程（每 6 小時一次）**：限制在 **45 個** 以內，完美貼合免費版單次 50 次子請求的硬限制 [2]。
  * **前台瀏覽器手動測速**：允許發起 **1000 個** 以上的大範圍超深過濾，互不干擾、體驗流暢。
* 🔌 **細節與交互優化**：
  * **日誌記憶還原**：點選「立即更新庫」自動重整網頁後，各個來源詳細的「提取統計數據」依然會保存在畫面上，直到點選下一個指令為止。
  * **選單防消失橋樑**：下拉選單內建「隱形滑鼠感知橋樑」，解決了因滑鼠慢速移動而導致下拉選單意外關閉的痛點。

---

## 📂 專案模組檔案結構

本專案推薦使用以下模組化目錄結構進行管理與自動部署：

```text
你的專案目錄/
├── wrangler.toml           # 專案設定檔 (含每 6 小時定時排程配置)
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 自動部署腳本 (支援手動與自動觸發)
└── src/
    ├── config.js           # 靜態常數、亞洲優化源與機房代碼
    ├── utils.js            # 基礎工具 (IP 轉換、JSON 回應、CORS 等)
    ├── auth.js             # 權限驗證、Session 登入、Token 生成
    ├── ip.js               # IP 解析、動態安全校驗、前/後端測速 API
    ├── html.js             # 前端 HTML 介面與 CSS 樣式
    └── index.js            # 路由調度與排程入口
```

---

## 🌐 自訂子網域 API 串接與設定教學

本系統支援透過不同的**子網域首碼（Subdomain Prefixes）**直接獲取對應的純文字 API 數據。

### ⚠️ 重要限制說明（為什麼預設的 `.workers.dev` 無法使用子網域？）
Cloudflare 預設分配的 `xxx.workers.dev` 網域其 SSL 憑證僅支援單級子網域（`*.workers.dev`）。如果您嘗試存取 `fast.xxx.workers.dev`，會因為憑證不匹配與 DNS 無法解析而失敗。

**若要使用子網域 API 功能，您必須綁定您自己的「自訂網域」（Custom Domain，例如 `yourdomain.com`）：**

1. 登入 Cloudflare 後台，點選您的 Worker 專案（`cf-worker-bestip`）。
2. 切換到 **「Settings」（設定）** -> **「Triggers」（觸發器）** 索引標籤。
3. 找到 **「Custom Domains」（自訂網域）**，點選 **「Add Custom Domain」** 新增：
   - `fast.yourdomain.com` (後端優選)
   - `browser.yourdomain.com` (本機測速)
   - `all.yourdomain.com` (完整 IP 庫)

### 📊 子網域 API 連結對照表

在主控台點選 **「🔌 複製 API 連結 ▼」**，系統會自動在最前方替換或補上對應的子網域，並直接附帶 `https://` 協定：

| 複製按鈕 | 自動生成之子網域 API | 獲取數據內容 |
| :--- | :--- | :--- |
| **複製後端優選 IP API** | `https://fast.yourdomain.com` | 🚀 **後端自動優選 IP** (每 6 小時自動更新) |
| **複製本機測速結果 API** | `https://browser.yourdomain.com` | ⚡ **瀏覽器本機測速結果** (由前端測速後上傳的數據) |
| **複製完整 IP 庫 API** | `https://all.yourdomain.com` | 📦 **完整備用 IP 庫** (經過安全性校驗的所有官方 IP) |

---

## 🛠️ GitHub Actions 自動部署指南

Wrangler（Cloudflare 官方編譯工具）會自動順著 `src/index.js` 的 `import` 宣告將所有拆分的檔案打包壓縮，您不需要手動進行繁瑣的編譯。

### 步驟 1：配置本地 `wrangler.toml`

請在專案根目錄下建立 `wrangler.toml`，並設定 **每 6 小時定時任務**：

```toml
name = "cf-worker-bestip"
main = "src/index.js"
compatibility_date = "2024-03-01"

# KV 命名空間綁定
[[kv_namespaces]]
binding = "IP_STORAGE"
id = "KV_ID_PLACEHOLDER"

# ----------------- 每 6 小時定時觸發活動設定 -----------------
[triggers]
crons = ["0 */6 * * *"]
```

### 步驟 2：配置 GitHub Actions 工作流
在 `.github/workflows/deploy.yml` 建立以下部署腳本：

```yaml
name: Deploy Worker

on:
  push:
    branches:
      - main  # 當推送到 main 分支時觸發自動部署
  workflow_dispatch:  # 支援在 GitHub 網頁上手動點擊按鈕部署

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      # 部署前：將 wrangler.toml 的 KV_ID_PLACEHOLDER 替換成 GitHub Secrets 的 KV ID
      - name: Replace KV ID in wrangler.toml
        run: |
          sed -i 's/KV_ID_PLACEHOLDER/${{ secrets.CF_KV_ID }}/g' wrangler.toml

      - name: Deploy Worker
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
```

### 步驟 3：在 GitHub 設定 Secrets
前往您 GitHub 專案的 **Settings -> Secrets and variables -> Actions**，新增以下 Secrets：
1. `CLOUDFLARE_API_TOKEN`：您的 Cloudflare 編輯權限 API Token。
2. `CLOUDFLARE_ACCOUNT_ID`：您的 Cloudflare 帳戶 ID。
3. `CF_KV_ID`：您建立的 KV 命名空間 ID。

---

## 🔒 敏感資料安全指引

為了安全性，**請不要將您的管理密碼明文寫入 GitHub 代碼中**：
1. 進入 Cloudflare Dashboard 的 Worker 專案頁面。
2. 點選 **「Settings」（設定）** -> **「Variables」（變數）**。
3. 在 **「Environment Variables」（環境變數）** 點選 **「Add variable」**：
   * **Name**：`ADMIN_PASSWORD`
   * **Value**：您的自訂管理員密碼
   * **類型**：請務必點選 **「Encrypt」**（加密成密鑰，隱藏明文顯示） [3]。
4. 點選右下角 **「Save and deploy」**（儲存並部署） [3]。

````

## File: src/html.js
````js
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

        /* 支援端口資訊標籤 */
        .port-box { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .port-tag { padding: 4px 10px; border-radius: 6px; font-family: monospace; font-size: 0.85rem; border: 1px solid transparent; font-weight: 700; }
        .tag-http { background: #fef2f2; color: #991b1b; border-color: #fee2e2; } 
        .tag-https { background: #f0f9ff; color: #075985; border-color: #e0f2fe; }

        /* 表格化優選列表設計 - 修改：將第一欄機房網格寬度安全拓寬至 130px，預留極致容錯空間 */
        .ip-table-header { display: grid; grid-template-columns: 130px 1fr 70px 60px; padding: 10px 20px; font-size: 0.725rem; font-weight: 700; color: var(--text-sub); text-transform: uppercase; letter-spacing: 0.08em; border: 1px solid var(--border); border-bottom: none; background: var(--bg-inner); border-top-left-radius: var(--radius); border-top-right-radius: var(--radius); }
        .ip-list { border: 1px solid var(--border); border-bottom-left-radius: var(--radius); border-bottom-right-radius: var(--radius); overflow: hidden; }
        .ip-item { display: grid; grid-template-columns: 130px 1fr 70px 60px; align-items: center; padding: 10px 20px; border-bottom: 1px solid var(--border); background: var(--bg-card); transition: background 0.15s ease; }
        .ip-item:hover { background: var(--bg-inner); }
        .ip-item:last-child { border-bottom: none; }
        
        /* 利用 display: contents 讓子節點完全融入 Grid 中對齊 */
        .ip-info { display: contents; }
        
        /* 修改：移除限制，加入 width: 100% 自適應、自動隱藏溢出（overflow）與優雅省略號（ellipsis）避免重疊 */
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

        /* 終端視窗 (Terminal Shell Window Container) */
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

        /* 手機與行動裝置深度適配 (Mobile Responsive) - 修改：將機房網格欄位拓寬至 115px */
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

````

## File: src/utils.js
````js
// src/utils.js

export function ipToNum(ip) { 
    return ip.split('.').reduce((a, b) => a * 256 + parseInt(b), 0); 
}

export function numToIp(n) { 
    return [(n >>> 24) & 255, (n >>> 16) & 255, (n >>> 8) & 255, n & 255].join('.'); 
}

export function isValidIPv4(ip) { 
    return /^((25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/.test(ip); 
}

export function jsonResponse(data, status = 200) { 
    return new Response(JSON.stringify(data), { 
        status, 
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' } 
    }); 
}

export function handleCORS() { 
    return new Response(null, { 
        headers: { 
            'Access-Control-Allow-Origin': '*', 
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 
            'Access-Control-Allow-Headers': 'Content-Type, Authorization' 
        } 
    }); 
}

// 新增：檢查某個 IP 是否落在特定的 CIDR 網段內
export function isIpInCidr(ip, cidr) {
    try {
        const [cidrIp, maskStr] = cidr.split('/');
        const maskBits = parseInt(maskStr || '32');
        const start = ipToNum(cidrIp);
        const totalIPs = Math.pow(2, 32 - maskBits);
        const end = start + totalIPs - 1;
        const num = ipToNum(ip);
        return num >= start && num <= end;
    } catch {
        return false;
    }
}

// 新增：檢查 IP 是否屬於 Cloudflare 官方 IP 集
export function isCloudflareIP(ip, cfCidrs) {
    return cfCidrs.some(cidr => isIpInCidr(ip, cidr));
}

````

## File: src/index.js
````js
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

````

## File: src/auth.js
````js
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

export async function handleAdminLogout(env) { 
    return jsonResponse({ success: true }); 
}

````

## File: src/config.js
````js
// src/config.js

export const VERSION = "V4.1.1";             // 系統版本號
export const FAST_IP_COUNT = 20;             // 優質 IP 數量
export const AUTO_TEST_MAX_IPS = 45;        // 定時任務測速最大數量 (安全限制在 45 以內)
export const SAFE_SUBREQUEST_LIMIT = 45;    // 子請求安全硬上限，防止免費方案部署時發生異常
export const BROWSER_TEST_MAX_IPS = 1000;    // 新增：瀏覽器測速的最大數量 (可設定 500 甚至更高)

// IP 來源網址列表 (亞洲優化庫)
export const CIDR_SOURCE_URLS = [
    'https://bestcf.pages.dev/uouin/all.txt',
    'https://bestcf.pages.dev/wetest/ipv4.txt',
    'https://bestcf.pages.dev/moistr/all.txt',
    'https://bestcf.pages.dev/gslege/Cfxyz.txt',
    'https://bestcf.pages.dev/gslege/SG.txt',
    'https://bestcf.pages.dev/gslege/US.txt',
    'https://bestcf.pages.dev/gslege/JP.txt',
    'https://bestcf.pages.dev/cfyes/ipv4.txt',
    'https://bestcf.pages.dev/nirevil/ipv4.txt',
    'https://raw.githubusercontent.com/ymyuuu/IPDB/refs/heads/main/BestCF/bestcfv4.txt',
    'https://bestcf.pages.dev/zhixuanwang/ipv4-onlyip.txt',
    'https://raw.githubusercontent.com/joname1/BestCFip/refs/heads/main/ipv4.txt',
    'https://raw.githubusercontent.com/Senflare/Senflare-IP/refs/heads/main/IPlist-Pro.txt',
    'https://bestcf.pages.dev/vvhan/ipv4.txt',
    'https://bestcf.pages.dev/ircf/ipv4.txt',
    'https://raw.githubusercontent.com/gshtwy/CF-DNS-Clone/refs/heads/main/wetest-cloudflare-v4.txt',
    'https://090227.pages.dev/bestcf?isp=all&ips=20',
    'https://090227.pages.dev/bestcf?isp=ct&ips=50',
];

// 全球機房代碼對照表
export const COLO_MAP = {
    'HKG': '香港', 'TPE': '台北', 'NRT': '東京', 'KIX': '大阪', 'ICN': '首爾', 'FUK': '福岡', 'OKA': '沖繩', 'CTS': '札幌', 'KHH': '高雄',
    'SIN': '新加坡', 'KUL': '吉隆坡', 'BKK': '曼谷', 'MNL': '馬尼拉', 'SGN': '胡志明市', 'HAN': '河內', 'CGK': '雅加達', 'KNO': '棉蘭', 'DPS': '峇里島', 'PNH': '金邊', 'RGN': '仰光', 'VTE': '永珍',
    'LAX': '洛杉磯', 'SJC': '聖荷西', 'SFO': '舊金山', 'SEA': '西雅圖', 'PDX': '波特蘭', 'YVR': '溫哥華', 'SAN': '聖地牙哥', 'PHX': '鳳凰城', 'LAS': '拉斯維加斯', 'SMF': '沙加緬度', 'SLC': '鹽湖城',
    'JFK': '紐約', 'EWR': '紐華克', 'ORD': '芝加哥', 'IAD': '華盛頓', 'MIA': '邁阿密', 'DFW': '達拉斯', 'IAH': '休士頓', 'ATL': '亞特蘭大', 'YYZ': '多倫多', 'YUL': '蒙特婁', 'DEN': '丹佛', 'BOS': '波士頓', 'PHL': '費城', 'DTW': '底特律', 'MSP': '明尼阿波利斯',
    'LHR': '倫敦', 'AMS': '阿姆斯特丹', 'FRA': '法蘭克福', 'CDG': '巴黎', 'MAD': '馬德里', 'ZRH': '蘇黎世', 'MXP': '米蘭', 'VIE': '維也納', 'ARN': '斯德哥爾摩', 'OSL': '奧斯陸', 'CPH': '哥本哈根', 'HEL': '赫爾辛基', 'WAW': '華沙', 'PRG': '布拉格', 'BUD': '布達佩斯', 'OTP': '布加勒斯特', 'ATH': '雅典', 'IST': '伊斯坦堡', 'DUB': '都裂林', 'BRU': '布魯塞爾', 'MUC': '慕尼黑', 'TXL': '柏林', 'LIS': '里斯本', 'FCO': '羅馬', 'BCN': '巴塞隆納',
    'SYD': '雪梨', 'MEL': '墨爾本', 'BNE': '布里斯本', 'PER': '伯斯', 'AKL': '奧克蘭', 'ADL': '阿得雷德', 'CBR': '坎培拉',
    'SCL': '聖地亞哥', 'GRU': '聖保羅', 'EZE': '布宜諾斯艾利斯', 'BOG': '波哥大', 'LIM': '利馬', 'GIG': '里約熱內盧', 'QRO': '克雷塔羅',
    'DXB': '杜拜', 'TLV': '特拉維夫', 'DOH': '杜哈', 'JNB': '約翰尼斯堡', 'CPT': '開普敦', 'BOM': '孟買', 'DEL': '德里', 'MAA': '清奈', 'HYD': '海得拉巴', 'KWI': '科威特', 'RUH': '利雅德', 'MCT': '馬斯喀特'
};

````

## File: src/ip.js
````js
// src/ip.js
import { CIDR_SOURCE_URLS, COLO_MAP, AUTO_TEST_MAX_IPS, FAST_IP_COUNT, SAFE_SUBREQUEST_LIMIT } from './config.js';
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
    
    // === 1. 動態從 Cloudflare 官方 API 獲取最新的安全 IPv4 網段 ===
    let officialCidrs = [];
    try {
        const cfIpsRes = await fetch('https://api.cloudflare.com/client/v4/ips', {
            signal: AbortSignal.timeout(5000), // 設定 5 秒超時
            headers: { 'User-Agent': 'CF-Worker' }
        });
        if (cfIpsRes.ok) {
            const data = await cfIpsRes.json();
            if (data.success && data.result && data.result.ipv4_cidrs) {
                officialCidrs = data.result.ipv4_cidrs;
            }
        }
    } catch (e) {
        console.error("無法取得 Cloudflare 官方即時 IP 白名單，將起用備用清單:", e.message);
    }

    // === 2. 備用防線：如果官方 API 連線失敗，則自動套用這套備用白名單 ===
    if (officialCidrs.length === 0) {
        officialCidrs = [
            "173.245.48.0/20", "103.21.244.0/22", "103.22.200.0/22", "103.31.4.0/22",
            "141.101.64.0/18", "190.93.240.0/20", "188.114.96.0/20", "197.234.240.0/22",
            "198.41.128.0/17", "162.158.0.0/15", "104.16.0.0/13", "104.24.0.0/14",
            "172.64.0.0/13", "131.0.72.0/22"
        ];
    }

    // === 3. 開始抓取各個優化源，並使用剛才獲取的 officialCidrs 進行安全過濾 ===
    for (const url of urls) {
        try {
            const txt = await fetchURLWithTimeout(url);
            const matches = txt.match(cidrRegex) || [];
            let count = 0;
            matches.forEach(m => {
                if (m.includes('/')) {
                    expandCIDR(m).forEach(ip => { 
                        // 套用動態獲取的白名單驗證
                        if (isValidIPv4(ip) && isCloudflareIP(ip, officialCidrs)) { 
                            uniqueIPs.add(ip); 
                            count++; 
                        }
                    });
                } else if (isValidIPv4(m) && isCloudflareIP(m, officialCidrs)) { 
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

````

## File: wrangler.toml
````toml
name = "cf-worker-bestip"
main = "src/index.js"
compatibility_date = "2024-03-01"

# KV 命名空間綁定
[[kv_namespaces]]
binding = "IP_STORAGE"
id = "KV_ID_PLACEHOLDER"

# ----------------- 每 6 小時定時觸發設定 -----------------
[triggers]
crons = ["0 */6 * * *"]  # 每 6 小時整點自動執行一次 (非常安全且節省額度的設定)

````

## File: .github/workflows/deploy.yml
````yml
name: Deploy Worker

on:
  push:
    branches:
      - main  # 當推送到 main 分支時觸發自動部署
  workflow_dispatch:  # 支援在 GitHub 網頁上手動點擊按鈕部署

jobs:
  deploy:
    runs-on: ubuntu-latest
    name: Deploy to Cloudflare
    steps:
      - name: Checkout Code
        uses: actions/checkout@v4

      # 部署前：將 wrangler.toml 的 KV_ID_PLACEHOLDER 替換成 GitHub Secrets 的 KV ID
      - name: Replace KV ID in wrangler.toml
        run: |
          sed -i 's/KV_ID_PLACEHOLDER/${{ secrets.CF_KV_ID }}/g' wrangler.toml

      - name: Deploy Worker
        uses: cloudflare/wrangler-action@v3
        with:
          apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
          accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}

````

## File: .github/workflows/combine-code.yml
````yml
name: Generate All Codebase to MD

on:
  push:
    branches:
      - main
    paths-ignore:
      - 'combined_project_code.md' # 避免此檔案自身更新引發無限循環
  workflow_dispatch: # 支援在 GitHub 網頁上手動觸發執行

permissions:
  contents: write

jobs:
  build:
    runs-on: ubuntu-latest

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Combine All Files into MD
        run: |
          OUT_FILE="combined_project_code.md"
          echo "# Complete Project Codebase" > "$OUT_FILE"
          echo "Generated on: $(date)" >> "$OUT_FILE"
          echo "" >> "$OUT_FILE"

          # 遍歷專案內的所有檔案，排除依賴、Git 歷史、打包產物及二進位檔案
          find . -type f \
            -not -path "*/node_modules/*" \
            -not -path "*/.git/*" \
            -not -path "*/dist/*" \
            -not -name "package-lock.json" \
            -not -name "yarn.lock" \
            -not -name "pnpm-lock.yaml" \
            -not -name "$OUT_FILE" \
            -not -name "*.png" \
            -not -name "*.jpg" \
            -not -name "*.jpeg" \
            -not -name "*.gif" \
            -not -name "*.ico" \
            -not -name "*.woff*" \
            -not -name "*.ttf" | while read -r file; do
              
              # 取得相對路徑與副檔名
              rel_path="${file#./}"
              ext="${file##*.}"
              
              # 如果無副檔名，清除變數避免格式混亂
              if [ "$ext" = "$rel_path" ]; then
                ext=""
              fi
              
              # 寫入檔案標題
              echo "## File: $rel_path" >> "$OUT_FILE"
              # 使用四個反單引號（````）包裹，防止內部程式碼的三個反單引號造成排版衝突
              echo "\`\`\`\`$ext" >> "$OUT_FILE"
              cat "$file" >> "$OUT_FILE"
              echo "" >> "$OUT_FILE"
              echo "\`\`\`\`" >> "$OUT_FILE"
              echo "" >> "$OUT_FILE"
          done

      - name: Commit and Push changes
        run: |
          git config --local user.email "github-actions[bot]@users.noreply.github.com"
          git config --local user.name "github-actions[bot]"
          git add combined_project_code.md
          
          if git diff --staged --quiet; then
            echo "No changes in codebase."
          else
            git commit -m "docs: auto-generate complete codebase [skip ci]"
            git push origin main
          fi

````

