import { useState } from 'react';
import { Card, Form, Input, Button, Table, Tag, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';

const { TextArea } = Input;

const EmailBroadcastPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [history] = useState<any[]>([]);

  const handleBroadcast = async (_values: any) => {
    setLoading(true);
    try {
      // TODO: API call
      message.success('Email broadcast started!');
      form.resetFields();
    } catch (error) {
      message.error('Failed to start broadcast');
    } finally {
      setLoading(false);
    }
  };

  const historyColumns = [
    {
      title: 'From Email',
      dataIndex: 'fromEmail',
      key: 'fromEmail',
    },
    {
      title: 'Subject',
      dataIndex: 'subject',
      key: 'subject',
    },
    {
      title: 'Recipients',
      dataIndex: 'recipientCount',
      key: 'recipientCount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'success' : status === 'processing' ? 'processing' : 'error'}>
          {status}
        </Tag>
      ),
    },
    {
      title: 'Sent',
      dataIndex: 'sent',
      key: 'sent',
    },
    {
      title: 'Failed',
      dataIndex: 'failed',
      key: 'failed',
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card title="Email Broadcast">
        <Form form={form} layout="vertical" onFinish={handleBroadcast}>
          <Form.Item name="fromEmail" label="From Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="sender@example.com" />
          </Form.Item>

          <Form.Item name="emails" label="Recipient Emails" rules={[{ required: true }]}>
            <TextArea
              rows={6}
              placeholder="Enter email addresses separated by newline (e.g., user1@example.com)"
            />
          </Form.Item>

          <Form.Item name="subject" label="Subject" rules={[{ required: true }]}>
            <Input placeholder="Email subject" />
          </Form.Item>

          <Form.Item name="html" label="Email Body (HTML)" rules={[{ required: true }]}>
            <TextArea rows={10} placeholder="Enter HTML email content" />
          </Form.Item>

          <Form.Item name="delayMs" label="Delay (ms)" initialValue={1000}>
            <Input type="number" placeholder="Delay between emails in milliseconds" />
          </Form.Item>

          <Form.Item name="jitterMs" label="Jitter (ms)" initialValue={400}>
            <Input type="number" placeholder="Random jitter in milliseconds" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} size="large">
              Start Email Broadcast
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Broadcast History" style={{ marginTop: 24 }}>
        <Table columns={historyColumns} dataSource={history} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>
    </div>
  );
};

export default EmailBroadcastPage;

