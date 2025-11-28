import { useState } from 'react';
import { Card, Form, Input, Button, Table, Tag, message } from 'antd';
import { SendOutlined } from '@ant-design/icons';
import { contactsApi } from '@/features/contacts/services/contactsApi';
import type { EmailContact } from '@/features/contacts/types/contacts';
import ContactSelectorModal from '@/features/contacts/components/ContactSelectorModal';
import EmailInput from '@/features/contacts/components/EmailInput';
import { useNotification } from '@/hooks/useNotification';
import { emailApi } from '@/features/email/services/emailApi';

const { TextArea } = Input;

const EmailBroadcastPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [history] = useState<any[]>([]);
  const [contacts, setContacts] = useState<EmailContact[]>([]);
  const [fetchingContacts, setFetchingContacts] = useState(false);
  const [contactSelectorVisible, setContactSelectorVisible] = useState(false);
  const { showSuccess, showError } = useNotification();

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
    
    // Combine existing and selected, remove duplicates
    const allEmails = [...new Set([...currentEmails, ...selectedEmails])];
    form.setFieldsValue({ emails: allEmails });
    setContactSelectorVisible(false);
    showSuccess(`${selectedEmails.length} contact dipilih`);
  };

  const handleBroadcast = async (values: any) => {
    setLoading(true);
    try {
      // Get emails from array or parse from string (backward compatibility)
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

      // Call backend to start broadcast
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
    <div style={{ padding: '24px' }}>
      <Card title="Email Broadcast">
        <Form form={form} layout="vertical" onFinish={handleBroadcast}>
          <Form.Item name="fromEmail" label="From Email" rules={[{ required: true, type: 'email' }]}>
            <Input placeholder="sender@example.com" />
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
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} size="large">
              Start Email Broadcast
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Broadcast History" style={{ marginTop: 24 }}>
        <Table columns={historyColumns} dataSource={history} rowKey="id" pagination={{ pageSize: 10 }} />
      </Card>

      {/* Contact Selector Modal */}
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

export default EmailBroadcastPage;

