/**
 * 价格组件
 */
import { useState, useEffect } from 'react';
import { Slider } from 'antd';

// 默认价格范围限制
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 2000;

// 默认快捷价格按钮（基于 DEFAULT_MAX）
const DEFAULT_QUICK_BUTTONS = [
  { label: '￥200以下', min: 0, max: 200 },
  { label: '￥200-300', min: 200, max: 300 },
  { label: '￥300-400', min: 300, max: 400 },
  { label: '￥400-500', min: 400, max: 500 },
  { label: '￥500-600', min: 500, max: 600 },
  { label: '￥600-700', min: 600, max: 700 },
  { label: '￥700-800', min: 700, max: 800 },
  { label: '￥800以上', min: 800, max: DEFAULT_MAX },
];

/**
 * 价格选择面板（受控组件）
 * @param {Object} props
 * @param {[number, number]} props.value - 当前价格范围 [min, max]
 * @param {Function} props.onChange - 价格变化回调 (newRange) => void
 * @param {number} props.minLimit - 最小价格限制，默认 0
 * @param {number} props.maxLimit - 最大价格限制，默认 2000
 * @param {Array} props.quickButtons - 快捷按钮配置，默认使用 DEFAULT_QUICK_BUTTONS
 * @param {string} props.className - 额外的类名
 */
export default function PricePanel({
  value,
  onChange,
  minLimit = DEFAULT_MIN,
  maxLimit = DEFAULT_MAX,
  quickButtons = DEFAULT_QUICK_BUTTONS,
  className = '',
}) {
  // 输入框显示值（字符串，支持连续输入）
  const [minInput, setMinInput] = useState(String(value[0]));
  const [maxInput, setMaxInput] = useState(String(value[1]));

  // 当外部 value 变化时同步输入框显示
  useEffect(() => {
    setMinInput(String(value[0]));
    setMaxInput(String(value[1]));
  }, [value]);

  // 滑块变化
  const handleSliderChange = (newRange) => {
    onChange(newRange);
  };

  // 最低价输入变化
  const handleMinInputChange = (e) => {
    setMinInput(e.target.value);
  };

  // 最低价失焦：解析并触发 onChange
  const handleMinInputBlur = () => {
    let parsed = parseInt(minInput);
    if (isNaN(parsed)) parsed = minLimit;
    parsed = Math.max(minLimit, Math.min(parsed, value[1])); // 不能超过当前最大值
    onChange([parsed, value[1]]);
  };

  // 最高价输入变化
  const handleMaxInputChange = (e) => {
    setMaxInput(e.target.value);
  };

  // 最高价失焦
  const handleMaxInputBlur = () => {
    let parsed = parseInt(maxInput);
    if (isNaN(parsed)) parsed = maxLimit;
    parsed = Math.min(maxLimit, Math.max(parsed, value[0])); // 不能小于当前最小值
    onChange([value[0], parsed]);
  };

  // 快捷按钮点击
  const handleQuickClick = (min, max) => {
    onChange([min, max]);
  };

  // 判断当前价格是否与某个快捷按钮匹配（用于高亮）
  const isQuickActive = (btnMin, btnMax) => {
    return value[0] === btnMin && value[1] === btnMax;
  };

  // 价格标签显示
  const getPriceLabel = () => {
    const [min, max] = value;
    if (min === minLimit && max === maxLimit)
      return <span style={{ color: '#999' }}>不限</span>;
    if (min === minLimit) return <>￥{max}以下</>;
    if (max === maxLimit) return <>￥{min}以上</>;
    return (
      <>
        ￥{min}-{max}
      </>
    );
  };

  return (
    <div className={`price-panel ${className}`}>
      <div className="price-header">
        <span className="price-label">每晚价格</span>
        <span
          className="price-value"
          style={{
            color:
              value[0] === minLimit && value[1] === maxLimit
                ? '#999'
                : '#007aff',
          }}
        >
          {getPriceLabel()}
        </span>
      </div>

      <div className="price-slider">
        <Slider
          range
          min={minLimit}
          max={maxLimit}
          value={value}
          onChange={handleSliderChange}
          tooltip={{ formatter: (val) => `￥${val}` }}
        />
      </div>

      <div className="price-inputs">
        <input
          type="number"
          min={minLimit}
          max={value[1]}
          step={100}
          value={minInput}
          onChange={handleMinInputChange}
          onBlur={handleMinInputBlur}
        />
        <span> - </span>
        <input
          type="number"
          min={value[0]}
          max={maxLimit}
          step={100}
          value={maxInput}
          onChange={handleMaxInputChange}
          onBlur={handleMaxInputBlur}
        />
      </div>

      <div className="quick-price-buttons">
        {quickButtons.map((btn, index) => (
          <button
            key={index}
            className={`quick-price-btn ${isQuickActive(btn.min, btn.max) ? 'active' : ''}`}
            onClick={() => handleQuickClick(btn.min, btn.max)}
          >
            {btn.label}
          </button>
        ))}
      </div>
    </div>
  );
}
