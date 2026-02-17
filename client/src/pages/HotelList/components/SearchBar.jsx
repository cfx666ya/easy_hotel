import { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { buildHotelListQuery } from '../../../utils/hotelQuery';

export default function SearchBar({ query, onSearch, onOpenCalendar }) {
  const navigate = useNavigate();
  const [showPanel, setShowPanel] = useState(false);

  /* =========================
     日期格式化工具函数
  ========================== */

  // 判断是否是今天
  const isToday = (date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate()
    );
  };

  // 判断是否是明天
  const isTomorrow = (date) => {
    const today = new Date();
    return (
      date.getFullYear() === today.getFullYear() &&
      date.getMonth() === today.getMonth() &&
      date.getDate() === today.getDate() + 1
    );
  };

  // 获取星期
  const getWeekDay = (date) => {
    const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
    return weeks[date.getDay()];
  };

  // 格式化成：2月17日（今天） 或 2月21日（周六）
  const formatDisplayDate = (dateString) => {
    const date = new Date(dateString);

    const month = date.getMonth() + 1;
    const day = date.getDate();

    const extra = isToday(date)
      ? '今天'
      : isTomorrow(date)
        ? '明天'
        : getWeekDay(date);

    return `${month}月${day}日（${extra}）`;
  };

  // 生成完整展示字符串
  const getDisplayRange = () => {
    if (!query.checkIn || !query.checkOut) return '请选择日期';

    const checkInText = formatDisplayDate(query.checkIn);
    const checkOutText = formatDisplayDate(query.checkOut);

    return `${checkInText}-${checkOutText}  共${query.nights}晚`;
  };

  /* ========================= */

  const handleBack = () => {
    navigate('/');
  };

  const [searchParams] = useSearchParams();

  // 点击城市
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

  const handleKeywordClick = () => {
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

  const handleConfirm = () => {
    setShowPanel(false);
  };

  return (
    <div className="search-bar">
      {/* 左箭头 */}
      <div className="back" onClick={handleBack}>
        ←
      </div>

      {/* 搜索框 */}
      <div className="search-box">
        {/* 左部分 */}
        <div className="search-info" onClick={() => setShowPanel(!showPanel)}>
          <div className="city">{query.city}</div>
          <div className="date">{getDisplayRange()}</div>
        </div>

        {/* 右部分 */}
        <div className="search-keyword" onClick={handleKeywordClick}>
          🔍 搜索
        </div>
      </div>

      {/* 下拉弹框 */}
      {showPanel && (
        <div className="dropdown-panel">
          <div className="panel-city" onClick={handleCityClick}>
            {query.city}
          </div>

          <div className="panel-date" onClick={onOpenCalendar}>
            {getDisplayRange()}
          </div>

          <button onClick={handleConfirm}>确定</button>
        </div>
      )}
    </div>
  );
}
