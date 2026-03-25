import { axiosInstance } from '@/services/axiosInstance';
import type {
  DashboardStatistik,
  UserTerbaru,
  UserBulanan,
  PembayaranTerbaru,
  StatusSistem,
  UserManagement,
  CreateAdminUserDto,
  UpdateAdminUserDto,
  ClientLogo,
  PackageData,
  PackageListOption,
  CreatePackageDto,
  UpdatePackageDto,
  CreatePackageListDto,
  UpdatePackageListDto,
  PaymentData,
  UpdatePaymentDto,
} from '../types/admin';
import type { PaginatedResponse } from '@/types/api';

// Helper: unwrap NestJS global interceptor response { statusCode, message, data }
function unwrap(axiosData: any): any {
  return axiosData?.data !== undefined ? axiosData.data : axiosData;
}

// Helper: unwrap paginated response from backend
function unwrapPaginated<T>(axiosData: any, page: number, pageSize: number): PaginatedResponse<T> {
  const inner = unwrap(axiosData);
  if (inner?.pagination) {
    return {
      data: Array.isArray(inner.data) ? inner.data : [],
      total: inner.pagination.total || 0,
      page: inner.pagination.page || page,
      pageSize: inner.pagination.limit || pageSize,
      totalPages: inner.pagination.totalPages || 0,
    };
  }
  return {
    data: Array.isArray(inner?.data) ? inner.data : (Array.isArray(inner) ? inner : []),
    total: inner?.total || 0,
    page,
    pageSize,
    totalPages: 0,
  };
}

export const adminApi = {
  // ==================== DASHBOARD ====================
  getStatistik: async (): Promise<DashboardStatistik> => {
    const response = await axiosInstance.get('/admin/dashboard/statistik');
    return unwrap(response.data);
  },

  getUserTerbaru: async (): Promise<UserTerbaru[]> => {
    const response = await axiosInstance.get('/admin/dashboard/user-terbaru');
    return unwrap(response.data);
  },

  getUserBulanan: async (): Promise<UserBulanan[]> => {
    const response = await axiosInstance.get('/admin/dashboard/user-bulanan');
    return unwrap(response.data);
  },

  getPembayaranTerbaru: async (): Promise<PembayaranTerbaru[]> => {
    const response = await axiosInstance.get('/admin/dashboard/pembayaran-terbaru');
    return unwrap(response.data);
  },

  getStatusSistem: async (): Promise<StatusSistem> => {
    const response = await axiosInstance.get('/admin/dashboard/status-sistem');
    return unwrap(response.data);
  },

  // ==================== USER MANAGEMENT ====================
  getUsers: async (page = 1, pageSize = 10, search?: string): Promise<PaginatedResponse<UserManagement>> => {
    const response = await axiosInstance.get('/admin/users', {
      params: { page, limit: pageSize, search },
    });
    return unwrapPaginated<UserManagement>(response.data, page, pageSize);
  },

  createUser: async (data: CreateAdminUserDto) => {
    const response = await axiosInstance.post('/admin/users', data);
    return unwrap(response.data);
  },

  updateUser: async (userId: string, data: UpdateAdminUserDto) => {
    const response = await axiosInstance.patch(`/admin/users/${userId}`, data);
    return unwrap(response.data);
  },

  deleteUser: async (userId: string) => {
    await axiosInstance.delete(`/admin/users/${userId}`);
  },

  // ==================== CLIENT LOGO ====================
  getClientLogos: async (): Promise<ClientLogo[]> => {
    const response = await axiosInstance.get('/admin/client-logos');
    const inner = unwrap(response.data);
    return Array.isArray(inner?.data) ? inner.data : (Array.isArray(inner) ? inner : []);
  },

  createClientLogo: async (file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await axiosInstance.post('/admin/client-logos', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(response.data);
  },

  updateClientLogo: async (id: string, file: File) => {
    const formData = new FormData();
    formData.append('logo', file);
    const response = await axiosInstance.patch(`/admin/client-logos/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return unwrap(response.data);
  },

  deleteClientLogo: async (id: string) => {
    await axiosInstance.delete(`/admin/client-logos/${id}`);
  },

  // ==================== PACKAGE ====================
  getPackages: async (): Promise<PackageData[]> => {
    const response = await axiosInstance.get('/admin/packages');
    const inner = unwrap(response.data);
    return Array.isArray(inner?.data) ? inner.data : (Array.isArray(inner) ? inner : []);
  },

  getPackageLists: async (): Promise<PackageListOption[]> => {
    const response = await axiosInstance.get('/admin/package-lists');
    const inner = unwrap(response.data);
    return Array.isArray(inner?.data) ? inner.data : (Array.isArray(inner) ? inner : []);
  },

  createPackageList: async (data: CreatePackageListDto) => {
    const response = await axiosInstance.post('/admin/package-lists', data);
    return unwrap(response.data);
  },

  updatePackageList: async (id: string, data: UpdatePackageListDto) => {
    const response = await axiosInstance.patch(`/admin/package-lists/${id}`, data);
    return unwrap(response.data);
  },

  deletePackageList: async (id: string) => {
    await axiosInstance.delete(`/admin/package-lists/${id}`);
  },

  createPackage: async (data: CreatePackageDto) => {
    const response = await axiosInstance.post('/admin/packages', data);
    return unwrap(response.data);
  },

  updatePackage: async (id: string, data: UpdatePackageDto) => {
    const response = await axiosInstance.patch(`/admin/packages/${id}`, data);
    return unwrap(response.data);
  },

  deletePackage: async (id: string) => {
    await axiosInstance.delete(`/admin/packages/${id}`);
  },

  // ==================== PAYMENT ====================
  getPayments: async (
    page = 1,
    pageSize = 10,
    search?: string,
    status?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<PaginatedResponse<PaymentData>> => {
    const response = await axiosInstance.get('/admin/payments', {
      params: { page, limit: pageSize, search, status, startDate, endDate },
    });
    return unwrapPaginated<PaymentData>(response.data, page, pageSize);
  },

  getPaymentById: async (id: string) => {
    const response = await axiosInstance.get(`/admin/payments/${id}`);
    return unwrap(response.data);
  },

  updatePayment: async (id: string, data: UpdatePaymentDto) => {
    const response = await axiosInstance.patch(`/admin/payments/${id}`, data);
    return unwrap(response.data);
  },

  deletePayment: async (id: string) => {
    await axiosInstance.delete(`/admin/payments/${id}`);
  },

  exportPayments: async (status?: string, startDate?: string, endDate?: string) => {
    const response = await axiosInstance.get('/admin/payments/export', {
      params: { status, startDate, endDate },
      responseType: 'blob',
    });
    // Trigger download
    const blob = new Blob([response.data], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `payments_export_${new Date().toISOString().split('T')[0]}.xlsx`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};
