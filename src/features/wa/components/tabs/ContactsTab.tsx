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
  Modal,
  Form,
  Select,
  Upload,
  Alert,
} from 'antd';
import {
  PlusOutlined,
  MoreOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  UploadOutlined,
  ReloadOutlined,
  DownloadOutlined,
  TeamOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { contactsApi } from '@/features/contacts/services/contactsApi';
import type { GroupImportResponse, WhatsAppContact } from '@/features/contacts/types/contacts';
import { useNotification } from '@/hooks/useNotification';
import { waApi, type WhatsAppGroup } from '../../services/waApi';
import * as XLSX from 'xlsx';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Search } = Input;
const { Option } = Select;
const { Dragger } = Upload;

const ContactsTab = () => {
  const [form] = Form.useForm();
  const [contacts, setContacts] = useState<WhatsAppContact[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<WhatsAppContact[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [createModalVisible, setCreateModalVisible] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingContact, setEditingContact] = useState<WhatsAppContact | null>(null);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const [importSummary, setImportSummary] = useState<{
    rows: number;
    phones: { created: number; updated: number; skipped: number };
  } | null>(null);
  const [groupImportModalVisible, setGroupImportModalVisible] = useState(false);
  const [availableGroups, setAvailableGroups] = useState<WhatsAppGroup[]>([]);
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [selectedGroupJid, setSelectedGroupJid] = useState<string | undefined>(undefined);
  const [manualGroupJid, setManualGroupJid] = useState('');
  const [groupImportResult, setGroupImportResult] = useState<GroupImportResponse | null>(null);
  const { showError, showSuccess } = useNotification();

  useEffect(() => {
    fetchContacts();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = contacts.filter(
        (c) =>
          c.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          c.phone?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredContacts(filtered);
    } else {
      setFilteredContacts(contacts);
    }
  }, [searchText, contacts]);

  const fetchContacts = async () => {
    setFetching(true);
    try {
      const data = await contactsApi.getContacts();
      setContacts(data?.whatsapp || []);
      setFilteredContacts(data?.whatsapp || []);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal memuat contacts');
    } finally {
      setFetching(false);
    }
  };

  const handleCreateContact = async (values: {
    phone: string;
    name?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
    source?: string;
  }) => {
    setSubmitting(true);
    try {
      await contactsApi.createWhatsAppContact({
        phone: values.phone.trim(),
        name: values.name?.trim() || undefined,
        status: values.status,
        source: values.source?.trim() || undefined,
      });
      showSuccess('Kontak berhasil ditambahkan');
      setCreateModalVisible(false);
      form.resetFields();
      fetchContacts();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal menambah kontak');
    } finally {
      setSubmitting(false);
    }
  };

  const openEditModal = (contact: WhatsAppContact) => {
    setEditingContact(contact);
    form.setFieldsValue({
      phone: contact.phone,
      name: contact.name,
      status: contact.status,
      source: contact.source,
    });
    setEditModalVisible(true);
  };

  const handleUpdateContact = async (values: {
    phone?: string;
    name?: string;
    status?: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
    source?: string;
  }) => {
    if (!editingContact) return;
    setSubmitting(true);
    try {
      await contactsApi.updateWhatsAppContact(editingContact.id, {
        phone: values.phone?.trim() || undefined,
        name: values.name?.trim() || undefined,
        status: values.status,
        source: values.source?.trim() || undefined,
      });
      showSuccess('Kontak berhasil diperbarui');
      setEditModalVisible(false);
      setEditingContact(null);
      form.resetFields();
      fetchContacts();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal memperbarui kontak');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteContact = async (contact: WhatsAppContact) => {
    try {
      await contactsApi.deleteWhatsAppContact(contact.id);
      showSuccess('Kontak berhasil dihapus');
      fetchContacts();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal menghapus kontak');
    }
  };

  const handleImport = async () => {
    if (fileList.length === 0 || !(fileList[0].originFileObj instanceof File)) {
      showError('Pilih file Excel terlebih dahulu');
      return;
    }

    setImporting(true);
    try {
      const result = await contactsApi.importContacts(fileList[0].originFileObj);
      setImportSummary({
        rows: result.summary.rows,
        phones: result.summary.phones,
      });
      showSuccess('Import contacts berhasil');
      setFileList([]);
      await fetchContacts();
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal import contacts');
    } finally {
      setImporting(false);
    }
  };

  const fetchAvailableGroups = async () => {
    setLoadingGroups(true);
    try {
      const data = await waApi.getGroups();
      setAvailableGroups(data?.groups || []);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal memuat grup WhatsApp');
      setAvailableGroups([]);
    } finally {
      setLoadingGroups(false);
    }
  };

  const openGroupImportModal = async () => {
    setGroupImportResult(null);
    setSelectedGroupJid(undefined);
    setManualGroupJid('');
    setGroupImportModalVisible(true);
    await fetchAvailableGroups();
  };

  const closeGroupImportModal = () => {
    setGroupImportModalVisible(false);
    setSelectedGroupJid(undefined);
    setManualGroupJid('');
    setGroupImportResult(null);
  };

  const handleGroupImport = async () => {
    const groupJid = manualGroupJid.trim() || selectedGroupJid?.trim() || '';

    if (!groupJid) {
      showError('Pilih grup WhatsApp atau isi Group JID terlebih dahulu');
      return;
    }

    setImporting(true);
    try {
      const result = await contactsApi.importGroupContacts(groupJid);
      setGroupImportResult(result);
      showSuccess(`Import member group ${result.groupSubject || 'WhatsApp'} berhasil`);
      await fetchContacts();
      setSelectedGroupJid(undefined);
      setManualGroupJid('');
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal import kontak dari group');
    } finally {
      setImporting(false);
    }
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.xlsx,.xls',
    fileList,
    beforeUpload: (file) => {
      const lowerName = file.name.toLowerCase();
      const validExt = lowerName.endsWith('.xlsx') || lowerName.endsWith('.xls');
      if (!validExt) {
        showError('Hanya file .xlsx atau .xls yang didukung');
        return Upload.LIST_IGNORE;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showError('Ukuran file maksimal 5MB');
        return Upload.LIST_IGNORE;
      }

      setFileList([
        {
          uid: file.uid,
          name: file.name,
          status: 'done',
          originFileObj: file,
        },
      ]);

      return false;
    },
    onRemove: () => {
      setFileList([]);
      setImportSummary(null);
    },
    maxCount: 1,
  };

  const handleDownloadTemplate = () => {
    const rows = [
      { phone: '628123456789', name: 'Budi Santoso' },
      { phone: '628987654321', name: 'Siti Rahma' },
    ];

    const worksheet = XLSX.utils.json_to_sheet(rows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'WA Contacts');
    XLSX.writeFile(workbook, 'wa-contacts-template.xlsx');
  };

  const getContactMenuItems = (contact: WhatsAppContact) => [
    {
      key: 'edit',
      icon: <EditOutlined />,
      label: 'Edit',
      onClick: () => openEditModal(contact),
    },
    {
      key: 'delete',
      icon: <DeleteOutlined />,
      label: 'Delete',
      danger: true,
      onClick: () => {
        Modal.confirm({
          title: 'Hapus kontak?',
          content: `Kontak ${contact.phone} akan dihapus permanen.`,
          okText: 'Hapus',
          okType: 'danger',
          cancelText: 'Batal',
          onOk: () => handleDeleteContact(contact),
        });
      },
    },
  ];

  const getInitials = (name?: string) => {
    if (!name) return '?';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
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

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
          gap: 12,
          flexWrap: 'wrap',
        }}
      >
        <Search
          placeholder="Search contacts..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
        />
        <Space>
          <Button icon={<ReloadOutlined />} onClick={fetchContacts} loading={fetching}>
            Refresh
          </Button>
          <Button
            icon={<UploadOutlined />}
            onClick={() => {
              setImportSummary(null);
              setImportModalVisible(true);
            }}
          >
            Import Contacts
          </Button>
          <Button icon={<TeamOutlined />} onClick={openGroupImportModal}>
            Import Group
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              form.resetFields();
              form.setFieldsValue({ status: 'ACTIVE' });
              setCreateModalVisible(true);
            }}
          >
            Add Contact
          </Button>
        </Space>
      </div>

      {filteredContacts.length === 0 ? (
        <Empty description="No contacts found" />
      ) : (
        <Row gutter={[16, 16]}>
          {filteredContacts.map((contact) => (
            <Col xs={24} sm={12} md={8} lg={6} key={contact.id}>
              <Card
                size="small"
                style={{
                  borderRadius: 12,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
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
                        backgroundColor: getRandomColor(contact.phone || ''),
                        fontWeight: 600,
                      }}
                      icon={!contact.name && <UserOutlined />}
                    >
                      {contact.name && getInitials(contact.name)}
                    </Avatar>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>
                        {contact.name || 'Unknown'}
                      </div>
                      <div style={{ color: '#666', fontSize: 12 }}>{contact.phone}</div>
                    </div>
                  </Space>
                  <Dropdown
                    menu={{ items: getContactMenuItems(contact) }}
                    trigger={['click']}
                    placement="bottomRight"
                  >
                    <Button type="text" size="small" icon={<MoreOutlined />} />
                  </Dropdown>
                </div>

                <div style={{ marginTop: 12 }}>
                  <Tag
                    color={contact.status === 'ACTIVE' ? 'success' : contact.status === 'INACTIVE' ? 'default' : 'warning'}
                    style={{ borderRadius: 4, fontSize: 11, marginRight: 8 }}
                  >
                    {contact.status}
                  </Tag>
                  <Tag style={{ borderRadius: 4, fontSize: 11 }}>{contact.source || '-'}</Tag>
                </div>

                <div style={{ marginTop: 12, color: '#999', fontSize: 12 }}>
                  Last contact: {contact.updatedAt ? dayjs(contact.updatedAt).fromNow() : '-'}
                </div>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        title="Add WhatsApp Contact"
        open={createModalVisible}
        onCancel={() => setCreateModalVisible(false)}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleCreateContact}>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Phone is required' }]}
          >
            <Input placeholder="628123456789" />
          </Form.Item>
          <Form.Item name="name" label="Name">
            <Input placeholder="Contact name" />
          </Form.Item>
          <Form.Item name="status" label="Status" initialValue="ACTIVE">
            <Select>
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
              <Option value="UNKNOWN">UNKNOWN</Option>
            </Select>
          </Form.Item>
          <Form.Item name="source" label="Source">
            <Input placeholder="MANUAL" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setCreateModalVisible(false)}>Cancel</Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Save
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Import WhatsApp Contacts"
        open={importModalVisible}
        onCancel={() => {
          setImportModalVisible(false);
          setFileList([]);
          setImportSummary(null);
        }}
        footer={[
          <Button key="template" icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
            Download Template
          </Button>,
          <Button
            key="cancel"
            onClick={() => {
              setImportModalVisible(false);
              setFileList([]);
              setImportSummary(null);
            }}
          >
            Cancel
          </Button>,
          <Button
            key="import"
            type="primary"
            icon={<UploadOutlined />}
            loading={importing}
            onClick={handleImport}
          >
            Import
          </Button>,
        ]}
      >
        <Dragger {...uploadProps}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">Pilih file Excel kontak</p>
          <p className="ant-upload-hint">Format: .xlsx atau .xls, maksimal 5MB</p>
        </Dragger>

        {importSummary && (
          <Alert
            style={{ marginTop: 16 }}
            type="success"
            showIcon
            message={`Rows: ${importSummary.rows}`}
            description={`Phones - Created: ${importSummary.phones.created}, Updated: ${importSummary.phones.updated}, Skipped: ${importSummary.phones.skipped}`}
          />
        )}
      </Modal>

      <Modal
        title="Import Contacts From WhatsApp Group"
        open={groupImportModalVisible}
        onCancel={closeGroupImportModal}
        footer={null}
      >
        {!groupImportResult ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Alert
              type="info"
              showIcon
              message="Import semua member group ke kontak"
              description="Pilih group dari daftar WhatsApp aktif atau isi Group JID manual. Semua member akan disimpan sebagai WhatsApp contact dengan source GROUP_IMPORT."
            />

            <div>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>Pilih group</div>
              <Select
                showSearch
                allowClear
                placeholder={loadingGroups ? 'Memuat groups...' : 'Pilih WhatsApp group'}
                loading={loadingGroups}
                value={selectedGroupJid}
                onChange={(value) => setSelectedGroupJid(value)}
                style={{ width: '100%' }}
                optionFilterProp="label"
                options={availableGroups.map((group) => ({
                  value: group.id,
                  label: `${group.subject || 'Unnamed Group'} (${group.size || group.participants || 0} members)`,
                }))}
              />
              <div style={{ marginTop: 8, display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <span style={{ color: '#8c8c8c', fontSize: 12 }}>
                  {availableGroups.length > 0
                    ? `Ditemukan ${availableGroups.length} group dari session aktif.`
                    : 'Group belum termuat. Anda tetap bisa isi Group JID manual.'}
                </span>
                <Button size="small" icon={<ReloadOutlined />} onClick={fetchAvailableGroups} loading={loadingGroups}>
                  Refresh Group
                </Button>
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 500, marginBottom: 8 }}>Atau isi Group JID manual</div>
              <Input
                placeholder="1203630xxxxxxxx@g.us"
                value={manualGroupJid}
                onChange={(event) => setManualGroupJid(event.target.value)}
              />
            </div>

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={closeGroupImportModal}>Cancel</Button>
              <Button type="primary" icon={<TeamOutlined />} loading={importing} onClick={handleGroupImport}>
                Import Members
              </Button>
            </Space>
          </Space>
        ) : (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Alert
              type="success"
              showIcon
              message={`Group ${groupImportResult.groupSubject || '-'} berhasil diimport`}
              description={groupImportResult.note || 'Semua member yang bisa diproses sudah ditambahkan atau diupdate sebagai kontak.'}
            />

            <Card size="small">
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                <div><strong>Group:</strong> {groupImportResult.groupSubject || '-'}</div>
                <div><strong>Group JID:</strong> {groupImportResult.groupJid}</div>
                <div><strong>Total Member:</strong> {groupImportResult.totalMembers}</div>
                <div><strong>Imported:</strong> {groupImportResult.summary.imported}</div>
                <div><strong>Updated:</strong> {groupImportResult.summary.updated}</div>
                <div><strong>Skipped:</strong> {groupImportResult.summary.skipped}</div>
                <div><strong>LID Account:</strong> {groupImportResult.summary.lidCount}</div>
              </Space>
            </Card>

            <div style={{ maxHeight: 240, overflow: 'auto', border: '1px solid #f0f0f0', borderRadius: 8, padding: 12 }}>
              <Space direction="vertical" size={8} style={{ width: '100%' }}>
                {groupImportResult.details.map((item, index) => (
                  <div
                    key={`${item.jid}-${item.phone}-${item.result}-${index}`}
                    style={{ display: 'flex', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}
                  >
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 500 }}>{item.phone || item.jid}</div>
                      <div style={{ color: '#8c8c8c', fontSize: 12 }}>{item.jid}</div>
                    </div>
                    <Space size={4} wrap>
                      <Tag color={item.result === 'IMPORTED' ? 'success' : item.result === 'UPDATED' ? 'processing' : 'error'}>
                        {item.result}
                      </Tag>
                      <Tag color={item.isLid ? 'warning' : 'default'}>
                        {item.isLid ? 'LID' : 'PHONE'}
                      </Tag>
                    </Space>
                  </div>
                ))}
              </Space>
            </div>

            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button onClick={() => setGroupImportResult(null)}>Import Group Lain</Button>
              <Button type="primary" onClick={closeGroupImportModal}>Close</Button>
            </Space>
          </Space>
        )}
      </Modal>

      <Modal
        title="Edit WhatsApp Contact"
        open={editModalVisible}
        onCancel={() => {
          setEditModalVisible(false);
          setEditingContact(null);
        }}
        footer={null}
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleUpdateContact}>
          <Form.Item
            name="phone"
            label="Phone"
            rules={[{ required: true, message: 'Phone is required' }]}
          >
            <Input placeholder="628123456789" />
          </Form.Item>
          <Form.Item name="name" label="Name">
            <Input placeholder="Contact name" />
          </Form.Item>
          <Form.Item name="status" label="Status">
            <Select>
              <Option value="ACTIVE">ACTIVE</Option>
              <Option value="INACTIVE">INACTIVE</Option>
              <Option value="UNKNOWN">UNKNOWN</Option>
            </Select>
          </Form.Item>
          <Form.Item name="source" label="Source">
            <Input placeholder="MANUAL" />
          </Form.Item>
          <Form.Item style={{ marginBottom: 0 }}>
            <Space style={{ width: '100%', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => {
                  setEditModalVisible(false);
                  setEditingContact(null);
                }}
              >
                Cancel
              </Button>
              <Button type="primary" htmlType="submit" loading={submitting}>
                Update
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ContactsTab;
