import { Form, Input, Button, Card, Typography, Avatar, Upload, Space } from 'antd';
import { UserOutlined, UploadOutlined } from '@ant-design/icons';
import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useNotification } from '@/hooks/useNotification';
import { userApi } from '../services/userApi';

const { Title } = Typography;

const UserProfilePage = () => {
  const { user } = useAuth();
  const login = useAuthStore((state) => state.login);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState<string | undefined>(user?.avatar);
  const [pictureFile, setPictureFile] = useState<File | undefined>();
  const [profileData, setProfileData] = useState<{ name?: string; email?: string }>({});
  const { showSuccess, showError } = useNotification();
  const [form] = Form.useForm();

  useEffect(() => {
    const fetchProfile = async () => {
      setFetching(true);
      try {
        const profile = await userApi.getProfile();
        setProfileData({
          name: profile.name,
          email: profile.email,
        });
        form.setFieldsValue({
          name: profile.name,
          email: profile.email,
          telephone: profile.phone,
        });
        setAvatarUrl(profile.avatar);
      } catch (error) {
        console.error('Error fetching profile:', error);
        showError('Gagal memuat profil');
      } finally {
        setFetching(false);
      }
    };

    fetchProfile();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onFinish = async (values: any) => {
    if (!user?.id) return;
    
    setLoading(true);
    try {
      const updatedProfile = await userApi.updateProfile(user.id, {
        name: values.name,
        telephone: values.telephone,
      }, pictureFile);

      // Update store dengan data baru
      login(
        {
          ...user,
          name: updatedProfile.name,
          avatar: updatedProfile.avatar,
        },
        useAuthStore.getState().token || ''
      );
      
      // Update profileData state
      setProfileData({
        name: updatedProfile.name,
        email: updatedProfile.email,
      });
      setAvatarUrl(updatedProfile.avatar);
      setPictureFile(undefined);
      showSuccess('Profil berhasil diperbarui!');
    } catch (err: any) {
      const message = err.response?.data?.message || 'Gagal memperbarui profil';
      showError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarChange = (info: any) => {
    if (info.file.originFileObj) {
      const file = info.file.originFileObj;
      setPictureFile(file);
      // Preview avatar
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <Title level={2}>Profil Saya</Title>

      <Card style={{ maxWidth: '600px' }} loading={fetching}>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <Space direction="vertical" size={16} align="center" style={{ width: '100%' }}>
            <Avatar size={100} icon={<UserOutlined />} src={avatarUrl} />
            <Upload
              name="picture"
              showUploadList={false}
              beforeUpload={() => false}
              accept="image/*"
              onChange={handleAvatarChange}
            >
              <Button icon={<UploadOutlined />}>Upload Avatar</Button>
            </Upload>
            {pictureFile && (
              <p style={{ color: '#52c41a', fontSize: '12px' }}>
                Avatar baru dipilih: {pictureFile.name}
              </p>
            )}
          </Space>
          <Title level={4} style={{ marginTop: '16px' }}>{profileData.name || user?.name || 'User'}</Title>
          <p style={{ color: '#666' }}>{profileData.email || user?.email || ''}</p>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={onFinish}
        >
          <Form.Item
            label="Nama Lengkap"
            name="name"
            rules={[
              { required: true, message: 'Nama wajib diisi!' },
              { min: 3, message: 'Nama minimal 3 karakter!' },
            ]}
          >
            <Input size="large" />
          </Form.Item>

          <Form.Item
            label="Email"
            name="email"
          >
            <Input size="large" disabled />
          </Form.Item>

          <Form.Item
            label="Nomor Telepon"
            name="telephone"
          >
            <Input size="large" placeholder="+62 xxx xxx xxx" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" size="large" loading={loading}>
              Simpan Perubahan
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default UserProfilePage;
