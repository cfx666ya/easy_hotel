import { useMemo } from 'react';

// 日期辅助函数
// 判断是否是今天
const isToday = (date) => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate()
  );
};

const isTomorrow = (date) => {
  const today = new Date();
  return (
    date.getFullYear() === today.getFullYear() &&
    date.getMonth() === today.getMonth() &&
    date.getDate() === today.getDate() + 1
  );
};

const getWeekDay = (date) => {
  const weeks = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return weeks[date.getDay()];
};

const formatDisplayDate = (dateString) => {
  if (!dateString) return '';
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

/**
 * 日期显示条组件
 * @param {Object} props
 * @param {string} props.checkIn - 入住日期 YYYY-MM-DD
 * @param {string} props.checkOut - 离店日期 YYYY-MM-DD
 * @param {number} props.nights - 间夜数
 * @param {Function} props.onClick - 点击回调
 */
export default function DateRangeBar({ checkIn, checkOut, nights, onClick }) {
  // 使用 useMemo 避免重复计算显示文本
  const displayText = useMemo(() => {
    if (!checkIn || !checkOut) return '请选择日期';
    const checkInText = formatDisplayDate(checkIn);
    const checkOutText = formatDisplayDate(checkOut);
    return `${checkInText} - ${checkOutText}`;
  }, [checkIn, checkOut]);

  return (
    <div className="date-range-bar" onClick={onClick}>
      <span className="date-range-text">{displayText}</span>
      {nights > 0 && <span className="nights-text">共{nights}晚</span>}
    </div>
  );
}
