import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildHotelListQuery } from '../../../utils/hotelQuery';
import { getPoiList, getWeather } from '../../../api/hotel'; // 引入新接口

import DatePickerModal from '../../../components/DatePickerModal.jsx';
import GuestPanel from '../../../components/GuestPanel.jsx';
import { SearchOutlined, LeftOutlined } from '@ant-design/icons';
import { Swiper, DotLoading, Input, Button } from 'antd-mobile';

export default function SearchBar({ query, keyword, onSearch, onDateChange }) {
  /**
   * 状态管理
   */
  const navigate = useNavigate();
  const [showCalendar, setShowCalendar] = useState(false);
  const [searchParams] = useSearchParams();
  const [inputValue, setInputValue] = useState(keyword || '');

  // 房间人数状态
  const [rooms, setRooms] = useState(1);
  const [guests, setGuests] = useState(2);
  const [showGuestPanel, setShowGuestPanel] = useState(false);

  // 新增：POI列表、当前选中的POI、天气信息
  const [poiList, setPoiList] = useState([]);
  // const [selectedPoi, setSelectedPoi] = useState(null);
  const [weather, setWeather] = useState(null);

  /**
   * 辅助函数相关
   */
  // 生成今天的日期字符串（YYYY-MM-DD）
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 生成明天的日期字符串
  const getTomorrowString = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // 格式化日期显示为 MM-DD
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return '';
    const month = match[2];
    const day = match[3];
    return `${month}-${day}`;
  };

  // 处理日历确认
  const handleCalendarConfirm = (checkIn, checkOut, nights) => {
    onDateChange({ checkIn, checkOut, nights });
    setShowCalendar(false);
  };

  // 打开日历
  const handleOpenCalendar = () => {
    setShowCalendar(true);
  };

  // 返回首页
  const handleBack = () => {
    navigate('/');
  };

  // 点击城市区域（跳转城市选择）
  const handleCityClick = () => {
    const currentQuery = {
      city: searchParams.get('city') || '',
      keyword: searchParams.get('keyword') || '',
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || '',
      nights: searchParams.get('nights') || '',
    };
    const queryString = buildHotelListQuery(currentQuery);
    navigate(`/city-select?${queryString}`);
  };

  // 房间人数变更
  const handleRoomsChange = (newRooms) => setRooms(newRooms);
  const handleGuestsChange = (newGuests) => setGuests(newGuests);

  // 处理【间数/人数】确认
  const handleGuestsConfirm = (newRooms, newGuests) => {
    setRooms(newRooms);
    setGuests(newGuests);
    setShowGuestPanel(false);
  };

  /**
   * useMemo 和 useEffect 操作
   */
  // 获取当前城市的 POI 列表
  useEffect(() => {
    if (!query.city) return;
    getPoiList(query.city)
      .then(setPoiList)
      .catch((err) => console.error('获取POI列表失败:', err));
  }, [query.city]);

  // 缓存计算结果，依赖 poiList、query.poiId
  // 当这俩改变时重新计算 selectedPoi 并重新渲染，同时 useEffect 监听会改变天气
  const selectedPoi = useMemo(() => {
    if (poiList.length === 0) return null;

    let poi = null;

    if (query.poiId) {
      poi = poiList.find((p) => p.id === Number(query.poiId));
    }

    if (!poi) {
      poi = poiList.find((p) => p.type === 'hot') || poiList[0];
    }

    return poi;
  }, [poiList, query.poiId]);

  // 当用户改变 selectedPoi 时，根据选中的 POI 获取天气
  useEffect(() => {
    if (!selectedPoi) return;
    getWeather(selectedPoi.lat, selectedPoi.lng)
      .then(setWeather)
      .catch((err) => console.error('获取天气失败:', err));
  }, [selectedPoi]);

  return (
    <div
      style={{
        width: '100%',
        padding: '10px 6px',
        background: '#fff',
        boxSizing: 'border-box', // 使padding包含在宽度
        overflowX: 'hidden', // 防止横向滚动
        height: '60px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* 返回 */}
        <div
          onClick={handleBack}
          style={{
            fontSize: 18,
            marginRight: 8,
            cursor: 'pointer',
            flexShrink: 0, // 防止在空间不足时被压缩
            display: 'flex',
            alignItems: 'center',
          }}
        >
          <LeftOutlined />
        </div>

        {/* 主灰色容器 */}
        <div
          style={{
            flex: 1,
            background: '#f5f5f5',
            borderRadius: 50,
            padding: '3px 8px',
            display: 'flex',
            alignItems: 'center',
            boxSizing: 'border-box',
            overflow: 'hidden', // 关键
          }}
        >
          {/* 城市天气 */}
          <div
            onClick={handleCityClick}
            style={{
              flex: '0 0 20%', // 固定占 10%
              maxWidth: '20%', // 防止被拉伸
              marginRight: 10,
              cursor: 'pointer',
              textAlign: 'center',
              overflow: 'hidden', // 超出裁剪
            }}
          >
            <div
              style={{
                fontSize: 12,
                fontWeight: 500,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis', // 超出显示 ...
              }}
            >
              {query.city}
              {selectedPoi && `·${selectedPoi.name}`}
            </div>

            <div
              style={{
                fontSize: 12,
                color: '#888',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              {weather ? `${weather.weather}·${weather.temperature}℃` : ''}
            </div>
          </div>

          {/* 日期 */}
          <div
            onClick={handleOpenCalendar}
            style={{
              marginRight: 10,
              cursor: 'pointer',
              flexShrink: 0,
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: 12 }}>
              {formatDisplayDate(query.checkIn || getTodayString())}
            </div>
            <div style={{ fontSize: 12 }}>
              {formatDisplayDate(query.checkOut || getTomorrowString())}
            </div>
          </div>

          {/* 人数 */}
          <div
            onClick={() => setShowGuestPanel(true)}
            style={{
              marginRight: 10,
              cursor: 'pointer',
              flexShrink: 0,
            }}
          >
            <div style={{ fontSize: 12 }}>{rooms}间</div>
            <div style={{ fontSize: 12 }}>{guests}人</div>
          </div>

          {/* 分割线 */}
          <div
            style={{
              width: 1,
              height: 28,
              background: '#fff',
              margin: '0 4px',
              flexShrink: 0,
            }}
          />

          {/* 输入区域 */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              minWidth: 0, // 关键
              margin: '0 4px',
            }}
          >
            <SearchOutlined
              style={{
                fontSize: 16,
                marginRight: 6,
              }}
            />

            {/* 包裹容器：相对定位，占据剩余宽度 */}
            <div style={{ position: 'relative', flex: 1, minWidth: 0 }}>
              <Input
                placeholder="位置/品牌/酒店"
                value={inputValue}
                onChange={setInputValue}
                style={{
                  width: '100%',
                  fontSize: 16,
                  border: 'none',
                  background: 'transparent',
                  paddingRight: inputValue ? 24 : 0, // 为清空按钮预留空间
                  outline: 'none',
                }}
              />
              {/* 清空按钮：当有输入值时显示 */}
              {inputValue && (
                <div
                  onClick={() => setInputValue('')}
                  style={{
                    position: 'absolute',
                    right: 4, // 距离右侧距离，避免与搜索按钮重叠
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

            <button
              onClick={() => onSearch(inputValue)}
              style={{
                marginLeft: 6,
                background: '#fff',
                border: 'none',
                borderRadius: 50,
                color: '#1677ff',
                fontSize: 14,
                cursor: 'pointer',
                flexShrink: 0,
              }}
            >
              搜索
            </button>
          </div>
        </div>
      </div>

      <DatePickerModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        defaultCheckIn={query.checkIn || getTodayString()}
        defaultCheckOut={query.checkOut || getTomorrowString()}
        onConfirm={handleCalendarConfirm}
      />

      <GuestPanel
        visible={showGuestPanel}
        onClose={() => setShowGuestPanel(false)}
        rooms={rooms}
        guests={guests}
        onRoomsChange={handleRoomsChange}
        onGuestsChange={handleGuestsChange}
        onConfirm={handleGuestsConfirm}
      />
    </div>
  );
}
