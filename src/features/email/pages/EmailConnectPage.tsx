import { useState } from 'react';
import { Card, Button, Space, Tag, message, Steps, Alert } from 'antd';
import { CheckCircleOutlined, GoogleOutlined, LinkOutlined } from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';

const EmailConnectPage = () => {
  const { isAuthenticated } = useAuth();
  const [loading, setLoading] = useState(false);
  const [connected] = useState(false);

  const handleConnect = async () => {
    if (!isAuthenticated) {
      message.warning('Please login first');
      return;
    }
    setLoading(true);
    try {
      // TODO: API call to get connect URL
      // const response = await emailApi.getConnectUrl();
      // window.location.href = response.url;
      message.info('Redirecting to Google...');
    } catch (error) {
      message.error('Failed to get connect URL');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    {
      title: 'Connect',
      description: 'Click connect to authorize Gmail',
      icon: <LinkOutlined />,
    },
    {
      title: 'Authorize',
      description: 'Grant permissions in Google',
      icon: <GoogleOutlined />,
    },
    {
      title: 'Connected',
      description: 'Your Gmail is connected',
      icon: <CheckCircleOutlined />,
    },
  ];

  return (
    <div style={{ padding: '24px', maxWidth: 800, margin: '0 auto' }}>
      <Card title="Connect Gmail Account">
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <Alert
            message="Gmail Connection Required"
            description="Connect your Gmail account to start sending email broadcasts. Your credentials are securely stored."
            type="info"
            showIcon
          />

          <Steps current={connected ? 2 : 0} items={steps} />

          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            {connected ? (
              <Space direction="vertical" size="middle">
                <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a' }} />
                <Tag color="success" style={{ fontSize: 16, padding: '8px 16px' }}>
                  Gmail Connected
                </Tag>
                <p style={{ color: '#8c8c8c' }}>Your Gmail account is successfully connected</p>
              </Space>
            ) : (
              <Space direction="vertical" size="middle">
                <GoogleOutlined style={{ fontSize: 64, color: '#1890ff' }} />
                <Button
                  type="primary"
                  size="large"
                  icon={<GoogleOutlined />}
                  loading={loading}
                  onClick={handleConnect}
                >
                  Connect Gmail Account
                </Button>
                <p style={{ color: '#8c8c8c' }}>
                  Click the button above to authorize Blastify to access your Gmail account
                </p>
              </Space>
            )}
          </div>

          <Card title="Connected Accounts" size="small">
            <Space direction="vertical" style={{ width: '100%' }}>
              {/* TODO: List connected accounts */}
              <p style={{ color: '#8c8c8c', textAlign: 'center' }}>No connected accounts</p>
            </Space>
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default EmailConnectPage;

