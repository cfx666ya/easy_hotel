import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildHotelListQuery } from '../../../utils/hotelQuery';
import { getPoiList, getWeather } from '../../../api/hotel'; // 引入新接口

import DatePickerModal from '../../../components/DatePickerModal.jsx';
import GuestPanel from '../../../components/GuestPanel.jsx';

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

  // 格式化日期显示为 MM.DD
  const formatDisplayDate = (dateStr) => {
    if (!dateStr) return '';
    const match = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (!match) return '';
    const month = match[2];
    const day = match[3];
    return `${month}.${day}`;
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

  /**
   * 页面样式返回
   */
  return (
    <div className="search-bar">
      {/* 左箭头 */}
      <div className="back" onClick={handleBack}>
        ←
      </div>

      {/* 搜索框 */}
      <div className="search-box">
        {/* 左侧：城市+地点 + 天气 */}
        <div className="panel-city" onClick={handleCityClick}>
          <div className="city-poi">
            {query.city}
            {selectedPoi && `·${selectedPoi.name}`}
          </div>
          {weather && (
            <div className="weather">
              {weather.weather}·{weather.temperature}℃
            </div>
          )}
        </div>

        {/* 日期显示区域（点击打开日历） */}
        <div className="date-display" onClick={handleOpenCalendar}>
          <div className="date-item">{formatDisplayDate(query.checkIn)}</div>
          <div className="date-item">{formatDisplayDate(query.checkOut)}</div>
        </div>

        {/* 间数人数显示区域（点击打开GuestPanel） */}
        <div className="guest-display" onClick={() => setShowGuestPanel(true)}>
          <div className="guest-item">{rooms}间</div>
          <div className="guest-item">{guests}人</div>
        </div>

        {/* 右侧：搜索输入框部分 */}
        <div className="search-keyword-box">
          <input
            type="text"
            placeholder={`搜索${query.city}的位置/酒店名称`}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
          />
          {inputValue && (
            <span className="clear-btn" onClick={() => setInputValue('')}>
              ✖
            </span>
          )}
          <button className="search-btn" onClick={() => onSearch(inputValue)}>
            搜索
          </button>
        </div>
      </div>

      {/* 日历模态框 */}
      <DatePickerModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        defaultCheckIn={query.checkIn || getTodayString()}
        defaultCheckOut={query.checkOut || getTomorrowString()}
        onConfirm={handleCalendarConfirm}
      />

      {/* GuestPanel弹窗 */}
      <GuestPanel
        visible={showGuestPanel}
        onClose={() => setShowGuestPanel(false)}
        rooms={rooms}
        guests={guests}
        onRoomsChange={handleRoomsChange}
        onGuestsChange={handleGuestsChange}
      />
    </div>
  );
}
