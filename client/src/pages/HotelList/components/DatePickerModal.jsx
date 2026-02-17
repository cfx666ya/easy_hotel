/**
 * 高级日期区间选择组件
 */
import { useState, useEffect, useMemo } from 'react';

const WEEK_DAYS = ['日', '一', '二', '三', '四', '五', '六'];

function isSameDay(d1, d2) {
  return d1.toDateString() === d2.toDateString();
}

function isBefore(d1, d2) {
  return d1.getTime() < d2.getTime();
}

function generateYearMonths() {
  const months = [];
  const today = new Date();

  for (let i = 0; i < 12; i++) {
    const date = new Date(today.getFullYear(), today.getMonth() + i, 1);
    months.push({
      year: date.getFullYear(),
      month: date.getMonth(),
    });
  }

  return months;
}

function generateMonthDays(year, month) {
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];

  // 前面补空
  const startWeek = firstDay.getDay();
  for (let i = 0; i < startWeek; i++) {
    days.push(null);
  }

  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  return days;
}

export default function DatePickerModal({
  visible,
  onClose,
  onConfirm,
  defaultCheckIn,
  defaultCheckOut,
}) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const tomorrow = useMemo(() => {
    const d = new Date(today);
    d.setDate(d.getDate() + 1);
    return d;
  }, [today]);

  const [checkIn, setCheckIn] = useState(today);
  const [checkOut, setCheckOut] = useState(tomorrow);

  useEffect(() => {
    if (defaultCheckIn && defaultCheckOut) {
      setCheckIn(new Date(defaultCheckIn));
      setCheckOut(new Date(defaultCheckOut));
    }
  }, [defaultCheckIn, defaultCheckOut]);

  const months = generateYearMonths();

  const handleSelect = (date) => {
    if (isBefore(date, today)) return;

    if (!checkIn || (checkIn && checkOut)) {
      setCheckIn(date);
      setCheckOut(null);
    } else if (date > checkIn) {
      setCheckOut(date);
    } else {
      setCheckIn(date);
      setCheckOut(null);
    }
  };

  const nights =
    checkIn && checkOut ? (checkOut - checkIn) / (1000 * 60 * 60 * 24) : 0;

  if (!visible) return null;

  return (
    <div className="calendar-overlay">
      <div className="calendar-container">
        {/* 顶部 bar */}
        <div className="calendar-top-bar">
          <span className="close-btn" onClick={onClose}>
            ✕
          </span>
          <span className="title">选择日期</span>
        </div>

        {/* 星期 bar */}
        <div className="week-bar">
          {WEEK_DAYS.map((w) => (
            <div key={w} className="week-item">
              {w}
            </div>
          ))}
        </div>

        {/* 滚动区域 */}
        <div className="calendar-scroll">
          {months.map(({ year, month }) => {
            const days = generateMonthDays(year, month);

            return (
              <div key={`${year}-${month}`} className="month-section">
                {/* sticky 月份标题 */}
                <div className="month-header">
                  {year}年{month + 1}月
                </div>

                <div className="month-grid">
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={index} className="day empty" />;
                    }

                    const disabled = isBefore(day, today);

                    const isStart = checkIn && isSameDay(day, checkIn);
                    const isEnd = checkOut && isSameDay(day, checkOut);

                    const inRange =
                      checkIn && checkOut && day > checkIn && day < checkOut;

                    return (
                      <div
                        key={index}
                        className={`
                          day
                          ${disabled ? 'disabled' : ''}
                          ${isStart ? 'start' : ''}
                          ${isEnd ? 'end' : ''}
                          ${inRange ? 'in-range' : ''}
                        `}
                        onClick={() => handleSelect(day)}
                      >
                        {day.getDate()}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* 底部按钮 */}
        <div className="calendar-footer">
          <button
            disabled={!checkIn || !checkOut}
            onClick={() =>
              onConfirm(checkIn.toISOString(), checkOut.toISOString(), nights)
            }
          >
            完成（{nights}晚）
          </button>
        </div>
      </div>
    </div>
  );
}
