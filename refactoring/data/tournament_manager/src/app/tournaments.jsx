import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useQuery } from "@tanstack/react-query";
import { Trophy, Users, Calendar, Plus } from "lucide-react-native";
import { useGroupCode } from "../../utils/useGroupCode";
import { useRouter } from "expo-router";

export default function TournamentsScreen() {
  const insets = useSafeAreaInsets();
  const { groupCode } = useGroupCode();
  const router = useRouter();
  const [selectedTournament, setSelectedTournament] = useState(null);
  const [showBracket, setShowBracket] = useState(false);

  const { data: tournaments, isLoading } = useQuery({
    queryKey: ["tournaments", groupCode],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tournaments/list?groupCode=${groupCode}`,
      );
      if (!response.ok) return { tournaments: [] };
      return response.json();
    },
    enabled: !!groupCode,
  });

  const { data: myProfile } = useQuery({
    queryKey: ["my-profile", groupCode],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/players/my-profile?groupCode=${groupCode}`,
      );
      if (!response.ok) throw new Error("Failed to fetch profile");
      return response.json();
    },
    enabled: !!groupCode,
  });

  const { data: bracketData } = useQuery({
    queryKey: ["tournament-bracket", selectedTournament?.id],
    queryFn: async () => {
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_BASE_URL}/api/tournaments/bracket?tournamentId=${selectedTournament.id}`,
      );
      if (!response.ok) throw new Error("Failed to fetch bracket");
      return response.json();
    },
    enabled: !!selectedTournament,
  });

  const renderSingleEliminationBracket = (bracket) => {
    if (!bracket || !bracket.rounds) return null;

    return (
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        <View style={{ flexDirection: "row", gap: 20, padding: 20 }}>
          {bracket.rounds.map((round, roundIndex) => (
            <View key={roundIndex} style={{ minWidth: 180 }}>
              <Text
                style={{
                  fontSize: 14,
                  fontWeight: "700",
                  color: "#10b981",
                  marginBottom: 16,
                  textAlign: "center",
                }}
              >
                {round.name}
              </Text>
              <View style={{ gap: 20 }}>
                {round.matchups.map((matchup, matchupIndex) => (
                  <View
                    key={matchupIndex}
                    style={{
                      backgroundColor: "#1a1a1a",
                      borderRadius: 12,
                      padding: 12,
                      borderWidth: 1,
                      borderColor: matchup.game ? "#10b981" : "#1f2937",
                    }}
                  >
                    {/* Player 1 */}
                    {matchup.player1 ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 8,
                          backgroundColor:
                            matchup.game?.winner_id ===
                            matchup.player1.player_id
                              ? "#10b98120"
                              : "#111",
                          borderRadius: 8,
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>
                          {matchup.player1.emoji}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: "#fff",
                            }}
                          >
                            {matchup.player1.name}
                          </Text>
                        </View>
                        {matchup.game && (
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color:
                                matchup.game.winner_id ===
                                matchup.player1.player_id
                                  ? "#10b981"
                                  : "#9ca3af",
                            }}
                          >
                            {matchup.game.winner_id ===
                            matchup.player1.player_id
                              ? matchup.game.winner_score
                              : matchup.game.loser_score}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <View
                        style={{
                          padding: 12,
                          backgroundColor: "#111",
                          borderRadius: 8,
                          marginBottom: 4,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#4b5563" }}>
                          TBD
                        </Text>
                      </View>
                    )}

                    {/* VS Divider */}
                    <View
                      style={{
                        height: 1,
                        backgroundColor: "#1f2937",
                        marginVertical: 4,
                      }}
                    />

                    {/* Player 2 */}
                    {matchup.player2 ? (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          paddingVertical: 8,
                          paddingHorizontal: 8,
                          backgroundColor:
                            matchup.game?.winner_id ===
                            matchup.player2.player_id
                              ? "#10b98120"
                              : "#111",
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 20 }}>
                          {matchup.player2.emoji}
                        </Text>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 14,
                              fontWeight: "600",
                              color: "#fff",
                            }}
                          >
                            {matchup.player2.name}
                          </Text>
                        </View>
                        {matchup.game && (
                          <Text
                            style={{
                              fontSize: 16,
                              fontWeight: "700",
                              color:
                                matchup.game.winner_id ===
                                matchup.player2.player_id
                                  ? "#10b981"
                                  : "#9ca3af",
                            }}
                          >
                            {matchup.game.winner_id ===
                            matchup.player2.player_id
                              ? matchup.game.winner_score
                              : matchup.game.loser_score}
                          </Text>
                        )}
                      </View>
                    ) : (
                      <View
                        style={{
                          padding: 12,
                          backgroundColor: "#111",
                          borderRadius: 8,
                        }}
                      >
                        <Text style={{ fontSize: 12, color: "#4b5563" }}>
                          TBD
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  const renderRoundRobinBracket = (bracket) => {
    if (!bracket || !bracket.standings) return null;

    return (
      <ScrollView style={{ flex: 1 }}>
        {/* Standings */}
        <View style={{ padding: 20 }}>
          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            Standings
          </Text>
          {bracket.standings.map((player, index) => (
            <View
              key={player.id}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                marginBottom: 10,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 16,
                  backgroundColor: index === 0 ? "#10b981" : "#1f2937",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 14,
                    fontWeight: "700",
                    color: index === 0 ? "#000" : "#9ca3af",
                  }}
                >
                  {index + 1}
                </Text>
              </View>
              <Text style={{ fontSize: 24 }}>{player.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 16, fontWeight: "600", color: "#fff" }}
                >
                  {player.name}
                </Text>
                <Text style={{ fontSize: 12, color: "#9ca3af" }}>
                  {player.gamesPlayed} games
                </Text>
              </View>
              <View style={{ alignItems: "flex-end" }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "700", color: "#10b981" }}
                >
                  {player.wins}W
                </Text>
                <Text
                  style={{ fontSize: 14, fontWeight: "600", color: "#ef4444" }}
                >
                  {player.losses}L
                </Text>
              </View>
            </View>
          ))}

          <View
            style={{
              height: 1,
              backgroundColor: "#1f2937",
              marginVertical: 20,
            }}
          />

          <Text
            style={{
              fontSize: 18,
              fontWeight: "700",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            All Matchups
          </Text>
          {bracket.matchups.map((matchup, index) => (
            <View
              key={index}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: 14,
                marginBottom: 10,
                borderLeftWidth: 4,
                borderLeftColor: matchup.game ? "#10b981" : "#1f2937",
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text style={{ fontSize: 20 }}>{matchup.player1.emoji}</Text>
                  <Text
                    style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}
                  >
                    {matchup.player1.name}
                  </Text>
                </View>
                {matchup.game ? (
                  <Text
                    style={{ fontSize: 16, fontWeight: "700", color: "#fff" }}
                  >
                    {matchup.game.winner_score}-{matchup.game.loser_score}
                  </Text>
                ) : (
                  <Text style={{ fontSize: 12, color: "#4b5563" }}>
                    Not played
                  </Text>
                )}
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
                >
                  <Text style={{ fontSize: 20 }}>{matchup.player2.emoji}</Text>
                  <Text
                    style={{ fontSize: 14, fontWeight: "600", color: "#fff" }}
                  >
                    {matchup.player2.name}
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#0a0a0a", paddingTop: insets.top }}
    >
      <StatusBar style="light" />

      <View
        style={{ paddingHorizontal: 20, paddingTop: 20, paddingBottom: 16 }}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "800",
                color: "#fff",
                marginBottom: 4,
              }}
            >
              Tournaments 🏆
            </Text>
            <Text style={{ fontSize: 15, color: "#9ca3af" }}>
              View brackets and standings
            </Text>
          </View>
          {myProfile?.player?.is_admin && (
            <TouchableOpacity
              onPress={() => router.push("/create-tournament")}
              style={{
                backgroundColor: "#10b981",
                width: 44,
                height: 44,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Plus size={24} color="#000" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        showsVerticalScrollIndicator={false}
      >
        {isLoading ? (
          <View style={{ paddingTop: 100, alignItems: "center" }}>
            <ActivityIndicator size="large" color="#10b981" />
          </View>
        ) : tournaments?.tournaments?.length > 0 ? (
          tournaments.tournaments.map((tournament) => (
            <TouchableOpacity
              key={tournament.id}
              onPress={() => {
                setSelectedTournament(tournament);
                setShowBracket(true);
              }}
              style={{
                backgroundColor: "#1a1a1a",
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
                  gap: 10,
                  marginBottom: 12,
                }}
              >
                <Trophy size={24} color="#10b981" />
                <Text
                  style={{ fontSize: 20, fontWeight: "700", color: "#fff" }}
                >
                  {tournament.name}
                </Text>
              </View>

              <View style={{ flexDirection: "row", gap: 16 }}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Users size={16} color="#9ca3af" />
                  <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                    {tournament.participant_count} players
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 6,
                  }}
                >
                  <Calendar size={16} color="#9ca3af" />
                  <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                    {tournament.games_played} games
                  </Text>
                </View>
              </View>

              <View
                style={{
                  marginTop: 12,
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                  backgroundColor:
                    tournament.status === "active"
                      ? "#10b98120"
                      : tournament.status === "completed"
                        ? "#3b82f620"
                        : "#1f2937",
                  alignSelf: "flex-start",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color:
                      tournament.status === "active"
                        ? "#10b981"
                        : tournament.status === "completed"
                          ? "#3b82f6"
                          : "#9ca3af",
                    textTransform: "capitalize",
                  }}
                >
                  {tournament.status} • {tournament.format.replace("_", " ")}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        ) : (
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
            <Text style={{ fontSize: 50, marginBottom: 12 }}>🏆</Text>
            <Text
              style={{
                fontSize: 16,
                fontWeight: "600",
                color: "#fff",
                marginBottom: 6,
              }}
            >
              No tournaments yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#9ca3af",
                textAlign: "center",
              }}
            >
              Tap + to create your first tournament
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Bracket Modal */}
      <Modal visible={showBracket} transparent animationType="slide">
        <View
          style={{
            flex: 1,
            backgroundColor: "#0a0a0a",
            paddingTop: insets.top,
          }}
        >
          <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <View>
                <Text
                  style={{
                    fontSize: 24,
                    fontWeight: "700",
                    color: "#fff",
                  }}
                >
                  {bracketData?.tournament?.name}
                </Text>
                <Text style={{ fontSize: 14, color: "#9ca3af" }}>
                  {bracketData?.tournament?.format.replace("_", " ")}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  setShowBracket(false);
                  setSelectedTournament(null);
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: "#1a1a1a",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20, color: "#fff" }}>✕</Text>
              </TouchableOpacity>
            </View>
          </View>

          {bracketData?.bracket ? (
            bracketData.tournament.format === "single_elimination" ? (
              renderSingleEliminationBracket(bracketData.bracket)
            ) : (
              renderRoundRobinBracket(bracketData.bracket)
            )
          ) : (
            <View
              style={{
                flex: 1,
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <ActivityIndicator size="large" color="#10b981" />
            </View>
          )}
        </View>
      </Modal>
    </View>
  );
}
