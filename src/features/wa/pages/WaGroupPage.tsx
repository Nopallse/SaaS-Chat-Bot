import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Select, Table, Space, Tag, Tabs, Modal, Typography, Checkbox } from 'antd';
import { SendOutlined, UsergroupAddOutlined, PictureOutlined, FileTextOutlined } from '@ant-design/icons';
import { waApi, type WhatsAppSession, type WhatsAppGroup, type GroupDmMembersResult } from '../services/waApi';
import { useNotification } from '@/hooks/useNotification';

const { TextArea } = Input;
const { Option } = Select;
const { Title, Text } = Typography;

const WaGroupPage = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [groups, setGroups] = useState<WhatsAppGroup[]>([]);
  const [activeTab, setActiveTab] = useState('send');
  const [resultModalVisible, setResultModalVisible] = useState(false);
  const [dmResult, setDmResult] = useState<GroupDmMembersResult | null>(null);
  const [selectedSessionForGroups, setSelectedSessionForGroups] = useState<string>('');
  const [loadingGroups, setLoadingGroups] = useState(false);
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

  const handleSendToGroup = async (values: any) => {
    setLoading(true);
    try {
      if (!values.groupJid || values.groupJid.trim().length === 0) {
        showError('Group ID wajib diisi!');
        setLoading(false);
        return;
      }

      if (values.type === 'text') {
        if (!values.text || values.text.trim().length === 0) {
          showError('Pesan text wajib diisi!');
          setLoading(false);
          return;
        }

        const result = await waApi.sendToGroupText({
          sessionId: values.sessionId,
          groupJid: values.groupJid.trim(),
          text: values.text.trim(),
        });

        showSuccess(`Pesan berhasil dikirim ke group! Message ID: ${result.messageId || 'N/A'}`);
      } else {
        if (!values.imageUrl || values.imageUrl.trim().length === 0) {
          showError('URL gambar wajib diisi!');
          setLoading(false);
          return;
        }

        const result = await waApi.sendToGroupImage({
          sessionId: values.sessionId,
          groupJid: values.groupJid.trim(),
          imageUrl: values.imageUrl.trim(),
          caption: values.caption?.trim(),
        });

        showSuccess(`Gambar berhasil dikirim ke group! Message ID: ${result.messageId || 'N/A'}`);
      }

      form.resetFields(['groupJid', 'type', 'text', 'imageUrl', 'caption']);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal mengirim pesan ke group';
      showError(msg);
      console.error('Send to group error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDmMembers = async (values: any) => {
    setLoading(true);
    try {
      if (!values.groupJid || values.groupJid.trim().length === 0) {
        showError('Group ID wajib diisi!');
        setLoading(false);
        return;
      }

      const delayMs = values.delayMs ? parseInt(values.delayMs) : 1500;
      const jitterMs = values.jitterMs ? parseInt(values.jitterMs) : 600;
      const checkNumber = values.checkNumber !== false;
      const includeAdmins = values.includeAdmins !== false;

      let result: GroupDmMembersResult;

      if (values.type === 'text') {
        if (!values.text || values.text.trim().length === 0) {
          showError('Pesan text wajib diisi!');
          setLoading(false);
          return;
        }

        result = await waApi.dmGroupMembersText({
          sessionId: values.sessionId,
          groupJid: values.groupJid.trim(),
          text: values.text.trim(),
          delayMs,
          jitterMs,
          checkNumber,
          includeAdmins,
        });
      } else {
        if (!values.imageUrl || values.imageUrl.trim().length === 0) {
          showError('URL gambar wajib diisi!');
          setLoading(false);
          return;
        }

        result = await waApi.dmGroupMembersImage({
          sessionId: values.sessionId,
          groupJid: values.groupJid.trim(),
          imageUrl: values.imageUrl.trim(),
          caption: values.caption?.trim(),
          delayMs,
          jitterMs,
          checkNumber,
          includeAdmins,
        });
      }

      setDmResult(result);
      setResultModalVisible(true);

      const successCount = result.summary.SENT || 0;
      const failedCount = result.summary.FAILED || 0;
      const skippedCount = result.summary.SKIPPED || 0;

      showSuccess(`DM broadcast selesai! Sent: ${successCount}, Failed: ${failedCount}, Skipped: ${skippedCount}`);

      form.resetFields(['groupJid', 'type', 'text', 'imageUrl', 'caption', 'delayMs', 'jitterMs', 'checkNumber', 'includeAdmins']);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal memulai DM broadcast';
      showError(msg);
      console.error('DM members error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFetchGroups = async (sessionId: string) => {
    if (!sessionId || sessionId.trim().length === 0) {
      setGroups([]);
      return;
    }

    setLoadingGroups(true);
    try {
      const response = await waApi.getGroups(sessionId.trim());
      setGroups(response.groups || []);
      if (activeTab === 'list') {
        showSuccess(`Berhasil memuat ${response.count || 0} group`);
      }
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal memuat groups';
      if (activeTab === 'list') {
        showError(msg);
      }
      setGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  // Auto fetch groups when session changes in send/dm tabs
  const handleSessionChange = async (sessionId: string) => {
    if (sessionId && (activeTab === 'send' || activeTab === 'dm')) {
      await handleFetchGroups(sessionId);
    }
  };

  const groupColumns = [
    {
      title: 'Nama Group',
      dataIndex: 'subject',
      key: 'subject',
      render: (subject: string) => subject || <Text type="secondary">-</Text>,
    },
    {
      title: 'Group ID',
      dataIndex: 'id',
      key: 'id',
      render: (id: string) => <code style={{ fontSize: '12px' }}>{id}</code>,
    },
    {
      title: 'Jumlah Member',
      dataIndex: 'participants',
      key: 'participants',
      render: (participants: number) => <Tag color="blue">{participants || 0}</Tag>,
    },
    {
      title: 'Size',
      dataIndex: 'size',
      key: 'size',
      render: (size: number) => size || 0,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>Operasi WhatsApp Group</Title>
      
      <Card style={{ marginTop: '16px' }}>
        <Tabs activeKey={activeTab} onChange={setActiveTab}>
          <Tabs.TabPane tab={<span><SendOutlined />Kirim ke Group</span>} key="send">
            <Form form={form} layout="vertical" onFinish={handleSendToGroup}>
              <Form.Item name="sessionId" label="Session" rules={[{ required: true, message: 'Session wajib dipilih!' }]}>
                <Select
                  placeholder="Pilih session WhatsApp (hanya yang connected)"
                  loading={fetching}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    form.setFieldsValue({ groupJid: undefined });
                    handleSessionChange(value);
                  }}
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
                name="groupJid" 
                label="Group" 
                rules={[{ required: true, message: 'Group wajib dipilih atau diisi!' }]}
                tooltip="Pilih group dari daftar atau ketik Group JID secara manual"
              >
                <Select
                  mode="combobox"
                  placeholder="Pilih group atau ketik Group JID manual (contoh: 1203630xxxxxxx@g.us)"
                  showSearch
                  allowClear
                  loading={loadingGroups}
                  filterOption={(input, option) => {
                    if (!input) return true;
                    const searchText = input.toLowerCase();
                    const label = option?.label?.toLowerCase() || '';
                    const value = option?.value?.toLowerCase() || '';
                    return label.includes(searchText) || value.includes(searchText);
                  }}
                  notFoundContent={loadingGroups ? 'Memuat groups...' : groups.length === 0 ? (
                    <div style={{ padding: '8px', textAlign: 'center' }}>
                      <Text type="secondary">Tidak ada group di daftar.</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Ketik Group JID manual atau pastikan session terhubung dan sudah join group.
                      </Text>
                    </div>
                  ) : null}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      {groups.length > 0 && (
                        <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Ditemukan {groups.length} group. Atau ketik Group JID manual di atas.
                          </Text>
                        </div>
                      )}
                    </>
                  )}
                >
                  {groups.map((group) => (
                    <Option key={group.id} value={group.id} label={group.subject || group.id}>
                      <Space direction="vertical" size={2}>
                        <Space>
                          <Tag color="blue">{group.participants || 0} anggota</Tag>
                          {group.subject || 'No Name'}
                        </Space>
                        <code style={{ fontSize: '11px', color: '#999' }}>{group.id}</code>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="type" label="Tipe Pesan" initialValue="text">
                <Select>
                  <Option value="text">
                    <Space><FileTextOutlined />Text</Space>
                  </Option>
                  <Option value="image">
                    <Space><PictureOutlined />Gambar</Space>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
              >
                {({ getFieldValue }) =>
                  getFieldValue('type') === 'text' ? (
                    <Form.Item name="text" label="Pesan Text" rules={[{ required: true, message: 'Pesan text wajib diisi!' }]}>
                      <TextArea rows={4} placeholder="Masukkan pesan text yang akan dikirim ke group" />
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
                  )
                }
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<SendOutlined />} loading={loading} block size="large">
                  Kirim ke Group
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab={<span><UsergroupAddOutlined />DM Anggota Group</span>} key="dm">
            <Form form={form} layout="vertical" onFinish={handleDmMembers}>
              <Form.Item name="sessionId" label="Session" rules={[{ required: true, message: 'Session wajib dipilih!' }]}>
                <Select
                  placeholder="Pilih session WhatsApp (hanya yang connected)"
                  loading={fetching}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    form.setFieldsValue({ groupJid: undefined });
                    handleSessionChange(value);
                  }}
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
                name="groupJid" 
                label="Group" 
                rules={[{ required: true, message: 'Group wajib dipilih atau diisi!' }]}
                tooltip="Pilih group dari daftar atau ketik Group JID secara manual"
              >
                <Select
                  mode="combobox"
                  placeholder="Pilih group atau ketik Group JID manual (contoh: 1203630xxxxxxx@g.us)"
                  showSearch
                  allowClear
                  loading={loadingGroups}
                  filterOption={(input, option) => {
                    if (!input) return true;
                    const searchText = input.toLowerCase();
                    const label = option?.label?.toLowerCase() || '';
                    const value = option?.value?.toLowerCase() || '';
                    return label.includes(searchText) || value.includes(searchText);
                  }}
                  notFoundContent={loadingGroups ? 'Memuat groups...' : groups.length === 0 ? (
                    <div style={{ padding: '8px', textAlign: 'center' }}>
                      <Text type="secondary">Tidak ada group di daftar.</Text>
                      <br />
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Ketik Group JID manual atau pastikan session terhubung dan sudah join group.
                      </Text>
                    </div>
                  ) : null}
                  dropdownRender={(menu) => (
                    <>
                      {menu}
                      {groups.length > 0 && (
                        <div style={{ padding: '8px', borderTop: '1px solid #f0f0f0' }}>
                          <Text type="secondary" style={{ fontSize: '12px' }}>
                            Ditemukan {groups.length} group. Atau ketik Group JID manual di atas.
                          </Text>
                        </div>
                      )}
                    </>
                  )}
                >
                  {groups.map((group) => (
                    <Option key={group.id} value={group.id} label={group.subject || group.id}>
                      <Space direction="vertical" size={2}>
                        <Space>
                          <Tag color="blue">{group.participants || 0} anggota</Tag>
                          {group.subject || 'No Name'}
                        </Space>
                        <code style={{ fontSize: '11px', color: '#999' }}>{group.id}</code>
                      </Space>
                    </Option>
                  ))}
                </Select>
              </Form.Item>

              <Form.Item name="type" label="Tipe Pesan" initialValue="text">
                <Select>
                  <Option value="text">
                    <Space><FileTextOutlined />Text</Space>
                  </Option>
                  <Option value="image">
                    <Space><PictureOutlined />Gambar</Space>
                  </Option>
                </Select>
              </Form.Item>

              <Form.Item
                noStyle
                shouldUpdate={(prevValues, currentValues) => prevValues.type !== currentValues.type}
              >
                {({ getFieldValue }) =>
                  getFieldValue('type') === 'text' ? (
                    <Form.Item name="text" label="Pesan Text" rules={[{ required: true, message: 'Pesan text wajib diisi!' }]}>
                      <TextArea rows={4} placeholder="Masukkan pesan text yang akan dikirim ke semua anggota group" />
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
                  )
                }
              </Form.Item>

              <Form.Item name="delayMs" label="Delay (ms)" initialValue={1500}>
                <Input type="number" placeholder="Delay antar pesan dalam milliseconds" min={0} />
              </Form.Item>

              <Form.Item name="jitterMs" label="Jitter (ms)" initialValue={600}>
                <Input type="number" placeholder="Random jitter dalam milliseconds" min={0} />
              </Form.Item>

              <Form.Item name="checkNumber" valuePropName="checked" initialValue={true}>
                <Checkbox>Check number (verifikasi nomor ada di WhatsApp sebelum kirim)</Checkbox>
              </Form.Item>

              <Form.Item name="includeAdmins" valuePropName="checked" initialValue={true}>
                <Checkbox>Include admins (kirim ke admin juga)</Checkbox>
              </Form.Item>

              <Form.Item>
                <Button type="primary" htmlType="submit" icon={<UsergroupAddOutlined />} loading={loading} block size="large">
                  Mulai DM Broadcast
                </Button>
              </Form.Item>
            </Form>
          </Tabs.TabPane>

          <Tabs.TabPane tab="Daftar Group" key="list">
            <Space direction="vertical" style={{ width: '100%' }}>
              <Space>
                <Select
                  placeholder="Pilih session WhatsApp"
                  style={{ width: 300 }}
                  loading={fetching}
                  showSearch
                  value={selectedSessionForGroups}
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                  onChange={(value) => {
                    setSelectedSessionForGroups(value);
                    if (value) {
                      handleFetchGroups(value);
                    } else {
                      setGroups([]);
                    }
                  }}
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
                <Button 
                  onClick={() => {
                    if (selectedSessionForGroups) {
                      handleFetchGroups(selectedSessionForGroups);
                    } else {
                      showError('Silakan pilih session terlebih dahulu!');
                    }
                  }} 
                  loading={loadingGroups}
                >
                  Refresh Groups
                </Button>
              </Space>
              {groups.length > 0 && (
                <Text type="secondary">Ditemukan {groups.length} group</Text>
              )}
            </Space>
            <Table 
              columns={groupColumns} 
              dataSource={groups} 
              rowKey="id" 
              pagination={{ pageSize: 10 }}
              loading={loadingGroups}
              locale={{ emptyText: 'Belum ada group. Pilih session untuk memuat groups.' }}
            />
          </Tabs.TabPane>
        </Tabs>
      </Card>

      {/* DM Result Modal */}
      <Modal
        title="Hasil DM Broadcast"
        open={resultModalVisible}
        onCancel={() => setResultModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setResultModalVisible(false)}>
            Tutup
          </Button>,
        ]}
        width={800}
      >
        {dmResult && (
          <div>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={5}>Group Info</Title>
                <Space direction="vertical" size="small">
                  <Text strong>Group Subject: </Text>
                  <Text>{dmResult.groupSubject || '-'}</Text>
                </Space>
                <Space direction="vertical" size="small" style={{ marginTop: 8 }}>
                  <Text strong>Group JID: </Text>
                  <code>{dmResult.groupJid}</code>
                </Space>
              </div>

              <div>
                <Title level={5}>Ringkasan</Title>
                <Space size="large">
                  <Tag color="success">Sent: {dmResult.summary.SENT || 0}</Tag>
                  <Tag color="error">Failed: {dmResult.summary.FAILED || 0}</Tag>
                  <Tag color="warning">Skipped: {dmResult.summary.SKIPPED || 0}</Tag>
                  <Tag>Total: {dmResult.total}</Tag>
                </Space>
              </div>

              <div>
                <Title level={5}>Detail Hasil</Title>
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
    </div>
  );
};

export default WaGroupPage;

