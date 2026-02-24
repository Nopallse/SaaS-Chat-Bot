import { Layout, Menu, Button, Dropdown, Avatar } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, DashboardOutlined } from '@ant-design/icons';
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

  const menuLinkStyle = { color: '#1F1F1F' };

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
      key: 'features',
      label: <Link to="/#features" style={menuLinkStyle}>Features</Link>,
    },
    {
      key: 'how',
      label: <Link to="/#how-it-works" style={menuLinkStyle}>How It Works</Link>,
    },
    {
      key: 'solutions',
      label: <Link to="/#solutions" style={menuLinkStyle}>Solutions</Link>,
    },
    {
      key: 'pricing',
      label: <Link to="/#pricing" style={menuLinkStyle}>Pricing</Link>,
    },
  ];

  const menuItems: MenuProps['items'] = isAuthenticated
    ? [
        ...baseMenu,
        {
          key: 'dashboard',
          icon: <DashboardOutlined />,
          label: <Link to={role === 'admin' ? '/admin/dashboard' : '/wa/chat'} style={menuLinkStyle}>Dashboard</Link>,
        },
      ]
    : baseMenu;

  return (
    <Header
      style={{
        background: 'transparent',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 'auto',
        lineHeight: 'normal',
        padding: '16px 24px',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr auto', alignItems: 'center', columnGap: 24 }}>
        <Link to="/">
          <div
            style={{
              background: '#fff',
              borderRadius: 999,
              padding: '8px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(23, 43, 77, 0.12)',
            }}
          >
            <img src={logoImage} alt="Logo" style={{ height: 44, display: 'block' }} />
          </div>
        </Link>

        <div style={{ display: 'flex', justifyContent: 'center', minWidth: 0 }}>
          <div
            style={{
              width: 'fit-content',
              maxWidth: '100%',
              padding: '14px 28px',
              borderRadius: 999,
              background: '#fff',
              boxShadow: '0 8px 20px rgba(23, 43, 77, 0.16)',
            }}
          >
            <Menu
              mode="horizontal"
              items={menuItems}
              disabledOverflow
              selectable={false}
              style={{
                justifyContent: 'center',
                background: 'transparent',
                borderBottom: 'none',
                color: '#1F1F1F',
                fontSize: 18,
                fontWeight: 600,
              }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                <span>{user?.name}</span>
              </div>
            </Dropdown>
          ) : (
            <Link to="/login">
              <Button
                type="primary"
                size="large"
                style={{
                  borderRadius: 999,
                  paddingInline: 36,
                  height: 50,
                  fontSize: 20,
                  fontWeight: 500,
                  border: 'none',
                  background: 'linear-gradient(135deg, #1f7be7 0%, #0b6edb 100%)',
                  boxShadow: '0 8px 18px rgba(15, 111, 219, 0.35)',
                }}
              >
                Sign In
              </Button>
            </Link>
          )}
        </div>
      </div>
    </Header>
  );
};

export default Navbar;
