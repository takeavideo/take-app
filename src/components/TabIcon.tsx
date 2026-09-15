import { ColorValue, StyleSheet, Text } from 'react-native';

type TabIconProps = {
  name: 'home' | 'search' | 'orders' | 'profile' | 'wallet';
  color: ColorValue;
};

const icons: Record<TabIconProps['name'], string> = {
  home: '⌂',
  search: '⌕',
  orders: '▤',
  profile: '◉',
  wallet: '$',
};

export function TabIcon({ name, color }: TabIconProps) {
  return <Text style={[styles.icon, { color }]}>{icons[name]}</Text>;
}

const styles = StyleSheet.create({
  icon: {
    fontSize: 22,
    fontWeight: '900',
  },
});
