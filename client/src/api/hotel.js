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

// 新增：获取指定条件下的酒店预览数量（用于预览按钮）
// 实际上可以直接复用 getHotelList，只需设置 limit=1 且只关注返回的 total
export function getHotelCountByPoi(poiId, distance) {
  return request.get('/hotels', {
    params: {
      poiId,
      distance,
      limit: 1,
      cursor: 0,
    },
  });
}
