import { useState, useEffect, useCallback } from 'react';
import { Slider } from 'antd';
import { getPoiList, getHotelCount } from '../../../api/hotel';
import useDebounce from '../../../hooks/useDebounce.jsx';

export default function FilterPanel({ query, onSearch }) {
  // Panel 中 UI 相关
  const LEFT_NAV = [
    { key: 'hot', label: '热门推荐' },
    { key: 'sight', label: '观光景点' },
    { key: 'business', label: '商圈' },
    { key: 'district', label: '行政区' },
    { key: 'station', label: '机场/车站' },
    { key: 'school', label: '高校' },
    { key: 'hospital', label: '医院' },
  ];
  // 判断是否有生效的筛选条件
  const hasSortFilter = Boolean(query.sortBy);
  const hasLocationFilter = Boolean(query.poiId || query.distance);
  const hasPriceLevelFilter = Boolean(
    query.minPrice || query.maxPrice || query.starMin || query.starMax,
  );
  const [activeTab, setActiveTab] = useState(null);
  const [activeLeftNav, setActiveLeftNav] = useState('hot');
  const [previewCount, setPreviewCount] = useState(0); // 显示房屋总数
  const [loadingPoi, setLoadingPoi] = useState(false);

  /**
   * 【位置/距离】相关
   */
  // 位置状态管理
  const DISTANCES = [1, 2, 3, 4, 5]; // 距离
  const [selectedPoi, setSelectedPoi] = useState(null);
  const [selectedDistance, setSelectedDistance] = useState(null);
  const [pois, setPois] = useState([]); // 当前城市的 POI 列表

  // 获取当前城市的所有 POI，监听 query.city
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

  // 修改 handleSelectPoi，在选择 poi 后也更新预览（不带距离）
  const handleSelectPoi = async (poi) => {
    setSelectedPoi(poi);
    setSelectedDistance(null);
    await fetchLocationPreviewCount(poi.id, null); // 不传距离，表示不过滤距离
  };

  // 修改位置面板的 handleSelectDistance
  const handleSelectDistance = async (d) => {
    setSelectedDistance(d);
    if (!selectedPoi) return;
    await fetchLocationPreviewCount(selectedPoi.id, d);
  };

  // 通用预览计数函数（用于位置面板）
  const fetchLocationPreviewCount = async (poiId, distance) => {
    try {
      const params = {
        city: query.city,
        keyword: query.keyword,
        poiId,
        ...(distance && { distance }), // 距离可选
      };
      // 从 query 中获取已确认的价格星级
      if (query.minPrice) params.minPrice = query.minPrice;
      if (query.maxPrice) params.maxPrice = query.maxPrice;
      if (query.starMin) params.starMin = query.starMin;
      if (query.starMax) params.starMax = query.starMax;
      const data = await getHotelCount(params);
      setPreviewCount(data.total);
    } catch (error) {
      console.error('Failed to fetch location preview count:', error);
    }
  };

  // 清空
  const handleClear = () => {
    setSelectedPoi(null);
    setSelectedDistance(null);
    setPreviewCount(0);
    onSearch({ poiId: '', distance: '' });
  };

  // 用户点击【查看房屋】
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

  /**
   * 【价格/等级】相关
   */
  // 价格等级 状态管理
  const [priceRange, setPriceRange] = useState([0, 2000]); // 价格范围：[min, max]
  const [selectedStarKeys, setSelectedStarKeys] = useState([]); // 星级：可多选，所以用数组，例如 ['3', '4']
  const [activeQuickPriceIndex, setActiveQuickPriceIndex] = useState(null); // 当前高亮的快速价格按钮索引
  // 价格滑块范围
  const MIN_PRICE = 0;
  const MAX_PRICE = 2000;
  // 快速价格按钮配置（两行，每行四个）
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
  // 星级按钮配置
  const starButtons = [
    { key: '2-', label: '2星及以下', subLabel: '经济', min: null, max: 2 },
    { key: '3', label: '3星', subLabel: '舒适', min: 3, max: 3 },
    { key: '4', label: '4星', subLabel: '高档', min: 4, max: 4 },
    { key: '5', label: '5星', subLabel: '豪华', min: 5, max: 5 },
  ];

  // 从 starMin/starMax 转换为星级 key 数组
  const getStarKeysFromMinMax = (starMin, starMax) => {
    const keys = [];
    const min = starMin ? Number(starMin) : null;
    const max = starMax ? Number(starMax) : null;

    starButtons.forEach((star) => {
      if (star.key === '2-') {
        // 2星及以下：无下限，上限为2
        if (
          (min === null && max !== null && max >= 2) ||
          (min !== null && min <= 2 && max !== null && max >= 2)
        ) {
          keys.push(star.key);
        }
      } else {
        // 其他星级有明确区间
        if (min !== null && max !== null) {
          if (star.min <= max && star.max >= min) keys.push(star.key);
        } else if (min === null && max !== null) {
          if (star.max <= max) keys.push(star.key);
        } else if (min !== null && max === null) {
          if (star.min >= min) keys.push(star.key);
        }
      }
    });
    return keys;
  };

  // 从选中的星级 keys 计算 starMin/starMax
  const getStarMinMaxFromKeys = (keys) => {
    let starMin = null,
      starMax = null;
    keys.forEach((key) => {
      const star = starButtons.find((s) => s.key === key);
      if (star) {
        if (star.min !== null) {
          starMin = starMin === null ? star.min : Math.min(starMin, star.min);
        } else {
          starMin = null; // 包含 '2-' 时下限为无
        }
        if (star.max !== null) {
          starMax = starMax === null ? star.max : Math.max(starMax, star.max);
        }
      }
    });
    return {
      starMin: starMin === null ? '' : starMin,
      starMax: starMax === null ? '' : starMax,
    };
  };

  // 从 URL 恢复状态
  useEffect(() => {
    if (activeTab === 'price_level') {
      // 价格
      const min = query.minPrice ? Number(query.minPrice) : MIN_PRICE;
      const max = query.maxPrice ? Number(query.maxPrice) : MAX_PRICE;
      setPriceRange([min, max]);

      // 匹配快速价格按钮
      const matchedIndex = quickPriceButtons.findIndex(
        (btn) => btn.min === min && btn.max === max,
      );
      setActiveQuickPriceIndex(matchedIndex !== -1 ? matchedIndex : null);

      // 星级
      const starKeys = getStarKeysFromMinMax(query.starMin, query.starMax);
      setSelectedStarKeys(starKeys);
    }
  }, [activeTab, query]);

  // 通用预览计数函数（用于价格面板）
  const fetchPriceLevelCount = useCallback(async () => {
    try {
      const params = {
        city: query.city,
        keyword: query.keyword,
        poiId: query.poiId,
        distance: query.distance,
      };
      if (priceRange[0] !== MIN_PRICE) params.minPrice = priceRange[0];
      if (priceRange[1] !== MAX_PRICE) params.maxPrice = priceRange[1];

      const { starMin, starMax } = getStarMinMaxFromKeys(selectedStarKeys);
      if (starMin) params.starMin = starMin;
      if (starMax) params.starMax = starMax;

      const data = await getHotelCount(params);
      setPreviewCount(data.total);
    } catch (error) {
      console.error('Failed to fetch price/level count:', error);
    }
  }, [
    query.city,
    query.keyword,
    query.poiId,
    query.distance,
    priceRange,
    selectedStarKeys,
  ]);

  // 使用自定义的 useDebounce hook
  const debouncedFetchPriceLevelCount = useDebounce(fetchPriceLevelCount, 300);

  // 当价格或星级变化时更新预览计数（使用防抖避免频繁请求）
  // 当依赖项变化时，调用防抖函数
  useEffect(() => {
    debouncedFetchPriceLevelCount();
  }, [debouncedFetchPriceLevelCount]); // 只需依赖防抖函数本身

  // 处理价格滑块变化（实时更新）
  const handlePriceChange = (value) => {
    setPriceRange(value);
    setActiveQuickPriceIndex(null); // 取消快速按钮高亮
  };

  // 滑块拖动结束后触发计数（可选，已由 useEffect 处理）
  const handlePriceAfterChange = () => {
    // 可留空，useEffect 已处理
  };

  // 处理快速价格按钮点击
  const handleQuickPrice = (min, max, index) => {
    setPriceRange([min, max]);
    setActiveQuickPriceIndex(index); // 高亮显示
  };

  // 星级点击（切换选中）
  const handleStarClick = (starKey) => {
    setSelectedStarKeys((prev) =>
      prev.includes(starKey)
        ? prev.filter((k) => k !== starKey)
        : [...prev, starKey],
    );
  };

  // 清空价格/等级选择
  const handleClearPriceLevel = () => {
    setPriceRange([MIN_PRICE, MAX_PRICE]);
    setSelectedStarKeys([]); // 清空数组
    setActiveQuickPriceIndex(null);
    onSearch({ minPrice: '', maxPrice: '', starMin: '', starMax: '' });
  };

  // 确认价格/等级筛选
  const handleConfirmPriceLevel = () => {
    const [min, max] = priceRange;
    const { starMin, starMax } = getStarMinMaxFromKeys(selectedStarKeys);
    onSearch({
      minPrice: min === MIN_PRICE ? '' : min,
      maxPrice: max === MAX_PRICE ? '' : max,
      starMin,
      starMax,
    });
    setActiveTab(null); // 关闭面板
  };

  // 获取价格标签显示文本
  const getPriceLabel = () => {
    const [min, max] = priceRange;
    if (min === MIN_PRICE && max === MAX_PRICE) {
      return <span style={{ color: '#999' }}>不限</span>;
    }
    if (min === MIN_PRICE) {
      return <>￥{max}以下</>;
    }
    if (max === MAX_PRICE) {
      return <>￥{min}以上</>;
    }
    return (
      <>
        ￥{min}-{max}
      </>
    );
  };

  /**
   * 排序相关
   */
  // 排序规则
  const SORT_OPTIONS = [
    { key: 'score_desc', label: '欢迎度排序', apiValue: '' }, // 默认（后端按 score 降序）
    { key: 'price_asc', label: '低价优先', apiValue: 'price_asc' },
    { key: 'price_desc', label: '高价优先', apiValue: 'price_desc' },
    { key: 'star_desc', label: '高星优先', apiValue: 'star_desc' },
  ];

  // 排序相关状态
  const [selectedSort, setSelectedSort] = useState(
    () => query.sortBy || 'score_desc',
  );

  // 当 query.sortBy 变化时同步内部状态（例如通过 URL 直接修改）
  useEffect(() => {
    setSelectedSort(query.sortBy || 'score_desc');
  }, [query.sortBy]);

  // 获取当前排序显示的标签
  const getSortLabel = () => {
    const current = SORT_OPTIONS.find((opt) => opt.key === selectedSort);
    return current ? current.label : '欢迎度排序';
  };

  // 处理排序选择
  const handleSortSelect = (sortKey) => {
    const option = SORT_OPTIONS.find((opt) => opt.key === sortKey);
    if (!option) return;

    // 如果点击的是当前已选中的选项，只关闭面板，不重复请求
    if (sortKey === selectedSort) {
      setActiveTab(null);
      return;
    }

    setSelectedSort(sortKey);
    onSearch({ sortBy: option.apiValue }); // 传递 apiValue（空字符串表示默认排序）
    setActiveTab(null); // 关闭面板
  };

  /**
   * 【筛选】相关
   */
  // 筛选左侧导航
  const FILTER_LEFT_NAV = [
    { key: 'theme', label: '主题特色' },
    { key: 'brand', label: '品牌' },
    { key: 'facility', label: '设施' },
    { key: 'roomType', label: '酒店房型' },
  ];

  // 右侧选项（这些应与 mock 端定义的列表一致，可硬编码）
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

  // 筛选面板状态
  const [filterLeftActive, setFilterLeftActive] = useState('theme'); // 当前选中左侧导航
  const [selectedFilters, setSelectedFilters] = useState({
    theme: [],
    brand: [],
    facility: [],
    roomType: [],
  });

  // 判断是否有筛选条件（用于高亮 filter-item）
  const hasFilter = Object.values(selectedFilters).some(
    (arr) => arr.length > 0,
  );

  // 当 activeTab === 'filter' 时，从 query 初始化选中状态
  useEffect(() => {
    if (activeTab === 'filter') {
      setSelectedFilters({
        theme: query.theme ? query.theme.split(',') : [],
        brand: query.brand ? query.brand.split(',') : [],
        facility: query.facility ? query.facility.split(',') : [],
        roomType: query.roomType ? query.roomType.split(',') : [],
      });
    }
  }, [activeTab, query]);

  // 获取预览计数
  const fetchFilterCount = useCallback(async () => {
    try {
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
      const data = await getHotelCount(params);
      setPreviewCount(data.total);
    } catch (error) {
      console.error('Failed to fetch filter count:', error);
    }
  }, [query, selectedFilters]);

  const debouncedFetchFilterCount = useDebounce(fetchFilterCount, 300);

  useEffect(() => {
    if (activeTab === 'filter') {
      debouncedFetchFilterCount();
    }
  }, [debouncedFetchFilterCount, activeTab]);

  // 在【筛选】 panel 中选中某个选项的通用逻辑
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
  const handleClearFilter = () => {
    setSelectedFilters({
      theme: [],
      brand: [],
      facility: [],
      roomType: [],
    });
    // 预览计数会通过 useEffect 自动更新
  };

  // 确认
  const handleConfirmFilter = () => {
    onSearch({
      theme: selectedFilters.theme.join(','),
      brand: selectedFilters.brand.join(','),
      facility: selectedFilters.facility.join(','),
      roomType: selectedFilters.roomType.join(','),
    });
    setActiveTab(null); // 关闭面板
  };

  return (
    <div className="filter-panel-wrapper">
      {/* FilterBar */}
      <div className="filter-bar">
        <div
          className={`filter-item ${activeTab === 'sort' ? 'active' : ''}${hasSortFilter ? 'has-filter' : ''}`}
          onClick={() =>
            setActiveTab((prev) => (prev === 'sort' ? null : 'sort'))
          }
        >
          {getSortLabel()} {activeTab === 'sort' ? '▲' : '▼'}
        </div>
        <div
          className={`filter-item ${activeTab === 'location' ? 'active' : ''}${hasLocationFilter ? 'has-filter' : ''}`}
          onClick={() =>
            setActiveTab((prev) => (prev === 'location' ? null : 'location'))
          }
        >
          {getLocationLabel()} {activeTab === 'location' ? '▲' : '▼'}
        </div>
        <div
          className={`filter-item ${activeTab === 'price_level' ? 'active' : ''}${hasPriceLevelFilter ? 'has-filter' : ''}`}
          onClick={() =>
            setActiveTab((prev) =>
              prev === 'price_level' ? null : 'price_level',
            )
          }
        >
          价格/等级 {activeTab === 'price_level' ? '▲' : '▼'}
        </div>
        <div
          className={`filter-item ${activeTab === 'filter' ? 'active' : ''}${hasFilter ? 'has-filter' : ''}`}
          onClick={() =>
            setActiveTab((prev) => (prev === 'filter' ? null : 'filter'))
          }
        >
          筛选 {activeTab === 'filter' ? '▲' : '▼'}
        </div>
      </div>

      {/* 【排序】Panel */}
      {activeTab === 'sort' && (
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
          {/* 排序面板不需要底部按钮 */}
        </div>
      )}
      {/* 【位置/距离】Panel */}
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
              查看酒店（{previewCount}套以上可订）
            </button>
          </div>
        </div>
      )}

      {/* 【价格/等级】Panel */}
      {activeTab === 'price_level' && (
        <div className="panel price-level-panel">
          {/* 第一行：每晚价格 + 动态价格标签 */}
          <div className="price-header">
            <span className="price-label">每晚价格</span>
            <span
              className="price-value"
              style={{
                color:
                  priceRange[0] === MIN_PRICE && priceRange[1] === MAX_PRICE
                    ? '#999'
                    : '#007aff',
              }}
            >
              {getPriceLabel()}
            </span>
          </div>

          {/* 双滑块 */}
          <div className="price-slider">
            <Slider
              range
              min={MIN_PRICE}
              max={MAX_PRICE}
              value={priceRange}
              onChange={handlePriceChange}
              onChangeComplete={handlePriceAfterChange}
              tooltip={{
                formatter: (value) => `￥${value}`,
              }}
            />
          </div>

          {/* 快速价格按钮（两行） */}
          <div className="quick-price-buttons">
            {quickPriceButtons.map((btn, index) => (
              <button
                key={index}
                className={`quick-price-btn ${activeQuickPriceIndex === index ? 'active' : ''}`}
                onClick={() => handleQuickPrice(btn.min, btn.max, index)}
              >
                {btn.label}
              </button>
            ))}
          </div>

          {/* 房屋等级 */}
          <div className="star-buttons">
            {starButtons.map((star) => (
              <button
                key={star.key}
                className={`star-btn ${selectedStarKeys.includes(star.key) ? 'active' : ''}`}
                onClick={() => handleStarClick(star.key)}
              >
                <div className="star-main">{star.label}</div>
                <div className="star-sub">{star.subLabel}</div>
              </button>
            ))}
          </div>

          {/* 底部按钮 */}
          <div className="panel-footer">
            <button className="clear-btn" onClick={handleClearPriceLevel}>
              清空
            </button>
            <button className="confirm-btn" onClick={handleConfirmPriceLevel}>
              查看酒店（{previewCount}套以上可订）
            </button>
          </div>
        </div>
      )}

      {activeTab === 'filter' && (
        <div className="panel filter-panel">
          <div className="panel-content">
            {/* 左侧导航 */}
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

            {/* 右侧选项 */}
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

          {/* 底部按钮 */}
          <div className="panel-footer">
            <button className="clear-btn" onClick={handleClearFilter}>
              清空
            </button>
            <button className="confirm-btn" onClick={handleConfirmFilter}>
              查看酒店（{previewCount}套以上可订）
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
