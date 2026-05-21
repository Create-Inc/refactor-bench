import React, { useState } from "react";
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as Haptics from "expo-haptics";
import {
  ArrowUpRight,
  ArrowDownLeft,
  TrendingUp,
  Award,
  Gift,
  Bell,
  Clock,
  CheckCheck,
  Filter,
  FileText,
  Activity,
} from "lucide-react-native";
import useUser from "@/utils/auth/useUser";

const ACTIVITY_ICONS = {
  loan_funded: {
    icon: ArrowUpRight,
    color: "#10B981",
    bg: "rgba(16,185,129,0.15)",
  },
  loan_repaid: {
    icon: CheckCheck,
    color: "#3B82F6",
    bg: "rgba(59,130,246,0.15)",
  },
  loan_requested: {
    icon: ArrowDownLeft,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.15)",
  },
  extension_requested: {
    icon: Clock,
    color: "#EF4444",
    bg: "rgba(239,68,68,0.15)",
  },
  extension_accepted: {
    icon: CheckCheck,
    color: "#10B981",
    bg: "rgba(16,185,129,0.15)",
  },
  trust_change: {
    icon: TrendingUp,
    color: "#1E40AF",
    bg: "rgba(30,64,175,0.15)",
  },
  badge_earned: {
    icon: Award,
    color: "#D97706",
    bg: "rgba(217,119,6,0.15)",
  },
  tip_received: {
    icon: Gift,
    color: "#EC4899",
    bg: "rgba(236,72,153,0.15)",
  },
  payment_reminder: {
    icon: Bell,
    color: "#F59E0B",
    bg: "rgba(245,158,11,0.15)",
  },
};

function timeAgo(dateStr) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export default function ActivityScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("all");

  // Get authenticated user
  const { data: currentUser, loading: userLoading } = useUser();
  const userId = currentUser?.id;

  const { data: activities, refetch } = useQuery({
    queryKey: ["activity", userId],
    queryFn: async () => {
      const res = await fetch(`/api/activity?userId=${userId}&limit=30`);
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      return Array.isArray(d) ? d : [];
    },
    enabled: !!userId,
    retry: 2,
    refetchOnMount: "always",
    staleTime: 0,
    placeholderData: [],
  });

  const { data: notifData, refetch: refetchNotifs } = useQuery({
    queryKey: ["notifications", userId],
    queryFn: async () => {
      const res = await fetch(`/api/notifications?userId=${userId}`);
      if (!res.ok) throw new Error("Failed");
      const d = await res.json();
      return d || { notifications: [], unreadCount: 0 };
    },
    enabled: !!userId,
    retry: 2,
    refetchOnMount: "always",
    staleTime: 0,
    placeholderData: { notifications: [], unreadCount: 0 },
  });

  if (userLoading || !userId) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#141820",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: insets.top,
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "600" }}>
          Loading...
        </Text>
      </View>
    );
  }

  const markAllRead = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userId, markAllRead: true }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const markAsRead = useMutation({
    mutationFn: async (notificationId) => {
      const res = await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId }),
      });
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
    onSuccess: () => {
      Haptics.selectionAsync();
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const onRefresh = async () => {
    setRefreshing(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    await Promise.all([refetch(), refetchNotifs()]);
    setRefreshing(false);
  };

  const filters = [
    { key: "all", label: "All" },
    { key: "loans", label: "Loans" },
    { key: "trust", label: "Trust" },
    { key: "badges", label: "Badges" },
  ];

  const filteredActivities = (activities || []).filter((a) => {
    if (filter === "all") return true;
    if (filter === "loans")
      return [
        "loan_funded",
        "loan_repaid",
        "loan_requested",
        "tip_received",
      ].includes(a.activity_type);
    if (filter === "trust")
      return [
        "trust_change",
        "extension_requested",
        "extension_accepted",
      ].includes(a.activity_type);
    if (filter === "badges") return a.activity_type === "badge_earned";
    return true;
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount || 0;

  const [activeTab, setActiveTab] = useState("activity");

  const renderActivityItem = ({ item, index }) => {
    const config =
      ACTIVITY_ICONS[item.activity_type] || ACTIVITY_ICONS.trust_change;
    const IconComp = config.icon;

    return (
      <TouchableOpacity
        onPress={() => Haptics.selectionAsync()}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          paddingVertical: 14,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.04)",
        }}
      >
        {/* Timeline dot and line */}
        <View style={{ alignItems: "center", width: 48 }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: config.bg,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconComp color={config.color} size={18} />
          </View>
          {index < filteredActivities.length - 1 && (
            <View
              style={{
                width: 2,
                flex: 1,
                backgroundColor: "rgba(255,255,255,0.06)",
                marginTop: 4,
                minHeight: 20,
              }}
            />
          )}
        </View>

        {/* Content */}
        <View style={{ flex: 1, marginLeft: 12, paddingTop: 2 }}>
          <Text
            style={{
              color: "#FFF",
              fontSize: 14,
              fontWeight: "700",
              lineHeight: 20,
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              marginTop: 3,
              lineHeight: 18,
            }}
          >
            {item.description}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 6,
              gap: 12,
            }}
          >
            <Text style={{ color: "rgba(255,255,255,0.3)", fontSize: 11 }}>
              {timeAgo(item.created_at)}
            </Text>
            {item.amount && (
              <View
                style={{
                  backgroundColor: "rgba(16,185,129,0.12)",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{ color: "#10B981", fontSize: 11, fontWeight: "700" }}
                >
                  ${parseFloat(item.amount).toFixed(0)}
                </Text>
              </View>
            )}
            {item.trust_change && (
              <View
                style={{
                  backgroundColor:
                    item.trust_change > 0
                      ? "rgba(16,185,129,0.12)"
                      : "rgba(239,68,68,0.12)",
                  paddingHorizontal: 8,
                  paddingVertical: 2,
                  borderRadius: 6,
                }}
              >
                <Text
                  style={{
                    color: item.trust_change > 0 ? "#10B981" : "#EF4444",
                    fontSize: 11,
                    fontWeight: "700",
                  }}
                >
                  {item.trust_change > 0 ? "+" : ""}
                  {item.trust_change}% trust
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  const renderNotification = ({ item }) => {
    const isUnread = !item.is_read;

    const handleNotificationPress = () => {
      if (isUnread) {
        markAsRead.mutate(item.id);
      }
    };

    return (
      <TouchableOpacity
        onPress={handleNotificationPress}
        activeOpacity={0.7}
        style={{
          flexDirection: "row",
          alignItems: "flex-start",
          paddingVertical: 14,
          paddingHorizontal: 20,
          backgroundColor: isUnread ? "rgba(30,64,175,0.06)" : "transparent",
          borderBottomWidth: 1,
          borderBottomColor: "rgba(255,255,255,0.04)",
        }}
      >
        {isUnread && (
          <View
            style={{
              width: 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: "#1E40AF",
              marginTop: 6,
              marginRight: 8,
            }}
          />
        )}
        <View style={{ flex: 1, marginLeft: isUnread ? 0 : 16 }}>
          <Text
            style={{
              color: "#FFF",
              fontSize: 14,
              fontWeight: isUnread ? "700" : "500",
              lineHeight: 20,
            }}
          >
            {item.title}
          </Text>
          <Text
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: 12,
              marginTop: 3,
              lineHeight: 18,
            }}
          >
            {item.body}
          </Text>
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginTop: 4,
              justifyContent: "space-between",
            }}
          >
            <Text
              style={{
                color: "rgba(255,255,255,0.25)",
                fontSize: 11,
              }}
            >
              {timeAgo(item.created_at)}
            </Text>
            {isUnread && (
              <Text
                style={{
                  color: "rgba(30,64,175,0.6)",
                  fontSize: 11,
                  fontWeight: "600",
                }}
              >
                Tap to mark as read
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#141820", paddingTop: insets.top }}
    >
      {/* Header */}
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "800" }}>
          Activity
        </Text>
      </View>

      {/* Activity / Notifications tab */}
      <View
        style={{
          flexDirection: "row",
          marginHorizontal: 20,
          backgroundColor: "#1C2230",
          borderRadius: 10,
          padding: 3,
          marginBottom: 12,
        }}
      >
        <TouchableOpacity
          onPress={() => {
            setActiveTab("activity");
            Haptics.selectionAsync();
          }}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor:
              activeTab === "activity" ? "#1E40AF" : "transparent",
            alignItems: "center",
          }}
        >
          <Text
            style={{
              color:
                activeTab === "activity" ? "#FFF" : "rgba(255,255,255,0.4)",
              fontSize: 13,
              fontWeight: "700",
            }}
          >
            Timeline
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => {
            setActiveTab("notifications");
            Haptics.selectionAsync();
          }}
          style={{
            flex: 1,
            paddingVertical: 10,
            borderRadius: 8,
            backgroundColor:
              activeTab === "notifications" ? "#1E40AF" : "transparent",
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center",
            gap: 6,
          }}
        >
          <Text
            style={{
              color: activeTab === "notifications" ? "#FFF" : "#8E8E93",
              fontSize: 13,
              fontWeight: "700",
            }}
          >
            Notifications
          </Text>
          {unreadCount > 0 && (
            <View
              style={{
                backgroundColor: "#DC2626",
                minWidth: 18,
                height: 18,
                borderRadius: 9,
                alignItems: "center",
                justifyContent: "center",
                paddingHorizontal: 4,
              }}
            >
              <Text style={{ color: "#FFF", fontSize: 10, fontWeight: "800" }}>
                {unreadCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {activeTab === "activity" && (
        <>
          {/* Filters */}
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 20,
              gap: 8,
              marginBottom: 8,
            }}
          >
            {filters.map((f) => (
              <TouchableOpacity
                key={f.key}
                onPress={() => {
                  setFilter(f.key);
                  Haptics.selectionAsync();
                }}
                style={{
                  paddingHorizontal: 14,
                  paddingVertical: 7,
                  borderRadius: 8,
                  backgroundColor:
                    filter === f.key
                      ? "rgba(30,64,175,0.2)"
                      : "rgba(255,255,255,0.05)",
                  borderWidth: 1,
                  borderColor:
                    filter === f.key ? "#1E40AF" : "rgba(255,255,255,0.08)",
                }}
              >
                <Text
                  style={{
                    color:
                      filter === f.key ? "#1E40AF" : "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    fontWeight: "700",
                  }}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={filteredActivities}
            keyExtractor={(item) => item.id}
            renderItem={renderActivityItem}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FFF"
              />
            }
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#1C2230",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "#252B3B",
                  }}
                >
                  <Activity color="#64748B" size={32} />
                </View>
                <Text
                  style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}
                >
                  No activity yet
                </Text>
                <Text style={{ color: "#8E8E93", fontSize: 12, marginTop: 4 }}>
                  Your transactions will appear here
                </Text>
              </View>
            }
          />
        </>
      )}

      {activeTab === "notifications" && (
        <>
          {unreadCount > 0 && (
            <TouchableOpacity
              onPress={() => markAllRead.mutate()}
              style={{
                alignSelf: "flex-end",
                marginRight: 20,
                marginBottom: 8,
              }}
            >
              <Text
                style={{ color: "#1E40AF", fontSize: 13, fontWeight: "600" }}
              >
                Mark all read
              </Text>
            </TouchableOpacity>
          )}
          <FlatList
            data={notifications}
            keyExtractor={(item) => item.id}
            renderItem={renderNotification}
            contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                tintColor="#FFF"
              />
            }
            ListEmptyComponent={
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <View
                  style={{
                    width: 80,
                    height: 80,
                    borderRadius: 40,
                    backgroundColor: "#1C2230",
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 16,
                    borderWidth: 1,
                    borderColor: "#252B3B",
                  }}
                >
                  <Bell color="#64748B" size={32} />
                </View>
                <Text
                  style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}
                >
                  All caught up!
                </Text>
                <Text style={{ color: "#8E8E93", fontSize: 12, marginTop: 4 }}>
                  No notifications right now
                </Text>
              </View>
            }
          />
        </>
      )}
    </View>
  );
}
