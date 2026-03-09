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
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
        zIndex: 1000,
      }}
    >
      <div
        style={{
          width: '100%',
          height: '85%',
          background: '#fff',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* ✅ 顶部导航 bar（与之前风格统一） */}
        <div
          style={{
            height: 45,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            borderBottom: '1px solid #eee',
            fontSize: 16,
            fontWeight: 600,
          }}
        >
          <span
            onClick={onClose}
            style={{
              position: 'absolute',
              left: 16,
              fontSize: 18,
              cursor: 'pointer',
            }}
          >
            ✕
          </span>
          选择日期
        </div>

        {/* ✅ 星期 bar（字体 13） */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            textAlign: 'center',
            padding: '8px 0',
            borderBottom: '1px solid #eee',
            fontSize: 13,
          }}
        >
          {WEEK_DAYS.map((w) => (
            <div key={w}>{w}</div>
          ))}
        </div>

        {/* ✅ 滚动区域 */}
        <div
          style={{
            flex: 1,
            overflowY: 'auto',
          }}
        >
          {months.map(({ year, month }) => {
            const days = generateMonthDays(year, month);

            return (
              <div key={`${year}-${month}`}>
                {/* ✅ sticky 月份标题（加粗 + 16px） */}
                <div
                  style={{
                    position: 'sticky',
                    top: 0,
                    background: '#fff',
                    padding: '8px 16px',
                    fontWeight: 600,
                    fontSize: 16,
                    zIndex: 5,
                  }}
                >
                  {year}年{month + 1}月
                </div>

                {/* 日期网格 */}
                <div
                  style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(7, 1fr)',
                    padding: '0 8px 16px',
                  }}
                >
                  {days.map((day, index) => {
                    if (!day) {
                      return <div key={index} />;
                    }

                    const disabled = isBefore(day, today);
                    const isStart = checkIn && isSameDay(day, checkIn);
                    const isEnd = checkOut && isSameDay(day, checkOut);
                    const inRange =
                      checkIn && checkOut && day > checkIn && day < checkOut;

                    return (
                      <div
                        key={index}
                        onClick={() => handleSelect(day)}
                        style={{
                          textAlign: 'center',
                          padding: '10px 0',
                          borderRadius: 8,
                          cursor: disabled ? 'not-allowed' : 'pointer',
                          fontSize: 14, // ✅ 每个格子字体 14
                          color: disabled
                            ? '#ccc'
                            : isStart || isEnd
                              ? '#fff'
                              : '#000',
                          background:
                            isStart || isEnd
                              ? '#007aff'
                              : inRange
                                ? '#e6f0ff'
                                : 'transparent',
                          pointerEvents: disabled ? 'none' : 'auto',
                        }}
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

        {/* ✅ 底部按钮 */}
        <div
          style={{
            padding: 16,
            borderTop: '1px solid #eee',
          }}
        >
          <button
            disabled={!checkIn || !checkOut}
            onClick={() =>
              onConfirm(formatYMD(checkIn), formatYMD(checkOut), nights)
            }
            style={{
              width: '100%',
              padding: 12,
              borderRadius: 24,
              border: 'none',
              background: '#007aff',
              color: '#fff',
              fontSize: 16,
              opacity: !checkIn || !checkOut ? 0.5 : 1,
            }}
          >
            完成（{nights}晚）
          </button>
        </div>
      </div>
    </div>
  );
}
