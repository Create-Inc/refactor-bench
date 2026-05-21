import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Calendar,
  Zap,
  Trophy,
  Clock,
  Star,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import api from "@/utils/api";

export default function SeasonalEventsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [activeEvents, setActiveEvents] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [xpMultiplier, setXpMultiplier] = useState(1);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await api.get("/seasonal-events");
      setActiveEvents(data.activeEvents || []);
      setUpcomingEvents(data.upcomingEvents || []);
      setXpMultiplier(data.currentXpMultiplier || 1);
    } catch (error) {
      console.error("Error loading events:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const getTimeRemaining = (endDate) => {
    const now = new Date();
    const end = new Date(endDate);
    const diff = end - now;
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    if (days > 0) return `${days}d ${hours}h left`;
    return `${hours}h left`;
  };

  const getTimeUntil = (startDate) => {
    const now = new Date();
    const start = new Date(startDate);
    const diff = start - now;
    if (diff <= 0) return "Starting soon";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days > 0) return `Starts in ${days} days`;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    return `Starts in ${hours}h`;
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 16,
          paddingHorizontal: 20,
          paddingBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          gap: 16,
        }}
      >
        <TouchableOpacity onPress={() => router.back()}>
          <ArrowLeft color="#fff" size={28} />
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#fff" }}>
            Seasonal Events
          </Text>
          <Text style={{ fontSize: 14, color: "#888", marginTop: 2 }}>
            Limited-time challenges & bonuses
          </Text>
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 40,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadEvents();
            }}
            tintColor="#FF8C00"
          />
        }
      >
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FF8C00"
            style={{ marginTop: 40 }}
          />
        ) : (
          <>
            {/* XP Multiplier Banner */}
            {xpMultiplier > 1 && (
              <View
                style={{
                  backgroundColor: "#FF8C00",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 24,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 16,
                  shadowColor: "#FF8C00",
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.4,
                  shadowRadius: 12,
                }}
              >
                <Zap size={36} color="#fff" />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 22,
                      fontWeight: "bold",
                      color: "#fff",
                    }}
                  >
                    {xpMultiplier}x XP Active!
                  </Text>
                  <Text style={{ fontSize: 14, color: "#fff", opacity: 0.9 }}>
                    All check-ins earn bonus XP right now
                  </Text>
                </View>
              </View>
            )}

            {/* Active Events */}
            {activeEvents.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#fff",
                    marginBottom: 12,
                  }}
                >
                  🔥 Live Now
                </Text>
                {activeEvents.map((event) => (
                  <View
                    key={event.id}
                    style={{
                      backgroundColor: "#1a1a1a",
                      borderRadius: 16,
                      padding: 20,
                      marginBottom: 16,
                      borderWidth: 2,
                      borderColor: event.theme_color || "#FF8C00",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                        marginBottom: 12,
                      }}
                    >
                      <Text style={{ fontSize: 36 }}>
                        {event.theme_emoji || "🎉"}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 18,
                            fontWeight: "bold",
                            color: "#fff",
                          }}
                        >
                          {event.title}
                        </Text>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                            marginTop: 4,
                          }}
                        >
                          <Clock size={14} color="#FF8C00" />
                          <Text
                            style={{
                              color: "#FF8C00",
                              fontSize: 14,
                              fontWeight: "600",
                            }}
                          >
                            {getTimeRemaining(event.end_date)}
                          </Text>
                        </View>
                      </View>
                    </View>
                    {event.description && (
                      <Text
                        style={{
                          color: "#888",
                          fontSize: 14,
                          lineHeight: 20,
                          marginBottom: 12,
                        }}
                      >
                        {event.description}
                      </Text>
                    )}
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        flexWrap: "wrap",
                      }}
                    >
                      {parseFloat(event.xp_multiplier) > 1 && (
                        <View
                          style={{
                            backgroundColor: "#FF8C0020",
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Zap size={14} color="#FF8C00" />
                          <Text
                            style={{
                              color: "#FF8C00",
                              fontWeight: "bold",
                              fontSize: 13,
                            }}
                          >
                            {event.xp_multiplier}x XP
                          </Text>
                        </View>
                      )}
                      {event.badge_reward && (
                        <View
                          style={{
                            backgroundColor: "#4ADE8020",
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 4,
                          }}
                        >
                          <Trophy size={14} color="#4ADE80" />
                          <Text
                            style={{
                              color: "#4ADE80",
                              fontWeight: "bold",
                              fontSize: 13,
                            }}
                          >
                            {event.badge_reward}
                          </Text>
                        </View>
                      )}
                    </View>
                    <TouchableOpacity
                      onPress={() => router.push("/tournaments")}
                      style={{
                        backgroundColor: event.theme_color || "#FF8C00",
                        paddingVertical: 12,
                        borderRadius: 12,
                        alignItems: "center",
                        marginTop: 16,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        Join Event
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </>
            )}

            {/* Upcoming Events */}
            {upcomingEvents.length > 0 && (
              <>
                <Text
                  style={{
                    fontSize: 20,
                    fontWeight: "bold",
                    color: "#fff",
                    marginTop: 8,
                    marginBottom: 12,
                  }}
                >
                  📅 Coming Soon
                </Text>
                {upcomingEvents.map((event) => (
                  <View
                    key={event.id}
                    style={{
                      backgroundColor: "#0a0a0a",
                      borderRadius: 16,
                      padding: 20,
                      marginBottom: 16,
                      borderWidth: 1,
                      borderColor: "#2a2a2a",
                      opacity: 0.8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      <Text style={{ fontSize: 32 }}>
                        {event.theme_emoji || "🎁"}
                      </Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "bold",
                            color: "#fff",
                          }}
                        >
                          {event.title}
                        </Text>
                        <Text
                          style={{
                            color: "#888",
                            fontSize: 13,
                            marginTop: 4,
                          }}
                        >
                          {getTimeUntil(event.start_date)}
                        </Text>
                      </View>
                      <Calendar size={20} color="#888" />
                    </View>
                  </View>
                ))}
              </>
            )}

            {activeEvents.length === 0 && upcomingEvents.length === 0 && (
              <View style={{ alignItems: "center", marginTop: 60 }}>
                <Calendar size={64} color="#333" />
                <Text
                  style={{
                    color: "#888",
                    fontSize: 18,
                    marginTop: 16,
                    textAlign: "center",
                  }}
                >
                  No events right now
                </Text>
                <Text
                  style={{
                    color: "#666",
                    fontSize: 14,
                    marginTop: 8,
                    textAlign: "center",
                  }}
                >
                  Stay tuned for exciting seasonal challenges!
                </Text>
              </View>
            )}

            {/* How Events Work */}
            <View
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 16,
                padding: 20,
                marginTop: 16,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 16,
                  fontWeight: "bold",
                  marginBottom: 12,
                }}
              >
                How Events Work
              </Text>
              <View style={{ gap: 10 }}>
                <Text style={{ color: "#888", fontSize: 14, lineHeight: 20 }}>
                  🎯 Participate in limited-time challenges
                </Text>
                <Text style={{ color: "#888", fontSize: 14, lineHeight: 20 }}>
                  ⚡ Earn bonus XP during event periods
                </Text>
                <Text style={{ color: "#888", fontSize: 14, lineHeight: 20 }}>
                  🏆 Unlock exclusive event badges
                </Text>
                <Text style={{ color: "#888", fontSize: 14, lineHeight: 20 }}>
                  📊 Compete on event-specific leaderboards
                </Text>
              </View>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}
