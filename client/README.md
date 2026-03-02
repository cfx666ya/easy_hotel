## 📋 文档内容

### 1. 项目简介

- 这是一个基于 React + Vite 构建的移动端酒店预订应用
- 提供酒店搜索、筛选、详情查看等功能
- 支持地理定位、城市选择、日期选择等交互

### 2. 技术栈

**核心框架：**

- React 19.2.0 - UI 框架
- Vite 7.3.1 - 构建工具
- React Router DOM 7.13.0 - 路由管理

**UI 组件库：**

- Ant Design Mobile 5.42.3 - 移动端组件库
- React Vant 3.3.5 - 移动端组件
- Ant Design 6.3.0 - PC 端组件库

**工具库：**

- Axios 1.13.5 - HTTP 请求
- Day.js 1.11.19 - 日期处理
- PostCSS + postcss-pxtorem - 移动端适配

### 3. 项目结构

```
client/
├── public/                    # 静态资源
├── src/
│   ├── api/                  # API 接口
│   │   ├── hotel.js         # 酒店相关接口
│   │   └── location.js      # 定位相关接口
│   ├── assets/              # 资源文件
│   ├── components/          # 公共组件
│   │   ├── CitySelectPage.jsx      # 城市选择页
│   │   ├── DatePickerModal.jsx     # 日期选择器
│   │   ├── DateRangeBar.jsx        # 日期范围条
│   │   ├── GuestPanel.jsx          # 客人选择面板
│   │   ├── HotelCard.jsx           # 酒店卡片
│   │   ├── LevelPanel.jsx          # 星级面板
│   │   ├── PriceLevelPanel.jsx     # 价格等级面板
│   │   └── PricePanel.jsx          # 价格面板
│   ├── hooks/               # 自定义 Hooks
│   │   └── useDebounce.jsx  # 防抖 Hook
│   ├── pages/               # 页面组件
│   │   ├── Home/           # 首页
│   │   ├── HotelList/      # 酒店列表页
│   │   ├── HotelDetail/    # 酒店详情页
│   │   └── SearchPage/     # 搜索页
│   ├── router/             # 路由配置
│   │   └── index.jsx
│   ├── store/              # 状态管理
│   │   └── searchStore.js  # 搜索状态
│   ├── utils/              # 工具函数
│   │   ├── hotelQuery.js   # 酒店查询工具
│   │   ├── request.js      # 请求封装
│   │   └── transStarKeys.js # 星级转换
│   ├── App.jsx             # 根组件
│   ├── main.jsx            # 入口文件
│   └── index.css           # 全局样式
├── .env.development         # 开发环境变量
├── vite.config.js          # Vite 配置
├── postcss.config.js       # PostCSS 配置
├── eslint.config.js        # ESLint 配置
└── package.json            # 项目依赖
```

### 4. 功能特性

- 🏠 首页轮播展示
- 📍 地理定位与城市选择
- 🔍 酒店搜索与筛选
- 📅 日期范围选择
- 👥 客人数量选择
- ⭐ 星级筛选
- 💰 价格区间筛选
- 🏨 酒店详情查看
- 🛏️ 房间列表展示

### 5. 运行方式

**环境要求：**

- Node.js >= 16.0.0
- npm 或 yarn

**安装依赖：**

```bash
npm install
```

**开发模式：**

```bash
npm run dev
```

访问 `http://localhost:5173`（默认端口）

**生产构建：**

```bash
npm run build
```

**预览构建结果：**

```bash
npm run preview
```

**代码检查：**

```bash
npm run lint
```

### 6. 环境配置

项目使用 [`.env.development`](.env.development:1) 配置开发环境变量：

- `VITE_BASE_URL`: API 基础路径
- `VITE_AMAP_KEY`: 高德地图 API Key

### 7. 代理配置

开发环境通过 [`vite.config.js`](vite.config.js:8) 配置代理：

```javascript
proxy: {
  '/api': {
    target: 'http://localhost:3000',
    changeOrigin: true,
  }
}
```

### 8. 移动端适配

使用 `postcss-pxtorem` 实现移动端适配，配置在 [`postcss.config.js`](postcss.config.js:1)：

- rootValue: 37.5
- 自动将 px 转换为 rem

### 9. 路由配置

主要路由包括：

- `/` - 首页
- `/hotel-list` - 酒店列表
- `/hotel-detail/:id` - 酒店详情
- `/city-select` - 城市选择
- `/search` - 搜索页

所有路由使用懒加载优化性能。
