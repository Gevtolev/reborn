# Reborn Mobile 实现计划

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** 实现 Reborn App 的 React Native 移动端，让用户能在手机上完整体验 Agent 引导的身份重塑流程。

**Architecture:** React Native + Expo，调用后端 REST API，支持流式对话响应。

**Tech Stack:** React Native, Expo, TypeScript, React Navigation, AsyncStorage

---

## 第一阶段：项目初始化

### Task 1: 初始化 React Native 项目

**Files:**
- Create: `mobile/` directory with Expo project
- Create: `mobile/src/config/api.ts`
- Create: `mobile/src/types/index.ts`

**Step 1: 创建 Expo 项目**

```bash
cd reborn
npx create-expo-app mobile --template blank-typescript
cd mobile
```

**Step 2: 安装必要依赖**

```bash
npx expo install @react-navigation/native @react-navigation/native-stack
npx expo install react-native-screens react-native-safe-area-context
npx expo install @react-native-async-storage/async-storage
npm install axios
```

**Step 3: 创建 API 配置 mobile/src/config/api.ts**

```typescript
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// 开发环境使用本地地址，生产环境替换为真实 API
const API_BASE_URL = __DEV__
  ? 'http://192.168.1.100:8000'  // 替换为你的电脑 IP
  : 'https://api.reborn.app';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器：添加 token
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 响应拦截器：处理 401
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await AsyncStorage.removeItem('token');
      // 可以在这里触发重新登录
    }
    return Promise.reject(error);
  }
);

export const setApiBaseUrl = (url: string) => {
  api.defaults.baseURL = url;
};
```

**Step 4: 创建类型定义 mobile/src/types/index.ts**

```typescript
export interface User {
  id: number;
  phone: string;
}

export interface Profile {
  anti_vision: string | null;
  vision: string | null;
  identity_statement: string | null;
  current_stage: 'new_user' | 'exploring' | 'established';
  key_insights: string[] | null;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export interface ReminderSchedule {
  scheduled_time: string;
  question: string;
}
```

**Step 5: 验证项目可启动**

```bash
npx expo start
```

**Step 6: Commit**

```bash
git add mobile/
git commit -m "feat(mobile): initialize React Native project with Expo"
```

---

### Task 2: 导航和基础布局

**Files:**
- Create: `mobile/src/navigation/AppNavigator.tsx`
- Create: `mobile/src/screens/LoginScreen.tsx`
- Create: `mobile/src/screens/ChatScreen.tsx`
- Create: `mobile/src/screens/ProfileScreen.tsx`
- Modify: `mobile/App.tsx`

**Step 1: 创建导航器 mobile/src/navigation/AppNavigator.tsx**

```typescript
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/LoginScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  Chat: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();

interface Props {
  isLoggedIn: boolean;
}

export default function AppNavigator({ isLoggedIn }: Props) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: { backgroundColor: '#1a1a2e' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: 'bold' },
        }}
      >
        {!isLoggedIn ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <>
            <Stack.Screen
              name="Chat"
              component={ChatScreen}
              options={{ title: 'Reborn' }}
            />
            <Stack.Screen
              name="Profile"
              component={ProfileScreen}
              options={{ title: '我的画像' }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
```

**Step 2: 创建占位屏幕**

```typescript
// mobile/src/screens/LoginScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function LoginScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Reborn</Text>
      <Text style={styles.subtitle}>登录页面</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: '#888',
    marginTop: 10,
  },
});
```

```typescript
// mobile/src/screens/ChatScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ChatScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>对话页面</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#fff',
  },
});
```

```typescript
// mobile/src/screens/ProfileScreen.tsx
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function ProfileScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>画像页面</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 18,
    color: '#fff',
  },
});
```

**Step 3: 更新 App.tsx**

```typescript
import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import AsyncStorage from '@react-native-async-storage/async-storage';
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return null; // 或者显示加载屏幕
  }

  return (
    <>
      <StatusBar style="light" />
      <AppNavigator isLoggedIn={isLoggedIn} />
    </>
  );
}
```

**Step 4: Commit**

```bash
git add mobile/
git commit -m "feat(mobile): add navigation and basic screen structure"
```

---

## 第二阶段：用户认证

### Task 3: 登录功能实现

**Files:**
- Create: `mobile/src/services/auth.ts`
- Create: `mobile/src/context/AuthContext.tsx`
- Modify: `mobile/src/screens/LoginScreen.tsx`
- Modify: `mobile/App.tsx`

**Step 1: 创建认证服务 mobile/src/services/auth.ts**

```typescript
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
```

**Step 2: 创建认证上下文 mobile/src/context/AuthContext.tsx**

```typescript
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { authService } from '../services/auth';

interface AuthContextType {
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (phone: string, code: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      setIsLoggedIn(!!token);
    } catch (error) {
      console.error('Error checking login status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (phone: string, code: string) => {
    await authService.verifyCode(phone, code);
    setIsLoggedIn(true);
  };

  const logout = async () => {
    await authService.logout();
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
```

**Step 3: 实现登录界面 mobile/src/screens/LoginScreen.tsx**

```typescript
import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.sendCode(phone);
      // 开发模式下显示验证码
      if (result.code) {
        Alert.alert('开发模式', `验证码: ${result.code}`);
      }
      setStep('code');
    } catch (error: any) {
      Alert.alert('错误', error.message || '发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async () => {
    if (!code || code.length !== 6) {
      Alert.alert('提示', '请输入6位验证码');
      return;
    }

    setLoading(true);
    try {
      await login(phone, code);
    } catch (error: any) {
      Alert.alert('错误', error.response?.data?.detail || '验证码错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Text style={styles.logo}>Reborn</Text>
        <Text style={styles.tagline}>重塑身份，重启人生</Text>

        {step === 'phone' ? (
          <>
            <TextInput
              style={styles.input}
              placeholder="请输入手机号"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              maxLength={11}
              value={phone}
              onChangeText={setPhone}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleSendCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '发送中...' : '获取验证码'}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <>
            <Text style={styles.phoneHint}>验证码已发送至 {phone}</Text>
            <TextInput
              style={styles.input}
              placeholder="请输入验证码"
              placeholderTextColor="#666"
              keyboardType="number-pad"
              maxLength={6}
              value={code}
              onChangeText={setCode}
            />
            <TouchableOpacity
              style={[styles.button, loading && styles.buttonDisabled]}
              onPress={handleVerifyCode}
              disabled={loading}
            >
              <Text style={styles.buttonText}>
                {loading ? '验证中...' : '登录'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setStep('phone')}>
              <Text style={styles.backText}>返回修改手机号</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 30,
  },
  logo: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 10,
  },
  tagline: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginBottom: 50,
  },
  phoneHint: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 20,
  },
  input: {
    backgroundColor: '#2d2d44',
    borderRadius: 12,
    padding: 16,
    fontSize: 18,
    color: '#fff',
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#6c5ce7',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  backText: {
    color: '#6c5ce7',
    textAlign: 'center',
    marginTop: 20,
    fontSize: 14,
  },
});
```

**Step 4: 更新 App.tsx 使用 AuthContext**

```typescript
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';

function AppContent() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return <AppNavigator isLoggedIn={isLoggedIn} />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="light" />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
```

**Step 5: Commit**

```bash
git add mobile/
git commit -m "feat(mobile): implement phone login with verification code"
```

---

## 第三阶段：核心对话功能

### Task 4: 对话界面实现

**Files:**
- Create: `mobile/src/services/chat.ts`
- Create: `mobile/src/components/MessageBubble.tsx`
- Create: `mobile/src/components/ChatInput.tsx`
- Modify: `mobile/src/screens/ChatScreen.tsx`

**Step 1: 创建聊天服务 mobile/src/services/chat.ts**

```typescript
import { api } from '../config/api';
import { Message } from '../types';

export const chatService = {
  async getFirstMessage(): Promise<string> {
    const response = await api.get('/api/chat/first-message');
    return response.data.message;
  },

  async getHistory(): Promise<Message[]> {
    const response = await api.get('/api/chat/history');
    return response.data.messages;
  },

  async sendMessage(
    message: string,
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const response = await fetch(`${api.defaults.baseURL}/api/chat/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': api.defaults.headers.common['Authorization'] as string,
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
```

**Step 2: 创建消息气泡组件 mobile/src/components/MessageBubble.tsx**

```typescript
import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <View style={[styles.container, isUser ? styles.userContainer : styles.assistantContainer]}>
      <View style={[styles.bubble, isUser ? styles.userBubble : styles.assistantBubble]}>
        <Text style={[styles.text, isUser ? styles.userText : styles.assistantText]}>
          {message.content}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
    paddingHorizontal: 16,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#6c5ce7',
    borderBottomRightRadius: 4,
  },
  assistantBubble: {
    backgroundColor: '#2d2d44',
    borderBottomLeftRadius: 4,
  },
  text: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: '#fff',
  },
  assistantText: {
    color: '#e0e0e0',
  },
});
```

**Step 3: 创建输入组件 mobile/src/components/ChatInput.tsx**

```typescript
import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface Props {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: Props) {
  const [text, setText] = useState('');

  const handleSend = () => {
    if (text.trim() && !disabled) {
      onSend(text.trim());
      setText('');
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={90}
    >
      <View style={styles.container}>
        <TextInput
          style={styles.input}
          placeholder="输入你的想法..."
          placeholderTextColor="#666"
          value={text}
          onChangeText={setText}
          multiline
          maxLength={500}
          editable={!disabled}
        />
        <TouchableOpacity
          style={[styles.sendButton, (!text.trim() || disabled) && styles.sendButtonDisabled]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
        >
          <Ionicons name="send" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    padding: 12,
    backgroundColor: '#1a1a2e',
    borderTopWidth: 1,
    borderTopColor: '#2d2d44',
  },
  input: {
    flex: 1,
    backgroundColor: '#2d2d44',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 16,
    color: '#fff',
    maxHeight: 100,
    marginRight: 10,
  },
  sendButton: {
    backgroundColor: '#6c5ce7',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
});
```

**Step 4: 实现对话屏幕 mobile/src/screens/ChatScreen.tsx**

```typescript
import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../types';
import { chatService } from '../services/chat';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import { RootStackParamList } from '../navigation/AppNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'Chat'>;

export default function ChatScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadChat();

    // 添加导航到画像页面的按钮
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity onPress={() => navigation.navigate('Profile')}>
          <Ionicons name="person-circle-outline" size={28} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, []);

  const loadChat = async () => {
    try {
      const history = await chatService.getHistory();

      if (history.length === 0) {
        // 新用户，显示首次消息
        const firstMessage = await chatService.getFirstMessage();
        setMessages([{ role: 'assistant', content: firstMessage }]);
      } else {
        setMessages(history);
      }
    } catch (error) {
      console.error('Error loading chat:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async (text: string) => {
    // 添加用户消息
    const userMessage: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMessage]);
    setIsSending(true);

    // 添加空的助手消息用于流式更新
    const assistantMessage: Message = { role: 'assistant', content: '' };
    setMessages(prev => [...prev, assistantMessage]);

    try {
      await chatService.sendMessage(text, (chunk) => {
        setMessages(prev => {
          const newMessages = [...prev];
          const lastMessage = newMessages[newMessages.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content += chunk;
          }
          return newMessages;
        });
      });
    } catch (error) {
      console.error('Error sending message:', error);
      // 移除空的助手消息
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsSending(false);
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        ref={flatListRef}
        data={messages}
        keyExtractor={(_, index) => index.toString()}
        renderItem={({ item }) => <MessageBubble message={item} />}
        contentContainerStyle={styles.messageList}
        onContentSizeChange={() => flatListRef.current?.scrollToEnd()}
      />
      <ChatInput onSend={handleSend} disabled={isSending} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  messageList: {
    paddingVertical: 16,
  },
});
```

**Step 5: 安装图标库**

```bash
npx expo install @expo/vector-icons
```

**Step 6: Commit**

```bash
git add mobile/
git commit -m "feat(mobile): implement chat interface with streaming response"
```

---

### Task 5: 用户画像页面

**Files:**
- Create: `mobile/src/services/profile.ts`
- Modify: `mobile/src/screens/ProfileScreen.tsx`

**Step 1: 创建画像服务 mobile/src/services/profile.ts**

```typescript
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
```

**Step 2: 实现画像页面 mobile/src/screens/ProfileScreen.tsx**

```typescript
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { Profile } from '../types';
import { profileService } from '../services/profile';
import { useAuth } from '../context/AuthContext';

export default function ProfileScreen() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { logout } = useAuth();

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('确认退出', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '退出', style: 'destructive', onPress: logout },
    ]);
  };

  const getStageText = (stage: string) => {
    const stages: Record<string, string> = {
      new_user: '🌱 新用户',
      exploring: '🔍 探索中',
      established: '🎯 已建立愿景',
    };
    return stages[stage] || stage;
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>当前阶段</Text>
        <Text style={styles.stageText}>
          {getStageText(profile?.current_stage || 'new_user')}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>反愿景</Text>
        <Text style={styles.sectionSubtitle}>你不想成为的样子</Text>
        <Text style={styles.content}>
          {profile?.anti_vision || '还没有设定，和 AI 教练聊聊吧'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>愿景</Text>
        <Text style={styles.sectionSubtitle}>你想成为的样子</Text>
        <Text style={styles.content}>
          {profile?.vision || '还没有设定，和 AI 教练聊聊吧'}
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>身份声明</Text>
        <Text style={styles.sectionSubtitle}>你是谁</Text>
        <Text style={styles.content}>
          {profile?.identity_statement || '还没有设定，和 AI 教练聊聊吧'}
        </Text>
      </View>

      {profile?.key_insights && profile.key_insights.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>关键洞察</Text>
          {profile.key_insights.map((insight, index) => (
            <Text key={index} style={styles.insightItem}>
              • {insight}
            </Text>
          ))}
        </View>
      )}

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>退出登录</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#1a1a2e',
    justifyContent: 'center',
    alignItems: 'center',
  },
  section: {
    backgroundColor: '#2d2d44',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 16,
    borderRadius: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: '#888',
    marginBottom: 12,
  },
  stageText: {
    fontSize: 20,
    color: '#6c5ce7',
    marginTop: 8,
  },
  content: {
    fontSize: 16,
    color: '#e0e0e0',
    lineHeight: 24,
  },
  insightItem: {
    fontSize: 14,
    color: '#e0e0e0',
    lineHeight: 22,
    marginTop: 8,
  },
  logoutButton: {
    marginHorizontal: 16,
    marginVertical: 30,
    padding: 16,
    backgroundColor: '#ff6b6b',
    borderRadius: 12,
    alignItems: 'center',
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
```

**Step 3: Commit**

```bash
git add mobile/
git commit -m "feat(mobile): implement profile screen with vision display"
```

---

## 阶段检查点

完成以上任务后，移动端 MVP 核心功能已完成：

- ✅ 用户登录（手机号验证码）
- ✅ AI 对话（流式响应）
- ✅ 用户画像展示

**验证清单：**

```bash
cd mobile
npx expo start
# 使用 Expo Go 扫码测试
```

**测试流程：**
1. 打开 App，进入登录页面
2. 输入手机号，获取验证码
3. 输入验证码，登录成功
4. 进入对话页面，发送消息
5. 点击右上角查看画像页面
6. 测试退出登录

---

## 下一步：完善功能（P2）

移动端核心功能完成后，可以继续：
- 每日提醒推送
- 更丰富的 UI 交互
- 离线支持
