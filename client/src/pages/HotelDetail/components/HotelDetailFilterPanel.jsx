/**
 * 酒店详情页中的 FilterPanel
 */

import { useState } from 'react';
import PricePanel from '../../../components/PricePanel.jsx'; // 根据实际路径调整

export default function HotelDetailFilterPanel({
  visible,
  onClose,
  allRoomTypes,
  allFacilities,
  allThemeFeatures,
  initialPriceRange,
  initialRoomType,
  initialFacilities,
  initialThemeFeatures,
  onConfirm,
  onClear,
  maxPriceLimit, // 新增
}) {
  // 临时状态
  const [tempPriceRange, setTempPriceRange] = useState(initialPriceRange);
  const [tempRoomType, setTempRoomType] = useState(initialRoomType);
  const [tempFacilities, setTempFacilities] = useState(initialFacilities);
  const [tempThemeFeatures, setTempThemeFeatures] =
    useState(initialThemeFeatures);

  // 快捷价格按钮配置（基于 maxPriceLimit）
  const quickPriceButtons = [
    { label: '￥250以下', min: 0, max: 250 },
    { label: '￥250-350', min: 250, max: 350 },
    { label: '￥350-500', min: 350, max: 500 },
    { label: '￥500-700', min: 500, max: 700 },
    { label: '￥700-1000', min: 700, max: 1000 },
    { label: '￥1000以上', min: 1000, max: maxPriceLimit },
  ];

  // 其他选择逻辑不变
  const handleRoomTypeClick = (roomType) => {
    setTempRoomType((prev) => (prev === roomType ? null : roomType));
  };

  const toggleFacility = (facility) => {
    setTempFacilities((prev) =>
      prev.includes(facility)
        ? prev.filter((f) => f !== facility)
        : [...prev, facility],
    );
  };

  const toggleTheme = (theme) => {
    setTempThemeFeatures((prev) =>
      prev.includes(theme) ? prev.filter((t) => t !== theme) : [...prev, theme],
    );
  };

  const handleConfirm = () => {
    onConfirm({
      priceRange: tempPriceRange,
      roomType: tempRoomType,
      facilities: tempFacilities,
      themeFeatures: tempThemeFeatures,
    });
    onClose();
  };

  // 清空所有筛选条件
  const handleClear = () => {
    const clearedRange = [0, maxPriceLimit];
    setTempPriceRange(clearedRange);
    setTempRoomType(null);
    setTempFacilities([]);
    setTempThemeFeatures([]);
    onClear();
  };

  if (!visible) return null;

  return (
    <div className="filter-panel-overlay" onClick={onClose}>
      <div className="filter-panel" onClick={(e) => e.stopPropagation()}>
        <div className="panel-header">
          <span className="close-btn" onClick={onClose}>
            ✕
          </span>
          <span className="title">筛选</span>
        </div>

        <div className="filter-content">
          {/* 房型部分 */}
          <div className="filter-section">
            <h4>房型</h4>
            <div className="filter-buttons">
              {allRoomTypes.map((roomType) => (
                <button
                  key={roomType}
                  className={`filter-btn ${tempRoomType === roomType ? 'active' : ''}`}
                  onClick={() => handleRoomTypeClick(roomType)}
                >
                  {roomType}
                </button>
              ))}
            </div>
          </div>

          {/* 客房设施 */}
          <div className="filter-section">
            <h4>客房设施</h4>
            <div className="filter-buttons">
              {allFacilities.map((facility) => (
                <button
                  key={facility}
                  className={`filter-btn ${tempFacilities.includes(facility) ? 'active' : ''}`}
                  onClick={() => toggleFacility(facility)}
                >
                  {facility}
                </button>
              ))}
            </div>
          </div>

          {/* 主题 */}
          <div className="filter-section">
            <h4>主题</h4>
            <div className="filter-buttons">
              {allThemeFeatures.map((theme) => (
                <button
                  key={theme}
                  className={`filter-btn ${tempThemeFeatures.includes(theme) ? 'active' : ''}`}
                  onClick={() => toggleTheme(theme)}
                >
                  {theme}
                </button>
              ))}
            </div>
          </div>

          {/* 价格部分 - 使用新的 PricePanel */}
          <div className="filter-section">
            <h4>价格范围</h4>
            <PricePanel
              value={tempPriceRange}
              onChange={setTempPriceRange}
              minLimit={0}
              maxLimit={maxPriceLimit}
              quickButtons={quickPriceButtons}
            />
          </div>
        </div>

        <div className="filter-actions">
          <button className="clear-btn" onClick={handleClear}>
            清空
          </button>
          <button className="confirm-btn" onClick={handleConfirm}>
            完成
          </button>
        </div>
      </div>
    </div>
  );
}
