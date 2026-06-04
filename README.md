# Cloudflare 優選 IP 測速平台

這是一個基於 Cloudflare Workers 運作的輕量化優選 IP 收集與測速平台。系統會定時（或經由指令）從多個亞洲優化源抓取 CIDR 網段，自動進行隨機抽樣、多執行緒測速、過濾，並保存最優質的 Cloudflare 節點 IP 提供下載。

---

## 🚀 一鍵部署 (One-Click Deploy)

您可以點選下方按鈕，直接將此專案部署至您的 Cloudflare 帳戶：

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/sammy0101/cf-worker-bestip)

> ⚠️ **一鍵部署後的重要提醒**：
> 1. 部署完成後，請務必至 Cloudflare Workers 後台建立一個 **KV 命名空間**，命名為 `IP_STORAGE`，並綁定至您的 Worker。
> 2. 請至 **「Settings」 (設定) -> 「Variables」 (變數)** 設定您的 `ADMIN_PASSWORD` [3]。

---

## 🌐 子網域 API 串接與設定教學

本系統支援透過不同的**子網域首碼（Subdomain Prefixes）**直接獲取對應的純文字 API 數據。例如，直接請求 `fast.yourdomain.com` 即可直接取得後端優選 IP，無需在網址後方輸入複雜的 `/fast-ips.txt`。

### ⚠️ 重要限制說明（為什麼 default `workers.dev` 不能用？）
Cloudflare 預設分配給您的 `xxx.workers.dev` 網域，其 SSL 憑證與 DNS 僅支援一級子網域（即 `*.workers.dev`）。如果您嘗試存取 `fast.xxx.workers.dev`，將會因為 SSL 憑證不支援與 DNS 無法解析而連線失敗。

**為了解決此問題，您必須使用您自己的「自訂網域」（Custom Domain，例如 `yourdomain.com`）來進行綁定。**

---

### 🛠️ 自訂子網域綁定步驟

#### 步驟 1：在 Cloudflare 中綁定自訂子網域
1. 登入 Cloudflare 後台，點選您的 Worker 專案（`cf-worker-bestip`）。
2. 切換到 **「Settings」（設定）** -> **「Triggers」（觸發器）** 索引標籤。
3. 找到 **「Custom Domains」（自訂網域）** 區塊，點選 **「Add Custom Domain」**。
4. 分別新增以下三個您擁有的子網域：
   - `fast.yourdomain.com`
   - `browser.yourdomain.com`
   - `all.yourdomain.com`
5. Cloudflare 會自動為您在 DNS 中新增對應的解析記錄，並簽發 SSL 憑證，靜待幾分鐘生效即可。

---

### 📊 子網域 API 連結對照表

綁定完成後，您與您的客戶端工具（如 Clash、Sing-box、Xray 等）即可使用以下簡短且直觀的網址來串接 API：

| 子網域網址 (以 `yourdomain.com` 為例) | 等同於原本的 API 路徑 | 獲取數據內容 |
| :--- | :--- | :--- |
| **`https://fast.yourdomain.com`** | `https://yourdomain.com/fast-ips.txt` | 🚀 **後端優選 IP** (自動測速，推薦後端訂閱) |
| **`https://browser.yourdomain.com`** | `https://yourdomain.com/browser-ips.txt` | ⚡ **瀏覽器測速 IP** (由前端測速後上傳的結果) |
| **`https://all.yourdomain.com`** | `https://yourdomain.com/ips` | 📦 **完整備用 IP 庫** (所有未篩選的節點 IP) |

> 💡 **安全提示**：如果您的系統啟用了 `ADMIN_PASSWORD` 與 Token 驗證，請記得在請求子網域時，於網址後方帶上 `?token=您的TOKEN` 來通過驗證（例如：`https://fast.yourdomain.com/?token=您的TOKEN`）。

---

## 🛠️ 部署與維護教學（GitHub 自動部署）

由於一鍵部署後，若您在 Cloudflare 線上編輯器直接修改代碼，下次部署時修改將會被覆蓋。因此推薦使用 **GitHub Actions 自動化部署**：

### 步驟 1：建立專案結構
請確保您的 GitHub 儲存庫（Repository）包含以下檔案與結構：

```text
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions 自動部署腳本
├── src/
│   └── index.js            # Worker 核心程式碼
└── wrangler.toml           # 專案設定檔
```

### 步驟 2：配置 `wrangler.toml`
在專案根目錄建立 `wrangler.toml`：

```toml
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
```

### 步驟 3：配置 GitHub Secrets
進入您的 GitHub 儲存庫 **Settings -> Secrets and variables -> Actions**，新增以下密鑰（Secrets）：

* **`CLOUDFLARE_API_TOKEN`**：您的 Cloudflare API 權杖（需具備編輯 Workers 與 KV 權限）。
* **`CF_KV_ID`**：您的 Cloudflare KV 命名空間 ID。
* **`CLOUDFLARE_ACCOUNT_ID`**：您的 Cloudflare 帳戶 ID。

完成後，推送代碼至 `main` 分支，系統就會自動完成變數替換並發佈。

---

## 🔒 敏感資料安全指引 (極重要)

為了確保安全，**請不要將管理密碼直接寫入程式碼**。

### 如何安全地設定管理密碼（ADMIN_PASSWORD）
1. 進入 Cloudflare Dashboard 的 Worker 專案頁面。
2. 點選 **「Settings」（設定）** -> 點選 **「Variables」（變數）**。
3. 在 **「Environment Variables」（環境變數）** 點選 **「Add variable」**：
   * **Name**：`ADMIN_PASSWORD`
   * **Value**：您的自訂管理員密碼
   * **類型**：請點選 **「Encrypt」**（加密成 Secret，隱藏明文顯示） [3]。
4. 點選右下角 **「Save and deploy」** [3]。
