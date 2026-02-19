import { useState, useEffect } from 'react';
import { getPoiList, getHotelCountByPoi } from '../../../api/hotel';

const DISTANCES = [1, 2, 3, 4, 5];

export default function FilterPanel({ query, onSearch }) {
  const [activeTab, setActiveTab] = useState(null);
  const [activeLeftNav, setActiveLeftNav] = useState('hot');
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [previewCount, setPreviewCount] = useState(300);
  const [pois, setPois] = useState([]); // 当前城市的 POI 列表
  const [loadingPoi, setLoadingPoi] = useState(false);

  const LEFT_NAV = [
    { key: 'hot', label: '热门推荐' },
    { key: 'sight', label: '观光景点' },
    { key: 'business', label: '商圈' },
    { key: 'district', label: '行政区' },
    { key: 'station', label: '机场/车站' },
    { key: 'school', label: '高校' },
    { key: 'hospital', label: '医院' },
  ];

  // 获取当前城市的 POI
  // 监听 query.city
  useEffect(() => {
    const city = query.city;
    if (!city) return;

    const fetchPois = async () => {
      setLoadingPoi(true);
      try {
        const data = await getPoiList(city); // 直接返回解析后的数据
        setPois(data);
      } catch (error) {
        console.error('Failed to fetch POIs:', error);
      } finally {
        setLoadingPoi(false);
      }
    };

    fetchPois();
  }, [query.city]);

  // 根据当前左侧导航类型，过滤右侧 POI 列表，挑选 pois 列表中 type 与左侧对应的
  // 当 activeLeftNav 改变时，由于 useState 会重新渲染整个 FilterPanel 组件，所以这行代码会再次执行
  const rightPois = pois.filter((p) => p.type === activeLeftNav);

  // 当选择距离时，获取该条件下酒店总数用于预览
  // 注意这次请求并不改变主酒店列表，仅用于预览数字
  const handleSelectDistance = async (d) => {
    setSelectedDistance(d);
    if (!selectedPoi) return;

    try {
      const data = await getHotelCountByPoi(selectedPoi.id, d);
      setPreviewCount(data.total);
    } catch (error) {
      console.error('Failed to fetch count:', error);
    }
  };

  const handleSelectPoi = (poi) => {
    setSelectedPoi(poi);
    setSelectedDistance(null);
    setPreviewCount(300); // 重置预览数
  };

  const handleClear = () => {
    setSelectedPoi(null);
    setSelectedDistance(null);
    setPreviewCount(300);
    onSearch({ poiId: '', distance: '' });
  };

  const handleConfirm = () => {
    // 调用回调函数，传回参数为 poiId 和 distance
    onSearch({
      poiId: selectedPoi?.id || '',
      distance: selectedDistance || '',
    });
    // 关闭下拉面板
    setActiveTab(null);
  };

  // 当用户筛选位置后，用具体位置替换原来的 label
  const getLocationLabel = () => {
    if (!selectedPoi) return '位置/距离';
    if (!selectedDistance) return selectedPoi.name;
    return `${selectedPoi.name} · ${selectedDistance}km内`;
  };

  // ... 定位逻辑保留不变 ...

  return (
    <div className="filter-panel-wrapper">
      {/* FilterBar */}
      <div className="filter-bar">
        <div
          className={`filter-item ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() =>
            setActiveTab((prev) => (prev === 'location' ? null : 'location'))
          }
        >
          {getLocationLabel()} ▼
        </div>
        <div className="filter-item">价格/星级 ▼</div>
        <div className="filter-item">居数/床数 ▼</div>
        <div className="filter-item">筛选/排序 ▼</div>
      </div>

      {/* Panel */}
      {/* 如果用户选择了【位置/距离】，则显示该 panel */}
      {activeTab === 'location' && (
        <div className="panel">
          {/* 如果用户选择了具体位置，例如人民广场，则显示【距离bar】 */}
          {selectedPoi && (
            <div className="distance-bar">
              {DISTANCES.map((d) => (
                <div
                  key={d}
                  className={`distance-item ${selectedDistance === d ? 'active' : ''}`}
                  onClick={() => handleSelectDistance(d)}
                >
                  {d}km内
                </div>
              ))}
            </div>
          )}

          <div className="panel-content">
            <div className="left-nav">
              {LEFT_NAV.map((item) => (
                <div
                  key={item.key}
                  className={`left-nav-item ${activeLeftNav === item.key ? 'active' : ''}`}
                  onClick={() => setActiveLeftNav(item.key)}
                >
                  {item.label}
                </div>
              ))}
            </div>

            <div className="right-content">
              {loadingPoi ? (
                <div>加载中...</div>
              ) : (
                rightPois.map((poi) => (
                  <div
                    key={poi.id}
                    className={`right-item ${selectedPoi?.id === poi.id ? 'active' : ''}`}
                    onClick={() => handleSelectPoi(poi)}
                  >
                    {poi.name}
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="panel-footer">
            <button className="clear-btn" onClick={handleClear}>
              清空
            </button>
            <button className="confirm-btn" onClick={handleConfirm}>
              查看房屋（{previewCount}套以上可订）
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
