import { axiosInstance } from '@/services/axiosInstance';

export interface AiAgent {
  id: string;
  ownerId: string;
  sessionId: string;
  name: string;
  isEnabled: boolean;
  mode: 'BOT' | 'HUMAN';
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string | null;
  fallbackReply: string | null;
  createdAt: string;
  updatedAt: string;
  knowledgeFiles?: AiKnowledgeFile[];
}

export interface AiKnowledgeFile {
  id: string;
  agentId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number | null;
  status: 'PROCESSING' | 'READY' | 'FAILED';
  createdAt: string;
  updatedAt: string;
}

export interface CreateAgentRequest {
  sessionId: string;
  ownerId: string;
  name: string;
  isEnabled: boolean;
}

export const aiApi = {
  // Create a new AI Agent
  createAgent: async (data: CreateAgentRequest): Promise<AiAgent> => {
    const response = await axiosInstance.post('/ai', data);
    const payload: any = response.data;
    return payload?.data || payload;
  },

  // Switch agent mode (BOT / HUMAN)
  switchMode: async (agentId: string, mode: 'BOT' | 'HUMAN'): Promise<AiAgent> => {
    const response = await axiosInstance.patch(`/ai/${agentId}/mode`, { mode });
    const payload: any = response.data;
    return payload?.data || payload;
  },

  // Upload knowledge file (PDF)
  uploadKnowledge: async (agentId: string, file: File): Promise<{ success: boolean }> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await axiosInstance.post(`/ai/${agentId}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    const payload: any = response.data;
    return payload?.data || payload;
  },
};
