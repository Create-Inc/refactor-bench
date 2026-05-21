import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  Pressable,
  Alert,
  useColorScheme,
} from 'react-native';
import { useState } from 'react';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
  useFonts,
  Roboto_400Regular,
  Roboto_500Medium,
  Roboto_700Bold,
} from '@expo-google-fonts/roboto';
import { router } from 'expo-router';
import Screen from '@/components/Screen';

const wishListItems = [
  {
    id: 1,
    name: 'Lipstick Classic',
    price: '$24.99',
    age: '20s',
    color: 'Unity',
    image:
      'https://images.pexels.com/photos/8558521/pexels-photo-8558521.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
  },
  {
    id: 2,
    name: 'Foundation Jar',
    price: '$32.50',
    age: '30s',
    color: 'Beige',
    image:
      'https://images.pexels.com/photos/8776805/pexels-photo-8776805.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
  },
  {
    id: 3,
    name: 'Primer Tube',
    price: '$18.75',
    age: '20s',
    color: 'Clear',
    image:
      'https://images.pexels.com/photos/6800925/pexels-photo-6800925.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
  },
  {
    id: 4,
    name: 'Bottle Foundation',
    price: '$28.99',
    age: '30s',
    color: 'Natural',
    image:
      'https://images.pexels.com/photos/7290612/pexels-photo-7290612.jpeg?auto=compress&cs=tinysrgb&w=200&h=200&dpr=1',
  },
];

export default function ShopScreen() {
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const [isScrolled, setIsScrolled] = useState(false);

  const [fontsLoaded] = useFonts({
    Roboto_400Regular,
    Roboto_500Medium,
    Roboto_700Bold,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleMoveToBag = (item) => {
    Alert.alert(
      'Added to Bag',
      `${item.name} has been added to your shopping bag.`,
      [{ text: 'OK', style: 'default' }]
    );
  };

  const handleScroll = (event) => {
    const scrollY = event.nativeEvent.contentOffset.y;
    setIsScrolled(scrollY > 10);
  };

  const renderWishListItem = (item) => (
    <View key={item.id}>
      <View
        style={{
          flexDirection: 'row',
          paddingHorizontal: 20,
          paddingVertical: 16,
          alignItems: 'center',
        }}
      >
        {/* Product thumbnail */}
        <Image
          source={{ uri: item.image }}
          style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            marginRight: 16,
          }}
        />

        {/* Product details */}
        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: 'Roboto_500Medium',
              fontSize: 16,
              color: isDark ? '#FFFFFF' : '#000000',
              marginBottom: 4,
            }}
          >
            {item.name}
          </Text>

          <Text
            style={{
              fontFamily: 'Roboto_700Bold',
              fontSize: 14,
              color: isDark ? '#FFFFFF' : '#000000',
              marginBottom: 8,
            }}
          >
            {item.price}
          </Text>

          <Text
            style={{
              fontFamily: 'Roboto_400Regular',
              fontSize: 12,
              color: isDark ? '#B0B0B0' : '#8E8E8E',
              marginBottom: 12,
            }}
          >
            Age: {item.age} | Color: {item.color}
          </Text>

          <TouchableOpacity
            style={{
              backgroundColor: isDark ? '#121212' : '#FFFFFF',
              borderWidth: 1,
              borderColor: isDark ? '#FFFFFF' : '#000000',
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingVertical: 8,
              alignSelf: 'flex-start',
            }}
            activeOpacity={0.7}
            onPress={() => handleMoveToBag(item)}
          >
            <Text
              style={{
                fontFamily: 'Roboto_500Medium',
                fontSize: 14,
                color: isDark ? '#FFFFFF' : '#000000',
              }}
            >
              Move to Bag
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Divider */}
      <View
        style={{
          height: 1,
          backgroundColor: isDark ? '#2A2A2A' : '#EDEDED',
          marginHorizontal: 20,
        }}
      />
    </View>
  );

  return (
    <Screen style={{ paddingTop: 0 }}>
      {/* Sticky Header */}
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 10,
          backgroundColor: isDark ? '#121212' : '#FFFFFF',
          paddingTop: insets.top,
          borderBottomWidth: isScrolled ? 1 : 0,
          borderBottomColor: isDark ? '#333333' : '#E5E5E5',
        }}
      >
        {/* Page title */}
        <View
          style={{
            paddingHorizontal: 20,
            paddingVertical: 16,
          }}
        >
          <Text
            style={{
              fontFamily: 'Roboto_500Medium',
              fontSize: 24,
              color: isDark ? '#FFFFFF' : '#000000',
            }}
          >
            Wish List
          </Text>
        </View>
      </View>

      {/* Wish list items */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingTop: insets.top + 80,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {wishListItems.map(renderWishListItem)}
      </ScrollView>
    </Screen>
  );
}
