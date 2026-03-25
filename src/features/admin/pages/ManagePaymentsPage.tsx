import { useState, useEffect } from 'react';
import {
    Typography,
    Table,
    Tag,
    Button,
    Space,
    Modal,
    Form,
    Select,
    message,
    Popconfirm,
    DatePicker,
    Input,
} from 'antd';
import {
    DeleteOutlined,
    EditOutlined,
    DownloadOutlined,
    EyeOutlined,
} from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../services/adminApi';
import type { PaymentData, UpdatePaymentDto } from '../types/admin';
import { useNavigate } from 'react-router-dom';

const { Title } = Typography;
const { RangePicker } = DatePicker;
const { Search } = Input;

const ManagePaymentsPage = () => {
    const navigate = useNavigate();
    const [data, setData] = useState<PaymentData[]>([]);
    const [loading, setLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateRange, setDateRange] = useState<[string, string] | null>(null);

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPayment, setEditingPayment] = useState<PaymentData | null>(null);
    const [form] = Form.useForm();

    const fetchPayments = async () => {
        setLoading(true);
        try {
            const resp = await adminApi.getPayments(
                page,
                pageSize,
                search || undefined,
                statusFilter,
                dateRange?.[0],
                dateRange?.[1],
            );
            setData(resp.data || []);
            setTotal(resp.total || 0);
        } catch (error) {
            message.error('Gagal memuat data pembayaran');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPayments();
    }, [page, pageSize, search, statusFilter, dateRange]);

    const handleSearch = (value: string) => {
        setSearch(value);
        setPage(1);
    };

    const handleEditStatus = (record: PaymentData) => {
        setEditingPayment(record);
        const backendStatus =
            record.status === 'Paid'
                ? 'SUCCESS'
                : record.status === 'Pending'
                    ? 'PENDING'
                    : 'FAILED';
        form.setFieldsValue({ status: backendStatus });
        setIsModalVisible(true);
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingPayment) {
                await adminApi.updatePayment(editingPayment.id, values as UpdatePaymentDto);
                message.success('Status pembayaran berhasil diupdate');
            }
            setIsModalVisible(false);
            fetchPayments();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await adminApi.deletePayment(id);
            message.success('Pembayaran berhasil dihapus');
            fetchPayments();
        } catch (error) {
            message.error('Gagal menghapus pembayaran');
        }
    };

    const handleExport = async () => {
        try {
            message.loading('Mengunduh file...', 0);
            await adminApi.exportPayments(
                statusFilter !== 'all' ? statusFilter : undefined,
                dateRange?.[0],
                dateRange?.[1],
            );
            message.destroy();
            message.success('File berhasil diunduh');
        } catch (error) {
            message.destroy();
            message.error('Gagal mengunduh file');
        }
    };

    const statusColorMap: Record<string, string> = {
        Paid: 'green',
        Pending: 'orange',
        Failed: 'red',
    };

    const columns: ColumnsType<PaymentData> = [
        { title: 'No', dataIndex: 'no', key: 'no', width: 60 },
        { title: 'Order ID', dataIndex: 'orderId', key: 'orderId' },
        { title: 'Tanggal', dataIndex: 'tanggalPesan', key: 'tanggalPesan' },
        { title: 'Metode', dataIndex: 'paymentMethod', key: 'paymentMethod' },
        {
            title: 'Total',
            dataIndex: 'totalPembayaran',
            key: 'totalPembayaran',
            render: (val: number) => `Rp ${val?.toLocaleString('id-ID') || 0}`,
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => <Tag color={statusColorMap[status] || 'default'}>{status}</Tag>,
        },
        {
            title: 'Aksi',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EyeOutlined />} onClick={() => navigate(`/admin/payments/${record.id}`)} />
                    <Button type="link" icon={<EditOutlined />} onClick={() => handleEditStatus(record)} />
                    <Popconfirm
                        title="Hapus pembayaran ini?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Ya"
                        cancelText="Batal"
                    >
                        <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Manajemen Pembayaran</Title>
                <Button type="primary" icon={<DownloadOutlined />} onClick={handleExport}>
                    Export Excel
                </Button>
            </div>

            <div style={{ marginBottom: 16, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Search
                    placeholder="Cari order ID atau email..."
                    allowClear
                    onSearch={handleSearch}
                    style={{ width: 280 }}
                />
                <Select
                    value={statusFilter}
                    onChange={(val) => {
                        setStatusFilter(val);
                        setPage(1);
                    }}
                    style={{ width: 150 }}
                >
                    <Select.Option value="all">Semua Status</Select.Option>
                    <Select.Option value="paid">Paid</Select.Option>
                    <Select.Option value="pending">Pending</Select.Option>
                    <Select.Option value="failed">Failed</Select.Option>
                </Select>
                <RangePicker
                    onChange={(_, dateStrings) => {
                        if (dateStrings[0] && dateStrings[1]) {
                            setDateRange(dateStrings as [string, string]);
                        } else {
                            setDateRange(null);
                        }
                        setPage(1);
                    }}
                />
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="orderId"
                loading={loading}
                pagination={{
                    current: page,
                    pageSize: pageSize,
                    total: total,
                    showSizeChanger: true,
                    onChange: (p, ps) => {
                        setPage(p);
                        setPageSize(ps);
                    },
                    showTotal: (total) => `Total ${total} transaksi`,
                }}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title="Update Status Pembayaran"
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                destroyOnClose
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="status" label="Status" rules={[{ required: true, message: 'Pilih status' }]}>
                        <Select>
                            <Select.Option value="PENDING">Pending</Select.Option>
                            <Select.Option value="SUCCESS">Success</Select.Option>
                            <Select.Option value="FAILED">Failed</Select.Option>
                            <Select.Option value="EXPIRED">Expired</Select.Option>
                        </Select>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default ManagePaymentsPage;
