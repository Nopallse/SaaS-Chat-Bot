import { useState, useEffect, useMemo } from 'react';
import { Modal, Table, Input, Button, Space, Checkbox, Tag, Typography } from 'antd';
import { SearchOutlined, CheckOutlined } from '@ant-design/icons';
import type { EmailContact, WhatsAppContact } from '../types/contacts';

const { Text } = Typography;

interface ContactSelectorModalProps {
  open: boolean;
  onCancel: () => void;
  onOk: (selectedContacts: string[]) => void;
  contacts: (EmailContact | WhatsAppContact)[];
  type: 'email' | 'whatsapp';
  loading?: boolean;
}

const ContactSelectorModal = ({
  open,
  onCancel,
  onOk,
  contacts,
  type,
  loading = false,
}: ContactSelectorModalProps) => {
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([]);
  const [searchText, setSearchText] = useState('');

  // Reset selection when modal closes
  useEffect(() => {
    if (!open) {
      setSelectedRowKeys([]);
      setSearchText('');
    }
  }, [open]);

  // Filter contacts based on search
  const filteredContacts = useMemo(() => {
    if (!searchText.trim()) return contacts;
    
    const search = searchText.toLowerCase();
    return contacts.filter((contact) => {
      const identifier = type === 'email' 
        ? (contact as EmailContact).email 
        : (contact as WhatsAppContact).phone;
      const name = contact.name || '';
      
      return (
        identifier.toLowerCase().includes(search) ||
        name.toLowerCase().includes(search)
      );
    });
  }, [contacts, searchText, type]);

  const handleOk = () => {
    const selectedIdentifiers = selectedRowKeys.map((key) => {
      const contact = contacts.find((c) => c.id === key);
      if (!contact) return '';
      return type === 'email' 
        ? (contact as EmailContact).email 
        : (contact as WhatsAppContact).phone;
    }).filter(Boolean);
    
    onOk(selectedIdentifiers);
    setSelectedRowKeys([]);
    setSearchText('');
  };

  const rowSelection = {
    selectedRowKeys,
    onChange: (keys: React.Key[]) => {
      setSelectedRowKeys(keys as string[]);
    },
    getCheckboxProps: (record: EmailContact | WhatsAppContact) => ({
      disabled: record.status !== 'ACTIVE',
    }),
  };

  const columns = [
    {
      title: type === 'email' ? 'Email' : 'Phone',
      dataIndex: type === 'email' ? 'email' : 'phone',
      key: type === 'email' ? 'email' : 'phone',
      render: (value: string) => <code style={{ fontSize: '12px' }}>{value}</code>,
    },
    {
      title: 'Nama',
      dataIndex: 'name',
      key: 'name',
      render: (name?: string) => name || <Text type="secondary">-</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => {
        const colorMap: Record<string, string> = {
          ACTIVE: 'success',
          INACTIVE: 'default',
          BOUNCED: 'error',
          UNSUBSCRIBED: 'warning',
        };
        return <Tag color={colorMap[status] || 'default'}>{status}</Tag>;
      },
    },
  ];

  return (
    <Modal
      title={`Pilih ${type === 'email' ? 'Email' : 'WhatsApp'} Contacts`}
      open={open}
      onCancel={onCancel}
      onOk={handleOk}
      okText={`Pilih (${selectedRowKeys.length})`}
      cancelText="Batal"
      width={800}
      okButtonProps={{ disabled: selectedRowKeys.length === 0 }}
    >
      <Space direction="vertical" style={{ width: '100%' }} size={16}>
        <Input
          placeholder={`Cari ${type === 'email' ? 'email' : 'nomor telepon'} atau nama...`}
          prefix={<SearchOutlined />}
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          allowClear
        />

        <div style={{ maxHeight: 400, overflow: 'auto' }}>
          <Table
            rowSelection={rowSelection}
            columns={columns}
            dataSource={filteredContacts}
            rowKey="id"
            loading={loading}
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showTotal: (total) => `Total ${total} contacts`,
            }}
            size="small"
            locale={{
              emptyText: `Belum ada ${type === 'email' ? 'email' : 'WhatsApp'} contact`,
            }}
          />
        </div>

        {selectedRowKeys.length > 0 && (
          <div style={{ padding: '12px', background: '#f0f2f5', borderRadius: 4 }}>
            <Text strong>
              <CheckOutlined /> {selectedRowKeys.length} contact dipilih
            </Text>
          </div>
        )}
      </Space>
    </Modal>
  );
};

export default ContactSelectorModal;

