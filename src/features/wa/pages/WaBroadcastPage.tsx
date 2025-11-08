import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, Table, Space, Tag, Modal, Typography, Checkbox } from 'antd';
import { SendOutlined, PictureOutlined, FileTextOutlined } from '@ant-design/icons';
import { waApi, type WhatsAppSession, type BroadcastResult } from '../services/waApi';
import { useNotification } from '@/hooks/useNotification';
import { contactsApi } from '@/features/contacts/services/contactsApi';
import type { WhatsAppContact } from '@/features/contacts/types/contacts';
import ContactSelectorModal from '@/features/contacts/components/ContactSelectorModal';
import PhoneNumberInput from '@/features/contacts/components/PhoneNumberInput';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const WaBroadcastPage = () => {
  const [form] = Form.useForm();
  const [broadcastType, setBroadcastType] = useState<'text' | 'image'>('text');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResult | null>(null);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [fetchingContacts, setFetchingContacts] = useState(false);
  const [contactSelectorVisible, setContactSelectorVisible] = useState(false);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setFetching(true);
    try {
      const data = await waApi.getSessions();
      setSessions(data.filter(s => s.connected)); // Only show connected sessions
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal memuat sessions';
      showError(msg);
    } finally {
      setFetching(false);
    }
  };

  const fetchContacts = async () => {
    setFetchingContacts(true);
    try {
      const data = await contactsApi.getContacts();
      setContacts(data?.whatsapp || []);
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

  const handleContactSelect = (selectedPhones: string[]) => {
    const currentPhones = form.getFieldValue('phones') || [];
    
    // Combine existing and selected, remove duplicates
    const allPhones = [...new Set([...currentPhones, ...selectedPhones])];
    form.setFieldsValue({ phones: allPhones });
    setContactSelectorVisible(false);
    showSuccess(`${selectedPhones.length} contact dipilih`);
  };

  const handleBroadcast = async (values: any) => {
    setLoading(true);
    try {
      // Get phone numbers from array or parse from string (backward compatibility)
      let phoneNumbers: string[] = [];
      if (Array.isArray(values.phones)) {
        phoneNumbers = values.phones.filter((p: string) => p && p.trim().length > 0);
      } else if (typeof values.phones === 'string') {
        phoneNumbers = values.phones
          .split('\n')
          .map((p: string) => p.trim())
          .filter((p: string) => p.length > 0);
      }

      if (phoneNumbers.length === 0) {
        showError('Minimal 1 nomor telepon diperlukan!');
        setLoading(false);
        return;
      }

      const delayMs = values.delayMs ? parseInt(values.delayMs) : 1000;
      const jitterMs = values.jitterMs ? parseInt(values.jitterMs) : 500;
      const checkNumber = values.checkNumber !== false; // Default true

      let result: BroadcastResult;

      if (broadcastType === 'text') {
        if (!values.text || values.text.trim().length === 0) {
          showError('Pesan text wajib diisi!');
          setLoading(false);
          return;
        }

        result = await waApi.broadcastText({
          sessionId: values.sessionId,
          recipients: phoneNumbers,
          text: values.text.trim(),
          delayMs,
          jitterMs,
          checkNumber,
        });
      } else {
        if (!values.imageUrl || values.imageUrl.trim().length === 0) {
          showError('URL gambar wajib diisi!');
          setLoading(false);
          return;
        }

        result = await waApi.broadcastImage({
          sessionId: values.sessionId,
          recipients: phoneNumbers,
          imageUrl: values.imageUrl.trim(),
          caption: values.caption?.trim(),
          delayMs,
          jitterMs,
          checkNumber,
        });
      }

      // Add to history
      const historyItem = {
        id: result.campaignId || Date.now().toString(),
        type: broadcastType,
        sessionId: values.sessionId,
        recipientCount: phoneNumbers.length,
        total: result.total,
        summary: result.summary,
        sent: result.summary.SENT || 0,
        failed: result.summary.FAILED || 0,
        skipped: result.summary.SKIPPED || 0,
        createdAt: new Date().toISOString(),
        status: 'completed',
      };

      setHistory([historyItem, ...history]);
      setBroadcastResult(result);
      setResultModalVisible(true);
      
      const successCount = result.summary.SENT || 0;
      const failedCount = result.summary.FAILED || 0;
      const skippedCount = result.summary.SKIPPED || 0;
      
      showSuccess(`Broadcast selesai! Sent: ${successCount}, Failed: ${failedCount}, Skipped: ${skippedCount}`);
      
      form.resetFields();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal memulai broadcast';
      showError(msg);
      console.error('Broadcast error:', error);
    } finally {
      setLoading(false);
    }
  };

  const historyColumns = [
    {
      title: 'Tipe',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color={type === 'text' ? 'blue' : 'green'}>{type.toUpperCase()}</Tag>,
    },
    {
      title: 'Session',
      dataIndex: 'sessionId',
      key: 'sessionId',
      render: (sessionId: string) => <code style={{ fontSize: '12px' }}>{sessionId}</code>,
    },
    {
      title: 'Total Penerima',
      dataIndex: 'recipientCount',
      key: 'recipientCount',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'completed' ? 'success' : status === 'processing' ? 'processing' : 'error'}>
          {status === 'completed' ? 'Selesai' : status === 'processing' ? 'Sedang Proses' : 'Error'}
        </Tag>
      ),
    },
    {
      title: 'Berhasil',
      dataIndex: 'sent',
      key: 'sent',
      render: (sent: number) => <Tag color="success">{sent || 0}</Tag>,
    },
    {
      title: 'Gagal',
      dataIndex: 'failed',
      key: 'failed',
      render: (failed: number) => <Tag color="error">{failed || 0}</Tag>,
    },
    {
      title: 'Dilewati',
      dataIndex: 'skipped',
      key: 'skipped',
      render: (skipped: number) => <Tag color="warning">{skipped || 0}</Tag>,
    },
    {
      title: 'Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleString('id-ID'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>WhatsApp Broadcast</Title>
      
      <Card style={{ marginTop: '16px' }}>
        <Form form={form} layout="vertical" onFinish={handleBroadcast}>
          <Form.Item label="Tipe Broadcast" required>
            <Select value={broadcastType} onChange={setBroadcastType} style={{ width: '100%' }}>
              <Option value="text">
                <Space>
                  <FileTextOutlined /> Broadcast Text
                </Space>
              </Option>
              <Option value="image">
                <Space>
                  <PictureOutlined /> Broadcast Gambar
                </Space>
              </Option>
            </Select>
          </Form.Item>

          <Form.Item name="sessionId" label="Session" rules={[{ required: true, message: 'Session wajib dipilih!' }]}>
            <Select
              placeholder="Pilih session WhatsApp (hanya yang connected)"
              loading={fetching}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {sessions.map((session) => (
                <Option key={session.id} value={session.id} label={session.label || session.id}>
                  <Space>
                    <Tag color="success">Connected</Tag>
                    {session.label || session.id}
                    {session.meJid && <Text type="secondary">({session.meJid})</Text>}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item 
            name="phones" 
            label="Nomor Telepon" 
            rules={[{ required: true, message: 'Minimal 1 nomor telepon diperlukan!' }]}
            tooltip="Masukkan nomor telepon. Tekan Enter, koma, atau spasi untuk menambah nomor. Bisa juga paste beberapa nomor sekaligus."
          >
            <PhoneNumberInput
              placeholder="Masukkan nomor telepon (contoh: 62812345678)"
              onSelectFromContacts={handleOpenContactSelector}
            />
          </Form.Item>

          {broadcastType === 'text' ? (
            <Form.Item name="text" label="Pesan Text" rules={[{ required: true, message: 'Pesan text wajib diisi!' }]}>
              <TextArea rows={4} placeholder="Masukkan pesan text yang akan dikirim" />
            </Form.Item>
          ) : (
            <>
              <Form.Item name="imageUrl" label="URL Gambar" rules={[{ required: true, message: 'URL gambar wajib diisi!' }]}>
                <Input placeholder="Masukkan URL gambar (contoh: https://example.com/image.jpg)" />
              </Form.Item>
              <Form.Item name="caption" label="Caption (Opsional)">
                <TextArea rows={3} placeholder="Masukkan caption untuk gambar (opsional)" />
              </Form.Item>
            </>
          )}

          <Form.Item name="delayMs" label="Delay (ms)" initialValue={1000}>
            <Input type="number" placeholder="Delay between messages in milliseconds" />
          </Form.Item>

          <Form.Item name="jitterMs" label="Jitter (ms)" initialValue={500}>
            <Input type="number" placeholder="Random jitter in milliseconds" min={0} />
          </Form.Item>

          <Form.Item name="checkNumber" valuePropName="checked" initialValue={true}>
            <Checkbox>Check number (verifikasi nomor ada di WhatsApp sebelum kirim)</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} size="large" block>
              Mulai Broadcast
            </Button>
          </Form.Item>
        </Form>
      </Card>

      <Card title="Riwayat Broadcast" style={{ marginTop: 24 }}>
        <Table 
          columns={historyColumns} 
          dataSource={history} 
          rowKey="id" 
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Belum ada riwayat broadcast' }}
        />
      </Card>

      {/* Result Modal */}
      <Modal
        title="Hasil Broadcast"
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setResultModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={800}
      >
        {broadcastResult && (
          <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={5}>Ringkasan</Title>
                <Space size="large">
                  <Tag color="success">Sent: {broadcastResult.summary.SENT || 0}</Tag>
                  <Tag color="error">Failed: {broadcastResult.summary.FAILED || 0}</Tag>
                  <Tag color="warning">Skipped: {broadcastResult.summary.SKIPPED || 0}</Tag>
                  <Tag>Total: {broadcastResult.total}</Tag>
                </Space>
              </div>

              {broadcastResult.campaignId && (
                <Text type="secondary">Campaign ID: {broadcastResult.campaignId}</Text>
              )}

              <div>
                <Title level={5}>Detail Hasil</Title>
                <Table
                  dataSource={broadcastResult.results}
                  rowKey={(record, index) => `${record.phone}-${index}`}
                  pagination={{ pageSize: 10 }}
                  size="small"
                  columns={[
                    {
                      title: 'Phone',
                      dataIndex: 'phone',
                      key: 'phone',
                      render: (phone: string) => <code>{phone}</code>,
                    },
                    {
                      title: 'Status',
                      dataIndex: 'status',
                      key: 'status',
                      render: (status: string) => {
                        const color = status === 'SENT' ? 'success' : status === 'SKIPPED' ? 'warning' : 'error';
                        return <Tag color={color}>{status}</Tag>;
                      },
                    },
                    {
                      title: 'Error',
                      dataIndex: 'error',
                      key: 'error',
                      render: (error?: string) => error || '-',
                    },
                  ]}
                />
              </div>
            </Space>
          </div>
        )}
      </Modal>

      {/* Contact Selector Modal */}
      <ContactSelectorModal
        open={contactSelectorVisible}
        onCancel={() => setContactSelectorVisible(false)}
        onOk={handleContactSelect}
        contacts={contacts}
        type="whatsapp"
        loading={fetchingContacts}
      />
    </div>
  );
};

export default WaBroadcastPage;

