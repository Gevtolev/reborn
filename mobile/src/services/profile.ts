import { api } from '../config/api';
import { Profile } from '../types';

export const profileService = {
  async getProfile(): Promise<Profile> {
    const response = await api.get('/api/profile');
    return response.data;
  },

  async updateProfile(data: Partial<Profile>): Promise<void> {
    await api.put('/api/profile', data);
  },
};
