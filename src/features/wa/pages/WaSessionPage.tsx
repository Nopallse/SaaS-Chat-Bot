import { useState, useEffect, useRef } from 'react';
import { App, Card, Button, Input, Space, Table, Tag, Modal, Form, Image, Typography } from 'antd';
import { PlusOutlined, QrcodeOutlined, DisconnectOutlined, ReloadOutlined } from '@ant-design/icons';
import { waApi, type WhatsAppSession } from '../services/waApi';
import { useNotification } from '@/hooks/useNotification';

const { Title } = Typography;

const WaSessionPage = () => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [fetching, setFetching] = useState(true);
  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState('');
  const [connecting, setConnecting] = useState<string | null>(null);
  const [sessionForm] = Form.useForm();
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const qrPollIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const { modal } = App.useApp();
  const { showSuccess, showError } = useNotification();

  // Fetch sessions on mount
  useEffect(() => {
    fetchSessions();
  }, []);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (qrPollIntervalRef.current) {
        clearInterval(qrPollIntervalRef.current);
      }
    };
  }, []);

  const clearQrPolling = () => {
    if (qrPollIntervalRef.current) {
      clearInterval(qrPollIntervalRef.current);
      qrPollIntervalRef.current = null;
    }
  };

  const fetchSessions = async () => {
    setFetching(true);
    try {
      const data = await waApi.getSessions();
      setSessions(data);
    } catch (error: any) {
      const message = error.response?.data?.message || 'Gagal memuat sessions';
      showError(message);
    } finally {
      setFetching(false);
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
      render: (label?: string) => label || <span style={{ color: '#999' }}>No label</span>,
    },
    {
      title: 'Status',
      dataIndex: 'connected',
      key: 'connected',
      render: (connected: boolean) => (
        <Tag color={connected ? 'success' : 'default'}>
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
      render: (_: any, record: WhatsAppSession) => (
        <Space>
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
            icon={<DisconnectOutlined />}
            onClick={() => handleLogout(record.id)}
            disabled={connecting === record.id}
          >
            Logout
          </Button>
        </Space>
      ),
    },
  ];

  const handleGetQr = async (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setConnecting(sessionId);
    try {
      const response = await waApi.getQr(sessionId);
      if (response.qr) {
        setQrCode(response.qr);
        setQrModalVisible(true);
        
        // Start polling for QR updates if not connected
        if (!response.connected && qrPollIntervalRef.current === null) {
          qrPollIntervalRef.current = setInterval(async () => {
            try {
              const qrResponse = await waApi.getQr(sessionId);
              if (qrResponse.qr) {
                setQrCode(qrResponse.qr);
              } else if (qrResponse.connected) {
                // Connected! Stop polling and refresh sessions
                if (qrPollIntervalRef.current) {
                  clearInterval(qrPollIntervalRef.current);
                  qrPollIntervalRef.current = null;
                }
                setQrModalVisible(false);
                fetchSessions();
                showSuccess('Session connected successfully!');
              }
            } catch (error) {
              console.error('Error polling QR:', error);
            }
          }, 3000); // Poll every 3 seconds
        }
      } else {
        showError('QR code tidak tersedia. Session mungkin sudah connected atau belum di-initialize.');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mendapatkan QR code';
      showError(msg);
    } finally {
      setConnecting(null);
    }
  };

  const handleConnect = async (sessionId: string) => {
    setConnecting(sessionId);
    try {
      const response = await waApi.connectSession(sessionId);
      
      if (response.connected) {
        // Already connected
        showSuccess('Session sudah connected!');
        fetchSessions();
      } else {
        // Not connected yet, need QR or wait for connection
        setCurrentSessionId(sessionId);
        
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
              const qrResponse = await waApi.getQr(sessionId);
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
                fetchSessions();
                showSuccess('Session connected successfully!');
              }
              // If qr is still null and not connected, keep polling
            } catch (error) {
              console.error('Error polling QR:', error);
              // Continue polling even on error
            }
          }, 3000);
        }
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal connect session';
      showError(msg);
      setConnecting(null);
    }
  };

  const handleLogout = async (sessionId: string) => {
    modal.confirm({
      title: 'Logout dari WhatsApp?',
      content: 'Apakah Anda yakin ingin logout dari session ini?',
      okText: 'Ya, Logout',
      cancelText: 'Batal',
      onOk: async () => {
        try {
          await waApi.logoutSession(sessionId);
          showSuccess('Logout berhasil!');
          if (currentSessionId === sessionId) {
            clearQrPolling();
            setQrModalVisible(false);
            setCurrentSessionId(null);
            setConnecting(null);
          }
          fetchSessions();
        } catch (error: any) {
          const msg = error.response?.data?.message || 'Gagal logout';
          showError(msg);
        }
      },
    });
  };

  const handleCreateSession = async () => {
    try {
      const values = await sessionForm.validateFields();
      // Generate session ID if not provided
      const sessionId = values.sessionId?.trim() || `session-${Date.now()}`;
      
      // Connect session with label
      setConnecting(sessionId);
      const response = await waApi.connectSession(sessionId, values.label?.trim());
      
      setCreateModalVisible(false);
      sessionForm.resetFields();
      
      if (response.connected) {
        // Already connected
        setConnecting(null);
        fetchSessions();
        showSuccess('Session berhasil dibuat dan connected!');
      } else {
        // Not connected yet, need QR or wait for connection
        setCurrentSessionId(sessionId);
        
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
              const qrResponse = await waApi.getQr(sessionId);
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
              // If qr is still null and not connected, keep polling
            } catch (error) {
              console.error('Error polling QR:', error);
              // Continue polling even on error
            }
          }, 3000);
        }
      }
    } catch (error: any) {
      if (error.errorFields) {
        // Form validation error
        setConnecting(null);
        return;
      }
      const msg = error.response?.data?.message || 'Gagal membuat session';
      showError(msg);
      setConnecting(null);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>WhatsApp Sessions</Title>
      
      <Card
        extra={
          <Space>
            <Button icon={<ReloadOutlined />} onClick={fetchSessions} loading={fetching}>
              Refresh
            </Button>
            <Button type="primary" icon={<PlusOutlined />} onClick={() => setCreateModalVisible(true)}>
              Buat Session
            </Button>
          </Space>
        }
        style={{ marginTop: '16px' }}
      >
        <Table
          columns={columns}
          dataSource={sessions}
          loading={fetching}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: 'Belum ada session. Klik "Buat Session" untuk membuat session baru.' }}
        />
      </Card>

      {/* Create Session Modal */}
      <Modal
        title="Buat Session Baru"
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          sessionForm.resetFields();
        }}
        onOk={handleCreateSession}
        okText="Buat & Connect"
        cancelText="Batal"
        confirmLoading={connecting !== null}
      >
        <Form
          form={sessionForm}
          layout="vertical"
        >
          <Form.Item
            label="Session ID (Opsional)"
            name="sessionId"
            rules={[
              { min: 3, message: 'Session ID minimal 3 karakter!' },
            ]}
            tooltip="Session ID unik untuk session ini. Kosongkan untuk auto-generate."
          >
            <Input placeholder="session-1 (kosongkan untuk auto-generate)" />
          </Form.Item>
          <Form.Item
            label="Label (Opsional)"
            name="label"
          >
            <Input placeholder="Nama session (contoh: WA Utama)" />
          </Form.Item>
        </Form>
      </Modal>

      {/* QR Code Modal */}
      <Modal
        title="Scan QR Code dengan WhatsApp"
        open={qrModalVisible}
        onCancel={() => {
          setQrModalVisible(false);
          setCurrentSessionId(null);
          setConnecting(null);
          clearQrPolling();
        }}
        footer={[
          <Button key="refresh" onClick={() => currentSessionId && handleGetQr(currentSessionId)}>
            Refresh QR
          </Button>,
          <Button key="close" onClick={() => {
            setQrModalVisible(false);
            setCurrentSessionId(null);
            setConnecting(null);
            clearQrPolling();
          }}>
            Tutup
          </Button>,
        ]}
        width={400}
      >
        <div style={{ textAlign: 'center', padding: '20px' }}>
          {qrCode ? (
            <>
              <Image src={qrCode} alt="QR Code" preview={false} style={{ maxWidth: '100%' }} />
              <p style={{ marginTop: 16, color: '#666' }}>
                Buka WhatsApp di HP Anda, pilih Menu → Linked Devices → Link a Device,
                lalu scan QR code di atas.
              </p>
              <p style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                QR code akan otomatis refresh setiap 3 detik...
              </p>
            </>
          ) : (
            <>
              <div style={{ padding: '40px 20px' }}>
                <p>Menunggu QR code...</p>
                <p style={{ marginTop: 8, fontSize: '12px', color: '#999' }}>
                  Session sedang di-initialize, mohon tunggu sebentar.
                </p>
              </div>
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default WaSessionPage;

