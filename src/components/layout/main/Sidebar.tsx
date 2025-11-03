import { Layout, Menu, Avatar, Space, Typography } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  MessageOutlined,
  MailOutlined,
  SettingOutlined,
  LogoutOutlined,
  ApiOutlined,
  UsergroupAddOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

const { Sider } = Layout;
const { Text } = Typography;

const Sidebar = () => {
  const { user, role } = useAuth();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.LOGIN);
  };

  const menuItems = [
    {
      key: '/user/dashboard',
      icon: <DashboardOutlined />,
      label: <Link to="/user/dashboard">Dashboard</Link>,
    },
    {
      key: 'whatsapp',
      icon: <MessageOutlined />,
      label: 'WhatsApp',
      children: [
        {
          key: '/wa/session',
          label: <Link to="/wa/session">Sessions</Link>,
        },
        {
          key: '/wa/broadcast',
          label: <Link to="/wa/broadcast">Broadcast</Link>,
        },
        {
          key: '/wa/group',
          label: <Link to="/wa/group">Groups</Link>,
        },
      ],
    },
    {
      key: 'email',
      icon: <MailOutlined />,
      label: 'Email',
      children: [
        {
          key: '/email/connect',
          label: <Link to="/email/connect">Connect Gmail</Link>,
        },
        {
          key: '/email/broadcast',
          label: <Link to="/email/broadcast">Broadcast</Link>,
        },
      ],
    },
    {
      key: '/user/profile',
      icon: <UserOutlined />,
      label: <Link to="/user/profile">Profile</Link>,
    },
  ];

  if (role === 'admin') {
    menuItems.push({
      key: 'admin',
      icon: <ApiOutlined />,
      label: 'Admin',
      children: [
        {
          key: '/admin/dashboard',
          label: <Link to="/admin/dashboard">Dashboard</Link>,
        },
        {
          key: '/admin/users',
          label: <Link to="/admin/users">Manage Users</Link>,
        },
      ],
    });
  }

  return (
    <Sider
      width={250}
      style={{
        overflow: 'auto',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        bottom: 0,
      }}
      theme="light"
    >
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0' }}>
        <Space align="center" style={{ width: '100%', justifyContent: 'center' }}>
          <MessageOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <MailOutlined style={{ fontSize: 24, color: '#1677ff' }} />
          <Text strong style={{ fontSize: 18, color: '#1677ff' }}>
            Blastify
          </Text>
        </Space>
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['whatsapp', 'email']}
        items={menuItems}
        style={{ borderRight: 0, height: 'calc(100vh - 180px)', overflow: 'auto' }}
      />

      <div
        style={{
          position: 'absolute',
          bottom: 0,
          left: 0,
          right: 0,
          padding: '16px',
          borderTop: '1px solid #f0f0f0',
          background: '#fff',
        }}
      >
        <Menu
          mode="inline"
          items={[
            {
              key: 'logout',
              icon: <LogoutOutlined />,
              label: 'Logout',
              onClick: handleLogout,
              danger: true,
            },
          ]}
          style={{ borderRight: 0 }}
        />
        <div style={{ padding: '8px 0', textAlign: 'center' }}>
          <Space>
            <Avatar size={32} icon={<UserOutlined />} src={user?.avatar} />
            <div>
              <div style={{ fontSize: 12, fontWeight: 500 }}>{user?.name}</div>
              <div style={{ fontSize: 11, color: '#8c8c8c' }}>{user?.email}</div>
            </div>
          </Space>
        </div>
      </div>
    </Sider>
  );
};

export default Sidebar;

