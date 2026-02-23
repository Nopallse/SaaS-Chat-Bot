import { 
  Card,
  Row,
  Col,
  Table,
  Button,
  Tag,
  Space,
} from 'antd';
import { 
  UserOutlined, 
  CreditCardOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
  ArrowUpOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';

const summaryCards = [
  {
    label: 'Total Accounts',
    value: '1,248 total users',
    trend: '2%',
    icon: <UserOutlined className="text-xl" />,
  },
  {
    label: 'Active Accounts',
    value: '1,032 active',
    trend: '66%',
    icon: <UserOutlined className="text-xl" />,
  },
  {
    label: 'Inactive Accounts',
    value: '216 inactive',
    trend: '13%',
    icon: <UserOutlined className="text-xl" />,
  },
  {
    label: 'Total Payments',
    value: '312 transactions',
    trend: '87%',
    icon: <CreditCardOutlined className="text-xl" />,
  },
];

interface AccountData {
  key: string;
  no: number;
  clientId: string;
  email: string;
  signUpDate: string;
  status: string;
}

interface PaymentData {
  key: string;
  no: number;
  orderId: string;
  orderDate: string;
  paymentMethod: string;
  totalPayment: string;
}

const latestAccounts: AccountData[] = [
  { key: '1', no: 1, clientId: '#TRX-00124', email: 'rahmat2112@gmail.com', signUpDate: '27-02-2026', status: 'Active' },
  { key: '2', no: 1, clientId: '#TRX-00124', email: 'rahmat2112@gmail.com', signUpDate: '27-02-2026', status: 'Active' },
  { key: '3', no: 1, clientId: '#TRX-00124', email: 'rahmat2112@gmail.com', signUpDate: '27-02-2026', status: 'Active' },
  { key: '4', no: 1, clientId: '#TRX-00124', email: 'rahmat2112@gmail.com', signUpDate: '27-02-2026', status: 'Active' },
];

const latestPayments: PaymentData[] = [
  { key: '1', no: 1, orderId: '#TRX-00124', orderDate: '27-02-2026', paymentMethod: 'QRIS', totalPayment: 'Rp 400.000' },
  { key: '2', no: 1, orderId: '#TRX-00124', orderDate: '27-02-2026', paymentMethod: 'QRIS', totalPayment: 'Rp 400.000' },
  { key: '3', no: 1, orderId: '#TRX-00124', orderDate: '27-02-2026', paymentMethod: 'Cash', totalPayment: 'Rp 400.000' },
  { key: '4', no: 1, orderId: '#TRX-00124', orderDate: '27-02-2026', paymentMethod: 'Creditf', totalPayment: 'Rp 400.000' },
];

const monthlyNewUsers = [
  { month: 'Aug', value: 55 },
  { month: 'Sep', value: 25 },
  { month: 'Oct', value: 75 },
  { month: 'Nov', value: 90 },
  { month: 'Dec', value: 45 },
  { month: 'Jan', value: 65 },
];

const systemStatus = [
  { label: 'WhatsApp Service', value: 'Connected' },
  { label: 'Email Service', value: 'Active' },
  { label: 'Payment Gateway', value: 'Operational' },
  { label: 'AI Engine', value: 'Running normally' },
];

const AdminDashboardPage = () => {
  const accountColumns: ColumnsType<AccountData> = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      width: 60,
    },
    {
      title: 'Client ID',
      dataIndex: 'clientId',
      key: 'clientId',
      sorter: true,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      sorter: true,
    },
    {
      title: 'Sign-up Date',
      dataIndex: 'signUpDate',
      key: 'signUpDate',
      sorter: true,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Tag color="success" className="rounded-md px-3">{status}</Tag>
      ),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space size="middle">
          <Button type="text" icon={<DeleteOutlined />} />
          <Button type="text" icon={<EyeOutlined />} />
          <Button type="text" icon={<EditOutlined />} />
        </Space>
      ),
    },
  ];

  const paymentColumns: ColumnsType<PaymentData> = [
    {
      title: 'No',
      dataIndex: 'no',
      key: 'no',
      width: 60,
    },
    {
      title: 'Order ID',
      dataIndex: 'orderId',
      key: 'orderId',
      sorter: true,
    },
    {
      title: 'Order Date',
      dataIndex: 'orderDate',
      key: 'orderDate',
      sorter: true,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      key: 'paymentMethod',
      sorter: true,
    },
    {
      title: 'Total Payment',
      dataIndex: 'totalPayment',
      key: 'totalPayment',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: () => (
        <Space size="middle">
          <Button type="text" icon={<DeleteOutlined />} />
          <Button type="text" icon={<EyeOutlined />} />
          <Button type="text" icon={<EditOutlined />} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px', background: '#f5f5f5', minHeight: '100vh' }}>
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {summaryCards.map((card, index) => (
          <Col xs={24} sm={12} lg={6} key={index}>
            <Card 
              bordered={false}
              style={{ borderRadius: 16 }}
              bodyStyle={{ padding: 20 }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                <div style={{ 
                  width: 48, 
                  height: 48, 
                  background: '#e6f4ff', 
                  borderRadius: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0c73e0'
                }}>
                  {card.icon}
                </div>
                <Tag 
                  color="success" 
                  style={{ 
                    borderRadius: 6,
                    padding: '2px 10px',
                    border: 'none'
                  }}
                >
                  {card.trend} <ArrowUpOutlined style={{ fontSize: 10 }} />
                </Tag>
              </div>
              <div style={{ color: '#8c8c8c', fontSize: 12, marginBottom: 4 }}>
                {card.label}
              </div>
              <div style={{ fontSize: 18, fontWeight: 600, color: '#262626' }}>
                {card.value}
              </div>
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
              title={<span style={{ fontSize: 14, color: '#8c8c8c' }}>Latest Accounts</span>}
              extra={
                <Button type="primary" style={{ borderRadius: 8 }}>
                  View all accounts
                </Button>
              }
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Table
                columns={accountColumns}
                dataSource={latestAccounts}
                pagination={false}
                style={{
                  '--ant-table-header-bg': '#e6f4ff',
                } as React.CSSProperties}
              />
            </Card>

            {/* Latest Payments */}
            <Card
              title={<span style={{ fontSize: 14, color: '#8c8c8c' }}>Latest Payment</span>}
              extra={
                <Button type="primary" style={{ borderRadius: 8 }}>
                  View all payment
                </Button>
              }
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Table
                columns={paymentColumns}
                dataSource={latestPayments}
                pagination={false}
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
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
                    Monthly New Users
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 'normal' }}>
                    Last 6 months
                  </div>
                </div>
              }
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <div style={{ position: 'relative', height: 220, paddingLeft: 30 }}>
                {/* Y-axis labels */}
                <div style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 30,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  fontSize: 11,
                  color: '#8c8c8c'
                }}>
                  <span>4k</span>
                  <span>3k</span>
                  <span>2k</span>
                  <span>1k</span>
                  <span>0</span>
                </div>

                {/* Bars */}
                <div style={{
                  display: 'flex',
                  alignItems: 'flex-end',
                  justifyContent: 'space-between',
                  height: '100%',
                  paddingBottom: 30,
                  gap: 8
                }}>
                  {monthlyNewUsers.map((item, index) => (
                    <div key={index} style={{
                      flex: 1,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 8,
                      height: '100%',
                      justifyContent: 'flex-end'
                    }}>
                      <div style={{
                        width: '100%',
                        background: `rgba(24, 144, 255, ${0.3 + (item.value / 100) * 0.5})`,
                        borderRadius: '8px 8px 0 0',
                        height: `${item.value}%`,
                        transition: 'all 0.3s'
                      }} />
                      <span style={{ fontSize: 11, color: '#8c8c8c' }}>
                        {item.month}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* System Status */}
            <Card
              title={
                <div>
                  <div style={{ fontSize: 16, fontWeight: 600, color: '#262626' }}>
                    System Status
                  </div>
                  <div style={{ fontSize: 12, color: '#8c8c8c', fontWeight: 'normal' }}>
                    All systems operational
                  </div>
                </div>
              }
              bordered={false}
              style={{ borderRadius: 16 }}
            >
              <Space direction="vertical" size={12} style={{ width: '100%' }}>
                {systemStatus.map((item, index) => (
                  <div key={index} style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '4px 0'
                  }}>
                    <span style={{ fontSize: 14, color: '#262626' }}>
                      {item.label}
                    </span>
                    <span style={{ fontSize: 14, color: '#8c8c8c' }}>
                      {item.value}
                    </span>
                  </div>
                ))}
                
                <Button 
                  block 
                  style={{ 
                    marginTop: 16,
                    borderRadius: 8,
                    borderColor: '#0c73e0',
                    color: '#0c73e0'
                  }}
                >
                  Refresh
                </Button>
                <div style={{ 
                  textAlign: 'right', 
                  fontSize: 11, 
                  color: '#bfbfbf',
                  marginTop: 8
                }}>
                  Last checked 2 minutes ago
                </div>
              </Space>
            </Card>
          </Space>
        </Col>
      </Row>
    </div>
  );
};

export default AdminDashboardPage;