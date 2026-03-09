/**
 * 星级组件
 */
const starButtons = [
  { key: '2-', label: '2星及以下', subLabel: '经济', min: null, max: 2 },
  { key: '3', label: '3星', subLabel: '舒适', min: 3, max: 3 },
  { key: '4', label: '4星', subLabel: '高档', min: 4, max: 4 },
  { key: '5', label: '5星', subLabel: '豪华', min: 5, max: 5 },
];

/**
 * 星级选择面板（受控组件）
 * @param {Object} props
 * @param {string[]} props.value - 当前选中的星级 key 数组
 * @param {Function} props.onChange - 星级变化回调 (newKeys) => void
 */
export default function LevelPanel({ value, onChange }) {
  // 内部状态直接使用 props.value，但为了支持清空等操作，我们可以提供本地点击处理
  const handleStarClick = (starKey) => {
    const newKeys = value.includes(starKey)
      ? value.filter((k) => k !== starKey)
      : [...value, starKey];
    onChange(newKeys);
  };

  return (
    <div style={{ padding: 16, background: '#fff' }}>
      {/* 标题 */}
      <div
        style={{
          fontSize: 16,
          marginBottom: 12,
        }}
      >
        星级
      </div>

      {/* grid 区域 */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: 10,
        }}
      >
        {starButtons.map((star) => {
          const active = value.includes(star.key);
          return (
            <div
              key={star.key}
              onClick={() => handleStarClick(star.key)}
              style={{
                padding: '10px 0',
                textAlign: 'center',
                borderRadius: 8,
                background: active ? '#1677ff' : '#eee',
                color: active ? '#fff' : '#000',
                fontSize: 14,
                cursor: 'pointer',
              }}
            >
              {/* 上面主文字 */}
              <div
                style={{
                  fontSize: 14,
                }}
              >
                {star.label}
              </div>

              {/* 下面副文字 */}
              <div
                style={{
                  fontSize: 12,
                  marginTop: 4,
                }}
              >
                {star.subLabel}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
