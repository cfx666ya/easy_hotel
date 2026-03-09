/**
 * 将 query 封装成一个工具函数
 * 在需要用的地方 import { buildHotelListQuery } from '../../../utils/hotelQuery';
 * @param {*} query
 * @returns
 */

export const buildHotelListQuery = (query) => {
  const params = new URLSearchParams();
  Object.entries(query).forEach(([key, value]) => {
    if (value && key !== 'cursor' && key !== 'limit') {
      params.set(key, value.toString());
    }
  });
  return params.toString();
};
