import { Layout, Avatar, Dropdown } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import { useNavigate } from 'react-router-dom';
import type { MenuProps } from 'antd';

const { Header } = Layout;

const AdminHeader = () => {
  const { user } = useAuth();
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      label: 'Profile',
    },
    {
      key: 'logout',
      label: 'Logout',
      onClick: handleLogout,
    },
  ];

  return (
    <Header 
      style={{ 
        background: '#fff', 
        padding: '0 32px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderBottom: '1px solid #f0f0f0',
        height: '70px'
      }}
    >
      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: 500, color: '#1f1f1f' }}>
        Dashboard Admin
      </h2>
      
      <Dropdown 
        menu={{ items: userMenuItems }} 
        placement="bottomRight"
        trigger={['click']}
      >
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          gap: '12px', 
          cursor: 'pointer',
          padding: '4px 8px',
          borderRadius: '8px',
          transition: 'background 0.2s'
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = '#fafafa'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
        >
          <Avatar 
            size={40} 
            src={user?.avatar}
            style={{ backgroundColor: '#1890ff' }}
          >
            {user?.name?.[0]?.toUpperCase() || 'A'}
          </Avatar>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', lineHeight: 1.4 }}>
            <span style={{ fontSize: '14px', fontWeight: 500, color: '#1f1f1f' }}>
              {user?.name || 'Admin'}
            </span>
            <span style={{ fontSize: '12px', color: '#8c8c8c' }}>
              Administrator
            </span>
          </div>
          <DownOutlined style={{ fontSize: '10px', color: '#8c8c8c', marginLeft: '4px' }} />
        </div>
      </Dropdown>
    </Header>
  );
};

export default AdminHeader;