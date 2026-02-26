const express = require('express');
const cors = require('cors');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const http = require('http');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 静态文件服务
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
app.use('/uploads', express.static(uploadsDir));

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.random().toString(36).slice(2) + ext;
    cb(null, name);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|gif|webp/;
    const ok = allowed.test(file.mimetype) && allowed.test(path.extname(file.originalname).toLowerCase());
    ok ? cb(null, true) : cb(new Error('只支持图片格式（jpg/png/gif/webp）'));
  }
});

const { auth } = require('./middleware/auth');

// 图片上传接口
app.post('/api/upload', auth, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: '没有上传文件' });
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ urls, message: '上传成功' });
});

app.post('/api/upload/single', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: '没有上传文件' });
  res.json({ url: `/uploads/${req.file.filename}`, message: '上传成功' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/hotels', require('./routes/hotels'));
app.use('/api/mobile', require('./routes/mobile'));

app.get('/api/health', (req, res) => res.json({ status: 'ok', time: new Date() }));

// 创建 HTTP server 并挂载 WebSocket
const server = http.createServer(app);
const { initWebSocket } = require('./ws');
initWebSocket(server);

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
