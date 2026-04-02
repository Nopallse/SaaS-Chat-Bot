import { axiosInstance } from '@/services/axiosInstance';
import { mediaApi } from '@/services/mediaApi';

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
  name?: string;
  isScheduled?: boolean;
  scheduleType?: 'SEND_NOW' | 'SCHEDULE_LATER';
  timetableRepeater?: 'ONCE' | 'EVERY_DAY' | 'EVERY_WEEK' | 'EVERY_MONTH';
  scheduledDate?: string;
  scheduledTime?: string;
  recipients: string[];
  contactIds?: string[];
  useAllContacts?: boolean;
  text: string;
  delayMs?: number;
  jitterMs?: number;
  checkNumber?: boolean;
}

export interface BroadcastImageRequest {
  name?: string;
  isScheduled?: boolean;
  scheduleType?: 'SEND_NOW' | 'SCHEDULE_LATER';
  timetableRepeater?: 'ONCE' | 'EVERY_DAY' | 'EVERY_WEEK' | 'EVERY_MONTH';
  scheduledDate?: string;
  scheduledTime?: string;
  recipients: string[];
  contactIds?: string[];
  useAllContacts?: boolean;
  imageUrl: string;
  caption?: string;
  delayMs?: number;
  jitterMs?: number;
  checkNumber?: boolean;
}

export interface BroadcastResult {
  campaignId?: string;
  status?: 'SCHEDULED';
  message?: string;
  total: number;
  summary?: Record<string, number>;
  results?: Array<{
    phone: string;
    status: 'SENT' | 'SKIPPED' | 'FAILED';
    error?: string;
  }>;
}

export interface WaCampaign {
  id: string;
  name: string;
  type: 'TEXT' | 'IMAGE';
  scheduleType: 'SEND_NOW' | 'SCHEDULE_LATER';
  isScheduled: boolean;
  status: 'PENDING' | 'ACTIVE' | 'COMPLETED' | 'PAUSED';
  createdAt: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  timetableRepeater?: 'ONCE' | 'EVERY_DAY' | 'EVERY_WEEK' | 'EVERY_MONTH' | null;
  stats: {
    total: number;
    sent: number;
    failed: number;
    skipped: number;
  };
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
  groupJid: string;
  text: string;
}

export interface GroupSendImageRequest {
  groupJid: string;
  imageUrl: string;
  caption?: string;
}

export interface GroupDmMembersTextRequest {
  groupJid: string;
  text: string;
  delayMs?: number;
  jitterMs?: number;
  checkNumber?: boolean;
  includeAdmins?: boolean;
}

export interface GroupDmMembersImageRequest {
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

export interface GroupMember {
  phone: string | null;
  lid: string | null;
  jid: string;
  isAdmin: boolean;
  adminType: string | null;
  hasPhoneNumber: boolean;
}

export interface GroupMembersResponse {
  groupJid: string;
  groupSubject: string;
  total: number;
  members: GroupMember[];
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
  logoutSession: async (): Promise<{ success: boolean }> => {
    const response = await axiosInstance.post('/wa/logout');
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
  getGroups: async (): Promise<GroupListResponse> => {
    const response = await axiosInstance.get('/wa/groups');
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

  getCampaigns: async (): Promise<WaCampaign[]> => {
    const response = await axiosInstance.get('/wa/campaigns');
    const payload: any = response.data;
    return payload?.data || payload || [];
  },

  // Get conversation list for a session
  getConversationList: async (search?: string): Promise<WhatsAppConversation[]> => {
    const params = search ? { search } : {};
    const response = await axiosInstance.get('/wa/list-conversations', { params });
    const payload: any = response.data;
    return payload?.data || payload || [];
  },

  // Get messages for a specific conversation
  getMessages: async (jid: string): Promise<WhatsAppMessage[]> => {
    const response = await axiosInstance.get(`/wa/conversations/${encodeURIComponent(jid)}`);
    const payload: any = response.data;
    return payload?.data || payload || [];
  },

  // Send chat message (reply from console)
  sendChatMessage: async (to: string, text: string): Promise<{ messageId: string | null; jid: string }> => {
    const response = await axiosInstance.post('/wa/send', { to, text });
    const payload: any = response.data;
    return payload?.data || payload;
  },

  // Send image from chat console (upload via /media/upload, then send text with URL)
  sendChatImage: async (to: string, file: File, caption?: string): Promise<{ messageId: string | null; to: string; mediaUrl: string }> => {

    // Step 1: Upload image to media service
    const uploaded = await mediaApi.uploadImage(file);

    // Step 2: Send text message with caption or image URL
    const text = caption ? `${caption}\n${uploaded.uri}` : uploaded.uri;
    const result = await waApi.sendChatMessage(to, text);

    return {
      messageId: result?.messageId ?? null,
      to,
      mediaUrl: uploaded.uri,
    };
  },

  // Send document from chat console (upload via /media/upload, then send text with URL)
  sendChatDocument: async (to: string, file: File, caption?: string): Promise<{ messageId: string | null; to: string; mediaUrl: string }> => {

    // Step 1: Upload file to media service
    const uploaded = await mediaApi.uploadImage(file);

    // Step 2: Send text message with file URL
    const text = caption ? `${caption}\n${uploaded.uri}` : uploaded.uri;
    const result = await waApi.sendChatMessage(to, text);

    return {
      messageId: result?.messageId ?? null,
      to,
      mediaUrl: uploaded.uri,
    };
  },

  // Mark conversation as read
  markAsRead: async (jid: string): Promise<{ success: boolean }> => {
    const response = await axiosInstance.post(`/wa/conversations/${encodeURIComponent(jid)}/mark-as-read`);
    const payload: any = response.data;
    return payload?.data || payload;
  },

  // Check if a phone number is registered on WhatsApp
  checkNumber: async (phone: string): Promise<{ exists: boolean; jid: string | null }> => {
    const response = await axiosInstance.get(`/wa/check/${encodeURIComponent(phone)}`);
    const payload: any = response.data;
    return payload?.data || payload;
  },

  // Get group member list
  getGroupMembers: async (groupJid: string): Promise<GroupMembersResponse> => {
    const response = await axiosInstance.get(`/wa/group/${encodeURIComponent(groupJid)}/members`);
    const payload: any = response.data;
    const data = payload?.data || payload;
    return {
      groupJid: data?.groupJid || groupJid,
      groupSubject: data?.groupSubject || '',
      total: data?.total ?? (Array.isArray(data?.members) ? data.members.length : 0),
      members: Array.isArray(data?.members) ? data.members : [],
    };
  },
};

