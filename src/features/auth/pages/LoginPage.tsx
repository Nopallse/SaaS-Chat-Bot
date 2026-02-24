import { Form, Input, Button, Card, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '../services/authApi';
import { useNotification } from '@/hooks/useNotification';
import type { LoginCredentials } from '../types/auth';

const { Title, Text } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const onFinish = async (values: LoginCredentials) => {
    setLoading(true);
    setError('');

    try {
      const response = await authApi.login(values);
      login(response.user, response.token);
      showSuccess('Login berhasil!');
      
      // Redirect berdasarkan role
      if (response.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/wa/chat');
      }
    } catch (err: any) {
      console.log(err);
      const message = err.response?.data?.message || 'Login gagal. Silakan coba lagi.';
      setError(message);
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '70vh' }}>
      <Card style={{ width: '100%', maxWidth: '400px' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <Title level={2}>Login</Title>
          <Text type="secondary">Masuk ke akun Anda</Text>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} closable />
        )}

        <Form
          name="login"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Email wajib diisi!' },
              { type: 'email', message: 'Email tidak valid!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Email"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Password wajib diisi!' },
              { min: 8, message: 'Password minimal 8 karakter!' },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Login
            </Button>
          </Form.Item>

          <Divider>
            <Text type="secondary">atau</Text>
          </Divider>

          <Form.Item>
            <Button
              type="default"
              icon={<GoogleOutlined />}
              block
              size="large"
              onClick={() => authApi.loginWithGoogle()}
            >
              Login dengan Google
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Belum punya akun? <Link to="/register">Daftar sekarang</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default LoginPage;
