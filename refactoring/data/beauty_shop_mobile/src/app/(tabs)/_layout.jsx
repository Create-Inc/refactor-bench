import { Tabs } from 'expo-router';
import { useColorScheme, Text } from 'react-native';

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1E1E1E' : '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: isDark ? '#2A2A2A' : '#EDEDED',
          paddingBottom: 10,
          paddingTop: 10,
          height: 80,
        },
        tabBarActiveTintColor: isDark ? '#FFFFFF' : '#000000',
        tabBarInactiveTintColor: isDark ? '#8E8E8E' : '#BDBDBD',
        tabBarLabelStyle: {
          fontSize: 12,
          fontFamily: 'Roboto_400Regular',
        },
      }}
    >
      <Tabs.Screen
        name="shop"
        options={{
          title: 'Shop',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🛍️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="tips"
        options={{
          title: 'Tips',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>💡</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="explore"
        options={{
          title: 'Explore',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🔍</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="brands"
        options={{
          title: 'Brands',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>🏷️</Text>
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color }) => (
            <Text style={{ color, fontSize: 20 }}>👤</Text>
          ),
        }}
      />
    </Tabs>
  );
}
