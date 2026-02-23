/**
 * 筛选面板
 */
import { useState, useEffect, useCallback } from 'react';
import useDebounce from '../../../../hooks/useDebounce';

const FILTER_LEFT_NAV = [
  { key: 'theme', label: '主题特色' },
  { key: 'brand', label: '品牌' },
  { key: 'facility', label: '设施' },
  { key: 'roomType', label: '酒店房型' },
];

const THEME_OPTIONS = [
  '亲子',
  '电竞',
  '四合院',
  '海景',
  '浪漫',
  '商务',
  '度假',
];
const BRAND_OPTIONS = [
  '希尔顿',
  '万豪',
  '如家',
  '全季',
  '香格里拉',
  '喜来登',
  '洲际',
  '凯宾斯基',
  '威斯汀',
  '雅高',
  '锦江',
  '华住',
];
const FACILITY_OPTIONS = [
  '停车场',
  '温泉',
  '洗衣房',
  '泳池',
  '健身房',
  'SPA',
  '会议室',
  '免费WiFi',
  '早餐',
  '接机',
];
const ROOM_TYPE_OPTIONS = [
  '大床房',
  '双床房',
  '套房',
  '家庭房',
  '总统套房',
  '公寓',
];

export default function AdvancedFilterPanel({
  query,
  onSearch,
  onClose,
  onPreviewChange,
  previewCount,
}) {
  const [filterLeftActive, setFilterLeftActive] = useState('theme');
  const [selectedFilters, setSelectedFilters] = useState({
    theme: query.theme ? query.theme.split(',') : [],
    brand: query.brand ? query.brand.split(',') : [],
    facility: query.facility ? query.facility.split(',') : [],
    roomType: query.roomType ? query.roomType.split(',') : [],
  });

  // 预览计数
  const fetchPreviewCount = useCallback(async () => {
    const params = {
      city: query.city,
      keyword: query.keyword,
      poiId: query.poiId,
      distance: query.distance,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      starMin: query.starMin,
      starMax: query.starMax,
      theme: selectedFilters.theme.join(','),
      brand: selectedFilters.brand.join(','),
      facility: selectedFilters.facility.join(','),
      roomType: selectedFilters.roomType.join(','),
    };
    await onPreviewChange(params);
  }, [query, selectedFilters, onPreviewChange]);

  const debouncedFetchPreviewCount = useDebounce(fetchPreviewCount, 300);

  // 监听并更新预览计数
  useEffect(() => {
    debouncedFetchPreviewCount();
  }, [debouncedFetchPreviewCount]);

  // 处理选中过滤选项的逻辑
  const handleFilterOptionClick = (category, option) => {
    setSelectedFilters((prev) => {
      const current = prev[category];
      const updated = current.includes(option)
        ? current.filter((item) => item !== option)
        : [...current, option];
      return { ...prev, [category]: updated };
    });
  };

  // 清空
  const handleClear = () => {
    setSelectedFilters({
      theme: [],
      brand: [],
      facility: [],
      roomType: [],
    });
    fetchPreviewCount();
  };

  // 确认
  const handleConfirm = () => {
    onSearch({
      theme: selectedFilters.theme.join(','),
      brand: selectedFilters.brand.join(','),
      facility: selectedFilters.facility.join(','),
      roomType: selectedFilters.roomType.join(','),
    });
    onClose();
  };

  return (
    <div className="panel filter-panel">
      <div className="panel-content">
        <div className="left-nav">
          {FILTER_LEFT_NAV.map((item) => (
            <div
              key={item.key}
              className={`left-nav-item ${filterLeftActive === item.key ? 'active' : ''}`}
              onClick={() => setFilterLeftActive(item.key)}
            >
              {item.label}
            </div>
          ))}
        </div>

        <div className="right-content">
          {filterLeftActive === 'theme' &&
            THEME_OPTIONS.map((opt) => (
              <div
                key={opt}
                className={`filter-option ${selectedFilters.theme.includes(opt) ? 'active' : ''}`}
                onClick={() => handleFilterOptionClick('theme', opt)}
              >
                {opt}
              </div>
            ))}
          {filterLeftActive === 'brand' &&
            BRAND_OPTIONS.map((opt) => (
              <div
                key={opt}
                className={`filter-option ${selectedFilters.brand.includes(opt) ? 'active' : ''}`}
                onClick={() => handleFilterOptionClick('brand', opt)}
              >
                {opt}
              </div>
            ))}
          {filterLeftActive === 'facility' &&
            FACILITY_OPTIONS.map((opt) => (
              <div
                key={opt}
                className={`filter-option ${selectedFilters.facility.includes(opt) ? 'active' : ''}`}
                onClick={() => handleFilterOptionClick('facility', opt)}
              >
                {opt}
              </div>
            ))}
          {filterLeftActive === 'roomType' &&
            ROOM_TYPE_OPTIONS.map((opt) => (
              <div
                key={opt}
                className={`filter-option ${selectedFilters.roomType.includes(opt) ? 'active' : ''}`}
                onClick={() => handleFilterOptionClick('roomType', opt)}
              >
                {opt}
              </div>
            ))}
        </div>
      </div>

      <div className="panel-footer">
        <button className="clear-btn" onClick={handleClear}>
          清空
        </button>
        <button className="confirm-btn" onClick={handleConfirm}>
          查看酒店（{previewCount}套可订）
        </button>
      </div>
    </div>
  );
}
