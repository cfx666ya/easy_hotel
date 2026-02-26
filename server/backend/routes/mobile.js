const express = require('express');
const router = express.Router();
const pool = require('../config/database');

const BASE_URL = process.env.BASE_URL || '';

// 已知品牌列表，从酒店名自动匹配
const KNOWN_BRANDS = ['希尔顿', '万豪', '如家', '全季', '香格里拉', '喜来登', '洲际', '凯宾斯基', '威斯汀', '雅高', '锦江', '华住', '四季', '丽思卡尔顿', '安缦', '凯悦', '索菲特', '温德姆'];

// 设施关键词 → 主题特性映射
const FACILITY_THEME_MAP = {
  '游泳池': '度假', '泳池': '度假',
  'SPA': '度假', '健身房': '商务',
  '会议室': '商务', '儿童设施': '亲子',
  '海景': '海景', '停车场': '自驾',
  '电竞': '电竞', 
};

function tryParse(str, fallback) {
  try { return JSON.parse(str) || fallback; } catch { return fallback; }
}

function autoDetectBrand(name) {
  if (!name) return '';
  return KNOWN_BRANDS.find(b => name.includes(b)) || '';
}

function autoDetectThemes(facilities = [], description = '') {
  const themes = new Set();
  facilities.forEach(f => {
    if (FACILITY_THEME_MAP[f]) themes.add(FACILITY_THEME_MAP[f]);
  });
  if (description.includes('亲子') || description.includes('儿童')) themes.add('亲子');
  if (description.includes('商务')) themes.add('商务');
  if (description.includes('度假')) themes.add('度假');
  if (description.includes('浪漫')) themes.add('浪漫');
  return [...themes];
}

// 把数据库酒店数据转换成移动端期望的格式
function formatHotel(h) {
  const images = tryParse(h.images, []);
  const roomTypes = tryParse(h.room_types, []);
  const facilities = tryParse(h.facilities, []);

  // 图片转完整URL
  const fullImages = images.map(url =>
    url.startsWith('http') ? url : BASE_URL + url
  );

  // 房型转换，价格从低到高排序
  const rooms = roomTypes
    .map(r => ({
      name: r.name || '',
      price: Number(r.price) || 0,
      totalRooms: Number(r.total_rooms) || 0,
      description: r.description || '',
      image: r.image ? (r.image.startsWith('http') ? r.image : BASE_URL + r.image) : '',
    }))
    .sort((a, b) => a.price - b.price);

  // 自动提取房型名列表（供筛选用）
  const roomTypeNames = rooms.map(r => r.name).filter(Boolean);

  // 自动检测品牌
  const brand = autoDetectBrand(h.name);

  // 自动生成主题特性
  const themeFeatures = autoDetectThemes(facilities, h.description || '');

  // 评分：根据星级和id自动计算
  const score = Number(
    Math.min(
      3.8 + (h.star_level || 0) * 0.25 +
      ((h.id || 0) % 5) * 0.05,
      5
    ).toFixed(1)
  );

  return {
    id: h.id,
    name: { cn: h.name || '', en: h.name_en || '' },
    address: h.address || '',
    city: h.city || '',
    province: h.province || '',
    phone: h.phone || '',
    starRating: h.star_level || 0,
    price: Number(h.price_range_min) || 0,
    priceMax: Number(h.price_range_max) || 0,
    openDate: h.open_date || '',
    description: h.description || '',
    facilities,
    hotelImages: fullImages,
    rooms,
    roomTypes: roomTypeNames,
    nearbyInfo: h.nearby_info || '',
    score,
    brand,
    themeFeatures,
    lat: h.lat ? Number(h.lat) : null,
    lng: h.lng ? Number(h.lng) : null,
    status: h.status,
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  };
}

// ==================== 酒店列表（支持移动端所有筛选参数） ====================
router.get('/hotels', async (req, res) => {
  try {
    const {
      cursor = 0, limit = 10,
      city, keyword,
      minPrice, maxPrice,
      starMin, starMax,
      facility, sortBy,
    } = req.query;

    // 只返回已发布的酒店（LEFT JOIN 避免 merchant 被删导致查不到）
    let sql = 'SELECT h.*, u.username as merchant_name FROM hotels h LEFT JOIN users u ON h.merchant_id=u.id WHERE h.status="approved"';
    const params = [];

    if (city) {
      sql += ' AND h.city LIKE ?';
      params.push(`%${city}%`);
    }
    if (keyword) {
      sql += ' AND (h.name LIKE ? OR h.name_en LIKE ? OR h.address LIKE ? OR h.city LIKE ?)';
      params.push(`%${keyword}%`, `%${keyword}%`, `%${keyword}%`, `%${keyword}%`);
    }
    if (minPrice) {
      sql += ' AND h.price_range_min >= ?';
      params.push(Number(minPrice));
    }
    if (maxPrice) {
      sql += ' AND h.price_range_min <= ?';
      params.push(Number(maxPrice));
    }
    if (starMin) {
      sql += ' AND h.star_level >= ?';
      params.push(Number(starMin));
    }
    if (starMax) {
      sql += ' AND h.star_level <= ?';
      params.push(Number(starMax));
    }

    // 排序
    switch (sortBy) {
      case 'price_asc': sql += ' ORDER BY h.price_range_min ASC'; break;
      case 'price_desc': sql += ' ORDER BY h.price_range_min DESC'; break;
      case 'star_desc': sql += ' ORDER BY h.star_level DESC'; break;
      default: sql += ' ORDER BY h.updated_at DESC';
    }

    const [all] = await pool.query(sql, params);

    // 设施筛选（JSON字段，在内存里过滤）
    let filtered = all;
    if (facility) {
      const facilityList = facility.split(',').map(f => f.trim());
      filtered = all.filter(h => {
        const hFacilities = tryParse(h.facilities, []);
        return facilityList.some(f => hFacilities.includes(f));
      });
    }

    // 总数
    const total = filtered.length;

    // 游标分页
    const start = Number(cursor) || 0;
    const pageSize = Number(limit) || 10;
    const paged = filtered.slice(start, start + pageSize);
    const nextCursor = paged.length > 0 ? start + paged.length : null;
    const hasMore = total > start + paged.length;

    res.json({
      list: paged.map(formatHotel),
      total,
      nextCursor,
      hasMore,
    });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// ==================== 酒店详情 ====================
router.get('/hotels/:id', async (req, res) => {
  try {
    const [hotels] = await pool.query(
      'SELECT h.*, u.username as merchant_name FROM hotels h LEFT JOIN users u ON h.merchant_id=u.id WHERE h.id=? AND h.status="approved"',
      [req.params.id]
    );
    if (hotels.length === 0) return res.status(404).json({ message: '酒店不存在或未发布' });
    res.json(formatHotel(hotels[0]));
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// ==================== 酒店数量 ====================
router.get('/hotel-count', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT COUNT(*) as total FROM hotels WHERE status="approved"');
    res.json({ total: result[0].total });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// ==================== 城市列表 ====================
router.get('/cities', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT DISTINCT city FROM hotels WHERE status="approved" ORDER BY city');
    res.json(result.map(r => r.city));
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// ==================== 价格范围 ====================
router.get('/price-range', async (req, res) => {
  try {
    const [result] = await pool.query('SELECT MIN(price_range_min) as min, MAX(price_range_max) as max FROM hotels WHERE status="approved"');
    res.json({ min: result[0].min || 0, max: result[0].max || 9999 });
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

// ==================== Banner（取最新3条已发布酒店） ====================
router.get('/banners', async (req, res) => {
  try {
    const [hotels] = await pool.query(
      'SELECT id, name, name_en, images FROM hotels WHERE status="approved" ORDER BY updated_at DESC LIMIT 5'
    );
    const banners = hotels.map(h => {
      const images = tryParse(h.images, []);
      const firstImage = images[0] ? (images[0].startsWith('http') ? images[0] : BASE_URL + images[0]) : '';
      return {
        id: h.id,
        hotelId: h.id,
        title: h.name,
        titleEn: h.name_en,
        image: firstImage,
      };
    });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: '服务器错误', error: err.message });
  }
});

module.exports = router;