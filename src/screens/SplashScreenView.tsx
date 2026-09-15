import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { BrandLogo } from '@/components/BrandLogo';
import { colors } from '@/constants/theme';
import { useAuth } from '@/providers/AuthProvider';

export function SplashScreenView() {
  const router = useRouter();
  const { loading, profile, session } = useAuth();

  useEffect(() => {
    if (loading) return;

    const timer = setTimeout(() => {
      if (!session) {
        router.replace('/onboarding' as never);
        return;
      }

      router.replace((profile?.user_type === 'professional' ? '/pro/index' : '/client/index') as never);
    }, 1100);

    return () => clearTimeout(timer);
  }, [loading, profile?.user_type, router, session]);

  return (
    <View style={styles.container}>
      <BrandLogo />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
  },
});
