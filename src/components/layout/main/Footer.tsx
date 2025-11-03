import { Layout, Row, Col, Space, Typography } from 'antd';
import { MailOutlined, MessageOutlined } from '@ant-design/icons';

const { Footer: AntFooter } = Layout;
const { Text, Title } = Typography;

const Footer = () => {
  return (
    <AntFooter style={{ background: '#1677ff', color: 'white', padding: '48px 24px' }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        <Row gutter={[32, 32]}>
          <Col xs={24} md={8}>
            <Space direction="vertical" size={12}>
              <Space align="center" size={8}>
                <MessageOutlined style={{ color: 'white' }} />
                <MailOutlined style={{ color: 'white' }} />
                <Text style={{ color: 'white', fontWeight: 600 }}>Blastify</Text>
              </Space>
              <Text style={{ color: 'rgba(255,255,255,0.85)' }}>Automate your messaging campaigns with ease and efficiency.</Text>
            </Space>
          </Col>
          <Col xs={24} md={5}>
            <Title level={5} style={{ color: 'white', marginBottom: 16 }}>Product</Title>
            <Space direction="vertical" size={8}>
              <a href="/#features" style={{ color: 'rgba(255,255,255,0.85)' }}>Features</a>
              <a href="/#pricing" style={{ color: 'rgba(255,255,255,0.85)' }}>Pricing</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>API Docs</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Changelog</a>
            </Space>
          </Col>
          <Col xs={24} md={5}>
            <Title level={5} style={{ color: 'white', marginBottom: 16 }}>Company</Title>
            <Space direction="vertical" size={8}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>About Us</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Blog</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Careers</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Contact</a>
            </Space>
          </Col>
          <Col xs={24} md={6}>
            <Title level={5} style={{ color: 'white', marginBottom: 16 }}>Legal</Title>
            <Space direction="vertical" size={8}>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Privacy Policy</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Terms of Service</a>
              <a href="#" style={{ color: 'rgba(255,255,255,0.85)' }}>Cookie Policy</a>
            </Space>
          </Col>
        </Row>
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.25)', marginTop: 24, paddingTop: 16, textAlign: 'center' }}>
          <Text style={{ color: 'rgba(255,255,255,0.85)' }}>© {new Date().getFullYear()} Blastify. All rights reserved.</Text>
        </div>
      </div>
    </AntFooter>
  );
};

export default Footer;
