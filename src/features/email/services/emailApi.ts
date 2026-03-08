import { axiosInstance } from '@/services/axiosInstance';

export interface GmailMessageItem {
  id: string;
  from: string | null;
  subject: string | null;
  snippet: string | null;
  internalDate: string | null;
  labels: string[];
  gmailAccountId: string;
}

export interface GmailMessageDetail extends GmailMessageItem {
  gmailMessageId: string;
  threadId: string;
  to: string | null;
  bodyHtml: string | null;
  bodyText: string | null;
}

export interface InboxParams {
  limit?: number;
  cursor?: string;
  label?: string;
  accountId?: string;
}

export const emailApi = {
  /**
   * Get Google OAuth connect URL from backend
   */
  async getConnectUrl(): Promise<{ url: string }> {
    const response = await axiosInstance.get('/email/google/connect-url');
    const payload: any = response.data;
    const data = payload?.data || payload;
    return data;
  },

  /**
   * Get connected email accounts
   */
  async getAccounts(): Promise<Array<{ id: string; email: string }>> {
    const response = await axiosInstance.get('/email/accounts');
    const payload: any = response.data;
    const data = payload?.data || payload;
    // Backend returns { accounts: [...] }, extract the accounts array
    return data?.accounts || data || [];
  },

  /**
   * Start email broadcast
   */
  async sendBroadcast(payload: {
    fromEmail: string;
    subject: string;
    html: string;
    emails: string[];
    delayMs?: number;
    jitterMs?: number;
  }): Promise<any> {
    // Convert emails array to recipients format expected by backend
    const recipients = payload.emails.map(email => ({ email }));
    
    const backendPayload = {
      fromEmail: payload.fromEmail,
      subject: payload.subject,
      html: payload.html,
      recipients,
      delayMs: payload.delayMs || 1000,
      jitterMs: payload.jitterMs || 400,
    };

    const response = await axiosInstance.post('/email/broadcast', backendPayload);
    const res: any = response.data;
    return res?.data || res;
  },

  /**
   * Send a single test email
   */
  async sendTest(payload: {
    fromEmail: string;
    toEmail: string;
    subject: string;
    html: string;
  }): Promise<{ success: boolean }> {
    const response = await axiosInstance.post('/email/send-test', payload);
    const res: any = response.data;
    return res?.data || res;
  },

  /**
   * Sync latest Gmail messages for an account
   */
  async syncMessages(email: string): Promise<{ success: boolean }> {
    const response = await axiosInstance.post('/email/sync', { email });
    const res: any = response.data;
    return res?.data || res;
  },

  /**
   * Get inbox messages with filtering and pagination
   */
  async getInbox(params?: InboxParams): Promise<GmailMessageItem[]> {
    const query: Record<string, string> = {};
    if (params?.limit) query.limit = String(params.limit);
    if (params?.cursor) query.cursor = params.cursor;
    if (params?.label) query.label = params.label;
    if (params?.accountId) query.accountId = params.accountId;

    const response = await axiosInstance.get('/email/inbox', { params: query });
    const payload: any = response.data;
    return payload?.data || payload || [];
  },

  /**
   * Get single email detail with full body
   */
  async getMessageById(id: string): Promise<GmailMessageDetail> {
    const response = await axiosInstance.get(`/email/inbox/${encodeURIComponent(id)}`);
    const payload: any = response.data;
    return payload?.data || payload;
  },
};

export default emailApi;
