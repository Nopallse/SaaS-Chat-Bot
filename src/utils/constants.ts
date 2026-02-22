export const APP_NAME = import.meta.env.VITE_APP_NAME || 'Starter App';
export const API_URL = import.meta.env.VITE_API_URL || 'https://www.api-mitbiz.ybbal.dev';

export const ROUTES = {
  HOME: '/',
  LOGIN: '/login',
  REGISTER: '/register',
  AUTH_CALLBACK: '/auth/callback',
  USER_DASHBOARD: '/user/dashboard',
  USER_PROFILE: '/user/profile',
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
} as const;

export const STORAGE_KEYS = {
  AUTH_TOKEN: 'auth_token',
  USER_DATA: 'user_data',
} as const;
