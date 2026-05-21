import { useState, useCallback, useEffect, useRef } from "react";
import { Alert, Animated, Platform } from "react-native";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import * as Linking from "expo-linking";
import * as Haptics from "expo-haptics";
import apiFetch from "@/utils/apiFetch";

const USE_NATIVE_DRIVER = Platform.OS !== "web";

export function useGroceryMutations(location, playCashRegister) {
  const queryClient = useQueryClient();

  const addItemMutation = useMutation({
    mutationFn: async (itemsText) => {
      const r = await apiFetch("/api/grocery/add-ingredients", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ingredients: itemsText, location }),
      });
      if (!r.ok) throw new Error("Failed to add items");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery"] });
      if (playCashRegister) playCashRegister();
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ["grocery"] });
      }, 3000);
    },
    onError: () => Alert.alert("Error", "Could not add items to list"),
  });

  const toggleItemMutation = useMutation({
    mutationFn: async ({ id, checked }) => {
      const r = await apiFetch(`/api/grocery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ checked }),
      });
      if (!r.ok) throw new Error("Failed to update item");
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grocery"] }),
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, name, price }) => {
      const body = {};
      if (name !== undefined) body.name = name;
      if (price !== undefined) body.price = price;
      const r = await apiFetch(`/api/grocery/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("Failed to update item");
      return r.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["grocery"] });
    },
    onError: () => Alert.alert("Error", "Could not update item"),
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id) => {
      const r = await apiFetch(`/api/grocery/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to delete item");
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grocery"] }),
  });

  const clearCheckedMutation = useMutation({
    mutationFn: async () => {
      const r = await apiFetch("/api/grocery", { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to clear items");
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grocery"] }),
  });

  const clearAllMutation = useMutation({
    mutationFn: async () => {
      const r = await apiFetch("/api/grocery?all=true", { method: "DELETE" });
      if (!r.ok) throw new Error("Failed to clear all items");
      return r.json();
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["grocery"] }),
  });

  return {
    addItemMutation,
    toggleItemMutation,
    updateItemMutation,
    deleteItemMutation,
    clearCheckedMutation,
    clearAllMutation,
  };
}

export function useGroceryActions(
  items,
  newItem,
  setNewItem,
  addItemMutation,
  toggleItemMutation,
  deleteItemMutation,
  clearCheckedMutation,
  clearAllMutation,
  updateItemMutation,
  setEditingItem,
  setEditItemName,
  setEditItemPrice,
) {
  const handleAddItem = useCallback(() => {
    const trimmed = newItem.trim();
    if (trimmed) {
      addItemMutation.mutate(trimmed);
      setNewItem("");
    }
  }, [newItem, addItemMutation, setNewItem]);

  const handleToggleItem = useCallback(
    (item) => {
      toggleItemMutation.mutate({ id: item.id, checked: !item.checked });
    },
    [toggleItemMutation],
  );

  const handleDeleteItem = useCallback(
    (id) => {
      deleteItemMutation.mutate(id);
    },
    [deleteItemMutation],
  );

  const handleClearChecked = useCallback(() => {
    const count = items.filter((i) => i.checked).length;
    if (count === 0)
      return Alert.alert("Nothing to Clear", "No items are checked.");
    Alert.alert(
      "Clear Checked Items",
      `Remove ${count} checked item${count > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: () => clearCheckedMutation.mutate(),
        },
      ],
    );
  }, [items, clearCheckedMutation]);

  const handleClearAll = useCallback(() => {
    Alert.alert(
      "Clear All Items",
      `Remove all ${items.length} item${items.length > 1 ? "s" : ""}?`,
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear All",
          style: "destructive",
          onPress: () => clearAllMutation.mutate(),
        },
      ],
    );
  }, [items, clearAllMutation]);

  const handleEditItem = useCallback(
    (item) => {
      setEditingItem({ id: item.id });
      setEditItemName(item.name || "");
      setEditItemPrice(item.price ? item.price.toString() : "");
    },
    [setEditingItem, setEditItemName, setEditItemPrice],
  );

  const handleSaveItem = useCallback(
    (editingItem, editItemName, editItemPrice) => {
      if (!editingItem) return;
      const trimmedName = editItemName.trim();
      if (!trimmedName) {
        return Alert.alert("Missing Name", "Please enter an item name.");
      }
      const priceVal = editItemPrice.trim()
        ? parseFloat(editItemPrice)
        : undefined;
      if (editItemPrice.trim() && (isNaN(priceVal) || priceVal < 0)) {
        return Alert.alert("Invalid Price", "Please enter a valid price.");
      }
      updateItemMutation.mutate({
        id: editingItem.id,
        name: trimmedName,
        price: priceVal,
      });
    },
    [updateItemMutation],
  );

  const handleAddItemFromSuggestion = useCallback(
    (name) => {
      setNewItem("");
      addItemMutation.mutate(name);
    },
    [addItemMutation, setNewItem],
  );

  const handleSendViaText = useCallback((uncheckedItems, totalPrice) => {
    if (uncheckedItems.length === 0) {
      return Alert.alert("No Items", "Add some items to your list first.");
    }
    const lines = uncheckedItems.map((item, i) => {
      const priceStr = item.price
        ? ` — $${parseFloat(item.price).toFixed(2)}`
        : "";
      return `${i + 1}. ${item.name}${priceStr}`;
    });
    const totalStr =
      totalPrice > 0 ? `\nEstimated Total: $${totalPrice.toFixed(2)}` : "";
    const body = `🛒 Grocery List\n\n${lines.join("\n")}${totalStr}`;
    const smsUrl = `sms:&body=${encodeURIComponent(body)}`;
    Linking.openURL(smsUrl).catch(() =>
      Alert.alert("Error", "Could not open text messaging app."),
    );
  }, []);

  return {
    handleAddItem,
    handleToggleItem,
    handleDeleteItem,
    handleClearChecked,
    handleClearAll,
    handleEditItem,
    handleSaveItem,
    handleAddItemFromSuggestion,
    handleSendViaText,
  };
}

export function useAnimatedButtonScales() {
  const clearCheckedScale = useRef(new Animated.Value(1)).current;

  const makePressIn =
    (animValue, toValue = 0.94) =>
    () => {
      if (Platform.OS !== "web")
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(animValue, {
        toValue,
        friction: 8,
        tension: 400,
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start();
    };

  const makePressOut = (animValue) => () => {
    Animated.spring(animValue, {
      toValue: 1,
      friction: 6,
      tension: 300,
      useNativeDriver: USE_NATIVE_DRIVER,
    }).start();
  };

  return {
    clearCheckedScale,
    makePressIn,
    makePressOut,
  };
}

export function useCollapsibleAddSection() {
  const [addSectionExpanded, setAddSectionExpanded] = useState(false);
  const addSectionHeight = useRef(new Animated.Value(0)).current;

  const toggleAddSection = useCallback(() => {
    const toValue = addSectionExpanded ? 0 : 1;
    setAddSectionExpanded(!addSectionExpanded);
    Animated.spring(addSectionHeight, {
      toValue,
      friction: 12,
      tension: 200,
      useNativeDriver: false,
    }).start();
  }, [addSectionExpanded, addSectionHeight]);

  const addSectionMaxHeight = addSectionHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 600],
  });

  const addSectionOpacity = addSectionHeight.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.5, 1],
  });

  const chevronRotate = addSectionHeight.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return {
    addSectionExpanded,
    toggleAddSection,
    addSectionMaxHeight,
    addSectionOpacity,
    chevronRotate,
  };
}
