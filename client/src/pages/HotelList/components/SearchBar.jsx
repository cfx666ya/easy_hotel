import { useNavigate } from 'react-router-dom';

export default function SearchBar({ query, onSearch }) {
  const navigate = useNavigate();

  return (
    <div className="search-bar">
      {/* 城市选择 */}
      <div className="city-select" onClick={() => navigate('/city-select')}>
        {query.city}
      </div>

      {/* 日期 */}
      <div className="date-select">
        <div>{query.checkIn || '入住'}</div>
        <div>{query.checkOut || '离店'}</div>
        <div>{query.nights}晚</div>
      </div>

      {/* 搜索框 */}
      <input
        type="text"
        placeholder="搜索酒店名称/商圈"
        value={query.keyword}
        onChange={(e) =>
          onSearch({
            keyword: e.target.value,
          })
        }
      />

      <button onClick={() => onSearch(query)}>搜索</button>
    </div>
  );
}
