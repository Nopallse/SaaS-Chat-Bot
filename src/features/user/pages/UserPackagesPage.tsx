import { useEffect, useState } from 'react';
import {
  Typography,
  Row,
  Col,
  Card,
  Space,
  Tag,
  Button,
  Alert,
  message,
  Checkbox,
  Divider,
  Modal,
} from 'antd';
import { CheckCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { userPackageApi, type UserPackage, type UserSubscription } from '../services/userPackageApi';
import { useAuth } from '@/hooks/useAuth';

const { Title, Paragraph, Text } = Typography;
const SNAP_SCRIPT_ID = 'midtrans-snap-script';
const SNAP_SCRIPT_URL =
  import.meta.env.VITE_MIDTRANS_SNAP_URL ||
  'https://app.sandbox.midtrans.com/snap/snap.js';

const UserPackagesPage = () => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const [packages, setPackages] = useState<UserPackage[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [clientKey, setClientKey] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [creatingPackageId, setCreatingPackageId] = useState<string | null>(null);
  const [confirmedPackages, setConfirmedPackages] = useState<Record<string, boolean>>({});
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedPackage, setSelectedPackage] = useState<UserPackage | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [packageResp, activeSubscription] = await Promise.all([
        userPackageApi.getPackages(),
        userPackageApi.getActiveSubscription(),
      ]);
      setPackages(packageResp.packages);
      setClientKey(packageResp.clientKey || '');
      setSubscription(activeSubscription);
    } catch (error) {
      message.error('Gagal memuat data paket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const loadSnapScript = async (activeClientKey: string) => {
    if (window.snap) {
      return window.snap;
    }

    const existing = document.getElementById(SNAP_SCRIPT_ID) as
      | HTMLScriptElement
      | null;

    if (existing) {
      await new Promise<void>((resolve, reject) => {
        existing.addEventListener('load', () => resolve(), { once: true });
        existing.addEventListener('error', () => reject(new Error('Gagal memuat Snap script')), { once: true });
      });
      if (window.snap) {
        return window.snap;
      }
    }

    await new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.id = SNAP_SCRIPT_ID;
      script.src = SNAP_SCRIPT_URL;
      script.setAttribute('data-client-key', activeClientKey);
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Gagal memuat Midtrans Snap'));
      document.body.appendChild(script);
    });

    if (!window.snap) {
      throw new Error('Snap tidak tersedia setelah script dimuat');
    }

    return window.snap;
  };

  const handleChoosePackage = async (packageId: string) => {
    if (!confirmedPackages[packageId]) {
      message.warning('Centang konfirmasi dulu sebelum lanjut pembayaran');
      return;
    }

    setCreatingPackageId(packageId);
    try {
      const order = await userPackageApi.createOrder(packageId);

      if (order.token && clientKey) {
        const snap = await loadSnapScript(clientKey);
        snap.pay(order.token, {
          onSuccess: async () => {
            message.success('Pembayaran berhasil');
            setDetailOpen(false);
            await fetchData();
            if (role === 'admin' && order.paymentId) {
              navigate(`/admin/payments/${order.paymentId}`);
            }
          },
          onPending: async () => {
            message.info('Pembayaran pending, silakan selesaikan pembayaran Anda');
            setDetailOpen(false);
            await fetchData();
            if (role === 'admin' && order.paymentId) {
              navigate(`/admin/payments/${order.paymentId}`);
            }
          },
          onError: () => {
            message.error('Pembayaran gagal diproses');
          },
          onClose: () => {
            message.warning('Popup pembayaran ditutup sebelum selesai');
          },
        });
        return;
      }

      if (!order.redirectUrl) {
        message.error('Gagal membuat order pembayaran');
        return;
      }

      message.info('Client key Snap belum tersedia, dialihkan ke halaman pembayaran Midtrans.');
      window.location.href = order.redirectUrl;
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal memproses pembayaran');
    } finally {
      setCreatingPackageId(null);
    }
  };

  const handleOpenDetail = (pkg: UserPackage) => {
    setSelectedPackage(pkg);
    setDetailOpen(true);
  };

  const selectedIsActive =
    selectedPackage && subscription?.packageId === selectedPackage.id;

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Title level={2} style={{ marginBottom: 0 }}>Paket Berlangganan</Title>
        <Button onClick={() => navigate('/user/payment')}>Kembali ke Payment</Button>
      </div>
      <Paragraph type="secondary" style={{ maxWidth: 760 }}>
        Pilih paket yang sesuai dengan kebutuhan bisnis Anda. Buka detail paket, konfirmasi persetujuan, lalu lanjutkan pembayaran.
      </Paragraph>

      {subscription && (
        <Alert
          type="success"
          showIcon
          style={{ marginBottom: 20 }}
          message={`Paket aktif saat ini: ${subscription.package.name}`}
          description={`Berlaku sampai ${new Date(subscription.endDate).toLocaleDateString('id-ID')}`}
        />
      )}

      <Row gutter={[16, 16]}>
        {packages.map((pkg) => {
          const isActivePackage = subscription?.packageId === pkg.id;
          const billingText = pkg.billingCycle === 'yearly' ? 'Tahunan' : 'Bulanan';
          return (
            <Col xs={24} md={12} lg={8} key={pkg.id}>
              <Card
                loading={loading}
                title={
                  <Space direction="vertical" size={0}>
                    <Text strong style={{ fontSize: 18 }}>{pkg.name}</Text>
                    <Text type="secondary">{billingText}</Text>
                  </Space>
                }
              >
                <Space direction="vertical" size={12} style={{ width: '100%' }}>
                  <Title level={3} style={{ margin: 0 }}>
                    {pkg.currency} {pkg.price.toLocaleString('id-ID')}
                  </Title>

                  <Paragraph style={{ margin: 0 }}>{pkg.description}</Paragraph>
                  <Button
                    type={isActivePackage ? 'default' : 'primary'}
                    disabled={isActivePackage}
                    onClick={() => handleOpenDetail(pkg)}
                    block
                  >
                    {isActivePackage ? 'Paket Aktif' : 'Lihat Detail'}
                  </Button>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>

      <Modal
        title={selectedPackage ? `Detail ${selectedPackage.name}` : 'Detail Paket'}
        open={detailOpen}
        onCancel={() => setDetailOpen(false)}
        footer={null}
        width={720}
      >
        {selectedPackage && (
          <Space direction="vertical" size={14} style={{ width: '100%' }}>
            <div>
              <Text strong>Deskripsi</Text>
              <Paragraph style={{ marginBottom: 0, marginTop: 4 }}>
                {selectedPackage.description}
              </Paragraph>
            </div>

            <div>
              <Text strong>Detail Paket</Text>
              <Divider style={{ margin: '8px 0' }} />
              <Space direction="vertical" size={4} style={{ width: '100%' }}>
                <Text>
                  Billing: {selectedPackage.billingCycle === 'yearly' ? 'Tahunan' : 'Bulanan'}
                </Text>
                <Text>
                  Harga: {selectedPackage.currency} {selectedPackage.price.toLocaleString('id-ID')}
                </Text>
              </Space>
            </div>

            {selectedPackage.features.length > 0 && (
              <div>
                <Text strong style={{ display: 'block', marginBottom: 6 }}>Fitur Utama</Text>
                <Space wrap>
                  {selectedPackage.features.map((feature) => (
                    <Tag color="blue" key={feature}>
                      {feature}
                    </Tag>
                  ))}
                </Space>
              </div>
            )}

            {selectedPackage.benefits.length > 0 && (
              <Space direction="vertical" size={6} style={{ width: '100%' }}>
                {selectedPackage.benefits.map((benefit) => (
                  <Space key={benefit} align="start" size={8}>
                    <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 3 }} />
                    <Text>{benefit}</Text>
                  </Space>
                ))}
              </Space>
            )}

            <Checkbox
              checked={Boolean(confirmedPackages[selectedPackage.id])}
              onChange={(event) => {
                setConfirmedPackages((prev) => ({
                  ...prev,
                  [selectedPackage.id]: event.target.checked,
                }));
              }}
              disabled={Boolean(selectedIsActive)}
            >
              Saya sudah membaca detail paket dan setuju melanjutkan pemesanan.
            </Checkbox>

            <Button
              type={selectedIsActive ? 'default' : 'primary'}
              icon={<CreditCardOutlined />}
              disabled={Boolean(selectedIsActive) || !confirmedPackages[selectedPackage.id]}
              loading={creatingPackageId === selectedPackage.id}
              onClick={() => handleChoosePackage(selectedPackage.id)}
              block
            >
              {selectedIsActive ? 'Paket Aktif' : 'Pesan Paket Ini'}
            </Button>
          </Space>
        )}
      </Modal>
    </div>
  );
};

export default UserPackagesPage;
