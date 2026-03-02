import { useState, useEffect } from 'react';
import { Typography, Table, Tag, Button, Space, Modal, Form, Input, Select, message, Popconfirm, Input as AntdInput } from 'antd';
import { EditOutlined, DeleteOutlined, CheckCircleOutlined, CloseCircleOutlined, PlusOutlined } from '@ant-design/icons';
import type { ColumnsType } from 'antd/es/table';
import { adminApi } from '../services/adminApi';
import type { UserManagement, CreateAdminUserDto, UpdateAdminUserDto } from '../types/admin';

const { Title } = Typography;
const { Search } = AntdInput;

const ManageUsersPage = () => {
  const [data, setData] = useState<UserManagement[]>([]);
  const [loading, setLoading] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [search, setSearch] = useState('');

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState<UserManagement | null>(null);
  const [form] = Form.useForm();

  const fetchUsers = async (p = page, ps = pageSize, s = search) => {
    setLoading(true);
    try {
      const resp = await adminApi.getUsers(p, ps, s);
      const items = resp.data || [];
      const totalItems = resp.total || 0;
      setData(items);
      setTotal(totalItems);
    } catch (error) {
      message.error('Gagal mengambil data pengguna');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(page, pageSize, search);
  }, [page, pageSize, search]);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  const handleAdd = () => {
    setEditingUser(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEdit = (record: UserManagement) => {
    setEditingUser(record);
    form.setFieldsValue({
      name: record.name,
      email: record.email,
      role: record.role,
      telephone: record.telephone,
    });
    setIsModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await adminApi.deleteUser(id);
      message.success('User berhasil dihapus');
      fetchUsers();
    } catch (error) {
      message.error('Gagal menghapus user');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      if (editingUser) {
        await adminApi.updateUser(editingUser.id, values as UpdateAdminUserDto);
        message.success('User berhasil diupdate');
      } else {
        await adminApi.createUser(values as CreateAdminUserDto);
        message.success('User berhasil ditambahkan');
      }
      setIsModalVisible(false);
      fetchUsers();
    } catch (error: any) {
      message.error(error?.response?.data?.message || 'Terjadi kesalahan');
    }
  };

  const handleModalCancel = () => {
    setIsModalVisible(false);
  };

  const columns: ColumnsType<UserManagement> = [
    { title: 'No', dataIndex: 'no', key: 'no', width: 60 },
    { title: 'ID Klien', dataIndex: 'idKlien', key: 'idKlien' },
    { title: 'Nama', dataIndex: 'name', key: 'name' },
    { title: 'Email', dataIndex: 'email', key: 'email' },
    { title: 'Telp', dataIndex: 'telephone', key: 'telephone' },
    {
      title: 'Plan',
      dataIndex: 'planType',
      key: 'planType',
      render: (plan: string) => (plan ? <Tag color="purple">{plan}</Tag> : <Tag>None</Tag>),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const isActive = status === 'Active' || status === 'active';
        return (
          <Tag color={isActive ? 'green' : 'orange'} icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
            {status?.toUpperCase() || 'INACTIVE'}
          </Tag>
        );
      },
    },
    { title: 'Terdaftar', dataIndex: 'tanggalDaftar', key: 'tanggalDaftar' },
    {
      title: 'Aksi',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button type="link" icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Hapus user ini?"
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <Title level={2} style={{ margin: 0 }}>Manajemen Pengguna</Title>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Tambah User
        </Button>
      </div>

      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'flex-end' }}>
        <Search
          placeholder="Cari nama, email, atau ID klien..."
          allowClear
          onSearch={handleSearch}
          style={{ width: 300 }}
        />
      </div>

      <Table
        columns={columns}
        dataSource={data}
        rowKey="id"
        loading={loading}
        pagination={{
          current: page,
          pageSize: pageSize,
          total: total,
          showSizeChanger: true,
          onChange: (p, ps) => { setPage(p); setPageSize(ps); },
          showTotal: (total) => `Total ${total} users`,
        }}
        scroll={{ x: 'max-content' }}
      />

      <Modal
        title={editingUser ? 'Edit User' : 'Tambah User'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Nama"
            rules={[{ required: true, message: 'Masukkan nama' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="email"
            label="Email"
            rules={[{ required: true, type: 'email', message: 'Masukkan email valid' }]}
          >
            <Input />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="Password"
              rules={[{ required: true, min: 6, message: 'Minimal 6 karakter' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          {editingUser && (
            <Form.Item
              name="password"
              label="Password (Biarkan kosong jika tidak diubah)"
              rules={[{ min: 6, message: 'Minimal 6 karakter' }]}
            >
              <Input.Password />
            </Form.Item>
          )}
          <Form.Item
            name="telephone"
            label="Telepon"
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="role"
            label="Role"
            rules={[{ required: true, message: 'Pilih role' }]}
            initialValue="USER"
          >
            <Select>
              <Select.Option value="USER">User</Select.Option>
              <Select.Option value="ADMIN">Admin</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ManageUsersPage;
