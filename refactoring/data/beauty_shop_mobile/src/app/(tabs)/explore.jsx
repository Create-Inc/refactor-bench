import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  TextInput,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Image } from 'expo-image';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
} from '@expo-google-fonts/inter';
import Screen from '@/components/Screen';

const trendingLooks = [
  {
    id: 1,
    title: 'Autumn Glow',
    image:
      'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    likes: 2.3,
    category: 'Seasonal',
  },
  {
    id: 2,
    title: 'Bold Red Lips',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    likes: 1.8,
    category: 'Classic',
  },
  {
    id: 3,
    title: 'Natural Bronze',
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    likes: 3.1,
    category: 'Everyday',
  },
];

const categories = [
  { id: 1, name: 'Trending', icon: '✨', color: '#FF6B6B' },
  { id: 2, name: 'Seasonal', icon: '🎨', color: '#4ECDC4' },
  { id: 3, name: 'Classic', icon: '⭐', color: '#FFD93D' },
  { id: 4, name: 'Everyday', icon: '❤️', color: '#FF8E8E' },
];

export default function ExploreScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isScrolled, setIsScrolled] = useState(false);

  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleLookPress = (look) => {
    Alert.alert(
      look.title,
      `Get inspired by this ${look.category.toLowerCase()} look with ${look.likes}k likes!`,
      [
        { text: 'Save Look', style: 'default' },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleCategoryPress = (category) => {
    Alert.alert(
      category.name,
      `Explore ${category.name.toLowerCase()} makeup looks and tutorials.`,
      [
        { text: 'Browse', style: 'default' },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 10);
  };

  return (
    <Screen style={{ paddingTop: 0 }}>
      {/* Decorative background elements */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 150,
          height: 150,
          borderRadius: 75,
          backgroundColor: isDark ? '#4A3D36' : '#F5E6D3',
          opacity: 0.3,
          transform: [{ translateX: 75 }, { translateY: -75 }],
        }}
      />

      {/* Sticky Header */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          paddingTop: insets.top + 16,
          paddingHorizontal: 24,
          paddingBottom: 24,
          borderBottomWidth: isScrolled ? 1 : 0,
          borderBottomColor: isDark ? '#333333' : '#E5E5E5',
        }}
      >
        <Text
          style={{
            fontFamily: 'Inter_600SemiBold',
            fontSize: 28,
            color: isDark ? '#FFFFFF' : '#000000',
            marginBottom: 8,
            letterSpacing: -0.5,
          }}
        >
          Explore
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: isDark ? '#B0B0B0' : '#666666',
          }}
        >
          Discover new looks and inspiration
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingTop: insets.top + 110,
          paddingBottom: insets.bottom + 20,
        }}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Search Bar */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
              borderRadius: 16,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <Text style={{ fontSize: 20 }}>🔍</Text>
            <TextInput
              placeholder="Search looks, colors, styles..."
              placeholderTextColor={isDark ? '#666666' : '#999999'}
              style={{
                flex: 1,
                marginLeft: 12,
                fontFamily: 'Inter_400Regular',
                fontSize: 16,
                color: isDark ? '#FFFFFF' : '#000000',
              }}
            />
          </View>
        </View>

        {/* Categories */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <Text
            style={{
              fontFamily: 'Inter_600SemiBold',
              fontSize: 18,
              color: isDark ? '#FFFFFF' : '#000000',
              marginBottom: 16,
            }}
          >
            Categories
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ paddingRight: 24 }}
          >
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={{
                  alignItems: 'center',
                  marginRight: 20,
                  paddingVertical: 12,
                  paddingHorizontal: 16,
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderRadius: 16,
                  borderWidth: 1,
                  borderColor: isDark ? '#333333' : '#E5E5E5',
                  minWidth: 80,
                }}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <View
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: 20,
                    backgroundColor: category.color + '20',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ fontSize: 20 }}>{category.icon}</Text>
                </View>
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 12,
                    color: isDark ? '#FFFFFF' : '#000000',
                    textAlign: 'center',
                  }}
                >
                  {category.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Trending Looks */}
        <View style={{ paddingHorizontal: 24 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              marginBottom: 16,
            }}
          >
            <Text
              style={{
                fontFamily: 'Inter_600SemiBold',
                fontSize: 18,
                color: isDark ? '#FFFFFF' : '#000000',
              }}
            >
              Trending Now
            </Text>
            <TouchableOpacity
              style={{ flexDirection: 'row', alignItems: 'center' }}
            >
              <Text
                style={{
                  fontFamily: 'Inter_500Medium',
                  fontSize: 14,
                  color: isDark ? '#B0B0B0' : '#666666',
                  marginRight: 4,
                }}
              >
                View all
              </Text>
              <Text
                style={{ fontSize: 16, color: isDark ? '#B0B0B0' : '#666666' }}
              >
                →
              </Text>
            </TouchableOpacity>
          </View>

          {trendingLooks.map((look) => (
            <TouchableOpacity
              key={look.id}
              style={{
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderRadius: 16,
                marginBottom: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: isDark ? '#333333' : '#E5E5E5',
              }}
              onPress={() => handleLookPress(look)}
              activeOpacity={0.8}
            >
              <Image
                source={look.image}
                style={{ width: '100%', height: 200 }}
                contentFit="cover"
                transition={100}
              />
              <View style={{ padding: 16 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontFamily: 'Inter_600SemiBold',
                        fontSize: 16,
                        color: isDark ? '#FFFFFF' : '#000000',
                        marginBottom: 4,
                      }}
                    >
                      {look.title}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 14,
                        color: isDark ? '#B0B0B0' : '#666666',
                      }}
                    >
                      {look.category}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 16 }}>❤️</Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 14,
                        color: isDark ? '#B0B0B0' : '#666666',
                        marginLeft: 4,
                      }}
                    >
                      {look.likes}k
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
