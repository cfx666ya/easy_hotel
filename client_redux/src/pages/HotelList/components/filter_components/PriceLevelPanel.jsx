/**
 * 价格/等级面板
 */

import { useState, useEffect, useCallback } from 'react';
import useDebounce from '../../../../hooks/useDebounce';
import PricePanel from '../../../../components/PricePanel';
import LevelPanel from '../../../../components/LevelPanel';
import {
  getStarMinMaxFromKeys,
  getStarKeysFromMinMax,
} from '../../../../utils/transStarKeys';

const MIN_PRICE = 0;
const MAX_PRICE = 2000;

const quickPriceButtons = [
  { label: '￥200以下', min: 0, max: 200 },
  { label: '￥200-300', min: 200, max: 300 },
  { label: '￥300-400', min: 300, max: 400 },
  { label: '￥400-500', min: 400, max: 500 },
  { label: '￥500-600', min: 500, max: 600 },
  { label: '￥600-700', min: 600, max: 700 },
  { label: '￥700-800', min: 700, max: 800 },
  { label: '￥800以上', min: 800, max: MAX_PRICE },
];

export default function PriceLevelPanel({
  query,
  onSearch,
  onClose,
  onPreviewChange,
  previewCount,
}) {
  // 从 query 初始化价格和星级
  const initialPriceRange = [
    query.minPrice ? Number(query.minPrice) : MIN_PRICE,
    query.maxPrice ? Number(query.maxPrice) : MAX_PRICE,
  ];
  const initialStarKeys = getStarKeysFromMinMax(query.starMin, query.starMax);

  const [priceRange, setPriceRange] = useState(initialPriceRange);
  const [selectedStarKeys, setSelectedStarKeys] = useState(initialStarKeys);

  // 预览计数
  const fetchPreviewCount = useCallback(async () => {
    const { starMin, starMax } = getStarMinMaxFromKeys(selectedStarKeys);
    const params = {
      city: query.city,
      keyword: query.keyword,
      poiId: query.poiId,
      distance: query.distance,
      minPrice: priceRange[0] === MIN_PRICE ? '' : priceRange[0],
      maxPrice: priceRange[1] === MAX_PRICE ? '' : priceRange[1],
      starMin,
      starMax,
    };
    await onPreviewChange(params);
  }, [query, priceRange, selectedStarKeys, onPreviewChange]);

  const debouncedFetchPreviewCount = useDebounce(fetchPreviewCount, 300);

  useEffect(() => {
    debouncedFetchPreviewCount();
  }, [debouncedFetchPreviewCount]);

  // 清空
  const handleClear = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedStarKeys([]);
    fetchPreviewCount(); // 立即更新预览
  };

  // 确认
  const handleConfirm = () => {
    const { starMin, starMax } = getStarMinMaxFromKeys(selectedStarKeys);
    onSearch({
      minPrice: priceRange[0] === MIN_PRICE ? '' : priceRange[0],
      maxPrice: priceRange[1] === MAX_PRICE ? '' : priceRange[1],
      starMin,
      starMax,
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
          <PricePanel
            value={priceRange}
            onChange={setPriceRange}
            minLimit={MIN_PRICE}
            maxLimit={MAX_PRICE}
            quickButtons={quickPriceButtons}
          />

          <LevelPanel value={selectedStarKeys} onChange={setSelectedStarKeys} />

          <div
            style={{
              borderTop: '1px solid #e5e5e5', // 灰色分割线
              padding: 12,
              display: 'flex',
              gap: 12,
            }}
          >
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
