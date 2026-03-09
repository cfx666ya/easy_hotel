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

// 返回结构化数据
const formatDisplayDate = (dateString) => {
  if (!dateString) return null;

  const date = new Date(dateString);
  const month = date.getMonth() + 1;
  const day = date.getDate();

  const extra = isToday(date)
    ? '今天'
    : isTomorrow(date)
      ? '明天'
      : getWeekDay(date);

  return {
    main: `${month}月${day}日`,
    extra,
  };
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
  const displayData = useMemo(() => {
    if (!checkIn || !checkOut) return null;

    return {
      checkIn: formatDisplayDate(checkIn),
      checkOut: formatDisplayDate(checkOut),
    };
  }, [checkIn, checkOut]);

  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', // 子元素水平排列
        alignItems: 'center', // 垂直居中对齐所有子元素
        // justifyContent: 'space-between', // 两端对齐：左侧日期区域，右侧晚数
        padding: '12px 0px', // 上下内边距12px，左右内边距0px
        borderBottom: '1px solid #eee', // 底部浅灰色边框，分割不同行
        cursor: 'pointer', // 鼠标悬停时显示手型，表明可点击
      }}
    >
      {/* 左侧日期区域 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          flex: 1,
        }}
      >
        {displayData ? (
          <>
            {/* 入住日期 */}
            <div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                {displayData.checkIn.main}
              </span>
              <span
                style={{
                  margin: '0px 4px',
                  fontSize: 12,
                  fontWeight: 'normal',
                  color: '#7d7c7c',
                }}
              >
                {displayData.checkIn.extra}
              </span>
            </div>

            <span
              style={{
                margin: '0px 8px',
                color: '#666',
              }}
            >
              —
            </span>

            {/* 离店日期 */}
            <div>
              <span
                style={{
                  fontSize: 16,
                  fontWeight: 'bold',
                }}
              >
                {displayData.checkOut.main}
              </span>
              <span
                style={{
                  margin: '0px 4px',
                  fontSize: 12,
                  fontWeight: 'normal',
                  color: '#7d7c7c',
                }}
              >
                {displayData.checkOut.extra}
              </span>
            </div>
          </>
        ) : (
          <span>请选择日期</span>
        )}
      </div>

      {/* 右侧 nights */}
      {nights > 0 && (
        <span
          style={{
            fontSize: 14,
            color: '#666',
          }}
        >
          共{nights}晚
        </span>
      )}
    </div>
  );
}
