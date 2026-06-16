# Cloudflare 優選 IP 測速平台

這是一個基於 Cloudflare Workers 運作的輕量化優選 IP 收集、測速與訂閱發佈平台。系統會定期從多個優良的第三方來源抓取 CIDR 網段，自動進行隨機抽樣、多執行緒測速、過濾，並保存最優質的節點 IP 提供下載。

本專案採用**優雅的模組化架構**設計，並導入了**前端動態網址源管理**與**動態官方 IP 安全過濾防線**，確保所有匯出的 IP 皆 100% 屬於官方原生機房節點。

---

## 🚀 一鍵部署 (One-Click Deploy)

點選下方按鈕，即可直接將此專案發佈至您的 Cloudflare 帳戶中：

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sammy0101/cf-worker-bestip)

> ⚠️ **一鍵部署後的重要提醒**：
> 1. 部署完成後，請務必至 Cloudflare Workers 後台建立一個 **KV 命名空間**，命名為 `IP_STORAGE`，並綁定至您的 Worker。
> 2. 請至 **「Settings」 (設定) -> 「Variables」 (變數)」** 設定您的加密管理員密碼 `ADMIN_PASSWORD` [3]。

---

## 🌟 核心功能特色

* ⚙️ **前端動態網址來源管理（KV 存儲）**：全新支援直接在前端控制面板點選「⚙️ 來源管理」彈窗。您可以像編輯筆記本一樣自由「增、刪、改」您的訂閱網址（每行一個），數據會即時儲存至您的 Cloudflare KV 資料庫 [3]。系統亦提供「一鍵載入系統預設」的功能。
* 🛡️ **動態官方安全過濾（防範惡意 IP 注入）**：系統在抓取 IP 時，會**動態從 Cloudflare 官方 API** (`https://api.cloudflare.com/client/v4/ips`) 獲取最新的官方 IPv4 網段 [1]，自動剔除任何意外混入的第三方「反代 IP（如阿里雲、甲骨文、台灣中華電信反代節點）」或惡意監聽伺服器，確保連線隱私與傳輸安全。
* 🖥️ **瀑布流動畫控制台（Waterfall Logs）**：在手動點選「立即更新庫」時，日誌控制台會以 `150ms` 的優雅延遲，逐條動畫化印出每個訂閱網址的提取狀態與成功 IP 數量。在所有明細印出後，**才在最底部印出最終成功彙總（Summary）**。重新整理後，整條瀑布流日誌依然完美保留在畫面上。
* 📊 **雙欄式黃金分割工作台 (60/40 Split-Pane)**：
  * **左側主面板 (60%)**：整合「控制面板」、「支援端口資訊」與「擬真終端控制台」，構成核心中央主控中心。
  * **右側側邊欄 (40%)**：專屬於「優選 IP 列表」大數據表格，機房、IP 與延遲具有完美的垂直對齊邊界，並完美解決了長名稱（如 `GIG (里約熱內盧)`、`EZE (布宜諾斯艾利斯)`）的排版重疊問題。
* ⚡ **獨立的前/後端測速上限**：
  * **後台自動排程（每 6 小時一次）**：限制在 **45 次** 測速以內，完美貼合免費版單次 50 次子請求的硬限制 [2]。
  * **前端瀏覽器手動測速**：允許發起 **1000 次** 甚至更高的大範圍深層測速，不影響後端運行，且在手機端亦有完美的排版適配。
* 🔌 **極簡洗鍊的選單按鈕**：完全刪除了冗餘的「下載中心 ▼」選單與相關代碼，將下載、線上查看功能完全歸併，介面更加專業精緻。

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
    ├── config.js           # 靜態常數、預設訂閱優化源與機房代碼
    ├── utils.js            # 基礎工具 (IP 轉換、JSON 回應、CORS 等)
    ├── auth.js             # 權限驗證、Session 登入、Token 生成
    ├── ip.js               # IP 解析、動態安全校驗、前/後端測速 API、KV 動態來源管理
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

# ----------------- 每 6 小時定時任務觸發設定 -----------------
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
