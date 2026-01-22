import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { profileService } from '../services/profile';
import { Profile } from '../types';
import { Colors, Spacing, BorderRadius } from '../styles/theme';

export default function ProfileScreen() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editedProfile, setEditedProfile] = useState<Partial<Profile>>({});

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await profileService.getProfile();
      setProfile(data);
      setEditedProfile({
        nickname: data.nickname,
        current_identity: data.current_identity,
        ideal_identity: data.ideal_identity,
        core_problem: data.core_problem,
      });
    } catch (error) {
      console.error('加载资料失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await profileService.updateProfile(editedProfile);
      setProfile((prev) => (prev ? { ...prev, ...editedProfile } : null));
      setIsEditing(false);
      Alert.alert('成功', '资料已更新');
    } catch (error) {
      Alert.alert('错误', '保存失败，请重试');
    }
  };

  const handleLogout = () => {
    Alert.alert('退出登录', '确定要退出登录吗？', [
      { text: '取消', style: 'cancel' },
      { text: '确定', onPress: logout },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* 顶部渐变背景 */}
      <View style={styles.headerGradient} />

      <ScrollView contentContainerStyle={styles.content}>
        {/* 头像区域 - 模拟年轮 */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            {/* 年轮装饰 */}
            <View style={[styles.ring, styles.ring1]} />
            <View style={[styles.ring, styles.ring2]} />
            <View style={[styles.ring, styles.ring3]} />

            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {profile?.nickname?.charAt(0)?.toUpperCase() || '?'}
              </Text>
            </View>
          </View>
          <Text style={styles.name}>{profile?.nickname || '未设置昵称'}</Text>
          <Text style={styles.subtitle}>正在成长的种子</Text>
        </View>

        {/* 身份信息卡片 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <View style={styles.sectionDot} />
              <Text style={styles.sectionTitle}>身份信息</Text>
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(!isEditing)}
            >
              <Text style={styles.editButtonText}>
                {isEditing ? '取消' : '编辑'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* 昵称字段 */}
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>昵称</Text>
              <View style={styles.fieldLine} />
            </View>
            {isEditing ? (
              <TextInput
                style={styles.input}
                value={editedProfile.nickname}
                onChangeText={(text) =>
                  setEditedProfile((prev) => ({ ...prev, nickname: text }))
                }
                placeholder="输入昵称"
                placeholderTextColor={Colors.textLight}
              />
            ) : (
              <Text style={styles.value}>
                {profile?.nickname || '未设置'}
              </Text>
            )}
          </View>

          {/* 当前身份 */}
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>当前身份</Text>
              <View style={styles.fieldLine} />
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={editedProfile.current_identity}
                onChangeText={(text) =>
                  setEditedProfile((prev) => ({ ...prev, current_identity: text }))
                }
                placeholder="描述你现在的身份状态"
                placeholderTextColor={Colors.textLight}
                multiline
              />
            ) : (
              <Text style={styles.value}>
                {profile?.current_identity || '未设置'}
              </Text>
            )}
          </View>

          {/* 理想身份 */}
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>理想身份</Text>
              <View style={styles.fieldLine} />
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={editedProfile.ideal_identity}
                onChangeText={(text) =>
                  setEditedProfile((prev) => ({ ...prev, ideal_identity: text }))
                }
                placeholder="描述你想成为的样子"
                placeholderTextColor={Colors.textLight}
                multiline
              />
            ) : (
              <Text style={styles.value}>
                {profile?.ideal_identity || '未设置'}
              </Text>
            )}
          </View>

          {/* 核心问题 */}
          <View style={styles.field}>
            <View style={styles.fieldHeader}>
              <Text style={styles.label}>核心问题</Text>
              <View style={styles.fieldLine} />
            </View>
            {isEditing ? (
              <TextInput
                style={[styles.input, styles.multilineInput]}
                value={editedProfile.core_problem}
                onChangeText={(text) =>
                  setEditedProfile((prev) => ({ ...prev, core_problem: text }))
                }
                placeholder="你目前面临的最大挑战是什么"
                placeholderTextColor={Colors.textLight}
                multiline
              />
            ) : (
              <Text style={styles.value}>
                {profile?.core_problem || '未设置'}
              </Text>
            )}
          </View>

          {/* 保存按钮 */}
          {isEditing && (
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <View style={styles.saveButtonGradient}>
                <Text style={styles.saveButtonText}>保存修改</Text>
              </View>
            </TouchableOpacity>
          )}
        </View>

        {/* 退出按钮 */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>退出登录</Text>
        </TouchableOpacity>

        {/* 底部留白 */}
        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: Colors.primary,
  },
  content: {
    paddingTop: 140,
    paddingHorizontal: Spacing.lg,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.xl,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: Spacing.md,
  },
  // 年轮效果 - 三层渐变圆环
  ring: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: Colors.secondaryLight,
  },
  ring1: {
    width: 100,
    height: 100,
    marginTop: -10,
    marginLeft: -10,
    opacity: 0.4,
  },
  ring2: {
    width: 110,
    height: 110,
    marginTop: -15,
    marginLeft: -15,
    opacity: 0.3,
  },
  ring3: {
    width: 120,
    height: 120,
    marginTop: -20,
    marginLeft: -20,
    opacity: 0.2,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.primaryDark,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 32,
    fontWeight: '300',
    color: Colors.background,
  },
  name: {
    fontSize: 24,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: Spacing.xs,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.lg,
    marginBottom: Spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.primary,
    marginRight: Spacing.sm,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.text,
    letterSpacing: 1,
  },
  editButton: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  editButtonText: {
    fontSize: 14,
    color: Colors.primary,
  },
  field: {
    marginBottom: Spacing.lg,
  },
  fieldHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  label: {
    fontSize: 12,
    color: Colors.textSecondary,
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  fieldLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.surfaceDark,
    marginLeft: Spacing.sm,
  },
  value: {
    fontSize: 16,
    color: Colors.text,
    lineHeight: 24,
    paddingLeft: Spacing.xs,
  },
  input: {
    backgroundColor: Colors.backgroundDark,
    borderRadius: BorderRadius.sm,
    padding: Spacing.md,
    fontSize: 16,
    color: Colors.text,
    marginLeft: Spacing.xs,
  },
  multilineInput: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  saveButton: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: Spacing.sm,
  },
  saveButtonGradient: {
    backgroundColor: Colors.secondary,
    paddingVertical: Spacing.md,
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '500',
    letterSpacing: 1,
  },
  logoutButton: {
    paddingVertical: Spacing.md,
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.error,
  },
  logoutText: {
    color: Colors.error,
    fontSize: 16,
  },
  bottomSpacer: {
    height: Spacing.xxl,
  },
});
