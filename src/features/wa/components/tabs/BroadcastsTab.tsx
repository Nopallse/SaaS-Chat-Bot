import { useEffect, useState } from 'react';
import {
  Alert,
  Button,
  Card,
  Checkbox,
  DatePicker,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Switch,
  Table,
  Tabs,
  Tag,
  TimePicker,
  Typography,
  Upload,
} from 'antd';
import {
  CalendarOutlined,
  FileTextOutlined,
  LoadingOutlined,
  PictureOutlined,
  ReloadOutlined,
  SendOutlined,
  UploadOutlined,
} from '@ant-design/icons';
import dayjs from 'dayjs';
import {
  waApi,
  type BroadcastImageRequest,
  type BroadcastResult,
  type BroadcastTextRequest,
  type WaCampaign,
} from '../../services/waApi';
import { contactsApi } from '@/features/contacts/services/contactsApi';
import type { WhatsAppContact } from '@/features/contacts/types/contacts';
import ContactSelectorModal from '@/features/contacts/components/ContactSelectorModal';
import PhoneNumberInput from '@/features/contacts/components/PhoneNumberInput';
import { useNotification } from '@/hooks/useNotification';
import { mediaApi } from '@/services/mediaApi';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

interface BroadcastHistoryItem {
  id: string;
  type: 'text' | 'image';
  recipientCount: number;
  total: number;
  summary: Record<string, number>;
  sent: number;
  failed: number;
  skipped: number;
  createdAt: string;
  status: string;
}

interface BroadcastsTabProps {
  onNewBroadcast?: () => void;
}

type ScheduleRepeater = 'ONCE' | 'EVERY_DAY' | 'EVERY_WEEK' | 'EVERY_MONTH';

const BroadcastsTab = ({ onNewBroadcast }: BroadcastsTabProps) => {
  const [form] = Form.useForm();
  const [broadcastType, setBroadcastType] = useState<'text' | 'image'>('text');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<BroadcastHistoryItem[]>([]);
  const [campaigns, setCampaigns] = useState<WaCampaign[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState<BroadcastResult | null>(null);
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [fetchingContacts, setFetchingContacts] = useState(false);
  const [contactSelectorVisible, setContactSelectorVisible] = useState(false);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState('campaigns');
  const [uploading, setUploading] = useState(false);
  const [uploadedImageUrl, setUploadedImageUrl] = useState<string | null>(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    form.setFieldValue('checkNumber', true);
    form.setFieldValue('isScheduled', false);
    fetchContacts();
    fetchCampaigns();
  }, [form]);

  const fetchContacts = async () => {
    setFetchingContacts(true);
    try {
      const data = await contactsApi.getContacts();
      setContacts(data?.whatsapp || []);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal memuat contacts');
    } finally {
      setFetchingContacts(false);
    }
  };

  const fetchCampaigns = async () => {
    setLoadingCampaigns(true);
    try {
      const data = await waApi.getCampaigns();
      setCampaigns(data || []);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal memuat campaigns');
      setCampaigns([]);
    } finally {
      setLoadingCampaigns(false);
    }
  };

  const handleOpenContactSelector = () => {
    setContactSelectorVisible(true);
  };

  const handleContactSelect = (selectedPhones: string[]) => {
    const currentPhones = form.getFieldValue('phones') || [];
    const currentContactIds = form.getFieldValue('contactIds') || [];
    const allPhones = [...new Set([...currentPhones, ...selectedPhones])];
    const selectedContactIds = contacts
      .filter((contact) => selectedPhones.includes(contact.phone))
      .map((contact) => contact.id);
    const allContactIds = [...new Set([...currentContactIds, ...selectedContactIds])];
    form.setFieldsValue({ phones: allPhones, contactIds: allContactIds });
    setContactSelectorVisible(false);
    showSuccess(`${selectedPhones.length} contact dipilih`);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const result = await mediaApi.uploadImage(file);
      setUploadedImageUrl(result.uri);
      form.setFieldsValue({ imageUrl: result.uri });
      showSuccess('Gambar berhasil diupload');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal upload gambar');
    } finally {
      setUploading(false);
    }
    return false;
  };

  const handleBroadcast = async (values: any) => {
    setLoading(true);
    try {
      let phoneNumbers: string[] = [];
      if (Array.isArray(values.phones)) {
        phoneNumbers = values.phones.filter((phone: string) => phone && phone.trim().length > 0);
      } else if (typeof values.phones === 'string') {
        phoneNumbers = values.phones
          .split('\n')
          .map((phone: string) => phone.trim())
          .filter((phone: string) => phone.length > 0);
      }

      const contactIds = Array.isArray(values.contactIds) ? values.contactIds : [];
      const useAllContacts = values.useAllContacts === true;

      if (phoneNumbers.length === 0 && contactIds.length === 0 && !useAllContacts) {
        showError('Minimal isi nomor manual, pilih contact, atau aktifkan semua contact');
        setLoading(false);
        return;
      }

      const delayMs = values.delayMs ? parseInt(values.delayMs, 10) : 1000;
      const jitterMs = values.jitterMs ? parseInt(values.jitterMs, 10) : 500;
      const checkNumber = values.checkNumber !== false;
      const isScheduled = values.isScheduled === true;
      const timetableRepeater = values.timetableRepeater as ScheduleRepeater | undefined;
      const scheduledDate = values.scheduledDate ? dayjs(values.scheduledDate).format('YYYY-MM-DD') : undefined;
      const scheduledTime = values.scheduledTime ? dayjs(values.scheduledTime).format('HH:mm') : undefined;

      if (isScheduled) {
        if (!timetableRepeater) {
          showError('Pilih pola jadwal campaign');
          setLoading(false);
          return;
        }
        if (!scheduledTime) {
          showError('Pilih jam kirim campaign');
          setLoading(false);
          return;
        }
        if (timetableRepeater !== 'EVERY_DAY' && !scheduledDate) {
          showError('Pilih tanggal mulai campaign');
          setLoading(false);
          return;
        }
      }

      let result: BroadcastResult;
      const commonPayload: Omit<BroadcastTextRequest, 'text'> = {
        name: values.name?.trim() || undefined,
        isScheduled,
        scheduleType: isScheduled ? 'SCHEDULE_LATER' : 'SEND_NOW',
        timetableRepeater,
        scheduledDate,
        scheduledTime,
        recipients: phoneNumbers,
        contactIds,
        useAllContacts,
        delayMs,
        jitterMs,
        checkNumber,
      };

      if (broadcastType === 'text') {
        if (!values.text || values.text.trim().length === 0) {
          showError('Pesan text wajib diisi');
          setLoading(false);
          return;
        }

        result = await waApi.broadcastText({
          ...commonPayload,
          text: values.text.trim(),
        });
      } else {
        if (!values.imageUrl || values.imageUrl.trim().length === 0) {
          showError('URL gambar wajib diisi');
          setLoading(false);
          return;
        }

        const imagePayload: BroadcastImageRequest = {
          ...commonPayload,
          imageUrl: values.imageUrl.trim(),
          caption: values.caption?.trim(),
        };

        result = await waApi.broadcastImage(imagePayload);
      }

      const summary = result.summary || {};
      const historyItem: BroadcastHistoryItem = {
        id: result.campaignId || Date.now().toString(),
        type: broadcastType,
        recipientCount: useAllContacts ? contacts.length : Math.max(phoneNumbers.length, contactIds.length),
        total: result.total,
        summary,
        sent: summary.SENT || 0,
        failed: summary.FAILED || 0,
        skipped: summary.SKIPPED || 0,
        createdAt: new Date().toISOString(),
        status: result.status === 'SCHEDULED' ? 'scheduled' : 'completed',
      };

      setHistory((current) => [historyItem, ...current]);
      setBroadcastResult(result);
      setResultModalVisible(true);
      await fetchCampaigns();
      onNewBroadcast?.();

      if (result.status === 'SCHEDULED') {
        showSuccess(result.message || 'Campaign berhasil dijadwalkan');
      } else {
        showSuccess(
          `Broadcast selesai! Sent: ${summary.SENT || 0}, Failed: ${summary.FAILED || 0}, Skipped: ${summary.SKIPPED || 0}`
        );
      }

      form.resetFields();
      form.setFieldValue('checkNumber', true);
      form.setFieldValue('isScheduled', false);
      setUploadedImageUrl(null);
      setCreateModalVisible(false);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal memulai broadcast');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseCreateModal = () => {
    if (loading) {
      return;
    }
    setCreateModalVisible(false);
  };

  const historyColumns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color={type === 'text' ? 'blue' : 'green'}>{type.toUpperCase()}</Tag>,
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
        <Tag color={status === 'completed' ? 'success' : status === 'scheduled' ? 'processing' : 'default'}>
          {status === 'completed' ? 'Completed' : status === 'scheduled' ? 'Scheduled' : 'Processing'}
        </Tag>
      ),
    },
    {
      title: 'Sent',
      dataIndex: 'sent',
      key: 'sent',
      render: (sent: number) => <Tag color="success">{sent || 0}</Tag>,
    },
    {
      title: 'Failed',
      dataIndex: 'failed',
      key: 'failed',
      render: (failed: number) => <Tag color="error">{failed || 0}</Tag>,
    },
    {
      title: 'Skipped',
      dataIndex: 'skipped',
      key: 'skipped',
      render: (skipped: number) => <Tag color="warning">{skipped || 0}</Tag>,
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm'),
    },
  ];

  const campaignColumns = [
    {
      title: 'Campaign',
      dataIndex: 'name',
      key: 'name',
      render: (name: string, record: WaCampaign) => (
        <Space direction="vertical" size={0}>
          <Text strong>{name}</Text>
          <Text type="secondary" style={{ fontSize: 12 }}>{record.id}</Text>
        </Space>
      ),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color={type === 'TEXT' ? 'blue' : 'green'}>{type}</Tag>,
    },
    {
      title: 'Mode',
      key: 'mode',
      render: (_: unknown, record: WaCampaign) => (
        <Tag color={record.isScheduled ? 'processing' : 'default'}>
          {record.isScheduled ? 'Scheduled' : 'Send Now'}
        </Tag>
      ),
    },
    {
      title: 'Schedule',
      key: 'schedule',
      render: (_: unknown, record: WaCampaign) => {
        if (!record.isScheduled) {
          return <Text type="secondary">-</Text>;
        }

        return (
          <Space direction="vertical" size={0}>
            <Text>{record.timetableRepeater || '-'}</Text>
            <Text type="secondary" style={{ fontSize: 12 }}>
              {record.scheduledDate ? dayjs(record.scheduledDate).format('DD MMM YYYY') : 'Tanpa tanggal'} {record.scheduledTime || ''}
            </Text>
          </Space>
        );
      },
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: WaCampaign['status']) => {
        const colorMap = {
          PENDING: 'default',
          ACTIVE: 'processing',
          COMPLETED: 'success',
          PAUSED: 'warning',
        } as const;
        return <Tag color={colorMap[status]}>{status}</Tag>;
      },
    },
    {
      title: 'Stats',
      key: 'stats',
      render: (_: unknown, record: WaCampaign) => (
        <Space wrap>
          <Tag>Total: {record.stats.total}</Tag>
          <Tag color="success">Sent: {record.stats.sent}</Tag>
          <Tag color="error">Failed: {record.stats.failed}</Tag>
          <Tag color="warning">Skipped: {record.stats.skipped}</Tag>
        </Space>
      ),
    },
    {
      title: 'Created',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('DD MMM YYYY HH:mm'),
    },
  ];

  const createBroadcastForm = (
    <Form form={form} layout="vertical" onFinish={handleBroadcast}>
      <Form.Item name="name" label="Campaign Name">
        <Input placeholder="Contoh: Promo Follow Up Pagi" />
      </Form.Item>

      <Form.Item label="Broadcast Type" required>
        <Select value={broadcastType} onChange={setBroadcastType} style={{ width: '100%' }}>
          <Option value="text">
            <Space>
              <FileTextOutlined /> Text Broadcast
            </Space>
          </Option>
          <Option value="image">
            <Space>
              <PictureOutlined /> Image Broadcast
            </Space>
          </Option>
        </Select>
      </Form.Item>

      <Form.Item
        name="phones"
        label="Phone Numbers"
        tooltip="Masukkan nomor manual. Bisa dikombinasikan dengan saved contact atau semua contact."
      >
        <PhoneNumberInput
          placeholder="Enter phone number (e.g. 62812345678)"
          onSelectFromContacts={handleOpenContactSelector}
        />
      </Form.Item>

      <Form.Item
        name="contactIds"
        label="Saved Contacts"
        tooltip="Pilih contact WhatsApp yang sudah tersimpan"
      >
        <Select
          mode="multiple"
          allowClear
          placeholder="Pilih contact tersimpan"
          optionFilterProp="label"
          loading={fetchingContacts}
          options={contacts
            .filter((contact) => contact.status === 'ACTIVE')
            .map((contact) => ({
              value: contact.id,
              label: `${contact.name || contact.phone} (${contact.phone})`,
            }))}
        />
      </Form.Item>

      <Form.Item name="useAllContacts" label="Gunakan semua contact aktif" valuePropName="checked">
        <Switch checkedChildren="Semua Contact" unCheckedChildren="Manual" />
      </Form.Item>

      {broadcastType === 'text' ? (
        <Form.Item name="text" label="Message" rules={[{ required: true, message: 'Message is required' }]}>
          <TextArea rows={4} placeholder="Enter text message to send" />
        </Form.Item>
      ) : (
        <>
          <Form.Item label="Upload Gambar">
            <Upload
              name="file"
              accept="image/*"
              showUploadList={false}
              beforeUpload={handleImageUpload}
            >
              <Button icon={uploading ? <LoadingOutlined /> : <UploadOutlined />} loading={uploading}>
                {uploadedImageUrl ? 'Ganti Gambar' : 'Upload Gambar'}
              </Button>
            </Upload>
            {uploadedImageUrl && (
              <div style={{ marginTop: 8 }}>
                <img
                  src={uploadedImageUrl}
                  alt="preview"
                  style={{ maxWidth: 200, maxHeight: 150, borderRadius: 8, border: '1px solid #d9d9d9' }}
                />
              </div>
            )}
          </Form.Item>
          <Form.Item
            name="imageUrl"
            label="Image URL"
            rules={[{ required: true, message: 'Image URL is required' }]}
          >
            <Input placeholder="URL gambar atau hasil upload" />
          </Form.Item>
          <Form.Item name="caption" label="Caption">
            <TextArea rows={3} placeholder="Enter image caption (optional)" />
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
        <Checkbox>Check number before sending</Checkbox>
      </Form.Item>

      <Card size="small" style={{ marginBottom: 24 }}>
        <Space direction="vertical" size={12} style={{ width: '100%' }}>
          <Form.Item name="isScheduled" label="Schedule Campaign" valuePropName="checked" style={{ marginBottom: 0 }}>
            <Switch checkedChildren="Scheduled" unCheckedChildren="Send Now" />
          </Form.Item>

          <Form.Item shouldUpdate noStyle>
            {({ getFieldValue }) => {
              const isScheduled = getFieldValue('isScheduled') === true;

              if (!isScheduled) {
                return (
                  <Alert
                    type="info"
                    showIcon
                    message="Campaign akan dikirim sekarang"
                    description="Aktifkan schedule bila ingin kirim terjadwal atau berulang."
                  />
                );
              }

              const repeater = getFieldValue('timetableRepeater') as ScheduleRepeater | undefined;

              return (
                <>
                  <Form.Item
                    name="timetableRepeater"
                    label="Repeater"
                    rules={[{ required: true, message: 'Pilih pola pengulangan campaign' }]}
                  >
                    <Select placeholder="Pilih pola jadwal">
                      <Option value="ONCE">Once</Option>
                      <Option value="EVERY_DAY">Every Day</Option>
                      <Option value="EVERY_WEEK">Every Week</Option>
                      <Option value="EVERY_MONTH">Every Month</Option>
                    </Select>
                  </Form.Item>

                  <Space wrap>
                    {repeater !== 'EVERY_DAY' && (
                      <Form.Item name="scheduledDate" label="Tanggal Mulai">
                        <DatePicker format="DD/MM/YYYY" />
                      </Form.Item>
                    )}
                    <Form.Item name="scheduledTime" label="Jam Kirim">
                      <TimePicker format="HH:mm" minuteStep={5} />
                    </Form.Item>
                  </Space>
                </>
              );
            }}
          </Form.Item>
        </Space>
      </Card>

      <Form.Item style={{ marginBottom: 0 }}>
        <Button
          type="primary"
          htmlType="submit"
          icon={broadcastType === 'text' ? <SendOutlined /> : <CalendarOutlined />}
          loading={loading}
          size="large"
          block
        >
          Start Broadcast
        </Button>
      </Form.Item>
    </Form>
  );

  const tabItems = [
    {
      key: 'campaigns',
      label: 'Campaigns',
      children: (
        <Card
          bordered={false}
          title="Campaign List"
          extra={(
            <Space>
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={() => setCreateModalVisible(true)}
              >
                Create Broadcast
              </Button>
              <Button icon={<ReloadOutlined />} onClick={fetchCampaigns} loading={loadingCampaigns}>
                Refresh
              </Button>
            </Space>
          )}
        >
          <Table
            columns={campaignColumns}
            dataSource={campaigns}
            rowKey="id"
            loading={loadingCampaigns}
            pagination={{ pageSize: 10 }}
            locale={{ emptyText: 'Belum ada campaign broadcast' }}
          />
        </Card>
      ),
    },
    {
      key: 'history',
      label: 'Local History',
      children: (
        <Table
          columns={historyColumns}
          dataSource={history}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'No local broadcast history yet' }}
        />
      ),
    },
  ];

  return (
    <div>
      <Tabs activeKey={activeTab} onChange={setActiveTab} items={tabItems} />

      <Modal
        title="Create Broadcast"
        open={createModalVisible}
        onCancel={handleCloseCreateModal}
        footer={null}
        width={900}
        destroyOnClose={false}
      >
        {createBroadcastForm}
      </Modal>

      <Modal
        title="Broadcast Result"
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setResultModalVisible(false)}>
            Close
          </Button>,
        ]}
        width={800}
      >
        {broadcastResult && (
          <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              {broadcastResult.status === 'SCHEDULED' ? (
                <Alert
                  type="success"
                  showIcon
                  message="Campaign berhasil dijadwalkan"
                  description={broadcastResult.message || `Campaign ID: ${broadcastResult.campaignId || '-'}`}
                />
              ) : (
                <div>
                  <Title level={5}>Summary</Title>
                  <Space size="large">
                    <Tag color="success">Sent: {broadcastResult.summary?.SENT || 0}</Tag>
                    <Tag color="error">Failed: {broadcastResult.summary?.FAILED || 0}</Tag>
                    <Tag color="warning">Skipped: {broadcastResult.summary?.SKIPPED || 0}</Tag>
                    <Tag>Total: {broadcastResult.total}</Tag>
                  </Space>
                </div>
              )}

              {broadcastResult.campaignId && (
                <Text type="secondary">Campaign ID: {broadcastResult.campaignId}</Text>
              )}

              {broadcastResult.results && broadcastResult.results.length > 0 && (
                <div>
                  <Title level={5}>Details</Title>
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
              )}
            </Space>
          </div>
        )}
      </Modal>

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

export default BroadcastsTab;
