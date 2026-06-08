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
