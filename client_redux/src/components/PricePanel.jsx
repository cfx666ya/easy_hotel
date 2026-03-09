/**
 * 价格组件
 */
import { Slider } from 'antd';
import { EnvironmentOutline } from 'antd-mobile-icons';

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
}) {
  // }, [value]);
  const minInput = value[0];
  const maxInput = value[1];

  // 滑块变化
  const handleSliderChange = (newRange) => {
    onChange(newRange);
  };

  // 最低价输入变化
  const handleMinInputChange = (e) => {
    onChange([e.target.value, value[1]]);
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
    onChange([value[0], e.target.value]);
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
    <div
      style={{
        padding: 16,
        background: '#fff',
        borderRadius: 10,
      }}
    >
      {/* 标题 */}
      <div
        style={{
          display: 'flex', // 子元素水平排列
          alignItems: 'flex-end', // 子元素底部对齐
          gap: 4,
        }}
      >
        <span style={{ fontSize: 16 }}>价格</span>
        <span
          className="price-value"
          style={{
            fontSize: 14,
            color:
              value[0] === minLimit && value[1] === maxLimit
                ? '#999'
                : '#0065d1',
          }}
        >
          {getPriceLabel()}
        </span>
      </div>

      {/* Slider */}
      <div
        style={{
          padding: 4,
          background: '#fff',
          borderRadius: 10,
        }}
      >
        <Slider
          range
          min={minLimit}
          max={maxLimit}
          value={value}
          onChange={handleSliderChange}
          tooltip={{ formatter: (val) => `￥${val}` }}
          trackStyle={[{ backgroundColor: '#005eff' }]} // ✅ 已选区间 深蓝
          railStyle={{ backgroundColor: '#ccc' }} // ✅ 未选区间 白色
          handleRender={() => {
            return (
              <div
                style={{
                  width: 24,
                  height: 24,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <img
                  src="/your-logo.svg"
                  alt=""
                  style={{ width: 20, height: 20 }}
                />
              </div>
            );
          }}
        />
      </div>

      {/* 输入框区域 */}
      {/* 价格输入区域 */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          width: '100%',
          marginBottom: 12,
        }}
      >
        {/* 最低价 */}
        <div
          style={{
            flex: 1,
            minWidth: 0, // 关键
            borderRadius: 10,
            background: '#ffffff',
            padding: '4px 6px',
            border: '1px solid #ccc', // 添加这一行
          }}
        >
          <div style={{ fontSize: 12, color: '#999' }}>最低</div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 14 }}>￥</span>
            <input
              type="number"
              value={minInput}
              onChange={handleMinInputChange}
              onBlur={handleMinInputBlur}
              style={{
                flex: 1,
                minWidth: 0, // ⭐ 关键
                border: 'none',
                background: 'transparent',
                fontSize: 14,
                outline: 'none',
                marginLeft: 4,
              }}
            />
          </div>
        </div>

        {/* 中间连接线 */}
        <div
          style={{
            padding: '0 16px',
            color: '#999',
            flexShrink: 0, // 不允许被压缩
          }}
        >
          ——
        </div>

        {/* 最高价 */}
        <div
          style={{
            flex: 1,
            minWidth: 0, // 关键
            borderRadius: 10,
            background: '#ffffff',
            padding: '4px 6px',
            border: '1px solid #ccc', // 添加这一行
          }}
        >
          <div style={{ fontSize: 12, color: '#999' }}>最高</div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              marginTop: 4,
            }}
          >
            <span style={{ fontSize: 14 }}>￥</span>
            <input
              type="number"
              value={maxInput}
              onChange={handleMaxInputChange}
              onBlur={handleMaxInputBlur}
              style={{
                flex: 1,
                minWidth: 0, // 关键
                border: 'none',
                background: 'transparent',
                fontSize: 14,
                outline: 'none',
                marginLeft: 4,
              }}
            />
          </div>
        </div>
      </div>

      {/* 快捷按钮区域（推荐用 grid，自适应） */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)', // 每行3个
          gap: 10,
        }}
      >
        {quickButtons.map((btn, index) => {
          const active = isQuickActive(btn.min, btn.max);

          return (
            <div
              key={index}
              onClick={() => handleQuickClick(btn.min, btn.max)}
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
              {btn.label}
            </div>
          );
        })}
      </div>
    </div>
  );
}
