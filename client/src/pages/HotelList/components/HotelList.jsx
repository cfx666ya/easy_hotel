import HotelCard from './HotelCard';

export default function HotelList({ list, loading, hasMore }) {
  return (
    <div className="hotel-list">
      <h3>酒店列表</h3>

      {list.length === 0 && <p>暂无数据</p>}

      {list.map((item) => (
        <HotelCard key={item.id} data={item} />
      ))}

      {loading && <p>加载中...</p>}
      {!hasMore && <p>没有更多了</p>}
    </div>
  );
}
