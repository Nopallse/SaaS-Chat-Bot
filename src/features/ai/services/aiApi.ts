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

const normalizeAgentPayload = (payload: any): AiAgent | null => {
  if (!payload) return null;

  const candidate = payload?.data?.agent ?? payload?.agent ?? payload?.data ?? payload;

  if (!candidate || typeof candidate !== 'object') return null;
  return candidate as AiAgent;
};

export const aiApi = {
  // Get agent by WhatsApp session ID
  getAgent: async (sessionId: string): Promise<AiAgent | null> => {
    const response = await axiosInstance.get(`/ai/${sessionId}`);
    return normalizeAgentPayload(response.data);
  },

  // Create a new AI Agent
  createAgent: async (data: CreateAgentRequest): Promise<AiAgent> => {
    const response = await axiosInstance.post('/ai', data);
    const agent = normalizeAgentPayload(response.data);
    if (!agent) throw new Error('Invalid create agent response');
    return agent;
  },

  // Switch agent mode (BOT / HUMAN)
  switchMode: async (agentId: string, mode: 'BOT' | 'HUMAN'): Promise<AiAgent> => {
    const response = await axiosInstance.patch(`/ai/${agentId}/mode`, { mode });
    const agent = normalizeAgentPayload(response.data);
    if (!agent) throw new Error('Invalid switch mode response');
    return agent;
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
