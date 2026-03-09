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
    <>
      {/* 主遮罩，一个全屏半透明黑色背景 */}
      <div
        style={{
          position: 'fixed',
          inset: 0, // 等同于 top:0; right:0; bottom:0; left:0，铺满全屏
          background: 'rgba(0,0,0,0.4)', // 黑色半透明，40% 不透明度
          zIndex: 998, // 层级较高，确保遮罩位于其他内容之上
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
          onClick={(e) => e.stopPropagation()}
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
              筛选
            </span>
          </div>

          <div className="filter-content">
            {/* 房型部分 */}
            <div style={{ marginTop: 8, marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 16,
                  marginBottom: 12,
                  padding: '0px 16px',
                }}
              >
                房型
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 10,
                  padding: '0px 16px',
                }}
              >
                {allRoomTypes.map((roomType) => {
                  const isActive = tempRoomType === roomType;
                  return (
                    <div
                      key={roomType}
                      onClick={() => handleRoomTypeClick(roomType)}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'center',
                        borderRadius: 8,
                        background: isActive ? '#1677ff' : '#eee',
                        color: isActive ? '#fff' : '#000',
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      {roomType}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 客房设施 */}
            <div style={{ marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 16,
                  marginBottom: 12,
                  padding: '0px 16px',
                }}
              >
                客房设施
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: '0px 16px',
                }}
              >
                {allFacilities.map((facility) => {
                  const isActive = tempFacilities.includes(facility);
                  return (
                    <div
                      key={facility}
                      onClick={() => toggleFacility(facility)}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'center',
                        borderRadius: 8,
                        background: isActive ? '#1677ff' : '#eee',
                        color: isActive ? '#fff' : '#000',
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      {facility}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 主题 */}
            <div style={{ marginBottom: 8 }}>
              <div
                style={{
                  fontSize: 16,
                  marginBottom: 12,
                  padding: '0px 16px',
                }}
              >
                主题
              </div>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: 12,
                  padding: '0px 16px',
                }}
              >
                {allThemeFeatures.map((theme) => {
                  const isActive = tempThemeFeatures.includes(theme);
                  return (
                    <div
                      key={theme}
                      onClick={() => toggleTheme(theme)}
                      style={{
                        padding: '8px 10px',
                        textAlign: 'center',
                        borderRadius: 8,
                        background: isActive ? '#1677ff' : '#eee',
                        color: isActive ? '#fff' : '#000',
                        fontSize: 14,
                        cursor: 'pointer',
                      }}
                    >
                      {theme}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 价格部分 */}
            <div>
              <PricePanel
                value={tempPriceRange}
                onChange={setTempPriceRange}
                minLimit={0}
                maxLimit={maxPriceLimit}
                quickButtons={quickPriceButtons}
              />
            </div>
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
