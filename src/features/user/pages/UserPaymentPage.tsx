import { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  Button,
  Tag,
  Modal,
  Row,
  Col,
  Card,
  Space,
  message,
  Spin,
} from 'antd';
import { PlusOutlined, CheckCircleOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import {
  userPackageApi,
  type PaymentRecord,
  type UserPackage,
} from '../services/userPackageApi';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  PENDING: 'orange',
  SUCCESS: 'green',
  FAILED: 'red',
  EXPIRED: 'default',
};

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(amount);

const formatDate = (date: string | null) =>
  date ? new Date(date).toLocaleDateString('id-ID', { dateStyle: 'medium' }) : '-';

const columns: ColumnsType<PaymentRecord> = [
  {
    title: 'Order ID',
    dataIndex: 'orderId',
    key: 'orderId',
    ellipsis: true,
    width: 220,
  },
  {
    title: 'Amount',
    key: 'amount',
    render: (_, record) => formatAmount(record.amount, record.currency),
  },
  {
    title: 'Status',
    dataIndex: 'status',
    key: 'status',
    render: (status: string) => (
      <Tag color={statusColor[status] ?? 'default'}>{status}</Tag>
    ),
  },
  {
    title: 'Payment Type',
    dataIndex: 'paymentType',
    key: 'paymentType',
    render: (val: string | null) => val ?? '-',
  },
  {
    title: 'Paid At',
    dataIndex: 'paidAt',
    key: 'paidAt',
    render: (val: string | null) => formatDate(val),
  },
  {
    title: 'Created At',
    dataIndex: 'createdAt',
    key: 'createdAt',
    render: (val: string) => formatDate(val),
  },
];

const UserPaymentPage = () => {
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [packages, setPackages] = useState<UserPackage[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [loadingPackages, setLoadingPackages] = useState(false);
  const [creatingPackageId, setCreatingPackageId] = useState<string | null>(null);

  const fetchHistory = async () => {
    setLoadingHistory(true);
    try {
      const history = await userPackageApi.getPaymentHistory();
      setPayments(history);
    } catch {
      message.error('Gagal memuat riwayat pembayaran');
    } finally {
      setLoadingHistory(false);
    }
  };

  const fetchPackages = async () => {
    setLoadingPackages(true);
    try {
      const resp = await userPackageApi.getPackages();
      setPackages(resp.packages);
    } catch {
      message.error('Gagal memuat daftar paket');
    } finally {
      setLoadingPackages(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const handleOpenModal = () => {
    setModalOpen(true);
    if (packages.length === 0) fetchPackages();
  };

  const handleChoosePackage = async (pkg: UserPackage) => {
    setCreatingPackageId(pkg.id);
    try {
      const order = await userPackageApi.createOrder(pkg.id);
      if (!order.redirectUrl) {
        message.error('Gagal membuat order pembayaran');
        return;
      }
      window.location.href = order.redirectUrl;
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal memproses pembayaran');
    } finally {
      setCreatingPackageId(null);
    }
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Payment</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleOpenModal}
        >
          Add New Package
        </Button>
      </div>

      <Table<PaymentRecord>
        columns={columns}
        dataSource={payments}
        rowKey="id"
        loading={loadingHistory}
        pagination={{ pageSize: 10 }}
        scroll={{ x: 700 }}
      />

      <Modal
        title="Pilih Paket"
        open={modalOpen}
        onCancel={() => setModalOpen(false)}
        footer={null}
        width={800}
      >
        {loadingPackages ? (
          <div style={{ textAlign: 'center', padding: 40 }}>
            <Spin size="large" />
          </div>
        ) : (
          <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
            {packages.map((pkg) => (
              <Col key={pkg.id} xs={24} sm={12} md={8}>
                <Card
                  hoverable
                  style={{ height: '100%' }}
                  actions={[
                    <Button
                      key="choose"
                      type="primary"
                      block
                      loading={creatingPackageId === pkg.id}
                      onClick={() => handleChoosePackage(pkg)}
                    >
                      Pilih
                    </Button>,
                  ]}
                >
                  <Title level={5} style={{ marginBottom: 4 }}>{pkg.name}</Title>
                  <Text type="secondary" style={{ display: 'block', marginBottom: 8, fontSize: 12 }}>
                    {pkg.billingCycle === 'monthly' ? 'Bulanan' : 'Tahunan'}
                  </Text>
                  <Text strong style={{ fontSize: 18 }}>
                    {formatAmount(pkg.price, pkg.currency)}
                  </Text>
                  {pkg.benefits.length > 0 && (
                    <Space direction="vertical" size={4} style={{ width: '100%', marginTop: 12 }}>
                      {pkg.benefits.map((b, i) => (
                        <Space key={i} size={6}>
                          <CheckCircleOutlined style={{ color: '#52c41a', fontSize: 13 }} />
                          <Text style={{ fontSize: 12 }}>{b}</Text>
                        </Space>
                      ))}
                    </Space>
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        )}
      </Modal>
    </>
  );
};

export default UserPaymentPage;
