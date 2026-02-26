# 商户管理系统（PC 端）

## 技术栈

- **前端**: React 18 + React Router v6
- **后端**: Node.js + Express + WebSocket (ws)
- **数据库**: MySQL 8+
- **鉴权**: JWT
- **图片上传**: Multer（本地存储）

## 目录结构

```
hotel-system/
├── backend/
│   ├── config/
│   │   ├── database.js       # 数据库连接配置
│   │   └── init.sql          # 数据库初始化（一次性执行）
│   ├── middleware/
│   │   └── auth.js           # JWT 鉴权中间件
│   ├── routes/
│   │   ├── auth.js           # 登录 / 注册
│   │   ├── hotels.js         # 酒店 CRUD + 审核
│   │   └── mobile.js         # 移动端专用接口（数据格式适配）
│   ├── uploads/              # 图片上传目录（自动创建）
│   ├── ws.js                 # WebSocket 服务
│   ├── server.js
│   ├── .env.example
│   └── package.json
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── Login.js          # 登录页
    │   │   ├── Register.js       # 注册页
    │   │   ├── Dashboard.js      # 首页统计
    │   │   ├── HotelForm.js      # 酒店录入 / 编辑表单
    │   │   ├── MerchantHotels.js # 商户酒店列表
    │   │   └── AdminHotels.js    # 管理员审核页
    │   ├── components/
    │   │   └── ImageUploader.js  # 图片上传组件（支持拖拽）
    │   ├── hooks/
    │   │   └── useWebSocket.js   # WebSocket Hook（全局单例）
    │   ├── contexts/
    │   │   └── AuthContext.js    # 全局登录状态
    │   └── utils/
    │       └── api.js            # Axios 封装
    └── package.json
```

## 快速启动

### 第一步：初始化数据库

在 Navicat 或 MySQL 命令行中执行：

```bash
mysql -u root -p < backend/config/init.sql
```

执行完成后会自动创建数据库、表结构，并插入默认管理员账号。

### 第二步：配置后端环境变量

```bash
cd backend
cp .env.example .env
```

编辑 `.env` 文件，填入你的数据库信息：

```env
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=你的数据库密码
DB_NAME=hotel_system
JWT_SECRET=your_jwt_secret
PORT=3001
```

### 第三步：启动后端

```bash
cd backend
npm install
npm run dev
```

启动成功后终端显示：
```
WebSocket 服务已启动，路径：/ws
Server running on http://localhost:3001
```

### 第四步：启动前端

```bash
cd frontend
npm install
npm start
```

### 访问地址

| 服务 | 地址 |
|------|------|
| 前端管理系统 | http://localhost:3000 |
| 后端 API | http://localhost:3001 |
| 移动端接口前缀 | http://localhost:3001/api/mobile |
| WebSocket | ws://localhost:3001/ws |

## 默认账号

| 账号 | 密码 | 角色 |
|------|------|------|
| admin | password | 管理员 |

商户账号请通过注册页面自行注册，注册时选择"商户"角色。

## API 接口

### 认证接口

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| POST | /api/auth/register | 注册 | 公开 |
| POST | /api/auth/login | 登录 | 公开 |

### 酒店接口（管理端）

| 方法 | 路径 | 说明 | 权限 |
|------|------|------|------|
| GET | /api/hotels | 获取酒店列表 | 登录 |
| GET | /api/hotels/:id | 获取酒店详情 | 登录 |
| POST | /api/hotels | 新增酒店 | 商户 |
| PUT | /api/hotels/:id | 编辑酒店 | 商户 |
| DELETE | /api/hotels/:id | 删除酒店 | 商户 |
| PATCH | /api/hotels/:id/review | 审核通过 / 拒绝 | 管理员 |
| PATCH | /api/hotels/:id/offline | 下线酒店 | 管理员 |
| PATCH | /api/hotels/:id/restore | 恢复发布 | 管理员 |

### 移动端接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | /api/mobile/hotels | 获取已发布酒店列表（支持筛选/分页） |
| GET | /api/mobile/hotels/:id | 获取酒店详情 |
| GET | /api/mobile/cities | 获取城市列表 |
| GET | /api/mobile/price-range | 获取价格范围 |
| GET | /api/mobile/hotel-count | 获取酒店总数 |
| GET | /api/mobile/banners | 获取 Banner 数据 |

### 图片上传接口

| 方法 | 路径 | 说明 | 限制 |
|------|------|------|------|
| POST | /api/upload | 上传多张酒店图片 | 最多10张，每张≤5MB |
| POST | /api/upload/single | 上传单张房型图片 | 每张≤5MB |

支持格式：jpg / png / gif / webp，图片存储于 `backend/uploads/` 目录。

## 功能说明

### 商户功能
- 注册商户账号，登录后自动识别角色
- **新增酒店**：填写中英文名称、地址、星级、价格区间、开业时间、设施、房型、周边信息、经纬度，支持拖拽上传图片
- **保存草稿**：信息未填完时可先保存草稿，不进入审核队列，随时继续编辑
- **提交审核**：草稿完善后一键提交，等待管理员审核
- **已发布酒店可编辑**：修改后自动重新进入审核流程
- **实时通知**：管理员审核/下线操作后，商户页面通过 WebSocket 即时收到通知横幅，无需手动刷新

### 管理员功能
- 查看全部酒店，按状态筛选（草稿不可见）
- 点击酒店名称查看完整详情（含图片、房型、周边信息）
- 审核通过 / 拒绝（拒绝需填写原因，商户可查看）
- 将已发布酒店下线（软删除，可恢复）
- 恢复已下线酒店重新发布

### 实时通信（WebSocket）
- 基于 `ws` 库实现，前端使用全局单例连接，避免页面切换反复重连
- 管理员执行审核、下线、恢复操作时，后端主动推送消息给对应商户
- 断线后自动重连（5秒间隔）

### 移动端数据适配
- `/api/mobile` 接口将数据库字段自动转换为移动端所需格式
- 自动识别品牌（希尔顿、万豪等）、从设施推断主题特性（度假、商务等）
- 评分根据星级自动计算，图片路径自动补全为完整 URL
- 房型按价格从低到高排序

## 数据说明

### 酒店状态流转

```
draft（草稿）→ pending（待审核）→ approved（已发布）
                              ↘ rejected（已拒绝）→ pending（重新提交）
                                approved → offline（已下线）→ approved（恢复）
```

### 房型数据结构（存储于 room_types 字段，JSON 格式）

```json
[
  {
    "name": "标准大床房",
    "price": 399,
    "total_rooms": 20,
    "description": "40㎡，可住2人，含早餐，落地窗江景",
    "image": "/uploads/xxx.jpg"
  }
]
```
