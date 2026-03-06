import { axiosInstance } from './axiosInstance';

export interface MediaUploadResponse {
  uri: string;
  publicId: string;
}

export const mediaApi = {
  async uploadImage(file: File): Promise<MediaUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post('/media/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: 30000,
    });

    const payload: any = response.data;
    return payload?.data || payload;
  },
};
