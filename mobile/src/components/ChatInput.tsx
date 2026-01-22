import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Colors, Spacing, BorderRadius } from '../styles/theme';

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
        {/* 输入框容器 */}
        <View style={styles.inputWrapper}>
          <TextInput
            style={styles.input}
            placeholder="写下你的想法..."
            placeholderTextColor={Colors.textLight}
            value={text}
            onChangeText={setText}
            multiline
            maxLength={500}
            editable={!disabled}
          />
        </View>

        {/* 发送按钮 - 叶子形状 */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            (!text.trim() || disabled) && styles.sendButtonDisabled,
          ]}
          onPress={handleSend}
          disabled={!text.trim() || disabled}
          activeOpacity={0.8}
        >
          <View
            style={[
              styles.sendButtonGradient,
              (!text.trim() || disabled) && styles.sendButtonGradientDisabled,
            ]}
          >
            {/* 发送图标 - 简单的箭头 */}
            <View style={styles.arrowIcon}>
              <View style={styles.arrowLine} />
              <View style={[styles.arrowHead, styles.arrowHeadTop]} />
              <View style={[styles.arrowHead, styles.arrowHeadBottom]} />
            </View>
          </View>
        </TouchableOpacity>
      </View>

      {/* 底部留白 - 适配 iPhone 底部安全区 */}
      <View style={styles.bottomSafe} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.background,
    borderTopWidth: 1,
    borderTopColor: Colors.surface,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: Colors.surface,
    // 有机圆角
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 8,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    marginRight: Spacing.sm,
    maxHeight: 100,
  },
  input: {
    fontSize: 15,
    color: Colors.text,
    minHeight: 36,
    textAlignVertical: 'center',
  },
  sendButton: {
    width: 44,
    height: 44,
    overflow: 'hidden',
    // 有机圆角 - 发芽种子形状
    borderTopLeftRadius: 12,
    borderTopRightRadius: 22,
    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
  },
  sendButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.secondary,
  },
  sendButtonGradientDisabled: {
    backgroundColor: Colors.surfaceDark,
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  arrowIcon: {
    width: 20,
    height: 20,
    position: 'relative',
  },
  arrowLine: {
    position: 'absolute',
    left: 2,
    top: 9,
    width: 16,
    height: 2,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  arrowHead: {
    position: 'absolute',
    right: 0,
    width: 2,
    height: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 1,
  },
  arrowHeadTop: {
    top: 3,
    transform: [{ rotate: '-45deg' }],
    transformOrigin: 'right center',
  },
  arrowHeadBottom: {
    bottom: 3,
    transform: [{ rotate: '45deg' }],
    transformOrigin: 'right center',
  },
  bottomSafe: {
    height: Platform.OS === 'ios' ? 34 : 8,
    backgroundColor: Colors.background,
  },
});
