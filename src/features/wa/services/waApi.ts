import { axiosInstance } from '@/services/axiosInstance';

export interface WhatsAppSession {
  id: string;
  label?: string;
  meJid?: string;
  connected: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ConnectSessionResponse {
  sessionId: string;
  connected: boolean;
  qr?: string | null;
}

export interface QrResponse {
  sessionId: string;
  qr: string | null;
  connected: boolean;
}

export interface BroadcastTextRequest {
  sessionId: string;
  recipients: string[];
  text: string;
  delayMs?: number;
  jitterMs?: number;
  checkNumber?: boolean;
}

export interface BroadcastImageRequest {
  sessionId: string;
  recipients: string[];
  imageUrl: string;
  caption?: string;
  delayMs?: number;
  jitterMs?: number;
  checkNumber?: boolean;
}

export interface BroadcastResult {
  campaignId?: string;
  total: number;
  summary: Record<string, number>;
  results: Array<{
    phone: string;
    status: 'SENT' | 'SKIPPED' | 'FAILED';
    error?: string;
  }>;
}

export interface WhatsAppGroup {
  id: string;
  subject: string;
  size: number;
  participants: number;
}

export interface GroupListResponse {
  count: number;
  groups: WhatsAppGroup[];
}

export interface GroupSendTextRequest {
  sessionId: string;
  groupJid: string;
  text: string;
}

export interface GroupSendImageRequest {
  sessionId: string;
  groupJid: string;
  imageUrl: string;
  caption?: string;
}

export interface GroupDmMembersTextRequest {
  sessionId: string;
  groupJid: string;
  text: string;
  delayMs?: number;
  jitterMs?: number;
  checkNumber?: boolean;
  includeAdmins?: boolean;
}

export interface GroupDmMembersImageRequest {
  sessionId: string;
  groupJid: string;
  imageUrl: string;
  caption?: string;
  delayMs?: number;
  jitterMs?: number;
  checkNumber?: boolean;
  includeAdmins?: boolean;
}

export interface GroupSendResponse {
  groupJid: string;
  messageId: string | null;
}

export interface GroupDmMembersResult {
  groupJid: string;
  groupSubject: string;
  total: number;
  summary: Record<string, number>;
  results: Array<{
    phone: string;
    status: 'SENT' | 'SKIPPED' | 'FAILED';
    error?: string;
  }>;
}

export interface WhatsAppConversation {
  id: string;
  sessionId: string;
  jid: string;
  name?: string | null;
  isGroup: boolean;
  lastMessageId?: string | null;
  lastMessageText?: string | null;
  lastMessageType?: string | null;
  lastMessageAt?: string | null;
  unreadCount: number;
  createdAt: string;
  updatedAt: string;
  alternativeJids?: string[]; // Array of all JIDs that were merged for this contact
}

export interface WhatsAppMessage {
  id: string;
  sessionId: string;
  phone: string;
  direction: 'INCOMING' | 'OUTGOING';
  messageId?: string | null;
  text?: string | null;
  type?: string | null;
  mediaUrl?: string | null;
  status: string;
  createdAt: string;
}

export const waApi = {
  // Get list of all sessions
  getSessions: async (): Promise<WhatsAppSession[]> => {
    const response = await axiosInstance.get('/wa/sessions');
    // Handle nested response structure: { statusCode, message, data: { sessions: [...] } }
    const payload: any = response.data;
    const data = payload?.data || payload;
    return data?.sessions || [];
  },

  // Connect a session
  connectSession: async (sessionId: string, label?: string): Promise<ConnectSessionResponse> => {
    const response = await axiosInstance.post(`/wa/session/${sessionId}/connect`, { label });
    // Handle nested response structure: { statusCode, message, data: { ... } }
    const payload: any = response.data;
    return payload?.data || payload;
  },

  // Get QR code for a session
  getQr: async (sessionId: string): Promise<QrResponse> => {
    const response = await axiosInstance.get(`/wa/session/${sessionId}/qr`);
    // Handle nested response structure: { statusCode, message, data: { ... } }
    const payload: any = response.data;
    return payload?.data || payload;
  },

  // Logout from a session
  logoutSession: async (sessionId: string): Promise<{ success: boolean }> => {
    const response = await axiosInstance.post(`/wa/logout/${sessionId}`);
    // Handle nested response structure: { statusCode, message, data: { ... } }
    const payload: any = response.data;
    return payload?.data || payload;
  },

  // Broadcast text message
  broadcastText: async (data: BroadcastTextRequest): Promise<BroadcastResult> => {
    const response = await axiosInstance.post('/wa/broadcast/text', data);
    // Handle nested response structure: { statusCode, message, data: { ... } }
    const payload: any = response.data;
    const result = payload?.data || payload;
    return result;
  },

  // Broadcast image message
  broadcastImage: async (data: BroadcastImageRequest): Promise<BroadcastResult> => {
    const response = await axiosInstance.post('/wa/broadcast/image', data);
    // Handle nested response structure: { statusCode, message, data: { ... } }
    const payload: any = response.data;
    const result = payload?.data || payload;
    return result;
  },

  // Get groups for a session
  getGroups: async (sessionId: string): Promise<GroupListResponse> => {
    const response = await axiosInstance.get(`/wa/groups/${sessionId}`);
    // Handle nested response structure: { statusCode, message, data: { ... } }
    const payload: any = response.data;
    const data = payload?.data || payload;
    return data;
  },

  // Send text message to group
  sendToGroupText: async (data: GroupSendTextRequest): Promise<GroupSendResponse> => {
    const response = await axiosInstance.post('/wa/group/send-text', data);
    // Handle nested response structure: { statusCode, message, data: { ... } }
    const payload: any = response.data;
    const result = payload?.data || payload;
    return result;
  },

  // Send image message to group
  sendToGroupImage: async (data: GroupSendImageRequest): Promise<GroupSendResponse> => {
    const response = await axiosInstance.post('/wa/group/send-image', data);
    // Handle nested response structure: { statusCode, message, data: { ... } }
    const payload: any = response.data;
    const result = payload?.data || payload;
    return result;
  },

  // DM all group members with text
  dmGroupMembersText: async (data: GroupDmMembersTextRequest): Promise<GroupDmMembersResult> => {
    const response = await axiosInstance.post('/wa/group/dm-members-text', data);
    // Handle nested response structure: { statusCode, message, data: { ... } }
    const payload: any = response.data;
    const result = payload?.data || payload;
    return result;
  },

  // DM all group members with image
  dmGroupMembersImage: async (data: GroupDmMembersImageRequest): Promise<GroupDmMembersResult> => {
    const response = await axiosInstance.post('/wa/group/dm-members-image', data);
    // Handle nested response structure: { statusCode, message, data: { ... } }
    const payload: any = response.data;
    const result = payload?.data || payload;
    return result;
  },

  // Get conversation list for a session
  getConversationList: async (sessionId: string, search?: string): Promise<WhatsAppConversation[]> => {
    const params = search ? { search } : {};
    const response = await axiosInstance.get(`/wa/list-conversations/${sessionId}`, { params });
    const payload: any = response.data;
    return payload?.data || payload || [];
  },

  // Get messages for a specific conversation
  getMessages: async (sessionId: string, jid: string): Promise<WhatsAppMessage[]> => {
    const response = await axiosInstance.get(`/wa/conversations/${sessionId}/${encodeURIComponent(jid)}`);
    const payload: any = response.data;
    return payload?.data || payload || [];
  },

  // Send chat message (reply from console)
  sendChatMessage: async (sessionId: string, to: string, text: string): Promise<{ messageId: string | null; jid: string }> => {
    const response = await axiosInstance.post('/wa/send', { sessionId, to, text });
    const payload: any = response.data;
    return payload?.data || payload;
  },

  // Mark conversation as read
  markAsRead: async (sessionId: string, jid: string): Promise<{ success: boolean }> => {
    const response = await axiosInstance.post(`/wa/conversations/${sessionId}/${encodeURIComponent(jid)}/mark-as-read`);
    const payload: any = response.data;
    return payload?.data || payload;
  },
};

