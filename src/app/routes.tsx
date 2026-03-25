import { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Spin } from 'antd';
import { ProtectedRoute } from '@/utils/routeGuard';
import MainLayout from '@/components/layout/main/MainLayout';
import DashboardLayout from '@/components/layout/dashboard/DashboardLayout';
import AdminLayout from '@/components/layout/admin/AdminLayout';

// Lazy loading pages
const HomePage = lazy(() => import('@/features/home/pages/HomePage'));
const LoginPage = lazy(() => import('@/features/auth/pages/LoginPage'));
const RegisterPage = lazy(() => import('@/features/auth/pages/RegisterPage'));
const AuthCallbackPage = lazy(() => import('@/features/auth/pages/AuthCallbackPage'));
const UserProfilePage = lazy(() => import('@/features/user/pages/UserProfilePage'));
const UserPaymentPage = lazy(() => import('@/features/user/pages/UserPaymentPage'));
const UserPackagesPage = lazy(() => import('@/features/user/pages/UserPackagesPage'));
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'));
const ManageUsersPage = lazy(() => import('@/features/admin/pages/ManageUsersPage'));
const ManagePackagesPage = lazy(() => import('@/features/admin/pages/ManagePackagesPage'));
const ManagePackageListsPage = lazy(() => import('@/features/admin/pages/ManagePackageListsPage'));
const ManagePaymentsPage = lazy(() => import('@/features/admin/pages/ManagePaymentsPage'));
const PaymentDetailPage = lazy(() => import('@/features/admin/pages/PaymentDetailPage'));
const ManageClientLogosPage = lazy(() => import('@/features/admin/pages/ManageClientLogosPage'));
const WaSessionPage = lazy(() => import('@/features/wa/pages/WaSessionPage'));
const WaChatConsolePage = lazy(() => import('@/features/wa/pages/WaChatConsolePage'));
const WaPage = lazy(() => import('@/features/wa/pages/WaPage'));
const WaContactsPage = lazy(() => import('@/features/contacts/pages/WaContactsPage'));
const EmailPage = lazy(() => import('@/features/email/pages/EmailPage'));
const AiAgentPage = lazy(() => import('@/features/ai/pages/AiAgentPage'));

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <Spin size="large" />
  </div>
);

export const AppRoutes = () => {
  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public routes dengan MainLayout */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
          </Route>

          {/* Dashboard routes dengan Sidebar Layout */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['user', 'admin']}>
                <DashboardLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/user/profile" element={<UserProfilePage />} />
            <Route path="/user/payment" element={<UserPaymentPage />} />
            <Route path="/user/packages" element={<UserPackagesPage />} />
            <Route path="/wa" element={<WaPage />} />
            <Route path="/wa/session" element={<WaSessionPage />} />
            <Route path="/wa/broadcast" element={<Navigate to="/wa?tab=broadcasts" replace />} />
            <Route path="/wa/group" element={<Navigate to="/wa?tab=groups" replace />} />
            <Route path="/wa/chat" element={<WaChatConsolePage />} />
            <Route path="/wa/contacts" element={<WaContactsPage />} />
            <Route path="/email" element={<EmailPage />} />
            <Route path="/ai/agent" element={<AiAgentPage />} />
          </Route>

          {/* Admin routes dengan AdminLayout */}
          <Route
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminLayout />
              </ProtectedRoute>
            }
          >
            <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
            <Route path="/admin/accounts" element={<ManageUsersPage />} />
            <Route path="/admin/packages" element={<ManagePackagesPage />} />
            <Route path="/admin/package-lists" element={<ManagePackageListsPage />} />
            <Route path="/admin/payments" element={<ManagePaymentsPage />} />
            <Route path="/admin/payments/:id" element={<PaymentDetailPage />} />
            <Route path="/admin/client-logos" element={<ManageClientLogosPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
