import request from '../utils/request';

// 原有的获取酒店列表
export function getHotelList(params) {
  return request.get('/hotels', { params });
}

// 新增：获取指定城市的 POI 列表
export function getPoiList(city) {
  return request.get('/pois', {
    params: { city },
  });
}

// 获取符合条件的酒店总数（用于预览）
export async function getHotelCount(params) {
  const queryString = new URLSearchParams(params).toString();
  console.log('queryString', queryString);

  const response = await fetch(`/api/hotel-count?${queryString}`);
  if (!response.ok) throw new Error('Failed to fetch hotel count');
  return response.json();
}

// 原有的获取酒店详情
// export function getHotelDetail(id) {
//   return request.get(`/hotels/${id}`);
// }

export async function getHotelDetail(id) {
  const response = await fetch(`http://localhost:3000/api/hotels/${id}`);
  if (!response.ok) throw new Error('获取酒店详情失败');
  return response.json();
}
