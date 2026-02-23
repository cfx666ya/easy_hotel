import { useState } from 'react';
import { getHotelCount } from '../../../api/hotel';
import SortPanel from './filter_components/SortPanel';
import LocationPanel from './filter_components/LocationPanel';
import PriceLevelPanel from './filter_components/PriceLevelPanel';
import AdvancedFilterPanel from './filter_components/AdvancedFilterPanel';

export default function FilterPanel({ query, onSearch }) {
  const [activeTab, setActiveTab] = useState(null); // 激活标签
  const [previewCount, setPreviewCount] = useState(0); // 预览计数

  // 判断筛选条件是否生效（用于高亮）
  const hasSortFilter = Boolean(query.sortBy);
  const hasLocationFilter = Boolean(query.poiId || query.distance);
  const hasPriceLevelFilter = Boolean(
    query.minPrice || query.maxPrice || query.starMin || query.starMax,
  );
  const hasFilter = Boolean(
    query.theme || query.brand || query.facility || query.roomType,
  );

  // 统一预览计数更新
  const updatePreviewCount = async (params) => {
    try {
      const data = await getHotelCount(params);
      setPreviewCount(data.total);
    } catch (error) {
      console.error('Failed to fetch preview count:', error);
    }
  };

  // 关闭激活的标签
  const closePanel = () => setActiveTab(null);

  // 获取位置栏显示的文本
  const getLocationLabel = () => {
    if (!query.poiId && !query.distance) return '位置/距离';
    // 基础文本为地点名称
    let label = query.poiName;

    // 如果有距离值（非空字符串或数字），则拼接距离信息
    if (query.distance) {
      label += ` · ${query.distance}km内`;
    }
    return label;
  };

  return (
    <div className="filter-panel-wrapper">
      {/* FilterBar */}
      <div className="filter-bar">
        {/* 欢迎度排序 */}
        <div
          className={`filter-item ${activeTab === 'sort' ? 'active' : ''}${hasSortFilter ? ' has-filter' : ''}`}
          onClick={() =>
            setActiveTab((prev) => (prev === 'sort' ? null : 'sort'))
          }
        >
          {query.sortBy === 'price_asc'
            ? '低价优先'
            : query.sortBy === 'price_desc'
              ? '高价优先'
              : query.sortBy === 'star_desc'
                ? '高星优先'
                : '欢迎度排序'}{' '}
          {activeTab === 'sort' ? '▲' : '▼'}
        </div>

        {/* 位置/距离 */}
        <div
          className={`filter-item ${activeTab === 'location' ? 'active' : ''}${hasLocationFilter ? ' has-filter' : ''}`}
          onClick={() =>
            setActiveTab((prev) => (prev === 'location' ? null : 'location'))
          }
        >
          {getLocationLabel()} {activeTab === 'location' ? '▲' : '▼'}
        </div>

        {/* 价格/星级 */}
        <div
          className={`filter-item ${activeTab === 'price_level' ? 'active' : ''}${hasPriceLevelFilter ? ' has-filter' : ''}`}
          onClick={() =>
            setActiveTab((prev) =>
              prev === 'price_level' ? null : 'price_level',
            )
          }
        >
          价格/星级 {activeTab === 'price_level' ? '▲' : '▼'}
        </div>

        {/* 筛选 */}
        <div
          className={`filter-item ${activeTab === 'filter' ? 'active' : ''}${hasFilter ? ' has-filter' : ''}`}
          onClick={() =>
            setActiveTab((prev) => (prev === 'filter' ? null : 'filter'))
          }
        >
          筛选 {activeTab === 'filter' ? '▲' : '▼'}
        </div>
      </div>

      {/* 各个 Panel */}
      {activeTab === 'sort' && (
        <SortPanel query={query} onSearch={onSearch} onClose={closePanel} />
      )}
      {activeTab === 'location' && (
        <LocationPanel
          query={query}
          onSearch={onSearch}
          onClose={closePanel}
          onPreviewChange={updatePreviewCount}
          previewCount={previewCount}
        />
      )}
      {activeTab === 'price_level' && (
        <PriceLevelPanel
          query={query}
          onSearch={onSearch}
          onClose={closePanel}
          onPreviewChange={updatePreviewCount}
          previewCount={previewCount}
        />
      )}
      {activeTab === 'filter' && (
        <AdvancedFilterPanel
          query={query}
          onSearch={onSearch}
          onClose={closePanel}
          onPreviewChange={updatePreviewCount}
          previewCount={previewCount}
        />
      )}
    </div>
  );
}
