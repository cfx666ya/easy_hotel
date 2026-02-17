/**
 * 将 query 封装成一个工具函数
 * 在需要用的地方 import { buildHotelListQuery } from '../../../utils/hotelQuery';
 * @param {*} query
 * @returns
 */

export const buildHotelListQuery = (query) => {
  return new URLSearchParams({
    city: query.city || '',
    keyword: query.keyword || '',
    checkIn: query.checkIn || '',
    checkOut: query.checkOut || '',
    nights: query.nights || '',
  }).toString();
};
