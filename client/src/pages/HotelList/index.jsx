import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { getHotelList } from '../../api/hotel';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import HotelList from './components/HotelList';
import DatePickerModal from './components/DatePickerModal';

export default function HotelListPage() {
  // 用于切换页面时保留数据
  const [searchParams] = useSearchParams();

  const navigate = useNavigate();

  // 查询条件
  // 使用 searchParams 在切换页面时，选择的数据可以保留
  // 后面考虑使用 redux 代替
  const [query, setQuery] = useState({
    city: searchParams.get('city') || '上海',
    keyword: searchParams.get('keyword') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    nights: Number(searchParams.get('nights')) || 1, // 间夜，派生状态
    cursor: 0, // 分页时要取数据的 id
    limit: 3, // 要取多少个数据
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

  // 用 ref 做 请求锁
  // useRef 的 .current 改变不会触发重新渲染。它是一个可变容器，生命周期贯穿整个组件实例
  // 这里不使用 const [loading, setLoading] = useState(false);
  // 因为 state 更新是异步的，setLoading(true) 只是排队更新，如果在此期间：IntersectionObserver 又触发、StrictMode 又调用一次、用户快速滚动，loading 还没更新，第二个请求已经进来了。
  const fetchingRef = useRef(false);

  const fetchHotels = async () => {
    // 当正在处理 fetch 的操作，或者没有更多数据时，直接返回
    if (fetchingRef.current || !hasMore) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const res = await getHotelList(query);

      setHotelList((prev) => {
        const existingIds = new Set(prev.map((i) => i.id));
        const newItems = res.list.filter((i) => !existingIds.has(i.id));
        return [...prev, ...newItems];
      });

      setHasMore(res.hasMore);

      if (res.nextCursor) {
        setQuery((prev) => ({
          ...prev,
          cursor: res.nextCursor,
        }));
      }
    } finally {
      fetchingRef.current = false;
      setLoading(false);
    }
  };

  // 处理首屏加载的逻辑
  const initializedRef = useRef(false);
  useEffect(() => {
    if (initializedRef.current) return;

    initializedRef.current = true;
    fetchHotels();
  }, []);

  // 当查询条件改变时，清空 hotelList 并重置 hasMore
  useEffect(() => {
    setHotelList([]);
    setHasMore(true);
    fetchHotels();
  }, [
    query.city,
    query.checkIn,
    query.checkOut,
    query.keyword,
    query.minPrice,
    query.maxPrice,
    query.score,
    query.sortBy,
  ]);

  // searchParams 变化时，执行的 useEffect
  useEffect(() => {
    const city = searchParams.get('city');
    const keyword = searchParams.get('keyword');
    const checkIn = searchParams.get('checkIn');
    const checkOut = searchParams.get('checkOut');
    const nights = searchParams.get('nights');

    setHotelList([]);
    setHasMore(true);

    setQuery((prev) => ({
      ...prev,
      city: city || '上海',
      keyword: keyword || '',
      checkIn: checkIn || '',
      checkOut: checkOut || '',
      nights: Number(nights) || 1,
      cursor: 0,
    }));
  }, [searchParams]);

  /**
   * 点击加载更多
   * 防止重复点击
   */
  const handleLoadMore = () => {
    fetchHotels();
  };

  const handleSearchChange = (newQuery) => {
    const updatedQuery = {
      ...query,
      ...newQuery,
      cursor: 0,
    };

    const params = new URLSearchParams({
      city: updatedQuery.city,
      keyword: updatedQuery.keyword,
      checkIn: updatedQuery.checkIn || '',
      checkOut: updatedQuery.checkOut || '',
      nights: updatedQuery.nights || '',
    });

    navigate(`/hotel-list?${params.toString()}`);

    setHotelList([]);
    setHasMore(true);
    setQuery(updatedQuery);
  };

  // 管理日历组件
  const [showCalendar, setShowCalendar] = useState(false);

  return (
    <div className="hotel-list-page">
      <SearchBar
        query={query}
        onSearch={handleSearchChange}
        onOpenCalendar={() => setShowCalendar(true)}
      />

      <FilterPanel query={query} onSearch={handleSearchChange} />

      <HotelList
        list={hotelList}
        loading={loading}
        hasMore={hasMore}
        onLoadMore={handleLoadMore}
      />

      <DatePickerModal
        visible={showCalendar}
        onClose={() => setShowCalendar(false)}
        defaultCheckIn={query.checkIn}
        defaultCheckOut={query.checkOut}
        onConfirm={(checkIn, checkOut, nights) => {
          handleSearchChange({
            checkIn,
            checkOut,
            nights,
          });
          setShowCalendar(false);
        }}
      />
    </div>
  );
}
