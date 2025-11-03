import type { User } from '@/types/global';

export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalRevenue: number;
}

export interface UserManagement extends User {
  status: 'active' | 'inactive' | 'banned';
  lastLogin?: string;
}
