import { Layout, Menu, Button, Dropdown, Avatar, Drawer, Grid } from 'antd';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { UserOutlined, LogoutOutlined, MenuOutlined, DashboardOutlined } from '@ant-design/icons';
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import type { MenuProps } from 'antd';
import logoImage from '@/assets/logo.png';

const { Header } = Layout;
const { useBreakpoint } = Grid;

const Navbar = () => {
  const { isAuthenticated, role, user } = useAuth();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const location = useLocation();
  const screens = useBreakpoint();
  const isMobile = !screens.md;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const dashboardHref = role === 'admin' ? '/admin/dashboard' : '/wa/chat';
  const homeHref = isAuthenticated ? dashboardHref : '/';
  const profileHref = role === 'admin' ? '/admin/dashboard' : '/user/profile';

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSectionNav = (sectionId: string, closeDrawer?: boolean) => {
    if (closeDrawer) {
      setDrawerOpen(false);
    }

    const scrollToSection = () => {
      const sectionEl = document.getElementById(sectionId);
      if (sectionEl) {
        sectionEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
        window.history.replaceState(null, '', `/#${sectionId}`);
      }
    };

    if (location.pathname !== '/') {
      navigate(`/#${sectionId}`);
      window.setTimeout(scrollToSection, 120);
      return;
    }

    scrollToSection();
  };

  const menuLinkStyle = { color: '#1F1F1F' };

  const userMenuItems: MenuProps['items'] = [
    {
      key: role === 'admin' ? 'dashboard' : 'profile',
      icon: role === 'admin' ? <DashboardOutlined /> : <UserOutlined />,
      label: <Link to={profileHref}>{role === 'admin' ? 'Dashboard' : 'Profil'}</Link>,
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
      key: 'solutions',
      label: (
        <a
          href="/#solutions"
          style={menuLinkStyle}
          onClick={(e) => {
            e.preventDefault();
            handleSectionNav('solutions');
          }}
        >
          Solutions
        </a>
      ),
    },
    {
      key: 'features',
      label: (
        <a
          href="/#features"
          style={menuLinkStyle}
          onClick={(e) => {
            e.preventDefault();
            handleSectionNav('features');
          }}
        >
          Features
        </a>
      ),
    },
    {
      key: 'how',
      label: (
        <a
          href="/#how-it-works"
          style={menuLinkStyle}
          onClick={(e) => {
            e.preventDefault();
            handleSectionNav('how-it-works');
          }}
        >
          How It Works
        </a>
      ),
    },
    
    {
      key: 'pricing',
      label: (
        <a
          href="/#pricing"
          style={menuLinkStyle}
          onClick={(e) => {
            e.preventDefault();
            handleSectionNav('pricing');
          }}
        >
          Pricing
        </a>
      ),
    },
  ];

  const menuItems: MenuProps['items'] = baseMenu;

  const mobileMenuItems: MenuProps['items'] = [
    ...(isAuthenticated
      ? [
          {
            key: 'dashboard',
            label: <Link to={dashboardHref} onClick={() => setDrawerOpen(false)}>Dashboard</Link>,
          },
        ]
      : []),
      {
      key: 'solutions',
      label: (
        <a
          href="/#solutions"
          onClick={(e) => {
            e.preventDefault();
            handleSectionNav('solutions', true);
          }}
        >
          Solutions
        </a>
      ),
    },
    {
      key: 'features',
      label: (
        <a
          href="/#features"
          onClick={(e) => {
            e.preventDefault();
            handleSectionNav('features', true);
          }}
        >
          Features
        </a>
      ),
    },
    {
      key: 'how',
      label: (
        <a
          href="/#how-it-works"
          onClick={(e) => {
            e.preventDefault();
            handleSectionNav('how-it-works', true);
          }}
        >
          How It Works
        </a>
      ),
    },
    
    {
      key: 'pricing',
      label: (
        <a
          href="/#pricing"
          onClick={(e) => {
            e.preventDefault();
            handleSectionNav('pricing', true);
          }}
        >
          Pricing
        </a>
      ),
    },
  ];

  return (
    <Header
      style={{
        background: 'transparent',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        height: 'auto',
        lineHeight: 'normal',
        padding: isMobile ? '12px 14px' : '16px 24px',
      }}
    >
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'auto auto' : 'auto 1fr auto',
          alignItems: 'center',
          columnGap: isMobile ? 12 : 24,
        }}
      >
        <Link to={homeHref}>
          <div
            style={{
              background: '#fff',
              borderRadius: 999,
              padding: isMobile ? '6px 10px' : '8px 14px',
              display: 'inline-flex',
              alignItems: 'center',
              boxShadow: '0 4px 12px rgba(23, 43, 77, 0.12)',
            }}
          >
            <img src={logoImage} alt="Logo" style={{ height: isMobile ? 34 : 44, display: 'block' }} />
          </div>
        </Link>

        {!isMobile && (
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
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: isMobile ? 8 : 0 }}>
          {isMobile && (
            <Button
              type="text"
              aria-label="Open navigation menu"
              icon={<MenuOutlined style={{ fontSize: 20, color: '#1F1F1F' }} />}
              onClick={() => setDrawerOpen(true)}
              style={{
                background: '#fff',
                borderRadius: 999,
                width: 40,
                height: 40,
                boxShadow: '0 4px 12px rgba(23, 43, 77, 0.12)',
              }}
            />
          )}

          {isAuthenticated ? (
            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <Avatar icon={<UserOutlined />} src={user?.avatar} />
                {!isMobile && <span>{user?.name}</span>}
              </div>
            </Dropdown>
          ) : (
            <Link to="/login">
              <Button
                type="primary"
                size={isMobile ? 'middle' : 'large'}
                style={{
                  borderRadius: 999,
                  paddingInline: isMobile ? 18 : 36,
                  height: isMobile ? 40 : 50,
                  fontSize: isMobile ? 16 : 20,
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

      <Drawer
        title="Menu"
        placement="right"
        onClose={() => setDrawerOpen(false)}
        open={drawerOpen}
        width={280}
      >
        <Menu mode="inline" items={mobileMenuItems} selectable={false} />
        {!isAuthenticated && (
          <div
            style={{
              marginTop: 16,
            }}
          >
            <Link to="/login" onClick={() => setDrawerOpen(false)}>
              <Button type="primary" block>
                Sign In
              </Button>
            </Link>
          </div>
        )}
      </Drawer>
    </Header>
  );
};

export default Navbar;
