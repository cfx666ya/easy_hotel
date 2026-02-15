import { useEffect, useRef } from 'react';
import HotelCard from './HotelCard';

export default function HotelList({ list, loading, hasMore, onLoadMore }) {
  const loaderRef = useRef(null);

  useEffect(() => {
    if (!hasMore || loading || list.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !loading) {
          onLoadMore();
        }
      },
      { threshold: 1 },
    );

    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }

    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loading, onLoadMore]);

  return (
    <div className="hotel-list">
      <h3>酒店列表</h3>

      {list.length === 0 && !loading && <p>暂无数据</p>}

      {list.map((item) => (
        <HotelCard key={item.id} data={item} />
      ))}

      {loading && <p>加载中...</p>}

      {/* 👇 这个就是触发点 */}
      {hasMore && <div ref={loaderRef} style={{ height: 20 }} />}

      {!hasMore && list.length > 0 && (
        <p style={{ textAlign: 'center' }}>没有更多了</p>
      )}
    </div>
  );
}
