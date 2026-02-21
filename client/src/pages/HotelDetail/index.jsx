import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import DatePickerModal from '../HotelList/components/DatePickerModal';
import { getHotelDetail } from '../../api/hotel';
import { Slider } from 'antd'; // 假设使用了 antd 的 Slider，您可以根据实际情况调整
const MAX_PRICE_LIMIT = 1500;

// 日期格式化工具函数（与之前一致）
const formatDisplayDate = (dateString) => {
  const date = new Date(dateString);
  const today = new Date();
  const isToday = date.toDateString() === today.toDateString();
  const isTomorrow =
    new Date(today.getTime() + 86400000).toDateString() === date.toDateString();

  const month = date.getMonth() + 1;
  const day = date.getDate();
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  const weekDay = weeks[date.getDay()];
  const extra = isToday ? '今天' : isTomorrow ? '明天' : weekDay;
  return `${month}月${day}日（${extra}）`;
};

const getDefaultDates = () => {
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };
  return {
    checkIn: formatDate(today),
    checkOut: formatDate(tomorrow),
    nights: 1,
  };
};

// ---------- 间数人数选择面板组件 ----------
const GuestPanel = ({
  visible,
  onClose,
  rooms,
  guests,
  onRoomsChange,
  onGuestsChange,
}) => {
  const [showRoomSelector, setShowRoomSelector] = useState(false); // 是否显示【间数panel】
  const [showGuestSelector, setShowGuestSelector] = useState(false); // 是否显示【人数panel】

  // 处理加减的逻辑
  const handleRoomsDecrement = () => {
    if (rooms > 1) onRoomsChange(rooms - 1);
  };
  const handleRoomsIncrement = () => {
    if (rooms < 10) onRoomsChange(rooms + 1);
  };
  const handleGuestsDecrement = () => {
    if (guests > 1) onGuestsChange(guests - 1);
  };
  const handleGuestsIncrement = () => {
    if (guests < 20) onGuestsChange(guests + 1);
  };

  // 用户点击【客房间数】中的数字后显示【间数panel】
  const handleRoomSelect = (value) => {
    onRoomsChange(value);
    setShowRoomSelector(false);
  };

  // 用户点击【人数】中的数字后显示【人数panel】
  const handleGuestSelect = (value) => {
    onGuestsChange(value);
    setShowGuestSelector(false);
  };

  // 是否显示该 panel
  if (!visible) return null;

  return (
    <div className="guest-panel-overlay">
      <div className="guest-panel">
        <div className="panel-header">
          <span className="close-btn" onClick={onClose}>
            ✕
          </span>
          <span className="title">选择客房和入住人数</span>
        </div>
        <div className="panel-content">
          <div className="selector-row">
            <span className="label">间数</span>
            <div className="stepper">
              <button
                className={`stepper-btn ${rooms === 1 ? 'disabled' : ''}`}
                onClick={handleRoomsDecrement}
                disabled={rooms === 1}
              >
                −
              </button>
              <span
                className="stepper-value"
                onClick={() => setShowRoomSelector(true)}
              >
                {rooms}
              </span>
              <button
                className={`stepper-btn ${rooms === 10 ? 'disabled' : ''}`}
                onClick={handleRoomsIncrement}
                disabled={rooms === 10}
              >
                +
              </button>
            </div>
          </div>
          <div className="selector-row">
            <span className="label">人数</span>
            <div className="stepper">
              <button
                className={`stepper-btn ${guests === 1 ? 'disabled' : ''}`}
                onClick={handleGuestsDecrement}
                disabled={guests === 1}
              >
                −
              </button>
              <span
                className="stepper-value"
                onClick={() => setShowGuestSelector(true)}
              >
                {guests}
              </span>
              <button
                className={`stepper-btn ${guests === 20 ? 'disabled' : ''}`}
                onClick={handleGuestsIncrement}
                disabled={guests === 20}
              >
                +
              </button>
            </div>
          </div>
        </div>
        <button className="done-btn" onClick={onClose}>
          完成
        </button>
      </div>

      {showRoomSelector && (
        <div
          className="sub-panel-overlay"
          onClick={() => setShowRoomSelector(false)}
        >
          <div className="sub-panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <span
                className="close-btn"
                onClick={() => setShowRoomSelector(false)}
              >
                ✕
              </span>
              <span className="title">间数</span>
            </div>
            <div className="number-grid">
              {[...Array(10).keys()]
                .map((i) => i + 1)
                .map((num) => (
                  <button
                    key={num}
                    className={`grid-btn ${rooms === num ? 'active' : ''}`}
                    onClick={() => handleRoomSelect(num)}
                  >
                    {num}间
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {showGuestSelector && (
        <div
          className="sub-panel-overlay"
          onClick={() => setShowGuestSelector(false)}
        >
          <div className="sub-panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <span
                className="close-btn"
                onClick={() => setShowGuestSelector(false)}
              >
                ✕
              </span>
              <span className="title">人数</span>
            </div>
            <div className="number-grid">
              {[...Array(20).keys()]
                .map((i) => i + 1)
                .map((num) => (
                  <button
                    key={num}
                    className={`grid-btn ${guests === num ? 'active' : ''}`}
                    onClick={() => handleGuestSelect(num)}
                  >
                    {num}人
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const FilterPanel = ({
  visible,
  onClose,
  allRoomTypes,
  allFacilities,
  allThemeFeatures,
  initialPriceRange,
  initialRoomType,
  initialFacilities,
  initialThemeFeatures,
  onConfirm,
  onClear,
  maxPriceLimit, // 新增
}) => {
  // 临时状态
  const [tempPriceRange, setTempPriceRange] = useState(initialPriceRange);
  const [tempRoomType, setTempRoomType] = useState(initialRoomType);
  const [tempFacilities, setTempFacilities] = useState(initialFacilities);
  const [tempThemeFeatures, setTempThemeFeatures] =
    useState(initialThemeFeatures);
  // 输入框显示状态（字符串，支持连续输入）
  const [minInput, setMinInput] = useState(String(initialPriceRange[0]));
  const [maxInput, setMaxInput] = useState(String(initialPriceRange[1]));

  // 当面板打开时，用初始值重置临时状态
  // useEffect(() => {
  //   if (visible) {
  //     setTempPriceRange(initialPriceRange);
  //     setTempRoomType(initialRoomType);
  //     setTempFacilities(initialFacilities);
  //     setTempThemeFeatures(initialThemeFeatures);
  //     setMinInput(String(initialPriceRange[0]));
  //     setMaxInput(String(initialPriceRange[1]));
  //   }
  // }, [
  //   visible,
  //   initialPriceRange,
  //   initialRoomType,
  //   initialFacilities,
  //   initialThemeFeatures,
  // ]);

  // 快捷价格按钮配置（基于固定最大值 1500）
  const quickPriceButtons = [
    { label: '￥250以下', min: 0, max: 250 },
    { label: '￥250-350', min: 250, max: 350 },
    { label: '￥350-500', min: 350, max: 500 },
    { label: '￥500-700', min: 500, max: 700 },
    { label: '￥700-1000', min: 700, max: 1000 },
    { label: '￥1000以上', min: 1000, max: MAX_PRICE_LIMIT },
  ];

  // 处理价格变化（确保步长为100）
  const handlePriceRangeChange = (value) => {
    const rounded = value.map((v) => Math.round(v / 100) * 100);
    setTempPriceRange(rounded);
    setMinInput(String(rounded[0]));
    setMaxInput(String(rounded[1]));
  };

  // 点击 快捷价格按钮
  const handleQuickPrice = (min, max) => {
    const newRange = [min, max];
    setTempPriceRange(newRange);
    setMinInput(String(min));
    setMaxInput(String(max));
  };

  // 最低价输入变化：仅更新本地字符串
  const handleMinInputChange = (e) => {
    setMinInput(e.target.value);
  };

  // 最低价失去焦点：解析、范围限制，但不取整，更新真实价格
  const handleMinInputBlur = () => {
    let value = parseInt(minInput);
    if (isNaN(value)) value = 0;
    value = Math.max(0, Math.min(value, tempPriceRange[1])); // 不能超过当前最大值
    // 不取整，直接使用用户输入值
    setTempPriceRange([value, tempPriceRange[1]]);
    setMinInput(String(value)); // 同步显示
  };

  // 最高价输入变化：仅更新本地字符串
  const handleMaxInputChange = (e) => {
    setMaxInput(e.target.value);
  };

  // 最高价失去焦点：解析、范围限制，但不取整，更新真实价格
  const handleMaxInputBlur = () => {
    let value = parseInt(maxInput);
    if (isNaN(value)) value = maxPriceLimit;
    value = Math.min(maxPriceLimit, Math.max(value, tempPriceRange[0])); // 不能小于当前最小值
    // 不取整
    setTempPriceRange([tempPriceRange[0], value]);
    setMaxInput(String(value));
  };

  // 其他选择逻辑不变
  const handleRoomTypeClick = (roomType) => {
    setTempRoomType((prev) => (prev === roomType ? null : roomType));
  };

  const toggleFacility = (facility) => {
    setTempFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility],
    );
  };

  const toggleTheme = (theme) => {
    setTempThemeFeatures((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme],
    );
  };

  const handleConfirm = () => {
    onConfirm({
      priceRange: tempPriceRange,
      roomType: tempRoomType,
      facilities: tempFacilities,
      themeFeatures: tempThemeFeatures,
    });
    onClose();
  };

  // 清空所有筛选条件
  const handleClear = () => {
    const clearedRange = [0, maxPriceLimit];
    setTempPriceRange(clearedRange);
    setTempRoomType(null);
    setTempFacilities([]);
    setTempThemeFeatures([]);
    setMinInput(String(clearedRange[0]));
    setMaxInput(String(clearedRange[1]));
    onClear();
  };

  if (!visible) return null;

  return (
    <div className="filter-panel-overlay" onClick={onClose}>
      <div className="filter-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <span className="close-btn" onClick={onClose}>
            ✕
          </span>
          <span className="title">筛选</span>
        </div>

        <div className="filter-content">
          {/* 房型部分 */}
          <div className="filter-section">
            <h4>房型</h4>
            <div className="filter-buttons">
              {allRoomTypes.map((roomType) => (
                <button
                  key={roomType}
                  className={`filter-btn ${tempRoomType === roomType ? 'active' : ''}`}
                  onClick={() => handleRoomTypeClick(roomType)}
                >
                  {roomType}
                </button>
              ))}
            </div>
          </div>

          {/* 客房设施 */}
          <div className="filter-section">
            <h4>客房设施</h4>
            <div className="filter-buttons">
              {allFacilities.map((facility) => (
                <button
                  key={facility}
                  className={`filter-btn ${tempFacilities.includes(facility) ? 'active' : ''}`}
                  onClick={() => toggleFacility(facility)}
                >
                  {facility}
                </button>
              ))}
            </div>
          </div>

          {/* 主题 */}
          <div className="filter-section">
            <h4>主题</h4>
            <div className="filter-buttons">
              {allThemeFeatures.map((theme) => (
                <button
                  key={theme}
                  className={`filter-btn ${tempThemeFeatures.includes(theme) ? 'active' : ''}`}
                  onClick={() => toggleTheme(theme)}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* 价格部分 */}
          <div className="filter-section">
            <h4>价格范围</h4>
            <div className="price-slider">
              <Slider
                range
                min={0}
                max={maxPriceLimit}
                step={100}
                value={tempPriceRange}
                onChange={handlePriceRangeChange}
                tooltip={{ formatter: (value) => `￥${value}` }}
              />
            </div>
            <div className="price-inputs">
              <input
                type="number"
                min={0}
                max={tempPriceRange[1]}
                step={100}
                value={minInput}
                onChange={handleMinInputChange}
                onBlur={handleMinInputBlur}
              />
              <span> - </span>
              <input
                type="number"
                min={tempPriceRange[0]}
                max={maxPriceLimit}
                step={100}
                value={maxInput}
                onChange={handleMaxInputChange}
                onBlur={handleMaxInputBlur}
              />
            </div>
            <div className="quick-price-buttons">
              {quickPriceButtons.map((btn, index) => (
                <button
                  key={index}
                  className="quick-price-btn"
                  onClick={() => handleQuickPrice(btn.min, btn.max)}
                >
                  {btn.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="filter-actions">
          <button className="clear-btn" onClick={handleClear}>
            清空
          </button>
          <button className="confirm-btn" onClick={handleConfirm}>
            完成
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------- 主页面 ----------
export default function HotelDetailPage() {
  // 每个酒店都对应一个 id
  const { id } = useParams();
  const navigate = useNavigate();

  // 当前酒店
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从酒店数据提取的选项
  const [allRoomTypes, setAllRoomTypes] = useState([]);
  const [allFacilities, setAllFacilities] = useState([]);
  const [allThemeFeatures, setAllThemeFeatures] = useState([]);

  // 获取酒店详情
  // 依赖 id，当 id 变化时执行
  useEffect(() => {
    const fetchHotelDetail = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getHotelDetail(id);
        console.log('data', data);
        setHotel(data);
        // 提取筛选选项
        if (data.rooms) {
          // 如果该酒店有房间
          // 获取该酒店中所有的 房型、设施、主题，用 set 防止重复
          const roomTypes = [...new Set(data.rooms.map((r) => r.name))];
          const facilities = [
            ...new Set(data.rooms.flatMap((r) => r.facilities)),
          ];
          const themeFeatures = [
            ...new Set(data.rooms.flatMap((r) => r.themeFeatures)),
          ];
          setAllRoomTypes(roomTypes);
          setAllFacilities(facilities);
          setAllThemeFeatures(themeFeatures);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchHotelDetail();
  }, [id]);

  // 点击 X 返回上一页
  const handleBack = () => {
    navigate(-1);
  };

  /**
   * 日期相关
   */
  // 日期状态
  // 默认以今天和明天作为当前入住和离店日期
  const [checkIn, setCheckIn] = useState(getDefaultDates().checkIn);
  const [checkOut, setCheckOut] = useState(getDefaultDates().checkOut);
  const [nights, setNights] = useState(getDefaultDates().nights);
  const [showCalendar, setShowCalendar] = useState(false);

  // 确定日期
  const handleDateConfirm = (newCheckIn, newCheckOut, newNights) => {
    setCheckIn(newCheckIn);
    setCheckOut(newCheckOut);
    setNights(newNights);
    setShowCalendar(false);
  };

  // 字符串展示
  const dateDisplay = `${formatDisplayDate(checkIn)}-${formatDisplayDate(checkOut)} 共${nights}晚`;

  /**
   * 间数人数相关
   */
  // 间数人数状态
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(1);
  // 是否展示【间数人数 panel】
  const [showGuestPanel, setShowGuestPanel] = useState(false);

  // 字符串用于展示
  const guestDisplay = `${rooms}间客房, ${guests}成人`;

  /**
   * 筛选相关
   */
  // 筛选相关状态
  const [priceRange, setPriceRange] = useState([0, MAX_PRICE_LIMIT]); // 价格范围
  const [selectedRoomType, setSelectedRoomType] = useState(null); // 房间类型
  const [selectedFacilities, setSelectedFacilities] = useState([]); // 设施
  const [selectedThemeFeatures, setSelectedThemeFeatures] = useState([]); // 主题
  const [showFilterPanel, setShowFilterPanel] = useState(false); // 是否展示【筛选panel】

  // 价格按钮 显示文本
  // 如果为 null，不显示 价格按钮
  const getPriceLabel = () => {
    const [min, max] = priceRange;
    if (min === 0 && max === MAX_PRICE_LIMIT) return null; // 不显示按钮
    if (min === 0) return `￥${max}以下`;
    if (max === MAX_PRICE_LIMIT) return `￥${min}以上`;
    return `￥${min}-${max}`;
  };

  // 切换设施选中
  const toggleFacility = (facility) => {
    setSelectedFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility],
    );
  };
  // 切换主题选中
  const toggleTheme = (theme) => {
    setSelectedThemeFeatures((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme],
    );
  };

  // 处理筛选面板确认
  const handleFilterConfirm = ({
    priceRange: newRange,
    roomType,
    facilities,
    themeFeatures,
  }) => {
    setPriceRange(newRange);
    setSelectedRoomType(roomType);
    setSelectedFacilities(facilities);
    setSelectedThemeFeatures(themeFeatures);
  };

  // 处理筛选面板清空（立即应用到主界面）
  const handleFilterClear = () => {
    setPriceRange([0, MAX_PRICE_LIMIT]);
    setSelectedRoomType(null);
    setSelectedFacilities([]);
    setSelectedThemeFeatures([]);
  };

  // 计算过滤后的房型
  const filteredRooms = useMemo(() => {
    // 如果不存在酒店，或者酒店没有房间，返回空数组
    if (!hotel || !hotel.rooms) return [];

    return hotel.rooms.filter((room) => {
      // 房型过滤（单选）
      if (selectedRoomType && room.name !== selectedRoomType) return false;

      // 设施过滤（必须包含所有选中设施）
      if (selectedFacilities.length > 0) {
        if (!selectedFacilities.every((f) => room.facilities.includes(f)))
          return false;
      }

      // 主题过滤（必须包含所有选中主题）
      if (selectedThemeFeatures.length > 0) {
        if (!selectedThemeFeatures.every((t) => room.themeFeatures.includes(t)))
          return false;
      }

      // 价格过滤（max = MAX_PRICE_LIMIT 时表示无上限）
      const [minPrice, maxPrice] = priceRange;
      if (room.price < minPrice) return false;
      if (maxPrice < MAX_PRICE_LIMIT && room.price > maxPrice) return false;

      return true;
    });
  }, [
    hotel,
    selectedRoomType,
    selectedFacilities,
    selectedThemeFeatures,
    priceRange,
  ]);

  // 正在加载、错误 以及 加载完毕后要显示的内容
  if (loading) return <div className="loading">加载酒店详情中...</div>;
  if (error || !hotel)
    return <div className="error">出错了：{error || '酒店不存在'}</div>;

  return (
    <div className="hotel-detail-page">
      {/* 导航头 */}
      <header className="detail-header">
        <span className="back-arrow" onClick={handleBack}>
          ←
        </span>
        <h1 className="hotel-name">{hotel.name.cn}</h1>
      </header>

      {/* 图片轮播banner */}
      <div className="image-banner">
        <div className="banner-scroll">
          {hotel.hotelImages?.map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`hotel-${index}`}
              className="banner-image"
            />
          ))}
        </div>
      </div>

      {/* 酒店基础信息 */}
      <div className="hotel-info">
        <h2 className="hotel-name">
          {hotel.name.cn} <span className="en-name">{hotel.name.en}</span>
        </h2>
        <div className="star-rating">
          {'★'.repeat(hotel.starRating)}
          {'☆'.repeat(5 - hotel.starRating)}
        </div>
        <div className="facilities">
          {hotel.facilities?.slice(0, 3).map((facility, idx) => (
            <span key={idx} className="facility-tag">
              {facility}
            </span>
          ))}
          {hotel.facilities?.length > 3 && (
            <span className="more">+{hotel.facilities.length - 3}</span>
          )}
        </div>
        <div className="address">{hotel.address}</div>
      </div>

      {/* 入住日期和间数人数条 */}
      <div className="booking-bar">
        <div className="date-selector" onClick={() => setShowCalendar(true)}>
          <span className="label">入住日期</span>
          <span className="value">{dateDisplay}</span>
        </div>
        <div className="guest-selector" onClick={() => setShowGuestPanel(true)}>
          <span className="label">间数人数</span>
          <span className="value">{guestDisplay}</span>
        </div>
      </div>

      {/* 筛选条 */}
      <div className="filter-bar">
        <div className="scroll-buttons">
          {/* 如果返回 null，则不显示 */}
          {getPriceLabel() && (
            <button
              className="price-filter-btn active"
              onClick={() => setShowFilterPanel(true)}
            >
              {getPriceLabel()}
            </button>
          )}

          {/* 房型按钮（动态显示） */}
          {selectedRoomType ? (
            <button
              className="room-type-btn active"
              onClick={() => setSelectedRoomType(null)}
            >
              {selectedRoomType}
            </button>
          ) : (
            allRoomTypes.map((roomType) => (
              <button
                key={roomType}
                className="room-type-btn"
                onClick={() => setSelectedRoomType(roomType)}
              >
                {roomType}
              </button>
            ))
          )}

          {/* 设施按钮 */}
          {allFacilities.map((facility) => (
            <button
              key={facility}
              className={`facility-btn ${selectedFacilities.includes(facility) ? 'active' : ''}`}
              onClick={() => toggleFacility(facility)}
            >
              {facility}
            </button>
          ))}

          {/* 主题按钮 */}
          {allThemeFeatures.map((theme) => (
            <button
              key={theme}
              className={`theme-btn ${selectedThemeFeatures.includes(theme) ? 'active' : ''}`}
              onClick={() => toggleTheme(theme)}
            >
              {theme}
            </button>
          ))}
        </div>
        <div
          className={`filter-item ${showFilterPanel === true ? 'active' : ''}`}
          onClick={() => setShowFilterPanel(true)}
        >
          筛选 {showFilterPanel === true ? '▲' : '▼'}
        </div>
      </div>

      {/* 房型价格列表 */}
      <div className="room-list">
        <h3>房型价格</h3>
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => (
            <div key={room.id} className="room-card">
              <img
                src={room.roomImage}
                alt={room.name}
                className="room-image"
              />
              <div className="room-info">
                <h4>{room.name}</h4>
                <div className="room-theme">
                  {room.themeFeatures?.map((theme, idx) => (
                    <span key={idx} className="theme-tag">
                      {theme}
                    </span>
                  ))}
                </div>
                <div className="room-facilities">
                  {room.facilities?.slice(0, 2).map((fac, idx) => (
                    <span key={idx} className="facility-tag">
                      {fac}
                    </span>
                  ))}
                  {room.facilities?.length > 2 && (
                    <span>等{room.facilities.length}项设施</span>
                  )}
                </div>
                <div className="room-price">
                  <span className="price">¥{room.price}</span> /晚
                </div>
                <div className="room-available">
                  剩余 {room.availableCount} 间
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="no-rooms">暂无符合条件的房型</div>
        )}
      </div>

      {/* 日期选择弹窗 */}
      <DatePickerModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        defaultCheckIn={checkIn}
        defaultCheckOut={checkOut}
        onConfirm={handleDateConfirm}
      />

      {/* 间数人数选择面板 */}
      <GuestPanel
        visible={showGuestPanel}
        onClose={() => setShowGuestPanel(false)}
        rooms={rooms}
        guests={guests}
        onRoomsChange={setRooms}
        onGuestsChange={setGuests}
      />

      {/* 筛选面板 */}
      <FilterPanel
        visible={showFilterPanel}
        onClose={() => setShowFilterPanel(false)}
        allRoomTypes={allRoomTypes}
        allFacilities={allFacilities}
        allThemeFeatures={allThemeFeatures}
        initialPriceRange={priceRange}
        initialRoomType={selectedRoomType}
        initialFacilities={selectedFacilities}
        initialThemeFeatures={selectedThemeFeatures}
        onConfirm={handleFilterConfirm}
        onClear={handleFilterClear}
        maxPriceLimit={MAX_PRICE_LIMIT} // 新增
      />
    </div>
  );
}
