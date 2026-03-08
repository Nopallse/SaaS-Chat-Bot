import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Space,
  Tag,
  message,
  Steps,
  Alert,
  List,
  theme,
  Form,
  Input,
  Select,
} from 'antd';
import {
  CheckCircleOutlined,
  GoogleOutlined,
  LinkOutlined,
  SendOutlined,
  MailOutlined,
} from '@ant-design/icons';
import { useAuth } from '@/hooks/useAuth';
import { emailApi } from '@/features/email/services/emailApi';
import { useNotification } from '@/hooks/useNotification';

const { TextArea } = Input;
const { Option } = Select;

const ConnectTab = () => {
  const { isAuthenticated } = useAuth();
  const { token } = theme.useToken();
  const [loading, setLoading] = useState(false);
  const [connected, setConnected] = useState(false);
  const [accounts, setAccounts] = useState<Array<{ id: string; email: string }>>([]);

  // Send Test
  const [testForm] = Form.useForm();
  const [sendingTest, setSendingTest] = useState(false);
  const { showSuccess, showError } = useNotification();

  const handleConnect = async () => {
    if (!isAuthenticated) {
      message.warning('Please login first');
      return;
    }
    setLoading(true);
    try {
      const response = await emailApi.getConnectUrl();
      const url = typeof response === 'string' ? response : response?.url;
      if (url) {
        window.location.href = url;
      } else {
        message.error('No connect URL returned from server');
      }
    } catch (error) {
      message.error('Failed to get connect URL');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadAccounts = async () => {
      try {
        const data = await emailApi.getAccounts();
        if (Array.isArray(data) && data.length > 0) {
          setAccounts(data);
          setConnected(true);
        }
      } catch (err) {
        // ignore: assume not connected or endpoint missing
      }
    };

    loadAccounts();
  }, []);

  const handleSendTest = async (values: {
    fromEmail: string;
    toEmail: string;
    subject: string;
    html: string;
  }) => {
    setSendingTest(true);
    try {
      await emailApi.sendTest(values);
      showSuccess('Email test berhasil dikirim!');
      testForm.resetFields(['toEmail', 'subject', 'html']);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengirim email test';
      showError(msg);
    } finally {
      setSendingTest(false);
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
    <div style={{ maxWidth: 800, margin: '0 auto' }}>
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
                <GoogleOutlined style={{ fontSize: 64, color: token.colorPrimary }} />
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
            {accounts.length === 0 ? (
              <p style={{ color: '#8c8c8c', textAlign: 'center' }}>No connected accounts</p>
            ) : (
              <List
                dataSource={accounts}
                renderItem={(item) => (
                  <List.Item>
                    <Space style={{ width: '100%', justifyContent: 'space-between' }}>
                      <span>{item.email}</span>
                      <Tag color="blue">Connected</Tag>
                    </Space>
                  </List.Item>
                )}
              />
            )}
          </Card>
        </Space>
      </Card>

      {/* Send Test Email */}
      {connected && accounts.length > 0 && (
        <Card title="Kirim Email Test" style={{ marginTop: 24 }}>
          <Alert
            message="Test Koneksi Email"
            description="Kirim email test untuk memastikan akun Gmail Anda terhubung dengan baik dan dapat mengirim email."
            type="info"
            showIcon
            style={{ marginBottom: 16 }}
          />
          <Form
            form={testForm}
            layout="vertical"
            onFinish={handleSendTest}
            style={{ maxWidth: 600 }}
          >
            <Form.Item
              name="fromEmail"
              label="Dari"
              rules={[{ required: true, message: 'Pilih email pengirim' }]}
            >
              <Select placeholder="Pilih akun Gmail pengirim">
                {accounts.map((acc) => (
                  <Option key={acc.id} value={acc.email}>
                    <Space>
                      <MailOutlined />
                      {acc.email}
                    </Space>
                  </Option>
                ))}
              </Select>
            </Form.Item>

            <Form.Item
              name="toEmail"
              label="Kepada"
              rules={[
                { required: true, message: 'Masukkan email tujuan' },
                { type: 'email', message: 'Format email tidak valid' },
              ]}
            >
              <Input placeholder="contoh: penerima@email.com" />
            </Form.Item>

            <Form.Item
              name="subject"
              label="Subjek"
              rules={[{ required: true, message: 'Masukkan subjek email' }]}
            >
              <Input placeholder="Subjek email test" />
            </Form.Item>

            <Form.Item
              name="html"
              label="Isi Email (HTML)"
              rules={[{ required: true, message: 'Masukkan isi email' }]}
            >
              <TextArea
                rows={5}
                placeholder="<p>Halo, ini adalah email test dari sistem.</p>"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                icon={<SendOutlined />}
                loading={sendingTest}
              >
                Kirim Email Test
              </Button>
            </Form.Item>
          </Form>
        </Card>
      )}
    </div>
  );
};

export default ConnectTab;
