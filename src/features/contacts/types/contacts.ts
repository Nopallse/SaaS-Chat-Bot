export interface EmailContact {
  id: string;
  email: string;
  name?: string;
  status: 'ACTIVE' | 'BOUNCED' | 'UNSUBSCRIBED';
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppContact {
  id: string;
  phone: string;
  name?: string;
  status: 'ACTIVE' | 'INACTIVE' | 'UNKNOWN';
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ContactsResponse {
  emails: EmailContact[];
  whatsapp: WhatsAppContact[];
}

export interface ImportSummary {
  rows: number;
  emails: {
    created: number;
    updated: number;
    skipped: number;
  };
  phones: {
    created: number;
    updated: number;
    skipped: number;
  };
  errors: Array<{
    row: number;
    reason: string;
  }>;
}

export interface ImportResponse {
  success: boolean;
  message: string;
  summary: ImportSummary;
}

export interface GroupImportSummary {
  imported: number;
  updated: number;
  skipped: number;
  lidCount: number;
}

export interface GroupImportDetail {
  phone: string | null;
  jid: string;
  result: 'IMPORTED' | 'UPDATED' | 'SKIPPED';
  isLid: boolean;
}

export interface GroupImportResponse {
  groupJid: string;
  groupSubject: string;
  totalMembers: number;
  summary: GroupImportSummary;
  note?: string;
  details: GroupImportDetail[];
}

