import { axiosInstance } from '@/services/axiosInstance';
import { API_URL } from '@/utils/constants';
import type { UserProfile, UpdateProfileData } from '../types/user';

function unwrap<T = any>(payload: any): T {
  return payload?.data !== undefined ? payload.data : payload;
}

export const userApi = {
  getProfile: async (): Promise<UserProfile> => {
    const response = await axiosInstance.get('/auth/me');
    const user = unwrap<any>(response.data);
    
    return {
      id: user.id,
      name: user.name || '',
      email: user.email || '',
      avatar: user.picture ? `${API_URL}${user.picture}` : undefined,
      phone: user.telephone || '',
      role: user.role || '',
      emailVerifiedAt: user.emailVerifiedAt || null,
      createdAt: user.createdAt || new Date().toISOString(),
      updatedAt: user.updatedAt || new Date().toISOString(),
    };
  },

  updateProfile: async (userId: string, data: UpdateProfileData, pictureFile?: File): Promise<UserProfile> => {
    const formData = new FormData();
    
    // Tambahkan fields
    if (data.name) formData.append('name', data.name);
    if (data.telephone) formData.append('telephone', data.telephone);
    
    // Tambahkan file jika ada
    if (pictureFile) {
      formData.append('picture', pictureFile);
    }

    const response = await axiosInstance.patch(`/user/${userId}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const updatedUser = unwrap<any>(response.data);
    return {
      id: updatedUser.id,
      name: updatedUser.name || '',
      email: updatedUser.email || '',
      avatar: updatedUser.picture ? `${API_URL}${updatedUser.picture}` : undefined,
      phone: updatedUser.telephone || '',
      createdAt: updatedUser.createdAt || new Date().toISOString(),
      updatedAt: updatedUser.updatedAt || new Date().toISOString(),
    };
  },
};
