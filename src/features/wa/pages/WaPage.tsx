import { useState, useMemo } from 'react';
import { Button, Typography } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSearchParams } from 'react-router-dom';
import {
  SessionsTab,
  ContactsTab,
  GroupsTab,
  BroadcastsTab,
  AutomationsTab,
} from '../components/tabs';

const { Title, Text } = Typography;

type TabKey = 'sessions' | 'contacts' | 'groups' | 'broadcasts' | 'automations';

const tabConfig: { key: TabKey; label: string; description: string }[] = [
  {
    key: 'sessions',
    label: 'Sessions',
    description: 'Manage your WhatsApp communication',
  },
  {
    key: 'contacts',
    label: 'Contacts',
    description: 'Manage and segment your WhatsApp contacts for better communication.',
  },
  {
    key: 'groups',
    label: 'Groups',
    description: 'Manage and monitor your WhatsApp groups in one place.',
  },
  {
    key: 'broadcasts',
    label: 'Broadcasts',
    description: 'Send messages to multiple contacts and groups efficiently.',
  },
  {
    key: 'automations',
    label: 'Automations',
    description: 'Automate messages based on triggers & schedules',
  },
];

const WaPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'sessions';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const currentTabConfig = useMemo(
    () => tabConfig.find((t) => t.key === activeTab) || tabConfig[0],
    [activeTab]
  );

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  const handleNewBroadcast = () => {
    // Navigate to broadcast tab or open modal
    setActiveTab('broadcasts');
    setSearchParams({ tab: 'broadcasts' });
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'sessions':
        return <SessionsTab />;
      case 'contacts':
        return <ContactsTab />;
      case 'groups':
        return <GroupsTab />;
      case 'broadcasts':
        return <BroadcastsTab onNewBroadcast={handleNewBroadcast} />;
      case 'automations':
        return <AutomationsTab />;
      default:
        return <SessionsTab />;
    }
  };

  return (
    <div style={{ padding: '0' }}>
      {/* Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <div>
          <Title level={3} style={{ margin: 0, fontWeight: 600 }}>
            Whatsapp CMS
          </Title>
          <Text type="secondary">{currentTabConfig.description}</Text>
        </div>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          size="large"
          onClick={handleNewBroadcast}
          style={{ borderRadius: 8 }}
        >
          New Broadcast
        </Button>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          marginBottom: 24,
          flexWrap: 'wrap',
          padding: '12px',
          backgroundColor: '#f5f5f5',
          borderRadius: '12px',
          width: 'fit-content',
        }}
      >
        {tabConfig.map((tab) => (
          <button
            key={tab.key}
            onClick={() => handleTabChange(tab.key)}
            style={{
              padding: '10px 20px',
              border: activeTab === tab.key ? '2px solid #1677ff' : '2px solid transparent',
              borderRadius: 8,
              background: activeTab === tab.key ? '#ffffff' : 'transparent',
              color: activeTab === tab.key ? '#1677ff' : '#666',
              fontWeight: activeTab === tab.key ? 600 : 500,
              cursor: 'pointer',
              fontSize: 14,
              transition: 'all 0.3s ease',
              boxShadow: activeTab === tab.key ? '0 2px 8px rgba(22, 119, 255, 0.15)' : 'none',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div>{renderTabContent()}</div>
    </div>
  );
};

export default WaPage;
