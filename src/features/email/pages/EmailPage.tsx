import { useState, useMemo } from 'react';
import { Typography } from 'antd';
import { useSearchParams } from 'react-router-dom';
import { ConnectTab, BroadcastTab, ContactsTab } from '../components/tabs';

const { Title, Text } = Typography;

type TabKey = 'connect' | 'broadcast' | 'contacts';

const tabConfig: { key: TabKey; label: string; description: string }[] = [
  {
    key: 'connect',
    label: 'Connect',
    description: 'Connect and manage your Gmail accounts for email communication.',
  },
  {
    key: 'broadcast',
    label: 'Broadcast',
    description: 'Send email broadcasts to multiple recipients efficiently.',
  },
  {
    key: 'contacts',
    label: 'Contacts',
    description: 'Manage and import your email contacts.',
  },
];

const EmailPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTab = (searchParams.get('tab') as TabKey) || 'connect';
  const [activeTab, setActiveTab] = useState<TabKey>(initialTab);

  const currentTabConfig = useMemo(
    () => tabConfig.find((t) => t.key === activeTab) || tabConfig[0],
    [activeTab]
  );

  const handleTabChange = (key: TabKey) => {
    setActiveTab(key);
    setSearchParams({ tab: key });
  };

  const handleSwitchToConnect = () => {
    handleTabChange('connect');
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'connect':
        return <ConnectTab />;
      case 'broadcast':
        return <BroadcastTab onSwitchToConnect={handleSwitchToConnect} />;
      case 'contacts':
        return <ContactsTab />;
      default:
        return <ConnectTab />;
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
            Email CMS
          </Title>
          <Text type="secondary">{currentTabConfig.description}</Text>
        </div>
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

export default EmailPage;
