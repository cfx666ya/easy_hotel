import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchParams } from '../../store/slices/searchSlice';
import DateRangeBar from '../../components/DateRangeBar';
import GuestPanel from '../../components/GuestPanel';
import PricePanel from '../../components/PricePanel';
import LevelPanel from '../../components/LevelPanel';
import PriceLevelPanel from '../../components/PriceLevelPanel';
import DatePickerModal from '../../components/DatePickerModal.jsx';
import { fetchLocationByCoords } from '../../api/location';

import { Swiper, DotLoading, Input, Button } from 'antd-mobile';
import { EnvironmentOutline } from 'antd-mobile-icons';
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
  5: '5星',
  4: '4星',
  3: '3星',
  '2-': '2星及以下',
};

export default function IndexPage() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const search = useSelector((state) => state.search);

  /**
   * ---------- 轮播 banner 相关 ----------
   */
  // 当前图片广告
  const [current, setCurrent] = useState(0);

  // 点击广告跳转
  const handleClick = (hotelId) => {
    navigate(`/hotel-detail/${hotelId}`);
  };

  // 定时器，3s后自动跳到下一个
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 3000);

    return () => clearInterval(timer);
  }, []);

  /**
   * ---------- 城市与定位状态 ----------
   */
  const [displayCity, setDisplayCity] = useState(search.city); // 左侧显示的城市文字
  const [locatedAddress, setLocatedAddress] = useState(''); // 定位到的具体地址（显示在bar中）
  const [bubbleStatus, setBubbleStatus] = useState('hidden'); // 指定气泡状态， hidden | loading | success

  // 点击定位 logo 后执行的函数
  const handleLocate = () => {
    if (!navigator.geolocation) {
      alert('您的浏览器不支持地理位置');
      return;
    }
    setBubbleStatus('loading');

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        try {
          const { address, city } = await fetchLocationByCoords(
            latitude,
            longitude,
          );
          setDisplayCity('我的位置');
          dispatch(setSearchParams({ city }));
          setLocatedAddress(address);
          setBubbleStatus('success');
        } catch (error) {
          alert('获取地址失败：' + error.message);
          setBubbleStatus('hidden');
        }
      },
      (error) => {
        alert('无法获取您的位置：' + error.message);
        setBubbleStatus('hidden');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  };

  // ---------- 搜索关键词 ----------
  const [keyword, setKeyword] = useState(search.keyword);

  // ---------- 日期范围 ----------
  const [showCalendar, setShowCalendar] = useState(false);

  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // ---------- 房间与人数 ----------
  const [showGuestPanel, setShowGuestPanel] = useState(false);

  // ---------- 价格与星级 ----------
  const [priceRange, setPriceRange] = useState(null);
  const [selectedLevels, setSelectedLevels] = useState([]);
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
        .join(',');
      parts.push(levelText);
    }
    return parts.join(',');
  };
  // const hasPriceLevelSelection = priceRange || selectedLevels.length > 0;

  // ---------- 日期变更（来自DateRangeBar）----------
  // 打开日历（同时关闭下拉面板）
  const handleOpenCalendar = () => {
    setShowCalendar(true);
  };

  const handleDateChange = ({ checkIn, checkOut, nights }) => {
    dispatch(setSearchParams({ checkIn, checkOut, nights }));
  };

  // 处理日历确认
  const handleCalendarConfirm = (checkIn, checkOut, nights) => {
    handleDateChange({ checkIn, checkOut, nights });
    setShowCalendar(false);
  };

  // ---------- 房间人数变更 ----------
  const handleRoomsChange = (newRooms) =>
    dispatch(setSearchParams({ rooms: newRooms }));
  const handleGuestsChange = (newGuests) =>
    dispatch(setSearchParams({ guests: newGuests }));

  // ---------- 价格/星级清空 ----------
  const clearPriceLevel = () => {
    setPriceRange(null);
    setSelectedLevels([]);
  };

  // 处理【间数/人数】确认
  const handleGuestsConfirm = (newRooms, newGuests) => {
    dispatch(setSearchParams({ rooms: newRooms, guests: newGuests }));
    setShowGuestPanel(false);
  };

  // ---------- 查询按钮 ----------
  const handleSearch = () => {
    const params = new URLSearchParams();
    params.set('city', search.city);
    if (keyword) params.set('keyword', keyword);
    params.set('checkIn', search.checkIn);
    params.set('checkOut', search.checkOut);
    params.set('nights', search.nights);
    if (priceRange) {
      params.set('minPrice', priceRange[0]);
      params.set('maxPrice', priceRange[1]);
    }
    console.log('selectedLevels', selectedLevels);
    if (selectedLevels.length > 0) {
      // 将字符串数组转换为数字数组
      const levels = selectedLevels.map((level) => Number(level));
      const maxLevel = Math.max(...levels);
      const minLevel = Math.min(...levels);

      params.set('starMax', maxLevel);
      params.set('starMin', minLevel);
    }
    // 注意：rooms/guests 未传递给列表页（可根据实际API决定是否传递）
    navigate(`/hotel-list?${params.toString()}`);
  };
  return (
    <div>
      {/* ===== Banner 轮播 ===== */}
      <div
        style={{
          width: '100%',
          height: '20vh', // 高度为视口高度的20%（占屏幕1/5）
          position: 'relative', // 相对定位，为绝对定位的子元素提供参考
          overflow: 'hidden', // 隐藏超出容器的内容
        }}
      >
        <Swiper
          autoplay // 自动轮播
          loop // 循环播放（最后一张后回到第一张）
          onIndexChange={(index) => setCurrent(index)} // 当前索引变化时的回调，当轮播图切换到新的一张时，更新 current 状态
          indicator={() => null} // 隐藏默认的指示器，隐藏 Swiper 自带的小圆点，因为我们后面要自定义
        >
          {banners.map((item) => (
            // Swiper 要求每个轮播项必须用此组件包裹
            <Swiper.Item key={item.id}>
              <div
                style={{ width: '100%', height: '100%' }}
                onClick={() => handleClick(item.hotelId)}
              >
                <img
                  src={item.img}
                  alt=""
                  style={{
                    width: '100%', // 铺满父容器
                    height: '100%',
                    objectFit: 'fill', // 不裁剪，自由缩放
                  }}
                />
              </div>
            </Swiper.Item>
          ))}
        </Swiper>

        {/* 右下角 dots */}
        <div
          style={{
            position: 'absolute', // 绝对定位，相对于外层容器
            right: 14, // 距离右边12px
            bottom: 14, // 距离底部10px
            display: 'flex', // flex布局，使小圆点水平排列
            gap: 6, // 小圆点之间的间距
          }}
        >
          {banners.map((_, index) => (
            <span
              key={index}
              style={{
                width: 6,
                height: 6,
                borderRadius: '50%', // 圆形
                background:
                  current === index ? '#fff' : 'rgba(255,255,255,0.5)', //通过判断 current === index 来设置不同颜色
              }}
            />
          ))}
        </div>
      </div>

      {/* ===== 悬浮 Card 区域 ===== */}
      <div
        style={{
          background: '#fff',
          position: 'relative', // 相对定位，为内部绝对定位元素提供参考
          borderRadius: 50, // 大圆角（50px），创造独特视觉效果
          marginTop: -10, // 负边距，向上移动10px，与上方元素重叠
          padding: '0 9px', // 左右内边距9px，上下0
        }}
      >
        <div
          style={{
            background: '#fff',
            borderRadius: 20,
            padding: 16,
            boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
            position: 'relative', // 为气泡提示提供定位参考
          }}
        >
          {/* 定位气泡提示 */}
          {bubbleStatus !== 'hidden' && ( // 当bubbleStatus不是'hidden'时才显示
            <div
              style={{
                position: 'absolute', // 绝对定位，相对于父级div
                top: 8, // 距离顶部8px
                left: 16, // 距离左边16px
                zIndex: 20, // 层级高，确保在其他元素之上
                pointerEvents: 'none', // 不响应鼠标/触摸事件，让点击穿透到下层
              }}
            >
              {/* 气泡主体 */}
              <div
                style={{
                  background: '#fff',
                  padding: '8px 16px',
                  borderRadius: 14,
                  boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                  fontSize: 13,
                  position: 'relative', // 相对定位，用于箭头定位
                  maxWidth: 260,
                }}
              >
                {bubbleStatus === 'loading' && (
                  <span style={{ color: '#666' }}>正在定位…</span>
                )}

                {bubbleStatus === 'success' && (
                  <>
                    已定位到
                    <span
                      style={{
                        color: '#1677ff',
                        fontWeight: 700,
                      }}
                    >
                      {' '}
                      {locatedAddress}{' '}
                    </span>
                    附近
                  </>
                )}

                {/* 箭头，通过设置不同方向的边框颜色来创建三角形 */}
                <div
                  style={{
                    position: 'absolute', // 绝对定位，相对于气泡主体
                    bottom: -8,
                    left: 24,
                    width: 0,
                    height: 0,
                    borderLeft: '8px solid transparent', // 左边透明边框
                    borderRight: '8px solid transparent', // 右边透明边框
                    borderTop: '8px solid #fff', // 上边白色边框，形成向下的箭头
                  }}
                />
              </div>
            </div>
          )}

          {/* 第一行：城市 + 定位 + 输入框 */}
          <div
            style={{
              display: 'flex', // 启用 Flexbox 布局
              alignItems: 'center', // 垂直方向底部对齐，使主面板从底部弹出
              gap: 8, // 子元素之间的间距为 8px
              // marginBottom: 12, // 底部外边距 12px，与下一行内容拉开距离
              paddingBottom: '12px', // 上下内边距12px，左右内边距0px
              marginTop: bubbleStatus !== 'hidden' ? 55 : 0, // 给气泡留空间
              borderBottom: '1px solid #eee', // 底部浅灰色边框，分割不同行
            }}
          >
            {/* 我的位置/城市 */}
            <div
              style={{
                fontWeight: 600, // 字体加粗（等同于 bold）
                fontSize: 16, // 16px 字体大小
                whiteSpace: 'nowrap', // 防止文字换行，强制单行显示
                position: 'relative', // 相对定位，为可能的后续效果预留
              }}
              onClick={() =>
                navigate('/city-select', {
                  state: { currentCity: search.city },
                })
              }
            >
              {displayCity}
            </div>
            {/* 定位logo */}
            <EnvironmentOutline
              fontSize={20} // 图标大小 20px
              color="#1677ff"
              onClick={handleLocate}
            />
            {/* 分隔符 */}
            <div
              style={{
                color: '#ddd',
                fontSize: 18,
                margin: '0 4px', // 上下为0，左右为4px
              }}
            >
              |
            </div>
            {/* 输入框 */}
            <div
              style={{
                flex: 1, // flex: 1 让输入框占据剩余所有空间
                position: 'relative', // 用于定位输入框中的清空按钮
              }}
            >
              <Input
                placeholder="位置/品牌/酒店"
                value={keyword}
                onChange={(val) => setKeyword(val)}
                style={{
                  '--font-size': '16px', // antd-mobile 官方推荐方式，修改字体大小
                }}
              />

              {/* 清空按钮 */}
              {keyword && (
                <div
                  onClick={() => setKeyword('')}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 18,
                    height: 18,
                    borderRadius: '50%', // 圆形
                    background: '#ccc',
                    color: '#fff',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer', // 鼠标悬停时显示手型，表明可点击
                  }}
                >
                  ×
                </div>
              )}
            </div>
          </div>

          {/* 日期 */}
          <div>
            <DateRangeBar
              checkIn={search.checkIn}
              checkOut={search.checkOut}
              nights={search.nights}
              onClick={handleOpenCalendar}
            />
          </div>

          {/* 人数 + 价格 */}
          <div
            style={{
              display: 'flex', // 启用 Flexbox 布局
              alignItems: 'center', // 垂直方向底部对齐，使主面板从底部弹出
              gap: 8, // 子元素之间的间距为 8px
              padding: '12px 0px', // 上下内边距12px，左右内边距0px
              borderBottom: '1px solid #eee', // 底部浅灰色边框，分割不同行
            }}
          >
            <div
              style={{
                display: 'flex', // 启用 Flexbox 布局
                alignItems: 'center', // 垂直方向底部对齐，使主面板从底部弹出
                gap: '14px', // 控制 1间房 和 1人 之间距离
                fontSize: 16,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
              onClick={() => setShowGuestPanel(true)}
            >
              <span>{search.rooms}间房</span>
              <span>{search.guests}人</span>
            </div>

            {/* 中间分隔线 */}
            <div
              style={{
                color: '#ddd',
                fontSize: 18,
                margin: '0 4px', // 上下为0，左右为4px
              }}
            >
              |
            </div>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                flex: 1, // 占据右侧剩余位置
              }}
              onClick={() => setShowPriceLevelPanel(true)}
            >
              <Input
                placeholder="价格/星级"
                value={getPriceLevelText()}
                readOnly // 禁止输入
                onClick={() => setShowPriceLevelPanel(true)} // 点击弹 panel
                style={{
                  '--font-size': '16px',
                  color: getPriceLevelText() ? '#333' : '#999',
                }}
              />

              {/* 圆形清空按钮 */}
              {getPriceLevelText() && (
                <div
                  onClick={(e) => {
                    e.stopPropagation(); // ✅ 防止触发 panel
                    clearPriceLevel();
                  }}
                  style={{
                    position: 'absolute',
                    right: 10,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 18,
                    height: 18,
                    borderRadius: '50%',
                    background: '#ccc',
                    color: '#fff',
                    fontSize: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                  }}
                >
                  ×
                </div>
              )}
            </div>
          </div>

          {/* 查询按钮 */}
          <Button
            block
            color="primary"
            size="large"
            style={{
              borderRadius: 28,
              height: 48,
              fontSize: 16,
              fontWeight: 'bold',
            }}
            onClick={handleSearch}
          >
            查询
          </Button>
        </div>
      </div>

      {/* 以下弹窗组件保持不变 */}
      <GuestPanel
        visible={showGuestPanel}
        onClose={() => setShowGuestPanel(false)}
        rooms={search.rooms}
        guests={search.guests}
        onRoomsChange={handleRoomsChange}
        onGuestsChange={handleGuestsChange}
        onConfirm={handleGuestsConfirm}
      />
      {/* 替换原有的价格/星级底部弹窗 */}
      <PriceLevelPanel
        visible={showPriceLevelPanel}
        priceRange={priceRange}
        selectedLevels={selectedLevels}
        onClose={() => setShowPriceLevelPanel(false)}
        onConfirm={(newPriceRange, newSelectedLevels) => {
          setPriceRange(newPriceRange);
          setSelectedLevels(newSelectedLevels);
          setShowPriceLevelPanel(false);
        }}
        minLimit={0}
        maxLimit={2000}
        // 如果需要自定义快捷按钮，可以传入 quickButtons
      />
      <DatePickerModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        defaultCheckIn={today}
        defaultCheckOut={tomorrow}
        onConfirm={handleCalendarConfirm}
      />
    </div>
  );
}
