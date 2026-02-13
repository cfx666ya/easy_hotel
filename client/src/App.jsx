/**
 * 负责页面的结构
 */

import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import HotelListPage from './pages/HotelList';
import HotelDetail from './pages/HotelDetail';

function App() {
  return (
    <div>
      <h1>Easy Hotel</h1>

      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/hotel" element={<HotelListPage />} />
        <Route path="/hotel/:id" element={<HotelDetail />} />
      </Routes>
    </div>
  );
}

export default App;
