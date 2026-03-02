// ==================== DASHBOARD ====================
export interface DashboardStatistik {
  totalAkun: number;
  akunAktif: number;
  akunNonaktif: number;
  totalTransaksi: number;
  pertumbuhanAkun: number;
  pertumbuhanAktif: number;
  pertumbuhanNonaktif: number;
  pertumbuhanTransaksi: number;
}

export interface UserTerbaru {
  no: number;
  idKlien: string;
  email: string;
  tanggalDaftar: string;
  status: string;
}

export interface UserBulanan {
  bulan: string;
  jumlah: number;
}

export interface PembayaranTerbaru {
  no: number;
  idOrder: string;
  tanggalOrder: string;
  metodePembayaran: string;
  totalPembayaran: number;
}

export interface StatusSistem {
  whatsapp: string;
  email: string;
  paymentGateway: string;
  aiEngine: string;
  terakhirDicek: string;
}

// ==================== USER MANAGEMENT ====================
export interface AdminStats {
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  totalRevenue: number;
}

export interface UserManagement {
  id: string;
  no: number;
  idKlien: string;
  name: string;
  email: string;
  telephone?: string | null;
  role: 'USER' | 'ADMIN';
  planType: string | null;
  status: 'Active' | 'Inactive';
  tanggalDaftar: string;
}

export interface CreateAdminUserDto {
  name: string;
  email: string;
  password: string;
  role?: 'USER' | 'ADMIN';
  telephone?: string;
}

export interface UpdateAdminUserDto {
  name?: string;
  email?: string;
  password?: string;
  role?: 'USER' | 'ADMIN';
  telephone?: string;
}

// ==================== CLIENT LOGO ====================
export interface ClientLogo {
  id: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

// ==================== PACKAGE ====================
export type PackageFeature =
  | 'whatsapp_chat_console'
  | 'email_chat_console'
  | 'ai_training_config'
  | 'broadcast_scheduling';

export interface PackageData {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: PackageFeature[] | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePackageDto {
  name: string;
  description: string;
  price: number;
  currency?: string;
  billingCycle: 'monthly' | 'yearly';
  features?: PackageFeature[];
}

export interface UpdatePackageDto {
  name?: string;
  description?: string;
  price?: number;
  currency?: string;
  billingCycle?: 'monthly' | 'yearly';
  features?: PackageFeature[];
  isActive?: boolean;
}

// ==================== PAYMENT ====================
export interface PaymentData {
  id: string;
  no: number;
  orderId: string;
  tanggalPesan: string;
  paymentMethod: string;
  totalPembayaran: number;
  status: 'Paid' | 'Pending' | 'Failed';
}

export interface UpdatePaymentDto {
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'EXPIRED';
}
