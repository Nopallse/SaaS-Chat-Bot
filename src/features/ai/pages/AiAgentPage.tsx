import { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Select,
  Space,
  Tag,
  Typography,
  Switch,
  Upload,
  Table,
  Empty,
  Spin,
  Tooltip,
  Modal,
  Alert,
} from 'antd';
import {
  RobotOutlined,
  UserOutlined,
  UploadOutlined,
  PlusOutlined,
  FileTextOutlined,
  SettingOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  CloseCircleOutlined,
  InfoCircleOutlined,
} from '@ant-design/icons';
import { waApi, type WhatsAppSession } from '@/features/wa/services/waApi';
import { aiApi, type AiAgent } from '../services/aiApi';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

const AiAgentPage = () => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [fetchingSessions, setFetchingSessions] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    setFetchingSessions(true);
    try {
      const data = await waApi.getSessions();
      setSessions(data);
      await fetchAgentsBySessions(data);
    } catch {
      showError('Gagal memuat sessions');
    } finally {
      setFetchingSessions(false);
    }
  };

  const fetchAgentsBySessions = async (sessionList: WhatsAppSession[]) => {
    if (sessionList.length === 0) {
      setAgents([]);
      return;
    }

    const results = await Promise.allSettled(
      sessionList.map((session) => aiApi.getAgent(session.id)),
    );

    const loadedAgents: AiAgent[] = results.flatMap((result) => {
      if (result.status === 'fulfilled' && result.value) {
        return [result.value];
      }
      return [];
    });

    setAgents(loadedAgents);
  };

  const handleCreateAgent = async (values: any) => {
    if (!user?.id) {
      showError('User tidak ditemukan');
      return;
    }

    setCreating(true);
    try {
      const agent = await aiApi.createAgent({
        sessionId: values.sessionId,
        ownerId: user.id,
        name: values.name,
        isEnabled: values.isEnabled ?? true,
      });
      setAgents((prev) => [...prev, agent]);
      showSuccess(`Agent "${agent.name}" berhasil dibuat!`);
      setCreateModalVisible(false);
      form.resetFields();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal membuat agent';
      showError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleSwitchMode = async (agentId: string, currentMode: 'BOT' | 'HUMAN') => {
    const newMode = currentMode === 'BOT' ? 'HUMAN' : 'BOT';
    try {
      const updated = await aiApi.switchMode(agentId, newMode);
      setAgents((prev) =>
        prev.map((a) => (a.id === agentId ? { ...a, mode: updated.mode } : a)),
      );
      showSuccess(`Mode berhasil diubah ke ${newMode}`);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengubah mode';
      showError(msg);
    }
  };

  const handleUploadKnowledge = async (agentId: string, file: File) => {
    setUploading(true);
    try {
      await aiApi.uploadKnowledge(agentId, file);
      showSuccess(`File "${file.name}" berhasil diupload dan sedang diproses`);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengupload file';
      showError(msg);
    } finally {
      setUploading(false);
    }
  };

  const getSessionLabel = (sessionId?: string) => {
    if (!sessionId) return '-';
    const session = sessions.find((s) => s.id === sessionId);
    if (!session) return sessionId.slice(0, 12);
    return session.label || sessionId.slice(0, 12);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'READY':
        return <CheckCircleOutlined style={{ color: '#52c41a' }} />;
      case 'PROCESSING':
        return <ClockCircleOutlined style={{ color: '#faad14' }} />;
      case 'FAILED':
        return <CloseCircleOutlined style={{ color: '#ff4d4f' }} />;
      default:
        return null;
    }
  };

  const knowledgeColumns = [
    {
      title: 'File',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (name: string) => (
        <Space>
          <FileTextOutlined />
          <Text>{name}</Text>
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const color = status === 'READY' ? 'success' : status === 'PROCESSING' ? 'warning' : 'error';
        return (
          <Tag icon={getStatusIcon(status)} color={color}>
            {status}
          </Tag>
        );
      },
    },
    {
      title: 'Upload',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
    },
  ];

  // Get sessions that don't have an agent yet
  const availableSessions = sessions.filter(
    (s) => !agents.some((a) => a.sessionId && a.sessionId === s.id),
  );

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <Title level={2} style={{ margin: 0 }}>
            <RobotOutlined style={{ marginRight: 8 }} />
            AI Agent
          </Title>
          <Text type="secondary">
            Kelola AI agent untuk auto-reply pesan WhatsApp
          </Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => setCreateModalVisible(true)}
          size="large"
        >
          Buat Agent Baru
        </Button>
      </div>

      <Alert
        message="Cara Kerja AI Agent"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>Mode BOT:</strong> Agent akan otomatis membalas pesan masuk menggunakan AI</li>
            <li><strong>Mode HUMAN:</strong> Agent dinonaktifkan, semua pesan dijawab manual oleh operator</li>
            <li><strong>Knowledge:</strong> Upload PDF untuk memberikan konteks/pengetahuan tambahan kepada AI</li>
          </ul>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
        closable
      />

      {fetchingSessions ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : agents.length === 0 ? (
        <Card>
          <Empty
            image={<RobotOutlined style={{ fontSize: 64, color: '#d9d9d9' }} />}
            description={
              <Space direction="vertical" align="center">
                <Text type="secondary">Belum ada AI Agent</Text>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  Buat agent baru untuk mengaktifkan auto-reply di session WhatsApp
                </Text>
              </Space>
            }
          >
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setCreateModalVisible(true)}
            >
              Buat Agent Pertama
            </Button>
          </Empty>
        </Card>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {agents.map((agent) => (
            <Card
              key={agent.id}
              title={
                <Space>
                  <RobotOutlined style={{ color: '#1677ff' }} />
                  <span>{agent.name}</span>
                  <Tag color={agent.isEnabled ? 'green' : 'default'}>
                    {agent.isEnabled ? 'Aktif' : 'Nonaktif'}
                  </Tag>
                </Space>
              }
              extra={
                <Space>
                  <Tooltip title={`Saat ini: ${agent.mode}. Klik untuk switch.`}>
                    <Button
                      type={agent.mode === 'BOT' ? 'primary' : 'default'}
                      icon={agent.mode === 'BOT' ? <RobotOutlined /> : <UserOutlined />}
                      onClick={() => handleSwitchMode(agent.id, agent.mode)}
                    >
                      {agent.mode === 'BOT' ? 'Mode: BOT' : 'Mode: HUMAN'}
                    </Button>
                  </Tooltip>
                </Space>
              }
            >
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                {/* Left: Agent Info */}
                <div>
                  <Title level={5}>
                    <SettingOutlined style={{ marginRight: 4 }} />
                    Konfigurasi
                  </Title>
                  <Space direction="vertical" style={{ width: '100%' }} size="small">
                    <div>
                      <Text type="secondary">Session: </Text>
                      <Tag>{getSessionLabel(agent.sessionId)}</Tag>
                    </div>
                    <div>
                      <Text type="secondary">Model: </Text>
                      <Tag color="blue">{agent.model}</Tag>
                    </div>
                    <div>
                      <Text type="secondary">Temperature: </Text>
                      <Text>{agent.temperature}</Text>
                    </div>
                    <div>
                      <Text type="secondary">Max Tokens: </Text>
                      <Text>{agent.maxTokens}</Text>
                    </div>
                    {agent.systemPrompt && (
                      <div>
                        <Text type="secondary">System Prompt:</Text>
                        <Paragraph
                          ellipsis={{ rows: 2, expandable: true }}
                          style={{ marginTop: 4, marginBottom: 0, background: '#f5f5f5', padding: 8, borderRadius: 4 }}
                        >
                          {agent.systemPrompt}
                        </Paragraph>
                      </div>
                    )}
                    {agent.fallbackReply && (
                      <div>
                        <Text type="secondary">Fallback Reply:</Text>
                        <Paragraph
                          style={{ marginTop: 4, marginBottom: 0, background: '#fff7e6', padding: 8, borderRadius: 4 }}
                        >
                          {agent.fallbackReply}
                        </Paragraph>
                      </div>
                    )}
                  </Space>
                </div>

                {/* Right: Knowledge Files */}
                <div>
                  <Title level={5}>
                    <FileTextOutlined style={{ marginRight: 4 }} />
                    Knowledge Base
                  </Title>

                  {agent.knowledgeFiles && agent.knowledgeFiles.length > 0 ? (
                    <Table
                      columns={knowledgeColumns}
                      dataSource={agent.knowledgeFiles}
                      rowKey="id"
                      size="small"
                      pagination={false}
                    />
                  ) : (
                    <Empty
                      image={Empty.PRESENTED_IMAGE_SIMPLE}
                      description="Belum ada knowledge file"
                      style={{ margin: '16px 0' }}
                    />
                  )}

                  <Upload
                    accept=".pdf"
                    showUploadList={false}
                    beforeUpload={(file) => {
                      handleUploadKnowledge(agent.id, file);
                      return false; // prevent default upload
                    }}
                  >
                    <Button
                      icon={<UploadOutlined />}
                      loading={uploading}
                      style={{ marginTop: 8 }}
                      block
                    >
                      Upload PDF Knowledge
                    </Button>
                  </Upload>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Agent Modal */}
      <Modal
        title={
          <Space>
            <RobotOutlined />
            <span>Buat AI Agent Baru</span>
          </Space>
        }
        open={createModalVisible}
        onCancel={() => {
          setCreateModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleCreateAgent}
          initialValues={{ isEnabled: true }}
        >
          <Form.Item
            name="name"
            label="Nama Agent"
            rules={[{ required: true, message: 'Nama agent wajib diisi!' }]}
          >
            <Input placeholder="Contoh: CS Bot, Sales Assistant" prefix={<RobotOutlined />} />
          </Form.Item>

          <Form.Item
            name="sessionId"
            label="WhatsApp Session"
            rules={[{ required: true, message: 'Session wajib dipilih!' }]}
            tooltip="Agent akan membalas pesan di session ini"
          >
            <Select
              placeholder="Pilih session WhatsApp"
              loading={fetchingSessions}
              showSearch
              filterOption={(input, option) =>
                String(option?.label ?? '').toLowerCase().includes(input.toLowerCase())
              }
            >
              {availableSessions.map((session) => (
                <Option key={session.id} value={session.id} label={session.label || session.id}>
                  <Space>
                    <Tag color={session.connected ? 'green' : 'default'} style={{ fontSize: 10 }}>
                      {session.connected ? 'Online' : 'Offline'}
                    </Tag>
                    {session.label || session.id.slice(0, 16)}
                    {session.meJid && (
                      <Text type="secondary" style={{ fontSize: 11 }}>
                        ({session.meJid})
                      </Text>
                    )}
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item name="isEnabled" label="Aktifkan Agent" valuePropName="checked">
            <Switch checkedChildren="Aktif" unCheckedChildren="Nonaktif" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCreateModalVisible(false)}>Batal</Button>
              <Button type="primary" htmlType="submit" loading={creating} icon={<PlusOutlined />}>
                Buat Agent
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AiAgentPage;
