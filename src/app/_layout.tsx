import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { Platform } from 'react-native';

import { colors } from '@/constants/theme';
import { AuthProvider } from '@/providers/AuthProvider';

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: Platform.OS === 'ios' ? 'ios_from_right' : 'fade_from_bottom',
        }}
      >
        <Stack.Screen name="index" />
        <Stack.Screen name="auth/sign-in" />
        <Stack.Screen name="auth/sign-up" />
        <Stack.Screen name="auth/forgot-password" />
        <Stack.Screen name="onboarding/index" />
        <Stack.Screen name="role/index" />
        <Stack.Screen name="client-onboarding/index" />
        <Stack.Screen name="professional-onboarding/index" />
        <Stack.Screen name="service-request/index" />
        <Stack.Screen name="professional/[id]" />
        <Stack.Screen name="request-received/index" />
        <Stack.Screen name="client" />
        <Stack.Screen name="pro" />
      </Stack>
    </AuthProvider>
  );
}
