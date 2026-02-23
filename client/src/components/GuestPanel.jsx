/**
 * 间数/人数的 panel 组件
 */
import { useState } from 'react';

export default function GuestPanel({
  visible,
  onClose,
  rooms,
  guests,
  onRoomsChange,
  onGuestsChange,
}) {
  const [showRoomSelector, setShowRoomSelector] = useState(false);
  const [showGuestSelector, setShowGuestSelector] = useState(false);

  // 间数加减
  const handleRoomsDecrement = () => {
    if (rooms > 1) onRoomsChange(rooms - 1);
  };
  const handleRoomsIncrement = () => {
    if (rooms < 10) onRoomsChange(rooms + 1);
  };

  // 人数加减
  const handleGuestsDecrement = () => {
    if (guests > 1) onGuestsChange(guests - 1);
  };
  const handleGuestsIncrement = () => {
    if (guests < 20) onGuestsChange(guests + 1);
  };

  // 间数选择器点击数字
  const handleRoomSelect = (value) => {
    onRoomsChange(value);
    setShowRoomSelector(false);
  };

  // 人数选择器点击数字
  const handleGuestSelect = (value) => {
    onGuestsChange(value);
    setShowGuestSelector(false);
  };

  if (!visible) return null;

  return (
    <div className="guest-panel-overlay">
      <div className="guest-panel">
        <div className="panel-header">
          <span className="close-btn" onClick={onClose}>
            ✕
          </span>
          <span className="title">选择客房和入住人数</span>
        </div>
        <div className="panel-content">
          {/* 间数行 */}
          <div className="selector-row">
            <span className="label">间数</span>
            <div className="stepper">
              <button
                className={`stepper-btn ${rooms === 1 ? 'disabled' : ''}`}
                onClick={handleRoomsDecrement}
                disabled={rooms === 1}
              >
                −
              </button>
              <span
                className="stepper-value"
                onClick={() => setShowRoomSelector(true)}
              >
                {rooms}
              </span>
              <button
                className={`stepper-btn ${rooms === 10 ? 'disabled' : ''}`}
                onClick={handleRoomsIncrement}
                disabled={rooms === 10}
              >
                +
              </button>
            </div>
          </div>
          {/* 人数行 */}
          <div className="selector-row">
            <span className="label">人数</span>
            <div className="stepper">
              <button
                className={`stepper-btn ${guests === 1 ? 'disabled' : ''}`}
                onClick={handleGuestsDecrement}
                disabled={guests === 1}
              >
                −
              </button>
              <span
                className="stepper-value"
                onClick={() => setShowGuestSelector(true)}
              >
                {guests}
              </span>
              <button
                className={`stepper-btn ${guests === 20 ? 'disabled' : ''}`}
                onClick={handleGuestsIncrement}
                disabled={guests === 20}
              >
                +
              </button>
            </div>
          </div>
        </div>
        <button className="done-btn" onClick={onClose}>
          完成
        </button>
      </div>

      {/* 间数选择浮层 */}
      {showRoomSelector && (
        <div
          className="sub-panel-overlay"
          onClick={() => setShowRoomSelector(false)}
        >
          <div className="sub-panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <span
                className="close-btn"
                onClick={() => setShowRoomSelector(false)}
              >
                ✕
              </span>
              <span className="title">间数</span>
            </div>
            <div className="number-grid">
              {[...Array(10).keys()]
                .map((i) => i + 1)
                .map((num) => (
                  <button
                    key={num}
                    className={`grid-btn ${rooms === num ? 'active' : ''}`}
                    onClick={() => handleRoomSelect(num)}
                  >
                    {num}间
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* 人数选择浮层 */}
      {showGuestSelector && (
        <div
          className="sub-panel-overlay"
          onClick={() => setShowGuestSelector(false)}
        >
          <div className="sub-panel" onClick={(e) => e.stopPropagation()}>
            <div className="panel-header">
              <span
                className="close-btn"
                onClick={() => setShowGuestSelector(false)}
              >
                ✕
              </span>
              <span className="title">人数</span>
            </div>
            <div className="number-grid">
              {[...Array(20).keys()]
                .map((i) => i + 1)
                .map((num) => (
                  <button
                    key={num}
                    className={`grid-btn ${guests === num ? 'active' : ''}`}
                    onClick={() => handleGuestSelect(num)}
                  >
                    {num}人
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
