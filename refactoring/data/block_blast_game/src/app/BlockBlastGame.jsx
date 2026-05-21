import React, { useRef, useEffect } from "react";
import { View, Dimensions, Pressable, ScrollView, Text } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Zap,
  RotateCcw,
  Lightbulb,
  Trophy,
  Settings as SettingsIcon,
  Target,
  TrendingUp,
  ShoppingCart,
  Award,
  RefreshCw,
  Flame,
  Sparkles,
} from "lucide-react-native";
import { GRID_SIZE, POWER_UPS } from "@/utils/gameLogic";
import { Pill } from "./Pill";
import SettingsPanel from "./SettingsPanel";
import AchievementsPanel from "./AchievementsPanel";
import DailyChallengePanel from "./DailyChallengePanel";
import TutorialOverlay from "./TutorialOverlay";
import PowerUpShop from "./PowerUpShop";
import StatisticsPanel from "./StatisticsPanel";
import { GameGrid } from "./BlockBlastGame/GameGrid";
import { AvailablePieces } from "./BlockBlastGame/AvailablePieces";
import { GameOverOverlay } from "./BlockBlastGame/GameOverOverlay";
import { LeaderboardModal } from "./BlockBlastGame/LeaderboardModal";
import { useLeaderboard } from "@/hooks/useLeaderboard";
import { useEnhancedPlayerData } from "@/hooks/useEnhancedPlayerData";
import { useEnhancedGameLogic } from "@/hooks/useEnhancedGameLogic";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const GRID_PADDING = 20;
const GRID_INTERNAL_PADDING = 4;
const CELL_SIZE =
  (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_INTERNAL_PADDING * 2) / GRID_SIZE;

export default function BlockBlastGame() {
  const insets = useSafeAreaInsets();
  const gridLayout = useRef({ x: 0, y: 0, width: 0, height: 0 });

  const {
    playerName,
    playerId,
    streakData,
    statistics,
    coins,
    unlockedAchievements,
    settings,
    showSettings,
    showAchievements,
    showDailyChallenge,
    showTutorial,
    showShop,
    showStats,
    setShowSettings,
    setShowAchievements,
    setShowDailyChallenge,
    setShowTutorial,
    setShowShop,
    setShowStats,
    updatePlayerName,
    updateSettings,
    updateStatistics,
    checkAndUnlockAchievements,
    purchasePowerUp,
    setCoins,
  } = useEnhancedPlayerData();

  const {
    grid,
    score,
    highScore,
    availableShapes,
    gameState,
    comboCount,
    maxCombo,
    linesCleared,
    specialsUsed,
    freezeMovesLeft,
    doubleScoreMovesLeft,
    hintActive,
    hintPosition,
    powerUpInventory,
    dailyChallenge,
    challengeProgress,
    handlePlace,
    resetGame,
    usePowerUp,
    setPowerUpInventory,
  } = useEnhancedGameLogic(
    playerId,
    settings,
    statistics,
    unlockedAchievements,
  );

  const {
    leaderboardData,
    showLeaderboard,
    setShowLeaderboard,
    fetchLeaderboard,
    submitScore,
  } = useLeaderboard();

  // Submit score and update stats when game is over
  useEffect(() => {
    if (gameState === "gameOver" && playerName && score > 0) {
      submitScore(playerName, score);
      updateStatistics({ score, linesCleared, specialsUsed, maxCombo });
      checkAndUnlockAchievements({
        score,
        maxCombo,
        linesCleared,
        specialsUsed,
      });
    }
  }, [gameState, playerName, score]);

  const handleShowLeaderboard = () => {
    fetchLeaderboard();
    setShowLeaderboard(true);
  };

  const handlePurchasePowerUp = async (powerUpKey, cost) => {
    const success = await purchasePowerUp(powerUpKey, cost);
    if (success) {
      setPowerUpInventory((prev) => ({
        ...prev,
        [powerUpKey]: (prev[powerUpKey] || 0) + 1,
      }));
    }
  };

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: "#FFFFFF" }}>
      <View
        style={{
          flex: 1,
          paddingHorizontal: GRID_PADDING,
          paddingTop: insets.top + 20,
        }}
      >
        {/* Enhanced Header */}
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "flex-start",
            marginBottom: 16,
          }}
        >
          <View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "600",
                color: "#111827",
                letterSpacing: -0.5,
              }}
            >
              Block Blast
            </Text>
            <View
              style={{
                flexDirection: "row",
                gap: 8,
                marginTop: 4,
                flexWrap: "wrap",
              }}
            >
              <Pill
                variant="status"
                hasDot={true}
                dotColor={gameState === "playing" ? "#22C55E" : "#EF4444"}
              >
                {gameState === "playing" ? "Active" : "Game Over"}
              </Pill>
              <Pill variant="outline">
                <Flame size={12} color="#F59E0B" />{" "}
                {streakData.current_streak || 0}d
              </Pill>
              {comboCount > 0 && (
                <Pill variant="outline">
                  <Zap size={12} color="#EF4444" /> {comboCount}x
                </Pill>
              )}
              {doubleScoreMovesLeft > 0 && (
                <Pill variant="outline">
                  <Sparkles size={12} color="#F59E0B" /> 2x
                </Pill>
              )}
              {freezeMovesLeft > 0 && <Pill variant="outline">🛡️ Freeze</Pill>}
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
            <Pressable
              onPress={() => setShowDailyChallenge(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Target size={20} color="#6B7280" />
            </Pressable>
            <Pressable
              onPress={() => setShowShop(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <ShoppingCart size={20} color="#6B7280" />
            </Pressable>
            <Pressable
              onPress={() => setShowStats(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TrendingUp size={20} color="#6B7280" />
            </Pressable>
            <Pressable
              onPress={() => setShowAchievements(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Award size={20} color="#6B7280" />
            </Pressable>
            <Pressable
              onPress={() => setShowSettings(true)}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <SettingsIcon size={20} color="#6B7280" />
            </Pressable>
            <Pressable
              onPress={handleShowLeaderboard}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Trophy size={20} color="#6B7280" />
            </Pressable>
            <Pressable
              onPress={resetGame}
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: "#E5E7EB",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <RefreshCw size={20} color="#6B7280" />
            </Pressable>
          </View>
        </View>

        {/* Score Cards */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 16 }}>
          <View
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              backgroundColor: "#FFFFFF",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "500",
                color: "#6B7280",
                marginBottom: 2,
              }}
            >
              Score
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "600", color: "#111827" }}>
              {score}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#E5E7EB",
              backgroundColor: "#F9FAFB",
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Trophy size={12} color="#6B7280" />
              <Text
                style={{ fontSize: 11, fontWeight: "500", color: "#6B7280" }}
              >
                Best
              </Text>
            </View>
            <Text style={{ fontSize: 20, fontWeight: "600", color: "#111827" }}>
              {highScore}
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              padding: 12,
              borderRadius: 12,
              borderWidth: 1,
              borderColor: "#F59E0B",
              backgroundColor: "#FEF3C7",
            }}
          >
            <Text
              style={{
                fontSize: 11,
                fontWeight: "500",
                color: "#92400E",
                marginBottom: 2,
              }}
            >
              Coins
            </Text>
            <Text style={{ fontSize: 20, fontWeight: "600", color: "#92400E" }}>
              {coins}
            </Text>
          </View>
        </View>

        {/* Power-up Quick Access */}
        {gameState === "playing" && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={{ marginBottom: 12 }}
          >
            <View style={{ flexDirection: "row", gap: 8 }}>
              {Object.entries(powerUpInventory)
                .filter(([, count]) => count > 0)
                .map(([key, count]) => (
                  <Pressable
                    key={key}
                    onPress={() => usePowerUp(key)}
                    style={{
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                      borderRadius: 8,
                      borderWidth: 1,
                      borderColor: "#E5E7EB",
                      backgroundColor: "#FFFFFF",
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                    }}
                  >
                    {key === POWER_UPS.DOUBLE_SCORE && (
                      <Zap size={14} color="#F59E0B" />
                    )}
                    {key === POWER_UPS.UNDO && (
                      <RotateCcw size={14} color="#8B5CF6" />
                    )}
                    {key === POWER_UPS.HINT && (
                      <Lightbulb size={14} color="#10B981" />
                    )}
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "600",
                        color: "#6B7280",
                      }}
                    >
                      {count}
                    </Text>
                  </Pressable>
                ))}
            </View>
          </ScrollView>
        )}

        <GameGrid
          grid={grid}
          cellSize={CELL_SIZE}
          gridLayout={gridLayout}
          gridInternalPadding={GRID_INTERNAL_PADDING}
          hintPosition={hintPosition}
          availableShapes={availableShapes}
        />

        <AvailablePieces
          availableShapes={availableShapes}
          onPlace={handlePlace}
          gridOffset={gridLayout}
          isGameOver={gameState === "gameOver"}
          cellSize={CELL_SIZE}
          hintActive={hintActive}
          hintPosition={hintPosition}
        />

        {gameState === "gameOver" && (
          <GameOverOverlay
            score={score}
            maxCombo={maxCombo}
            linesCleared={linesCleared}
            streakData={streakData}
            playerName={playerName}
            onPlayerNameChange={updatePlayerName}
            onReset={resetGame}
          />
        )}

        {showLeaderboard && (
          <LeaderboardModal
            leaderboardData={leaderboardData}
            onClose={() => setShowLeaderboard(false)}
          />
        )}

        {/* All new panels */}
        <SettingsPanel
          visible={showSettings}
          onClose={() => setShowSettings(false)}
          settings={settings}
          onSettingsChange={updateSettings}
        />

        <AchievementsPanel
          visible={showAchievements}
          onClose={() => setShowAchievements(false)}
          unlockedAchievements={unlockedAchievements}
        />

        <DailyChallengePanel
          visible={showDailyChallenge}
          onClose={() => setShowDailyChallenge(false)}
          challenge={dailyChallenge}
          progress={challengeProgress}
        />

        <TutorialOverlay
          visible={showTutorial}
          onClose={() => setShowTutorial(false)}
        />

        <PowerUpShop
          visible={showShop}
          onClose={() => setShowShop(false)}
          coins={coins}
          onPurchase={handlePurchasePowerUp}
          inventory={powerUpInventory}
        />

        <StatisticsPanel
          visible={showStats}
          onClose={() => setShowStats(false)}
          stats={statistics}
        />
      </View>
    </GestureHandlerRootView>
  );
}
