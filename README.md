# AI入戏

**和剧中人面对面** — 基于《漫长的季节》的沉浸式角色对话体验。选择一段回忆，走进沈墨的世界，听她的内心独白，和她对话。

## 技术栈

- React 18 + React Router 6
- Tailwind CSS 3
- Vite 5
- DeepSeek API（流式对话）
- 豆包 TTS（语音朗读独白与回复）
- Vercel Serverless Functions（API 代理）

## 快速开始

```bash
cp .env.example .env          # 复制环境变量模板
# 编辑 .env，填入 API Key
npm install
npm run dev                   # 监听 0.0.0.0:5173
```

## 环境变量

开发环境在 `.env` 中配置，生产环境在 Vercel 后台配置。

| 变量 | 说明 |
|------|------|
| `DEEPSEEK_API_KEY` | DeepSeek API Key |
| `DOUBAO_TTS_API_KEY` | 豆包 TTS API Key |
| `DOUBAO_TTS_RESOURCE_ID` | 豆包 TTS 资源 ID |

注意：API Key 存储在服务端，通过 Vercel Serverless Functions（`api/` 目录）代理请求，**不会暴露到浏览器**。

## 部署

本项目部署在 [Vercel](https://vercel.com)。

```bash
npm run build     # 生产构建输出到 dist/
npm run preview   # 预览构建结果
```

部署时需在 Vercel 项目设置中添加上述环境变量。

## 页面说明

### 首页 `/`

- 剧名标签「漫长的季节」
- 产品名称 **AI入戏**，副标题「和剧中人面对面」
- 点击「进入体验」进入选角页
- 深色电影质感背景

### 选角页 `/characters`

- 三张角色卡片：**沈墨**、**王阳**、**傅卫军**
- 沈墨可点击进入，王阳和傅卫军标注「即将开放」

### 场景页 `/scenes/:characterId`

- 三个剧情场景卡片：
  - **铁道约会**（1997·秋）— 王阳念诗，她说了那句话
  - **录像厅生日**（1998·春）— 军儿送她 BB 机
  - **河边送别**（1998·冬）— 那个改变一切的夜晚

### 体验页 `/experience/:characterId/:sceneId`

- **左侧上**：场景视频（静音播放，可手动开启声音）
- **左侧下**：沈墨第一人称内心独白（支持 TTS 语音朗读）
- **右侧**：AI 对话区 — 以沈墨的身份回答你的问题，流式实时生成，回复也支持语音朗读

## 项目结构

```
src/
├── main.jsx              # 入口
├── App.jsx               # 路由定义
├── index.css             # Tailwind + 全局样式
├── hooks/
│   └── useTTS.js         # 豆包 TTS 语音合成
└── pages/
    ├── Home.jsx          # 首页
    ├── CharacterSelect.jsx  # 选角页
    ├── Scene.jsx         # 场景页
    └── Experience.jsx    # 体验页（含 AI 对话）
api/
├── chat.js               # DeepSeek API 代理（Vercel Function）
└── tts.js                # 豆包 TTS 代理（Vercel Function）
```
