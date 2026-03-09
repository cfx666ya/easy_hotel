import axios from 'axios'; // axios 是一个基于 Promise 的 HTTP 客户端

//
const service = axios.create({
  // VITE_BASE_URL 是所有请求的基础路径，例如 VITE_BASE_URL=/api，如果请求 request.get('/hotels')，实际请求的是 /api/hotels
  baseURL: import.meta.env.VITE_BASE_URL,
  timeout: 5000,
});

// 响应拦截器
// 正常会返回：{  data: {...},  status: 200,  headers: ...}
// 但是因为有响应拦截器进行中间处理，所以当请求成功时，只返回 res.data
service.interceptors.response.use(
  (res) => res.data,
  (err) => Promise.reject(err),
);

export default service;
