import { useEffect } from 'react';
import { getHotelList } from '../../api/hotel';

function Home() {
  useEffect(() => {
    getHotelList().then((res) => {
      console.log('酒店列表:', res);
    });
  }, []);

  return (
    <div>
      <h1>易宿酒店</h1>
      <p>首页测试成功</p>
    </div>
  );
}

export default Home;
