import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Card,
  Table,
  Tag,
  Button,
  Select,
  Space,
  Typography,
  Empty,
  Tooltip,
  Row,
  Col,
  Drawer,
  Descriptions,
  Spin,
  Divider,
} from 'antd';
import {
  SyncOutlined,
  InboxOutlined,
  SendOutlined,
  StarOutlined,
  MailOutlined,
  FilterOutlined,
  CloseOutlined,
} from '@ant-design/icons';
import { emailApi } from '@/features/email/services/emailApi';
import type { GmailMessageItem, GmailMessageDetail } from '@/features/email/services/emailApi';
import { useNotification } from '@/hooks/useNotification';

const { Text } = Typography;
const { Option } = Select;

const LABEL_OPTIONS = [
  { value: '', label: 'Semua Label' },
  { value: 'INBOX', label: 'Inbox' },
  { value: 'SENT', label: 'Terkirim' },
  { value: 'IMPORTANT', label: 'Penting' },
  { value: 'STARRED', label: 'Berbintang' },
  { value: 'DRAFT', label: 'Draft' },
  { value: 'SPAM', label: 'Spam' },
  { value: 'TRASH', label: 'Sampah' },
  { value: 'UNREAD', label: 'Belum Dibaca' },
];

const LABEL_ICONS: Record<string, React.ReactNode> = {
  INBOX: <InboxOutlined />,
  SENT: <SendOutlined />,
  IMPORTANT: <StarOutlined style={{ color: '#faad14' }} />,
  STARRED: <StarOutlined style={{ color: '#faad14' }} />,
  UNREAD: <MailOutlined style={{ color: '#1677ff' }} />,
};

const LABEL_COLORS: Record<string, string> = {
  INBOX: 'blue',
  SENT: 'green',
  IMPORTANT: 'gold',
  STARRED: 'gold',
  UNREAD: 'cyan',
  DRAFT: 'orange',
  SPAM: 'red',
  TRASH: 'default',
  CATEGORY_SOCIAL: 'purple',
  CATEGORY_PROMOTIONS: 'magenta',
  CATEGORY_UPDATES: 'geekblue',
};

interface InboxTabProps {
  onSwitchToConnect?: () => void;
}

const InboxTab = ({ onSwitchToConnect }: InboxTabProps) => {
  const [messages, setMessages] = useState<GmailMessageItem[]>([]);
  const [accounts, setAccounts] = useState<Array<{ id: string; email: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);

  // Email detail drawer
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [detailLoading, setDetailLoading] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageDetail | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Filters
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  const [selectedLabel, setSelectedLabel] = useState<string>('');

  const { showSuccess, showError } = useNotification();

  const fetchAccounts = useCallback(async () => {
    try {
      const data = await emailApi.getAccounts();
      setAccounts(data || []);
    } catch {
      // ignore
    }
  }, []);

  const fetchInbox = useCallback(
    async (cursor?: string) => {
      const isLoadMore = !!cursor;
      if (isLoadMore) {
        setLoadingMore(true);
      } else {
        setLoading(true);
      }

      try {
        const data = await emailApi.getInbox({
          limit: 20,
          cursor,
          label: selectedLabel || undefined,
          accountId: selectedAccount || undefined,
        });

        const items = Array.isArray(data) ? data : [];

        if (isLoadMore) {
          setMessages((prev) => [...prev, ...items]);
        } else {
          setMessages(items);
        }

        setHasMore(items.length >= 20);
      } catch (error: any) {
        const msg = error.response?.data?.message || 'Gagal memuat inbox';
        showError(msg);
      } finally {
        setLoading(false);
        setLoadingMore(false);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedLabel, selectedAccount],
  );

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  useEffect(() => {
    fetchInbox();
  }, [fetchInbox]);

  const handleSync = async () => {
    if (accounts.length === 0) {
      showError('Tidak ada akun Gmail yang terhubung');
      return;
    }

    setSyncing(true);
    try {
      // Sync all connected accounts
      const syncPromises = accounts.map((acc) => emailApi.syncMessages(acc.email));
      await Promise.all(syncPromises);
      showSuccess('Sinkronisasi email berhasil!');
      // Refresh inbox after sync
      await fetchInbox();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal sinkronisasi email';
      showError(msg);
    } finally {
      setSyncing(false);
    }
  };

  const handleLoadMore = () => {
    if (messages.length === 0 || !hasMore) return;
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.internalDate) {
      fetchInbox(lastMessage.internalDate);
    }
  };

  const handleRowClick = async (record: GmailMessageItem) => {
    setDrawerOpen(true);
    setDetailLoading(true);
    setSelectedMessage(null);
    try {
      const detail = await emailApi.getMessageById(record.id);
      setSelectedMessage(detail);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Gagal memuat detail email';
      showError(msg);
      setDrawerOpen(false);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDrawerClose = () => {
    setDrawerOpen(false);
    setSelectedMessage(null);
  };

  const getAccountEmail = (gmailAccountId: string) => {
    const acc = accounts.find((a) => a.id === gmailAccountId);
    return acc?.email || gmailAccountId;
  };

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (isToday) {
      return date.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });
    }

    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    if (date.toDateString() === yesterday.toDateString()) {
      return 'Kemarin';
    }

    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
    });
  };

  const columns = [
    {
      title: 'Dari',
      dataIndex: 'from',
      key: 'from',
      width: 220,
      ellipsis: true,
      render: (from: string | null, record: GmailMessageItem) => {
        const isUnread = record.labels?.includes('UNREAD');
        return (
          <Text strong={isUnread} style={{ fontSize: 13 }}>
            {from || '-'}
          </Text>
        );
      },
    },
    {
      title: 'Subjek',
      dataIndex: 'subject',
      key: 'subject',
      ellipsis: true,
      render: (subject: string | null, record: GmailMessageItem) => {
        const isUnread = record.labels?.includes('UNREAD');
        return (
          <div>
            <Text strong={isUnread} style={{ fontSize: 13 }}>
              {subject || '(Tanpa subjek)'}
            </Text>
            {record.snippet && (
              <Text type="secondary" style={{ fontSize: 12, marginLeft: 8 }}>
                — {record.snippet}
              </Text>
            )}
          </div>
        );
      },
    },
    {
      title: 'Label',
      dataIndex: 'labels',
      key: 'labels',
      width: 200,
      render: (labels: string[]) => {
        if (!labels || labels.length === 0) return '-';
        // Show only meaningful labels, skip CATEGORY_ prefixed ones unless relevant
        const visibleLabels = labels
          .filter((l) => !l.startsWith('CATEGORY_'))
          .slice(0, 3);
        return (
          <Space size={4} wrap>
            {visibleLabels.map((label) => (
              <Tag
                key={label}
                color={LABEL_COLORS[label] || 'default'}
                style={{ fontSize: 11 }}
              >
                {label}
              </Tag>
            ))}
            {labels.length > visibleLabels.length && (
              <Tooltip title={labels.join(', ')}>
                <Tag style={{ fontSize: 11 }}>+{labels.length - visibleLabels.length}</Tag>
              </Tooltip>
            )}
          </Space>
        );
      },
    },
    {
      title: 'Akun',
      dataIndex: 'gmailAccountId',
      key: 'account',
      width: 180,
      ellipsis: true,
      render: (id: string) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {getAccountEmail(id)}
        </Text>
      ),
    },
    {
      title: 'Tanggal',
      dataIndex: 'internalDate',
      key: 'date',
      width: 100,
      render: (date: string | null) => (
        <Text type="secondary" style={{ fontSize: 12 }}>
          {formatDate(date)}
        </Text>
      ),
    },
  ];

  if (accounts.length === 0 && !loading) {
    return (
      <Card>
        <Empty
          image={<InboxOutlined style={{ fontSize: 64, color: '#bfbfbf' }} />}
          description={
            <Space direction="vertical" size={4}>
              <Text>Belum ada akun Gmail yang terhubung</Text>
              <Text type="secondary">
                Hubungkan akun Gmail terlebih dahulu untuk melihat inbox
              </Text>
            </Space>
          }
        >
          {onSwitchToConnect && (
            <Button type="primary" onClick={onSwitchToConnect}>
              Hubungkan Gmail
            </Button>
          )}
        </Empty>
      </Card>
    );
  }

  return (
    <div>
      {/* Filters & Actions */}
      <Row gutter={[16, 16]} style={{ marginBottom: 16 }} align="middle">
        <Col flex="auto">
          <Space size={12} wrap>
            <Select
              value={selectedAccount}
              onChange={setSelectedAccount}
              style={{ minWidth: 220 }}
              placeholder="Semua Akun"
              allowClear
              onClear={() => setSelectedAccount('')}
            >
              <Option value="">Semua Akun</Option>
              {accounts.map((acc) => (
                <Option key={acc.id} value={acc.id}>
                  <Space>
                    <MailOutlined />
                    {acc.email}
                  </Space>
                </Option>
              ))}
            </Select>

            <Select
              value={selectedLabel}
              onChange={setSelectedLabel}
              style={{ minWidth: 160 }}
              placeholder="Semua Label"
              suffixIcon={<FilterOutlined />}
            >
              {LABEL_OPTIONS.map((opt) => (
                <Option key={opt.value} value={opt.value}>
                  <Space>
                    {LABEL_ICONS[opt.value]}
                    {opt.label}
                  </Space>
                </Option>
              ))}
            </Select>
          </Space>
        </Col>
        <Col>
          <Space>
            <Button
              icon={<SyncOutlined spin={syncing} />}
              onClick={handleSync}
              loading={syncing}
            >
              Sinkronisasi
            </Button>
          </Space>
        </Col>
      </Row>

      {/* Messages Table */}
      <Card
        styles={{ body: { padding: 0 } }}
        style={{ borderRadius: 8 }}
      >
        <Table
          columns={columns}
          dataSource={messages}
          loading={loading}
          rowKey="id"
          pagination={false}
          scroll={{ x: 'max-content' }}
          onRow={(record) => ({
            onClick: () => handleRowClick(record),
            style: { cursor: 'pointer' },
          })}
          locale={{
            emptyText: (
              <Empty
                image={<InboxOutlined style={{ fontSize: 48, color: '#bfbfbf' }} />}
                description={
                  <Space direction="vertical" size={4}>
                    <Text>Inbox kosong</Text>
                    <Text type="secondary">
                      Klik "Sinkronisasi" untuk mengambil email terbaru dari Gmail
                    </Text>
                  </Space>
                }
              >
                <Button
                  type="primary"
                  icon={<SyncOutlined />}
                  onClick={handleSync}
                  loading={syncing}
                >
                  Sinkronisasi Sekarang
                </Button>
              </Empty>
            ),
          }}
          rowClassName={(record) =>
            record.labels?.includes('UNREAD') ? 'inbox-row-unread' : ''
          }
        />
      </Card>

      {/* Load More */}
      {hasMore && messages.length > 0 && (
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <Button onClick={handleLoadMore} loading={loadingMore}>
            Muat Lebih Banyak
          </Button>
        </div>
      )}

      <style>{`
        .inbox-row-unread {
          background-color: #f0f7ff !important;
          font-weight: 500;
        }
        .inbox-row-unread:hover > td {
          background-color: #e6f0fa !important;
        }
      `}</style>

      {/* Email Detail Drawer */}
      <Drawer
        title={selectedMessage?.subject || 'Detail Email'}
        placement="right"
        width={Math.min(720, window.innerWidth * 0.85)}
        onClose={handleDrawerClose}
        open={drawerOpen}
        extra={
          <Button
            type="text"
            icon={<CloseOutlined />}
            onClick={handleDrawerClose}
          />
        }
        styles={{ body: { padding: 0 } }}
      >
        {detailLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: 60 }}>
            <Spin size="large" tip="Memuat email..." />
          </div>
        ) : selectedMessage ? (
          <div>
            {/* Email Header */}
            <div style={{ padding: '16px 24px', borderBottom: '1px solid #f0f0f0' }}>
              <Typography.Title level={5} style={{ margin: 0, marginBottom: 12 }}>
                {selectedMessage.subject || '(Tanpa subjek)'}
              </Typography.Title>
              <Descriptions column={1} size="small" colon={false}>
                <Descriptions.Item label={<Text strong>Dari</Text>}>
                  {selectedMessage.from || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong>Kepada</Text>}>
                  {selectedMessage.to || '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong>Tanggal</Text>}>
                  {selectedMessage.internalDate
                    ? new Date(selectedMessage.internalDate).toLocaleString('id-ID', {
                        dateStyle: 'full',
                        timeStyle: 'short',
                      })
                    : '-'}
                </Descriptions.Item>
                <Descriptions.Item label={<Text strong>Label</Text>}>
                  <Space size={4} wrap>
                    {selectedMessage.labels?.map((label) => (
                      <Tag
                        key={label}
                        color={LABEL_COLORS[label] || 'default'}
                        style={{ fontSize: 11 }}
                      >
                        {label}
                      </Tag>
                    ))}
                  </Space>
                </Descriptions.Item>
              </Descriptions>
            </div>

            <Divider style={{ margin: 0 }} />

            {/* Email Body */}
            <div style={{ padding: '16px 24px' }}>
              {selectedMessage.bodyHtml ? (
                <iframe
                  ref={iframeRef}
                  srcDoc={selectedMessage.bodyHtml}
                  sandbox="allow-same-origin"
                  style={{
                    width: '100%',
                    minHeight: 400,
                    border: '1px solid #f0f0f0',
                    borderRadius: 8,
                    background: '#fff',
                  }}
                  onLoad={() => {
                    // Auto-resize iframe to fit content
                    const iframe = iframeRef.current;
                    if (iframe?.contentDocument?.body) {
                      iframe.style.height =
                        iframe.contentDocument.body.scrollHeight + 40 + 'px';
                    }
                  }}
                  title="Email body"
                />
              ) : selectedMessage.bodyText ? (
                <pre
                  style={{
                    whiteSpace: 'pre-wrap',
                    wordBreak: 'break-word',
                    fontFamily: 'inherit',
                    fontSize: 14,
                    lineHeight: 1.6,
                    background: '#fafafa',
                    padding: 16,
                    borderRadius: 8,
                    border: '1px solid #f0f0f0',
                  }}
                >
                  {selectedMessage.bodyText}
                </pre>
              ) : (
                <Empty description="Tidak ada konten email" />
              )}
            </div>
          </div>
        ) : null}
      </Drawer>
    </div>
  );
};

export default InboxTab;
