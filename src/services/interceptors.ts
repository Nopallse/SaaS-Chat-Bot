import type { InternalAxiosRequestConfig, AxiosError } from 'axios';
import { axiosInstance } from './axiosInstance';
import { useAuthStore } from '@/store/authStore';
import { ROUTES } from '@/utils/constants';

// Request interceptor untuk menambahkan token
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Response interceptor untuk handle error
axiosInstance.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Token expired atau invalid
      useAuthStore.getState().logout();
      window.location.href = ROUTES.LOGIN;
    }
    return Promise.reject(error);
  }
);
