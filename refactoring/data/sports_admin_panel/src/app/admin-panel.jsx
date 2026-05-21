import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  ActivityIndicator,
  Modal,
  Share,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  ChevronLeft,
  Trash2,
  Edit3,
  Users,
  Trophy,
  Calendar,
  Settings,
  Plus,
  X,
  Copy,
  Share2,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { useGroupCode } from "../utils/useGroupCode";
import * as Clipboard from "expo-clipboard";

export default function AdminPanelScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { groupCode } = useGroupCode();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState("games");
  const [showLeagueSettings, setShowLeagueSettings] = useState(false);
  const [leagueDescription, setLeagueDescription] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [showSeasonModal, setShowSeasonModal] = useState(false);
  const [newSeasonName, setNewSeasonName] = useState("");
  const [closeCurrent, setCloseCurrent] = useState(false);

  // Fetch league info
  const { data: leagueInfo } = useQuery({
    queryKey: ["league-info", groupCode],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/league/info?groupCode=${groupCode}`,
      );
      if (!response.ok) return { description: "" };
      return response.json();
    },
    enabled: !!groupCode,
  });

  // Fetch recent games
  const { data: recentGames, refetch: refetchGames } = useQuery({
    queryKey: ["recent-games-admin", groupCode],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/games/recent?groupCode=${groupCode}&limit=50`,
      );
      if (!response.ok) throw new Error("Failed to fetch games");
      const data = await response.json();
      return data.games;
    },
    enabled: !!groupCode && activeTab === "games",
  });

  // Fetch all players
  const { data: players, refetch: refetchPlayers } = useQuery({
    queryKey: ["all-players-admin", groupCode],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/players/list?groupCode=${groupCode}`,
      );
      if (!response.ok) throw new Error("Failed to fetch players");
      const result = await response.json();
      return result.players;
    },
    enabled: !!groupCode && activeTab === "players",
  });

  // Fetch seasons
  const { data: seasons, refetch: refetchSeasons } = useQuery({
    queryKey: ["seasons-admin", groupCode],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/admin/seasons?groupCode=${groupCode}`,
      );
      if (!response.ok) throw new Error("Failed to fetch seasons");
      const data = await response.json();
      return data.seasons;
    },
    enabled: !!groupCode && activeTab === "seasons",
  });

  // Delete game mutation
  const deleteGameMutation = useMutation({
    mutationFn: async (gameId) => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/admin/games?gameId=${gameId}&groupCode=${groupCode}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to delete game");
      return response.json();
    },
    onSuccess: () => {
      refetchGames();
      queryClient.invalidateQueries(["players", groupCode]);
      Alert.alert("Success", "Game deleted successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  // Remove player mutation
  const removePlayerMutation = useMutation({
    mutationFn: async (playerId) => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/admin/players?playerId=${playerId}&groupCode=${groupCode}`,
        { method: "DELETE" },
      );
      if (!response.ok) throw new Error("Failed to remove player");
      return response.json();
    },
    onSuccess: () => {
      refetchPlayers();
      queryClient.invalidateQueries(["players", groupCode]);
      Alert.alert("Success", "Player removed successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  // Update league mutation
  const updateLeagueMutation = useMutation({
    mutationFn: async (description) => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/admin/league`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupCode, description }),
        },
      );
      if (!response.ok) throw new Error("Failed to update league");
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["league-info", groupCode]);
      setShowLeagueSettings(false);
      Alert.alert("Success", "League settings updated");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  // Create season mutation
  const createSeasonMutation = useMutation({
    mutationFn: async ({ seasonName, closeCurrent }) => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/admin/seasons`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ groupCode, seasonName, closeCurrent }),
        },
      );
      if (!response.ok) throw new Error("Failed to create season");
      return response.json();
    },
    onSuccess: () => {
      refetchSeasons();
      setShowSeasonModal(false);
      setNewSeasonName("");
      setCloseCurrent(false);
      Alert.alert("Success", "Season created successfully");
    },
    onError: (error) => {
      Alert.alert("Error", error.message);
    },
  });

  const handleCopyLeagueCode = async () => {
    await Clipboard.setStringAsync(groupCode);
    Alert.alert("Copied!", "League code copied to clipboard");
  };

  const handleShareLeagueCode = async () => {
    try {
      await Share.share({
        message: `Join my ping pong league! Use code: ${groupCode}`,
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleDeleteGame = useCallback(
    (game) => {
      Alert.alert(
        "Delete Game",
        `Delete game: ${game.winner_name} ${game.winner_score} - ${game.loser_score} ${game.loser_name}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Delete",
            style: "destructive",
            onPress: () => deleteGameMutation.mutate(game.id),
          },
        ],
      );
    },
    [deleteGameMutation],
  );

  const handleRemovePlayer = useCallback(
    (player) => {
      Alert.alert(
        "Remove Player",
        `Remove ${player.name} from the league? This will delete all their games.`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Remove",
            style: "destructive",
            onPress: () => removePlayerMutation.mutate(player.id),
          },
        ],
      );
    },
    [removePlayerMutation],
  );

  const handleUpdateLeague = useCallback(() => {
    updateLeagueMutation.mutate(leagueDescription);
  }, [leagueDescription, updateLeagueMutation]);

  const handleCreateSeason = useCallback(() => {
    if (!newSeasonName.trim()) {
      Alert.alert("Missing Info", "Please enter a season name");
      return;
    }
    createSeasonMutation.mutate({
      seasonName: newSeasonName.trim(),
      closeCurrent,
    });
  }, [newSeasonName, closeCurrent, createSeasonMutation]);

  return (
    <View style={{ flex: 1, backgroundColor: "#0a0a0a" }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top + 12,
          paddingBottom: 12,
          paddingHorizontal: 20,
          backgroundColor: "#0a0a0a",
          borderBottomWidth: 1,
          borderBottomColor: "#1f2937",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 4,
            }}
          >
            <ChevronLeft size={24} color="#10b981" />
            <Text style={{ fontSize: 16, color: "#10b981", fontWeight: "600" }}>
              Back
            </Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 20, fontWeight: "800", color: "#fff" }}>
            Admin Panel
          </Text>
          <TouchableOpacity onPress={() => setShowLeagueSettings(true)}>
            <Settings size={24} color="#fbbf24" />
          </TouchableOpacity>
        </View>

        {/* Tab Selector */}
        <View
          style={{
            flexDirection: "row",
            gap: 8,
            marginTop: 16,
          }}
        >
          {[
            { id: "games", label: "Games", icon: Trophy },
            { id: "players", label: "Players", icon: Users },
            { id: "seasons", label: "Seasons", icon: Calendar },
          ].map((tab) => (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setActiveTab(tab.id)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                paddingVertical: 10,
                paddingHorizontal: 12,
                borderRadius: 10,
                backgroundColor: activeTab === tab.id ? "#10b981" : "#1a1a1a",
              }}
            >
              <tab.icon
                size={18}
                color={activeTab === tab.id ? "#000" : "#9ca3af"}
              />
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: activeTab === tab.id ? "#000" : "#9ca3af",
                }}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Content */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {activeTab === "games" && (
          <View>
            {recentGames?.length === 0 ? (
              <View style={{ paddingTop: 40, alignItems: "center" }}>
                <Text style={{ color: "#6b7280", textAlign: "center" }}>
                  No games yet
                </Text>
                <Text
                  style={{
                    color: "#6b7280",
                    textAlign: "center",
                    fontSize: 13,
                    marginTop: 8,
                  }}
                >
                  Once games are logged they will appear here for editing and
                  deletion
                </Text>
              </View>
            ) : (
              recentGames?.map((game) => (
                <View
                  key={game.id}
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#10b981",
                          fontSize: 14,
                          fontWeight: "700",
                        }}
                      >
                        {game.winner_emoji} {game.winner_name}{" "}
                        {game.winner_score}
                      </Text>
                      <Text
                        style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}
                      >
                        {game.loser_emoji} {game.loser_name} {game.loser_score}
                      </Text>
                      <Text
                        style={{ color: "#6b7280", fontSize: 12, marginTop: 8 }}
                      >
                        {new Date(game.played_at).toLocaleDateString()}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteGame(game)}
                      style={{
                        backgroundColor: "#ef4444",
                        padding: 10,
                        borderRadius: 8,
                      }}
                    >
                      <Trash2 size={18} color="#fff" />
                    </TouchableOpacity>
                  </View>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "players" && (
          <View>
            {players?.length === 0 ? (
              <Text
                style={{ color: "#6b7280", textAlign: "center", marginTop: 40 }}
              >
                No players yet
              </Text>
            ) : (
              players?.map((player) => (
                <View
                  key={player.id}
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Text style={{ fontSize: 20 }}>{player.emoji}</Text>
                      <View>
                        <Text
                          style={{
                            color: "#fff",
                            fontSize: 16,
                            fontWeight: "700",
                          }}
                        >
                          {player.name}
                        </Text>
                        {player.username && (
                          <Text style={{ color: "#6b7280", fontSize: 12 }}>
                            @{player.username}
                          </Text>
                        )}
                      </View>
                    </View>
                    <Text
                      style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}
                    >
                      Elo: {player.elo}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => handleRemovePlayer(player)}
                    style={{
                      backgroundColor: "#ef4444",
                      padding: 10,
                      borderRadius: 8,
                    }}
                  >
                    <Trash2 size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
        )}

        {activeTab === "seasons" && (
          <View>
            <TouchableOpacity
              onPress={() => setShowSeasonModal(true)}
              style={{
                backgroundColor: "#10b981",
                padding: 16,
                borderRadius: 12,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <Plus size={20} color="#000" />
              <Text style={{ color: "#000", fontSize: 16, fontWeight: "700" }}>
                Create New Season
              </Text>
            </TouchableOpacity>

            {seasons?.length === 0 ? (
              <Text
                style={{ color: "#6b7280", textAlign: "center", marginTop: 20 }}
              >
                No seasons yet
              </Text>
            ) : (
              seasons?.map((season) => (
                <View
                  key={season.id}
                  style={{
                    backgroundColor: "#1a1a1a",
                    borderRadius: 12,
                    padding: 16,
                    marginBottom: 12,
                    borderLeftWidth: 4,
                    borderLeftColor:
                      season.status === "active" ? "#10b981" : "#6b7280",
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          color: "#fff",
                          fontSize: 16,
                          fontWeight: "700",
                        }}
                      >
                        {season.name}
                      </Text>
                      <Text
                        style={{ color: "#9ca3af", fontSize: 14, marginTop: 4 }}
                      >
                        {season.game_count} games
                      </Text>
                      <Text
                        style={{ color: "#6b7280", fontSize: 12, marginTop: 4 }}
                      >
                        Started:{" "}
                        {new Date(season.started_at).toLocaleDateString()}
                      </Text>
                      {season.ended_at && (
                        <Text style={{ color: "#6b7280", fontSize: 12 }}>
                          Ended:{" "}
                          {new Date(season.ended_at).toLocaleDateString()}
                        </Text>
                      )}
                    </View>
                    <View
                      style={{
                        backgroundColor:
                          season.status === "active" ? "#10b981" : "#6b7280",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 6,
                      }}
                    >
                      <Text
                        style={{
                          color: season.status === "active" ? "#000" : "#fff",
                          fontSize: 12,
                          fontWeight: "700",
                          textTransform: "uppercase",
                        }}
                      >
                        {season.status}
                      </Text>
                    </View>
                  </View>
                </View>
              ))
            )}
          </View>
        )}
      </ScrollView>

      {/* League Settings Modal */}
      <Modal
        visible={showLeagueSettings}
        animationType="slide"
        transparent
        onRequestClose={() => setShowLeagueSettings(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#1a1a1a",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#fff" }}>
                League Settings
              </Text>
              <TouchableOpacity onPress={() => setShowLeagueSettings(false)}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
              League Name
            </Text>
            <TextInput
              value={leagueName}
              onChangeText={setLeagueName}
              placeholder={leagueInfo?.league_name || "Enter league name..."}
              placeholderTextColor="#6b7280"
              style={{
                backgroundColor: "#0a0a0a",
                color: "#fff",
                padding: 16,
                borderRadius: 12,
                fontSize: 14,
                marginBottom: 16,
              }}
            />

            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 8,
              }}
            >
              <Text style={{ color: "#9ca3af", fontSize: 14 }}>
                League Code
              </Text>
              <View style={{ flexDirection: "row", gap: 8 }}>
                <TouchableOpacity
                  onPress={handleCopyLeagueCode}
                  style={{
                    backgroundColor: "#1f2937",
                    paddingHorizontal: 12,
                    paddingVertical: 8,
                    borderRadius: 8,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Copy size={16} color="#10b981" />
                  <Text
                    style={{
                      color: "#10b981",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    Copy
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
            <View
              style={{
                backgroundColor: "#0a0a0a",
                padding: 16,
                borderRadius: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{ color: "#10b981", fontSize: 18, fontWeight: "700" }}
              >
                {groupCode}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleShareLeagueCode}
              style={{
                backgroundColor: "#10b981",
                paddingVertical: 14,
                borderRadius: 12,
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                marginBottom: 16,
              }}
            >
              <Share2 size={18} color="#000" />
              <Text style={{ color: "#000", fontSize: 16, fontWeight: "700" }}>
                Share League Code
              </Text>
            </TouchableOpacity>

            <Text style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
              Description (max 100 chars)
            </Text>
            <TextInput
              value={leagueDescription}
              onChangeText={(text) => setLeagueDescription(text.slice(0, 100))}
              placeholder={
                leagueInfo?.description || "Enter league description..."
              }
              placeholderTextColor="#6b7280"
              style={{
                backgroundColor: "#0a0a0a",
                color: "#fff",
                padding: 16,
                borderRadius: 12,
                fontSize: 14,
                marginBottom: 20,
              }}
              multiline
              numberOfLines={3}
            />

            <TouchableOpacity
              onPress={handleUpdateLeague}
              style={{
                backgroundColor: "#10b981",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#000", fontSize: 16, fontWeight: "700" }}>
                Save Settings
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Create Season Modal */}
      <Modal
        visible={showSeasonModal}
        animationType="slide"
        transparent
        onRequestClose={() => setShowSeasonModal(false)}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.8)",
            justifyContent: "flex-end",
          }}
        >
          <View
            style={{
              backgroundColor: "#1a1a1a",
              borderTopLeftRadius: 24,
              borderTopRightRadius: 24,
              padding: 24,
              paddingBottom: insets.bottom + 24,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "800", color: "#fff" }}>
                Create New Season
              </Text>
              <TouchableOpacity onPress={() => setShowSeasonModal(false)}>
                <X size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <Text style={{ color: "#9ca3af", fontSize: 14, marginBottom: 8 }}>
              Season Name
            </Text>
            <TextInput
              value={newSeasonName}
              onChangeText={setNewSeasonName}
              placeholder="e.g., Spring 2025, Season 2"
              placeholderTextColor="#6b7280"
              style={{
                backgroundColor: "#0a0a0a",
                color: "#fff",
                padding: 16,
                borderRadius: 12,
                fontSize: 14,
                marginBottom: 16,
              }}
            />

            <TouchableOpacity
              onPress={() => setCloseCurrent(!closeCurrent)}
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  width: 24,
                  height: 24,
                  borderRadius: 6,
                  borderWidth: 2,
                  borderColor: closeCurrent ? "#10b981" : "#6b7280",
                  backgroundColor: closeCurrent ? "#10b981" : "transparent",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {closeCurrent && <X size={16} color="#000" />}
              </View>
              <Text style={{ color: "#fff", fontSize: 14 }}>
                Close current season
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleCreateSeason}
              style={{
                backgroundColor: "#10b981",
                padding: 16,
                borderRadius: 12,
                alignItems: "center",
              }}
            >
              {createSeasonMutation.isPending ? (
                <ActivityIndicator color="#000" />
              ) : (
                <Text
                  style={{ color: "#000", fontSize: 16, fontWeight: "700" }}
                >
                  Create Season
                </Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
