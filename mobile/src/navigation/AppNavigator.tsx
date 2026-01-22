import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { Colors, Spacing } from '../styles/theme';
import LoginScreen from '../screens/LoginScreen';
import ChatScreen from '../screens/ChatScreen';
import ProfileScreen from '../screens/ProfileScreen';

export type RootStackParamList = {
  Login: undefined;
  Main: undefined;
};

export type MainTabParamList = {
  Chat: undefined;
  Profile: undefined;
};

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Chat') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          } else {
            iconName = 'help';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.textLight,
        tabBarStyle: {
          backgroundColor: Colors.background,
          borderTopColor: Colors.surface,
          borderTopWidth: 1,
          paddingBottom: Spacing.sm,
          paddingTop: Spacing.xs,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: Colors.background,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: Colors.surface,
        },
        headerTintColor: Colors.text,
        headerTitleStyle: {
          fontWeight: '600',
          fontSize: 18,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen
        name="Chat"
        component={ChatScreen}
        options={{ tabBarLabel: '对话' }}
      />
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ tabBarLabel: '我的' }}
      />
    </Tab.Navigator>
  );
}

interface Props {
  isLoggedIn: boolean;
}

export default function AppNavigator({ isLoggedIn }: Props) {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: Colors.background,
          },
          headerTintColor: Colors.text,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        {!isLoggedIn ? (
          <Stack.Screen
            name="Login"
            component={LoginScreen}
            options={{ headerShown: false }}
          />
        ) : (
          <Stack.Screen
            name="Main"
            component={MainTabs}
            options={{ headerShown: false }}
          />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
