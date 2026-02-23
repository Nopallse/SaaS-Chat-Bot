import { Card, Row, Col, Button, Space, Typography, theme } from 'antd';
import { MessageOutlined, MailOutlined, UserOutlined, SettingOutlined } from '@ant-design/icons';
import { Link } from 'react-router-dom';

const { Title, Paragraph } = Typography;

const UserDashboardPage = () => {
  const { token } = theme.useToken();
  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Dashboard</Title>
      
      <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <MessageOutlined style={{ fontSize: 32, color: '#52c41a' }} />
              <Title level={4} style={{ margin: 0 }}>WhatsApp</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Manage WhatsApp sessions and send broadcasts
              </Paragraph>
              <Space>
                <Link to="/wa/session">
                  <Button type="link">Sessions</Button>
                </Link>
                <Link to="/wa/broadcast">
                  <Button type="link">Broadcast</Button>
                </Link>
                <Link to="/wa/group">
                  <Button type="link">Groups</Button>
                </Link>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <MailOutlined style={{ fontSize: 32, color: token.colorPrimary }} />
              <Title level={4} style={{ margin: 0 }}>Email</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Connect Gmail and send email broadcasts
              </Paragraph>
              <Space>
                <Link to="/email/connect">
                  <Button type="link">Connect</Button>
                </Link>
                <Link to="/email/broadcast">
                  <Button type="link">Broadcast</Button>
                </Link>
              </Space>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <UserOutlined style={{ fontSize: 32, color: '#722ed1' }} />
              <Title level={4} style={{ margin: 0 }}>Profile</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Manage your account settings
              </Paragraph>
              <Link to="/user/profile">
                <Button type="link">View Profile</Button>
              </Link>
            </Space>
          </Card>
        </Col>

        <Col xs={24} md={12} lg={6}>
          <Card hoverable>
            <Space direction="vertical" size={12} style={{ width: '100%' }}>
              <SettingOutlined style={{ fontSize: 32, color: '#fa8c16' }} />
              <Title level={4} style={{ margin: 0 }}>Settings</Title>
              <Paragraph type="secondary" style={{ margin: 0 }}>
                Configure application settings
              </Paragraph>
              <Button type="link" disabled>Coming Soon</Button>
            </Space>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default UserDashboardPage;
