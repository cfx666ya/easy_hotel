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
  // 默认是欢迎度排序
  const [selectedSort, setSelectedSort] = useState(
    query.sortBy || 'score_desc',
  );

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
    <div className="panel sort-panel">
      <div className="sort-options">
        {SORT_OPTIONS.map((option) => (
          <div
            key={option.key}
            className={`sort-option ${selectedSort === option.key ? 'active' : ''}`}
            onClick={() => handleSortSelect(option.key)}
          >
            {option.label}
          </div>
        ))}
      </div>
    </div>
  );
}
