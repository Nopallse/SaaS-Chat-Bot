import { useState, useEffect } from 'react';
import {
    Typography,
    Table,
    Tag,
    Button,
    Space,
    Modal,
    Form,
    Input,
    InputNumber,
    Select,
    Switch,
    message,
    Popconfirm,
} from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../services/adminApi';
import type { PackageData, CreatePackageDto, UpdatePackageDto, PackageListOption } from '../types/admin';

const { Title } = Typography;
const { TextArea } = Input;

const ManagePackagesPage = () => {
    const [data, setData] = useState<PackageData[]>([]);
    const [packageListOptions, setPackageListOptions] = useState<PackageListOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingPackage, setEditingPackage] = useState<PackageData | null>(null);
    const [form] = Form.useForm();

    const fetchPackages = async () => {
        setLoading(true);
        try {
            const packages = await adminApi.getPackages();
            setData(packages);
        } catch (error) {
            message.error('Gagal memuat data paket');
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const fetchPackageLists = async () => {
        try {
            const lists = await adminApi.getPackageLists();
            setPackageListOptions(lists);
        } catch (error) {
            message.error('Gagal memuat daftar fitur paket');
            console.error(error);
        }
    };

    useEffect(() => {
        fetchPackages();
        fetchPackageLists();
    }, []);

    const handleAdd = () => {
        setEditingPackage(null);
        form.resetFields();
        form.setFieldsValue({ currency: 'IDR', billingCycle: 'monthly' });
        setIsModalVisible(true);
    };

    const handleEdit = async (record: PackageData) => {
        try {
            const options = packageListOptions.length ? packageListOptions : await adminApi.getPackageLists();
            if (!packageListOptions.length) {
                setPackageListOptions(options);
            }

            const selectedIds = (record.features || [])
                .map((featureName) => options.find((opt) => opt.name === featureName)?.id)
                .filter((id): id is string => Boolean(id));

            setEditingPackage(record);
            form.setFieldsValue({
                name: record.name,
                description: record.description,
                price: record.price,
                currency: record.currency,
                billingCycle: record.billingCycle,
                packageListIds: selectedIds,
                isActive: record.isActive,
            });
            setIsModalVisible(true);
        } catch (error) {
            message.error('Gagal memuat data fitur paket');
            console.error(error);
        }
    };

    const handleDelete = async (id: string) => {
        try {
            await adminApi.deletePackage(id);
            message.success('Paket berhasil dihapus');
            fetchPackages();
        } catch (error) {
            message.error('Gagal menghapus paket');
        }
    };

    const handleModalOk = async () => {
        try {
            const values = await form.validateFields();
            if (editingPackage) {
                await adminApi.updatePackage(editingPackage.id, values as UpdatePackageDto);
                message.success('Paket berhasil diupdate');
            } else {
                await adminApi.createPackage(values as CreatePackageDto);
                message.success('Paket berhasil ditambahkan');
            }
            setIsModalVisible(false);
            fetchPackages();
        } catch (error: any) {
            message.error(error?.response?.data?.message || 'Terjadi kesalahan');
        }
    };

    const columns: ColumnsType<PackageData> = [
        { title: 'Nama', dataIndex: 'name', key: 'name' },
        {
            title: 'Harga',
            dataIndex: 'price',
            key: 'price',
            render: (price: number, record) => `${record.currency} ${price?.toLocaleString('id-ID')}`,
        },
        {
            title: 'Billing',
            dataIndex: 'billingCycle',
            key: 'billingCycle',
            render: (cycle: string) => <Tag color="blue">{cycle?.toUpperCase()}</Tag>,
        },
        {
            title: 'Fitur',
            dataIndex: 'features',
            key: 'features',
            render: (features: string[]) =>
                features?.length ? (
                    <Space wrap>
                        {features.map((f) => (
                            <Tag key={f} color="cyan">
                                {f}
                            </Tag>
                        ))}
                    </Space>
                ) : (
                    '-'
                ),
        },
        {
            title: 'Status',
            dataIndex: 'isActive',
            key: 'isActive',
            render: (isActive: boolean) => (
                <Tag color={isActive ? 'green' : 'red'}>{isActive ? 'Active' : 'Inactive'}</Tag>
            ),
        },
        {
            title: 'Aksi',
            key: 'actions',
            render: (_, record) => (
                <Space>
                    <Button type="link" icon={<EditOutlined />} onClick={() => void handleEdit(record)} />
                    <Popconfirm title="Hapus paket ini?" onConfirm={() => handleDelete(record.id)} okText="Ya" cancelText="Batal">
                        <Button type="link" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                <Title level={2} style={{ margin: 0 }}>Manajemen Paket</Title>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    Tambah Paket
                </Button>
            </div>

            <Table
                columns={columns}
                dataSource={data}
                rowKey="id"
                loading={loading}
                pagination={false}
                scroll={{ x: 'max-content' }}
            />

            <Modal
                title={editingPackage ? 'Edit Paket' : 'Tambah Paket'}
                open={isModalVisible}
                onOk={handleModalOk}
                onCancel={() => setIsModalVisible(false)}
                destroyOnClose
                width={600}
            >
                <Form form={form} layout="vertical">
                    <Form.Item name="name" label="Nama Paket" rules={[{ required: true, message: 'Masukkan nama paket' }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="description" label="Deskripsi" rules={[{ required: true, message: 'Masukkan deskripsi' }]}>
                        <TextArea rows={3} />
                    </Form.Item>
                    <Space style={{ width: '100%' }} size={16}>
                        <Form.Item name="price" label="Harga" rules={[{ required: true, message: 'Masukkan harga' }]}>
                            <InputNumber min={0} style={{ width: '100%' }} />
                        </Form.Item>
                        <Form.Item name="currency" label="Mata Uang" initialValue="IDR">
                            <Input style={{ width: 100 }} />
                        </Form.Item>
                        <Form.Item
                            name="billingCycle"
                            label="Billing Cycle"
                            rules={[{ required: true, message: 'Pilih billing cycle' }]}
                            initialValue="monthly"
                        >
                            <Select style={{ width: 140 }}>
                                <Select.Option value="monthly">Monthly</Select.Option>
                                <Select.Option value="yearly">Yearly</Select.Option>
                            </Select>
                        </Form.Item>
                    </Space>
                    <Form.Item
                        name="packageListIds"
                        label="Fitur"
                        rules={[{ required: true, message: 'Pilih minimal satu fitur' }]}
                    >
                        <Select
                            mode="multiple"
                            options={packageListOptions.map((item) => ({ label: item.name, value: item.id }))}
                            placeholder="Pilih fitur"
                        />
                    </Form.Item>
                    {editingPackage && (
                        <Form.Item name="isActive" label="Aktif" valuePropName="checked">
                            <Switch />
                        </Form.Item>
                    )}
                </Form>
            </Modal>
        </div>
    );
};

export default ManagePackagesPage;
