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

const beautyTips = [
  {
    id: 1,
    title: 'Perfect Winged Eyeliner in 3 Steps',
    type: 'Tutorial',
    duration: '5 min',
    difficulty: 'Beginner',
    rating: 4.8,
    image:
      'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    author: 'Sarah M.',
    isBookmarked: true,
  },
  {
    id: 2,
    title: 'How to Make Your Lipstick Last All Day',
    type: 'Tip',
    duration: '3 min',
    difficulty: 'Easy',
    rating: 4.6,
    image:
      'https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    author: 'Jessica L.',
    isBookmarked: false,
  },
  {
    id: 3,
    title: 'Natural Glowing Skin Routine',
    type: 'Guide',
    duration: '8 min',
    difficulty: 'Intermediate',
    rating: 4.9,
    image:
      'https://images.unsplash.com/photo-1515377905703-c4788e51af15?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=400&q=80',
    author: 'Emma K.',
    isBookmarked: true,
  },
];

const tipCategories = [
  { name: 'Skincare', count: 24 },
  { name: 'Makeup', count: 32 },
  { name: 'Hair', count: 18 },
  { name: 'Nails', count: 12 },
];

export default function TipsScreen() {
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

  const handleTipPress = (tip) => {
    Alert.alert(
      tip.title,
      `${tip.type} • ${tip.duration} • ${tip.difficulty}\nBy ${tip.author}\n\nRating: ${tip.rating}/5`,
      [
        { text: 'Watch', style: 'default' },
        {
          text: tip.isBookmarked ? 'Remove Bookmark' : 'Bookmark',
          style: 'default',
        },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const handleCategoryPress = (category) => {
    Alert.alert(
      category.name,
      `Browse ${category.count} tips and tutorials about ${category.name.toLowerCase()}.`,
      [
        { text: 'Browse', style: 'default' },
        { text: 'Close', style: 'cancel' },
      ]
    );
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
      case 'Easy':
        return '#4CAF50';
      case 'Intermediate':
        return '#FF9800';
      case 'Advanced':
        return '#F44336';
      default:
        return '#999999';
    }
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
          width: 160,
          height: 160,
          borderRadius: 80,
          backgroundColor: isDark ? '#4A3D36' : '#FFE8E8',
          opacity: 0.3,
          transform: [{ translateX: 80 }, { translateY: -80 }],
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
          Beauty Tips
        </Text>
        <Text
          style={{
            fontFamily: 'Inter_400Regular',
            fontSize: 16,
            color: isDark ? '#B0B0B0' : '#666666',
          }}
        >
          Learn from experts and improve your skills
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 120,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
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
                placeholder="Search tips and tutorials..."
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
            {tipCategories.map((category, index) => (
              <TouchableOpacity
                key={index}
                style={{
                  backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 10,
                  marginRight: 12,
                  borderWidth: 1,
                  borderColor: isDark ? '#333333' : '#E5E5E5',
                }}
                onPress={() => handleCategoryPress(category)}
                activeOpacity={0.7}
              >
                <Text
                  style={{
                    fontFamily: 'Inter_500Medium',
                    fontSize: 14,
                    color: isDark ? '#FFFFFF' : '#000000',
                    textAlign: 'center',
                  }}
                >
                  {category.name}
                </Text>
                <Text
                  style={{
                    fontFamily: 'Inter_400Regular',
                    fontSize: 12,
                    color: isDark ? '#666666' : '#999999',
                    textAlign: 'center',
                    marginTop: 2,
                  }}
                >
                  {category.count} tips
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Featured Tips */}
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
              Popular Tips
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

          {beautyTips.map((tip) => (
            <TouchableOpacity
              key={tip.id}
              style={{
                backgroundColor: isDark ? '#1A1A1A' : '#FFFFFF',
                borderRadius: 16,
                marginBottom: 16,
                overflow: 'hidden',
                borderWidth: 1,
                borderColor: isDark ? '#333333' : '#E5E5E5',
              }}
              onPress={() => handleTipPress(tip)}
              activeOpacity={0.8}
            >
              <View style={{ position: 'relative' }}>
                <Image
                  source={tip.image}
                  style={{ width: '100%', height: 180 }}
                  contentFit="cover"
                  transition={100}
                />
                {/* Play button overlay for tutorials */}
                {tip.type === 'Tutorial' && (
                  <View
                    style={{
                      position: 'absolute',
                      top: '50%',
                      left: '50%',
                      transform: [{ translateX: -20 }, { translateY: -20 }],
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: 20,
                      width: 40,
                      height: 40,
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <Text style={{ fontSize: 18, color: '#FFFFFF' }}>▶️</Text>
                  </View>
                )}
                {/* Bookmark indicator */}
                {tip.isBookmarked && (
                  <View
                    style={{
                      position: 'absolute',
                      top: 12,
                      right: 12,
                      backgroundColor: 'rgba(0, 0, 0, 0.7)',
                      borderRadius: 12,
                      padding: 6,
                    }}
                  >
                    <Text style={{ fontSize: 14, color: '#FFFFFF' }}>🔖</Text>
                  </View>
                )}
              </View>

              <View style={{ padding: 16 }}>
                <Text
                  style={{
                    fontFamily: 'Inter_600SemiBold',
                    fontSize: 16,
                    color: isDark ? '#FFFFFF' : '#000000',
                    marginBottom: 8,
                    lineHeight: 22,
                  }}
                >
                  {tip.title}
                </Text>

                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      backgroundColor:
                        getDifficultyColor(tip.difficulty) + '20',
                      borderRadius: 8,
                      paddingHorizontal: 8,
                      paddingVertical: 2,
                      marginRight: 8,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 10,
                        color: getDifficultyColor(tip.difficulty),
                      }}
                    >
                      {tip.difficulty}
                    </Text>
                  </View>

                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                      marginRight: 12,
                    }}
                  >
                    <Text style={{ fontSize: 12 }}>⏱️</Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: isDark ? '#B0B0B0' : '#666666',
                        marginLeft: 4,
                      }}
                    >
                      {tip.duration}
                    </Text>
                  </View>

                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 12 }}>⭐</Text>
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 12,
                        color: isDark ? '#B0B0B0' : '#666666',
                        marginLeft: 4,
                      }}
                    >
                      {tip.rating}
                    </Text>
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}
                >
                  <Text
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 12,
                      color: isDark ? '#999999' : '#999999',
                    }}
                  >
                    By {tip.author} • {tip.type}
                  </Text>

                  <View
                    style={{
                      backgroundColor: isDark ? '#333333' : '#F0F0F0',
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_500Medium',
                        fontSize: 10,
                        color: isDark ? '#FFFFFF' : '#000000',
                      }}
                    >
                      {tip.type}
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
