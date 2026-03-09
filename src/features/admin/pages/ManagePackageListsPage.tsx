import { useEffect, useState } from 'react';
import {
  Typography,
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Popconfirm,
  message,
  Tag,
} from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../services/adminApi';
import type { PackageListOption, CreatePackageListDto, UpdatePackageListDto } from '../types/admin';

const { Title } = Typography;

const ManagePackageListsPage = () => {
  const [data, setData] = useState<PackageListOption[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState<PackageListOption | null>(null);
  const [form] = Form.useForm();

  const fetchPackageLists = async () => {
    setLoading(true);
    try {
      const lists = await adminApi.getPackageLists();
      setData(lists);
    } catch (error) {
      message.error('Gagal memuat master fitur paket');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPackageLists();
  }, []);

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: PackageListOption) => {
    setEditingItem(record);
    form.setFieldsValue({ name: record.name });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deletePackageList(id);
      message.success('Fitur paket berhasil dihapus');
      fetchPackageLists();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Gagal menghapus fitur paket');
    }
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();
      if (editingItem) {
        await adminApi.updatePackageList(editingItem.id, values as UpdatePackageListDto);
        message.success('Fitur paket berhasil diupdate');
      } else {
        await adminApi.createPackageList(values as CreatePackageListDto);
        message.success('Fitur paket berhasil ditambahkan');
      }

      setIsModalVisible(false);
      fetchPackageLists();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const columns: ColumnsType<PackageListOption> = [
    {
      title: 'Nama Fitur',
      dataIndex: 'name',
      key: 'name',
      render: (value: string) => <Tag color="cyan">{value}</Tag>,
    },
    {
      title: 'Dibuat',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (value: string) => new Date(value).toLocaleDateString('id-ID'),
    },
    {
      title: 'Aksi',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Hapus fitur ini?"
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
        <Title level={2} style={{ margin: 0 }}>
          Master Fitur Paket
        </Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Tambah Fitur
        </Button>
      </div>

      <Table columns={columns} dataSource={data} rowKey="id" loading={loading} pagination={false} />

      <Modal
        title={editingItem ? 'Edit Fitur Paket' : 'Tambah Fitur Paket'}
        open={isModalVisible}
        onOk={handleSubmit}
        onCancel={() => setIsModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nama Fitur"
            rules={[
              { required: true, message: 'Masukkan nama fitur' },
              { min: 2, message: 'Nama fitur minimal 2 karakter' },
            ]}
          >
            <Input placeholder="Contoh: WhatsApp Chat Console" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManagePackageListsPage;
