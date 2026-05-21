import { View, Text, useColorScheme } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
} from '@expo-google-fonts/roboto';

export default function EmptyState({ icon: Icon, title, description }) {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
  });

  if (!fontsLoaded) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: isDark ? '#121212' : '#FFFFFF',
        paddingTop: insets.top,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
      }}
    >
      <StatusBar style={isDark ? 'light' : 'dark'} />

      <View
        style={{
          width: 80,
          height: 80,
          borderRadius: 40,
          backgroundColor: isDark ? '#262626' : '#F8F8F8',
          justifyContent: 'center',
          alignItems: 'center',
          marginBottom: 24,
        }}
      >
        <Icon size={36} color={isDark ? '#8E8E8E' : '#BDBDBD'} />
      </View>

      <Text
        style={{
          fontFamily: 'Roboto_500Medium',
          fontSize: 22,
          color: isDark ? '#FFFFFF' : '#000000',
          textAlign: 'center',
          marginBottom: 12,
        }}
      >
        {title}
      </Text>

      <Text
        style={{
          fontFamily: 'Roboto_400Regular',
          fontSize: 16,
          color: isDark ? '#B0B0B0' : '#8E8E8E',
          textAlign: 'center',
          lineHeight: 24,
        }}
      >
        {description}
      </Text>
    </View>
  );
}
