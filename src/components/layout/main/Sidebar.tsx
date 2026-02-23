import { Layout, Menu, Avatar, Space } from 'antd';
import { Link, useLocation } from 'react-router-dom';
import {
  UserOutlined,
  MessageOutlined,
  MailOutlined,
  LogoutOutlined,
  ApiOutlined,
  RobotOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

const { Sider } = Layout;

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
      key: '/wa/chat',
      icon: <MessageOutlined />,
      label: <Link to="/wa/chat">Chat Console</Link>,
    },
    {
      key: '/wa',
      icon: <ApiOutlined />,
      label: <Link to="/wa">WhatsApp</Link>,
    },
    {
      key: '/email',
      icon: <MailOutlined />,
      label: <Link to="/email">Email</Link>,
    },
    {
      key: 'ai',
      icon: <RobotOutlined />,
      label: 'AI',
      children: [
        {
          key: '/ai/agent',
          label: <Link to="/ai/agent">AI Agent</Link>,
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
      <div style={{ padding: '16px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
        <img src="/logo.png" alt="Blastify" style={{ height: '40px', maxWidth: '100%', objectFit: 'contain' }} />
      </div>

      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        defaultOpenKeys={['ai']}
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

