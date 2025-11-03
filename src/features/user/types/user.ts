import type { BaseEntity } from '@/types/global';

export interface UserProfile extends BaseEntity {
  name: string;
  email: string;
  avatar?: string;
  bio?: string;
  phone?: string;
}

export interface UpdateProfileData {
  name?: string;
  telephone?: string;
}
