/**
 * Mock 数据（增强版）
 * 支持 HotelDetail 页面所需的酒店图片和房型信息
 */

const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());
// 托管 images 目录，使图片可通过 /images 路径访问
const path = require('path');
app.use('/images', express.static(path.join(__dirname, '../images')));

const PORT = 3000;

// ---------- 城市中心坐标（用于生成酒店经纬度） ----------
const CITY_CENTER = {
  上海: { lat: 31.2304, lng: 121.4737 },
  北京: { lat: 39.9042, lng: 116.4074 },
  广州: { lat: 23.1291, lng: 113.2644 },
  深圳: { lat: 22.5431, lng: 114.0579 },
  杭州: { lat: 30.2741, lng: 120.1551 },
  南京: { lat: 32.0603, lng: 118.7969 },
  成都: { lat: 30.5728, lng: 104.0668 },
};

// 城市拼音映射表
const cityMap = {
  上海: 'Shanghai',
  北京: 'Beijing',
  广州: 'Guangzhou',
  深圳: 'Shenzhen',
  杭州: 'Hangzhou',
  南京: 'Nanjing',
  成都: 'Chengdu',
};

// 中文品牌 → 英文品牌映射表（覆盖所有可能出现的中文品牌）
const brandMap = {
  希尔顿: 'Hilton',
  万豪: 'Marriott',
  如家: 'Home Inn',
  喜来登: 'Sheraton',
  香格里拉: 'Shangri-La',
  凯宾斯基: 'Kempinski',
  威斯汀: 'Westin',
  洲际: 'InterContinental',
  雅高: 'Accor',
  锦江: 'Jinjiang',
  王府半岛: 'Peninsula',
  中国大饭店: 'China World',
  昆仑: 'Kunlun',
  长富宫: 'Changfugong',
  贵宾楼: 'Guibinlou',
  四季: 'Four Seasons',
  丽思卡尔顿: 'The Ritz-Carlton',
  白天鹅: 'White Swan',
  花园: 'Garden',
  中国大酒店: 'China Hotel',
  瑞吉: 'St. Regis',
  君悦: 'Grand Hyatt',
  威尼斯: 'Venice',
  华侨城: 'OCT',
  西子湖四季: 'Four Seasons',
  安缦: 'Aman',
  索菲特: 'Sofitel',
  凯悦: 'Hyatt',
  温德姆: 'Wyndham',
  金陵: 'Jinling',
  圣和府邸: 'Shenghefudi',
  金奥费尔蒙: 'Fairmont',
  绿地洲际: 'InterContinental',
  华尔道夫: 'Waldorf Astoria',
  钓鱼台: 'Diaoyutai',
  博舍: 'The Temple House',
  尼依格罗: 'Niccolo',
};

/**
 * 生成酒店英文名称
 * @param {string} city - 城市中文名（如 '上海'）
 * @param {string} brand - 中文品牌名（如 '希尔顿'）
 * @returns {string} 英文名称（如 'Hilton Shanghai'）
 */
function generateEnglishName(city, brand) {
  const cityEn = cityMap[city];
  // 如果品牌有映射则使用，否则返回原中文（实际场景建议转拼音，此处简化）
  const brandEn = brandMap[brand] || brand;
  return `${brandEn} ${cityEn}`;
}

// ---------- POI 数据 ----------
const POI_LIST = [
  // 上海
  {
    id: 101,
    city: '上海',
    name: '外滩',
    type: 'sight',
    lat: 31.2389,
    lng: 121.4872,
  },
  {
    id: 102,
    city: '上海',
    name: '南京路步行街',
    type: 'business',
    lat: 31.2356,
    lng: 121.4745,
  },
  {
    id: 103,
    city: '上海',
    name: '迪士尼',
    type: 'sight',
    lat: 31.1432,
    lng: 121.6578,
  },
  {
    id: 104,
    city: '上海',
    name: '人民广场',
    type: 'hot',
    lat: 31.2323,
    lng: 121.4741,
  },
  {
    id: 105,
    city: '上海',
    name: '虹桥机场',
    type: 'station',
    lat: 31.1981,
    lng: 121.3353,
  },
  // 北京
  {
    id: 201,
    city: '北京',
    name: '天安门',
    type: 'hot',
    lat: 39.9055,
    lng: 116.3976,
  },
  {
    id: 202,
    city: '北京',
    name: '王府井',
    type: 'business',
    lat: 39.9139,
    lng: 116.4136,
  },
  {
    id: 203,
    city: '北京',
    name: '颐和园',
    type: 'sight',
    lat: 39.9996,
    lng: 116.2768,
  },
  {
    id: 204,
    city: '北京',
    name: '故宫',
    type: 'sight',
    lat: 39.9163,
    lng: 116.3972,
  },
  {
    id: 205,
    city: '北京',
    name: '首都机场',
    type: 'station',
    lat: 40.0799,
    lng: 116.6031,
  },
  // 广州
  {
    id: 301,
    city: '广州',
    name: '广州塔',
    type: 'hot',
    lat: 23.1065,
    lng: 113.3245,
  },
  {
    id: 302,
    city: '广州',
    name: '珠江新城',
    type: 'business',
    lat: 23.1264,
    lng: 113.3273,
  },
  // 深圳
  {
    id: 401,
    city: '深圳',
    name: '世界之窗',
    type: 'hot',
    lat: 22.5369,
    lng: 113.9745,
  },
  {
    id: 402,
    city: '深圳',
    name: '华强北',
    type: 'business',
    lat: 22.5455,
    lng: 114.085,
  },
  // 杭州
  {
    id: 501,
    city: '杭州',
    name: '西湖',
    type: 'hot',
    lat: 30.2503,
    lng: 120.1437,
  },
  {
    id: 502,
    city: '杭州',
    name: '灵隐寺',
    type: 'sight',
    lat: 30.2441,
    lng: 120.1021,
  },
  // 南京
  {
    id: 601,
    city: '南京',
    name: '夫子庙',
    type: 'hot',
    lat: 32.0219,
    lng: 118.7887,
  },
  {
    id: 602,
    city: '南京',
    name: '中山陵',
    type: 'sight',
    lat: 32.0584,
    lng: 118.8565,
  },
  // 成都
  {
    id: 701,
    city: '成都',
    name: '宽窄巷子',
    type: 'hot',
    lat: 30.6636,
    lng: 104.0629,
  },
  {
    id: 702,
    city: '成都',
    name: '春熙路',
    type: 'business',
    lat: 30.6594,
    lng: 104.0809,
  },
];

// ---------- 筛选选项常量 ----------
const THEME_FEATURES = [
  '亲子',
  '电竞',
  '四合院',
  '海景',
  '浪漫',
  '商务',
  '度假',
];
const BRANDS = [
  '希尔顿',
  '万豪',
  '如家',
  '全季',
  '香格里拉',
  '喜来登',
  '洲际',
  '凯宾斯基',
  '威斯汀',
  '雅高',
  '锦江',
  '华住',
];
const FACILITIES = [
  '停车场',
  '温泉',
  '洗衣房',
  '泳池',
  '健身房',
  'SPA',
  '会议室',
  '免费WiFi',
  '早餐',
  '接机',
];
const ROOM_TYPES = ['大床房', '双床房', '套房', '家庭房', '总统套房', '公寓'];

// 用于随机图片
const hotelImages = [
  'http://localhost:3000/images/hotel_1.png',
  'http://localhost:3000/images/hotel_2.png',
  'http://localhost:3000/images/hotel_3.png',
  'http://localhost:3000/images/hotel_4.png',
];

const roomImages = [
  'http://localhost:3000/images/room_1.png',
  'http://localhost:3000/images/room_2.png',
  'http://localhost:3000/images/room_3.png',
  'http://localhost:3000/images/room_4.png',
  'http://localhost:3000/images/room_5.png',
];

// 种子随机生成器（LCG）
function createSeededRandom(seed) {
  return function () {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

// Fisher-Yates 洗牌（使用传入的随机函数）
function shuffleArray(array, rng) {
  const arr = [...array]; // 复制原数组，避免副作用
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// ---------- 生成酒店数据（包含经纬度、酒店图片、房型列表） ----------
const generateHotelList = () => {
  const cities = ['上海', '北京', '广州', '深圳', '杭州', '南京', '成都'];
  const hotelNames = {
    上海: [
      '希尔顿',
      '万豪',
      '如家',
      '喜来登',
      '香格里拉',
      '凯宾斯基',
      '威斯汀',
      '洲际',
      '雅高',
      '锦江',
    ],
    北京: [
      '希尔顿',
      '万豪',
      '如家',
      '喜来登',
      '香格里拉',
      '王府半岛',
      '中国大饭店',
      '昆仑',
      '长富宫',
      '贵宾楼',
    ],
    广州: [
      '希尔顿',
      '万豪',
      '如家',
      '喜来登',
      '香格里拉',
      '四季',
      '丽思卡尔顿',
      '白天鹅',
      '花园',
      '中国大酒店',
    ],
    深圳: [
      '希尔顿',
      '万豪',
      '如家',
      '喜来登',
      '香格里拉',
      '瑞吉',
      '君悦',
      '威尼斯',
      '凯宾斯基',
      '华侨城',
    ],
    杭州: [
      '希尔顿',
      '万豪',
      '如家',
      '喜来登',
      '香格里拉',
      '西子湖四季',
      '安缦',
      '索菲特',
      '凯悦',
      '温德姆',
    ],
    南京: [
      '希尔顿',
      '万豪',
      '如家',
      '喜来登',
      '香格里拉',
      '金陵',
      '威斯汀',
      '圣和府邸',
      '金奥费尔蒙',
      '绿地洲际',
    ],
    成都: [
      '希尔顿',
      '万豪',
      '如家',
      '喜来登',
      '香格里拉',
      '华尔道夫',
      '瑞吉',
      '钓鱼台',
      '博舍',
      '尼依格罗',
    ],
  };
  const addresses = [
    '浦东新区世纪大道',
    '黄浦区南京东路',
    '静安区南京西路',
    '朝阳区建国门外大街',
    '东城区王府井大街',
    '天河区珠江新城',
    '福田区中心区',
  ];

  // 固定种子，确保每次运行生成相同数据
  const rng = createSeededRandom(12345);

  const getRandomHotelImage = () =>
    hotelImages[Math.floor(rng() * hotelImages.length)];

  const getRandomRoomImage = () =>
    roomImages[Math.floor(rng() * roomImages.length)];

  const hotels = [];
  let id = 1;

  cities.forEach((city) => {
    const cityHotelNames = hotelNames[city] || hotelNames['上海'];
    const hotelCount = Math.floor(rng() * 5) + 8; // 8~12

    for (let i = 0; i < hotelCount; i++) {
      const nameIndex = Math.floor(rng() * cityHotelNames.length);
      const addressIndex = Math.floor(rng() * addresses.length);

      const basePrice = Math.floor(rng() * 800) + 199; // 199~999
      const score = Math.floor(rng() * 30 + 20) / 10; // 2.0~5.0

      const base = CITY_CENTER[city];
      const lat = base.lat + (rng() - 0.5) * 0.04;
      const lng = base.lng + (rng() - 0.5) * 0.04;

      // 酒店图片
      const hotelImagesCount = Math.floor(rng() * 3) + 3; // 3~5
      const hotelImages = [];
      for (let j = 0; j < hotelImagesCount; j++) {
        hotelImages.push(getRandomHotelImage());
      }

      // 生成房型
      const roomsCount = Math.floor(rng() * 4) + 2; // 2~5
      const rooms = [];
      const usedRoomNames = new Set();
      for (let j = 0; j < roomsCount; j++) {
        let roomName;
        do {
          roomName = ROOM_TYPES[Math.floor(rng() * ROOM_TYPES.length)];
        } while (
          usedRoomNames.has(roomName) &&
          usedRoomNames.size < ROOM_TYPES.length
        );
        usedRoomNames.add(roomName);

        const roomPrice = Math.max(
          100,
          basePrice + (Math.floor(rng() * 200) - 100),
        );

        // 房型主题特色（使用洗牌）
        const themeCount = Math.floor(rng() * 2) + 1; // 1~2
        const shuffledTheme = shuffleArray(THEME_FEATURES, rng);
        const themeFeatures = shuffledTheme.slice(0, themeCount);

        // 房型设施
        const facilityCount = Math.floor(rng() * 3) + 2; // 2~4
        const shuffledFac = shuffleArray(FACILITIES, rng);
        const facilities = shuffledFac.slice(0, facilityCount);

        const availableCount = Math.floor(rng() * 10) + 1; // 1~10

        rooms.push({
          id: id * 100 + j,
          name: roomName,
          themeFeatures,
          facilities,
          price: roomPrice,
          availableCount,
          roomImage: getRandomRoomImage(),
        });
      }

      const roomTypes = [...new Set(rooms.map((r) => r.name))];
      const minRoomPrice = Math.min(...rooms.map((r) => r.price));

      // 酒店主题特色（使用洗牌）
      const hotelThemeCount = Math.floor(rng() * 2) + 1; // 1~2
      const shuffledHotelTheme = shuffleArray(THEME_FEATURES, rng);
      const hotelThemeFeatures = shuffledHotelTheme.slice(0, hotelThemeCount);

      // 酒店设施
      const hotelFacilityCount = Math.floor(rng() * 4) + 2; // 2~5
      const shuffledHotelFac = shuffleArray(FACILITIES, rng);
      const hotelFacilities = shuffledHotelFac.slice(0, hotelFacilityCount);

      const brand = BRANDS[Math.floor(rng() * BRANDS.length)];
      const englishName = generateEnglishName(city, cityHotelNames[nameIndex]);
      hotels.push({
        id: id++,
        name: {
          cn: `${city}${cityHotelNames[nameIndex]}酒店`,
          en: englishName,
        },
        city,
        address: `${city}${addresses[addressIndex]}${Math.floor(rng() * 100) + 1}号`,
        lat,
        lng,
        score,
        price: minRoomPrice,
        openTime: `${2010 + Math.floor(rng() * 12)}-${String(Math.floor(rng() * 12) + 1).padStart(2, '0')}-${String(Math.floor(rng() * 28) + 1).padStart(2, '0')}`,
        tags: [],
        comments: Math.floor(rng() * 500) + 50,
        starRating: Math.floor(rng() * 3) + 3,
        themeFeatures: hotelThemeFeatures,
        brand,
        facilities: hotelFacilities,
        roomTypes,
        hotelImages,
        rooms,
      });
    }
  });

  return hotels.sort((a, b) => a.id - b.id);
};

const hotelList = generateHotelList();
console.log(`Generated ${hotelList.length} hotels with room details`);
console.log('hotelList', hotelList[0]);

// ---------- 距离计算函数（Haversine 公式） ----------
function getDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // 地球半径 km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// ---------- 过滤函数：根据查询参数过滤酒店 ----------
const filterHotels = (hotels, queryParams) => {
  const {
    city,
    poiId,
    poiName,
    distance,
    keyword,
    score,
    sortBy,
    minPrice,
    maxPrice,
    starMin,
    starMax,
    theme,
    brand,
    facility,
    roomType,
    cursor = 0,
    limit = 10,
  } = queryParams;

  let filtered = [...hotels];

  // 关键词/城市过滤
  if (keyword) {
    const keywordLower = keyword.toLowerCase();
    let poiProcessed = false; // 标记是否已按 POI 处理

    // 1. 尝试匹配 POI（需要城市参数）
    if (city) {
      const cityPois = POI_LIST.filter((p) => p.city === city);
      const matchedPoi = cityPois.find(
        (p) => p.name.toLowerCase() === keywordLower,
      );
      if (matchedPoi) {
        poiProcessed = true;
        // 按 POI 距离过滤（固定 5km）
        const maxDist = 5; // 5 公里
        filtered = filtered.filter((h) => {
          if (!h.lat || !h.lng) return false;
          const dist = getDistance(
            matchedPoi.lat,
            matchedPoi.lng,
            h.lat,
            h.lng,
          );
          return dist <= maxDist;
        });
      }
    }
    // 判断是否为城市关键词
    const cityMatched = Object.keys(CITY_CENTER).some(
      (c) => c.toLowerCase() === keywordLower,
    );

    // 2. 未匹配到 POI 时，执行原有关键词逻辑
    if (!poiProcessed) {
      if (cityMatched) {
        // 按城市过滤
        filtered = filtered.filter(
          (h) => h.city.toLowerCase() === keywordLower,
        );
      } else {
        // 普通关键词：酒店名称、地址、主题、品牌、设施、房型
        filtered = filtered.filter((h) => {
          const nameCn = h.name?.cn?.toLowerCase() || '';
          const nameEn = h.name?.en?.toLowerCase() || '';
          const address = h.address?.toLowerCase() || '';
          const themeStr = h.themeFeatures.join(',')?.toLowerCase() || '';
          const facilityStr = h.facilities.join(',')?.toLowerCase() || '';
          const roomTypeStr = h.roomTypes.join(',')?.toLowerCase() || '';

          return (
            nameCn.includes(keywordLower) ||
            nameEn.includes(keywordLower) ||
            address.includes(keywordLower) ||
            themeStr.includes(keywordLower) ||
            facilityStr.includes(keywordLower) ||
            roomTypeStr.includes(keywordLower)
          );
        });
      }
    }

    if (city && !cityMatched) {
      // 如果关键词不是城市，并且有城市参数时，按城市过滤
      filtered = filtered.filter((h) => h.city && h.city.includes(city));
    }
  } else if (city) {
    filtered = filtered.filter((h) => h.city && h.city.includes(city));
  }

  // 价格过滤
  if (minPrice) filtered = filtered.filter((h) => h.price >= Number(minPrice));
  if (maxPrice) filtered = filtered.filter((h) => h.price <= Number(maxPrice));

  // 星级过滤
  if (starMin)
    filtered = filtered.filter((h) => h.starRating >= Number(starMin));
  if (starMax)
    filtered = filtered.filter((h) => h.starRating <= Number(starMax));

  // 评分过滤
  if (score) filtered = filtered.filter((h) => h.score >= Number(score));

  // 距离过滤（需要 poiId 和 distance）
  if (poiId && distance) {
    const poi = POI_LIST.find((p) => p.id === Number(poiId));
    if (poi) {
      const maxDist = Number(distance);
      filtered = filtered.filter((h) => {
        if (!h.lat || !h.lng) return false;
        const dist = getDistance(poi.lat, poi.lng, h.lat, h.lng);
        return dist <= maxDist;
      });
    } else {
      // 如果 POI 不存在，返回空数组
      return [];
    }
  }

  if (theme) {
    console.log('过滤 theme');

    const themeList = theme.split(',').map((t) => t.trim());
    filtered = filtered.filter(
      (h) =>
        h.themeFeatures && h.themeFeatures.some((f) => themeList.includes(f)),
    );
  }

  if (brand) {
    console.log('过滤 brand');

    const brandList = brand.split(',').map((b) => b.trim());
    filtered = filtered.filter((h) => h.brand && brandList.includes(h.brand));
  }

  if (facility) {
    console.log('过滤 facility');

    const facilityList = facility.split(',').map((f) => f.trim());
    filtered = filtered.filter(
      (h) => h.facilities && h.facilities.some((f) => facilityList.includes(f)),
    );
  }

  if (roomType) {
    console.log('过滤 roomType');

    const roomTypeList = roomType.split(',').map((r) => r.trim());
    filtered = filtered.filter(
      (h) => h.roomTypes && h.roomTypes.some((r) => roomTypeList.includes(r)),
    );
  }

  // 排序，默认欢迎度排序
  if (sortBy) {
    switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'score_desc':
        filtered.sort((a, b) => b.score - a.score);
        break;
      case 'star_desc':
        filtered.sort((a, b) => b.starRating - a.starRating);
        break;
      default:
        filtered.sort((a, b) => b.score - a.score);
    }
  } else {
    filtered.sort((a, b) => b.score - a.score);
  }
  console.log('filtered.length', filtered.length);
  return filtered;
};

// ---------- API 路由 ----------

// 酒店列表接口（返回酒店基本字段，不包含rooms和hotelImages以减小响应体积，但为了演示我们暂时保留完整对象）
// 若想精简，可以在返回前删除 rooms 和 hotelImages，但为了后续详情页数据复用，这里保持原样
app.get('/api/hotels', (req, res) => {
  try {
    const cursor = Number(req.query.cursor) || 0;
    const limit = Number(req.query.limit) || 3;

    const queryParams = {
      city: req.query.city,
      poiId: req.query.poiId,
      poiName: req.query.poiName,
      distance: req.query.distance,
      keyword: req.query.keyword,
      score: req.query.score,
      sortBy: req.query.sortBy,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      starMin: req.query.starMin,
      starMax: req.query.starMax,
      theme: req.query.theme,
      brand: req.query.brand,
      facility: req.query.facility,
      roomType: req.query.roomType,
      cursor,
      limit,
    };

    console.log('Received query params:', queryParams);

    // 1. 先过滤
    let filteredList = filterHotels(hotelList, queryParams);

    // 2. 计算总数
    const total = filteredList.length;

    console.log('total', total);

    // 3. 游标分页：过滤出列表下标 > cursor 的数据
    const start = Number(cursor) || 0; // 确保 cursor 为数字
    const pagedList = filteredList.slice(start, start + limit);

    // 4. 下一个 cursor
    const nextCursor = pagedList.length > 0 ? start + pagedList.length : null;

    // 5. 是否还有更多
    const hasMore = total > start + pagedList.length;

    res.json({
      list: pagedList,
      total,
      nextCursor,
      hasMore,
      query: queryParams,
    });

    console.log(`Returned ${pagedList.length} hotels, hasMore: ${hasMore}`);
  } catch (error) {
    console.error('Error in /api/hotels:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 酒店详情接口（返回完整酒店数据，包含 rooms 和 hotelImages）
app.get('/api/hotels/:id', (req, res) => {
  try {
    const id = Number(req.params.id);
    const hotel = hotelList.find((item) => item.id === id);
    if (hotel) {
      res.json(hotel);
    } else {
      res.status(404).json({ message: '酒店不存在' });
    }
  } catch (error) {
    console.error('Error in /api/hotels/:id:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// POI 列表接口（根据城市返回）
app.get('/api/pois', (req, res) => {
  try {
    const city = req.query.city;
    if (!city) {
      return res.status(400).json({ message: 'Missing city parameter' });
    }
    const pois = POI_LIST.filter((p) => p.city === city);
    res.json(pois);
  } catch (error) {
    console.error('Error in /api/pois:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取所有城市接口
app.get('/api/cities', (req, res) => {
  try {
    const cities = [...new Set(hotelList.map((h) => h.city))].sort();
    res.json(cities);
  } catch (error) {
    console.error('Error in /api/cities:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取酒店数量（支持所有筛选参数）
app.get('/api/hotel-count', (req, res) => {
  try {
    const queryParams = {
      city: req.query.city,
      poiId: req.query.poiId,
      poiName: req.query.poiName,
      distance: req.query.distance,
      keyword: req.query.keyword,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      starMin: req.query.starMin,
      starMax: req.query.starMax,
      theme: req.query.theme,
      brand: req.query.brand,
      facility: req.query.facility,
      roomType: req.query.roomType,
    };
    // 过滤并返回总数（忽略分页和排序）
    const filtered = filterHotels(hotelList, queryParams);
    console.log('filtered.length', filtered.length);
    res.json({ total: filtered.length });
  } catch (error) {
    console.error('Error in /api/hotel-count:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 获取价格范围接口
app.get('/api/price-range', (req, res) => {
  try {
    const prices = hotelList.map((h) => h.price);
    const minPrice = Math.min(...prices);
    const maxPrice = Math.max(...prices);
    res.json({ min: minPrice, max: maxPrice });
  } catch (error) {
    console.error('Error in /api/price-range:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 天气接口：根据经纬度获取实时天气
app.get('/api/weather', async (req, res) => {
  try {
    const { lat, lng } = req.query;
    if (!lat || !lng) {
      return res.status(400).json({ message: '缺少经纬度参数' });
    }

    // 请替换为你的高德地图 API Key，或从环境变量读取
    const AMAP_KEY = process.env.AMAP_KEY || '809eafec06ea8344601912cba6ef36f1';

    // 1. 逆地理编码：经纬度 -> adcode
    const regeoUrl = `https://restapi.amap.com/v3/geocode/regeo?location=${lng},${lat}&key=${AMAP_KEY}&output=json`;
    const regeoRes = await fetch(regeoUrl);
    const regeoData = await regeoRes.json();

    if (regeoData.status !== '1' || !regeoData.regeocode) {
      console.error('逆地理编码失败:', regeoData);
      return res.status(500).json({ message: '获取位置信息失败' });
    }

    const adcode = regeoData.regeocode.addressComponent.adcode;

    // 2. 获取实时天气
    const weatherUrl = `https://restapi.amap.com/v3/weather/weatherInfo?key=${AMAP_KEY}&city=${adcode}&output=json`;
    const weatherRes = await fetch(weatherUrl);
    const weatherData = await weatherRes.json();

    if (weatherData.status !== '1') {
      console.error('获取天气失败:', weatherData);
      return res.status(500).json({ message: '获取天气信息失败' });
    }

    const liveWeather = weatherData.lives?.[0];
    if (!liveWeather) {
      return res.status(500).json({ message: '天气数据为空' });
    }

    // 返回实时天气数据（可直接用于前端展示）
    res.json(liveWeather);
  } catch (error) {
    console.error('天气接口错误:', error);
    res.status(500).json({ message: '服务器内部错误' });
  }
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`Mock server running at http://localhost:${PORT}`);
  console.log('Available endpoints:');
  console.log(`- GET http://localhost:${PORT}/api/hotels`);
  console.log(`- GET http://localhost:${PORT}/api/hotels/:id`);
  console.log(`- GET http://localhost:${PORT}/api/pois?city=上海`);
  console.log(`- GET http://localhost:${PORT}/api/cities`);
  console.log(`- GET http://localhost:${PORT}/api/price-range`);
  console.log(`- GET http://localhost:${PORT}/api/health`);
  console.log(
    `- GET http://localhost:${PORT}/api/weather?lat=31.2304&lng=121.4737`,
  );
});
