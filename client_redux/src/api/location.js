// src/api/location.js

/**
 * 根据经纬度调用高德逆地理编码 API
 * @param {number} latitude  纬度
 * @param {number} longitude 经度
 * @returns {Promise<{ address: string, city: string }>} 解析后的地址和城市
 */
export async function fetchLocationByCoords(latitude, longitude) {
  const key = import.meta.env.VITE_AMAP_KEY; // Vite 环境变量
  const url = `https://restapi.amap.com/v3/geocode/regeo?key=${key}&location=${longitude},${latitude}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.status !== '1') {
    throw new Error(data.info || '定位解析失败');
  }

  const address = data.regeocode.formatted_address;
  const city =
    data.regeocode.addressComponent.city ||
    data.regeocode.addressComponent.province;

  return { address, city };
}
