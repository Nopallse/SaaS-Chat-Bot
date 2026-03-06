import type { BaseEntity } from '@/types/global';

export interface UserProfile extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  phone?: string;
  role?: string;
  emailVerifiedAt?: string | null;
}

export interface UpdateProfileData {
  name?: string;
  telephone?: string;
}
