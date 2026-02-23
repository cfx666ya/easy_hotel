import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

import DateRangeBar from '../../components/DateRangeBar';
import GuestPanel from '../../components/GuestPanel';
import PricePanel from '../../components/PricePanel';
import LevelPanel from '../../components/LevelPanel';
import DatePickerModal from '../../components/DatePickerModal.jsx';
import { fetchLocationByCoords } from '../../api/location';

// 轮播 banner
const banners = [
  {
    id: 1,
    img: 'http://localhost:3000/images/hotel_1.png',
    hotelId: 1,
  },
  {
    id: 2,
    img: 'http://localhost:3000/images/hotel_2.png',
    hotelId: 2,
  },
  {
    id: 3,
    img: 'http://localhost:3000/images/hotel_3.png',
    hotelId: 3,
  },
  {
    id: 4,
    img: 'http://localhost:3000/images/hotel_4.png',
    hotelId: 4,
  },
];

// 星级 key 到显示文本的映射（可根据实际星级key调整）
const levelNameMap = {
  FIVE: '五星',
  FOUR: '四星',
  THREE: '三星',
  TWO: '二星',
  ONE: '一星',
};

export default function IndexPage() {
  const navigate = useNavigate();

  // 轮播 banner 相关
  const [current, setCurrent] = useState(0);
  const startX = useRef(0);
  const moveX = useRef(0);

  // 记录起点
  const handleTouchStart = (e) => {
    startX.current = e.touches[0].clientX;
  };

  // 记录移动
  const handleTouchMove = (e) => {
    moveX.current = e.touches[0].clientX;
  };

  // 判断滑动方向
  const handleTouchEnd = () => {
    const distance = moveX.current - startX.current;

    // 向左滑（下一张）
    if (distance < -50) {
      setCurrent((prev) => (prev === banners.length - 1 ? 0 : prev + 1));
    }

    // 向右滑（上一张）
    if (distance > 50) {
      setCurrent((prev) => (prev === 0 ? banners.length - 1 : prev - 1));
    }
  };

  // 点击跳转
  const handleClick = (hotelId) => {
    navigate(`/hotel-detail/${hotelId}`);
  };

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  // ---------- 城市与定位状态 ----------
  const [displayCity, setDisplayCity] = useState('北京'); // 左侧显示的城市文字
  const [searchCity, setSearchCity] = useState('北京'); // 实际用于搜索的城市标识
  const [isLocated, setIsLocated] = useState(false); // 是否处于定位模式（控制定位bar显示）
  const [locatedAddress, setLocatedAddress] = useState(''); // 定位到的具体地址（显示在bar中）

  // ---------- 搜索关键词 ----------
  const [keyword, setKeyword] = useState('');

  // ---------- 日期范围 ----------
  const [showCalendar, setShowCalendar] = useState(false); // 控制日历模态框

  // 初始值：今天入住，明天离店，1晚
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatDate = (date) => date.toISOString().split('T')[0];
  const [checkIn, setCheckIn] = useState(formatDate(today));
  const [checkOut, setCheckOut] = useState(formatDate(tomorrow));
  const [nights, setNights] = useState(1);

  // ---------- 房间与人数 ----------
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [showGuestPanel, setShowGuestPanel] = useState(false);

  // ---------- 价格与星级 ----------
  const [priceRange, setPriceRange] = useState(null); // [min, max] 或 null
  const [selectedLevels, setSelectedLevels] = useState([]); // 星级key数组
  const [showPriceLevelPanel, setShowPriceLevelPanel] = useState(false);

  // 价格/星级输入框显示文本
  const getPriceLevelText = () => {
    const parts = [];
    if (priceRange) {
      parts.push(`¥${priceRange[0]}-${priceRange[1]}`);
    }
    if (selectedLevels.length > 0) {
      const levelText = selectedLevels
        .map((key) => levelNameMap[key] || key)
        .join('·');
      parts.push(levelText);
    }
    return parts.join(' · ');
  };
  const hasPriceLevelSelection = priceRange || selectedLevels.length > 0;

  // ---------- 定位功能 ----------
  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('您的浏览器不支持地理位置');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const { address, city } = await fetchLocationByCoords(
            latitude,
            longitude,
          );
          setIsLocated(true);
          setDisplayCity('我的位置');
          setSearchCity(city);
          setLocatedAddress(address);
        } catch (error) {
          alert('获取地址失败：' + error.message);
        }
      },
      (error) => {
        alert('无法获取您的位置：' + error.message);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // ---------- 日期变更（来自DateRangeBar）----------
  // 打开日历（同时关闭下拉面板）
  const handleOpenCalendar = () => {
    setShowCalendar(true);
  };

  const handleDateChange = ({ checkIn, checkOut, nights }) => {
    setCheckIn(checkIn);
    setCheckOut(checkOut);
    setNights(nights);
  };

  // 处理日历确认
  const handleCalendarConfirm = (checkIn, checkOut, nights) => {
    handleDateChange({ checkIn, checkOut, nights });
    setShowCalendar(false);
  };

  // ---------- 房间人数变更 ----------
  const handleRoomsChange = (newRooms) => setRooms(newRooms);
  const handleGuestsChange = (newGuests) => setGuests(newGuests);

  // ---------- 价格/星级清空 ----------
  const clearPriceLevel = () => {
    setPriceRange(null);
    setSelectedLevels([]);
  };

  // ---------- 查询按钮 ----------
  const handleSearch = () => {
    // 构建URL查询参数
    const params = new URLSearchParams();
    params.set('city', searchCity);
    if (keyword) params.set('keyword', keyword);
    params.set('checkIn', checkIn);
    params.set('checkOut', checkOut);
    params.set('nights', nights);
    if (priceRange) {
      params.set('minPrice', priceRange[0]);
      params.set('maxPrice', priceRange[1]);
    }
    // 星级：假设单选，取第一个值转为数字
    if (selectedLevels.length > 0) {
      const levelKey = selectedLevels[0];
      // 根据实际星级key映射到数字，这里简单映射
      const levelNum =
        { FIVE: 5, FOUR: 4, THREE: 3, TWO: 2, ONE: 1 }[levelKey] || 0;
      if (levelNum) {
        params.set('starMin', levelNum);
        params.set('starMax', levelNum);
      }
    }
    // 注意：rooms/guests 未传递给列表页（可根据实际API决定是否传递）
    navigate(`/hotel-list?${params.toString()}`);
  };

  return (
    <div className="index-page">
      {/* ===== Banner 轮播 ===== */}
      <div className="banner-wrapper">
        {/* 图片滑动区域 */}
        <div
          className="banner-container"
          style={{ transform: `translateX(-${current * 100}%)` }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {banners.map((item) => (
            <div
              className="banner-item"
              key={item.id}
              onClick={() => handleClick(item.hotelId)}
            >
              <img src={item.img} alt="" />
            </div>
          ))}
        </div>

        {/* 小圆点 */}
        <div className="dots">
          {banners.map((_, index) => (
            <span
              key={index}
              className={index === current ? 'dot active' : 'dot'}
              onClick={() => setCurrent(index)}
            />
          ))}
        </div>
      </div>

      {/* 定位信息条（仅在定位模式下显示） */}
      {isLocated && locatedAddress && (
        <div className="location-bar">
          <small>已定位到 {locatedAddress} 附近</small>
        </div>
      )}

      {/* 核心查询区域 */}
      <div className="search-section">
        {/* 第一行：城市 + 定位图标 + 关键词输入框 */}
        <div className="row city-row">
          <div
            className="city-selector"
            onClick={() =>
              navigate('/city-select', { state: { currentCity: searchCity } })
            }
          >
            {displayCity}
          </div>
          <div className="locate-icon" onClick={handleLocate}>
            <span>📍</span> {/* 实际项目中用图标字体或SVG */}
          </div>
          <input
            type="text"
            className="keyword-input"
            placeholder="位置/品牌/酒店"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        {/* 第二行：入住离店日期 */}
        <div className="row">
          <DateRangeBar
            checkIn={checkIn}
            checkOut={checkOut}
            nights={nights}
            onClick={handleOpenCalendar}
          />
        </div>

        {/* 第三行：间数人数 + 价格星级选择 */}
        <div className="row guest-price-row">
          {/* 左侧：间数人数（点击弹出GuestPanel） */}
          <div
            className="guest-trigger"
            onClick={() => setShowGuestPanel(true)}
          >
            {rooms}间 · {guests}人 {/* 直接显示数字 */}
          </div>

          {/* 右侧：价格星级输入框（点击弹出面板） */}
          <div
            className="price-level-trigger"
            onClick={() => setShowPriceLevelPanel(true)}
          >
            <input
              type="text"
              placeholder="价格/星级"
              value={getPriceLevelText()}
              readOnly
              className="price-level-input"
            />
            {hasPriceLevelSelection && (
              <span
                className="clear-icon"
                onClick={(e) => {
                  e.stopPropagation(); // 防止触发父级点击
                  clearPriceLevel();
                }}
              >
                ⓧ
              </span>
            )}
          </div>
        </div>

        {/* 查询按钮 */}
        <button className="search-btn" onClick={handleSearch}>
          查询
        </button>
      </div>

      {/* GuestPanel 弹窗 */}
      <GuestPanel
        visible={showGuestPanel}
        onClose={() => setShowGuestPanel(false)}
        rooms={rooms}
        guests={guests}
        onRoomsChange={handleRoomsChange}
        onGuestsChange={handleGuestsChange}
      />

      {/* 价格/星级选择面板（底部弹窗） */}
      {showPriceLevelPanel && (
        <div className="bottom-sheet">
          <div className="bottom-sheet-header">
            <h3>选择价格/星级</h3>
            <button onClick={() => setShowPriceLevelPanel(false)}>✕</button>
          </div>
          <div className="bottom-sheet-content">
            <PricePanel
              value={priceRange || [0, 2000]} // 默认范围
              onChange={setPriceRange}
            />
            <LevelPanel value={selectedLevels} onChange={setSelectedLevels} />
          </div>
          <div className="bottom-sheet-footer">
            <button onClick={clearPriceLevel}>清空</button>
            <button onClick={() => setShowPriceLevelPanel(false)}>完成</button>
          </div>
        </div>
      )}

      {/* 日历模态框 */}
      <DatePickerModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        defaultCheckIn={today} // 无默认值时用今天
        defaultCheckOut={tomorrow} // 无默认值时用明天
        onConfirm={handleCalendarConfirm}
      />
    </div>
  );
}
