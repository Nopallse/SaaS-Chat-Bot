import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, Spin, Alert, Typography } from 'antd';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '../services/authApi';
import { useNotification } from '@/hooks/useNotification';

const { Title, Text } = Typography;

const AuthCallbackPage = () => {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const { showSuccess, showError } = useNotification();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      if (!token) {
        setError('Token tidak ditemukan. Silakan login kembali.');
        setLoading(false);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        return;
      }

      try {
        // Set token sementara di store untuk getCurrentUser bisa fetch
        useAuthStore.getState().login(
          { id: '', name: '', email: '', role: 'user', createdAt: new Date().toISOString() },
          token
        );

        // Get user info dari token via /auth/me
        const response = await authApi.getCurrentUser();
        
        // Update store dengan data user yang benar
        login(response.user, response.token || token);
        
        showSuccess('Login dengan Google berhasil!');
        
        // Redirect berdasarkan role
        if (response.user.role === 'admin') {
          navigate('/admin/dashboard');
        } else {
          navigate('/wa/chat');
        }
      } catch (err: any) {
        const message = err.response?.data?.message || 'Autentikasi gagal. Silakan coba lagi.';
        setError(message);
        showError(message);
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } finally {
        setLoading(false);
      }
    };

    handleCallback();
  }, [token, navigate, login, showSuccess, showError]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center' }}>
          {loading ? (
            <>
              <Spin size="large" />
              <Title level={4} style={{ marginTop: '16px' }}>Memproses autentikasi...</Title>
              <Text type="secondary">Mohon tunggu sebentar</Text>
            </>
          ) : error ? (
            <>
              <Alert
                message="Error"
                description={error}
                type="error"
                showIcon
                style={{ marginBottom: '16px' }}
              />
              <Text type="secondary">Mengarahkan ke halaman login...</Text>
            </>
          ) : null}
        </div>
      </Card>
    </div>
  );
};

export default AuthCallbackPage;

