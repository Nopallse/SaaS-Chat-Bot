import { useState, useEffect } from 'react';
import { utils as xlsxUtils, writeFile } from 'xlsx';
import {
  Card,
  Button,
  Table,
  Tag,
  Upload,
  Space,
  Typography,
  Modal,
  Alert,
  Statistic,
  Row,
  Col,
  theme,
} from 'antd';
import {
  UploadOutlined,
  ReloadOutlined,
  MailOutlined,
  FileExcelOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
} from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { contactsApi } from '@/features/contacts/services/contactsApi';
import type { EmailContact, ImportResponse } from '@/features/contacts/types/contacts';
import { useNotification } from '@/hooks/useNotification';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const ContactsTab = () => {
  const { token } = theme.useToken();
  const [fetching, setFetching] = useState(true);
  const [emailContacts, setEmailContacts] = useState<EmailContact[]>([]);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState<ImportResponse | null>(null);
  const [fileList, setFileList] = useState<UploadFile[]>([]);
  const { showSuccess, showError } = useNotification();

  useEffect(() => {
    fetchContacts();
  }, []);

  const fetchContacts = async () => {
    setFetching(true);
    try {
      const data = await contactsApi.getContacts();
      setEmailContacts(data?.emails || []);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal memuat contacts';
      showError(msg);
      setEmailContacts([]);
    } finally {
      setFetching(false);
    }
  };

  const handleImport = async () => {
    if (fileList.length === 0) {
      showError('Silakan pilih file Excel terlebih dahulu');
      return;
    }

    const fileItem = fileList[0];
    let file: File | undefined;

    if (fileItem.originFileObj instanceof File) {
      file = fileItem.originFileObj;
    } else if (fileItem instanceof File) {
      file = fileItem as File;
    } else {
      const rawFile = (fileItem as any).file || (fileItem as any);
      if (rawFile instanceof File) {
        file = rawFile;
      }
    }

    if (!file || !(file instanceof File)) {
      showError('File tidak valid. Pastikan file adalah file Excel (.xlsx atau .xls)');
      return;
    }

    const validExtensions = ['.xlsx', '.xls'];
    const fileName = file.name.toLowerCase();
    const isValidType = validExtensions.some((ext) => fileName.endsWith(ext));

    if (!isValidType) {
      showError('Format file tidak didukung. Hanya file .xlsx atau .xls yang didukung');
      return;
    }

    const maxSize = 5 * 1024 * 1024;
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

  const handleDownloadTemplate = () => {
    const templateData = [
      {
        email: 'example@email.com',
        name: 'John Doe',
      },
      {
        email: 'another@email.com',
        name: 'Jane Smith',
      },
    ];

    const ws = xlsxUtils.json_to_sheet(templateData);
    const wb = xlsxUtils.book_new();
    xlsxUtils.book_append_sheet(wb, ws, 'Email Contacts');
    writeFile(wb, 'email_contacts_template.xlsx');
    showSuccess('Template berhasil diunduh!');
  };

  const uploadProps: UploadProps = {
    name: 'file',
    accept: '.xlsx,.xls',
    fileList,
    beforeUpload: (file) => {
      const validExtensions = ['.xlsx', '.xls'];
      const fileName = file.name.toLowerCase();
      const isValidType = validExtensions.some((ext) => fileName.endsWith(ext));

      if (!isValidType) {
        showError('Format file tidak didukung. Hanya file .xlsx atau .xls yang didukung');
        return Upload.LIST_IGNORE;
      }

      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        showError('File terlalu besar. Maksimal ukuran file adalah 5MB');
        return Upload.LIST_IGNORE;
      }

      const fileItem: UploadFile = {
        uid: file.uid || `-${Date.now()}`,
        name: file.name,
        status: 'done',
        originFileObj: file,
      };
      setFileList([fileItem]);
      return false;
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
      render: (email: string) => <code style={{ fontSize: '12px' }}>{email}</code>,
    },
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      render: (name?: string) => name || <Text type="secondary">-</Text>,
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
    },
  ];

  const stats = {
    totalEmails: emailContacts?.length || 0,
    activeEmails: emailContacts?.filter((c) => c.status === 'ACTIVE').length || 0,
  };

  return (
    <div>
      {/* Statistics */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Total Email"
              value={stats.totalEmails}
              prefix={<MailOutlined />}
            />
          </Card>
        </Col>
        <Col xs={12} sm={12} md={6}>
          <Card>
            <Statistic
              title="Email Aktif"
              value={stats.activeEmails}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Action Buttons */}
      <Space size={16} style={{ marginBottom: 16 }}>
        <Button
          type="primary"
          icon={<UploadOutlined />}
          onClick={() => setImportModalVisible(true)}
        >
          Import dari Excel
        </Button>
        <Button icon={<DownloadOutlined />} onClick={handleDownloadTemplate}>
          Download Template
        </Button>
        <Button icon={<ReloadOutlined />} onClick={fetchContacts} loading={fetching}>
          Refresh
        </Button>
      </Space>

      {/* Contacts Table */}
      <Card style={{ borderRadius: 8 }}>
        <Table
          columns={emailColumns}
          dataSource={emailContacts || []}
          loading={fetching}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showTotal: (total) => `Total ${total} email contacts`,
          }}
          scroll={{ x: 'max-content' }}
          locale={{ emptyText: 'Belum ada email contact. Import dari Excel untuk menambahkan.' }}
        />
      </Card>

      {/* Import Modal */}
      <Modal
        title="Import Kontak Email dari Excel"
        open={importModalVisible}
        onCancel={handleImportModalClose}
        onOk={handleImport}
        okText="Import"
        cancelText="Batal"
        confirmLoading={importing}
        width={600}
        styles={{
          body: { padding: '24px' },
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
                      <strong>email</strong> - alamat email (wajib)
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

            <Dragger {...uploadProps} style={{ padding: '40px' }}>
              <p className="ant-upload-drag-icon">
                <FileExcelOutlined style={{ fontSize: 48, color: token.colorPrimary }} />
              </p>
              <p className="ant-upload-text">Klik atau drag file Excel ke sini</p>
              <p className="ant-upload-hint">Hanya file .xlsx atau .xls yang didukung</p>
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
                        valueStyle={{ color: token.colorPrimary }}
                      />
                    </Col>
                    <Col xs={12} sm={12} md={6}>
                      <Statistic
                        title="Email Dilewati"
                        value={importResult.summary.emails?.skipped || 0}
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

            <Button type="primary" block onClick={handleImportModalClose}>
              Tutup
            </Button>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default ContactsTab;
