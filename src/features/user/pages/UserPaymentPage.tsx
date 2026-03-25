import { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  Button,
  Tag,
  message,
} from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import {
  userPackageApi,
  type PaymentRecord,
} from '../services/userPackageApi';

const { Title } = Typography;

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
  const navigate = useNavigate();
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

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

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>Payment</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={() => navigate('/user/packages')}
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
    </>
  );
};

export default UserPaymentPage;
