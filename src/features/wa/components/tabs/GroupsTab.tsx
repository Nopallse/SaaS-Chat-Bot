import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Tag,
  Space,
  Input,
  Avatar,
  Dropdown,
  Row,
  Col,
  Empty,
  Spin,
  Select,
  Modal,
  Form,
  Checkbox,
  Typography,
  Table,
} from 'antd';
import {
  MoreOutlined,
  DownloadOutlined,
  TeamOutlined,
  SendOutlined,
  UsergroupAddOutlined,
  PictureOutlined,
  FileTextOutlined,
} from '@ant-design/icons';
import { waApi, type WhatsAppSession, type WhatsAppGroup, type GroupDmMembersResult } from '../../services/waApi';
import { useNotification } from '@/hooks/useNotification';

const { Search, TextArea } = Input;
const { Option } = Select;
const { Title } = Typography;

const GroupsTab = () => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [selectedSession, setSelectedSession] = useState<string>('');
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [filteredGroups, setFilteredGroups] = useState<WhatsAppGroup[]>([]);
  const [fetching, setFetching] = useState(true);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [searchText, setSearchText] = useState('');
  const { showError, showSuccess } = useNotification();

  // Send to Group Modal State
  const [sendModalVisible, setSendModalVisible] = useState(false);
  const [selectedGroupForSend, setSelectedGroupForSend] = useState<WhatsAppGroup | null>(null);
  const [sendMessageType, setSendMessageType] = useState<'text' | 'image'>('text');
  const [sendForm] = Form.useForm();
  const [sendingMessage, setSendingMessage] = useState(false);

  // DM Members Modal State
  const [dmModalVisible, setDmModalVisible] = useState(false);
  const [selectedGroupForDm, setSelectedGroupForDm] = useState<WhatsAppGroup | null>(null);
  const [dmMessageType, setDmMessageType] = useState<'text' | 'image'>('text');
  const [dmForm] = Form.useForm();
  const [dmingMembers, setDmingMembers] = useState(false);
  const [dmResultModalVisible, setDmResultModalVisible] = useState(false);
  const [dmResult, setDmResult] = useState<GroupDmMembersResult | null>(null);

  // Members View Modal State
  const [membersModalVisible, setMembersModalVisible] = useState(false);
  const [selectedGroupForMembers, setSelectedGroupForMembers] = useState<WhatsAppGroup | null>(null);
  const [groupMembers, setGroupMembers] = useState<Array<{ id: string; admin?: string | null }>>([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    if (selectedSession) {
      fetchGroups(selectedSession);
    }
  }, [selectedSession]);

  useEffect(() => {
    if (searchText) {
      const filtered = groups.filter((g) =>
        g.subject?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredGroups(filtered);
    } else {
      setFilteredGroups(groups);
    }
  }, [searchText, groups]);

  const fetchSessions = async () => {
    setFetching(true);
    try {
      const data = await waApi.getSessions();
      const connectedSessions = data.filter((s) => s.connected);
      setSessions(connectedSessions);
      if (connectedSessions.length > 0) {
        setSelectedSession(connectedSessions[0].id);
      }
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal memuat sessions');
    } finally {
      setFetching(false);
    }
  };

  const fetchGroups = async (sessionId: string) => {
    setLoadingGroups(true);
    try {
      const data = await waApi.getGroups(sessionId);
      setGroups(data?.groups || []);
      setFilteredGroups(data?.groups || []);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal memuat groups');
      setGroups([]);
      setFilteredGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const getGroupMenuItems = (group: WhatsAppGroup) => [
    {
      key: 'send',
      icon: <SendOutlined />,
      label: 'Send Message',
      onClick: () => {
        setSelectedGroupForSend(group);
        setSendMessageType('text');
        sendForm.resetFields();
        setSendModalVisible(true);
      },
    },
    {
      key: 'dm',
      icon: <UsergroupAddOutlined />,
      label: 'DM Members',
      onClick: () => {
        setSelectedGroupForDm(group);
        setDmMessageType('text');
        dmForm.resetFields();
        dmForm.setFieldsValue({ delayMs: 1500, jitterMs: 600, includeAdmins: true });
        setDmModalVisible(true);
      },
    },
    {
      key: 'members',
      icon: <DownloadOutlined />,
      label: 'View Members',
      onClick: () => {
        handleOpenMembers(group);
      },
    },
  ];

  const handleSendToGroup = async (values: any) => {
    if (!selectedGroupForSend || !selectedSession) return;

    setSendingMessage(true);
    try {
      if (sendMessageType === 'text') {
        await waApi.sendToGroupText({
          sessionId: selectedSession,
          groupJid: selectedGroupForSend.id,
          text: values.text,
        });
      } else {
        await waApi.sendToGroupImage({
          sessionId: selectedSession,
          groupJid: selectedGroupForSend.id,
          imageUrl: values.imageUrl,
          caption: values.caption,
        });
      }
      showSuccess('Pesan berhasil dikirim ke group!');
      setSendModalVisible(false);
      sendForm.resetFields();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal mengirim pesan ke group');
    } finally {
      setSendingMessage(false);
    }
  };

  const handleDmMembers = async (values: any) => {
    if (!selectedGroupForDm || !selectedSession) return;

    setDmingMembers(true);
    try {
      let result: GroupDmMembersResult;

      if (dmMessageType === 'text') {
        result = await waApi.dmGroupMembersText({
          sessionId: selectedSession,
          groupJid: selectedGroupForDm.id,
          text: values.text,
          delayMs: parseInt(values.delayMs) || 1500,
          jitterMs: parseInt(values.jitterMs) || 600,
          includeAdmins: values.includeAdmins === true,
        });
      } else {
        result = await waApi.dmGroupMembersImage({
          sessionId: selectedSession,
          groupJid: selectedGroupForDm.id,
          imageUrl: values.imageUrl,
          caption: values.caption,
          delayMs: parseInt(values.delayMs) || 1500,
          jitterMs: parseInt(values.jitterMs) || 600,
          includeAdmins: values.includeAdmins === true,
        });
      }

      setDmResult(result);
      setDmModalVisible(false);
      setDmResultModalVisible(true);

      const successCount = result.summary.SENT || 0;
      const failedCount = result.summary.FAILED || 0;
      const skippedCount = result.summary.SKIPPED || 0;
      showSuccess(`DM selesai! Sent: ${successCount}, Failed: ${failedCount}, Skipped: ${skippedCount}`);
      dmForm.resetFields();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal mengirim DM ke members');
    } finally {
      setDmingMembers(false);
    }
  };

  const handleOpenMembers = async (group: WhatsAppGroup) => {
    if (!selectedSession) return;
    
    setSelectedGroupForMembers(group);
    setLoadingMembers(true);
    try {
      const data = await waApi.getGroupMembers(selectedSession, group.id);
      setGroupMembers(data?.members || []);
      setMembersModalVisible(true);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal memuat members');
    } finally {
      setLoadingMembers(false);
    }
  };

  const getRandomColor = (str: string) => {
    const colors = ['#1677ff', '#52c41a', '#faad14', '#eb2f96', '#722ed1', '#13c2c2'];
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  if (fetching) {
    return (
      <div style={{ textAlign: 'center', padding: 60 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <Empty
        description="No active sessions. Please connect a WhatsApp session first."
        style={{ padding: 60 }}
      />
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          flexWrap: 'wrap',
          gap: 12,
        }}
      >
        <Space wrap>
          <Search
            placeholder="Search groups..."
            allowClear
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            style={{ width: 250 }}
            suffix={
              <span style={{ color: '#bbb', fontSize: 12 }}>
                <span style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>⌘</span>{' '}
                <span style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>S</span>
              </span>
            }
          />
          <Select
            value={selectedSession}
            onChange={setSelectedSession}
            style={{ width: 180 }}
            placeholder="Select session"
          >
            {sessions.map((s) => (
              <Select.Option key={s.id} value={s.id}>
                {s.label || s.meJid?.split('@')[0] || s.id}
              </Select.Option>
            ))}
          </Select>
        </Space>
      </div>

      {loadingGroups ? (
        <div style={{ textAlign: 'center', padding: 60 }}>
          <Spin size="large" />
        </div>
      ) : filteredGroups.length === 0 ? (
        <Empty description="No groups found" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredGroups.map((group) => (
            <Col xs={24} sm={12} md={8} lg={6} key={group.id}>
              <Card
                size="small"
                style={{
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                  height: '100%',
                }}
                bodyStyle={{ padding: 16 }}
              >
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
                  }}
                >
                  <Space>
                    <Avatar
                      size={40}
                      style={{
                        backgroundColor: getRandomColor(group.id),
                        fontWeight: 600,
                      }}
                      icon={<TeamOutlined />}
                    />
                    <div>
                      <div
                        style={{
                          fontWeight: 600,
                          fontSize: 14,
                          maxWidth: 150,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                        title={group.subject}
                      >
                        {group.subject || 'Unnamed Group'}
                      </div>
                      <div style={{ color: '#666', fontSize: 12 }}>
                        {group.size || group.participants || 0} Members
                      </div>
                    </div>
                  </Space>
                  <Dropdown
                    menu={{ items: getGroupMenuItems(group) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button type="text" size="small" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>

                <div
                  style={{
                    marginTop: 12,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <span style={{ color: '#999', fontSize: 12 }}>No activity in 7 days</span>
                  <Tag
                    color="success"
                    style={{ borderRadius: 4, fontWeight: 500, margin: 0 }}
                  >
                    Active
                  </Tag>
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      {/* Send Message to Group Modal */}
      <Modal
        title={`Send Message to ${selectedGroupForSend?.subject || 'Group'}`}
        open={sendModalVisible}
        onCancel={() => setSendModalVisible(false)}
        footer={null}
        width={500}
      >
        <Form form={sendForm} layout="vertical" onFinish={handleSendToGroup}>
          <Form.Item label="Message Type" required>
            <Select
              value={sendMessageType}
              onChange={setSendMessageType}
              style={{ width: '100%' }}
            >
              <Option value="text">
                <Space><FileTextOutlined /> Text Message</Space>
              </Option>
              <Option value="image">
                <Space><PictureOutlined /> Image Message</Space>
              </Option>
            </Select>
          </Form.Item>

          {sendMessageType === 'text' ? (
            <Form.Item
              name="text"
              label="Message"
              rules={[{ required: true, message: 'Message is required!' }]}
            >
              <TextArea rows={4} placeholder="Enter your message" />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name="imageUrl"
                label="Image URL"
                rules={[{ required: true, message: 'Image URL is required!' }]}
              >
                <Input placeholder="https://example.com/image.jpg" />
              </Form.Item>
              <Form.Item name="caption" label="Caption (Optional)">
                <TextArea rows={2} placeholder="Enter image caption" />
              </Form.Item>
            </>
          )}

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={sendingMessage}
              block
            >
              Send Message
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* DM Group Members Modal */}
      <Modal
        title={`DM Members of ${selectedGroupForDm?.subject || 'Group'}`}
        open={dmModalVisible}
        onCancel={() => setDmModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={dmForm} layout="vertical" onFinish={handleDmMembers}>
          <Form.Item label="Message Type" required>
            <Select
              value={dmMessageType}
              onChange={setDmMessageType}
              style={{ width: '100%' }}
            >
              <Option value="text">
                <Space><FileTextOutlined /> Text Message</Space>
              </Option>
              <Option value="image">
                <Space><PictureOutlined /> Image Message</Space>
              </Option>
            </Select>
          </Form.Item>

          {dmMessageType === 'text' ? (
            <Form.Item
              name="text"
              label="Message"
              rules={[{ required: true, message: 'Message is required!' }]}
            >
              <TextArea rows={4} placeholder="Enter your message" />
            </Form.Item>
          ) : (
            <>
              <Form.Item
                name="imageUrl"
                label="Image URL"
                rules={[{ required: true, message: 'Image URL is required!' }]}
              >
                <Input placeholder="https://example.com/image.jpg" />
              </Form.Item>
              <Form.Item name="caption" label="Caption (Optional)">
                <TextArea rows={2} placeholder="Enter image caption" />
              </Form.Item>
            </>
          )}

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name="delayMs" label="Delay (ms)">
                <Input type="number" placeholder="1000" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="jitterMs" label="Jitter (ms)">
                <Input type="number" placeholder="500" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item name="includeAdmins" valuePropName="checked">
            <Checkbox>Include group admins</Checkbox>
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SendOutlined />}
              loading={dmingMembers}
              block
            >
              DM All Members
            </Button>
          </Form.Item>
        </Form>
      </Modal>

      {/* DM Result Modal */}
      <Modal
        title="DM Members Result"
        open={dmResultModalVisible}
        onCancel={() => setDmResultModalVisible(false)}
        footer={[<Button key="close" onClick={() => setDmResultModalVisible(false)}>Close</Button>]}
        width={800}
      >
        {dmResult && (
          <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={5}>Group: {dmResult.groupSubject}</Title>
                <Space size="large">
                  <Tag color="success">Sent: {dmResult.summary.SENT || 0}</Tag>
                  <Tag color="error">Failed: {dmResult.summary.FAILED || 0}</Tag>
                  <Tag color="warning">Skipped: {dmResult.summary.SKIPPED || 0}</Tag>
                  <Tag>Total: {dmResult.total}</Tag>
                </Space>
              </div>

              <div>
                <Title level={5}>Details</Title>
                <Table
                  dataSource={dmResult.results}
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

      {/* View Group Members Modal */}
      <Modal
        title={`Members of ${selectedGroupForMembers?.subject || 'Group'}`}
        open={membersModalVisible}
        onCancel={() => {
          setMembersModalVisible(false);
          setSelectedGroupForMembers(null);
          setGroupMembers([]);
        }}
        footer={[<Button key="close" onClick={() => setMembersModalVisible(false)}>Close</Button>]}
        width={600}
      >
        {loadingMembers ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin />
          </div>
        ) : groupMembers.length === 0 ? (
          <Empty description="No members found" />
        ) : (
          <Table
            dataSource={groupMembers}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            size="small"
            columns={[
              {
                title: 'Member ID',
                dataIndex: 'id',
                key: 'id',
                render: (id: string) => <code style={{ fontSize: '11px' }}>{id}</code>,
              },
              {
                title: 'Role',
                dataIndex: 'admin',
                key: 'admin',
                render: (admin: string | null | undefined) => (
                  <Tag color={admin ? 'gold' : 'default'}>
                    {admin ? 'Admin' : 'Member'}
                  </Tag>
                ),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default GroupsTab;
