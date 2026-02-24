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

export interface UpdateAgentRequest {
  name?: string;
  isEnabled?: boolean;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string | null;
  fallbackReply?: string | null;
}

const normalizeAgentPayload = (payload: any): AiAgent | null => {
  if (!payload) return null;

  const candidate = payload?.data?.agent ?? payload?.agent ?? payload?.data ?? payload;

  if (!candidate || typeof candidate !== 'object') return null;

  // Must have at least id + sessionId to be a valid agent, not a response wrapper
  if (!candidate.id || !candidate.sessionId) return null;

  return candidate as AiAgent;
};

const normalizeKnowledgeList = (payload: any): AiKnowledgeFile[] => {
  if (!payload) return [];
  const list = payload?.data ?? payload;
  return Array.isArray(list) ? list : [];
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

  // Update agent configuration
  updateAgent: async (agentId: string, data: UpdateAgentRequest): Promise<AiAgent> => {
    const response = await axiosInstance.patch(`/ai/${agentId}`, data);
    const agent = normalizeAgentPayload(response.data);
    if (!agent) throw new Error('Invalid update agent response');
    return agent;
  },

  // Toggle agent enabled/disabled
  toggleEnabled: async (agentId: string): Promise<AiAgent> => {
    const response = await axiosInstance.patch(`/ai/${agentId}/toggle`);
    const agent = normalizeAgentPayload(response.data);
    if (!agent) throw new Error('Invalid toggle response');
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
    const data = payload?.data || payload;
    return { success: data?.success ?? true };
  },

  // Get knowledge files for an agent
  getKnowledge: async (agentId: string): Promise<AiKnowledgeFile[]> => {
    const response = await axiosInstance.get(`/ai/${agentId}/knowledge`);
    return normalizeKnowledgeList(response.data);
  },

  // Delete a knowledge file
  deleteKnowledge: async (agentId: string, fileId: string): Promise<void> => {
    await axiosInstance.delete(`/ai/${agentId}/knowledge/${fileId}`);
  },
};
