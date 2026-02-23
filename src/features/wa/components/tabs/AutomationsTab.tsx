import { useState, useEffect } from 'react';
import {
  Table,
  Button,
  Tag,
  Space,
  Input,
  Tooltip,
  Empty,
} from 'antd';
import {
  PlusOutlined,
  DeleteOutlined,
  EyeOutlined,
  EditOutlined,
} from '@ant-design/icons';
import { useNotification } from '@/hooks/useNotification';

const { Search } = Input;

interface Automation {
  id: string;
  name: string;
  trigger: string;
  status: 'active' | 'draft' | 'inactive';
  performance: {
    delivered: number;
  };
}

interface AutomationsTabProps {
  onCreateAutomation?: () => void;
}

const AutomationsTab = ({ onCreateAutomation }: AutomationsTabProps) => {
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [filteredAutomations, setFilteredAutomations] = useState<Automation[]>([]);
  const [fetching, setFetching] = useState(true);
  const [searchText, setSearchText] = useState('');
  const { showError } = useNotification();

  useEffect(() => {
    fetchAutomations();
  }, []);

  useEffect(() => {
    if (searchText) {
      const filtered = automations.filter(
        (a) =>
          a.name?.toLowerCase().includes(searchText.toLowerCase()) ||
          a.trigger?.toLowerCase().includes(searchText.toLowerCase())
      );
      setFilteredAutomations(filtered);
    } else {
      setFilteredAutomations(automations);
    }
  }, [searchText, automations]);

  const fetchAutomations = async () => {
    setFetching(true);
    try {
      // TODO: Replace with actual API call when available
      // const data = await waApi.getAutomations();
      // For now, show empty state - data comes from server
      setAutomations([]);
      setFilteredAutomations([]);
    } catch (error: any) {
      showError(error.response?.data?.message || 'Gagal memuat automations');
    } finally {
      setFetching(false);
    }
  };

  const getStatusTag = (status: string) => {
    const statusConfig: Record<string, { color: string; text: string }> = {
      active: { color: 'success', text: 'Active' },
      draft: { color: 'default', text: 'Draft' },
      inactive: { color: 'warning', text: 'Inactive' },
    };
    const config = statusConfig[status] || statusConfig.draft;
    return (
      <Tag color={config.color} style={{ borderRadius: 4, fontWeight: 500 }}>
        {config.text}
      </Tag>
    );
  };

  const columns = [
    {
      title: 'No',
      key: 'no',
      width: 60,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Automation Name',
      dataIndex: 'name',
      key: 'name',
      sorter: (a: Automation, b: Automation) => (a.name || '').localeCompare(b.name || ''),
    },
    {
      title: 'Trigger',
      dataIndex: 'trigger',
      key: 'trigger',
      sorter: (a: Automation, b: Automation) => (a.trigger || '').localeCompare(b.trigger || ''),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => getStatusTag(status),
    },
    {
      title: 'Performance',
      dataIndex: 'performance',
      key: 'performance',
      sorter: (a: Automation, b: Automation) =>
        (a.performance?.delivered || 0) - (b.performance?.delivered || 0),
      render: (performance: { delivered: number }) =>
        `Delivered: ${performance?.delivered?.toLocaleString() || 0}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 120,
      render: (_: any, _record: Automation) => (
        <Space size={4}>
          <Tooltip title="Delete">
            <Button type="text" size="small" icon={<DeleteOutlined />} />
          </Tooltip>
          <Tooltip title="View">
            <Button type="text" size="small" icon={<EyeOutlined />} />
          </Tooltip>
          <Tooltip title="Edit">
            <Button type="text" size="small" icon={<EditOutlined />} />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 16,
        }}
      >
        <Search
          placeholder="Search automations..."
          allowClear
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          style={{ width: 300 }}
          suffix={
            <span style={{ color: '#bbb', fontSize: 12 }}>
              <span style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>⌘</span>{' '}
              <span style={{ background: '#f5f5f5', padding: '2px 6px', borderRadius: 4 }}>S</span>
            </span>
          }
        />
        <Button type="primary" icon={<PlusOutlined />} onClick={onCreateAutomation}>
          Create Automation
        </Button>
      </div>

      {filteredAutomations.length === 0 && !fetching ? (
        <Empty
          description="No automations yet. Click 'Create Automation' to set one up."
          style={{ padding: 60 }}
        />
      ) : (
        <Table
          columns={columns}
          dataSource={filteredAutomations}
          rowKey="id"
          loading={fetching}
          pagination={{ pageSize: 10 }}
          style={{
            background: '#fff',
            borderRadius: 8,
          }}
        />
      )}
    </div>
  );
};

export default AutomationsTab;
