import { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchParams } from '../../store/slices/searchSlice';
import DatePickerModal from '../../components/DatePickerModal.jsx';
import { getHotelDetail } from '../../api/hotel';
import GuestPanel from '../../components/GuestPanel.jsx';
import HotelDetailFilterPanel from './components/HotelDetailFilterPanel.jsx';
import RoomCard from './components/RoomCard';
import { LeftOutlined } from '@ant-design/icons';
import { Swiper } from 'antd-mobile';
import DateRangeBar from '../../components/DateRangeBar';

const MAX_PRICE_LIMIT = 1500;

// ---------- 主页面 ----------
export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const search = useSelector((state) => state.search);

  // 当前酒店
  const [hotel, setHotel] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 从酒店数据提取的选项
  const [allRoomTypes, setAllRoomTypes] = useState([]);
  const [allFacilities, setAllFacilities] = useState([]);
  const [allThemeFeatures, setAllThemeFeatures] = useState([]);

  /**
   * ---------- 轮播 banner 相关 ----------
   */

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
  const [showCalendar, setShowCalendar] = useState(false);

  const handleOpenCalendar = () => {
    setShowCalendar(true);
  };

  const handleDateConfirm = (newCheckIn, newCheckOut, newNights) => {
    dispatch(
      setSearchParams({
        checkIn: newCheckIn,
        checkOut: newCheckOut,
        nights: newNights,
      }),
    );
    setShowCalendar(false);
  };

  /**
   * 间数人数相关
   */
  const [showGuestPanel, setShowGuestPanel] = useState(false);

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

    // 1. 先过滤
    const filtered = hotel.rooms.filter((room) => {
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

    // 2. 按价格由低到高排序
    return filtered.sort((a, b) => a.price - b.price);
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
    <div>
      {/* 图片轮播banner */}
      {/* ===== 顶部轮播 Banner ===== */}
      <div
        style={{
          width: '100%',
          height: '25vh',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* 返回按钮（浮在最上方） */}
        <div
          onClick={handleBack}
          style={{
            position: 'absolute',
            top: 12,
            left: 12,
            width: 30,
            height: 30,
            borderRadius: '50%',
            background: 'rgba(0,0,0,0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 10,
            color: '#fff',
            fontSize: 16,
          }}
        >
          <LeftOutlined />
        </div>

        <Swiper
          autoplay
          loop
          indicator={() => null}
          onIndexChange={(index) => index}
        >
          {hotel.hotelImages?.map((img, index) => (
            <Swiper.Item key={index}>
              <img
                src={img}
                alt=""
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                }}
              />
            </Swiper.Item>
          ))}
        </Swiper>
      </div>

      {/* ===== 酒店信息 Card ===== */}
      <div
        style={{
          background: '#fff',
          padding: '10px 16px',
          borderRadius: 16,
          marginTop: -40,
          position: 'relative',
          zIndex: 2,
        }}
      >
        {/* 酒店名称 */}
        <div
          style={{
            fontSize: 18,
            fontWeight: 'bold',
            marginBottom: 8,
          }}
        >
          {hotel.name.cn}（{hotel.name.en}）
        </div>

        {/* 评分 + 星级 + 开业时间*/}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            marginBottom: 8,
          }}
        >
          {/* 开业时间 */}
          <div
            style={{
              background: '#fba506',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            {hotel.openTime} 开业
          </div>
          {/* 蓝色评分块 */}
          <div
            style={{
              background: '#1677ff',
              color: '#fff',
              padding: '2px 8px',
              borderRadius: 8,
              fontSize: 13,
            }}
          >
            {hotel.score}
          </div>

          {/* 星级 */}
          <div style={{ fontSize: 14, color: '#f5a623' }}>
            {'★'.repeat(hotel.starRating)}
            {'☆'.repeat(5 - hotel.starRating)}
          </div>
        </div>

        {/* 地址 */}
        <div
          style={{
            fontSize: 14,
            color: '#666',
            marginBottom: 8,
          }}
        >
          {hotel.address}
        </div>

        {/* 标签区域 */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
          }}
        >
          {[
            hotel.themeFeatures?.[0],
            hotel.facilities?.[0],
            hotel.roomTypes?.[0],
          ]
            .filter(Boolean)
            .map((item, index) => (
              <div
                key={index}
                style={{
                  border: '1px solid #1677ff',
                  color: '#1677ff',
                  padding: '2px 8px',
                  borderRadius: 12,
                  fontSize: 12,
                }}
              >
                {item}
              </div>
            ))}

          {hotel.facilities?.length > 3 && (
            <span
              style={{
                fontSize: 12,
                color: '#1677ff',
              }}
            >
              +{hotel.facilities.length - 3}
            </span>
          )}
        </div>
      </div>

      {/* ===== 入住 + 筛选 Card ===== */}
      <div
        style={{
          background: '#fff',
          borderRadius: 16,
          padding: '0px 14px',
          boxShadow: '0 2px 8px rgba(0,0,0,0.05)',
        }}
      >
        {/* ===== 第一行：日期 + 间数 ===== */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
          }}
        >
          {/* 左侧 日期区域 75% */}
          <div style={{ flex: 4, display: 'flex', alignItems: 'flex-end' }}>
            <div style={{ width: '100%' }}>
              {/* 新增的外层 div，强制占满宽度 */}
              <DateRangeBar
                checkIn={search.checkIn}
                checkOut={search.checkOut}
                nights={search.nights}
                onClick={handleOpenCalendar}
              />
            </div>
          </div>

          {/* 中间分隔线 */}
          <div
            style={{
              color: '#ddd',
              fontSize: 18,
              margin: '0 8px', // 上下为0，左右为4px
            }}
          >
            |
          </div>

          {/* 右侧 间数人数 25% */}
          <div
            style={{
              display: 'flex', // 启用 Flexbox 布局
              alignItems: 'center', // 垂直方向底部对齐，使主面板从底部弹出
              gap: '10px', // 控制 1间房 和 1人 之间距离
              fontSize: 16,
              fontWeight: 'bold',
              cursor: 'pointer',
            }}
            onClick={() => setShowGuestPanel(true)}
          >
            <span>{search.rooms}间房</span>
            <span>{search.guests}人</span>
          </div>
        </div>

        {/* ===== 第二行：筛选条 ===== */}
        <div className="filter-bar">
          <div className="scroll-buttons">
            {getPriceLabel() && (
              <button
                className="price-filter-btn active"
                onClick={() => setShowFilterPanel(true)}
              >
                {getPriceLabel()}
              </button>
            )}

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

            {allFacilities.map((facility) => (
              <button
                key={facility}
                className={`facility-btn ${
                  selectedFacilities.includes(facility) ? 'active' : ''
                }`}
                onClick={() => toggleFacility(facility)}
              >
                {facility}
              </button>
            ))}

            {allThemeFeatures.map((theme) => (
              <button
                key={theme}
                className={`theme-btn ${
                  selectedThemeFeatures.includes(theme) ? 'active' : ''
                }`}
                onClick={() => toggleTheme(theme)}
              >
                {theme}
              </button>
            ))}
          </div>

          {/* 右侧固定筛选按钮 */}
          <div
            className={`filter-btn ${showFilterPanel ? 'active' : ''}`}
            onClick={() => setShowFilterPanel(!showFilterPanel)}
          >
            筛选 {showFilterPanel ? '▲' : '▼'}
          </div>
        </div>
      </div>

      {/* 房型价格列表 */}
      <div>
        {filteredRooms.length > 0 ? (
          filteredRooms.map((room) => <RoomCard key={room.id} room={room} />)
        ) : (
          <div
            style={{
              padding: 16,
              fontSize: 16,
            }}
          >
            暂无符合条件的房型
          </div>
        )}
      </div>

      {/* 日期选择弹窗 */}
      <DatePickerModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        defaultCheckIn={search.checkIn}
        defaultCheckOut={search.checkOut}
        onConfirm={handleDateConfirm}
      />

      {/* 间数人数选择面板 */}
      <GuestPanel
        visible={showGuestPanel}
        onClose={() => setShowGuestPanel(false)}
        rooms={search.rooms}
        guests={search.guests}
        onRoomsChange={(v) => dispatch(setSearchParams({ rooms: v }))}
        onGuestsChange={(v) => dispatch(setSearchParams({ guests: v }))}
      />

      {/* 筛选面板 */}
      <HotelDetailFilterPanel
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
