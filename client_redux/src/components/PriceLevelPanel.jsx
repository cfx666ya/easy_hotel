import { useState } from 'react';
import PricePanel from './PricePanel';
import LevelPanel from './LevelPanel';

const DEFAULT_PRICE_RANGE = [0, 2000]; // 默认价格范围（表示不限）

/**
 * 价格/星级选择面板（底部弹窗）
 * @param {Object} props
 * @param {boolean} props.visible - 控制显示
 * @param {[number, number] | null} props.priceRange - 父组件当前价格范围（null表示未选择）
 * @param {string[]} props.selectedLevels - 父组件当前星级选择
 * @param {Function} props.onClose - 关闭面板回调
 * @param {Function} props.onConfirm - 确认回调，参数为 (priceRange, selectedLevels)
 * @param {number} props.minLimit - 最小价格限制，透传给 PricePanel
 * @param {number} props.maxLimit - 最大价格限制，透传给 PricePanel
 * @param {Array} props.quickButtons - 快捷按钮配置，透传给 PricePanel
 */
export default function PriceLevelPanel({
  visible,
  priceRange,
  selectedLevels,
  onClose,
  onConfirm,
  minLimit = 0,
  maxLimit = 2000,
  quickButtons,
}) {
  // 临时状态（用于面板内修改）
  const [tempPriceRange, setTempPriceRange] = useState(
    priceRange || DEFAULT_PRICE_RANGE,
  );
  const [tempSelectedLevels, setTempSelectedLevels] = useState(
    selectedLevels || [],
  );

  // 处理价格变化
  const handlePriceChange = (newRange) => {
    setTempPriceRange(newRange);
  };

  // 处理星级变化
  const handleLevelChange = (newLevels) => {
    setTempSelectedLevels(newLevels);
  };

  // 清空：价格设为默认（不限），星级清空
  const handleClear = () => {
    setTempPriceRange(DEFAULT_PRICE_RANGE);
    setTempSelectedLevels([]);
  };

  // 完成：判断价格是否默认，返回 null 或实际数组
  const handleConfirm = () => {
    const finalPriceRange =
      tempPriceRange[0] === DEFAULT_PRICE_RANGE[0] &&
      tempPriceRange[1] === DEFAULT_PRICE_RANGE[1]
        ? null
        : tempPriceRange;
    onConfirm(finalPriceRange, tempSelectedLevels);
  };

  if (!visible) return null;
  return (
    <>
      {/* 主遮罩，一个全屏半透明黑色背景 */}
      <div
        style={{
          position: 'fixed', // 固定定位，相对于视口
          inset: 0, // 等同于 top:0; right:0; bottom:0; left:0，铺满全屏
          background: 'rgba(0,0,0,0.4)', // 黑色半透明，40% 不透明度
          zIndex: 999, // 层级较高，确保遮罩位于其他内容之上
          display: 'flex', // 启用 Flexbox 布局
          justifyContent: 'center', // 水平居中子元素
          alignItems: 'flex-end', // 垂直方向底部对齐，使主面板从底部弹出
        }}
        onClick={onClose} // 点击遮罩关闭
      >
        <div
          style={{
            position: 'fixed',
            left: 0,
            right: 0,
            bottom: 0,
            background: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            display: 'flex',
            flexDirection: 'column',
            maxHeight: '85vh',
            zIndex: 21, // 层级高，确保在其他元素之上
          }}
          onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
        >
          {/* ===== 顶部导航栏 ===== */}
          <div
            style={{
              position: 'relative',
              padding: '14px 16px',
              borderBottom: '1px solid #f0f0f0',
              textAlign: 'center',
            }}
          >
            {/* 左侧关闭 */}
            <button
              onClick={onClose}
              style={{
                position: 'absolute',
                left: 16,
                top: '50%',
                transform: 'translateY(-50%)',
                border: 'none',
                background: 'transparent',
                fontSize: 18,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>

            {/* 标题 */}
            <span
              style={{
                fontSize: 16,
                fontWeight: 500,
              }}
            >
              选择价格/星级
            </span>
          </div>

          {/* ===== 中间内容区域 ===== */}
          <div
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: 16,
              display: 'flex',
              flexDirection: 'column',
              gap: 16, // PricePanel 和 LevelPanel 间距 16
            }}
          >
            <PricePanel
              value={tempPriceRange}
              onChange={handlePriceChange}
              minLimit={minLimit}
              maxLimit={maxLimit}
              quickButtons={quickButtons}
            />

            <LevelPanel
              value={tempSelectedLevels}
              onChange={handleLevelChange}
            />
          </div>

          {/* ===== 底部按钮栏 ===== */}
          <div
            style={{
              borderTop: '1px solid #e5e5e5', // 灰色分割线
              padding: 12,
              display: 'flex',
              gap: 12,
            }}
          >
            {/* 清空按钮 */}
            <button
              onClick={handleClear}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 8,
                border: '1px solid #d9d9d9',
                background: '#fff',
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              清空
            </button>

            {/* 完成按钮 */}
            <button
              onClick={handleConfirm}
              style={{
                flex: 1,
                height: 44,
                borderRadius: 8,
                border: 'none',
                background: '#1677ff',
                color: '#fff',
                fontSize: 16,
                cursor: 'pointer',
              }}
            >
              完成
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
