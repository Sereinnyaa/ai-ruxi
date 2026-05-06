# AI入戏

**和剧中人面对面** — 基于《漫长的季节》的沉浸式角色对话体验。

## 技术栈

- React 18 + React Router 6
- Tailwind CSS 3
- Vite 5
- DeepSeek API（流式对话）

## 快速开始

```bash
cp .env.example .env          # 复制环境变量模板
# 编辑 .env，填入你的 DeepSeek API Key
npm install
npm run dev                   # 监听 0.0.0.0:5173，局域网可访问
```

生产构建：

```bash
npm run build     # 生产构建输出到 dist/
npm run preview   # 预览构建结果
```

## 外部访问

`npm run dev` 默认绑定 `0.0.0.0`，同一局域网下通过本机 IP + 端口 5173 即可访问。

## 页面说明

### 首页 `/`

- 顶部展示剧名标签「漫长的季节」
- 产品名称 **AI入戏**，副标题「和剧中人面对面」
- 点击「进入体验」按钮跳转至选角页
- 深色背景 + 金色点缀，带颗粒噪点电影质感

### 选角页 `/characters`

- 三张角色卡片横向排列：**沈墨**、**王阳**、**傅卫军**，使用真实角色照片
- 每张卡片包含圆形头像、角色名、一句话简介
- 仅沈墨卡片可点击进入场景页（金色高亮 hover 效果）
- 王阳、傅卫军显示锁定图标，标注「即将开放」

### 场景页 `/scenes/:characterId`

- 展示沈墨的三个剧情时间节点：**河边夜话**（1998·秋）、**桦林往事**（1998·夏）、**最后的抉择**（1998·冬）
- 每张节点卡片包含场景插画占位、标题、时间标签、文字描述
- 点击进入对应场景的体验页

### 体验页 `/experience/:characterId/:sceneId`

- **左侧上**：视频/图片占位区域，标注「视频即将上线」
- **左侧下**：AI 旁白文字区，展示沈墨第一人称内心独白（不同场景对应不同独白内容）
- **右侧**：对话区，标题「问问她」
  - 底部输入框 + 发送按钮，支持 Enter 发送
  - 对话历史气泡展示（用户消息右对齐金色边框，AI 回复左对齐带「沈墨」标签）
  - AI 回复通过 DeepSeek API 流式生成，实时逐字显示

## 项目结构

```
src/
├── main.jsx              # 入口，BrowserRouter
├── App.jsx               # 路由定义
├── index.css             # Tailwind 指令 + 全局样式（噪点纹理、滚动条、字体）
└── pages/
    ├── Home.jsx          # 首页
    ├── CharacterSelect.jsx  # 选角页
    ├── Scene.jsx         # 场景页
    └── Experience.jsx    # 体验页
```

## 环境变量

| 变量 | 说明 |
|------|------|
| `VITE_DEEPSEEK_API_KEY` | DeepSeek API Key |

在 `.env` 文件中配置：

```
VITE_DEEPSEEK_API_KEY=sk-your-api-key-here
```

## 当前状态

前端页面及路由全部完成。体验页通过 DeepSeek API 实现角色对话，流式输出回复。未接入 API 时对话功能不可用，其余数据均为前端硬编码。
