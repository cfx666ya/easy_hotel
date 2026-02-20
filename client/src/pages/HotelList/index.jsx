import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

import { getHotelList } from '../../api/hotel';
import SearchBar from './components/SearchBar';
import FilterPanel from './components/FilterPanel';
import HotelList from './components/HotelList';
import DatePickerModal from './components/DatePickerModal';
import { buildHotelListQuery } from '../../utils/hotelQuery';

export default function HotelListPage() {
  // 用于读取和修改当前 URL 的查询字符串
  const [searchParams] = useSearchParams();

  // 用于导航
  const navigate = useNavigate();

  // 查询条件，统一从URL初始化
  // 使用 searchParams 读取当前 url 中的数据
  const [query, setQuery] = useState({
    city: searchParams.get('city') || '上海',
    keyword: searchParams.get('keyword') || '',
    checkIn: searchParams.get('checkIn') || '',
    checkOut: searchParams.get('checkOut') || '',
    nights: Number(searchParams.get('nights')) || 1,
    cursor: 0,
    limit: 3,
    score: searchParams.get('score') || '',
    sortBy: searchParams.get('sortBy') || 'score_desc',
    poiId: searchParams.get('poiId') || '',
    distance: searchParams.get('distance') || '',
    minPrice: searchParams.get('minPrice') || '',
    maxPrice: searchParams.get('maxPrice') || '',
    starMin: searchParams.get('starMin') || '',
    starMax: searchParams.get('starMax') || '',
    theme: searchParams.get('theme') || '',
    brand: searchParams.get('brand') || '',
    facility: searchParams.get('facility') || '',
    roomType: searchParams.get('roomType') || '',
  });

  const [hotelList, setHotelList] = useState([]); // 酒店列表数据
  const [loading, setLoading] = useState(false); // 加载状态
  const [hasMore, setHasMore] = useState(true); // 是否还有更多

  // 用 ref 做 请求锁
  // useRef 的 .current 改变不会触发重新渲染。它是一个可变容器，生命周期贯穿整个组件实例
  // 这里不使用 const [loading, setLoading] = useState(false);
  // 因为 state 更新是异步的，setLoading(true) 只是排队更新，如果在此期间：IntersectionObserver 又触发、StrictMode 又调用一次、用户快速滚动，loading 还没更新，第二个请求已经进来了。
  const fetchingRef = useRef(false);
  const initializedRef = useRef(false);

  const fetchHotels = async () => {
    // 当正在处理 fetch 的操作，或者没有更多数据时，直接返回
    console.log('fetchingRef.current', fetchingRef.current);
    console.log('!hasMore', !hasMore);
    if (fetchingRef.current) return;

    fetchingRef.current = true;
    setLoading(true);

    try {
      const res = await getHotelList(query);

      // 函数式更新，参数 prev 是当前的 hotelList 数组
      setHotelList((prev) => {
        // 创建一个 Set，包含所有已存在的酒店 ID
        const existingIds = new Set(prev.map((i) => i.id));
        // 过滤出不在 prev 中的新酒店
        const newItems = res.list.filter((i) => !existingIds.has(i.id));
        // 将原有的 hotelList 和 newItems 返回给 prev进行更新
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
  useEffect(() => {
    if (initializedRef.current) return;
    initializedRef.current = true;
    fetchHotels();
  }, []);

  // 当查询条件改变时，清空 hotelList 并重置 hasMore，然后再取数据
  useEffect(() => {
    // 跳过初始加载
    if (!initializedRef.current) return;
    console.log('query 变化了', query);
    setHotelList([]);
    setHasMore(true);
    console.log('query 变化时的 hasMore', hasMore);
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
    query.poiId,
    query.distance,
    query.starMin,
    query.starMax,
    query.theme,
    query.brand,
    query.facility,
    query.roomType,
  ]);

  // searchParams 变化时，将 url 参数变化时同步到 query
  useEffect(() => {
    const newQuery = {
      city: searchParams.get('city') || '上海',
      keyword: searchParams.get('keyword') || '',
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || '',
      nights: Number(searchParams.get('nights')) || 1,
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      score: searchParams.get('score') || '',
      sortBy: searchParams.get('sortBy') || 'score_desc',
      cursor: 0,
      limit: searchParams.get('limit') || 3,
      poiId: searchParams.get('poiId') || '',
      distance: searchParams.get('distance') || '',
      starMin: searchParams.get('starMin') || '',
      starMax: searchParams.get('starMax') || '',
      theme: searchParams.get('theme') || '',
      brand: searchParams.get('brand') || '',
      facility: searchParams.get('facility') || '',
      roomType: searchParams.get('roomType') || '',
    };

    setQuery(newQuery);
    console.log('searchParams变化，引起了 query 变化');
  }, [searchParams]);

  // 加载更多函数
  const handleLoadMore = () => {
    console.log('handleLoadMore 执行了');
    fetchHotels();
  };

  // 传入 FilterPanel 的函数，传回的 newQuery 为 poiId 和 distance
  const handleSearchChange = (newQuery) => {
    // 更新 query
    const updatedQuery = {
      ...query,
      ...newQuery,
      cursor: 0,
    };

    // 构建URL参数
    const queryString = buildHotelListQuery(updatedQuery);
    navigate(`/hotel-list?${queryString}`);
    // query会通过URL变化的useEffect自动更新，不需要手动setQuery
  };

  // 处理点击【搜索】的逻辑，参数为输入框中的 keyword
  const handleSearch = (newKeyword) => {
    // 直接更新 URL，通过 useEffect 同步到 query，useEffect 中会调用 fetchHotels
    const updatedQuery = {
      ...query,
      keyword: newKeyword,
      cursor: 0,
    };

    const queryString = buildHotelListQuery(updatedQuery);
    navigate(`/hotel-list?${queryString}`);
  };

  const [showCalendar, setShowCalendar] = useState(false); // 管理日历组件

  // 注意：不再使用filteredList，直接传递原始数据
  // 过滤应该由后端API处理

  return (
    <div className="hotel-list-page">
      <SearchBar
        query={query}
        keyword={query.keyword}
        onSearch={handleSearch}
        onOpenCalendar={() => setShowCalendar(true)}
      />

      <FilterPanel query={query} onSearch={handleSearchChange} />

      <HotelList
        list={hotelList}
        keyword={query.keyword}
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
