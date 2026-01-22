import { api } from '../config/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const authService = {
  async sendCode(phone: string): Promise<{ message: string; code?: string }> {
    const response = await api.post('/api/auth/send-code', { phone });
    return response.data;
  },

  async verifyCode(phone: string, code: string): Promise<string> {
    const response = await api.post('/api/auth/verify-code', { phone, code });
    const { access_token } = response.data;
    await AsyncStorage.setItem('token', access_token);
    return access_token;
  },

  async logout(): Promise<void> {
    await AsyncStorage.removeItem('token');
  },

  async getToken(): Promise<string | null> {
    return AsyncStorage.getItem('token');
  },
};
