import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Message } from '../types';
import { Colors, Spacing, BorderRadius } from '../styles/theme';

interface Props {
  message: Message;
}

export default function MessageBubble({ message }: Props) {
  const isUser = message.role === 'user';

  return (
    <View
      style={[
        styles.container,
        isUser ? styles.userContainer : styles.assistantContainer,
      ]}
    >
      <View
        style={[
          styles.bubble,
          isUser ? styles.userBubble : styles.assistantBubble,
        ]}
      >
        {/* 发言者标签 */}
        {!isUser && <Text style={styles.speakerLabel}>Reborn</Text>}
        <Text
          style={[styles.text, isUser ? styles.userText : styles.assistantText]}
        >
          {message.content}
        </Text>
      </View>
      {/* 时间戳 */}
      <Text style={styles.timestamp}>
        {new Date().toLocaleTimeString('zh-CN', {
          hour: '2-digit',
          minute: '2-digit',
        })}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
  },
  userContainer: {
    alignItems: 'flex-end',
  },
  assistantContainer: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: Spacing.md,
    // 有机圆角 - 非完美对称
    borderTopLeftRadius: 4,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  userBubble: {
    backgroundColor: Colors.primary,
    // 用户消息右下角小一点，像叶尖
    borderBottomRightRadius: 6,
  },
  assistantBubble: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.surfaceDark,
    // AI 消息左下角小一点
    borderBottomLeftRadius: 6,
  },
  speakerLabel: {
    fontSize: 11,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
    letterSpacing: 1,
  },
  text: {
    fontSize: 15,
    lineHeight: 22,
  },
  userText: {
    color: Colors.background,
  },
  assistantText: {
    color: Colors.text,
  },
  timestamp: {
    fontSize: 11,
    color: Colors.textLight,
    marginTop: Spacing.xs,
    paddingHorizontal: Spacing.xs,
  },
});
