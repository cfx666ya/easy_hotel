import { useState } from 'react';

export default function FilterPanel() {
  // 当前激活的 tab
  const [activeTab, setActiveTab] = useState(null);

  // 左侧导航当前选中
  const [activeLeftNav, setActiveLeftNav] = useState('hot');

  // 左侧导航数据（静态）
  const LEFT_NAV = [
    { key: 'hot', label: '热门推荐' },
    { key: 'sight', label: '观光景点' },
    { key: 'business', label: '商圈' },
    { key: 'district', label: '行政区' },
    { key: 'station', label: '机场/车站' },
    { key: 'school', label: '高校' },
    { key: 'hospital', label: '医院' },
  ];

  // 右侧假数据（模拟北京）
  const RIGHT_DATA = {
    hot: ['天安门广场', '王府井', '前门大街'],
    sight: ['故宫', '颐和园', '八达岭长城'],
    business: ['国贸', '三里屯', '中关村'],
    district: ['朝阳区', '海淀区', '西城区'],
    station: ['北京南站', '北京西站', '首都机场'],
    school: ['清华大学', '北京大学', '人民大学'],
    hospital: ['协和医院', '301医院', '朝阳医院'],
  };

  // 切换顶部tab
  const handleTabClick = (tab) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  return (
    <div className="filter-panel-wrapper">
      {/* ===== 顶部 FilterBar ===== */}
      <div className="filter-bar">
        <div
          className={`filter-item ${activeTab === 'location' ? 'active' : ''}`}
          onClick={() => handleTabClick('location')}
        >
          位置/距离 ▼
        </div>
        <div className="filter-item">价格/星级 ▼</div>
        <div className="filter-item">居数/床数 ▼</div>
        <div className="filter-item">筛选/排序 ▼</div>
      </div>

      {/* ===== Panel（只在点击 位置/距离 时显示）===== */}
      {activeTab === 'location' && (
        <div className="panel">
          <div className="panel-content">
            {/* 左侧导航 */}
            <div className="left-nav">
              {LEFT_NAV.map((item) => (
                <div
                  key={item.key}
                  className={`left-nav-item ${
                    activeLeftNav === item.key ? 'active' : ''
                  }`}
                  onClick={() => setActiveLeftNav(item.key)}
                >
                  {item.label}
                </div>
              ))}
            </div>

            {/* 右侧内容 */}
            <div className="right-content">
              {RIGHT_DATA[activeLeftNav].map((name, index) => (
                <div key={index} className="right-item">
                  {name}
                </div>
              ))}
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="panel-footer">
            <button className="clear-btn">清空</button>
            <button className="confirm-btn">查看房屋（300套以上可订）</button>
          </div>
        </div>
      )}
    </div>
  );
}
