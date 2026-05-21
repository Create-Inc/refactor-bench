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

const featuredBrands = [
  {
    id: 1,
    name: 'Glossier',
    description: 'Clean beauty essentials',
    image:
      'https://images.unsplash.com/photo-1586495985594-f7b94ad1f7e2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    followers: '2.4M',
    isFollowing: true,
    category: 'Clean Beauty',
  },
  {
    id: 2,
    name: 'Fenty Beauty',
    description: 'Inclusive beauty for all',
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    followers: '5.8M',
    isFollowing: false,
    category: 'Inclusive',
  },
  {
    id: 3,
    name: 'Rare Beauty',
    description: 'Beauty that gives back',
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    followers: '3.2M',
    isFollowing: true,
    category: 'Wellness',
  },
];

const brandCategories = [
  { name: 'Luxury', icon: '👑', count: 24 },
  { name: 'Clean', icon: '✨', count: 18 },
  { name: 'Indie', icon: '⭐', count: 32 },
  { name: 'K-Beauty', icon: '❤️', count: 15 },
];

export default function BrandsScreen() {
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

  const handleBrandPress = (brand) => {
    Alert.alert(
      brand.name,
      `${brand.description}\n\nFollowers: ${brand.followers}`,
      [
        { text: brand.isFollowing ? 'Unfollow' : 'Follow', style: 'default' },
        { text: 'View Products', style: 'default' },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleCategoryPress = (category) => {
    Alert.alert(
      category.name,
      `Browse ${category.count} brands in the ${category.name} category.`,
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
          left: 0,
          width: 180,
          height: 180,
          borderRadius: 90,
          backgroundColor: isDark ? '#4A3D36' : '#F0E6FF',
          opacity: 0.25,
          transform: [{ translateX: -90 }, { translateY: -90 }],
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
          Brands
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: isDark ? '#B0B0B0' : '#666666',
          }}
        >
          Discover and follow your favorite brands
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
        {/* Search and Filter */}
        <View style={{ paddingHorizontal: 24, marginBottom: 32 }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <View
              style={{
                flex: 1,
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
                placeholder="Search brands..."
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
            <TouchableOpacity
              style={{
                backgroundColor: isDark ? '#1A1A1A' : '#F8F8F8',
                borderRadius: 16,
                padding: 12,
              }}
            >
              <Text style={{ fontSize: 20 }}>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Brand Categories */}
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
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 12,
            }}
          >
            {brandCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  borderWidth: 1,
                  borderColor: isDark ? '#333333' : '#E5E5E5',
                  minWidth: '45%',
                }}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <Text style={{ fontSize: 18 }}>{category.icon}</Text>
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 14,
                    color: isDark ? '#FFFFFF' : '#000000',
                    marginLeft: 8,
                    flex: 1,
                  }}
                >
                  {category.name}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: isDark ? '#666666' : '#999999',
                  }}
                >
                  {category.count}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Featured Brands */}
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
              Featured Brands
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

          {featuredBrands.map((brand) => (
            <TouchableOpacity
              key={brand.id}
              style={{
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderRadius: 16,
                marginBottom: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: isDark ? '#333333' : '#E5E5E5',
              }}
              onPress={() => handleBrandPress(brand)}
              activeOpacity={0.8}
            >
              <Image
                source={brand.image}
                style={{ width: '100%', height: 120 }}
                contentFit="cover"
                transition={100}
              />
              <View style={{ padding: 16 }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'flex-start',
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
                      {brand.name}
                    </Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 14,
                        color: isDark ? '#B0B0B0' : '#666666',
                        marginBottom: 6,
                      }}
                    >
                      {brand.description}
                    </Text>
                    <View
                      style={{ flexDirection: 'row', alignItems: 'center' }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Inter_500Medium',
                          fontSize: 12,
                          color: isDark ? '#999999' : '#999999',
                          marginRight: 8,
                        }}
                      >
                        {brand.followers} followers
                      </Text>
                      <Text
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 12,
                          color: isDark ? '#666666' : '#BBBBBB',
                        }}
                      >
                        {brand.category}
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={{
                      backgroundColor: brand.isFollowing
                        ? isDark
                          ? '#333333'
                          : '#F0F0F0'
                        : isDark
                          ? '#FFFFFF'
                          : '#000000',
                      borderRadius: 16,
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderWidth: brand.isFollowing ? 1 : 0,
                      borderColor: isDark ? '#666666' : '#E5E5E5',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 12,
                        color: brand.isFollowing
                          ? isDark
                            ? '#FFFFFF'
                            : '#000000'
                          : isDark
                            ? '#000000'
                            : '#FFFFFF',
                      }}
                    >
                      {brand.isFollowing ? 'Following' : 'Follow'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </Screen>
  );
}
