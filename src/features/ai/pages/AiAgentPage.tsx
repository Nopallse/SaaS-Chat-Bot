import { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Form,
  Input,
  InputNumber,
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
  Popconfirm,
  Slider,
  Divider,
  Descriptions,
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
  EditOutlined,
  DeleteOutlined,
  PoweroffOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { waApi, type WhatsAppSession } from '@/features/wa/services/waApi';
import { aiApi, type AiAgent, type AiKnowledgeFile } from '../services/aiApi';
import { useAuth } from '@/hooks/useAuth';
import { useNotification } from '@/hooks/useNotification';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;
const { TextArea } = Input;

const MODEL_OPTIONS = [
  { label: 'GPT-4o Mini', value: 'gpt-4o-mini' },
  { label: 'GPT-4o', value: 'gpt-4o' },
  { label: 'GPT-4 Turbo', value: 'gpt-4-turbo' },
  { label: 'GPT-3.5 Turbo', value: 'gpt-3.5-turbo' },
  { label: 'Gemini 2.5 Flash', value: 'gemini-2.5-flash' },
];

const AiAgentPage = () => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [agents, setAgents] = useState<AiAgent[]>([]);
  const [creating, setCreating] = useState(false);
  const [uploading, setUploading] = useState<string | null>(null);
  const [fetchingSessions, setFetchingSessions] = useState(true);
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AiAgent | null>(null);
  const [saving, setSaving] = useState(false);
  const [knowledgeMap, setKnowledgeMap] = useState<Record<string, AiKnowledgeFile[]>>({});
  const [loadingKnowledge, setLoadingKnowledge] = useState<Record<string, boolean>>({});

  const [createForm] = Form.useForm();
  const [editForm] = Form.useForm();
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

    // Fetch knowledge for each agent
    loadedAgents.forEach((agent) => {
      fetchKnowledge(agent.id);
    });
  };

  const fetchKnowledge = useCallback(async (agentId: string) => {
    setLoadingKnowledge((prev) => ({ ...prev, [agentId]: true }));
    try {
      const files = await aiApi.getKnowledge(agentId);
      setKnowledgeMap((prev) => ({ ...prev, [agentId]: files }));
    } catch {
      // silent fail, knowledge might be in agent data
    } finally {
      setLoadingKnowledge((prev) => ({ ...prev, [agentId]: false }));
    }
  }, []);

  // ---- CREATE ----
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
      fetchKnowledge(agent.id);
      showSuccess(`Agent "${agent.name}" berhasil dibuat!`);
      setCreateModalVisible(false);
      createForm.resetFields();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal membuat agent';
      showError(msg);
    } finally {
      setCreating(false);
    }
  };

  // ---- EDIT / UPDATE ----
  const openEditModal = (agent: AiAgent) => {
    setEditingAgent(agent);
    editForm.setFieldsValue({
      name: agent.name,
      model: agent.model,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      systemPrompt: agent.systemPrompt || '',
      fallbackReply: agent.fallbackReply || '',
    });
    setEditModalVisible(true);
  };

  const handleUpdateAgent = async (values: any) => {
    if (!editingAgent) return;
    setSaving(true);
    try {
      const updated = await aiApi.updateAgent(editingAgent.id, {
        name: values.name,
        model: values.model,
        temperature: values.temperature,
        maxTokens: values.maxTokens,
        systemPrompt: values.systemPrompt || null,
        fallbackReply: values.fallbackReply || null,
      });
      setAgents((prev) => prev.map((a) => (a.id === editingAgent.id ? updated : a)));
      showSuccess('Agent berhasil diupdate!');
      setEditModalVisible(false);
      setEditingAgent(null);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengupdate agent';
      showError(msg);
    } finally {
      setSaving(false);
    }
  };

  // ---- TOGGLE ENABLED ----
  const handleToggleEnabled = async (agent: AiAgent) => {
    try {
      const updated = await aiApi.toggleEnabled(agent.id);
      setAgents((prev) =>
        prev.map((a) => (a.id === agent.id ? { ...a, isEnabled: updated.isEnabled } : a)),
      );
      showSuccess(updated.isEnabled ? 'Agent diaktifkan' : 'Agent dinonaktifkan');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengubah status agent';
      showError(msg);
    }
  };

  // ---- SWITCH MODE ----
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

  // ---- UPLOAD KNOWLEDGE ----
  const handleUploadKnowledge = async (agentId: string, file: File) => {
    setUploading(agentId);
    try {
      const result = await aiApi.uploadKnowledge(agentId, file);
      if (result.success) {
        showSuccess(`File "${file.name}" berhasil diupload dan sedang diproses`);
        await fetchKnowledge(agentId);
      } else {
        showError('Upload gagal, silakan coba lagi');
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengupload file';
      showError(msg);
    } finally {
      setUploading(null);
    }
  };

  // ---- DELETE KNOWLEDGE ----
  const handleDeleteKnowledge = async (agentId: string, fileId: string, fileName: string) => {
    try {
      await aiApi.deleteKnowledge(agentId, fileId);
      showSuccess(`File "${fileName}" berhasil dihapus`);
      await fetchKnowledge(agentId);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal menghapus file';
      showError(msg);
    }
  };

  // ---- HELPERS ----
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

  const getKnowledgeFiles = (agent: AiAgent): AiKnowledgeFile[] => {
    return knowledgeMap[agent.id] ?? agent.knowledgeFiles ?? [];
  };

  const availableSessions = sessions.filter(
    (s) => !agents.some((a) => a.sessionId && a.sessionId === s.id),
  );

  // ---- KNOWLEDGE TABLE COLUMNS ----
  const getKnowledgeColumns = (agentId: string) => [
    {
      title: 'File',
      dataIndex: 'fileName',
      key: 'fileName',
      render: (name: string, record: AiKnowledgeFile) => (
        <Space>
          <FileTextOutlined />
          {record.fileUrl && record.fileUrl !== 'TEMP_URL' ? (
            <a href={record.fileUrl} target="_blank" rel="noopener noreferrer">
              {name}
            </a>
          ) : (
            <Text>{name}</Text>
          )}
        </Space>
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 130,
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
      width: 120,
      render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
    },
    {
      title: 'Aksi',
      key: 'actions',
      width: 80,
      render: (_: any, record: AiKnowledgeFile) => (
        <Popconfirm
          title="Hapus file ini?"
          description="Embeddings terkait juga akan dihapus."
          onConfirm={() => handleDeleteKnowledge(agentId, record.id, record.fileName)}
          okText="Hapus"
          cancelText="Batal"
          okButtonProps={{ danger: true }}
        >
          <Button type="text" danger icon={<DeleteOutlined />} size="small" />
        </Popconfirm>
      ),
    },
  ];

  // ---- RENDER ----
  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
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

      {/* Info */}
      <Alert
        message="Cara Kerja AI Agent"
        description={
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li><strong>Mode BOT:</strong> Agent akan otomatis membalas pesan masuk menggunakan AI + RAG knowledge</li>
            <li><strong>Mode HUMAN:</strong> Agent dinonaktifkan, semua pesan dijawab manual oleh operator</li>
            <li><strong>Knowledge:</strong> Upload PDF untuk memberikan konteks/pengetahuan tambahan kepada AI</li>
            <li><strong>System Prompt:</strong> Instruksi dasar untuk mengatur perilaku dan persona AI</li>
            <li><strong>Fallback Reply:</strong> Balasan otomatis jika AI gagal menjawab</li>
          </ul>
        }
        type="info"
        showIcon
        icon={<InfoCircleOutlined />}
        style={{ marginBottom: 24 }}
        closable
      />

      {/* Content */}
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
          {agents.map((agent) => {
            const knowledgeFiles = getKnowledgeFiles(agent);
            const isUploading = uploading === agent.id;
            const isKnowledgeLoading = loadingKnowledge[agent.id] ?? false;

            return (
              <Card
                key={agent.id}
                title={
                  <Space>
                    <RobotOutlined style={{ color: '#1677ff' }} />
                    <span>{agent.name}</span>
                    <Tag color={agent.isEnabled ? 'green' : 'default'}>
                      {agent.isEnabled ? 'Aktif' : 'Nonaktif'}
                    </Tag>
                    <Tag color="blue">{agent.model}</Tag>
                  </Space>
                }
                extra={
                  <Space>
                    <Tooltip title={agent.isEnabled ? 'Nonaktifkan agent' : 'Aktifkan agent'}>
                      <Switch
                        checked={agent.isEnabled}
                        onChange={() => handleToggleEnabled(agent)}
                        checkedChildren={<PoweroffOutlined />}
                        unCheckedChildren={<PoweroffOutlined />}
                      />
                    </Tooltip>
                    <Tooltip title={`Saat ini: ${agent.mode}. Klik untuk switch.`}>
                      <Button
                        type={agent.mode === 'BOT' ? 'primary' : 'default'}
                        icon={agent.mode === 'BOT' ? <RobotOutlined /> : <UserOutlined />}
                        onClick={() => handleSwitchMode(agent.id, agent.mode)}
                      >
                        {agent.mode === 'BOT' ? 'Mode: BOT' : 'Mode: HUMAN'}
                      </Button>
                    </Tooltip>
                    <Tooltip title="Edit konfigurasi agent">
                      <Button icon={<EditOutlined />} onClick={() => openEditModal(agent)}>
                        Edit
                      </Button>
                    </Tooltip>
                  </Space>
                }
              >
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                  {/* Left: Agent Config */}
                  <div>
                    <Title level={5} style={{ marginTop: 0 }}>
                      <SettingOutlined style={{ marginRight: 4 }} />
                      Konfigurasi
                    </Title>
                    <Descriptions column={1} size="small" bordered>
                      <Descriptions.Item label="Session">
                        <Tag>{getSessionLabel(agent.sessionId)}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Model">
                        <Tag color="blue">{agent.model}</Tag>
                      </Descriptions.Item>
                      <Descriptions.Item label="Temperature">
                        {agent.temperature}
                      </Descriptions.Item>
                      <Descriptions.Item label="Max Tokens">
                        {agent.maxTokens}
                      </Descriptions.Item>
                    </Descriptions>

                    {agent.systemPrompt && (
                      <div style={{ marginTop: 12 }}>
                        <Text type="secondary" strong>System Prompt:</Text>
                        <Paragraph
                          ellipsis={{ rows: 3, expandable: true, symbol: 'Selengkapnya' }}
                          style={{
                            marginTop: 4,
                            marginBottom: 0,
                            background: '#f5f5f5',
                            padding: 8,
                            borderRadius: 4,
                            fontSize: 13,
                          }}
                        >
                          {agent.systemPrompt}
                        </Paragraph>
                      </div>
                    )}

                    {agent.fallbackReply && (
                      <div style={{ marginTop: 12 }}>
                        <Text type="secondary" strong>Fallback Reply:</Text>
                        <Paragraph
                          style={{
                            marginTop: 4,
                            marginBottom: 0,
                            background: '#fff7e6',
                            padding: 8,
                            borderRadius: 4,
                            fontSize: 13,
                          }}
                        >
                          {agent.fallbackReply}
                        </Paragraph>
                      </div>
                    )}

                    {!agent.systemPrompt && !agent.fallbackReply && (
                      <Alert
                        message="Belum ada system prompt dan fallback reply"
                        description="Klik Edit untuk mengatur prompt dan perilaku AI."
                        type="warning"
                        showIcon
                        style={{ marginTop: 12 }}
                      />
                    )}
                  </div>

                  {/* Right: Knowledge Files */}
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Title level={5} style={{ marginTop: 0 }}>
                        <FileTextOutlined style={{ marginRight: 4 }} />
                        Knowledge Base ({knowledgeFiles.length})
                      </Title>
                      <Tooltip title="Refresh knowledge files">
                        <Button
                          type="text"
                          icon={<ReloadOutlined />}
                          size="small"
                          loading={isKnowledgeLoading}
                          onClick={() => fetchKnowledge(agent.id)}
                        />
                      </Tooltip>
                    </div>

                    {knowledgeFiles.length > 0 ? (
                      <Table
                        columns={getKnowledgeColumns(agent.id)}
                        dataSource={knowledgeFiles}
                        rowKey="id"
                        size="small"
                        pagination={false}
                        loading={isKnowledgeLoading}
                        style={{ marginBottom: 8 }}
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
                        return false;
                      }}
                    >
                      <Button
                        icon={<UploadOutlined />}
                        loading={isUploading}
                        style={{ marginTop: 8 }}
                        block
                      >
                        Upload PDF Knowledge
                      </Button>
                    </Upload>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* ==================== CREATE AGENT MODAL ==================== */}
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
          createForm.resetFields();
        }}
        footer={null}
        width={500}
      >
        <Form
          form={createForm}
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

      {/* ==================== EDIT AGENT MODAL ==================== */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            <span>Edit Agent: {editingAgent?.name}</span>
          </Space>
        }
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingAgent(null);
          editForm.resetFields();
        }}
        footer={null}
        width={600}
        destroyOnClose
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleUpdateAgent}
        >
          <Form.Item
            name="name"
            label="Nama Agent"
            rules={[{ required: true, message: 'Nama agent wajib diisi!' }]}
          >
            <Input placeholder="Nama agent" prefix={<RobotOutlined />} />
          </Form.Item>

          <Form.Item
            name="model"
            label="AI Model"
            rules={[{ required: true, message: 'Model wajib dipilih!' }]}
          >
            <Select placeholder="Pilih model AI">
              {MODEL_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  {opt.label}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              name="temperature"
              label={
                <Tooltip title="Semakin tinggi, semakin kreatif/random. Semakin rendah, semakin konsisten/deterministik.">
                  <Space>
                    Temperature
                    <InfoCircleOutlined style={{ color: '#999' }} />
                  </Space>
                </Tooltip>
              }
              rules={[{ required: true, message: 'Temperature wajib diisi!' }]}
            >
              <Slider min={0} max={2} step={0.1} marks={{ 0: '0', 0.7: '0.7', 1: '1', 2: '2' }} />
            </Form.Item>

            <Form.Item
              name="maxTokens"
              label={
                <Tooltip title="Panjang maksimum respon AI dalam token (~1 token = 4 karakter)">
                  <Space>
                    Max Tokens
                    <InfoCircleOutlined style={{ color: '#999' }} />
                  </Space>
                </Tooltip>
              }
              rules={[{ required: true, message: 'Max tokens wajib diisi!' }]}
            >
              <InputNumber min={50} max={4096} step={50} style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            name="systemPrompt"
            label={
              <Tooltip title="Instruksi awal untuk AI. Tentukan persona, batasan, dan cara AI menjawab.">
                <Space>
                  System Prompt
                  <InfoCircleOutlined style={{ color: '#999' }} />
                </Space>
              </Tooltip>
            }
          >
            <TextArea
              rows={5}
              placeholder="Contoh: Kamu adalah customer service toko online bernama TokoKu. Jawab dengan bahasa Indonesia yang ramah dan sopan. Jangan menjawab pertanyaan di luar konteks toko."
              showCount
              maxLength={2000}
            />
          </Form.Item>

          <Form.Item
            name="fallbackReply"
            label={
              <Tooltip title="Balasan otomatis jika AI gagal menjawab atau terjadi error.">
                <Space>
                  Fallback Reply
                  <InfoCircleOutlined style={{ color: '#999' }} />
                </Space>
              </Tooltip>
            }
          >
            <TextArea
              rows={2}
              placeholder="Contoh: Maaf, saya tidak bisa menjawab pertanyaan itu. Silakan hubungi admin kami."
              showCount
              maxLength={500}
            />
          </Form.Item>

          <Divider />

          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setEditModalVisible(false)}>Batal</Button>
              <Button type="primary" htmlType="submit" loading={saving} icon={<CheckCircleOutlined />}>
                Simpan Perubahan
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AiAgentPage;
