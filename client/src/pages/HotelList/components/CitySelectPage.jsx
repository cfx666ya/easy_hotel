/**
 * 城市选择页
 * 在【酒店列表页】的搜索框点击【城市】后，进入该页面
 */

import { useNavigate } from 'react-router-dom';

export default function CitySelectPage() {
  const navigate = useNavigate();

  // 模拟热门城市数据
  const hotCities = ['北京', '上海', '广州', '深圳', '杭州', '成都'];

  // 点击城市
  const handleSelectCity = (city) => {
    navigate('/hotel-list', {
      state: { city }, // 把城市传回去
    });
  };

  return (
    <div className="city-select-page">
      {/* 顶部搜索 */}
      <div className="top-bar">
        <input placeholder="城市/区域/位置" />
        <button onClick={() => navigate(-1)}>取消</button>
      </div>

      {/* toggle bar */}
      <div className="toggle-bar">
        <span className="active">国内</span>
        <span>上海热搜</span>
        <span>海外</span>
      </div>

      {/* 热门城市 */}
      <div className="hot-city">
        <h3>热门城市</h3>

        <div className="city-grid">
          {hotCities.map((city) => (
            <div
              key={city}
              className="city-item"
              onClick={() => handleSelectCity(city)}
              style={{
                padding: '10px',
                margin: '5px',
                background: '#f5f5f5',
                display: 'inline-block',
                borderRadius: '6px',
                cursor: 'pointer',
              }}
            >
              {city}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
