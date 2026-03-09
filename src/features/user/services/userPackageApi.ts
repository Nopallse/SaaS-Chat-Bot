import { axiosInstance } from '@/services/axiosInstance';

interface RawPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features?: string[];
  benefits?: string[];
}

export interface UserPackage {
  id: string;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  features: string[];
  benefits: string[];
}

export interface UserSubscription {
  id: string;
  packageId: string;
  status: string;
  endDate: string;
  package: {
    id: string;
    name: string;
    billingCycle: string;
    features: string[];
  };
}

export interface PaymentRecord {
  id: string;
  orderId: string;
  packageId: string | null;
  amount: number;
  currency: string;
  status: string;
  paymentType: string | null;
  transactionId: string | null;
  paidAt: string | null;
  createdAt: string;
}

function unwrap<T = any>(payload: any): T {
  return payload?.data !== undefined ? payload.data : payload;
}

export const userPackageApi = {
  getPackages: async (): Promise<{ packages: UserPackage[]; clientKey?: string }> => {
    const response = await axiosInstance.get('/payment/packages');
    const inner = unwrap<any>(response.data);
    const rows: RawPackage[] = Array.isArray(inner?.data) ? inner.data : [];

    return {
      packages: rows.map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        price: item.price,
        currency: item.currency,
        billingCycle: item.billingCycle,
        features: Array.isArray(item.features) ? item.features : [],
        benefits: Array.isArray(item.benefits) ? item.benefits : [],
      })),
      clientKey: inner?.clientKey,
    };
  },

  getActiveSubscription: async (): Promise<UserSubscription | null> => {
    const response = await axiosInstance.get('/payment/subscription');
    const inner = unwrap<any>(response.data);
    return inner?.subscription || null;
  },

  createOrder: async (packageId: string): Promise<{ orderId: string; redirectUrl: string }> => {
    const response = await axiosInstance.post('/payment/create-order', { packageId });
    const inner = unwrap<any>(response.data);
    return {
      orderId: inner.orderId,
      redirectUrl: inner.redirectUrl,
    };
  },

  getPaymentHistory: async (): Promise<PaymentRecord[]> => {
    const response = await axiosInstance.get('/payment/history');
    const inner = unwrap<any>(response.data);
    return Array.isArray(inner?.data) ? inner.data : [];
  },
};
