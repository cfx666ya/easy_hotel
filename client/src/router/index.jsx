/**
 * React Router 路由配置
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import { lazy, Suspense } from 'react';

/* ==================== 懒加载页面 ==================== */
// 只有当访问某个路由时，才去下载这个页面的js文件
const Home = lazy(() => import('../pages/Home'));
const HotelList = lazy(() => import('../pages/HotelList'));
const HotelDetail = lazy(() => import('../pages/HotelDetail'));
const CitySelectPage = lazy(
  () => import('../pages/HotelList/components/CitySelectPage'),
);

/* ==================== 加载中组件 ==================== */

function LoadingFallback() {
  return (
    <div style={{ padding: '40px', textAlign: 'center' }}>
      <p>页面加载中...</p>
    </div>
  );
}

/* ==================== 路由组件 ==================== */

function AppRoutes() {
  return (
    // 当里面的组件正在加载时，显示 fallback 内容
    // 如果没有 Suspense 包裹，由于 lazy 返回的是一个 Promise 组件，所以 React 不知道加载中怎么办
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* 首页 */}
        <Route path="/" element={<Home />} />

        {/* 酒店列表 */}
        <Route path="/hotel-list" element={<HotelList />} />

        {/* 酒店详情 */}
        <Route path="/detail/:id" element={<HotelDetail />} />

        {/* 城市选择页 */}
        <Route path="/city-select" element={<CitySelectPage />} />

        {/* 重定向示例 */}
        <Route path="/list" element={<Navigate to="/hotel-list" replace />} />

        {/* 404 */}
        <Route path="*" element={<div>404 Not Found</div>} />
      </Routes>
    </Suspense>
  );
}

export default AppRoutes;
