import { axiosInstance } from '@/services/axiosInstance';
import type { AdminStats, UserManagement } from '../types/admin';
import type { ApiResponse, PaginatedResponse } from '@/types/api';

export const adminApi = {
  getStats: async (): Promise<AdminStats> => {
    const response = await axiosInstance.get<ApiResponse<AdminStats>>(
      '/api/admin/stats'
    );
    return response.data.data;
  },

  getUsers: async (page = 1, pageSize = 10): Promise<PaginatedResponse<UserManagement>> => {
    const response = await axiosInstance.get<ApiResponse<PaginatedResponse<UserManagement>>>(
      '/api/admin/users',
      { params: { page, pageSize } }
    );
    return response.data.data;
  },

  updateUserStatus: async (userId: string, status: 'active' | 'inactive' | 'banned'): Promise<UserManagement> => {
    const response = await axiosInstance.patch<ApiResponse<UserManagement>>(
      `/api/admin/users/${userId}/status`,
      { status }
    );
    return response.data.data;
  },
};
