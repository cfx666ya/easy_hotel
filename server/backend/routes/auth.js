const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/database');
require('dotenv').config();

// 注册
router.post('/register', async (req, res) => {
  const { username, password, email, role } = req.body;
  if (!username || !password || !email) return res.status(400).json({ message: '请填写完整信息' });
  if (!['merchant', 'admin'].includes(role)) return res.status(400).json({ message: '角色无效' });

  try {
    const [exist] = await pool.query('SELECT id FROM users WHERE username=? OR email=?', [username, email]);
    if (exist.length > 0) return res.status(409).json({ message: '用户名或邮箱已存在' });

    const hashed = await bcrypt.hash(password, 10);
    await pool.query('INSERT INTO users (username, password, email, role) VALUES (?,?,?,?)', [username, hashed, email, role || 'merchant']);
    res.json({ message: '注册成功' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// 登录
router.post('/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ message: '请填写用户名和密码' });

  try {
    const [users] = await pool.query('SELECT * FROM users WHERE username=?', [username]);
    if (users.length === 0) return res.status(401).json({ message: '用户名或密码错误' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(401).json({ message: '用户名或密码错误' });

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      process.env.JWT_SECRET || 'hotel_secret_key',
      { expiresIn: '24h' }
    );
    res.json({ token, user: { id: user.id, username: user.username, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

module.exports = router;
