import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  useColorScheme,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  Inter_300Light,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import { Image } from 'expo-image';
import Screen from '@/components/Screen';

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isScrolled, setIsScrolled] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_300Light,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSettingsPress = (label) => {
    Alert.alert(
      label,
      "This feature is coming soon! We're working on making your experience even better.",
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 10);
  };

  const settingsItems = [
    { icon: '📍', label: 'My Address', color: '#FF6B6B' },
    { icon: '👤', label: 'Account', color: '#4ECDC4' },
    { icon: '🔔', label: 'Notifications', color: '#45B7D1' },
    { icon: '📱', label: 'Devices', color: '#96CEB4' },
    { icon: '⚙️', label: 'Settings', color: '#FF8B94' },
    { icon: '🚪', label: 'Log Out', color: '#D4A5A5' },
  ];

  return (
    <Screen
      style={{ flex: 1, backgroundColor: isDark ? '#121212' : '#FFFFFF' }}
    >
      {/* Sticky Header */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          paddingTop: insets.top + 20,
          paddingHorizontal: 24,
          paddingBottom: 30,
          borderBottomWidth: isScrolled ? 1 : 0,
          borderBottomColor: isDark ? '#333333' : '#F5F5F5',
        }}
      >
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image
              source="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&h=400&fit=crop"
              style={{
                width: 70,
                height: 70,
                borderRadius: 35,
                borderWidth: 2,
                borderColor: isDark ? '#333333' : '#F5F5F5',
              }}
              contentFit="cover"
              transition={200}
            />
            <View style={{ marginLeft: 16 }}>
              <Text
                style={{
                  fontFamily: 'Inter_600SemiBold',
                  fontSize: 20,
                  color: isDark ? '#FFFFFF' : '#000000',
                  marginBottom: 4,
                }}
              >
                Sarah Parker
              </Text>
              <Text
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: isDark ? '#B0B0B0' : '#666666',
                }}
              >
                sarah.parker@gmail.com
              </Text>
            </View>
          </View>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 140,
          paddingBottom: 40,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Settings list */}
        <View style={{ paddingTop: 20 }}>
          {settingsItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                paddingVertical: 20,
                paddingHorizontal: 24,
                borderBottomWidth: 1,
                borderBottomColor: isDark ? '#333333' : '#F5F5F5',
                backgroundColor: isDark ? '#121212' : '#FFFFFF',
              }}
              onPress={() => handleSettingsPress(item.label)}
              activeOpacity={0.7}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: `${item.color}15`,
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginRight: 16,
                }}
              >
                <Text style={{ fontSize: 22 }}>{item.icon}</Text>
              </View>
              <Text
                style={{
                  flex: 1,
                  fontFamily: 'Inter_500Medium',
                  fontSize: 16,
                  color: isDark ? '#FFFFFF' : '#000000',
                }}
              >
                {item.label}
              </Text>
              <Text
                style={{ fontSize: 20, color: isDark ? '#666666' : '#CCCCCC' }}
              >
                ›
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
