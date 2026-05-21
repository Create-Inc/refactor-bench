import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  ScrollView,
  ActivityIndicator,
  Text,
  Alert,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Haptics from "expo-haptics";
import { StatusBar } from "expo-status-bar";
import { Store } from "lucide-react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NearbyStoresModal from "@/components/NearbyStoresModal";
import FavoriteStoresHeader from "@/components/FavoriteStores/FavoriteStoresHeader";
import FavoriteStoresList from "@/components/FavoriteStores/FavoriteStoresList";
import EmptyFavoritesState from "@/components/FavoriteStores/EmptyFavoritesState";
import OrderDeliverySection from "@/components/FavoriteStores/OrderDeliverySection";
import DeliveryServiceSheet from "@/components/FavoriteStores/DeliveryServiceSheet";
import OnboardingTooltip from "@/components/FavoriteStores/OnboardingTooltip";
import OptimizeRouteButton from "@/components/FavoriteStores/OptimizeRouteButton";
import { useFavoriteStores } from "@/utils/useFavoriteStores";
import { useGroceryItems } from "@/utils/useGroceryItems";
import { useDeliveryServices } from "@/utils/useDeliveryServices";
import { useLocationActions } from "@/utils/useLocationActions";
import { useDeliveryActions } from "@/utils/useDeliveryActions";

export default function FavoriteStoresScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [showDeliverySheet, setShowDeliverySheet] = useState(false);
  const [selectedStore, setSelectedStore] = useState(null);
  const [showNearbyModal, setShowNearbyModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Check if onboarding has been shown before
  useEffect(() => {
    AsyncStorage.getItem("favorite_stores_onboarding_seen").then((val) => {
      if (!val) {
        setShowOnboarding(true);
      }
    });
  }, []);

  const dismissOnboarding = useCallback(() => {
    setShowOnboarding(false);
    AsyncStorage.setItem("favorite_stores_onboarding_seen", "true");
  }, []);

  // Data hooks
  const { favoriteStores, isLoading, error, removeFavorite } =
    useFavoriteStores();
  const { uncheckedItems } = useGroceryItems();
  const { deliveryServices } = useDeliveryServices();

  // Action hooks
  const {
    userCoords,
    isRequestingLocation,
    handleDirections,
    requestLocation,
  } = useLocationActions();

  const { handleOpenDeliveryService } = useDeliveryActions(uncheckedItems);

  const handleRemove = useCallback(
    (store) => {
      if (Platform.OS !== "web")
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Alert.alert(
        "Remove Favorite",
        `Remove ${store.store_name} from your favorites?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => removeFavorite(store.place_id),
          },
        ],
      );
    },
    [removeFavorite],
  );

  const handleOrderFrom = useCallback((store) => {
    setSelectedStore(store);
    setShowDeliverySheet(true);
  }, []);

  const handleOrderAll = useCallback(() => {
    setSelectedStore(null);
    setShowDeliverySheet(true);
  }, []);

  const handleFindNearbyStores = useCallback(async () => {
    const coords = await requestLocation();
    if (coords) {
      setShowNearbyModal(true);
    }
  }, [requestLocation]);

  const handleServicePress = useCallback(
    async (service) => {
      await handleOpenDeliveryService(service);
      setShowDeliverySheet(false);
      setSelectedStore(null);
    },
    [handleOpenDeliveryService],
  );

  return (
    <View style={{ flex: 1, backgroundColor: "#111111" }}>
      <StatusBar style="light" />

      <FavoriteStoresHeader
        insets={insets}
        router={router}
        favoriteStoresCount={favoriteStores.length}
        uncheckedItemsCount={uncheckedItems.length}
        onShowTips={() => setShowOnboarding(true)}
      />

      {/* Content */}
      {isLoading ? (
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator size="large" color="rgba(255,255,255,0.5)" />
          <Text
            style={{
              color: "rgba(255,255,255,0.4)",
              marginTop: 12,
              fontSize: 14,
            }}
          >
            Loading your favorites...
          </Text>
        </View>
      ) : error ? (
        <View
          style={{
            flex: 1,
            justifyContent: "center",
            alignItems: "center",
            paddingHorizontal: 40,
          }}
        >
          <Store size={40} color="rgba(255,255,255,0.3)" />
          <Text
            style={{
              color: "rgba(255,255,255,0.5)",
              marginTop: 12,
              fontSize: 15,
              textAlign: "center",
            }}
          >
            Couldn't load your favorite stores.
          </Text>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{
            paddingHorizontal: 20,
            paddingTop: 20,
            paddingBottom: insets.bottom + 100,
          }}
          showsVerticalScrollIndicator={false}
        >
          {/* Optimize Route / Inline Tip */}
          <OptimizeRouteButton
            uncheckedItems={uncheckedItems}
            favoriteStores={favoriteStores}
          />

          {favoriteStores.length > 0 ? (
            <>
              <FavoriteStoresList
                favoriteStores={favoriteStores}
                onRemove={handleRemove}
                onDirections={handleDirections}
                onOrderFrom={handleOrderFrom}
                onFindNearbyStores={handleFindNearbyStores}
                isRequestingLocation={isRequestingLocation}
              />
              <OrderDeliverySection
                uncheckedItemsCount={uncheckedItems.length}
                onOrderAll={handleOrderAll}
              />
            </>
          ) : (
            <EmptyFavoritesState
              onFindNearbyStores={handleFindNearbyStores}
              isRequestingLocation={isRequestingLocation}
            />
          )}
        </ScrollView>
      )}

      <DeliveryServiceSheet
        visible={showDeliverySheet}
        onClose={() => {
          setShowDeliverySheet(false);
          setSelectedStore(null);
        }}
        selectedStore={selectedStore}
        uncheckedItems={uncheckedItems}
        deliveryServices={deliveryServices}
        onServicePress={handleServicePress}
        insets={insets}
      />

      <NearbyStoresModal
        visible={showNearbyModal}
        onClose={() => setShowNearbyModal(false)}
        coords={userCoords}
        groceryItems={uncheckedItems}
      />

      {/* Onboarding Tooltip Overlay */}
      {showOnboarding && <OnboardingTooltip onDismiss={dismissOnboarding} />}
    </View>
  );
}
