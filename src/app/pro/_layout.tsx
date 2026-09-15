import { Redirect, Tabs } from 'expo-router';

import { TabIcon } from '@/components/TabIcon';
import { colors, typography } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

export default function ProTabsLayout() {
  const { isConfigured, loading, session } = useAuth();

  if (isConfigured && !loading && !session) {
    return <Redirect href="/auth/sign-in" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: typography.fontFamily.medium,
        },
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: 72,
          paddingTop: 8,
          paddingBottom: 12,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Início', tabBarIcon: ({ color }) => <TabIcon name="home" color={color} /> }}
      />
      <Tabs.Screen
        name="requests"
        options={{ title: 'Solicitações', tabBarIcon: ({ color }) => <TabIcon name="orders" color={color} /> }}
      />
      <Tabs.Screen
        name="earnings"
        options={{ title: 'Ganhos', tabBarIcon: ({ color }) => <TabIcon name="wallet" color={color} /> }}
      />
      <Tabs.Screen
        name="profile"
        options={{ title: 'Perfil', tabBarIcon: ({ color }) => <TabIcon name="profile" color={color} /> }}
      />
    </Tabs>
  );
}
