import { createBrowserRouter } from 'react-router-dom'; // 开启路由系统（后面页面切换靠它）
import Home from '../pages/Home';
import HotelList from '../pages/HotelList';
import HotelDetail from '../pages/HotelDetail';

const router = createBrowserRouter([
  { path: '/', element: <Home /> },
  { path: '/list', element: <HotelList /> },
  { path: '/detail/:id', element: <HotelDetail /> },
]);

export default router;
