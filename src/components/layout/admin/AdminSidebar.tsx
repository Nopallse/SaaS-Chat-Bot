import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined, 
  UserOutlined, 
  CreditCardOutlined,
  AppstoreOutlined,
  SettingOutlined,
  QuestionCircleOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/store/authStore';
import type { MenuProps } from 'antd';

const { Sider } = Layout;

interface AdminSidebarProps {
  collapsed: boolean;
}

const AdminSidebar = ({ collapsed }: AdminSidebarProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const logout = useAuthStore((state) => state.logout);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const mainMenuItems: MenuProps['items'] = [
    {
      key: 'main',
      label: 'Main',
      type: 'group',
      children: [
        {
          key: '/admin/dashboard',
          icon: <DashboardOutlined />,
          label: 'Dashboard',
          onClick: () => navigate('/admin/dashboard'),
        },
        {
          key: '/admin/accounts',
          icon: <UserOutlined />,
          label: 'Accounts',
          onClick: () => navigate('/admin/accounts'),
        },
        {
          key: '/admin/payments',
          icon: <CreditCardOutlined />,
          label: 'Payments',
          onClick: () => navigate('/admin/payments'),
        },
        {
          key: '/admin/packages',
          icon: <AppstoreOutlined />,
          label: 'Packages',
          onClick: () => navigate('/admin/packages'),
        },
      ],
    },
  ];

  const otherMenuItems: MenuProps['items'] = [
    {
      key: 'other',
      label: 'Other',
      type: 'group',
      children: [
        {
          key: '/admin/settings',
          icon: <SettingOutlined />,
          label: 'Settings',
          onClick: () => navigate('/admin/settings'),
        },
        {
          key: '/admin/help',
          icon: <QuestionCircleOutlined />,
          label: 'Help',
          onClick: () => navigate('/admin/help'),
        },
      ],
    },
  ];

  const logoutMenuItem: MenuProps['items'] = [
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: 'Logout',
      onClick: handleLogout,
      style: { color: '#ff4d4f' },
    },
  ];

  return (
    <Sider 
      trigger={null} 
      collapsible 
      collapsed={collapsed}
      width={250}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div style={{ 
        height: '70px', 
        display: 'flex', 
        alignItems: 'center', 
        padding: '0 24px',
        borderBottom: '1px solid #f0f0f0'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <img 
            src="/logo.png" 
            alt="Logo" 
            style={{
              height: '32px',
              width: 'auto',
              objectFit: 'contain'
            }}
          />
        </div>
      </div>
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ 
          borderRight: 0,
          marginTop: '16px'
        }}
        items={mainMenuItems}
      />
      
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        style={{ 
          borderRight: 0,
          marginTop: '24px'
        }}
        items={otherMenuItems}
      />

      <div style={{ position: 'absolute', bottom: '24px', width: '100%', padding: '0 16px' }}>
        <Menu
          mode="inline"
          style={{ borderRight: 0 }}
          items={logoutMenuItem}
        />
      </div>
    </Sider>
  );
};

export default AdminSidebar;