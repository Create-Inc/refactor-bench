import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
  TextInput,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Calendar,
  Send,
  CheckCircle,
  ChevronDown,
  AlertCircle,
  XCircle,
} from "lucide-react-native";
import { useGroupCode } from "../../utils/useGroupCode";
import useUser from "../../utils/auth/useUser";
import { useAuth } from "../../utils/auth/useAuth";
import { useNotifications } from "../../utils/useNotifications";

export default function ScheduleScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { groupCode } = useGroupCode();
  const { isReady, isAuthenticated, signIn } = useAuth();
  const { data: user, loading: userLoading } = useUser();
  const { scheduleGameRequestNotification } = useNotifications();

  const [showChallengeModal, setShowChallengeModal] = useState(false);
  const [selectedPlayer, setSelectedPlayer] = useState(null);
  const [selectedDay, setSelectedDay] = useState(0);
  const [selectedHour, setSelectedHour] = useState(18);
  const [showPlayerPicker, setShowPlayerPicker] = useState(false);
  const [showDayPicker, setShowDayPicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [locationNote, setLocationNote] = useState("");

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", groupCode],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/players/my-profile?groupCode=${groupCode}`,
      );
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: !!groupCode && isAuthenticated,
  });

  const { data: allPlayers } = useQuery({
    queryKey: ["players", groupCode],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/players/list?groupCode=${groupCode}`,
      );
      if (!response.ok) throw new Error("Failed to fetch players");
      const result = await response.json();
      return result.players;
    },
    enabled: !!groupCode,
  });

  const { data: gameRequests, refetch: refetchRequests } = useQuery({
    queryKey: ["game-requests", groupCode],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/game-requests/list?groupCode=${groupCode}`,
      );
      if (!response.ok) throw new Error("Failed to fetch requests");
      const data = await response.json();

      // Check for new incoming requests and send notifications
      if (data.received && Array.isArray(data.received)) {
        data.received.forEach((req) => {
          if (req.status === "pending") {
            scheduleGameRequestNotification({
              title: "🏓 New Game Challenge!",
              body: `${req.sender_name} wants to play ${formatDateTime(req.proposed_date)}`,
              data: { requestId: req.id, type: "game_request" },
            });
          }
        });
      }

      return data;
    },
    enabled: !!groupCode && isAuthenticated && !!myProfile?.player,
  });

  const sendRequestMutation = useMutation({
    mutationFn: async (data) => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/game-requests/send`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        },
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to send request");
      }
      return response.json();
    },
    onSuccess: (data, variables) => {
      refetchRequests();

      // Send notification to confirm request was sent
      const receiver = allPlayers?.find((p) => p.id === variables.receiverId);
      if (receiver) {
        scheduleGameRequestNotification({
          title: "Challenge Sent! 🚀",
          body: `Your game request to ${receiver.name} has been sent`,
          data: { type: "request_sent" },
        });
      }

      setShowChallengeModal(false);
      setSelectedPlayer(null);
      setSelectedDay(0);
      setSelectedHour(18);
      Alert.alert("Request Sent! 🏓", "Your game request has been sent");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const updateRequestMutation = useMutation({
    mutationFn: async ({ requestId, status }) => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/game-requests/update`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ requestId, status }),
        },
      );
      if (!response.ok) throw new Error("Failed to update request");
      return response.json();
    },
    onSuccess: (data, variables) => {
      refetchRequests();

      // Send notification when request is accepted
      if (variables.status === "accepted") {
        scheduleGameRequestNotification({
          title: "Game Confirmed! 🎉",
          body: "Your game has been scheduled. Get ready to play!",
          data: { type: "request_accepted" },
        });
      }
    },
  });

  const formatDateTime = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = date - now;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    let dayLabel = "";
    if (diffDays === 0) dayLabel = "Today";
    else if (diffDays === 1) dayLabel = "Tomorrow";
    else if (diffDays < 7) dayLabel = `In ${diffDays} days`;
    else dayLabel = date.toLocaleDateString();

    // Fix: Use 12-hour format
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? "PM" : "AM";
    const displayHours = hours % 12 || 12;
    const timeLabel = `${displayHours}:${minutes.toString().padStart(2, "0")} ${ampm}`;

    return `${dayLabel} at ${timeLabel}`;
  };

  const dayOptions = Array.from({ length: 14 }, (_, i) => {
    if (i === 0) return "Today";
    if (i === 1) return "Tomorrow";
    return `In ${i} days`;
  });

  const hourOptions = Array.from({ length: 15 }, (_, i) => i + 8);

  if (!isReady || userLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0a",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ActivityIndicator size="large" color="#10b981" />
      </View>
    );
  }

  if (!isAuthenticated) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#0a0a0a",
          paddingTop: insets.top,
          paddingHorizontal: 20,
          justifyContent: "center",
        }}
      >
        <StatusBar style="light" />
        <View style={{ alignItems: "center" }}>
          <Text style={{ fontSize: 60, marginBottom: 16 }}>📅</Text>
          <Text
            style={{
              fontSize: 24,
              fontWeight: "700",
              color: "#fff",
              marginBottom: 8,
              textAlign: "center",
            }}
          >
            Sign in to manage your schedule
          </Text>
          <Text
            style={{
              fontSize: 15,
              color: "#9ca3af",
              marginBottom: 24,
              textAlign: "center",
            }}
          >
            Challenge players and schedule your next games
          </Text>
          <TouchableOpacity
            onPress={() => signIn()}
            style={{
              backgroundColor: "#10b981",
              paddingVertical: 14,
              paddingHorizontal: 32,
              borderRadius: 12,
            }}
          >
            <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>
              Sign In
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  // Add pending games query
  const { data: pendingGames, refetch: refetchPendingGames } = useQuery({
    queryKey: ["pending-games", groupCode],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/games/pending?groupCode=${groupCode}`,
      );
      if (!response.ok) return { games: [] };
      const data = await response.json();
      return data.games || [];
    },
    enabled: !!groupCode && isAuthenticated && !!myProfile?.player,
  });

  // Add confirm game mutation
  const confirmGameMutation = useMutation({
    mutationFn: async ({ gameId, action }) => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/games/confirm`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ gameId, action }),
        },
      );
      if (!response.ok) throw new Error("Failed to confirm game");
      return response.json();
    },
    onSuccess: (data, variables) => {
      refetchPendingGames();
      queryClient.invalidateQueries(["players", groupCode]);
      queryClient.invalidateQueries(["my-profile", groupCode]);

      if (variables.action === "confirm") {
        Alert.alert("Game Confirmed! 🎉", "The leaderboard has been updated");
      } else {
        Alert.alert("Game Disputed", "The admin will be notified to review");
      }
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const upcomingGames =
    gameRequests?.received?.filter((r) => r.status === "accepted") || [];
  const pendingReceived =
    gameRequests?.received?.filter((r) => r.status === "pending") || [];
  const pendingSent =
    gameRequests?.sent?.filter((r) => r.status === "pending") || [];
  const selectedPlayerData = allPlayers?.find((p) => p.id === selectedPlayer);
  const availablePlayers =
    allPlayers?.filter((p) => p.id !== myProfile?.player?.id) || [];

  return (
    <View
      style={{ flex: 1, backgroundColor: "#0a0a0a", paddingTop: insets.top }}
    >
      <StatusBar style="light" />
      <View
        style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}
      >
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#fff",
            marginBottom: 4,
          }}
        >
          Schedule <Calendar size={28} color="#10b981" />
        </Text>
        <Text style={{ fontSize: 15, color: "#9ca3af" }}>
          Upcoming games & challenges
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {!myProfile?.player ? (
          <View
            style={{
              backgroundColor: "#111",
              borderRadius: 16,
              padding: 30,
              marginBottom: 16,
              alignItems: "center",
              borderWidth: 1,
              borderColor: "#1f2937",
            }}
          >
            <Text style={{ fontSize: 40, marginBottom: 8 }}>👤</Text>
            <Text
              style={{ color: "#9ca3af", fontSize: 15, textAlign: "center" }}
            >
              No player profile in this league yet
            </Text>
          </View>
        ) : (
          <>
            <TouchableOpacity
              onPress={() => {
                setSelectedPlayer(null);
                setSelectedDay(0);
                setSelectedHour(18);
                setShowChallengeModal(true);
              }}
              style={{
                backgroundColor: "#10b981",
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingVertical: 16,
                borderRadius: 12,
                marginBottom: 20,
              }}
            >
              <Send size={20} color="#000" />
              <Text style={{ fontSize: 16, fontWeight: "700", color: "#000" }}>
                Challenge a Player
              </Text>
            </TouchableOpacity>

            {/* Pending Games Section */}
            {pendingGames && pendingGames.length > 0 && (
              <View
                style={{
                  backgroundColor: "#111",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#fbbf24",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <AlertCircle size={20} color="#fbbf24" />
                  <Text
                    style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}
                  >
                    Pending Confirmation
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 13, color: "#9ca3af", marginBottom: 12 }}
                >
                  These games need your confirmation
                </Text>
                {pendingGames.map((game) => (
                  <View
                    key={game.id}
                    style={{
                      backgroundColor: "#1a1a1a",
                      padding: 14,
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 10,
                      }}
                    >
                      <View>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: "#10b981",
                            marginBottom: 4,
                          }}
                        >
                          {game.winner_emoji} {game.winner_name}{" "}
                          {game.winner_score}
                        </Text>
                        <Text
                          style={{
                            fontSize: 15,
                            color: "#ef4444",
                          }}
                        >
                          {game.loser_emoji} {game.loser_name}{" "}
                          {game.loser_score}
                        </Text>
                      </View>
                      <View style={{ alignItems: "flex-end" }}>
                        <Text style={{ fontSize: 12, color: "#6b7280" }}>
                          {new Date(game.played_at).toLocaleDateString()}
                        </Text>
                        {game.elo_change_loser && (
                          <Text
                            style={{
                              fontSize: 12,
                              fontWeight: "600",
                              color: "#ef4444",
                              marginTop: 2,
                            }}
                          >
                            {game.elo_change_loser} Elo
                          </Text>
                        )}
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() =>
                          confirmGameMutation.mutate({
                            gameId: game.id,
                            action: "confirm",
                          })
                        }
                        disabled={confirmGameMutation.isPending}
                        style={{
                          flex: 1,
                          backgroundColor: "#10b981",
                          paddingVertical: 10,
                          borderRadius: 8,
                          alignItems: "center",
                          flexDirection: "row",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <CheckCircle size={16} color="#000" />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: "#000",
                          }}
                        >
                          Confirm
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          confirmGameMutation.mutate({
                            gameId: game.id,
                            action: "dispute",
                          })
                        }
                        disabled={confirmGameMutation.isPending}
                        style={{
                          flex: 1,
                          backgroundColor: "#1f2937",
                          paddingVertical: 10,
                          borderRadius: 8,
                          alignItems: "center",
                          flexDirection: "row",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <XCircle size={16} color="#ef4444" />
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#ef4444",
                          }}
                        >
                          Dispute
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {upcomingGames.length > 0 && (
              <View
                style={{
                  backgroundColor: "#111",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#1f2937",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <CheckCircle size={20} color="#10b981" />
                  <Text
                    style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}
                  >
                    Upcoming Games
                  </Text>
                </View>
                {upcomingGames.map((req) => (
                  <View
                    key={req.id}
                    style={{
                      backgroundColor: "#1a1a1a",
                      padding: 14,
                      borderRadius: 12,
                      marginBottom: 8,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>
                        {req.sender_emoji || req.receiver_emoji}
                      </Text>
                      <View>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: "#fff",
                          }}
                        >
                          vs{" "}
                          {req.sender_id === myProfile.player.id
                            ? req.receiver_name
                            : req.sender_name}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                          {formatDateTime(req.proposed_date)}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={{
                        backgroundColor: "#10b98120",
                        paddingHorizontal: 10,
                        paddingVertical: 5,
                        borderRadius: 8,
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 11,
                          fontWeight: "700",
                          color: "#10b981",
                        }}
                      >
                        Confirmed
                      </Text>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {pendingReceived.length > 0 && (
              <View
                style={{
                  backgroundColor: "#111",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#1f2937",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <Calendar size={20} color="#fbbf24" />
                  <Text
                    style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}
                  >
                    Incoming Requests
                  </Text>
                </View>
                {pendingReceived.map((req) => (
                  <View
                    key={req.id}
                    style={{
                      backgroundColor: "#1a1a1a",
                      padding: 14,
                      borderRadius: 12,
                      marginBottom: 8,
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                        marginBottom: 10,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{req.sender_emoji}</Text>
                      <View style={{ flex: 1 }}>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: "#fff",
                          }}
                        >
                          {req.sender_name}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                          {formatDateTime(req.proposed_date)}
                        </Text>
                      </View>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <TouchableOpacity
                        onPress={() =>
                          updateRequestMutation.mutate({
                            requestId: req.id,
                            status: "accepted",
                          })
                        }
                        style={{
                          flex: 1,
                          backgroundColor: "#10b981",
                          paddingVertical: 10,
                          borderRadius: 8,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "700",
                            color: "#000",
                          }}
                        >
                          Accept
                        </Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() =>
                          updateRequestMutation.mutate({
                            requestId: req.id,
                            status: "declined",
                          })
                        }
                        style={{
                          flex: 1,
                          backgroundColor: "#1f2937",
                          paddingVertical: 10,
                          borderRadius: 8,
                          alignItems: "center",
                        }}
                      >
                        <Text
                          style={{
                            fontSize: 14,
                            fontWeight: "600",
                            color: "#9ca3af",
                          }}
                        >
                          Decline
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {pendingSent.length > 0 && (
              <View
                style={{
                  backgroundColor: "#111",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 16,
                  borderWidth: 1,
                  borderColor: "#1f2937",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 12,
                  }}
                >
                  <Send size={20} color="#9ca3af" />
                  <Text
                    style={{ fontSize: 18, fontWeight: "700", color: "#fff" }}
                  >
                    Sent Requests
                  </Text>
                </View>
                {pendingSent.map((req) => (
                  <View
                    key={req.id}
                    style={{
                      backgroundColor: "#1a1a1a",
                      padding: 14,
                      borderRadius: 12,
                      marginBottom: 8,
                      flexDirection: "row",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 10,
                      }}
                    >
                      <Text style={{ fontSize: 24 }}>{req.receiver_emoji}</Text>
                      <View>
                        <Text
                          style={{
                            fontSize: 15,
                            fontWeight: "700",
                            color: "#fff",
                          }}
                        >
                          {req.receiver_name}
                        </Text>
                        <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                          {formatDateTime(req.proposed_date)}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      onPress={() =>
                        updateRequestMutation.mutate({
                          requestId: req.id,
                          status: "cancelled",
                        })
                      }
                    >
                      <Text
                        style={{
                          fontSize: 13,
                          color: "#ef4444",
                          fontWeight: "600",
                        }}
                      >
                        Cancel
                      </Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {upcomingGames.length === 0 &&
              pendingReceived.length === 0 &&
              pendingSent.length === 0 && (
                <View
                  style={{
                    backgroundColor: "#111",
                    borderRadius: 16,
                    padding: 40,
                    alignItems: "center",
                    borderWidth: 1,
                    borderColor: "#1f2937",
                  }}
                >
                  <Text style={{ fontSize: 50, marginBottom: 12 }}>📅</Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: "#fff",
                      marginBottom: 6,
                    }}
                  >
                    No scheduled games
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      color: "#9ca3af",
                      textAlign: "center",
                    }}
                  >
                    Challenge a player to schedule your next match!
                  </Text>
                </View>
              )}
          </>
        )}
      </ScrollView>

      {/* Challenge Modal - hide when pickers open */}
      <Modal
        visible={
          showChallengeModal &&
          !showPlayerPicker &&
          !showDayPicker &&
          !showTimePicker
        }
        transparent
        animationType="slide"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#111",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <Text
              style={{
                fontSize: 24,
                fontWeight: "700",
                color: "#fff",
                marginBottom: 20,
              }}
            >
              Challenge a Player
            </Text>

            <TouchableOpacity
              onPress={() => setShowPlayerPicker(true)}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  color: selectedPlayer ? "#fff" : "#6b7280",
                }}
              >
                {selectedPlayerData
                  ? `${selectedPlayerData.emoji} ${selectedPlayerData.name}`
                  : "Choose a player..."}
              </Text>
              <ChevronDown size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowDayPicker(true)}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 16, color: "#fff" }}>
                {dayOptions[selectedDay]}
              </Text>
              <ChevronDown size={20} color="#9ca3af" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowTimePicker(true)}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                paddingHorizontal: 16,
                paddingVertical: 14,
                marginBottom: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <Text style={{ fontSize: 16, color: "#fff" }}>
                {selectedHour > 12 ? selectedHour - 12 : selectedHour}:00{" "}
                {selectedHour >= 12 ? "PM" : "AM"}
              </Text>
              <ChevronDown size={20} color="#9ca3af" />
            </TouchableOpacity>

            <View style={{ marginBottom: 20 }}>
              <Text style={{ fontSize: 14, color: "#9ca3af", marginBottom: 8 }}>
                Location / Note (Optional)
              </Text>
              <TextInput
                value={locationNote}
                onChangeText={setLocationNote}
                placeholder="e.g., Table 2, gym basement"
                placeholderTextColor="#4b5563"
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  fontSize: 16,
                  color: "#fff",
                }}
              />
            </View>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={() => {
                  setShowChallengeModal(false);
                  setSelectedPlayer(null);
                  setLocationNote("");
                }}
                style={{
                  flex: 1,
                  backgroundColor: "#1f2937",
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#9ca3af" }}
                >
                  Cancel
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  if (!selectedPlayer) return;
                  const proposedDate = new Date();
                  proposedDate.setDate(proposedDate.getDate() + selectedDay);
                  proposedDate.setHours(selectedHour, 0, 0, 0);
                  sendRequestMutation.mutate({
                    receiverId: selectedPlayer,
                    proposedDate: proposedDate.toISOString(),
                    groupCode,
                  });
                  setLocationNote("");
                }}
                disabled={!selectedPlayer}
                style={{
                  flex: 1,
                  backgroundColor: selectedPlayer ? "#10b981" : "#1f2937",
                  paddingVertical: 16,
                  borderRadius: 12,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: selectedPlayer ? "#000" : "#6b7280",
                  }}
                >
                  Send
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Player Picker */}
      <Modal visible={showPlayerPicker} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#111",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
              maxHeight: "70%",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#fff",
                marginBottom: 16,
              }}
            >
              Select Player
            </Text>
            <ScrollView>
              {availablePlayers.map((player) => (
                <TouchableOpacity
                  key={player.id}
                  onPress={() => {
                    setSelectedPlayer(player.id);
                    setShowPlayerPicker(false);
                  }}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: "#1a1a1a",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 28 }}>{player.emoji}</Text>
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}
                  >
                    {player.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowPlayerPicker(false)}
              style={{
                backgroundColor: "#1f2937",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#9ca3af" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Day Picker */}
      <Modal visible={showDayPicker} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#111",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
              maxHeight: "70%",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#fff",
                marginBottom: 16,
              }}
            >
              Select Day
            </Text>
            <ScrollView>
              {dayOptions.map((label, index) => (
                <TouchableOpacity
                  key={index}
                  onPress={() => {
                    setSelectedDay(index);
                    setShowDayPicker(false);
                  }}
                  style={{
                    backgroundColor:
                      selectedDay === index ? "#10b98120" : "#1a1a1a",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}
                  >
                    {label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowDayPicker(false)}
              style={{
                backgroundColor: "#1f2937",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#9ca3af" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Time Picker */}
      <Modal visible={showTimePicker} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#111",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
              maxHeight: "70%",
            }}
          >
            <Text
              style={{
                fontSize: 20,
                fontWeight: "700",
                color: "#fff",
                marginBottom: 16,
              }}
            >
              Select Time
            </Text>
            <ScrollView>
              {hourOptions.map((hour) => (
                <TouchableOpacity
                  key={hour}
                  onPress={() => {
                    setSelectedHour(hour);
                    setShowTimePicker(false);
                  }}
                  style={{
                    backgroundColor:
                      selectedHour === hour ? "#10b98120" : "#1a1a1a",
                    padding: 16,
                    borderRadius: 12,
                    marginBottom: 10,
                  }}
                >
                  <Text
                    style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}
                  >
                    {hour}:00 {hour < 12 ? "AM" : "PM"}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowTimePicker(false)}
              style={{
                backgroundColor: "#1f2937",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                marginTop: 16,
              }}
            >
              <Text
                style={{ fontSize: 16, fontWeight: "600", color: "#9ca3af" }}
              >
                Cancel
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
