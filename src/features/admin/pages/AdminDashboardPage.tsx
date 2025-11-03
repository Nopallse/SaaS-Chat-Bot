import { Typography, Row, Col, Card, Statistic } from 'antd';
import { UserOutlined, TeamOutlined, RiseOutlined, DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const AdminDashboardPage = () => {
  return (
    <div>
      <Title level={2}>Admin Dashboard</Title>
      <p style={{ fontSize: '16px', color: '#666', marginBottom: '30px' }}>
        Selamat datang di panel administrator
      </p>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Total Users"
              value={1234}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#3B82F6' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Active Users"
              value={892}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#10B981' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="New Users Today"
              value={28}
              prefix={<RiseOutlined />}
              valueStyle={{ color: '#F59E0B' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="Revenue"
              value={45600}
              prefix={<DollarOutlined />}
              precision={2}
              valueStyle={{ color: '#8B5CF6' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} lg={12}>
          <Card title="Recent Activity">
            <p>✅ User #1234 registered</p>
            <p>✅ User #1233 updated profile</p>
            <p>⚠️ System maintenance scheduled</p>
            <p>✅ Database backup completed</p>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="Quick Stats">
            <p><strong>Server Status:</strong> <span style={{ color: '#10B981' }}>● Online</span></p>
            <p><strong>Database:</strong> <span style={{ color: '#10B981' }}>● Connected</span></p>
            <p><strong>API Response:</strong> <span style={{ color: '#10B981' }}>45ms</span></p>
            <p><strong>Uptime:</strong> <span style={{ color: '#3B82F6' }}>99.9%</span></p>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;
