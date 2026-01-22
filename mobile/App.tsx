import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import { Colors, Spacing } from './src/styles/theme';

function AppContent() {
  const { isLoggedIn, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={styles.loading}>
        {/* 种子发芽动画 */}
        <View style={styles.seedContainer}>
          <View style={styles.seed}>
            <View style={styles.sprout} />
          </View>
          <ActivityIndicator
            style={styles.spinner}
            size="small"
            color={Colors.primary}
          />
        </View>
        <Text style={styles.loadingText}>Reborn 正在生长...</Text>
      </View>
    );
  }

  return <AppNavigator isLoggedIn={isLoggedIn} />;
}

export default function App() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    backgroundColor: Colors.background,
    justifyContent: 'center',
    alignItems: 'center',
  },
  seedContainer: {
    position: 'relative',
    width: 80,
    height: 80,
    marginBottom: Spacing.lg,
  },
  seed: {
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
    top: -20,
    left: 18,
    width: 4,
    height: 30,
    backgroundColor: Colors.success,
    borderRadius: 2,
  },
  spinner: {
    position: 'absolute',
    top: 20,
    left: 20,
    width: 40,
    height: 40,
  },
  loadingText: {
    fontSize: 14,
    color: Colors.textSecondary,
    letterSpacing: 1,
  },
});
