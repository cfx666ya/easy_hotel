import request from '../utils/request';

// 原有的获取酒店列表
export function getHotelList(params) {
  return request.get('/hotels', { params });
}

// 原有的获取酒店详情
export function getHotelDetail(id) {
  return request.get(`/hotels/${id}`);
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
