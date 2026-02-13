import { useState } from 'react';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import HotelList from './components/HotelList';

export default function HotelListPage() {
  // 查询条件
  const [query, setQuery] = useState({
    city: '',
    checkIn: '',
    checkOut: '',
    page: 1,
    pageSize: 10,
    minPrice: '',
    maxPrice: '',
    score: '',
    sortBy: '',
  });

  // 酒店数据
  const [hotelList, setHotelList] = useState([]);

  // 加载状态
  const [loading, setLoading] = useState(false);

  // 是否还有更多
  const [hasMore, setHasMore] = useState(true);

  return (
    <div className="hotel-list-page">
      <SearchBar query={query} setQuery={setQuery} />
      <FilterPanel query={query} setQuery={setQuery} />
      <HotelList list={hotelList} loading={loading} hasMore={hasMore} />
    </div>
  );
}
