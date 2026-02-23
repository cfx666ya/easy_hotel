/**
 * 高级日期区间选择组件
 */
import { useState, useMemo } from 'react';

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

// 用于生成一个月的所有日期数据
function generateMonthDays(year, month) {
  // 小技巧：
  // new Date(year, month, 1)中，month表示当月，day为1表示当月第一天
  // new Date(year, month + 1, 0) 中，month + 1 表示下个月，day为0表示上个月的最后一天
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const days = [];

  // 获取当月第一天是星期几（0-6，0代表周日）
  const startWeek = firstDay.getDay();

  // 前面补空：根据第一天是星期几，在数组前面插入对应数量的null
  // 例如：如果1号是周三(startWeek=3)，则前面需要补3个null
  for (let i = 0; i < startWeek; i++) {
    days.push(null);
  }

  // 生成当月所有的日期，push 进 days 中，new Date 会根据年月日生成包括【星期、年月日、东8市区】的日期
  // lastDay.getDate() 获取当月的总天数
  for (let i = 1; i <= lastDay.getDate(); i++) {
    days.push(new Date(year, month, i));
  }

  return days;
}

// 将 Date 对象格式化为 YYYY-MM-DD 字符串（本地时间）
function formatYMD(date) {
  if (!date) return '';
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function DatePickerModal({
  visible, // 是否可见
  onClose, // 用户点击【关闭】的 callback 函数
  defaultCheckIn, // 在 query 中的 checkIn
  defaultCheckOut, // 在 query 中的 checkOut
  onConfirm, // 用户点击【完成】的 callback 函数
}) {
  // 使用 useMemo，在重新渲染时不需要重复计算 today 这个内容，它只在组件挂载时创建一次
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  // 用于在日历中高亮
  const [checkIn, setCheckIn] = useState(new Date(defaultCheckIn));
  const [checkOut, setCheckOut] = useState(new Date(defaultCheckOut));

  // 获取当天的月份
  const months = generateYearMonths();

  // 处理选中
  const handleSelect = (date) => {
    // 如果 date 在 today 之前，直接 return，实际上因为禁用也选不中
    if (isBefore(date, today)) return;

    if (!checkIn || (checkIn && checkOut)) {
      // 如果没选【入住】，或者【入住】和【离店】都选了，那么再点击的日期作为新【入住】
      setCheckIn(date);
      setCheckOut(null);
    } else if (date > checkIn) {
      // 如果选了【入住】，再次选中的日期作为【离店】
      setCheckOut(date);
    } else {
      // 如果都没选，再次选中的日期作为【入住】
      setCheckIn(date);
      setCheckOut(null);
    }
  };

  // 派生数据，间夜
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
                      // 如果当前格子没有日期数据，就渲染一个空白的日历格子
                      return <div key={index} className="day empty" />;
                    }

                    // 判断当前 day 是否在 today 前，用于决定是否禁用
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
              onConfirm(formatYMD(checkIn), formatYMD(checkOut), nights)
            }
          >
            完成（{nights}晚）
          </button>
        </div>
      </div>
    </div>
  );
}
