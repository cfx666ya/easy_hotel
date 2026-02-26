import { useEffect, useRef, useCallback } from 'react';

const WS_URL = 'ws://localhost:3001/ws';

// 全局单例 WebSocket，避免多个组件重复创建连接
let globalWs = null;
let globalListeners = new Set();
let reconnectTimer = null;

function connectGlobal() {
  if (globalWs && (globalWs.readyState === WebSocket.OPEN || globalWs.readyState === WebSocket.CONNECTING)) return;

  const token = localStorage.getItem('token');
  const url = token ? `${WS_URL}?token=${token}` : WS_URL;

  globalWs = new WebSocket(url);

  globalWs.onopen = () => {
    console.log('WebSocket 已连接');
    if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  };

  globalWs.onmessage = (event) => {
    try {
      const data = JSON.parse(event.data);
      if (data.type !== 'connected') {
        globalListeners.forEach(cb => cb(data));
      }
    } catch {}
  };

  globalWs.onclose = () => {
    console.log('WebSocket 断开，5秒后重连...');
    globalWs = null;
    reconnectTimer = setTimeout(connectGlobal, 5000);
  };

  globalWs.onerror = () => { globalWs?.close(); };
}

/**
 * WebSocket Hook - 全局单例，不会因页面切换反复重连
 * @param {function} onMessage 收到消息时的回调
 */
export default function useWebSocket(onMessage) {
  const cbRef = useRef(onMessage);
  cbRef.current = onMessage;

  useEffect(() => {
    const listener = (data) => cbRef.current?.(data);
    globalListeners.add(listener);
    
    // 确保连接存在
    connectGlobal();

    return () => {
      globalListeners.delete(listener);
    };
  }, []);
}

// 登录后重新连接（携带新 token）
export function reconnectWebSocket() {
  if (globalWs) { globalWs.close(); globalWs = null; }
  if (reconnectTimer) { clearTimeout(reconnectTimer); reconnectTimer = null; }
  connectGlobal();
}
