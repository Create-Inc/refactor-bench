import { View, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Screen({ children, style, statusBarStyle }) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View
      style={[
        {
          flex: 1,
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          paddingTop: insets.top,
        },
        style,
      ]}
    >
      <StatusBar style={statusBarStyle || (isDark ? 'light' : 'dark')} />
      {children}
    </View>
  );
}
