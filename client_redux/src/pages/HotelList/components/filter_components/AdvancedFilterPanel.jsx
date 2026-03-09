/**
 * 筛选面板
 */
import { useState, useEffect, useCallback, useRef } from 'react';
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

const OPTIONS_MAP = {
  theme: ['亲子', '电竞', '四合院', '海景', '浪漫', '商务', '度假'],
  brand: [
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
  ],
  facility: [
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
  ],
  roomType: ['大床房', '双床房', '套房', '家庭房', '总统套房', '公寓'],
};

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

  const sectionRefs = useRef({});

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

  // ======= 滚动监听 =======
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const key = entry.target.getAttribute('data-key');
            setFilterLeftActive(key);
          }
        });
      },
      {
        root: document.querySelector('#rightScrollContainer'),
        threshold: 0.3,
      },
    );

    Object.values(sectionRefs.current).forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  // ======= 点击左侧滚动到对应位置 =======
  const scrollToSection = (key) => {
    const el = sectionRefs.current[key];
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setFilterLeftActive(key);
    }
  };

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
            height: '50%',
            display: 'flex',
            flexDirection: 'column',
            background: '#fff',
          }}
          onClick={(e) => e.stopPropagation()} // 阻止事件冒泡
        >
          {/* 内容区域 */}
          <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
            {/* 左侧导航 */}
            <div style={{ width: 90, background: '#f7f7f7' }}>
              {FILTER_LEFT_NAV.map((item) => (
                <div
                  key={item.key}
                  onClick={() => scrollToSection(item.key)}
                  style={{
                    padding: '14px 8px',
                    fontSize: 14,
                    color: filterLeftActive === item.key ? '#1677ff' : '#333',
                    background:
                      filterLeftActive === item.key ? '#e6f0ff' : 'transparent',
                  }}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* 右侧滚动区域 */}
            <div
              id="rightScrollContainer"
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: 12,
              }}
            >
              {FILTER_LEFT_NAV.map((nav) => (
                <div
                  key={nav.key}
                  data-key={nav.key}
                  ref={(el) => (sectionRefs.current[nav.key] = el)}
                  style={{ marginBottom: 20 }}
                >
                  {/* 分类标题 */}
                  <div style={{ fontSize: 16, marginBottom: 10 }}>
                    {nav.label}
                  </div>

                  {/* 选项 */}
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                    {OPTIONS_MAP[nav.key].map((opt) => {
                      const active = selectedFilters[nav.key].includes(opt);
                      return (
                        <div
                          key={opt}
                          onClick={() => handleFilterOptionClick(nav.key, opt)}
                          style={{
                            padding: '6px 12px',
                            borderRadius: 20,
                            fontSize: 14,
                            border: '1px solid',
                            borderColor: active ? '#1677ff' : '#ddd',
                            color: active ? '#1677ff' : '#333',
                            background: active ? '#e6f0ff' : '#fff',
                          }}
                        >
                          {opt}
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 底部 */}
          <div
            style={{
              padding: 12,
              borderTop: '1px solid #eee',
              display: 'flex',
              gap: 10,
            }}
          >
            <button
              onClick={handleClear}
              style={{
                flex: 1,
                height: 40,
                borderRadius: 8,
                border: '1px solid #ddd',
                background: '#fff',
                fontSize: 16,
              }}
            >
              清空
            </button>

            <button
              onClick={handleConfirm}
              style={{
                flex: 2,
                height: 40,
                borderRadius: 8,
                border: 'none',
                background: '#1677ff',
                color: '#fff',
                fontSize: 16,
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
