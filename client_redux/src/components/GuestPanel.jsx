import { useState } from 'react';

export default function GuestPanel({
  visible,
  onClose,
  rooms,
  guests,
  onRoomsChange,
  onGuestsChange,
  onConfirm,
}) {
  const [showRoomSelector, setShowRoomSelector] = useState(false); // 控制间数选择浮层是否显示，初始为 false
  const [showGuestSelector, setShowGuestSelector] = useState(false); // 控制人数选择浮层是否显示，初始为 false

  if (!visible) return null;

  return (
    <>
      {/* 主遮罩，一个全屏半透明黑色背景 */}
      <div
        style={{
          position: 'fixed', // 固定定位，相对于视口
          inset: 0, // 等同于 top:0; right:0; bottom:0; left:0，铺满全屏
          background: 'rgba(0,0,0,0.4)', // 黑色半透明，40% 不透明度
          zIndex: 1000, // 层级较高，确保遮罩位于其他内容之上
          display: 'flex', // 启用 Flexbox 布局
          justifyContent: 'center', // 水平居中子元素
          alignItems: 'flex-end', // 垂直方向底部对齐，使主面板从底部弹出
        }}
        onClick={onClose} // 点击遮罩关闭
      >
        {/* 主面板 */}
        <div
          style={{
            width: '100%', // 宽度占满屏幕（左右无间距）
            background: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
          }}
          onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
        >
          {/* ====== 顶部导航 Bar ====== */}
          <div
            style={{
              height: 45, // 固定高度 56px（常见移动端导航栏高度)
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center', // 使内容水平和垂直居中
              position: 'relative', // 为内部的绝对定位关闭按钮提供参考
              borderBottom: '1px solid #eee', // 底部浅灰色分割线
              fontSize: 16,
              fontWeight: 600,
            }}
          >
            {/* 关闭符号 */}
            <span
              onClick={onClose}
              style={{
                position: 'absolute', // 绝对定位，相对于父容器（标题栏）
                left: 16,
                fontSize: 18,
                cursor: 'pointer',
              }}
            >
              ✕
            </span>
            选择客房和入住人数
          </div>

          {/* ====== 内容区域 ====== */}
          <div
            style={{
              padding: '0 16px', // 内边距 16px，包裹两个选择行
            }}
          >
            {/* 间数 */}
            <SelectorRow
              label="间数"
              value={rooms}
              min={1}
              max={10}
              unit="间" // 单位【间】（用于子浮层，点击数字后显示）
              onDecrement={() => rooms > 1 && onRoomsChange(rooms - 1)}
              onIncrement={() => rooms < 10 && onRoomsChange(rooms + 1)}
              onClickValue={() => setShowRoomSelector(true)}
            />

            {/* 人数 */}
            <SelectorRow
              label="人数"
              value={guests}
              min={1}
              max={20}
              unit="人"
              onDecrement={() => guests > 1 && onGuestsChange(guests - 1)}
              onIncrement={() => guests < 20 && onGuestsChange(guests + 1)}
              onClickValue={() => setShowGuestSelector(true)}
            />
          </div>

          {/* 完成按钮 */}
          <div
            style={{
              borderTop: '1px solid #e5e5e5', // 灰色分割线
              padding: 12,
              display: 'flex',
              gap: 12,
            }}
          >
            <button
              onClick={() => onConfirm(rooms, guests)}
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

      {/* ====== 间数选择浮层 ====== */}
      {showRoomSelector && (
        <SubPanel
          title="间数"
          max={10}
          current={rooms}
          unit="间"
          onClose={() => setShowRoomSelector(false)}
          onSelect={(val) => {
            onRoomsChange(val);
            setShowRoomSelector(false);
          }}
        />
      )}

      {/* ====== 人数选择浮层 ====== */}
      {showGuestSelector && (
        <SubPanel
          title="人数"
          max={20}
          current={guests}
          unit="人"
          onClose={() => setShowGuestSelector(false)}
          onSelect={(val) => {
            onGuestsChange(val);
            setShowGuestSelector(false);
          }}
        />
      )}
    </>
  );
}

/* ================== 行组件 ================== */
function SelectorRow({
  label,
  value,
  min,
  max,
  onDecrement,
  onIncrement,
  onClickValue,
}) {
  // 标签、当前值、最小值、最大值、减回调、加回调、点击数字回调
  return (
    <div
      style={{
        height: 55,
        display: 'flex', // Flex 布局
        alignItems: 'center', // 垂直居中
        justifyContent: 'space-between', // 两端对齐
        borderBottom: '1px solid #f5f5f5',
      }}
    >
      {/* 间数或人数 */}
      <span style={{ fontSize: 16 }}>{label}</span>

      {/* 右侧操作区 Flex 容器，包含减按钮、数字、加按钮，间距 12px */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
          borderRadius: 14,
          gap: 12,
        }}
      >
        <button
          onClick={onDecrement}
          disabled={value === min}
          style={stepBtnStyle(value === min)}
        >
          −
        </button>

        <span
          onClick={onClickValue}
          style={{
            minWidth: 30,
            textAlign: 'center',
            fontSize: 16,
            fontWeight: 500,
            cursor: 'pointer',
          }}
        >
          {value}
        </span>

        <button
          onClick={onIncrement}
          disabled={value === max}
          style={stepBtnStyle(value === max)}
        >
          +
        </button>
      </div>
    </div>
  );
}

function stepBtnStyle(disabled) {
  return {
    width: 24,
    height: 24,
    borderRadius: '50%',
    border: '1px solid #ddd',
    background: disabled ? '#f5f5f5' : '#fff',
    color: disabled ? '#ccc' : '#1677ff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 18,
  };
}

/* ================== 子浮层 ================== */
function SubPanel({ title, max, current, unit, onClose, onSelect }) {
  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.4)', // 浮层的遮罩（半透明背景）
        zIndex: 1100, // 比主面板的 1000 更高，确保覆盖在主面板之上
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-end',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()} // 实际的内容面板，点击它不会关闭（通过 e.stopPropagation() 阻止事件冒泡到遮罩）
        style={{
          width: '100%',
          background: '#fff',
          borderTopLeftRadius: 16,
          borderTopRightRadius: 16,
          paddingBottom: 8,
        }}
      >
        {/* header */}
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
          {title}
        </div>

        {/* grid */}
        <div
          style={{
            padding: 16,
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)', // 每行4个
            gap: 12,
          }}
        >
          {[...Array(max).keys()].map((i) => {
            const num = i + 1;
            const active = num === current;

            return (
              <div
                key={num}
                onClick={() => onSelect(num)}
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
                {num}
                {unit}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
