import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Layout,
  List,
  Avatar,
  Input,
  Button,
  Typography,
  Badge,
  Space,
  Select,
  Empty,
  Spin,
  Dropdown,
  Tag,
} from 'antd';
import {
  SendOutlined,
  SearchOutlined,
  SmileOutlined,
  PaperClipOutlined,
  UserOutlined,
  MoreOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import {
  waApi,
  type WhatsAppConversation,
  type WhatsAppMessage,
  type WhatsAppSession,
} from '../services/waApi';
import { useNotification } from '@/hooks/useNotification';
import { API_URL } from '@/utils/constants';
import { io, type Socket } from 'socket.io-client';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const { Sider, Content } = Layout;
const { Text, Title } = Typography;

const WaChatConsolePage = () => {
  const [sessions, setSessions] = useState<WhatsAppSession[]>([]);
  const [selectedSessionId, setSelectedSessionId] = useState<string>('');
  const [conversations, setConversations] = useState<WhatsAppConversation[]>([]);
  const [filteredConversations, setFilteredConversations] = useState<WhatsAppConversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<WhatsAppConversation | null>(null);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [searchText, setSearchText] = useState('');
  const [loadingConvos, setLoadingConvos] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const shouldSmoothScrollRef = useRef<boolean>(true);
  const socketRef = useRef<Socket | null>(null);
  const selectedSessionRef = useRef<string>('');
  const selectedConversationRef = useRef<WhatsAppConversation | null>(null);
  const { showError } = useNotification();

  useEffect(() => {
    selectedSessionRef.current = selectedSessionId;
  }, [selectedSessionId]);

  useEffect(() => {
    selectedConversationRef.current = selectedConversation;
  }, [selectedConversation]);

  const loadConversationsBySession = useCallback(
    async (sessionId: string, silent = false) => {
      if (!sessionId) return;
      if (!silent) setLoadingConvos(true);
      try {
        const data = await waApi.getConversationList(sessionId);
        setConversations(data);
      } catch {
        if (!silent) showError('Failed to load conversations');
      } finally {
        if (!silent) setLoadingConvos(false);
      }
    },
    [showError],
  );

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  // Load conversations when session changes
  useEffect(() => {
    if (selectedSessionId) {
      loadConversations();
    }
  }, [selectedSessionId]);

  // Filter conversations by search
  useEffect(() => {
    if (!searchText.trim()) {
      setFilteredConversations(conversations);
    } else {
      const q = searchText.toLowerCase();
      setFilteredConversations(
        conversations.filter(
          (c) =>
            c.jid.toLowerCase().includes(q) ||
            c.name?.toLowerCase().includes(q) ||
            c.lastMessageText?.toLowerCase().includes(q),
        ),
      );
    }
  }, [searchText, conversations]);

  // Auto-scroll to bottom
  useEffect(() => {
    const behavior = shouldSmoothScrollRef.current ? 'smooth' : 'auto';
    messagesEndRef.current?.scrollIntoView({ behavior });
    shouldSmoothScrollRef.current = true;
  }, [messages]);

  // ── WebSocket: single source of real-time updates ──
  useEffect(() => {
    const socket = io(API_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    // Helper: reload messages for the active conversation (silent)
    const reloadActiveMessages = () => {
      const conv = selectedConversationRef.current;
      const sessId = selectedSessionRef.current;
      if (!conv || !sessId) return;
      const jidParam =
        conv.alternativeJids && conv.alternativeJids.length > 0
          ? conv.alternativeJids.join(',')
          : conv.jid;
      waApi.getMessages(sessId, jidParam).then(setMessages).catch(() => {});
    };

    // Helper: reload conversation list (silent)
    const reloadConversations = () => {
      const sessId = selectedSessionRef.current;
      if (!sessId) return;
      waApi.getConversationList(sessId).then(setConversations).catch(() => {});
    };

    const handleNewMessage = (payload: {
      id: string;
      sessionId: string;
      jid: string;
      name?: string | null;
      text?: string | null;
      type?: string | null;
      fromMe: boolean;
      createdAt: string | Date;
    }) => {
      const activeSessionId = selectedSessionRef.current;
      if (!activeSessionId || payload.sessionId !== activeSessionId) return;

      const createdAt = payload.createdAt
        ? new Date(payload.createdAt).toISOString()
        : new Date().toISOString();

      // Check if the message belongs to the active conversation
      const activeConv = selectedConversationRef.current;
      const matchesConversation =
        activeConv &&
        (activeConv.jid === payload.jid ||
          activeConv.alternativeJids?.includes(payload.jid));

      if (matchesConversation) {
        // Optimistic: add message to chat detail immediately
        setMessages((prev) => {
          const exists = prev.some(
            (msg) => msg.id === payload.id || msg.messageId === payload.id,
          );
          if (exists) return prev;

          return [
            ...prev,
            {
              id: payload.id,
              sessionId: payload.sessionId,
              phone: payload.jid,
              direction: payload.fromMe ? 'OUTGOING' : 'INCOMING',
              messageId: payload.id,
              text: payload.text ?? null,
              type: payload.type ?? null,
              status: 'SENT',
              createdAt,
            },
          ];
        });
      }

      // Reload from DB to catch any JID mismatch (debounced by the BE emit)
      reloadActiveMessages();
      reloadConversations();
    };

    const handleConversationUpdated = (payload: {
      sessionId: string;
      jid: string;
    }) => {
      const activeSessionId = selectedSessionRef.current;
      if (!activeSessionId || payload.sessionId !== activeSessionId) return;

      reloadActiveMessages();
      reloadConversations();
    };

    // Reconnect handling — reload everything when socket reconnects
    socket.on('connect', () => {
      const sessId = selectedSessionRef.current;
      if (sessId) {
        socket.emit('join-session', sessId);
        reloadConversations();
        reloadActiveMessages();
      }
    });

    socket.on('new-message', handleNewMessage);
    socket.on('conversation-updated', handleConversationUpdated);

    return () => {
      socket.off('connect');
      socket.off('new-message', handleNewMessage);
      socket.off('conversation-updated', handleConversationUpdated);
      socket.disconnect();
    };
  }, []); // ← stable: no deps, handlers read from refs

  useEffect(() => {
    if (!selectedSessionId) return;
    socketRef.current?.emit('join-session', selectedSessionId);
  }, [selectedSessionId]);

  const loadSessions = async () => {
    try {
      const data = await waApi.getSessions();
      setSessions(data);
      const connected = data.find((s) => s.connected);
      if (connected) setSelectedSessionId(connected.id);
      else if (data.length > 0) setSelectedSessionId(data[0].id);
    } catch {
      showError('Failed to load sessions');
    }
  };

  const loadConversations = async (silent = false) => {
    await loadConversationsBySession(selectedSessionId, silent);
  };

  const loadMessages = useCallback(
    async (conv: WhatsAppConversation, silent = false) => {
      if (!selectedSessionId) return;
      if (!silent) setLoadingMessages(true);
      try {
        // Pass all alternativeJids so we see messages from all merged JIDs
        const jidParam =
          conv.alternativeJids && conv.alternativeJids.length > 0
            ? conv.alternativeJids.join(',')
            : conv.jid;
        const data = await waApi.getMessages(selectedSessionId, jidParam);
        setMessages(data);
      } catch {
        if (!silent) showError('Failed to load messages');
      } finally {
        if (!silent) setLoadingMessages(false);
      }
    },
    [selectedSessionId],
  );

  const selectConversation = async (conv: WhatsAppConversation) => {
    shouldSmoothScrollRef.current = false;
    setSelectedConversation(conv);
    await loadMessages(conv);
    // Mark as read (all alternative JIDs)
    if (conv.unreadCount > 0) {
      try {
        const jidParam =
          conv.alternativeJids && conv.alternativeJids.length > 0
            ? conv.alternativeJids.join(',')
            : conv.jid;
        await waApi.markAsRead(selectedSessionId, jidParam);
        setConversations((prev) =>
          prev.map((c) => (c.id === conv.id ? { ...c, unreadCount: 0 } : c)),
        );
      } catch {}
    }
  };

  const handleSend = async () => {
    if (!messageInput.trim() || !selectedConversation || !selectedSessionId) return;
    const text = messageInput.trim();
    setMessageInput('');
    setSending(true);

    // Optimistic update
    const tempMsg: WhatsAppMessage = {
      id: `temp-${Date.now()}`,
      sessionId: selectedSessionId,
      phone: selectedConversation.jid,
      direction: 'OUTGOING',
      text,
      type: 'conversation',
      status: 'SENT',
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, tempMsg]);

    try {
      const isGroup = selectedConversation.jid.endsWith('@g.us');
      if (isGroup) {
        await waApi.sendToGroupText({
          sessionId: selectedSessionId,
          groupJid: selectedConversation.jid,
          text,
        });
      } else {
        // Send using the full JID directly (supports @lid, @s.whatsapp.net)
        const result = await waApi.sendChatMessage(selectedSessionId, selectedConversation.jid, text);
        // Update optimistic message with real messageId so websocket dedup works
        if (result?.messageId) {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempMsg.id ? { ...m, id: result.messageId!, messageId: result.messageId } : m,
            ),
          );
        }
      }
      // No need to reload — BE emits 'new-message' via websocket which handles sync
    } catch {
      showError('Failed to send message');
      setMessages((prev) => prev.filter((m) => m.id !== tempMsg.id));
      setMessageInput(text);
    } finally {
      setSending(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const refreshMessages = async () => {
    if (selectedConversation) {
      await loadMessages(selectedConversation);
    }
  };

  const formatJid = (jid: string) => {
    if (!jid) return '';
    return jid.replace('@s.whatsapp.net', '').replace('@g.us', ' (Group)');
  };

  const formatTime = (dateStr?: string | null) => {
    if (!dateStr) return '';
    const d = dayjs(dateStr);
    const now = dayjs();
    if (now.diff(d, 'day') < 1) return d.format('h:mm A');
    if (now.diff(d, 'day') < 7) return d.fromNow();
    return d.format('DD/MM/YY');
  };

  const formatMessageTime = (dateStr: string) => {
    return dayjs(dateStr).format('h:mm A');
  };

  const renderDateSeparator = (dateStr: string) => {
    const d = dayjs(dateStr);
    const now = dayjs();
    if (now.isSame(d, 'day')) return 'Hari ini';
    if (now.subtract(1, 'day').isSame(d, 'day')) return 'Kemarin';
    return d.format('DD MMMM YYYY');
  };

  // Group messages by date
  const groupedMessages = messages.reduce(
    (groups, msg) => {
      const date = dayjs(msg.createdAt).format('YYYY-MM-DD');
      if (!groups[date]) groups[date] = [];
      groups[date].push(msg);
      return groups;
    },
    {} as Record<string, WhatsAppMessage[]>,
  );

  return (
    <Layout style={{ height: 'calc(100vh - 48px)', background: '#fff', borderRadius: 8, overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
      {/* Left Panel - Conversation List */}
      <Sider
        width={380}
        style={{
          background: '#fff',
          borderRight: '1px solid #e8e8e8',
          height: '100%',
          overflow: 'hidden',
        }}
      >
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '16px 16px 8px', borderBottom: '1px solid #f0f0f0', flexShrink: 0 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <Title level={4} style={{ margin: 0 }}>Messages</Title>
            <Dropdown
              menu={{
                items: [
                  { key: 'refresh', label: 'Refresh', icon: <ReloadOutlined />, onClick: () => loadConversations() },
                ],
              }}
              trigger={['click']}
            >
              <Button type="text" icon={<MoreOutlined />} />
            </Dropdown>
          </div>

          {/* Session selector */}
          <Select
            style={{ width: '100%', marginBottom: 8 }}
            placeholder="Select session"
            value={selectedSessionId || undefined}
            onChange={setSelectedSessionId}
            options={sessions.map((s) => ({
              value: s.id,
              label: (
                <Space>
                  <span>{s.label || s.id.slice(0, 12)}</span>
                  <Tag color={s.connected ? 'green' : 'default'} style={{ fontSize: 10 }}>
                    {s.connected ? 'Online' : 'Offline'}
                  </Tag>
                </Space>
              ),
            }))}
            size="small"
          />

          {/* Search */}
          <Input
            placeholder="Search conversation..."
            prefix={<SearchOutlined style={{ color: '#bfbfbf' }} />}
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            allowClear
            size="small"
          />
        </div>

        {/* Conversation List */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden' }}>
          {loadingConvos ? (
            <div style={{ textAlign: 'center', padding: 40 }}>
              <Spin />
            </div>
          ) : filteredConversations.length === 0 ? (
            <Empty
              description="No conversations"
              style={{ marginTop: 60 }}
              image={Empty.PRESENTED_IMAGE_SIMPLE}
            />
          ) : (
            <List
              dataSource={filteredConversations}
              renderItem={(conv) => (
                <List.Item
                  key={conv.id}
                  onClick={() => selectConversation(conv)}
                  style={{
                    padding: '12px 16px',
                    cursor: 'pointer',
                    background:
                      selectedConversation?.id === conv.id
                        ? '#e6f4ff'
                        : 'transparent',
                    borderLeft:
                      selectedConversation?.id === conv.id
                        ? '3px solid #1677ff'
                        : '3px solid transparent',
                    transition: 'all 0.2s',
                  }}
                  onMouseEnter={(e) => {
                    if (selectedConversation?.id !== conv.id) {
                      (e.currentTarget as HTMLElement).style.background = '#fafafa';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (selectedConversation?.id !== conv.id) {
                      (e.currentTarget as HTMLElement).style.background = 'transparent';
                    }
                  }}
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        size={44}
                        icon={<UserOutlined />}
                        style={{ backgroundColor: conv.isGroup ? '#87d068' : '#1677ff' }}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text strong ellipsis style={{ maxWidth: 180 }}>
                          {conv.name || formatJid(conv.jid)}
                        </Text>
                        <Text type="secondary" style={{ fontSize: 11, whiteSpace: 'nowrap' }}>
                          {formatTime(conv.lastMessageAt)}
                        </Text>
                      </div>
                    }
                    description={
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Text
                          type="secondary"
                          ellipsis
                          style={{ maxWidth: 220, fontSize: 13 }}
                        >
                          {conv.lastMessageText || `[${conv.lastMessageType || 'media'}]`}
                        </Text>
                        {conv.unreadCount > 0 && (
                          <Badge
                            count={conv.unreadCount}
                            style={{
                              backgroundColor: '#1677ff',
                              fontSize: 10,
                              minWidth: 18,
                              height: 18,
                              lineHeight: '18px',
                            }}
                          />
                        )}
                      </div>
                    }
                  />
                </List.Item>
              )}
            />
          )}
        </div>
        </div>
      </Sider>

      {/* Right Panel - Chat Area */}
      <Content
        style={{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
          background: '#f5f5f5',
        }}
      >
        {!selectedConversation ? (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: '#8c8c8c',
            }}
          >
            <SmileOutlined style={{ fontSize: 64, marginBottom: 16, color: '#d9d9d9' }} />
            <Title level={4} type="secondary">Select a conversation</Title>
            <Text type="secondary">Choose a conversation from the list to start chatting</Text>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div
              style={{
                padding: '12px 20px',
                background: '#fff',
                borderBottom: '1px solid #e8e8e8',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Space>
                <Avatar
                  size={40}
                  icon={<UserOutlined />}
                  style={{ backgroundColor: selectedConversation.isGroup ? '#87d068' : '#1677ff' }}
                />
                <div>
                  <Text strong style={{ fontSize: 15 }}>
                    {selectedConversation.name || formatJid(selectedConversation.jid)}
                  </Text>
                  <br />
                  <Text type="secondary" style={{ fontSize: 12 }}>
                    {selectedConversation.isGroup ? 'Group Chat' : formatJid(selectedConversation.jid)}
                  </Text>
                </div>
              </Space>
              <Space>
                <Button
                  type="text"
                  icon={<ReloadOutlined />}
                  onClick={refreshMessages}
                  title="Refresh messages"
                />
                <Button type="text" icon={<UserOutlined />} title="Contact info" />
                <Dropdown
                  menu={{
                    items: [
                      { key: 'info', label: 'Contact info' },
                    ],
                  }}
                  trigger={['click']}
                >
                  <Button type="text" icon={<MoreOutlined />} />
                </Dropdown>
              </Space>
            </div>

            {/* Messages Area */}
            <div
              style={{
                flex: 1,
                overflow: 'auto',
                padding: '16px 60px',
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23e0e0e0' fill-opacity='0.15'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              }}
            >
              {loadingMessages ? (
                <div style={{ textAlign: 'center', padding: 40 }}>
                  <Spin />
                </div>
              ) : messages.length === 0 ? (
                <div style={{ textAlign: 'center', padding: 60 }}>
                  <Text type="secondary">No messages yet</Text>
                </div>
              ) : (
                Object.entries(groupedMessages).map(([date, msgs]) => (
                  <div key={date}>
                    {/* Date separator */}
                    <div style={{ textAlign: 'center', margin: '16px 0' }}>
                      <Tag
                        style={{
                          background: '#e2e8f0',
                          border: 'none',
                          borderRadius: 8,
                          padding: '2px 12px',
                          fontSize: 12,
                          color: '#64748b',
                        }}
                      >
                        {renderDateSeparator(date)}
                      </Tag>
                    </div>

                    {msgs.map((msg) => (
                      <div
                        key={msg.id}
                        style={{
                          display: 'flex',
                          justifyContent: msg.direction === 'OUTGOING' ? 'flex-end' : 'flex-start',
                          marginBottom: 6,
                        }}
                      >
                        {msg.direction === 'INCOMING' && (
                          <Avatar
                            size={28}
                            icon={<UserOutlined />}
                            style={{
                              marginRight: 8,
                              marginTop: 4,
                              backgroundColor: '#1677ff',
                              flexShrink: 0,
                            }}
                          />
                        )}
                        <div
                          style={{
                            maxWidth: '65%',
                            padding: '8px 12px',
                            borderRadius:
                              msg.direction === 'OUTGOING'
                                ? '12px 12px 4px 12px'
                                : '12px 12px 12px 4px',
                            background: msg.direction === 'OUTGOING' ? '#1677ff' : '#fff',
                            color: msg.direction === 'OUTGOING' ? '#fff' : '#1f1f1f',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
                          }}
                        >
                          <div style={{ wordBreak: 'break-word', fontSize: 14, lineHeight: 1.5 }}>
                            {msg.text || `[${msg.type || 'media'}]`}
                          </div>
                          <div
                            style={{
                              textAlign: 'right',
                              marginTop: 2,
                              fontSize: 11,
                              color: msg.direction === 'OUTGOING' ? 'rgba(255,255,255,0.7)' : '#8c8c8c',
                            }}
                          >
                            {formatMessageTime(msg.createdAt)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div
              style={{
                padding: '12px 20px',
                background: '#fff',
                borderTop: '1px solid #e8e8e8',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <Button type="text" icon={<SmileOutlined />} style={{ color: '#8c8c8c' }} />
              <Button type="text" icon={<PaperClipOutlined />} style={{ color: '#8c8c8c' }} />
              <Input
                placeholder="Type message"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                style={{
                  flex: 1,
                  borderRadius: 20,
                  background: '#f5f5f5',
                }}
                size="large"
              />
              <Button
                type="primary"
                shape="circle"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={sending}
                disabled={!messageInput.trim()}
                size="large"
              />
            </div>
          </>
        )}
      </Content>
    </Layout>
  );
};

export default WaChatConsolePage;
