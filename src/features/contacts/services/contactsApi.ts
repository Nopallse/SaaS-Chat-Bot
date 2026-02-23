import { axiosInstance } from '@/services/axiosInstance';
import type {
  EmailContact,
  WhatsAppContact,
  ContactsResponse,
  ImportResponse,
} from '../types/contacts';

export interface CreateWhatsAppContactRequest {
  phone: string;
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
  source?: string;
}

export interface UpdateWhatsAppContactRequest {
  phone?: string;
  name?: string;
  status?: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
  source?: string;
}

export type { EmailContact, WhatsAppContact, ContactsResponse, ImportResponse };

export const contactsApi = {
  /**
   * Import contacts from Excel file
   */
  async importContacts(file: File): Promise<ImportResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/contacts/import', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Handle nested response structure: { statusCode, message, data: { ... } }
    const payload: any = response.data;
    const data = payload?.data || payload;
    return data;
  },

  /**
   * Get all contacts (email and WhatsApp)
   */
  async getContacts(): Promise<ContactsResponse> {
    const response = await axiosInstance.get('/contacts');
    // Handle nested response structure: { statusCode, message, data: { emails: [...], whatsapp: [...] } }
    const payload: any = response.data;
    const data = payload?.data || payload;
    return data;
  },

  async createWhatsAppContact(
    payload: CreateWhatsAppContactRequest
  ): Promise<WhatsAppContact> {
    const response = await axiosInstance.post('/contacts/whatsapp', payload);
    const resPayload: any = response.data;
    return resPayload?.data || resPayload;
  },

  async updateWhatsAppContact(
    id: string,
    payload: UpdateWhatsAppContactRequest
  ): Promise<WhatsAppContact> {
    const response = await axiosInstance.patch(`/contacts/whatsapp/${id}`, payload);
    const resPayload: any = response.data;
    return resPayload?.data || resPayload;
  },

  async deleteWhatsAppContact(id: string): Promise<{ id: string }> {
    const response = await axiosInstance.delete(`/contacts/whatsapp/${id}`);
    const resPayload: any = response.data;
    return resPayload?.data || resPayload;
  },
};

