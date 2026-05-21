import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Linking,
  Platform,
  Alert,
} from "react-native";
import { ShoppingCart, MapPin, Route, Navigation } from "lucide-react-native";
import { UncheckedItem, CheckedItem } from "@/components/GroceryItemList";
import { GroceryListHeader } from "./GroceryListHeader";

export function GroceryList({
  isLoading,
  error,
  items,
  uncheckedItems,
  checkedItems,
  handleToggleItem,
  handleEditItem,
  handleDeleteItem,
  handleClearChecked,
  handleClearAll,
  clearCheckedScale,
  makePressIn,
  makePressOut,
  clearAllMutation,
  insets,
  onAssignStore,
  favoriteStores,
}) {
  // Group unchecked items by store
  const storeGroups = useMemo(() => {
    const groups = {};
    const unassigned = [];

    uncheckedItems.forEach((item) => {
      if (item.preferred_store_id && item.store_name) {
        const key = item.preferred_store_id;
        if (!groups[key]) {
          groups[key] = {
            storeId: item.preferred_store_id,
            storeName: item.store_name,
            storeAddress: item.store_address,
            items: [],
            subtotal: 0,
          };
        }
        groups[key].items.push(item);
        groups[key].subtotal += parseFloat(item.price) || 0;
      } else {
        unassigned.push(item);
      }
    });

    const result = Object.values(groups).sort((a, b) =>
      a.storeName.localeCompare(b.storeName),
    );

    if (unassigned.length > 0) {
      result.push({
        storeId: null,
        storeName: "Unassigned",
        storeAddress: null,
        items: unassigned,
        subtotal: unassigned.reduce(
          (s, i) => s + (parseFloat(i.price) || 0),
          0,
        ),
      });
    }

    return result;
  }, [uncheckedItems]);

  const hasStoreAssignments = uncheckedItems.some(
    (i) => i.preferred_store_id && i.store_name,
  );

  // Build list of assigned stores with coordinates for route
  const assignedStoresWithCoords = useMemo(() => {
    if (!favoriteStores || !hasStoreAssignments) return [];
    const result = [];
    const seen = new Set();
    storeGroups.forEach((group) => {
      if (group.storeId && !seen.has(group.storeId)) {
        seen.add(group.storeId);
        const matched = (favoriteStores || []).find(
          (s) => s.id === group.storeId,
        );
        if (matched?.lat && matched?.lng) {
          result.push({
            id: group.storeId,
            name: group.storeName,
            lat: matched.lat,
            lng: matched.lng,
          });
        }
      }
    });
    return result;
  }, [storeGroups, favoriteStores, hasStoreAssignments]);

  const handleOptimizeRoute = useCallback(() => {
    if (assignedStoresWithCoords.length === 0) return;

    if (assignedStoresWithCoords.length === 1) {
      const store = assignedStoresWithCoords[0];
      const mapsUrl = Platform.select({
        ios: `maps://?daddr=${store.lat},${store.lng}`,
        default: `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`,
      });
      Linking.openURL(mapsUrl).catch(() => {
        Linking.openURL(
          `https://www.google.com/maps/dir/?api=1&destination=${store.lat},${store.lng}`,
        ).catch(() => Alert.alert("Error", "Could not open Maps"));
      });
      return;
    }

    const storeList = [...assignedStoresWithCoords];
    const destination = storeList.pop();
    const waypoints = storeList.map((s) => `${s.lat},${s.lng}`).join("|");
    const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${destination.lat},${destination.lng}&waypoints=${encodeURIComponent(waypoints)}&travelmode=driving`;

    if (Platform.OS === "ios") {
      const googleAppUrl = `comgooglemaps://?daddr=${destination.lat},${destination.lng}&waypoints=${encodeURIComponent(waypoints)}&directionsmode=driving`;
      Linking.canOpenURL("comgooglemaps://").then((canOpen) => {
        if (canOpen) {
          Linking.openURL(googleAppUrl);
        } else {
          Linking.openURL(googleMapsUrl).catch(() =>
            Alert.alert("Error", "Could not open Maps"),
          );
        }
      });
    } else {
      Linking.openURL(googleMapsUrl).catch(() =>
        Alert.alert("Error", "Could not open Google Maps"),
      );
    }
  }, [assignedStoresWithCoords]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator size="large" color="#FFFFFF" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text style={{ color: "#FF6B6B" }}>Failed to load grocery list</Text>
      </View>
    );
  }

  if (items.length === 0) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
          paddingHorizontal: 40,
        }}
      >
        <ShoppingCart
          size={56}
          color="rgba(255,255,255,0.2)"
          style={{ marginBottom: 14 }}
        />
        <Text
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: "#FFFFFF",
            marginBottom: 6,
            textAlign: "center",
          }}
        >
          Your list is empty
        </Text>
        <Text
          style={{
            fontSize: 14,
            color: "rgba(255,255,255,0.45)",
            textAlign: "center",
            lineHeight: 20,
          }}
        >
          Tap "+ Add Items" above to get started
        </Text>
      </View>
    );
  }

  return (
    <>
      {/* Sticky "TO BUY" header */}
      {uncheckedItems.length > 0 && (
        <GroceryListHeader
          uncheckedItemsCount={uncheckedItems.length}
          itemsCount={items.length}
          handleClearAll={handleClearAll}
          clearAllMutation={clearAllMutation}
        />
      )}

      {/* Scrollable items list */}
      <ScrollView
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 220,
        }}
        showsVerticalScrollIndicator={false}
      >
        {/* Unchecked items - grouped by store when assignments exist */}
        {hasStoreAssignments ? (
          <>
            {storeGroups.map((group) => (
              <View
                key={group.storeId || "unassigned"}
                style={{ marginBottom: 16 }}
              >
                {/* Store group header */}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 10,
                    paddingVertical: 6,
                    gap: 8,
                  }}
                >
                  <View
                    style={{
                      width: 28,
                      height: 28,
                      borderRadius: 8,
                      backgroundColor: group.storeId
                        ? "rgba(99,102,241,0.15)"
                        : "rgba(255,255,255,0.08)",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <MapPin
                      size={14}
                      color={
                        group.storeId ? "#818CF8" : "rgba(255,255,255,0.35)"
                      }
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "700",
                        color: group.storeId
                          ? "#818CF8"
                          : "rgba(255,255,255,0.45)",
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                      }}
                    >
                      {group.storeName}
                    </Text>
                  </View>
                  <Text
                    style={{
                      fontSize: 12,
                      color: "rgba(255,255,255,0.35)",
                      fontWeight: "500",
                    }}
                  >
                    {group.items.length} item
                    {group.items.length !== 1 ? "s" : ""}
                    {group.subtotal > 0
                      ? ` · $${group.subtotal.toFixed(2)}`
                      : ""}
                  </Text>
                </View>

                {/* Items in this group */}
                {group.items.map((item) => (
                  <UncheckedItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggleItem}
                    onEditItem={handleEditItem}
                    onDelete={handleDeleteItem}
                    onAssignStore={onAssignStore}
                  />
                ))}
              </View>
            ))}

            {/* Optimize Route inline CTA */}
            {assignedStoresWithCoords.length > 0 && (
              <TouchableOpacity
                onPress={handleOptimizeRoute}
                activeOpacity={0.7}
                style={{
                  backgroundColor: "rgba(52,211,153,0.1)",
                  borderRadius: 12,
                  padding: 12,
                  marginBottom: 16,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  borderWidth: 1,
                  borderColor: "rgba(52,211,153,0.2)",
                }}
              >
                <Route size={16} color="#34D399" />
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "600",
                    color: "#34D399",
                  }}
                >
                  Optimize Route to {assignedStoresWithCoords.length} Store
                  {assignedStoresWithCoords.length !== 1 ? "s" : ""}
                </Text>
                <Navigation size={14} color="rgba(52,211,153,0.6)" />
              </TouchableOpacity>
            )}
          </>
        ) : (
          // Flat list when no store assignments exist
          uncheckedItems.length > 0 && (
            <View>
              {uncheckedItems.map((item) => (
                <UncheckedItem
                  key={item.id}
                  item={item}
                  onToggle={handleToggleItem}
                  onEditItem={handleEditItem}
                  onDelete={handleDeleteItem}
                  onAssignStore={onAssignStore}
                />
              ))}
            </View>
          )
        )}

        {/* Checked items */}
        {checkedItems.length > 0 && (
          <View style={{ marginTop: 20 }}>
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 10,
              }}
            >
              <Text
                style={{
                  fontSize: 12,
                  fontWeight: "700",
                  color: "rgba(255,255,255,0.35)",
                  textTransform: "uppercase",
                  letterSpacing: 0.8,
                }}
              >
                IN CART ({checkedItems.length})
              </Text>
              <CheckedItemsClearButton
                handleClearChecked={handleClearChecked}
                clearCheckedScale={clearCheckedScale}
                makePressIn={makePressIn}
                makePressOut={makePressOut}
              />
            </View>
            {checkedItems.map((item) => (
              <CheckedItem
                key={item.id}
                item={item}
                onToggle={handleToggleItem}
                onDelete={handleDeleteItem}
              />
            ))}
          </View>
        )}
      </ScrollView>
    </>
  );
}

function CheckedItemsClearButton({
  handleClearChecked,
  clearCheckedScale,
  makePressIn,
  makePressOut,
}) {
  const { Animated, Pressable } = require("react-native");
  return (
    <Animated.View style={{ transform: [{ scale: clearCheckedScale }] }}>
      <Pressable
        onPress={handleClearChecked}
        onPressIn={makePressIn(clearCheckedScale, 0.9)}
        onPressOut={makePressOut(clearCheckedScale)}
        style={{
          backgroundColor: "rgba(239,68,68,0.1)",
          paddingHorizontal: 12,
          paddingVertical: 5,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "rgba(239,68,68,0.15)",
        }}
      >
        <Text
          style={{
            fontSize: 12,
            fontWeight: "600",
            color: "rgba(248,113,113,0.8)",
          }}
        >
          Clear
        </Text>
      </Pressable>
    </Animated.View>
  );
}
