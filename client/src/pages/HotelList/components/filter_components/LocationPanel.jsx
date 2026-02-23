/**
 * 位置/距离面板
 */
import { useState, useEffect } from 'react';
import { getPoiList } from '../../../../api/hotel';
import useDebounce from '../../../../hooks/useDebounce';

// 左侧导航栏
const LEFT_NAV = [
  { key: 'hot', label: '热门推荐' },
  { key: 'sight', label: '观光景点' },
  { key: 'business', label: '商圈' },
  { key: 'district', label: '行政区' },
  { key: 'station', label: '机场/车站' },
  { key: 'school', label: '高校' },
  { key: 'hospital', label: '医院' },
];

// 距离
const DISTANCES = [1, 2, 3, 4, 5];

export default function LocationPanel({
  query,
  onSearch,
  onClose,
  onPreviewChange,
  previewCount,
}) {
  const [activeLeftNav, setActiveLeftNav] = useState('hot');
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [pois, setPois] = useState([]);
  const [loadingPoi, setLoadingPoi] = useState(false);

  // 每次渲染都会执行，根据当前激活的左侧导航筛选右侧POI
  const rightPois = pois.filter((p) => p.type === activeLeftNav);

  /**
   * Hooks 相关
   */
  // 获取 POI 列表
  useEffect(() => {
    if (!query.city) return;
    const fetchPois = async () => {
      setLoadingPoi(true);
      try {
        const data = await getPoiList(query.city);
        setPois(data);
      } catch (error) {
        console.error('Failed to fetch POIs:', error);
      } finally {
        setLoadingPoi(false);
      }
    };
    fetchPois();
  }, [query.city]);

  // 从 query 恢复选中状态
  // 注意，这里需要等 POI 列表获取完成后再进行恢复
  useEffect(() => {
    // 等待POI数据加载完成后再进行恢复
    if (pois.length === 0) return;

    console.log('pois.length 不为0', pois);

    if (query.poiId) {
      const poi = pois.find((p) => p.id === Number(query.poiId));
      console.log('poi', poi);
      console.log('query.poiId', query.poiId);
      console.log('query.poiName', query.poiName);
      if (poi) {
        setSelectedPoi(poi);
        // 将左侧导航切换到该POI所属类别
        setActiveLeftNav(poi.type);
      } else {
        // 如果找不到对应的POI（可能ID无效），清空选择
        setSelectedPoi(null);
      }
    } else {
      setSelectedPoi(null);
    }
    // 恢复距离选择
    setSelectedDistance(query.distance ? query.distance : null);
  }, [query.poiId, query.poiName, query.distance, pois]);

  /**
   * 辅助函数
   */

  // 预览计数（防抖）
  const fetchPreviewCount = async (poiId, poiName, distance) => {
    const params = {
      city: query.city,
      keyword: query.keyword,
      poiId: poiId || '',
      poiName: poiName || '',
      ...(distance && { distance }),
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      starMin: query.starMin,
      starMax: query.starMax,
    };
    await onPreviewChange(params);
  };

  const debouncedFetchPreviewCount = useDebounce(fetchPreviewCount, 300);

  // 选中位置后，高亮位置，重置距离，预览计数
  const handleSelectPoi = (poi) => {
    setSelectedPoi(poi);
    setSelectedDistance(null);
    debouncedFetchPreviewCount(poi.id, poi.name, null);
  };

  // 选中距离后，高亮距离，预览计数
  const handleSelectDistance = (d) => {
    setSelectedDistance(d);
    if (selectedPoi)
      debouncedFetchPreviewCount(selectedPoi.id, selectedPoi.name, d);
  };

  // 清空
  const handleClear = () => {
    setSelectedPoi(null);
    setSelectedDistance(null);
    onPreviewChange({ city: query.city, keyword: query.keyword }); // 清空后预览
  };

  // 确定
  const handleConfirm = () => {
    onSearch({
      poiId: selectedPoi?.id || '',
      poiName: selectedPoi?.name || '',
      distance: selectedDistance || '',
    });
    onClose();
  };

  return (
    <div className="panel">
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
          查看酒店（{previewCount}套可订）
        </button>
      </div>
    </div>
  );
}
