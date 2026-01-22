import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 开发环境使用本地地址，生产环境替换为真实 API
const API_BASE_URL = 'http://localhost:8002';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
    }
    return Promise.reject(error);
  }
);

export const setApiBaseUrl = (url: string) => {
  api.defaults.baseURL = url;
};
