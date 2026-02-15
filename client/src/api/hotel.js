import request from '../utils/request';

export function getHotelList(params) {
  // 这里的 request 实际就是 ../utils/request 封装的实例
  return request.get('/hotels', {
    params,
  });
}

export function getHotelDetail(id) {
  return request({
    url: `/hotels/${id}`,
    method: 'get',
  });
}
