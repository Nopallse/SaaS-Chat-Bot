import { useEffect, useState } from 'react';
import { Typography, Row, Col, Card, Space, Tag, Button, Alert, message } from 'antd';
import { CheckCircleOutlined, CreditCardOutlined } from '@ant-design/icons';
import { userPackageApi, type UserPackage, type UserSubscription } from '../services/userPackageApi';

const { Title, Paragraph, Text } = Typography;

const UserPackagesPage = () => {
  const [packages, setPackages] = useState<UserPackage[]>([]);
  const [subscription, setSubscription] = useState<UserSubscription | null>(null);
  const [loading, setLoading] = useState(false);
  const [creatingPackageId, setCreatingPackageId] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [packageResp, activeSubscription] = await Promise.all([
        userPackageApi.getPackages(),
        userPackageApi.getActiveSubscription(),
      ]);
      setPackages(packageResp.packages);
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

  const handleChoosePackage = async (packageId: string) => {
    setCreatingPackageId(packageId);
    try {
      const order = await userPackageApi.createOrder(packageId);
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
    <div>
      <Title level={2}>Paket Berlangganan</Title>
      <Paragraph type="secondary" style={{ maxWidth: 760 }}>
        Pilih paket yang sesuai dengan kebutuhan bisnis Anda. Setelah pembayaran berhasil, paket akan aktif otomatis.
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

                  {pkg.features.length > 0 && (
                    <Space wrap>
                      {pkg.features.map((feature) => (
                        <Tag color="blue" key={feature}>
                          {feature}
                        </Tag>
                      ))}
                    </Space>
                  )}

                  <Space direction="vertical" size={6} style={{ width: '100%' }}>
                    {pkg.benefits.map((benefit) => (
                      <Space key={benefit} align="start" size={8}>
                        <CheckCircleOutlined style={{ color: '#52c41a', marginTop: 3 }} />
                        <Text>{benefit}</Text>
                      </Space>
                    ))}
                  </Space>

                  <Button
                    type={isActivePackage ? 'default' : 'primary'}
                    icon={<CreditCardOutlined />}
                    disabled={isActivePackage}
                    loading={creatingPackageId === pkg.id}
                    onClick={() => handleChoosePackage(pkg.id)}
                    block
                  >
                    {isActivePackage ? 'Paket Aktif' : 'Pilih Paket'}
                  </Button>
                </Space>
              </Card>
            </Col>
          );
        })}
      </Row>
    </div>
  );
};

export default UserPackagesPage;
