const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { auth } = require('../middleware/auth');

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// multer 配置
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const name = Date.now() + '-' + Math.round(Math.random() * 1e6) + ext;
    cb(null, name);
  }
});

const fileFilter = (req, file, cb) => {
  const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
  if (allowed.includes(file.mimetype)) cb(null, true);
  else cb(new Error('只支持 JPG/PNG/WEBP/GIF 格式'), false);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

// 单张图片上传
router.post('/image', auth, upload.single('image'), (req, res) => {
  if (!req.file) return res.status(400).json({ message: '请选择图片' });
  const url = `/uploads/${req.file.filename}`;
  res.json({ url, message: '上传成功' });
});

// 多张图片上传
router.post('/images', auth, upload.array('images', 10), (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ message: '请选择图片' });
  const urls = req.files.map(f => `/uploads/${f.filename}`);
  res.json({ urls, message: '上传成功' });
});

module.exports = router;
