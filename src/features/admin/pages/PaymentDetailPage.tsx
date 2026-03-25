import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Alert,
  Button,
  Card,
  Descriptions,
  Skeleton,
  Space,
  Tag,
  Typography,
  message,
} from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { adminApi } from '../services/adminApi';
import type { PaymentDetailData } from '../types/admin';

const { Title, Text } = Typography;

const statusColorMap: Record<string, string> = {
  SUCCESS: 'green',
  PENDING: 'orange',
  FAILED: 'red',
  EXPIRED: 'default',
};

const formatMoney = (amount: number, currency: string) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency }).format(amount);

const formatDateTime = (value?: string | null) => {
  if (!value) return '-';
  return new Date(value).toLocaleString('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
};

const PaymentDetailPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const [loading, setLoading] = useState(true);
  const [payment, setPayment] = useState<PaymentDetailData | null>(null);

  const statusColor = useMemo(() => {
    if (!payment?.status) return 'default';
    return statusColorMap[payment.status] || 'default';
  }, [payment?.status]);

  useEffect(() => {
    const fetchPaymentDetail = async () => {
      if (!id) {
        message.error('ID pembayaran tidak valid');
        navigate('/admin/payments');
        return;
      }

      setLoading(true);
      try {
        const resp = await adminApi.getPaymentById(id);
        setPayment(resp as PaymentDetailData);
      } catch (error: any) {
        message.error(error?.response?.data?.message || 'Gagal memuat detail pembayaran');
      } finally {
        setLoading(false);
      }
    };

    fetchPaymentDetail();
  }, [id, navigate]);

  if (loading) {
    return <Skeleton active paragraph={{ rows: 8 }} />;
  }

  if (!payment) {
    return (
      <Alert
        type="warning"
        showIcon
        message="Detail pembayaran tidak ditemukan"
        action={<Button onClick={() => navigate('/admin/payments')}>Kembali</Button>}
      />
    );
  }

  return (
    <div>
      <Space align="center" style={{ marginBottom: 16 }}>
        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/admin/payments')}>
          Kembali
        </Button>
        <Title level={3} style={{ margin: 0 }}>
          Detail Pembayaran
        </Title>
      </Space>

      <Card>
        <Descriptions column={1} bordered size="middle">
          <Descriptions.Item label="Status">
            <Tag color={statusColor}>{payment.status}</Tag>
          </Descriptions.Item>
          <Descriptions.Item label="Order ID">{payment.orderId}</Descriptions.Item>
          <Descriptions.Item label="Payment ID">{payment.id}</Descriptions.Item>
          <Descriptions.Item label="Pelanggan">
            {payment.user?.name || '-'} ({payment.user?.email || '-'})
          </Descriptions.Item>
          <Descriptions.Item label="Jumlah">
            {formatMoney(payment.amount, payment.currency)}
          </Descriptions.Item>
          <Descriptions.Item label="Metode Pembayaran">
            {payment.paymentType || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Transaction ID">
            {payment.transactionId || '-'}
          </Descriptions.Item>
          <Descriptions.Item label="Tanggal Dibayar">
            {formatDateTime(payment.paidAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Dibuat Pada">
            {formatDateTime(payment.createdAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Diupdate Pada">
            {formatDateTime(payment.updatedAt)}
          </Descriptions.Item>
          <Descriptions.Item label="Snap URL">
            {payment.snapUrl ? (
              <a href={payment.snapUrl} target="_blank" rel="noreferrer">
                Buka Midtrans URL
              </a>
            ) : (
              '-'
            )}
          </Descriptions.Item>
          <Descriptions.Item label="Metadata">
            <Text style={{ whiteSpace: 'pre-wrap' }}>
              {payment.metadata || '-'}
            </Text>
          </Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default PaymentDetailPage;
