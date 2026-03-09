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
        }}
        onClick={onClose} // 点击遮罩关闭
      >
        <div
          style={{
            position: 'fixed',
            top: '85px',
            width: '100%',
            zIndex: 999, // 层级高，确保在其他元素之上
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
          }}
          onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
        >
          {/* ===== 距离Bar ===== */}
          {selectedPoi && (
            <div
              style={{
                display: 'flex',
                borderBottom: '1px solid #f0f0f0',
                padding: '8px 12px',
                gap: 8,
                flexWrap: 'wrap',
              }}
            >
              {DISTANCES.map((d) => {
                const active = selectedDistance === d;
                return (
                  <div
                    key={d}
                    onClick={() => handleSelectDistance(d)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: 16,
                      fontSize: 14,
                      cursor: 'pointer',
                      border: active
                        ? '1px solid #1677ff'
                        : '1px solid #e5e5e5',
                      background: active ? '#e6f4ff' : '#fff',
                      color: active ? '#1677ff' : '#333',
                    }}
                  >
                    {d}km内
                  </div>
                );
              })}
            </div>
          )}

          {/* ===== 中间内容 ===== */}
          <div
            style={{
              flex: 1,
              display: 'flex',
              overflow: 'hidden',
            }}
          >
            {/* ===== 左侧导航 ===== */}
            <div
              style={{
                width: 110,
                background: '#f7f7f7',
                borderRight: '1px solid #eee',
              }}
            >
              {LEFT_NAV.map((item) => {
                const active = activeLeftNav === item.key;
                return (
                  <div
                    key={item.key}
                    onClick={() => setActiveLeftNav(item.key)}
                    style={{
                      padding: '14px 12px',
                      fontSize: 14,
                      cursor: 'pointer',
                      background: active ? '#fff' : '#f7f7f7',
                      color: active ? '#1677ff' : '#333',
                      fontWeight: active ? 500 : 400,
                      borderLeft: active
                        ? '3px solid #1677ff'
                        : '3px solid transparent',
                    }}
                  >
                    {item.label}
                  </div>
                );
              })}
            </div>

            {/* ===== 右侧POI列表 ===== */}
            <div
              style={{
                flex: 1,
                padding: '0 12px',
                overflowY: 'auto',
              }}
            >
              {loadingPoi ? (
                <div style={{ padding: 20 }}>加载中...</div>
              ) : (
                rightPois.map((poi) => {
                  const active = selectedPoi?.id === poi.id;
                  return (
                    <div
                      key={poi.id}
                      onClick={() => handleSelectPoi(poi)}
                      style={{
                        padding: '14px 0',
                        borderBottom: '1px solid #f0f0f0',
                        fontSize: 14,
                        cursor: 'pointer',
                        color: active ? '#1677ff' : '#333',
                        fontWeight: active ? 500 : 400,
                      }}
                    >
                      {poi.name}
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* ===== 底部按钮栏 ===== */}
          <div
            style={{
              borderTop: '1px solid #e5e5e5',
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
              查看酒店（{previewCount}套可订）
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
