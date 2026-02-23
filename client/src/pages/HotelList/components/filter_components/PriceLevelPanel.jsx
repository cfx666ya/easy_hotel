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
    <div className="panel price-level-panel">
      <PricePanel
        value={priceRange}
        onChange={setPriceRange}
        minLimit={MIN_PRICE}
        maxLimit={MAX_PRICE}
        quickButtons={quickPriceButtons}
      />

      <LevelPanel value={selectedStarKeys} onChange={setSelectedStarKeys} />

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
