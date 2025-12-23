# ✨ Tiosa Nav

> 一个现代化、AI辅助的链接导航应用，支持智能分类、管理员控制台、拖拽排序、数据导出/导入。

![Node.js](https://img.shields.io/badge/Node.js-18+-green) ![React](https://img.shields.io/badge/React-19-blue) ![Vite](https://img.shields.io/badge/Vite-6-purple) ![License](https://img.shields.io/badge/License-MIT-orange)

> ⚙️ **项目初由 Google Gemini 生成，后续持续优化与完善。**

---

## 📋 核心功能

- ✅ 管理员登录与控制台（密码默认 `admin`）
- ✅ 书签增删改查、拖拽排序、搜索过滤
- ✅ 分类管理（新增/删除）
- ✅ **AI 智能填充**网站元数据（标题、描述、标签）
- ✅ 站点 **favicon 自适应加载**（多级回退链）
- ✅ **数据导出/导入**（JSON）
- ✅ **服务端持久化**（Express + 文件存储）

---

## 🛠 技术栈

| 分类                | 技术                                         |
| ------------------- | -------------------------------------------- |
| **前端**      | React 19 + Vite 6（ESM）                     |
| **UI 组件库** | lucide-react                                 |
| **AI 支持**   | Gemini（@google/genai）/ GLM（BigModel API） |
| **服务端**    | Express.js（本地 JSON 文件持久化）           |
| **类型系统**  | TypeScript 5.8+                              |

---

## 📂 项目结构

```
.
├── App.tsx                        # 主应用逻辑与状态管理
├── components/
│   ├── AdminPanel.tsx             # 控制台（CRUD + 导出/导入）
│   ├── BookmarkCard.tsx           # 书签卡片组件（3D 动效 + favicon）
│   ├── LoginModal.tsx             # 管理员登录模态框
│   ├── Navbar.tsx                 # 导航栏（搜索 + 登录）
│   └── Sidebar.tsx                # 侧栏分类选择
├── services/
│   └── api.ts                     # Express API 客户端（CRUD 包装）
├── server/
│   └── index.js                   # Express 服务端（数据持久化）
├── geminiService.ts               # AI 元数据填充（Gemini/GLM 双支持）
├── types.ts                       # TypeScript 数据模型
├── constants.ts                   # 初始数据种子
├── data.json                      # 运行时数据存储（自动生成）
└── package.json
```

---

## 🚀 快速开始

### 环境要求

- **Node.js 18+**
- **Git**（可选，用于版本控制）

### 1️⃣ 安装依赖

```bash
npm install
```

### 2️⃣ 配置环境变量

复制 `.env.example` 为 `.env.local` 并配置：

```env
# AI 提供商选择：gemini 或 glm
VITE_AI_PROVIDER=gemini

# API 密钥（从对应提供商获取）
VITE_AI_API_KEY=your-api-key-here

# 可选：模型覆盖
# Gemini 默认：gemini-3-flash-preview
# GLM 示例：glm-4-flash 或 glm-6-flash
VITE_AI_MODEL=gemini-3-flash-preview

# 可选：服务端地址（用于跨域/自定义部署）
VITE_API_BASE=http://localhost:3001/api
```

### 3️⃣ 启动服务端（数据持久化）

```bash
npm run server
# 输出：Server listening on http://localhost:3001
```

### 4️⃣ 启动前端（新终端）

```bash
npm run dev
# 访问：http://localhost:5173
```

### 5️⃣ 生产构建

```bash
# 构建
npm run build

# 预览
npm run preview
```

---

## 🔐 AI 提供商配置

### Gemini（推荐快速开始）

1. 访问 [Google AI Studio](https://aistudio.google.com)
2. 点击 "Get API Key"
3. 复制密钥到 `.env.local` 的 `VITE_AI_API_KEY`
4. 设置 `VITE_AI_PROVIDER=gemini`

### GLM（开源模型）

1. 访问 [智谱清言](https://open.bigmodel.cn)
2. 申请 API 密钥
3. 设置 `VITE_AI_PROVIDER=glm` 与 `VITE_AI_API_KEY`
4. 可选指定模型：`VITE_AI_MODEL=glm-4-flash`

---

## 🔌 服务端 API（Express）

服务端运行在 `http://localhost:3001`，数据持久化到 `data.json`。

### 核心端点

| 方法       | 路径                    | 说明                   |
| ---------- | ----------------------- | ---------------------- |
| `GET`    | `/api/state`          | 获取完整状态           |
| `POST`   | `/api/bookmarks`      | 新增/更新书签          |
| `PUT`    | `/api/bookmarks/:id`  | 更新书签               |
| `DELETE` | `/api/bookmarks/:id`  | 删除书签               |
| `POST`   | `/api/categories`     | 新增分类               |
| `DELETE` | `/api/categories/:id` | 删除分类（自动重映射） |
| `PUT`    | `/api/password`       | 更新管理员密码         |
| `GET`    | `/api/export`         | 导出数据（JSON）       |
| `POST`   | `/api/import`         | 导入数据（JSON）       |

**CORS 配置**：已启用跨域预检（preflight）与自动允许。

---

## 📖 使用指南

### 🔑 管理员登录

1. 点击右上角 **"身份验证"** 按钮
2. 输入密码（默认：`admin`）
3. 进入管理员模式

### ➕ 添加书签

1. 控制台 → **"部署新节点"**
2. 选择分类，输入链接
3. 点击 **"智能填充"** 让 AI 自动提取标题、描述、标签
4. 补充修改后保存

### ✏️ 编辑与删除

- 卡片右上角图标：编辑 / 删除 / 打开链接

### 🎯 拖拽排序

- 管理员模式下，按住卡片可拖拽排序
- 支持插入到目标卡片的前/后

### 📁 分类管理

- 控制台 → **"分类管理"**
- 新增分类（选择图标）或删除分类

### 💾 数据备份

- 控制台 → **"安全中心"** → **"导出数据"**：下载 JSON
- **"导入数据"**：选择 JSON 文件上传恢复

---

## ⚙️ AI 元数据填充策略

| 字段            | 是否由 AI 填充 | 说明             |
| --------------- | -------------- | ---------------- |
| `title`       | ✅             | 网站标题         |
| `description` | ✅             | 简要描述         |
| `tags`        | ✅             | 相关标签（中文） |
| `category`    | ❌             | 由用户选择       |

**GLM JSON 处理**：项目已内置 Markdown 代码块剥离与首个 JSON 对象提取（见 `geminiService.ts`）。

---

## 🖼️ Favicon 加载顺序

1. **站点直链**：`{origin}/favicon.ico`
2. **Google S2**：`https://www.google.com/s2/favicons?domain=...&sz=128`
3. **UI-Avatars**：`https://ui-avatars.com/api/?name=...`

任一失败会自动尝试下一个。详见 `components/BookmarkCard.tsx`。

---

## 🐛 疑难排查

| 问题                         | 原因                         | 解决方案                                                                           |
| ---------------------------- | ---------------------------- | ---------------------------------------------------------------------------------- |
| 跨域（CORS）错误             | 前端与服务端同源策略冲突     | 确保 `VITE_API_BASE` 指向同源或配置代理                                          |
| 混合内容警告                 | `https` 请求 `http` 资源 | 统一协议（全部 `https` 或全部 `http`）                                         |
| `import.meta.env` 类型错误 | TypeScript 缺少 Vite 类型    | 执行 `npm install` 并重启编辑器                                                  |
| AI 填充返回空白              | API 密钥无效或网络错误       | 检查 `.env.local` 配置与网络连接                                                 |
| JSON 导入失败                | 文件格式不规范               | 确保导出的 JSON 包含 `bookmarks`、`categories`、`adminPassword` 三个顶级字段 |

---

## 📦 数据模型

```typescript
// 书签
interface Bookmark {
  id: string;                // 唯一标识
  title: string;             // 网站标题
  url: string;               // 网站链接
  description: string;       // 简要描述
  category: string;          // 分类 ID
  tags: string[];            // 标签（可选）
  icon?: string;             // 图标（保留字段）
}

// 分类
interface Category {
  id: string;                // 分类 ID（'all' 为保底分类）
  name: string;              // 分类名称
  icon: string;              // lucide-react 图标名
}
```

---

## 🚢 部署指南

### 前端静态部署

前端构建产物位于 `dist/`，可直接部署到：

- **Vercel / Netlify**：支持自动部署（连接 GitHub）
- **Nginx / Apache**：作为静态资源服务
- **CDN**：支持边缘缓存加速

### 服务端部署

服务端 Express 应用可部署到：

- **自托管服务器**：`npm run server`（后台运行或 PM2 管理）
- **云函数**：改造为 Serverless 入口
- **Docker**：编写 Dockerfile 容器化

### 跨域部署示例

若前端与服务端不同域，前端设置：

```env
VITE_API_BASE=https://api.yourdomain.com/api
```

---

## 📄 许可与致谢

本项目初由 **Google Gemini** AI 模型生成，后续由开发者持续维护与优化。欢迎提交 Issue 和 Pull Request！

---

## 📞 支持

遇到问题或有建议？欢迎通过以下方式反馈：

- 提交 GitHub Issue
- 发送邮件至项目维护者
- 在项目讨论区留言
