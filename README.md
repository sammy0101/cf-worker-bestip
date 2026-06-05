# Cloudflare 優選 IP 測速平台

這是一個基於 Cloudflare Workers 運作的輕量化優選 IP 收集、測速與發佈平台。系統會定期從多個亞洲優良的第三方來源抓取 CIDR 網段，自動進行隨機抽樣、多執行緒測速、過濾，並保存最優質的節點 IP 提供下載。

本專案經過重構，採用優雅的**模組化架構**設計，並導入了**動態官方 IP 安全過濾防線**，確保所有匯出的 IP 100% 屬於 Cloudflare 官方節點。

---

## 🚀 一鍵部署 (One-Click Deploy)

點選下方按鈕，即可直接將此專案發佈至您的 Cloudflare 帳戶中：

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sammy0101/cf-worker-bestip)

> ⚠️ **一鍵部署後的重要提醒**：
> 1. 部署完成後，請至 Cloudflare Workers 後台建立一個 **KV 命名空間**，命名為 `IP_STORAGE`，並綁定至您的 Worker。
> 2. 請至 **「Settings」 (設定) -> 「Variables」 (變數)** 設定您的加密管理員密碼 `ADMIN_PASSWORD`。

---

## 🌟 核心功能特色

* 🛡️ **動態官方安全防線**：在 IP 導入第一關，系統會**動態從 Cloudflare 官方 API** (`https://api.cloudflare.com/client/v4/ips`) 獲取最新的官方 IPv4 網段，自動剔除任何意外混入的惡意代理、監聽節點或釣魚 IP。
* 📦 **優雅的模組化架構**：程式碼完全拆分為 6 個職責單一的模組（設定、工具、安全、測速、UI、入口），高可讀性、便於自訂。
* 🕒 **背景定時測速（每 6 小時）**：每 6 小時自動觸發排程（Cron Trigger），對數百個隨機抽樣 IP 進行測試，篩選最優質的 25 個 IP 保存至後端快取。
* 🎨 **莫蘭迪靛藍與鋅灰 UI**：全新設計的現代化開發者風格介面，完美適配系統「深色模式（Dark Mode）」。
* 🔌 **無縫操作體驗**：
  * **日誌記憶還原**：點選「立即更新庫」重整網頁後，操作日誌仍會保存在畫面上，不會丟失，直到點選下一個指令。
  * **選單防消失橋樑**：下拉選單內建「隱形滑鼠感知橋樑」，解決了因滑鼠慢速移動而導致選單意外消失的痛點。
* 🎲 **隨機 Token 生成器**：在「Token 管理」彈窗中內建前端隨機生成按鈕，一鍵生成 32 位元高強度安全金鑰。

---

## 📂 專案模組檔案結構

本專案推薦使用以下模組化目錄結構進行管理與自動部署：

```text
你的專案目錄/
├── wrangler.toml           # 專案設定檔 (含每 6 小時定時排程配置)
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 自動部署腳本 (支援手動觸發)
└── src/
    ├── config.js           # 靜態常數、亞洲優化源與機房代碼
    ├── utils.js            # 基礎工具 (IP 轉換、JSON 回應、CORS 等)
    ├── auth.js             # 權限驗證、Session 登入、Token 生成
    ├── ip.js               # IP 解析、動態安全校驗、前/後端測速 API
    ├── html.js             # 前端 HTML 介面與 CSS 樣式
    └── index.js            # 路由調度與排程入口
```

---

## 🌐 子網域 API 串接與設定教學

本系統支援透過不同的**子網域首碼（Subdomain Prefixes）**直接獲取對應的純文字 API 數據，方便客戶端軟體串接。

### ⚠️ 重要限制說明（為什麼預設的 `.workers.dev` 無法使用子網域？）
Cloudflare 預設分配的 `xxx.workers.dev` 網域其 SSL 憑證僅支援單級子網域（`*.workers.dev`）。如果您嘗試存取 `fast.xxx.workers.dev`，會因為憑證不匹配與 DNS 無法解析而失敗。

**若要使用子網域 API 功能，您必須綁定您自己的「自訂網域」（Custom Domain，例如 `yourdomain.com`）：**

1. 登入 Cloudflare 後台，點選您的 Worker 專案。
2. 切換到 **「Settings」（設定）** -> **「Triggers」（觸發器）** 索引標籤。
3. 找到 **「Custom Domains」（自訂網域）**，點選 **「Add Custom Domain」** 新增：
   - `fast.yourdomain.com` (後端優選)
   - `browser.yourdomain.com` (本機測速)
   - `all.yourdomain.com` (完整 IP 庫)

### 📊 子網域 API 連結對照表

| 子網域網址 (以 `yourdomain.com` 為例) | 等同於原本的 API 路由 | 獲取數據內容 |
| :--- | :--- | :--- |
| **`https://fast.yourdomain.com`** | `/fast-ips.txt` | 🚀 **後端自動優選 IP** (每 6 小時自動更新) |
| **`https://browser.yourdomain.com`** | `/browser-ips.txt` | ⚡ **瀏覽器本機測速結果** (由前端測速後上傳的數據) |
| **`https://all.yourdomain.com`** | `/ips` | 📦 **完整備用 IP 庫** (經過安全性校驗的所有原始 IP) |

> 💡 **安全提示**：若您的系統啟用了 Token 驗證，請在請求子網域時，於網址後方帶上 `?token=您的TOKEN`。

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
在 `.github/workflows/deploy.yml` 建立以下手動與自動雙支援的部署腳本：

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

經此設定的加密環境變數具有最高權限，**不會**被 GitHub Actions 的重新部署所覆蓋或刪除 [3]。
