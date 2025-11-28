import { Layout, Menu, Button, Dropdown, Avatar, Space } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, DashboardOutlined, HomeOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import type { MenuProps } from 'antd';
import logoImage from '@/assets/logo.png';

const { Header } = Layout;

const Navbar = () => {
  const { isAuthenticated, role, user } = useAuth();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: <Link to="/user/profile">Profil</Link>,
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  const baseMenu: MenuProps['items'] = [
    {
      key: 'home',
      icon: <HomeOutlined />,
      label: <Link to="/">Home</Link>,
    },
    {
      key: 'features',
      label: <Link to="/#features">Features</Link>,
    },
    {
      key: 'how',
      label: <Link to="/#how-it-works">How It Works</Link>,
    },
    {
      key: 'pricing',
      label: <Link to="/#pricing">Pricing</Link>,
    },
    {
      key: 'testimonials',
      label: <Link to="/#testimonials">Testimonials</Link>,
    },
  ];

  const menuItems: MenuProps['items'] = isAuthenticated
    ? [
        ...baseMenu,
        {
          key: 'dashboard',
          icon: <DashboardOutlined />,
          label: <Link to={role === 'admin' ? '/admin/dashboard' : '/user/dashboard'}>Dashboard</Link>,
        },
      ]
    : baseMenu;

  return (
    <Header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'rgba(255,255,255,0.85)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #f0f0f0',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', minWidth: 0, flex: 1, gap: 16 }}>
        <img src={logoImage} alt="Logo" style={{ height: 32, display: 'block' }} />
        <Menu
          mode="horizontal"
          items={menuItems}
          style={{ flex: 1, minWidth: 0, background: 'transparent', borderBottom: 'none', alignItems: 'center', display: 'flex' }}
        />
      </div>

      <div>
        {isAuthenticated ? (
          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
              <Avatar icon={<UserOutlined />} src={user?.avatar} />
              <span>{user?.name}</span>
            </div>
          </Dropdown>
        ) : (
          <Space>
            <Link to="/login">
              <Button type="default">Login</Button>
            </Link>
            <Link to="/register">
              <Button type="primary">Start Free Trial</Button>
            </Link>
          </Space>
        )}
      </div>
    </Header>
  );
};

export default Navbar;
