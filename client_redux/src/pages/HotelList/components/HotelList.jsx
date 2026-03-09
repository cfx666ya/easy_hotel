/**
 * 加入【防抖】机制
 * 通俗理解：防抖 = 【只执行最后一次操作】
 * 如果没有防抖，当元素刚进入视口时，IntersectionObserver 可能连续触发 5~10 次，会疯狂调用 loadWithRetry()
 * 可能导致：重复请求、服务器压力大、状态错乱
 * 而加上防抖，只会执行最后一次，非常安全
 */

import { useEffect, useRef, useCallback } from 'react';
import HotelCard from '../../../components/HotelCard.jsx';
import useDebounce from '../../../hooks/useDebounce.jsx';

export default function HotelList({
  list,
  keyword,
  loading,
  hasMore,
  onLoadMore,
}) {
  const loaderRef = useRef(null); // 保存【触发加载更多】的 DOM 元素
  const observerRef = useRef(null); // 保存 IntersectionObserver 实例
  const retryCountRef = useRef(0); // 记录重试次数
  const MAX_RETRIES = 3; // 最多重试 3 次

  // 带重试的加载函数
  // 依赖 onLoadMore，当 onLoadMore 更改，该函数地址才会更改，避免不必要的计算
  const loadWithRetry = useCallback(() => {
    // 在这里，真正递归的是 attempt 而不是 loadWithRetry，这样可以避免 useCallback 的递归依赖问题
    const attempt = async () => {
      if (retryCountRef.current >= MAX_RETRIES) {
        console.log('达到最大重试次数，停止尝试');
        return;
      }

      // 增加重试次数
      retryCountRef.current += 1;
      console.log(`尝试加载更多，第 ${retryCountRef.current} 次`);

      try {
        // 调用加载函数，等待真正请求完成，成功后重置，失败则重新请求
        await onLoadMore();
        retryCountRef.current = 0;
      } catch (error) {
        console.error('加载失败，将重试:', error);

        setTimeout(() => {
          attempt();
        }, 2 ** retryCountRef.current);
      }
    };

    attempt();
  }, [onLoadMore]);

  // 重置重试计数
  useEffect(() => {
    retryCountRef.current = 0;
  }, [list]); // 当列表更新时，说明加载成功，重置重试计数

  // 使用自定义防抖 Hook，useDebounce 的参数是一个 callback 函数
  const debouncedHandleIntersect = useDebounce(
    (entries) => {
      const [target] = entries;

      // 当元素可见、不在加载中、还有更多数据时，重置重试计数，并调用【带有重试的加载函数】，延迟为100ms
      if (target.isIntersecting && !loading && hasMore) {
        retryCountRef.current = 0;
        loadWithRetry();
      }
    },
    100,
    [loading, hasMore, loadWithRetry],
  );

  useEffect(() => {
    // console.log('状态:', { hasMore, loading, listLength: list.length });

    if (!hasMore || loading) return;

    // 这段的作用是，每次该 useEffect 重新执行时，清理旧的 observer
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    // 创建新的 observer，使用更保守的配置
    observerRef.current = new IntersectionObserver(debouncedHandleIntersect, {
      root: null,
      // 只在元素即将进入视口时触发，给一个合理的提前量
      rootMargin: '0px 0px 50px 0px', // 把检测范围向下扩展 50px，提前通知
      threshold: 0.5, // 元素 50% 可见才触发，避免太灵敏
    });

    // 开始观察 loader 元素
    if (loaderRef.current) {
      observerRef.current.observe(loaderRef.current);
    }

    // 这段清理函数的作用是，当组件卸载时，清除 observer
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [hasMore, loading, debouncedHandleIntersect, list.length]);

  // 如果列表为空且不在加载中，显示暂无数据
  if (list.length === 0 && !loading) {
    return (
      <div>
        <h3
          style={{
            padding: '6px 8px',
          }}
        >
          {keyword ? `${keyword} 的查询结果：` : ''}
        </h3>
        <p
          style={{
            padding: '6px 8px',
          }}
        >
          暂无数据
        </p>
      </div>
    );
  }

  return (
    <div>
      {keyword && (
        <h3
          style={{
            padding: '6px 8px',
          }}
        >
          {`${keyword} 的查询结果：`}
        </h3>
      )}

      {list.map((item) => (
        <HotelCard key={item.id} data={item} keyword={keyword} />
      ))}

      {/* 加载中指示器 */}
      {loading && (
        <div
          style={{
            textAlign: 'center',
            padding: '20px',
            color: '#666',
          }}
        >
          <p>加载中...</p>
        </div>
      )}

      {/* 触发点 - 添加视觉提示，但不会太显眼 */}
      {hasMore && !loading && (
        <div
          ref={loaderRef}
          style={{
            height: '30px',
            marginTop: '20px',
            marginBottom: '20px',
            textAlign: 'center',
            color: '#ccc',
            fontSize: '14px',
          }}
        >
          {list.length > 0 && <span>向下滚动加载更多</span>}
        </div>
      )}

      {/* 没有更多数据提示 */}
      {!hasMore && list.length > 0 && (
        <p
          style={{
            textAlign: 'center',
            padding: '30px 20px',
            color: '#999',
            fontSize: '14px',
            borderTop: '1px solid #eee',
          }}
        >
          —— 已经到底了 ——
        </p>
      )}
    </div>
  );
}
