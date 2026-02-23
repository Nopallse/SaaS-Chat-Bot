import { useState, useEffect, useRef } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Modal,
  Form,
  Image,
  Spin,
} from 'antd';
import {
  FilterOutlined,
  DeleteOutlined,
  QrcodeOutlined,
  PlusOutlined,
} from '@ant-design/icons';
import { waApi, type WhatsAppSession } from '../../services/waApi';
import { useNotification } from '@/hooks/useNotification';

const { Search } = Input;

const SessionsTab = () => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [filteredSessions, setFilteredSessions] = useState<WhatsAppSession[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [sessionForm] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const qrPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchSessions();
    return () => {
      if (qrPollIntervalRef.current) {
        clearInterval(qrPollIntervalRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = sessions.filter(
        (s) =>
          s.label?.toLowerCase().includes(searchText.toLowerCase()) ||
          s.meJid?.toLowerCase().includes(searchText.toLowerCase()) ||
          s.id.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredSessions(filtered);
    } else {
      setFilteredSessions(sessions);
    }
  }, [searchText, sessions]);

  const fetchSessions = async () => {
    setFetching(true);
    try {
      const data = await waApi.getSessions();
      setSessions(data);
      setFilteredSessions(data);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal memuat sessions');
    } finally {
      setFetching(false);
    }
  };

  const handleGetQr = async (sessionId: string) => {
    setConnecting(sessionId);
    try {
      const response = await waApi.getQr(sessionId);
      if (response.qr) {
        setQrCode(response.qr);
        setQrModalVisible(true);
        if (!response.connected && !qrPollIntervalRef.current) {
          qrPollIntervalRef.current = setInterval(async () => {
            try {
              const qrResponse = await waApi.getQr(sessionId);
              if (qrResponse.qr) {
                setQrCode(qrResponse.qr);
              } else if (qrResponse.connected) {
                clearInterval(qrPollIntervalRef.current!);
                qrPollIntervalRef.current = null;
                setQrModalVisible(false);
                fetchSessions();
                showSuccess('Session connected!');
              }
            } catch (e) {
              console.error('QR polling error:', e);
            }
          }, 3000);
        }
      } else {
        showError('QR tidak tersedia');
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal mendapatkan QR');
    } finally {
      setConnecting(null);
    }
  };

  const handleConnect = async (sessionId: string) => {
    setConnecting(sessionId);
    try {
      const response = await waApi.connectSession(sessionId);
      if (response.connected) {
        showSuccess('Session connected!');
        setConnecting(null);
        fetchSessions();
      } else {
        // Not connected yet, need QR or wait for connection
        if (response.qr) {
          // QR already available
          setQrCode(response.qr);
          setQrModalVisible(true);
        } else {
          // QR not yet available, show modal and start polling
          setQrModalVisible(true);
          setQrCode(''); // Empty initially, will be updated by polling
        }
        
        // Start polling for QR or connection status
        if (!qrPollIntervalRef.current) {
          qrPollIntervalRef.current = setInterval(async () => {
            try {
              const qrResponse = await waApi.getQr(sessionId);
              if (qrResponse.qr) {
                setQrCode(qrResponse.qr);
              } else if (qrResponse.connected) {
                clearInterval(qrPollIntervalRef.current!);
                qrPollIntervalRef.current = null;
                setQrModalVisible(false);
                setConnecting(null);
                fetchSessions();
                showSuccess('Session connected!');
              }
            } catch (e) {
              console.error('QR polling error:', e);
            }
          }, 3000);
        }
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal connect');
      setConnecting(null);
    }
  };

  const handleLogout = async (sessionId: string) => {
    try {
      await waApi.logoutSession(sessionId);
      showSuccess('Session logged out');
      fetchSessions();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal logout');
    }
  };

  const handleCreateSession = async (values: { label: string }) => {
    try {
      const newId = `session-${Date.now()}`;
      setConnecting(newId);
      
      const response = await waApi.connectSession(newId, values.label?.trim());
      
      setCreateModalVisible(false);
      sessionForm.resetFields();
      
      if (response.connected) {
        // Already connected
        setConnecting(null);
        fetchSessions();
        showSuccess('Session berhasil dibuat dan connected!');
      } else {
        // Not connected yet, need QR or wait for connection
        if (response.qr) {
          // QR already available
          setQrCode(response.qr);
          setQrModalVisible(true);
        } else {
          // QR not yet available, show modal and start polling
          setQrModalVisible(true);
          setQrCode(''); // Empty initially, will be updated by polling
        }
        
        // Start polling for QR or connection status
        if (qrPollIntervalRef.current === null) {
          qrPollIntervalRef.current = setInterval(async () => {
            try {
              const qrResponse = await waApi.getQr(newId);
              if (qrResponse.qr) {
                // QR code available, update it
                setQrCode(qrResponse.qr);
              } else if (qrResponse.connected) {
                // Connected! Stop polling and refresh
                if (qrPollIntervalRef.current) {
                  clearInterval(qrPollIntervalRef.current);
                  qrPollIntervalRef.current = null;
                }
                setQrModalVisible(false);
                setConnecting(null);
                fetchSessions();
                showSuccess('Session berhasil dibuat dan connected!');
              }
            } catch (error) {
              console.error('Error polling QR:', error);
            }
          }, 3000);
        }
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal membuat session');
      setConnecting(null);
    }
  };

  const columns = [
    {
      title: 'ID Session',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <code style={{ fontSize: '12px' }}>{id}</code>,
    },
    {
      title: 'Label',
      dataIndex: 'label',
      key: 'label',
      sorter: (a: WhatsAppSession, b: WhatsAppSession) =>
        (a.label || '').localeCompare(b.label || ''),
      render: (label?: string) => label || <span style={{ color: '#999' }}>No label</span>,
    },
    {
      title: 'Status',
      dataIndex: 'connected',
      key: 'connected',
      sorter: (a: WhatsAppSession, b: WhatsAppSession) =>
        Number(a.connected) - Number(b.connected),
      render: (connected: boolean) => (
        <Tag
          color={connected ? 'success' : 'default'}
          style={{ borderRadius: 4, fontWeight: 500 }}
        >
          {connected ? 'Connected' : 'Disconnected'}
        </Tag>
      ),
    },
    {
      title: 'Phone Number',
      dataIndex: 'meJid',
      key: 'meJid',
      render: (meJid?: string) => meJid ? <code>{meJid}</code> : <span style={{ color: '#999' }}>-</span>,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 280,
      render: (_: any, record: WhatsAppSession) => (
        <Space size={8}>
          <Button
            size="small"
            icon={<QrcodeOutlined />}
            onClick={() => handleGetQr(record.id)}
            disabled={record.connected || connecting === record.id}
            loading={connecting === record.id}
          >
            Get QR
          </Button>
          <Button
            size="small"
            type="primary"
            onClick={() => handleConnect(record.id)}
            disabled={record.connected || connecting === record.id}
            loading={connecting === record.id}
          >
            Connect
          </Button>
          <Button
            size="small"
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleLogout(record.id)}
            disabled={connecting === record.id}
          >
            Logout
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Search
          placeholder="Search sessions..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          suffix={
            <span style={{ color: '#bbb', fontSize: 12 }}>
              <span style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>⌘</span>{' '}
              <span style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>S</span>
            </span>
          }
        />
        <Space>
          <Button icon={<FilterOutlined />}>Filter</Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setCreateModalVisible(true)}
          >
            Add Session
          </Button>
        </Space>
      </div>

      <Table
        columns={columns}
        dataSource={filteredSessions}
        rowKey="id"
        loading={fetching}
        pagination={{ pageSize: 10 }}
        style={{
          background: '#fff',
          borderRadius: 8,
        }}
      />

      {/* QR Modal */}
      <Modal
        title="Scan QR Code"
        open={qrModalVisible}
        onCancel={() => {
          setQrModalVisible(false);
          setConnecting(null);
          if (qrPollIntervalRef.current) {
            clearInterval(qrPollIntervalRef.current);
            qrPollIntervalRef.current = null;
          }
        }}
        footer={null}
        centered
      >
        {qrCode ? (
          <div style={{ textAlign: 'center' }}>
            <Image src={qrCode} alt="QR Code" preview={false} width={256} />
            <p style={{ marginTop: 16, color: '#666' }}>
              Scan QR code with WhatsApp on your phone
            </p>
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
            <p style={{ marginTop: 16, color: '#666' }}>Loading QR code...</p>
          </div>
        )}
      </Modal>

      {/* Create Session Modal */}
      <Modal
        title="Create New Session"
        open={createModalVisible}
        onCancel={() => !connecting && setCreateModalVisible(false)}
        onOk={() => sessionForm.submit()}
        confirmLoading={!!connecting}
        okText="Create & Connect"
      >
        <Form form={sessionForm} layout="vertical" onFinish={handleCreateSession}>
          <Form.Item
            name="label"
            label="Session Label"
            rules={[{ required: true, message: 'Label required' }]}
          >
            <Input placeholder="e.g. iPhone 14 Pro" disabled={!!connecting} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default SessionsTab;
