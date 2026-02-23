import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Table, Tag, message, Select, Space, Alert } from 'antd';
import { SendOutlined, MailOutlined, LinkOutlined } from '@ant-design/icons';
import { contactsApi } from '@/features/contacts/services/contactsApi';
import type { EmailContact } from '@/features/contacts/types/contacts';
import ContactSelectorModal from '@/features/contacts/components/ContactSelectorModal';
import EmailInput from '@/features/contacts/components/EmailInput';
import { useNotification } from '@/hooks/useNotification';
import { emailApi } from '@/features/email/services/emailApi';

const { TextArea } = Input;
const { Option } = Select;

interface BroadcastTabProps {
  onSwitchToConnect?: () => void;
}

const BroadcastTab = ({ onSwitchToConnect }: BroadcastTabProps) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [accounts, setAccounts] = useState<Array<{ id: string; email: string }>>([]);
  const [history] = useState<any[]>([]);
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [fetchingContacts, setFetchingContacts] = useState(false);
  const [contactSelectorVisible, setContactSelectorVisible] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    setFetching(true);
    try {
      const data = await emailApi.getAccounts();
      setAccounts(data || []);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal memuat email accounts';
      showError(msg);
    } finally {
      setFetching(false);
    }
  };

  const fetchContacts = async () => {
    setFetchingContacts(true);
    try {
      const data = await contactsApi.getContacts();
      setContacts(data?.emails || []);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal memuat contacts';
      showError(msg);
    } finally {
      setFetchingContacts(false);
    }
  };

  const handleOpenContactSelector = () => {
    fetchContacts();
    setContactSelectorVisible(true);
  };

  const handleContactSelect = (selectedEmails: string[]) => {
    const currentEmails = form.getFieldValue('emails') || [];
    const allEmails = [...new Set([...currentEmails, ...selectedEmails])];
    form.setFieldsValue({ emails: allEmails });
    setContactSelectorVisible(false);
    showSuccess(`${selectedEmails.length} contact dipilih`);
  };

  const handleBroadcast = async (values: any) => {
    setLoading(true);
    try {
      if (accounts.length === 0) {
        showError('Tidak ada email account yang terhubung. Silakan hubungkan Gmail account terlebih dahulu.');
        setLoading(false);
        return;
      }

      let emails: string[] = [];
      if (Array.isArray(values.emails)) {
        emails = values.emails.filter((e: string) => e && e.trim().length > 0);
      } else if (typeof values.emails === 'string') {
        emails = values.emails
          .split('\n')
          .map((e: string) => e.trim())
          .filter((e: string) => e.length > 0);
      }

      if (emails.length === 0) {
        showError('Minimal 1 email diperlukan!');
        setLoading(false);
        return;
      }

      try {
        await emailApi.sendBroadcast({
          fromEmail: values.fromEmail,
          emails,
          subject: values.subject,
          html: values.html,
          delayMs: values.delayMs || 1000,
          jitterMs: values.jitterMs || 400,
        });
        message.success('Email broadcast started!');
        form.resetFields();
      } catch (err: any) {
        const msg = err?.response?.data?.message || 'Failed to start broadcast';
        showError(msg);
      }
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
    <div>
      {accounts.length === 0 && !fetching && (
        <Alert
          message="No Connected Email Accounts"
          description={
            <div>
              You need to connect a Gmail account before you can send email broadcasts.{' '}
              {onSwitchToConnect ? (
                <a onClick={onSwitchToConnect} style={{ cursor: 'pointer' }}>
                  <LinkOutlined /> Connect Gmail Account
                </a>
              ) : (
                <span>
                  <LinkOutlined /> Go to Connect tab
                </span>
              )}
            </div>
          }
          type="warning"
          showIcon
          style={{ marginBottom: '16px' }}
        />
      )}

      <Card title="Email Broadcast">
        <Form form={form} layout="vertical" onFinish={handleBroadcast}>
          <Form.Item name="fromEmail" label="From Email" rules={[{ required: true, message: 'From email wajib dipilih!' }]}>
            <Select
              placeholder="Pilih email account (hanya yang terhubung)"
              loading={fetching}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {accounts.map((account) => (
                <Option key={account.id || account.email} value={account.email} label={account.email}>
                  <Space>
                    <MailOutlined />
                    {account.email}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="emails"
            label="Recipient Emails"
            rules={[{ required: true, message: 'Minimal 1 email diperlukan!' }]}
            tooltip="Masukkan alamat email. Tekan Enter untuk menambah email. Bisa juga paste beberapa email sekaligus."
          >
            <EmailInput
              placeholder="Masukkan alamat email (contoh: user@example.com)"
              onSelectFromContacts={handleOpenContactSelector}
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
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={loading}
              size="large"
              disabled={accounts.length === 0}
            >
              Start Email Broadcast
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Broadcast History" style={{ marginTop: 24 }}>
        <Table columns={historyColumns} dataSource={history} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      <ContactSelectorModal
        open={contactSelectorVisible}
        onCancel={() => setContactSelectorVisible(false)}
        onOk={handleContactSelect}
        contacts={contacts}
        type="email"
        loading={fetchingContacts}
      />
    </div>
  );
};

export default BroadcastTab;
