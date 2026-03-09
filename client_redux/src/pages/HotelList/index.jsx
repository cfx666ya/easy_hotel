import { useEffect, useRef, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { getHotelList } from '../../api/hotel';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import HotelList from './components/HotelList';
import { buildHotelListQuery } from '../../utils/hotelQuery';
import { setSearchParams } from '../../store/slices/searchSlice';
import {
  setLoading,
  appendHotels,
  setHasMore,
  setCursor,
  resetHotelList,
} from '../../store/slices/hotelListSlice';

export default function HotelListPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // 从 Redux 读取状态
  const query = useSelector((state) => state.search);
  const {
    list: hotelList,
    loading,
    hasMore,
    cursor,
    limit,
  } = useSelector((state) => state.hotelList);

  const fetchingRef = useRef(false);

  // 加载更多函数
  const handleLoadMore = () => {
    if (!hasMore) return;
    fetchHotels({ ...filterQuery, cursor, limit });
  };

  // 传入 FilterPanel 的函数
  const handleSearchChange = (newQuery) => {
    const updatedQuery = { ...filterQuery, ...newQuery, cursor: 0 };
    const queryString = buildHotelListQuery(updatedQuery);
    navigate(`/hotel-list?${queryString}`);
  };

  // 处理点击【搜索】
  const handleSearch = (newKeyword) => {
    const updatedQuery = { ...query, keyword: newKeyword, cursor: 0 };
    const queryString = buildHotelListQuery(updatedQuery);
    navigate(`/hotel-list?${queryString}`);
  };

  // 处理日期变更
  const handleDateChange = ({ checkIn, checkOut, nights }) => {
    handleSearchChange({ checkIn, checkOut, nights });
  };

  const filterQuery = useMemo(
    () => ({
      city: query.city,
      poiId: query.poiId,
      poiName: query.poiName,
      distance: query.distance,
      keyword: query.keyword,
      checkIn: query.checkIn,
      checkOut: query.checkOut,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      score: query.score,
      sortBy: query.sortBy,
      starMin: query.starMin,
      starMax: query.starMax,
      theme: query.theme,
      brand: query.brand,
      facility: query.facility,
      roomType: query.roomType,
    }),
    [
      query.city,
      query.poiId,
      query.poiName,
      query.distance,
      query.keyword,
      query.checkIn,
      query.checkOut,
      query.minPrice,
      query.maxPrice,
      query.score,
      query.sortBy,
      query.starMin,
      query.starMax,
      query.theme,
      query.brand,
      query.facility,
      query.roomType,
    ],
  );

  const fetchHotels = useCallback(
    async (overrideQuery) => {
      if (fetchingRef.current) return;
      fetchingRef.current = true;
      dispatch(setLoading(true));

      try {
        const res = await getHotelList(overrideQuery);
        dispatch(appendHotels(res.list));
        dispatch(setHasMore(res.hasMore));
        if (res.nextCursor) {
          dispatch(setCursor(res.nextCursor));
        }
      } finally {
        fetchingRef.current = false;
        dispatch(setLoading(false));
      }
    },
    [dispatch],
  );

  // filterQuery 变化时加载数据
  useEffect(() => {
    fetchHotels({ ...filterQuery, cursor: 0, limit });
  }, [filterQuery, fetchHotels, limit]);

  // searchParams 变化时同步到 Redux
  useEffect(() => {
    const newQuery = {
      city: searchParams.get('city') || '北京',
      poiId: searchParams.get('poiId') || 0,
      poiName: searchParams.get('poiName') || '天安门',
      distance: Number(searchParams.get('distance')) || '',
      keyword: searchParams.get('keyword') || '',
      checkIn: searchParams.get('checkIn') || '',
      checkOut: searchParams.get('checkOut') || '',
      nights: Number(searchParams.get('nights')) || 1,
      minPrice: searchParams.get('minPrice') || '',
      maxPrice: searchParams.get('maxPrice') || '',
      score: searchParams.get('score') || '',
      sortBy: searchParams.get('sortBy') || 'score_desc',
      starMin: searchParams.get('starMin') || '',
      starMax: searchParams.get('starMax') || '',
      theme: searchParams.get('theme') || '',
      brand: searchParams.get('brand') || '',
      facility: searchParams.get('facility') || '',
      roomType: searchParams.get('roomType') || '',
    };

    dispatch(setSearchParams(newQuery));
    return () => {
      dispatch(resetHotelList());
    };
  }, [searchParams, dispatch]);

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        background: '#f5f5f5',
      }}
    >
      <SearchBar
        query={query}
        keyword={query.keyword}
        onSearch={handleSearch}
        onDateChange={handleDateChange}
      />
      <FilterBar query={query} onSearch={handleSearchChange} />
      <div
        style={{
          flex: 1,
          overflowY: 'auto',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <HotelList
          list={hotelList}
          keyword={query.keyword}
          loading={loading}
          hasMore={hasMore}
          onLoadMore={handleLoadMore}
        />
      </div>
    </div>
  );
}
