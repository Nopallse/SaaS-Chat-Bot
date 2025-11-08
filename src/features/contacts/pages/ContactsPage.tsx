import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  Tag,
  Upload,
  Space,
  Typography,
  Tabs,
  Modal,
  Alert,
  Statistic,
  Row,
  Col,
} from 'antd';
import {
  UploadOutlined,
  ReloadOutlined,
  MailOutlined,
  MessageOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { contactsApi } from '../services/contactsApi';
import type { EmailContact, WhatsAppContact, ImportResponse } from '../types/contacts';
import { useNotification } from '@/hooks/useNotification';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ContactsPage = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [emailContacts, setEmailContacts] = useState<EmailContact[]>([]);
  const [whatsappContacts, setWhatsappContacts] = useState<WhatsAppContact[]>([]);
  const [activeTab, setActiveTab] = useState('email');
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { showSuccess, showError } = useNotification();

  // Check mobile screen size
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setFetching(true);
    try {
      const data = await contactsApi.getContacts();
      setEmailContacts(data?.emails || []);
      setWhatsappContacts(data?.whatsapp || []);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal memuat contacts';
      showError(msg);
      // Set empty arrays on error to prevent undefined
      setEmailContacts([]);
      setWhatsappContacts([]);
    } finally {
      setFetching(false);
    }
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      showError('Silakan pilih file Excel terlebih dahulu');
      return;
    }

    // Get file from fileList
    const fileItem = fileList[0];
    // File bisa dari originFileObj atau langsung dari fileItem (karena beforeUpload return false)
    let file: File | undefined;
    
    if (fileItem.originFileObj instanceof File) {
      file = fileItem.originFileObj;
    } else if (fileItem instanceof File) {
      file = fileItem as File;
    } else {
      // Try to get from the raw file object
      const rawFile = (fileItem as any).file || (fileItem as any);
      if (rawFile instanceof File) {
        file = rawFile;
      }
    }
    
    if (!file || !(file instanceof File)) {
      console.error('File item:', fileItem);
      showError('File tidak valid. Pastikan file adalah file Excel (.xlsx atau .xls)');
      return;
    }

    // Validate file type
    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some(ext => fileName.endsWith(ext));
    
    if (!isValidType) {
      showError('Format file tidak didukung. Hanya file .xlsx atau .xls yang didukung');
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      showError('File terlalu besar. Maksimal ukuran file adalah 5MB');
      return;
    }

    setImporting(true);
    try {
      const result = await contactsApi.importContacts(file);
      setImportResult(result);
      showSuccess('Import berhasil!');
      await fetchContacts();
      // Reset file list after successful import
      setFileList([]);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal import contacts';
      showError(msg);
    } finally {
      setImporting(false);
    }
  };

  const handleImportModalClose = () => {
    setImportModalVisible(false);
    setFileList([]);
    setImportResult(null);
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.xlsx,.xls',
    fileList,
    beforeUpload: (file) => {
      // Validate file type
      const validExtensions = ['.xlsx', '.xls'];
      const fileName = file.name.toLowerCase();
      const isValidType = validExtensions.some(ext => fileName.endsWith(ext));
      
      if (!isValidType) {
        showError('Format file tidak didukung. Hanya file .xlsx atau .xls yang didukung');
        return Upload.LIST_IGNORE;
      }

      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        showError('File terlalu besar. Maksimal ukuran file adalah 5MB');
        return Upload.LIST_IGNORE;
      }

      // Store file with proper structure
      const fileItem: UploadFile = {
        uid: file.uid || `-${Date.now()}`,
        name: file.name,
        status: 'done',
        originFileObj: file,
      };
      setFileList([fileItem]);
      return false; // Prevent auto upload
    },
    onRemove: () => {
      setFileList([]);
    },
    maxCount: 1,
  };

  const emailColumns = [
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (email: string) => <code style={{ fontSize: isMobile ? '11px' : '12px' }}>{email}</code>,
    },
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      render: (name?: string) => name || <Text type="secondary">-</Text>,
      responsive: ['md'] as any,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          ACTIVE: 'success',
          BOUNCED: 'error',
          UNSUBSCRIBED: 'warning',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
      responsive: ['md'] as any,
    },
  ];

  const whatsappColumns = [
    {
      title: 'Phone',
      dataIndex: 'phone',
      key: 'phone',
      render: (phone: string) => <code style={{ fontSize: isMobile ? '11px' : '12px' }}>{phone}</code>,
    },
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      render: (name?: string) => name || <Text type="secondary">-</Text>,
      responsive: ['md'] as any,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          ACTIVE: 'success',
          INACTIVE: 'default',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
    {
      title: 'Source',
      dataIndex: 'source',
      key: 'source',
      render: (source?: string) => source || <Text type="secondary">-</Text>,
      responsive: ['md'] as any,
    },
    {
      title: 'Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString('id-ID'),
      responsive: ['md'] as any,
    },
  ];

  const stats = {
    totalEmails: emailContacts?.length || 0,
    activeEmails: emailContacts?.filter((c) => c.status === 'ACTIVE').length || 0,
    totalWhatsApp: whatsappContacts?.length || 0,
    activeWhatsApp: whatsappContacts?.filter((c) => c.status === 'ACTIVE').length || 0,
  };

  return (
    <div style={{ padding: isMobile ? '12px' : '24px', minHeight: '100vh', background: isMobile ? '#f5f5f5' : 'transparent' }}>
      <div style={{ marginBottom: isMobile ? 16 : 24 }}>
        <Title level={2} style={{ fontSize: isMobile ? 20 : 24, margin: 0 }}>
          Kontak
        </Title>
        {isMobile && (
          <div style={{ marginTop: 8, fontSize: 14, color: '#666' }}>
            Kelola kontak email dan WhatsApp Anda
          </div>
        )}
      </div>

      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Email"
              value={stats.totalEmails}
              prefix={<MailOutlined />}
              valueStyle={{ fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Email Aktif"
              value={stats.activeEmails}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600', fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total WhatsApp"
              value={stats.totalWhatsApp}
              prefix={<MessageOutlined />}
              valueStyle={{ fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="WA Aktif"
              value={stats.activeWhatsApp}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600', fontSize: isMobile ? 20 : 24 }}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Space direction={isMobile ? 'vertical' : 'horizontal'} size={isMobile ? 12 : 16} style={{ width: isMobile ? '100%' : 'auto', marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setImportModalVisible(true)}
          size={isMobile ? 'large' : 'middle'}
          block={isMobile}
          style={isMobile ? { height: 48 } : {}}
        >
          Import dari Excel
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={fetchContacts}
          loading={fetching}
          size={isMobile ? 'large' : 'middle'}
          block={isMobile}
          style={isMobile ? { height: 48 } : {}}
        >
          Refresh
        </Button>
      </Space>

      {/* Contacts Table */}
      <Card style={{ borderRadius: 8 }}>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'email',
              label: (
                <span>
                  <MailOutlined /> Email Contacts ({emailContacts?.length || 0})
                </span>
              ),
              children: (
                <Table
                  columns={emailColumns}
                  dataSource={emailContacts || []}
                  loading={fetching}
                  rowKey="id"
                  pagination={{
                    pageSize: isMobile ? 5 : 10,
                    showSizeChanger: !isMobile,
                    showTotal: (total) => `Total ${total} email contacts`,
                  }}
                  scroll={{ x: isMobile ? 600 : 'max-content' }}
                  locale={{ emptyText: 'Belum ada email contact. Import dari Excel untuk menambahkan.' }}
                  size={isMobile ? 'small' : 'middle'}
                />
              ),
            },
            {
              key: 'whatsapp',
              label: (
                <span>
                  <MessageOutlined /> WhatsApp Contacts ({whatsappContacts?.length || 0})
                </span>
              ),
              children: (
                <Table
                  columns={whatsappColumns}
                  dataSource={whatsappContacts || []}
                  loading={fetching}
                  rowKey="id"
                  pagination={{
                    pageSize: isMobile ? 5 : 10,
                    showSizeChanger: !isMobile,
                    showTotal: (total) => `Total ${total} WhatsApp contacts`,
                  }}
                  scroll={{ x: isMobile ? 800 : 'max-content' }}
                  locale={{ emptyText: 'Belum ada WhatsApp contact. Import dari Excel untuk menambahkan.' }}
                  size={isMobile ? 'small' : 'middle'}
                />
              ),
            },
          ]}
        />
      </Card>

      {/* Import Modal */}
      <Modal
        title="Import Kontak dari Excel"
        open={importModalVisible}
        onCancel={handleImportModalClose}
        onOk={handleImport}
        okText="Import"
        cancelText="Batal"
        confirmLoading={importing}
        width={isMobile ? '95%' : 600}
        styles={{
          body: { padding: isMobile ? '20px 16px' : '24px' },
        }}
      >
        {!importResult ? (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Alert
              message="Format Excel"
              description={
                <div>
                  <div style={{ marginBottom: 8 }}>File Excel harus memiliki header di baris pertama:</div>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    <li>
                      <strong>email</strong> - untuk email contacts
                    </li>
                    <li>
                      <strong>phone/no_hp/wa</strong> - untuk WhatsApp contacts
                    </li>
                    <li>
                      <strong>name/nama</strong> - nama kontak (opsional)
                    </li>
                  </ul>
                  <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
                    Format yang didukung: .xlsx atau .xls (maks 5MB)
                  </div>
                </div>
              }
              type="info"
              showIcon
            />

            <Dragger {...uploadProps} style={{ padding: isMobile ? '20px' : '40px' }}>
              <p className="ant-upload-drag-icon">
                <FileExcelOutlined style={{ fontSize: 48, color: '#1890ff' }} />
              </p>
              <p className="ant-upload-text" style={{ fontSize: isMobile ? 14 : 16 }}>
                Klik atau drag file Excel ke sini
              </p>
              <p className="ant-upload-hint" style={{ fontSize: isMobile ? 12 : 14 }}>
                Hanya file .xlsx atau .xls yang didukung
              </p>
            </Dragger>
          </Space>
        ) : (
          <Space direction="vertical" size={16} style={{ width: '100%' }}>
            <Alert
              message={importResult.success ? 'Import Berhasil!' : 'Import Gagal'}
              type={importResult.success ? 'success' : 'error'}
              showIcon
            />

            {importResult.summary && (
              <>
                <div>
                  <Title level={5}>Ringkasan Import</Title>
                  <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
                    <Col xs={12} sm={12} md={6}>
                      <Statistic title="Total Baris" value={importResult.summary.rows || 0} />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                      <Statistic
                        title="Email Dibuat"
                        value={importResult.summary.emails?.created || 0}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                      <Statistic
                        title="Email Diupdate"
                        value={importResult.summary.emails?.updated || 0}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                      <Statistic
                        title="Email Dilewati"
                        value={importResult.summary.emails?.skipped || 0}
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                      <Statistic
                        title="WA Dibuat"
                        value={importResult.summary.phones?.created || 0}
                        valueStyle={{ color: '#3f8600' }}
                      />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                      <Statistic
                        title="WA Diupdate"
                        value={importResult.summary.phones?.updated || 0}
                        valueStyle={{ color: '#1890ff' }}
                      />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                      <Statistic
                        title="WA Dilewati"
                        value={importResult.summary.phones?.skipped || 0}
                        valueStyle={{ color: '#cf1322' }}
                      />
                    </Col>
                  </Row>
                </div>

                {importResult.summary.errors && importResult.summary.errors.length > 0 && (
                  <div>
                    <Title level={5}>Error ({importResult.summary.errors.length})</Title>
                    <div style={{ maxHeight: 200, overflow: 'auto', marginTop: 8 }}>
                      {importResult.summary.errors.map((error, idx) => (
                        <div key={idx} style={{ fontSize: 12, color: '#cf1322', marginBottom: 4 }}>
                          Baris {error.row}: {error.reason}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}

            <Button type="primary" block onClick={handleImportModalClose} size={isMobile ? 'large' : 'middle'}>
              Tutup
            </Button>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ContactsPage;

