import { axiosInstance } from '@/services/axiosInstance';

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
};

export default emailApi;
