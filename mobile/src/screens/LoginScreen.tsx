import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
} from 'react-native';
import { authService } from '../services/auth';
import { useAuth } from '../context/AuthContext';
import { Colors, Spacing, BorderRadius } from '../styles/theme';

const { width } = Dimensions.get('window');

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();

  // 动画值
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;

  React.useEffect(() => {
    // 入场动画 - 模拟种子发芽
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        delay: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleSendCode = async () => {
    if (!phone || phone.length !== 11) {
      Alert.alert('提示', '请输入正确的手机号');
      return;
    }

    setLoading(true);
    try {
      const result = await authService.sendCode(phone);
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
      {/* 背景层 */}
      <View style={styles.background} />

      {/* 有机装饰图形 - 模拟叶子/种子 */}
      <View style={styles.decorationTop} />
      <View style={styles.decorationBottom} />

      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim },
            ],
          },
        ]}
      >
        {/* Logo 区域 - 模拟种子发芽 */}
        <View style={styles.logoContainer}>
          <View style={styles.seedIcon}>
            <View style={styles.seedInner} />
            <View style={styles.sprout} />
          </View>
          <Text style={styles.logo}>Reborn</Text>
          <Text style={styles.tagline}>重塑身份 · 重启人生</Text>
        </View>

        {/* 输入区域 - 有机形状卡片 */}
        <View style={styles.inputCard}>
          {step === 'phone' ? (
            <>
              <Text style={styles.label}>手机号</Text>
              <TextInput
                style={styles.input}
                placeholder="输入你的手机号"
                placeholderTextColor={Colors.textLight}
                keyboardType="phone-pad"
                maxLength={11}
                value={phone}
                onChangeText={setPhone}
              />
              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleSendCode}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>
                    {loading ? '发送中...' : '开始蜕变'}
                  </Text>
                </View>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.label}>验证码</Text>
              <Text style={styles.hint}>已发送至 {phone}</Text>

              {/* 验证码输入框 - 6个独立格子 */}
              <View style={styles.codeContainer}>
                {[0, 1, 2, 3, 4, 5].map((index) => (
                  <View
                    key={index}
                    style={[
                      styles.codeBox,
                      code.length > index && styles.codeBoxFilled,
                    ]}
                  >
                    <Text style={styles.codeText}>
                      {code[index] || ''}
                    </Text>
                  </View>
                ))}
              </View>

              <TextInput
                style={styles.hiddenInput}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
                autoFocus
              />

              <TouchableOpacity
                style={[styles.button, loading && styles.buttonDisabled]}
                onPress={handleVerifyCode}
                disabled={loading}
                activeOpacity={0.8}
              >
                <View style={styles.buttonGradient}>
                  <Text style={styles.buttonText}>
                    {loading ? '验证中...' : '进入 Reborn'}
                  </Text>
                </View>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => setStep('phone')}>
                <Text style={styles.backText}>← 返回修改手机号</Text>
              </TouchableOpacity>
            </>
          )}
        </View>

        {/* 底部文字 */}
        <Text style={styles.footerText}>
          从种子到森林，每一步都是成长
        </Text>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  background: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: Colors.background,
  },
  decorationTop: {
    position: 'absolute',
    top: -80,
    right: -40,
    width: 200,
    height: 200,
    backgroundColor: Colors.secondaryLight,
    borderRadius: 100,
    opacity: 0.3,
  },
  decorationBottom: {
    position: 'absolute',
    bottom: -60,
    left: -30,
    width: 150,
    height: 150,
    backgroundColor: Colors.primaryLight,
    borderRadius: 75,
    opacity: 0.2,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl,
  },
  seedIcon: {
    width: 80,
    height: 80,
    position: 'relative',
    marginBottom: Spacing.md,
  },
  seedInner: {
    position: 'absolute',
    bottom: 0,
    left: 20,
    width: 40,
    height: 50,
    backgroundColor: Colors.primary,
    borderRadius: [20, 20, 25, 25],
  },
  sprout: {
    position: 'absolute',
    top: 10,
    left: 38,
    width: 4,
    height: 30,
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  logo: {
    fontSize: 42,
    fontWeight: '300',
    color: Colors.text,
    letterSpacing: 4,
    marginBottom: Spacing.sm,
  },
  tagline: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 2,
  },
  inputCard: {
    backgroundColor: Colors.surface,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.xl,
    borderRadius: BorderRadius.organic,
    marginBottom: Spacing.xl,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
    marginBottom: Spacing.sm,
    textTransform: 'uppercase',
  },
  hint: {
    fontSize: 13,
    color: Colors.textLight,
    marginBottom: Spacing.md,
  },
  input: {
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    fontSize: 18,
    color: Colors.text,
    marginBottom: Spacing.lg,
  },
  codeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg,
  },
  codeBox: {
    width: (width - Spacing.lg * 2 - Spacing.lg * 2 - Spacing.md * 5) / 6,
    height: 50,
    backgroundColor: Colors.background,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  codeBoxFilled: {
    borderColor: Colors.primary,
  },
  codeText: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
  },
  hiddenInput: {
    position: 'absolute',
    opacity: 0,
    height: 0,
    width: 0,
  },
  button: {
    overflow: 'hidden',
    borderRadius: BorderRadius.organic,
    marginTop: Spacing.sm,
  },
  buttonGradient: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderRadius: BorderRadius.organic,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 1,
  },
  backText: {
    color: Colors.primary,
    textAlign: 'center',
    marginTop: Spacing.lg,
    fontSize: 14,
  },
  footerText: {
    textAlign: 'center',
    color: Colors.textLight,
    fontSize: 12,
    letterSpacing: 1,
  },
});
