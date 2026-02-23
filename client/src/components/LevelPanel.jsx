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
    <div className="star-buttons">
      {starButtons.map((star) => (
        <button
          key={star.key}
          className={`star-btn ${value.includes(star.key) ? 'active' : ''}`}
          onClick={() => handleStarClick(star.key)}
        >
          <div className="star-main">{star.label}</div>
          <div className="star-sub">{star.subLabel}</div>
        </button>
      ))}
    </div>
  );
}
