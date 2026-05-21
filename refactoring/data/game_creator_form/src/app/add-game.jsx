import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, ChevronDown, ChevronLeft } from "lucide-react-native";
import { useGroupCode } from "../utils/useGroupCode";
import { useRouter } from "expo-router";

export default function AddGameScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const { groupCode } = useGroupCode();
  const router = useRouter();

  const [winnerId, setWinnerId] = useState(null);
  const [loserId, setLoserId] = useState(null);
  const [winnerScore, setWinnerScore] = useState("11");
  const [loserScore, setLoserScore] = useState("");
  const [showWinnerPicker, setShowWinnerPicker] = useState(false);
  const [showLoserPicker, setShowLoserPicker] = useState(false);

  const { data: players, isLoading } = useQuery({
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

  const { data: recentOpponents } = useQuery({
    queryKey: ["recent-opponents", groupCode],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/players/recent-opponents?groupCode=${groupCode}`,
      );
      if (!response.ok) return { opponents: [] };
      const result = await response.json();
      return result.opponents || [];
    },
    enabled: !!groupCode,
  });

  const createGameMutation = useMutation({
    mutationFn: async (gameData) => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/games/create`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...gameData, groupCode }),
        },
      );
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create game");
      }
      return response.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["players", groupCode] });
      queryClient.invalidateQueries({ queryKey: ["recent-games", groupCode] });

      const eloChangeText = data.eloChanges
        ? `\n\nElo Changes:\nWinner: ${data.eloChanges.winner > 0 ? "+" : ""}${data.eloChanges.winner}\nLoser: ${data.eloChanges.loser}`
        : "";

      Alert.alert(
        "Game Added! 🎉",
        `The leaderboard will update once the loser confirms the result.${eloChangeText}`,
      );
      router.back();
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleSubmit = useCallback(() => {
    if (!winnerId || !loserId) {
      Alert.alert("Missing Info", "Please select both winner and loser");
      return;
    }
    if (!winnerScore || !loserScore) {
      Alert.alert("Missing Scores", "Please enter both scores");
      return;
    }

    createGameMutation.mutate({
      winnerId,
      loserId,
      winnerScore: parseInt(winnerScore),
      loserScore: parseInt(loserScore),
    });
  }, [winnerId, loserId, winnerScore, loserScore]);

  const quickScores = [
    { winner: 11, loser: 9, label: "11-9" },
    { winner: 11, loser: 8, label: "11-8" },
    { winner: 11, loser: 7, label: "11-7" },
    { winner: 11, loser: 5, label: "11-5" },
    { winner: 11, loser: 3, label: "11-3" },
    { winner: 11, loser: 0, label: "11-0" },
  ];

  const selectedWinner = players?.find((p) => p.id === winnerId);
  const selectedLoser = players?.find((p) => p.id === loserId);

  return (
    <View
      style={{ flex: 1, backgroundColor: "#0a0a0a", paddingTop: insets.top }}
    >
      <StatusBar style="light" />

      <View
        style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: "#1a1a1a",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 12,
          }}
        >
          <ChevronLeft size={24} color="#fff" />
        </TouchableOpacity>
        <Text
          style={{
            fontSize: 32,
            fontWeight: "800",
            color: "#fff",
            marginBottom: 4,
          }}
        >
          Add Game 🏓
        </Text>
        <Text style={{ fontSize: 15, color: "#9ca3af" }}>
          Record the results
        </Text>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ paddingTop: 100, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : (
          <>
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: 12,
                }}
              >
                Winner 🏆
              </Text>
              <TouchableOpacity
                onPress={() => setShowWinnerPicker(true)}
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: winnerId ? "#10b981" : "#1f2937",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {selectedWinner ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{selectedWinner.emoji}</Text>
                    <Text
                      style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}
                    >
                      {selectedWinner.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 16, color: "#6b7280" }}>
                    Select winner...
                  </Text>
                )}
                <ChevronDown size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: 12,
                }}
              >
                Loser 😅
              </Text>
              <TouchableOpacity
                onPress={() => setShowLoserPicker(true)}
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: 12,
                  borderWidth: 2,
                  borderColor: loserId ? "#ef4444" : "#1f2937",
                  paddingHorizontal: 16,
                  paddingVertical: 14,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                {selectedLoser ? (
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 10,
                    }}
                  >
                    <Text style={{ fontSize: 24 }}>{selectedLoser.emoji}</Text>
                    <Text
                      style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}
                    >
                      {selectedLoser.name}
                    </Text>
                  </View>
                ) : (
                  <Text style={{ fontSize: 16, color: "#6b7280" }}>
                    Select loser...
                  </Text>
                )}
                <ChevronDown size={20} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: 12,
                }}
              >
                Quick Scores
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 10 }}>
                {quickScores.map((score) => (
                  <TouchableOpacity
                    key={score.label}
                    onPress={() => {
                      setWinnerScore(score.winner.toString());
                      setLoserScore(score.loser.toString());
                    }}
                    style={{
                      backgroundColor: "#1a1a1a",
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 12,
                      borderWidth: 1,
                      borderColor: "#1f2937",
                    }}
                  >
                    <Text
                      style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}
                    >
                      {score.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  color: "#fff",
                  marginBottom: 12,
                }}
              >
                Final Score
              </Text>
              <View
                style={{ flexDirection: "row", gap: 12, alignItems: "center" }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 13, color: "#9ca3af", marginBottom: 6 }}
                  >
                    Winner Score
                  </Text>
                  <TextInput
                    value={winnerScore}
                    onChangeText={setWinnerScore}
                    keyboardType="number-pad"
                    placeholder="11"
                    placeholderTextColor="#4b5563"
                    style={{
                      backgroundColor: "#1a1a1a",
                      borderWidth: 2,
                      borderColor: "#1f2937",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  />
                </View>
                <Text style={{ fontSize: 24, color: "#4b5563", marginTop: 20 }}>
                  -
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ fontSize: 13, color: "#9ca3af", marginBottom: 6 }}
                  >
                    Loser Score
                  </Text>
                  <TextInput
                    value={loserScore}
                    onChangeText={setLoserScore}
                    keyboardType="number-pad"
                    placeholder="9"
                    placeholderTextColor="#4b5563"
                    style={{
                      backgroundColor: "#1a1a1a",
                      borderWidth: 2,
                      borderColor: "#1f2937",
                      borderRadius: 12,
                      paddingHorizontal: 16,
                      paddingVertical: 14,
                      fontSize: 18,
                      fontWeight: "700",
                      color: "#fff",
                    }}
                  />
                </View>
              </View>
            </View>
          </>
        )}
      </ScrollView>

      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
          paddingTop: 16,
          backgroundColor: "#0a0a0a",
          borderTopWidth: 1,
          borderTopColor: "#1f2937",
        }}
      >
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={createGameMutation.isPending}
          style={{
            backgroundColor: "#10b981",
            paddingVertical: 16,
            borderRadius: 12,
            alignItems: "center",
            opacity: createGameMutation.isPending ? 0.6 : 1,
          }}
        >
          {createGameMutation.isPending ? (
            <ActivityIndicator color="#000" />
          ) : (
            <Text style={{ fontSize: 18, fontWeight: "700", color: "#000" }}>
              Add Game
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <Modal visible={showWinnerPicker} transparent animationType="slide">
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
              Select Winner
            </Text>
            <ScrollView>
              {recentOpponents && recentOpponents.length > 0 && (
                <>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#9ca3af",
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Recent
                  </Text>
                  {recentOpponents
                    .filter((p) => p.opponent_id !== loserId)
                    .map((opponent) => (
                      <TouchableOpacity
                        key={opponent.opponent_id}
                        onPress={() => {
                          setWinnerId(opponent.opponent_id);
                          setShowWinnerPicker(false);
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          backgroundColor: "#1a1a1a",
                          padding: 16,
                          borderRadius: 12,
                          marginBottom: 10,
                          borderWidth: 2,
                          borderColor:
                            winnerId === opponent.opponent_id
                              ? "#10b981"
                              : "#1f2937",
                        }}
                      >
                        <Text style={{ fontSize: 28 }}>
                          {opponent.opponent_emoji}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#fff",
                            flex: 1,
                          }}
                        >
                          {opponent.opponent_name}
                        </Text>
                        {winnerId === opponent.opponent_id && (
                          <Check size={20} color="#10b981" />
                        )}
                      </TouchableOpacity>
                    ))}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#1f2937",
                      marginVertical: 12,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#9ca3af",
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    All Players
                  </Text>
                </>
              )}
              {players
                ?.filter((p) => p.id !== loserId)
                .map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => {
                      setWinnerId(player.id);
                      setShowWinnerPicker(false);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      backgroundColor: "#1a1a1a",
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 10,
                      borderWidth: 2,
                      borderColor:
                        winnerId === player.id ? "#10b981" : "#1f2937",
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{player.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#fff",
                        flex: 1,
                      }}
                    >
                      {player.name}
                    </Text>
                    {winnerId === player.id && (
                      <Check size={20} color="#10b981" />
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowWinnerPicker(false)}
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

      <Modal visible={showLoserPicker} transparent animationType="slide">
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
              Select Loser
            </Text>
            <ScrollView>
              {recentOpponents && recentOpponents.length > 0 && (
                <>
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#9ca3af",
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    Recent
                  </Text>
                  {recentOpponents
                    .filter((p) => p.opponent_id !== winnerId)
                    .map((opponent) => (
                      <TouchableOpacity
                        key={opponent.opponent_id}
                        onPress={() => {
                          setLoserId(opponent.opponent_id);
                          setShowLoserPicker(false);
                        }}
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 12,
                          backgroundColor: "#1a1a1a",
                          padding: 16,
                          borderRadius: 12,
                          marginBottom: 10,
                          borderWidth: 2,
                          borderColor:
                            loserId === opponent.opponent_id
                              ? "#ef4444"
                              : "#1f2937",
                        }}
                      >
                        <Text style={{ fontSize: 28 }}>
                          {opponent.opponent_emoji}
                        </Text>
                        <Text
                          style={{
                            fontSize: 16,
                            fontWeight: "600",
                            color: "#fff",
                            flex: 1,
                          }}
                        >
                          {opponent.opponent_name}
                        </Text>
                        {loserId === opponent.opponent_id && (
                          <Check size={20} color="#ef4444" />
                        )}
                      </TouchableOpacity>
                    ))}
                  <View
                    style={{
                      height: 1,
                      backgroundColor: "#1f2937",
                      marginVertical: 12,
                    }}
                  />
                  <Text
                    style={{
                      fontSize: 14,
                      fontWeight: "700",
                      color: "#9ca3af",
                      marginBottom: 12,
                      textTransform: "uppercase",
                      letterSpacing: 1,
                    }}
                  >
                    All Players
                  </Text>
                </>
              )}
              {players
                ?.filter((p) => p.id !== winnerId)
                .map((player) => (
                  <TouchableOpacity
                    key={player.id}
                    onPress={() => {
                      setLoserId(player.id);
                      setShowLoserPicker(false);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 12,
                      backgroundColor: "#1a1a1a",
                      padding: 16,
                      borderRadius: 12,
                      marginBottom: 10,
                      borderWidth: 2,
                      borderColor:
                        loserId === player.id ? "#ef4444" : "#1f2937",
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>{player.emoji}</Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "600",
                        color: "#fff",
                        flex: 1,
                      }}
                    >
                      {player.name}
                    </Text>
                    {loserId === player.id && (
                      <Check size={20} color="#ef4444" />
                    )}
                  </TouchableOpacity>
                ))}
            </ScrollView>
            <TouchableOpacity
              onPress={() => setShowLoserPicker(false)}
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
