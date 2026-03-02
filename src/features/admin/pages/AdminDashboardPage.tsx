import { useState, useEffect } from 'react';
import { Card, Row, Col, Table, Button, Tag, Space, message, Spin } from 'antd';
import {
  UserOutlined,
  CreditCardOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../services/adminApi';
import type {
  DashboardStatistik,
  UserTerbaru,
  UserBulanan,
  PembayaranTerbaru,
  StatusSistem,
} from '../types/admin';

const AdminDashboardPage = () => {
  const [statistik, setStatistik] = useState<DashboardStatistik | null>(null);
  const [userTerbaru, setUserTerbaru] = useState<UserTerbaru[]>([]);
  const [userBulanan, setUserBulanan] = useState<UserBulanan[]>([]);
  const [pembayaranTerbaru, setPembayaranTerbaru] = useState<PembayaranTerbaru[]>([]);
  const [statusSistem, setStatusSistem] = useState<StatusSistem | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    setLoading(true);
    try {
      const [stat, users, bulanan, payments, sistem] = await Promise.all([
        adminApi.getStatistik(),
        adminApi.getUserTerbaru(),
        adminApi.getUserBulanan(),
        adminApi.getPembayaranTerbaru(),
        adminApi.getStatusSistem(),
      ]);
      setStatistik(stat);
      setUserTerbaru(Array.isArray(users) ? users : []);
      setUserBulanan(Array.isArray(bulanan) ? bulanan : []);
      setPembayaranTerbaru(Array.isArray(payments) ? payments : []);
      setStatusSistem(sistem);
    } catch (error) {
      message.error('Gagal memuat data dashboard');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const summaryCards = statistik
    ? [
      {
        label: 'Total Akun',
        value: `${statistik.totalAkun} total users`,
        trend: `${statistik.pertumbuhanAkun}%`,
        trendUp: statistik.pertumbuhanAkun >= 0,
        icon: <UserOutlined className="text-xl" />,
      },
      {
        label: 'Akun Aktif',
        value: `${statistik.akunAktif} active`,
        trend: `${statistik.pertumbuhanAktif}%`,
        trendUp: statistik.pertumbuhanAktif >= 0,
        icon: <UserOutlined className="text-xl" />,
      },
      {
        label: 'Akun Nonaktif',
        value: `${statistik.akunNonaktif} inactive`,
        trend: `${statistik.pertumbuhanNonaktif}%`,
        trendUp: statistik.pertumbuhanNonaktif >= 0,
        icon: <UserOutlined className="text-xl" />,
      },
      {
        label: 'Total Transaksi',
        value: `${statistik.totalTransaksi} transactions`,
        trend: `${statistik.pertumbuhanTransaksi}%`,
        trendUp: statistik.pertumbuhanTransaksi >= 0,
        icon: <CreditCardOutlined className="text-xl" />,
      },
    ]
    : [];

  const accountColumns: ColumnsType<UserTerbaru> = [
    { title: 'No', dataIndex: 'no', key: 'no', width: 60 },
    { title: 'Client ID', dataIndex: 'idKlien', key: 'idKlien' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Sign-up Date', dataIndex: 'tanggalDaftar', key: 'tanggalDaftar' },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color={status === 'Active' ? 'success' : 'warning'} className="rounded-md px-3">
          {status}
        </Tag>
      ),
    },
  ];

  const paymentColumns: ColumnsType<PembayaranTerbaru> = [
    { title: 'No', dataIndex: 'no', key: 'no', width: 60 },
    { title: 'Order ID', dataIndex: 'idOrder', key: 'idOrder' },
    { title: 'Order Date', dataIndex: 'tanggalOrder', key: 'tanggalOrder' },
    { title: 'Payment Method', dataIndex: 'metodePembayaran', key: 'metodePembayaran' },
    {
      title: 'Total Payment',
      dataIndex: 'totalPembayaran',
      key: 'totalPembayaran',
      render: (val: number) => `Rp ${val?.toLocaleString('id-ID') || 0}`,
    },
  ];

  const maxJumlah = Math.max(...userBulanan.map((u) => u.jumlah), 1);

  const systemStatusItems = statusSistem
    ? [
      { label: 'WhatsApp Service', value: statusSistem.whatsapp },
      { label: 'Email Service', value: statusSistem.email },
      { label: 'Payment Gateway', value: statusSistem.paymentGateway },
      { label: 'AI Engine', value: statusSistem.aiEngine },
    ]
    : [];

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {summaryCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card bordered={false} style={{ borderRadius: 16 }} styles={{ body: { padding: 20 } }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    background: '#e6f4ff',
                    borderRadius: 12,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: '#0c73e0',
                  }}
                >
                  {card.icon}
                </div>
                <Tag
                  color={card.trendUp ? 'success' : 'error'}
                  style={{ borderRadius: 6, padding: '2px 10px', border: 'none' }}
                >
                  {card.trend}{' '}
                  {card.trendUp ? (
                    <ArrowUpOutlined style={{ fontSize: 10 }} />
                  ) : (
                    <ArrowDownOutlined style={{ fontSize: 10 }} />
                  )}
                </Tag>
              </div>
              <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>{card.label}</div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>{card.value}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row gutter={[24, 24]}>
        {/* Left Column - Tables */}
        <Col xs={24} lg={16}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Latest Accounts */}
            <Card
              title={<span style={{ fontSize: 14, color: '#8c8c8c' }}>Akun Terbaru</span>}
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Table
                columns={accountColumns}
                dataSource={userTerbaru}
                pagination={false}
                rowKey="no"
              />
            </Card>

            {/* Latest Payments */}
            <Card
              title={<span style={{ fontSize: 14, color: '#8c8c8c' }}>Pembayaran Terbaru</span>}
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Table
                columns={paymentColumns}
                dataSource={pembayaranTerbaru}
                pagination={false}
                rowKey="no"
              />
            </Card>
          </Space>
        </Col>

        {/* Right Column */}
        <Col xs={24} lg={8}>
          <Space direction="vertical" size={24} style={{ width: '100%' }}>
            {/* Monthly New Users Chart */}
            <Card
              title={
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>User Baru Bulanan</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 'normal' }}>12 bulan terakhir</div>
                </div>
              }
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <div style={{ position: 'relative', height: 220, paddingLeft: 30 }}>
                <div
                  style={{
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    bottom: 30,
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    fontSize: 11,
                    color: '#8c8c8c',
                  }}
                >
                  <span>{maxJumlah}</span>
                  <span>{Math.round(maxJumlah * 0.75)}</span>
                  <span>{Math.round(maxJumlah * 0.5)}</span>
                  <span>{Math.round(maxJumlah * 0.25)}</span>
                  <span>0</span>
                </div>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-end',
                    justifyContent: 'space-between',
                    height: '100%',
                    paddingBottom: 30,
                    gap: 4,
                  }}
                >
                  {userBulanan.map((item, index) => (
                    <div
                      key={index}
                      style={{
                        flex: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 8,
                        height: '100%',
                        justifyContent: 'flex-end',
                      }}
                    >
                      <div
                        style={{
                          width: '100%',
                          background: `rgba(24, 144, 255, ${0.3 + (item.jumlah / maxJumlah) * 0.7})`,
                          borderRadius: '8px 8px 0 0',
                          height: `${(item.jumlah / maxJumlah) * 100}%`,
                          minHeight: 4,
                          transition: 'all 0.3s',
                        }}
                      />
                      <span style={{ fontSize: 9, color: '#8c8c8c' }}>{item.bulan}</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* System Status */}
            <Card
              title={
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>Status Sistem</div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 'normal' }}>
                    Semua sistem operasional
                  </div>
                </div>
              }
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {systemStatusItems.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '4px 0',
                    }}
                  >
                    <span style={{ fontSize: 14, color: '#262626' }}>{item.label}</span>
                    <span style={{ fontSize: 14, color: '#8c8c8c' }}>{item.value}</span>
                  </div>
                ))}

                <Button
                  block
                  icon={<ReloadOutlined />}
                  onClick={fetchDashboard}
                  style={{
                    marginTop: 16,
                    borderRadius: 8,
                    borderColor: '#0c73e0',
                    color: '#0c73e0',
                  }}
                >
                  Refresh
                </Button>
                {statusSistem?.terakhirDicek && (
                  <div style={{ textAlign: 'right', fontSize: 11, color: '#bfbfbf', marginTop: 8 }}>
                    Terakhir dicek: {new Date(statusSistem.terakhirDicek).toLocaleString('id-ID')}
                  </div>
                )}
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;