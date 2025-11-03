import { Form, Input, Button, Card, Typography, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, GoogleOutlined } from '@ant-design/icons';
import { Link, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { authApi } from '../services/authApi';
import { useNotification } from '@/hooks/useNotification';
import type { RegisterData } from '../types/auth';

const { Title, Text } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const login = useAuthStore((state) => state.login);
  const navigate = useNavigate();
  const { showSuccess, showError } = useNotification();

  const onFinish = async (values: RegisterData) => {
    setLoading(true);
    setError('');

    try {
      const response = await authApi.register(values);
      login(response.user, response.token);
      showSuccess('Registrasi berhasil!');
      navigate('/user/dashboard');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Registrasi gagal. Silakan coba lagi.';
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
          <Title level={2}>Register</Title>
          <Text type="secondary">Buat akun baru</Text>
        </div>

        {error && (
          <Alert message={error} type="error" showIcon style={{ marginBottom: '16px' }} closable />
        )}

        <Form
          name="register"
          onFinish={onFinish}
          autoComplete="off"
          layout="vertical"
        >
          <Form.Item
            name="name"
            rules={[
              { required: true, message: 'Nama wajib diisi!' },
              { min: 3, message: 'Nama minimal 3 karakter!' },
            ]}
          >
            <Input
              prefix={<UserOutlined />}
              placeholder="Nama Lengkap"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Email wajib diisi!' },
              { type: 'email', message: 'Email tidak valid!' },
            ]}
          >
            <Input
              prefix={<MailOutlined />}
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

          <Form.Item
            name="confirmPassword"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Konfirmasi password wajib diisi!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Password tidak cocok!'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Konfirmasi Password"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block size="large" loading={loading}>
              Daftar
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
              Daftar dengan Google
            </Button>
          </Form.Item>

          <div style={{ textAlign: 'center' }}>
            <Text>
              Sudah punya akun? <Link to="/login">Login di sini</Link>
            </Text>
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default RegisterPage;
