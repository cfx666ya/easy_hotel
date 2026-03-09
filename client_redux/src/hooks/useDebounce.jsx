/**
 * 自定义防抖 Hook
 */
import { useEffect, useRef, useCallback } from 'react';

export default function useDebounce(callback, delay) {
  // 用 useRef 保存定时器 id，使用 useRef 不会触发渲染
  const timeoutRef = useRef(null);

  // 真正的防抖函数
  // 使用 useCallback 缓存函数，防止每次渲染新建
  const debouncedFn = useCallback(
    (...args) => {
      if (timeoutRef.current) {
        // 如果之前有定时器，清理
        clearTimeout(timeoutRef.current);
      }

      // 延迟执行 callback 函数
      timeoutRef.current = setTimeout(() => {
        callback(...args);
      }, delay);
    },
    [callback, delay],
  );

  // 处理副作用，在 callback 函数中，当组件卸载时，清理定时器
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedFn;
}
