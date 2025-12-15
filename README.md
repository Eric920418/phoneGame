# Kingdoms 遊戲官方網站

Kingdoms 遊戲官方網站，提供公告發布和論壇討論功能。

## 技術棧

- **前端框架**: Next.js 15 + React 19 + TypeScript
- **樣式**: Tailwind CSS 4 (現代暗黑風格)
- **後端**: GraphQL Yoga + Prisma ORM
- **資料庫**: PostgreSQL
- **認證**: NextAuth.js
- **圖標**: Lucide React

## 功能特色

### 前台功能
- **首頁**: 最新公告展示 + 論壇分類入口
- **公告系統**: 公告列表、分類篩選、詳情頁面
- **論壇系統**: 帖子列表、分類瀏覽、搜尋、發帖、評論回覆
- **用戶系統**: 郵箱註冊/登入、個人資料管理
- **評價系統**:
  - 玩家評價發表 (評分、推薦、內容)
  - 評價點讚、回覆、舉報功能
  - 評價統計 (好評率、平均分、分布)
  - 評價審核機制
  - 評價列表限制最大高度 (600px)，超出時可滾動，確保不超出金屬框

### 管理後台
- **儀表板**: 即時統計數據 (公告數、帖子數、分類數、瀏覽數)
- **公告管理**: 新增/編輯/刪除公告，支援置頂和發布狀態
- **論壇管理**: 新增/編輯/刪除帖子，置頂/鎖定功能
- **分類管理**: 自訂論壇分類
- **首頁內容管理**: 編輯首頁 12 個區塊的動態內容 (活動公告、贊助方案、下載、設定、攻略、掉落、副本、寶箱、BOSS、國戰、擂台、評價)
- **Excel 快速導入**: 支援上傳 Excel 檔案快速導入「掉落查詢」資料
  - 格式要求：標題行為 `BOSS`、`出生地點`、`物品`
  - 物品欄位以空格分隔多個物品
  - 上傳後先預覽資料，確認後再儲存到資料庫
- **評價審核**: 審核/隱藏用戶評價、處理舉報

## 快速開始

### 1. 安裝依賴

```bash
pnpm install
```

### 2. 配置環境變數

複製 `.env.example` 為 `.env` 並填寫配置：

```bash
cp .env.example .env
```

編輯 `.env`:
```env
# 資料庫連接
DATABASE_URL="postgresql://user:password@localhost:5432/kingdoms"

# NextAuth 配置
NEXTAUTH_SECRET="your-secret-key-change-this"
NEXTAUTH_URL="http://localhost:3000"

# 管理員帳號
ADMIN_USERNAME="admin"
ADMIN_PASSWORD="your-admin-password"
```

### 3. 初始化資料庫

```bash
pnpm prisma migrate dev
```

### 4. 啟動開發伺服器

```bash
pnpm dev
```

訪問 http://localhost:3000

## 專案結構

```
Kingdoms/
├── app/                      # Next.js App Router
│   ├── page.tsx              # 首頁
│   ├── layout.tsx            # 全局佈局
│   ├── globals.css           # 全局樣式 (暗黑主題)
│   ├── providers.tsx         # React Context
│   ├── auth/                 # 用戶登入/註冊頁面
│   ├── announcements/        # 公告頁面
│   ├── forum/                # 論壇頁面
│   ├── admin/                # 管理後台
│   │   ├── login/            # 登入頁
│   │   ├── dashboard/        # 儀表板 (即時統計)
│   │   ├── announcements/    # 公告管理 (CRUD)
│   │   ├── posts/            # 帖子管理 (CRUD)
│   │   ├── categories/       # 分類管理 (CRUD)
│   │   └── content/          # 首頁內容管理 (JSON 編輯)
│   └── api/                  # API 路由
│       ├── auth/             # NextAuth
│       ├── graphql/          # GraphQL 端點
│       ├── upload/           # 文件上傳
│       └── parse-excel/      # Excel 解析 (掉落查詢導入)
├── graphql/                  # GraphQL 架構
│   ├── resolvers.ts          # 解析器
│   ├── prismaClient.ts       # Prisma 客戶端
│   └── schemas/              # GraphQL Schema
├── src/
│   ├── components/           # React 組件
│   │   ├── Header.tsx        # 頁首 (含用戶菜單)
│   │   ├── Footer.tsx        # 頁尾
│   │   ├── UserMenu.tsx      # 用戶菜單組件
│   │   ├── ReviewSection.tsx # 評價區塊組件
│   │   └── Forum/            # 論壇組件
│   └── contexts/             # React Context
│       └── AuthContext.tsx   # 用戶認證狀態管理
├── lib/                      # 工具庫
│   └── apolloClient.ts       # GraphQL 客戶端
├── prisma/                   # Prisma 配置
│   └── schema.prisma         # 資料模型
└── public/                   # 靜態資源
```

## 資料模型

### User (用戶)
- id, email, passwordHash, name, avatar, gameHours
- isVerified, isAdmin, isBanned

### Review (評價)
- id, content, rating (1-5), isRecommended, isApproved, isHidden
- userId, replies, likes, reports

### ReviewReply (評價回覆)
- id, content, reviewId, userId

### ReviewLike (評價點讚)
- id, reviewId, userId (唯一約束)

### ReviewReport (評價舉報)
- id, reason, status (pending/resolved/dismissed), reviewId, userId

### Category (論壇分類)
- id, name, slug, description, icon, color, order

### Post (論壇帖子)
- id, title, slug, content, author, views, isPinned, isLocked, categoryId

### Comment (評論)
- id, content, author, postId, parentId (支援嵌套回覆)

### Announcement (官方公告)
- id, title, slug, content, type, isPinned, isPublished, publishedAt

### ContentBlock (首頁內容區塊)
- id, key (唯一標識), payload (JSON 數據)

## 用戶系統

訪問 `/auth` 進行用戶註冊或登入

- **註冊**: 需要郵箱、密碼、暱稱
- **登入後功能**: 發表評價、點讚、回覆、舉報
- **評價審核**: 用戶評價需要管理員審核後才會顯示

## 管理後台

訪問 `/admin/login` 登入管理後台

**預設帳號**: admin / admin123 (請在生產環境更改)

管理員可以：
- 審核/隱藏用戶評價
- 處理評價舉報
- 管理所有用戶內容

## 開發指令

```bash
# 開發
pnpm dev

# 構建
pnpm build

# 生產環境啟動
pnpm start

# 資料庫遷移
pnpm prisma migrate dev

# 查看資料庫
pnpm prisma studio

# 代碼檢查
pnpm lint
```

## 設計風格

採用現代暗黑風格設計：
- **主視覺**: 「破浪三國 熱血開戰」全屏背景圖 (`/public/破浪三國主視覺.png`)
- **主色調**: 金色 (#c9a227)
- **背景**: 深色系 (#0a0a0f)
- **卡片**: 半透明深色
- **動畫**: 細膩過渡效果

## 注意事項

1. **資料庫**: 需要 PostgreSQL 資料庫
2. **環境變數**: 生產環境務必更改所有預設密碼和密鑰
3. **圖片上傳**: 上傳的圖片存放在 `/uploads` 目錄

## 授權

MIT License
