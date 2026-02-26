const express = require('express');
const router = express.Router();
const pool = require('../config/database');
const { auth, adminOnly } = require('../middleware/auth');
const { notifyMerchant } = require('../ws');

function tryParse(str, fallback) {
  try { return JSON.parse(str) || fallback; } catch { return fallback; }
}

function parseHotel(h) {
  return {
    ...h,
    facilities: tryParse(h.facilities, []),
    images: tryParse(h.images, []),
    room_types: tryParse(h.room_types, []),
  };
}

// 获取酒店列表
router.get('/', auth, async (req, res) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    let query, params, countQuery, countParams;

    if (req.user.role === 'admin') {
      const where = status ? 'WHERE h.status=?' : '';
      query = `SELECT h.*, u.username as merchant_name FROM hotels h JOIN users u ON h.merchant_id=u.id ${where} ORDER BY h.updated_at DESC LIMIT ? OFFSET ?`;
      params = status ? [status, parseInt(limit), offset] : [parseInt(limit), offset];
      countQuery = status ? 'SELECT COUNT(*) as total FROM hotels WHERE status=?' : 'SELECT COUNT(*) as total FROM hotels';
      countParams = status ? [status] : [];
    } else {
      const where = status ? 'WHERE merchant_id=? AND status=?' : 'WHERE merchant_id=?';
      query = `SELECT * FROM hotels ${where} ORDER BY updated_at DESC LIMIT ? OFFSET ?`;
      params = status ? [req.user.id, status, parseInt(limit), offset] : [req.user.id, parseInt(limit), offset];
      countQuery = status ? 'SELECT COUNT(*) as total FROM hotels WHERE merchant_id=? AND status=?' : 'SELECT COUNT(*) as total FROM hotels WHERE merchant_id=?';
      countParams = status ? [req.user.id, status] : [req.user.id];
    }

    const [hotels] = await pool.query(query, params);
    const [count] = await pool.query(countQuery, countParams);

    res.json({ hotels: hotels.map(parseHotel), total: count[0].total, page: parseInt(page), limit: parseInt(limit) });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// 获取单个酒店
router.get('/:id', auth, async (req, res) => {
  try {
    const [hotels] = await pool.query('SELECT h.*, u.username as merchant_name FROM hotels h JOIN users u ON h.merchant_id=u.id WHERE h.id=?', [req.params.id]);
    if (hotels.length === 0) return res.status(404).json({ message: '酒店不存在' });
    const hotel = hotels[0];
    if (req.user.role !== 'admin' && hotel.merchant_id !== req.user.id) return res.status(403).json({ message: '无权查看' });
    res.json(parseHotel(hotel));
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// 新增酒店（商户）
router.post('/', auth, async (req, res) => {
  if (req.user.role !== 'merchant') return res.status(403).json({ message: '只有商户可以添加酒店' });
  const { name, name_en, address, city, province, phone, email, website, open_date, star_level, price_range_min, price_range_max, description, facilities, images, room_types, nearby_info, lat, lng, is_draft } = req.body;
  
  // 草稿不强制要求必填，提交审核才需要
  if (!is_draft && (!name || !address || !city || !province)) return res.status(400).json({ message: '请填写必填信息' });
  if (!name) return res.status(400).json({ message: '酒店名称不能为空' });

  const status = is_draft ? 'draft' : 'pending';

  try {
    const [result] = await pool.query(
      'INSERT INTO hotels (name, name_en, address, city, province, phone, email, website, open_date, star_level, price_range_min, price_range_max, description, facilities, images, room_types, nearby_info, lat, lng, merchant_id, status) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)',
      [name, name_en||'', address||'', city||'', province||'', phone||'', email||'', website||'', open_date||'', star_level||0, price_range_min||null, price_range_max||null, description||'',
       JSON.stringify(facilities||[]), JSON.stringify(images||[]), JSON.stringify(room_types||[]), nearby_info||'', lat||null, lng||null, req.user.id, status]
    );
    res.json({ message: is_draft ? '草稿已保存' : '提交成功，等待管理员审核', id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// 编辑酒店 - 已发布的也可以修改，改后重新变为pending
router.put('/:id', auth, async (req, res) => {
  try {
    const [hotels] = await pool.query('SELECT * FROM hotels WHERE id=?', [req.params.id]);
    if (hotels.length === 0) return res.status(404).json({ message: '酒店不存在' });
    const hotel = hotels[0];
    if (req.user.role !== 'admin' && hotel.merchant_id !== req.user.id) return res.status(403).json({ message: '无权修改' });

    const { name, name_en, address, city, province, phone, email, website, open_date, star_level, price_range_min, price_range_max, description, facilities, images, room_types, nearby_info, lat, lng, is_draft } = req.body;

    // 草稿不校验必填，提交审核才校验
    if (!is_draft && (!name || !address || !city || !province)) return res.status(400).json({ message: '请填写必填信息' });
    if (!name) return res.status(400).json({ message: '酒店名称不能为空' });

    // 草稿保存为draft，提交审核变为pending，管理员操作保持原状态
    let newStatus;
    if (req.user.role === 'merchant') {
      newStatus = is_draft ? 'draft' : 'pending';
    } else {
      newStatus = hotel.status;
    }

    await pool.query(
      'UPDATE hotels SET name=?, name_en=?, address=?, city=?, province=?, phone=?, email=?, website=?, open_date=?, star_level=?, price_range_min=?, price_range_max=?, description=?, facilities=?, images=?, room_types=?, nearby_info=?, lat=?, lng=?, status=?, reject_reason=NULL WHERE id=?',
      [name, name_en||'', address||'', city||'', province||'', phone||'', email||'', website||'', open_date||'', star_level||0, price_range_min||null, price_range_max||null, description||'',
       JSON.stringify(facilities||[]), JSON.stringify(images||[]), JSON.stringify(room_types||[]), nearby_info||'', lat||null, lng||null, newStatus, req.params.id]
    );
    res.json({ message: is_draft ? '草稿已保存' : '更新成功，已重新提交审核' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// 审核（管理员）
router.patch('/:id/review', auth, adminOnly, async (req, res) => {
  const { action, reject_reason } = req.body;
  if (!['approve', 'reject'].includes(action)) return res.status(400).json({ message: 'action必须是approve或reject' });
  try {
    const status = action === 'approve' ? 'approved' : 'rejected';
    const [hotels] = await pool.query('SELECT * FROM hotels WHERE id=?', [req.params.id]);
    if (hotels.length === 0) return res.status(404).json({ message: '酒店不存在' });

    await pool.query('UPDATE hotels SET status=?, reject_reason=? WHERE id=?', [status, reject_reason||null, req.params.id]);

    // WebSocket 实时通知商户
    notifyMerchant(hotels[0].merchant_id, {
      hotelId: hotels[0].id,
      hotelName: hotels[0].name,
      status,
      rejectReason: reject_reason || null,
      message: action === 'approve'
        ? `您的酒店「${hotels[0].name}」已审核通过，正式发布！`
        : `您的酒店「${hotels[0].name}」审核未通过，原因：${reject_reason}`
    });

    res.json({ message: action === 'approve' ? '审核通过，已发布' : '已拒绝' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// 下线
router.patch('/:id/offline', auth, adminOnly, async (req, res) => {
  try {
    const [hotels] = await pool.query('SELECT * FROM hotels WHERE id=?', [req.params.id]);
    if (hotels.length === 0) return res.status(404).json({ message: '酒店不存在' });
    await pool.query('UPDATE hotels SET status=? WHERE id=?', ['offline', req.params.id]);
    notifyMerchant(hotels[0].merchant_id, {
      hotelId: hotels[0].id,
      hotelName: hotels[0].name,
      status: 'offline',
      message: `您的酒店「${hotels[0].name}」已被管理员下线`
    });
    res.json({ message: '已下线' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// 恢复
router.patch('/:id/restore', auth, adminOnly, async (req, res) => {
  try {
    const [hotels] = await pool.query('SELECT * FROM hotels WHERE id=?', [req.params.id]);
    if (hotels.length === 0) return res.status(404).json({ message: '酒店不存在' });
    await pool.query('UPDATE hotels SET status=? WHERE id=?', ['approved', req.params.id]);
    notifyMerchant(hotels[0].merchant_id, {
      hotelId: hotels[0].id,
      hotelName: hotels[0].name,
      status: 'approved',
      message: `您的酒店「${hotels[0].name}」已恢复发布`
    });
    res.json({ message: '已恢复发布' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// 删除
router.delete('/:id', auth, async (req, res) => {
  try {
    const [hotels] = await pool.query('SELECT * FROM hotels WHERE id=?', [req.params.id]);
    if (hotels.length === 0) return res.status(404).json({ message: '酒店不存在' });
    if (req.user.role !== 'admin' && hotels[0].merchant_id !== req.user.id) return res.status(403).json({ message: '无权删除' });
    await pool.query('DELETE FROM hotels WHERE id=?', [req.params.id]);
    res.json({ message: '删除成功' });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

module.exports = router;
