import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  SafeAreaView,
  ActivityIndicator,
  Text,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Message } from '../types';
import MessageBubble from '../components/MessageBubble';
import ChatInput from '../components/ChatInput';
import { chatService } from '../services/chat';
import { Colors, Spacing, BorderRadius } from '../styles/theme';

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const history = await chatService.getHistory();
      setMessages(history);
    } catch (error) {
      console.error('加载历史消息失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    const confirmed = Platform.OS === 'web'
      ? window.confirm('确定要清除所有历史对话吗？')
      : new Promise((resolve) => {
          // @ts-ignore
          import('react-native').then(({ Alert }) => {
            Alert.alert('清除对话', '确定要清除所有历史对话吗？', [
              { text: '取消', onPress: () => resolve(false) },
              { text: '确定', onPress: () => resolve(true) },
            ]);
          });
        });

    if (confirmed) {
      try {
        await chatService.clearHistory();
        setMessages([]);
      } catch (error) {
        console.error('清除对话失败:', error);
      }
    }
  };

  const handleSend = async (text: string) => {
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setIsStreaming(true);

    // 创建一个占位的助手消息
    const assistantMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    try {
      await chatService.sendMessage(text, (chunk) => {
        setMessages((prev) => {
          const updated = [...prev];
          const lastMessage = updated[updated.length - 1];
          if (lastMessage.role === 'assistant') {
            lastMessage.content += chunk;
          }
          return updated;
        });
      });
    } catch (error) {
      console.error('发送消息失败:', error);
      // 移除空的助手消息
      setMessages((prev) => prev.filter((m) => m.content !== ''));
    } finally {
      setIsStreaming(false);
    }
  };

  const scrollToBottom = () => {
    if (flatListRef.current && messages.length > 0) {
      flatListRef.current.scrollToEnd({ animated: true });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>加载对话中...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor={Colors.background} />

      {/* 头部 */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          {/* 种子图标 */}
          <View style={styles.seedIcon}>
            <View style={styles.seedInner} />
            <View style={styles.sprout} />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Reborn</Text>
            <Text style={styles.headerSubtitle}>你的成长伙伴</Text>
          </View>
        </View>
        {messages.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={handleClearHistory}
          >
            <Ionicons name="trash-outline" size={18} color={Colors.textLight} />
            <Text style={styles.clearButtonText}>清除</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 空状态 */}
      {messages.length === 0 ? (
        <View style={styles.emptyContainer}>
          {/* 装饰性叶子图案 */}
          <View style={styles.leafDecoration}>
            <View style={[styles.leaf, styles.leaf1]} />
            <View style={[styles.leaf, styles.leaf2]} />
            <View style={[styles.leaf, styles.leaf3]} />
          </View>
          <Text style={styles.emptyTitle}>开始你的成长之旅</Text>
          <Text style={styles.emptyText}>
            告诉我你当前面临的挑战{'\n'}
            或者分享你想要实现的目标
          </Text>
          <View style={styles.suggestionChips}>
            <TouchableOpacity
              style={styles.chip}
              onPress={() => handleSend('我想改变我的当前状态')}
            >
              <Text style={styles.chipText}>我想改变现状</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.chip}
              onPress={() => handleSend('我感到迷茫，不知道未来的方向')}
            >
              <Text style={styles.chipText}>感到迷茫</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <MessageBubble message={item} />}
          contentContainerStyle={styles.messageList}
          onContentSizeChange={scrollToBottom}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* 输入区域 */}
      <ChatInput onSend={handleSend} disabled={isStreaming} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: Colors.surface,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seedIcon: {
    width: 40,
    height: 40,
    position: 'relative',
    marginRight: Spacing.sm,
  },
  seedInner: {
    position: 'absolute',
    bottom: 0,
    left: 8,
    width: 24,
    height: 30,
    backgroundColor: Colors.primary,
    borderRadius: [12, 12, 15, 15],
  },
  sprout: {
    position: 'absolute',
    top: 2,
    left: 17,
    width: 3,
    height: 16,
    backgroundColor: Colors.success,
    borderRadius: 1.5,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: 1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  clearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.surface,
  },
  clearButtonText: {
    color: Colors.textLight,
    fontSize: 13,
    marginLeft: Spacing.xs,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: Spacing.md,
    color: Colors.textSecondary,
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: Spacing.xl,
  },
  leafDecoration: {
    position: 'relative',
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  leaf: {
    position: 'absolute',
    width: 30,
    height: 50,
    backgroundColor: Colors.secondaryLight,
    borderRadius: 15,
    opacity: 0.5,
  },
  leaf1: {
    top: 10,
    left: 25,
    transform: [{ rotate: '0deg' }],
  },
  leaf2: {
    top: 20,
    left: 5,
    transform: [{ rotate: '-30deg' }],
  },
  leaf3: {
    top: 20,
    right: 5,
    transform: [{ rotate: '30deg' }],
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.sm,
    letterSpacing: 1,
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: Spacing.xl,
  },
  suggestionChips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.sm,
    borderWidth: 1,
    borderColor: Colors.surfaceDark,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  messageList: {
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xs,
  },
});
