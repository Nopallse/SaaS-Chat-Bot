export type Role = 'guest' | 'user' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: Role;
  avatar?: string;
  createdAt: string;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
}
