/**
 * 排序面板
 */

import { useState } from 'react';

const SORT_OPTIONS = [
  { key: 'score_desc', label: '欢迎度排序', apiValue: '' },
  { key: 'price_asc', label: '低价优先', apiValue: 'price_asc' },
  { key: 'price_desc', label: '高价优先', apiValue: 'price_desc' },
  { key: 'star_desc', label: '高星优先', apiValue: 'star_desc' },
];

export default function SortPanel({ query, onSearch, onClose }) {
  const [selectedSort, setSelectedSort] = useState(
    query.sortBy || 'score_desc',
  );

  const [hoveredKey, setHoveredKey] = useState(null);

  const handleSortSelect = (sortKey) => {
    const option = SORT_OPTIONS.find((opt) => opt.key === sortKey);
    if (!option) return;

    if (sortKey === selectedSort) {
      onClose();
      return;
    }

    setSelectedSort(sortKey);
    onSearch({ sortBy: option.apiValue });
    onClose();
  };

  return (
    <>
      {/* 主遮罩，一个全屏半透明黑色背景 */}
      <div
        style={{
          position: 'fixed',
          top: '85px', // 面板上面的高度
          bottom: 0,
          width: '100%',
          background: 'rgba(0,0,0,0.4)', // 黑色半透明，40% 不透明度
          zIndex: 998, // 层级较高，确保遮罩位于其他内容之上
          fontSize: 14,
        }}
        onClick={onClose} // 点击遮罩关闭
      >
        <div
          style={{
            position: 'fixed',
            top: '85px',
            width: '100%',
            background: '#fff',
            zIndex: 999, // 层级高，确保在其他元素之上
          }}
          onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
            }}
          >
            {SORT_OPTIONS.map((option) => {
              const isActive = selectedSort === option.key;
              const isHover = hoveredKey === option.key;

              return (
                <div
                  key={option.key}
                  onClick={() => handleSortSelect(option.key)}
                  onMouseEnter={() => setHoveredKey(option.key)}
                  onMouseLeave={() => setHoveredKey(null)}
                  style={{
                    padding: '10px 16px',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                    backgroundColor: isActive
                      ? '#e6f7ff'
                      : isHover
                        ? '#f5f5f5'
                        : '#fff',
                    color: isActive ? '#1677ff' : '#333',
                    fontWeight: isActive ? 500 : 400,
                  }}
                >
                  {option.label}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}
