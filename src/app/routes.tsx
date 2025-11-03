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
const UserDashboardPage = lazy(() => import('@/features/user/pages/UserDashboardPage'));
const UserProfilePage = lazy(() => import('@/features/user/pages/UserProfilePage'));
const AdminDashboardPage = lazy(() => import('@/features/admin/pages/AdminDashboardPage'));
const ManageUsersPage = lazy(() => import('@/features/admin/pages/ManageUsersPage'));
const WaSessionPage = lazy(() => import('@/features/wa/pages/WaSessionPage'));
const WaBroadcastPage = lazy(() => import('@/features/wa/pages/WaBroadcastPage'));
const WaGroupPage = lazy(() => import('@/features/wa/pages/WaGroupPage'));
const EmailConnectPage = lazy(() => import('@/features/email/pages/EmailConnectPage'));
const EmailBroadcastPage = lazy(() => import('@/features/email/pages/EmailBroadcastPage'));

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
            <Route path="/user/dashboard" element={<UserDashboardPage />} />
            <Route path="/user/profile" element={<UserProfilePage />} />
            <Route path="/wa/session" element={<WaSessionPage />} />
            <Route path="/wa/broadcast" element={<WaBroadcastPage />} />
            <Route path="/wa/group" element={<WaGroupPage />} />
            <Route path="/email/connect" element={<EmailConnectPage />} />
            <Route path="/email/broadcast" element={<EmailBroadcastPage />} />
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
            <Route path="/admin/users" element={<ManageUsersPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};
