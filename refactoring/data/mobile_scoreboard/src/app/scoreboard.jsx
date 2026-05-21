import { useState } from "react";
import { View, Text, ScrollView, TouchableOpacity } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useLocalSearchParams, router } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { ArrowLeft, RefreshCw } from "lucide-react-native";
import { getColorHex } from "@/utils/scoreboardUtils";
import { useSheetSelection } from "@/hooks/useSheetSelection";
import { useTieBreaker } from "@/hooks/useTieBreaker";
import { useScoreboardState } from "@/hooks/useScoreboardState";
import { SheetSelectionScreen } from "@/components/Scoreboard/SheetSelectionScreen";
import { ScoreboardHeader } from "@/components/Scoreboard/ScoreboardHeader";
import { ScoreEntrySection } from "@/components/Scoreboard/ScoreEntrySection";
import { GameSummary } from "@/components/Scoreboard/GameSummary";
import { ErrorNotice } from "@/components/Scoreboard/ErrorNotice";
import {
  saveGameResults,
  saveTieBreakerResults,
} from "@/utils/gameResultsHandler";

export default function ScoreboardScreen() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();

  // Parse params
  const gameId = params.gameId;
  const team1Name = params.team1Name;
  const team2Name = params.team2Name;
  const team1Color = params.team1Color;
  const team2Color = params.team2Color;
  const totalEnds = parseInt(params.ends) || 8;
  const startingHammer = parseInt(params.hammerTeam) || 1;
  const myTeamId = params.myTeamId ? parseInt(params.myTeamId) : null;
  const myTeamNumber = params.myTeamNumber
    ? parseInt(params.myTeamNumber)
    : null;
  const team1Id = params.team1Id ? parseInt(params.team1Id) : null;
  const team2Id = params.team2Id ? parseInt(params.team2Id) : null;

  const playerSetup = params.playerSetup
    ? JSON.parse(params.playerSetup)
    : null;

  const team1ColorHex = getColorHex(team1Color);
  const team2ColorHex = getColorHex(team2Color);

  const [error, setError] = useState(null);

  // Use custom hooks
  const {
    sheetNumber,
    clubSheetsCount,
    isSelectingSheet,
    sheetSelectionLoading,
    error: sheetError,
    setError: setSheetError,
    handleSheetSelect,
  } = useSheetSelection(gameId);

  const {
    team1Scores,
    setTeam1Scores,
    team2Scores,
    setTeam2Scores,
    currentEnd,
    setCurrentEnd,
    currentHammer,
    setCurrentHammer,
    blankEnd,
    setBlankEnd,
    team1Total,
    team2Total,
  } = useScoreboardState(params, totalEnds, startingHammer);

  const {
    showTieBreaker,
    tieWinMethod,
    setTieWinMethod,
    tieWinnerTeam,
    setTieWinnerTeam,
    tiesAllowed,
  } = useTieBreaker(currentEnd, team1Total, team2Total, totalEnds, gameId);

  const handleFinishGame = () => {
    saveGameResults({
      gameId,
      team1Total,
      team2Total,
      team1Color,
      team2Color,
      team1Id,
      team2Id,
      team1Scores,
      team2Scores,
      totalEnds,
      startingHammer,
      playerSetup,
      myTeamId,
      team1Name,
      team2Name,
      setError,
    });
  };

  const handleTieBreakerConfirm = () => {
    saveTieBreakerResults({
      tieWinMethod,
      tieWinnerTeam,
      gameId,
      team1Total,
      team2Total,
      team1Color,
      team2Color,
      team1Id,
      team2Id,
      team1Scores,
      team2Scores,
      totalEnds,
      startingHammer,
      playerSetup,
      myTeamId,
      team1Name,
      team2Name,
      setError,
    });
  };

  const handleReassignRocks = () => {
    router.push({
      pathname: "/game-setup",
      params: {
        gameId: gameId,
        team1Scores: JSON.stringify(team1Scores),
        team2Scores: JSON.stringify(team2Scores),
        currentEnd: currentEnd,
        currentHammer: currentHammer,
        playerSetup: JSON.stringify(playerSetup || []),
        team1Name: team1Name,
        team2Name: team2Name,
        team1Color: team1Color,
        team2Color: team2Color,
        team1Id: team1Id,
        team2Id: team2Id,
        ends: totalEnds,
        hammerTeam: startingHammer,
        myTeamId: myTeamId,
        myTeamNumber: myTeamNumber,
        reassigning: "true",
      },
    });
  };

  // Show loading screen while checking sheet data
  if (sheetSelectionLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#F9FAFB",
          paddingTop: insets.top,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <StatusBar style="dark" />
        <Text style={{ color: "#6B6B6B", fontSize: 16 }}>Loading...</Text>
      </View>
    );
  }

  // Show sheet selection screen if no sheet selected yet
  if (isSelectingSheet) {
    return (
      <SheetSelectionScreen
        insets={insets}
        router={router}
        team1Name={team1Name}
        team2Name={team2Name}
        clubSheetsCount={clubSheetsCount}
        handleSheetSelect={handleSheetSelect}
        error={sheetError}
        setError={setSheetError}
      />
    );
  }

  return (
    <View
      style={{ flex: 1, backgroundColor: "#F9FAFB", paddingTop: insets.top }}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingHorizontal: 20,
          paddingVertical: 16,
          backgroundColor: "#fff",
          borderBottomWidth: 1,
          borderBottomColor: "#E5E7EB",
        }}
      >
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginBottom: 12,
          }}
        >
          <ArrowLeft size={16} color="#2563eb" style={{ marginRight: 6 }} />
          <Text style={{ fontSize: 14, color: "#2563eb", fontWeight: "500" }}>
            Back to Setup
          </Text>
        </TouchableOpacity>

        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 24, fontWeight: "700", color: "#000" }}>
              Scoreboard
            </Text>
            <Text style={{ fontSize: 14, color: "#6B6B6B", marginTop: 4 }}>
              End {currentEnd} of {totalEnds} • Sheet {sheetNumber}
            </Text>
          </View>

          {myTeamId && (
            <TouchableOpacity
              onPress={handleReassignRocks}
              style={{
                flexDirection: "row",
                alignItems: "center",
                backgroundColor: "#3B82F6",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
                gap: 6,
              }}
            >
              <RefreshCw size={16} color="#fff" />
              <Text style={{ color: "#fff", fontWeight: "600", fontSize: 14 }}>
                Reassign Rocks
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingBottom: insets.bottom + 20,
        }}
      >
        {/* Main Scoreboard */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={true}
          style={{ flexGrow: 0, marginBottom: 20 }}
        >
          <ScoreboardHeader
            team1Name={team1Name}
            team2Name={team2Name}
            team1ColorHex={team1ColorHex}
            team2ColorHex={team2ColorHex}
            currentHammer={currentHammer}
            team1Scores={team1Scores}
            team2Scores={team2Scores}
            team1Total={team1Total}
            team2Total={team2Total}
            totalEnds={totalEnds}
            currentEnd={currentEnd}
          />
        </ScrollView>

        {/* Current End Score Entry */}
        <ScoreEntrySection
          currentEnd={currentEnd}
          tiesAllowed={tiesAllowed}
          blankEnd={blankEnd}
          setBlankEnd={setBlankEnd}
          team1Scores={team1Scores}
          setTeam1Scores={setTeam1Scores}
          team2Scores={team2Scores}
          setTeam2Scores={setTeam2Scores}
          showTieBreaker={showTieBreaker}
          team1Name={team1Name}
          team2Name={team2Name}
          team1ColorHex={team1ColorHex}
          team2ColorHex={team2ColorHex}
          tieWinnerTeam={tieWinnerTeam}
          setTieWinnerTeam={setTieWinnerTeam}
          tieWinMethod={tieWinMethod}
          setTieWinMethod={setTieWinMethod}
          currentHammer={currentHammer}
          totalEnds={totalEnds}
          setCurrentEnd={setCurrentEnd}
          setCurrentHammer={setCurrentHammer}
          handleFinishGame={handleFinishGame}
          handleTieBreakerConfirm={handleTieBreakerConfirm}
        />

        {/* Game Summary */}
        <GameSummary
          totalEnds={totalEnds}
          currentEnd={currentEnd}
          currentHammer={currentHammer}
          team1Name={team1Name}
          team2Name={team2Name}
          team1Total={team1Total}
          team2Total={team2Total}
        />
      </ScrollView>

      {/* Error Notice */}
      <ErrorNotice error={error} setError={setError} insets={insets} />
    </View>
  );
}
