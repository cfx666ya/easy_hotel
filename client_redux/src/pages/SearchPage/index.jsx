import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function SearchPage() {
  const navigate = useNavigate();
  const location = useLocation();

  const city = location.state?.city || '';

  const [keyword, setKeyword] = useState('');
  const [results, setResults] = useState([]);

  const handleBack = () => {
    navigate(-1);
  };

  const handleClear = () => {
    setKeyword('');
    setResults([]);
  };

  const handleSearch = async () => {
    if (!keyword.trim()) return;

    // mock数据过滤（假设你已有hotel列表）
    const res = await fetch(`/api/hotels?city=${city}`);
    const data = await res.json();

    const filtered = data.filter(
      (hotel) =>
        hotel.name.includes(keyword) || hotel.address.includes(keyword),
    );

    setResults(filtered);
  };

  return (
    <div className="search-page">
      {/* 顶部bar */}
      <div className="search-header">
        <div className="back" onClick={handleBack}>
          ←
        </div>

        <div className="search-input-wrapper">
          <span className="icon">🔍</span>

          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder={`搜索${city}的位置/酒店名称`}
          />

          {keyword && (
            <span className="clear" onClick={handleClear}>
              ✖
            </span>
          )}

          <button onClick={handleSearch}>搜索</button>
        </div>
      </div>

      {/* 查询结果 */}
      {keyword && <div className="result-title">{city}城市的查询结果：</div>}

      <div className="result-list">
        {results.map((hotel) => (
          <HotelCard key={hotel.id} hotel={hotel} keyword={keyword} />
        ))}
      </div>
    </div>
  );
}
