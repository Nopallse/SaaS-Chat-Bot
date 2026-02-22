import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Layout } from 'antd';
import AdminSidebar from './AdminSidebar';
import AdminHeader from './AdminHeader';

const { Content } = Layout;

const AdminLayout = () => {
  const [collapsed] = useState(false);

  return (
    <Layout style={{ minHeight: '100vh', background: '#f5f7fa' }}>
      <AdminSidebar collapsed={collapsed} />
      <Layout style={{ background: '#f5f7fa' }}>
        <AdminHeader />
        <Content 
          style={{ 
            margin: '24px 24px 24px 24px',
            padding: 0,
            minHeight: 280,
            background: 'transparent'
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default AdminLayout;