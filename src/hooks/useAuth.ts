import { useAuthStore } from '@/store/authStore';

export const useAuth = () => {
  const { user, isAuthenticated, role, login, logout } = useAuthStore();

  return {
    user,
    isAuthenticated,
    role,
    login,
    logout,
  };
};
