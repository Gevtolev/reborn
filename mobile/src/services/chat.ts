import { api } from '../config/api';
import { Message } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const chatService = {
  async getFirstMessage(): Promise<string> {
    const response = await api.get('/api/chat/first-message');
    return response.data.message;
  },

  async getHistory(): Promise<Message[]> {
    const response = await api.get('/api/chat/history');
    return response.data.messages;
  },

  async clearHistory(): Promise<void> {
    await api.delete('/api/chat/history');
  },

  async sendMessage(
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const token = await AsyncStorage.getItem('token');

    const response = await fetch(`${api.defaults.baseURL}/api/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    });

    const reader = response.body?.getReader();
    const decoder = new TextDecoder();

    if (!reader) throw new Error('No response body');

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      const text = decoder.decode(value);
      const lines = text.split('\n');

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const content = line.slice(6);
          if (content !== '[DONE]' && !content.startsWith('[ERROR]')) {
            onChunk(content);
          }
        }
      }
    }
  },
};
