const jwt = require('jsonwebtoken');
require('dotenv').config();

const auth = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: '未登录，请先登录' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'hotel_secret_key');
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({ message: 'Token无效或已过期' });
  }
};

const adminOnly = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: '权限不足，需要管理员权限' });
  next();
};

const merchantOnly = (req, res, next) => {
  if (req.user.role !== 'merchant') return res.status(403).json({ message: '权限不足' });
  next();
};

module.exports = { auth, adminOnly, merchantOnly };
