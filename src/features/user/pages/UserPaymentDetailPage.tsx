import { useEffect, useState } from 'react';
import { Alert, Button, Card, Descriptions, Space, Spin, Tag, Typography, message } from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { useNavigate, useParams } from 'react-router-dom';
import { type PaymentRecord, userPackageApi } from '../services/userPackageApi';

const { Title, Text } = Typography;

const statusColor: Record<string, string> = {
  PENDING: 'orange',
  SUCCESS: 'green',
  FAILED: 'red',
  EXPIRED: 'default',
};

const formatAmount = (amount: number, currency: string) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(amount);

const formatDateTime = (value: string | null) =>
  value ? new Date(value).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-';

const UserPaymentDetailPage = () => {
  const navigate = useNavigate();
  const { orderId = '' } = useParams();

  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [payment, setPayment] = useState<PaymentRecord | null>(null);

  const fetchPayment = async () => {
    setLoading(true);
    try {
      const history = await userPackageApi.getPaymentHistory();
      const found = history.find((item) => item.orderId === orderId) || null;
      setPayment(found);
    } catch {
      message.error('Gagal memuat detail payment');
    } finally {
      setLoading(false);
    }
  };

  const handleSyncStatus = async () => {
    if (!orderId) {
      return;
    }

    setSyncing(true);
    try {
      await userPackageApi.checkPaymentStatus(orderId);
      await fetchPayment();
      message.success('Status payment berhasil diperbarui');
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal sinkron status payment');
    } finally {
      setSyncing(false);
    }
  };

  useEffect(() => {
    fetchPayment();
  }, [orderId]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', padding: 48 }}>
        <Spin size="large" />
      </div>
    );
  }

  if (!payment) {
    return (
      <Card>
        <Space direction="vertical" size={16} style={{ width: '100%' }}>
          <Alert type="warning" showIcon message="Payment tidak ditemukan" />
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/user/payment')}>
            Kembali ke Payment
          </Button>
        </Space>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={3} style={{ margin: 0 }}>Detail Payment</Title>
        <Space>
          <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/user/payment')}>
            Kembali
          </Button>
          <Button type="primary" icon={<ReloadOutlined />} loading={syncing} onClick={handleSyncStatus}>
            Refresh Status
          </Button>
        </Space>
      </div>

      <Card>
        <Descriptions bordered column={1} size="middle">
          <Descriptions.Item label="Order ID">
            <Text copyable>{payment.orderId}</Text>
          </Descriptions.Item>
          <Descriptions.Item label="Status">
            <Tag color={statusColor[payment.status] ?? 'default'}>{payment.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Total Pembayaran">
            {formatAmount(payment.amount, payment.currency)}
          </Descriptions.Item>
          <Descriptions.Item label="Payment Type">{payment.paymentType || '-'}</Descriptions.Item>
          <Descriptions.Item label="Transaction ID">{payment.transactionId || '-'}</Descriptions.Item>
          <Descriptions.Item label="Paid At">{formatDateTime(payment.paidAt)}</Descriptions.Item>
          <Descriptions.Item label="Created At">{formatDateTime(payment.createdAt)}</Descriptions.Item>
          <Descriptions.Item label="Package ID">{payment.packageId || '-'}</Descriptions.Item>
        </Descriptions>
      </Card>
    </Space>
  );
};

export default UserPaymentDetailPage;