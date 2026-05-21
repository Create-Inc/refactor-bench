import { useState, useEffect, useRef, useCallback } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ActivityIndicator,
  Modal,
  Animated,
  Share,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Flame,
  Plus,
  CheckCircle,
  Crown,
  Target,
  Snowflake,
  Swords,
  Share2,
  X,
  Trophy,
} from "lucide-react-native";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import { useFocusEffect } from "expo-router";
import useInAppPurchase from "@/utils/useInAppPurchase";
import useUser from "@/utils/auth/useUser";
import useAuth from "@/utils/auth/useAuth";
import api from "@/utils/api";
import Analytics from "@/utils/analytics";
import {
  registerForPushNotifications,
  scheduleDailyReminder,
  syncSmartNotifications,
  registerPushTokenWithServer,
  scheduleStreakRiskCheck,
} from "@/utils/notifications";
import AsyncStorage from "@react-native-async-storage/async-storage";

const MILESTONE_DAYS = [7, 14, 21, 30, 50, 75, 100, 150, 200, 365];

export default function HomeScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isSubscribed } = useInAppPurchase();
  const { data: user, loading: userLoading } = useUser();
  const { signIn, signUp } = useAuth();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const notificationTimeoutRef = useRef(null);
  const profileCheckRef = useRef(false);
  const initialLoadDone = useRef(false);

  // Streak break modal state
  const [streakBreakVisible, setStreakBreakVisible] = useState(false);
  const [brokenStreakData, setBrokenStreakData] = useState(null);

  // Milestone modal state
  const [milestoneVisible, setMilestoneVisible] = useState(false);
  const [milestoneData, setMilestoneData] = useState(null);

  // Streak saver modal state
  const [streakSaverVisible, setStreakSaverVisible] = useState(false);
  const [atRiskStreaks, setAtRiskStreaks] = useState([]);

  // Comeback modal state
  const [comebackVisible, setComebackVisible] = useState(false);
  const [comebackData, setComebackData] = useState(null);

  useEffect(() => {
    if (user?.id && !profileCheckRef.current) {
      profileCheckRef.current = true;
      ensureProfileExists();
      checkNotificationPermissions();
      checkComebackOffer();
      syncNotifications();
      checkStreakSaver();
    } else if (!userLoading && !user) {
      setLoading(false);
    }

    return () => {
      if (notificationTimeoutRef.current) {
        clearTimeout(notificationTimeoutRef.current);
      }
    };
  }, [user?.id, userLoading]);

  useFocusEffect(
    useCallback(() => {
      if (user?.id && initialLoadDone.current) {
        fetchGoals();
      }
    }, [user?.id]),
  );

  // Smart notification sync
  const syncNotifications = async () => {
    try {
      await syncSmartNotifications(api);
    } catch (error) {
      console.error("Notification sync error:", error);
    }
  };

  // Comeback checker
  const checkComebackOffer = async () => {
    try {
      const data = await api.get("/comeback");
      if (data.showComebackOffer && data.comebackTier !== "none") {
        const lastShown = await AsyncStorage.getItem("comebackShownAt");
        if (lastShown) {
          const hours = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
          if (hours < 24) return;
        }
        setComebackData(data);
        setComebackVisible(true);
        await AsyncStorage.setItem("comebackShownAt", String(Date.now()));
      }
    } catch (error) {
      // Silently fail - user might be brand new
    }
  };

  // Streak saver check
  const checkStreakSaver = async () => {
    try {
      const data = await api.get("/streak-saver");
      if (data.hasStreaksAtRisk && data.atRiskStreaks?.length > 0) {
        setAtRiskStreaks(data.atRiskStreaks);
        // Only show if not shown in last 4 hours
        const lastShown = await AsyncStorage.getItem("streakSaverShownAt");
        if (lastShown) {
          const hours = (Date.now() - parseInt(lastShown)) / (1000 * 60 * 60);
          if (hours < 4) return;
        }
        // Delay to not overwhelm user on open
        setTimeout(() => {
          setStreakSaverVisible(true);
          AsyncStorage.setItem("streakSaverShownAt", String(Date.now()));
        }, 3000);
      }
    } catch (error) {
      // Silently fail
    }
  };

  // Handle streak saver actions
  const handleStreakSave = async (streakId, method) => {
    try {
      await api.post("/streak-saver", { streakId, method });
      Alert.alert("✅ Streak Saved!", "Your streak has been protected!");
      setStreakSaverVisible(false);
      fetchGoals();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to save streak");
    }
  };

  // Handle comeback bonus claim
  const handleClaimComeback = async () => {
    try {
      const result = await api.post("/comeback", { action: "claim_bonus" });
      if (result.success) {
        Alert.alert(
          "🎉 Welcome Back!",
          `You earned ${result.xpEarned} bonus XP!`,
        );
      }
      setComebackVisible(false);
      fetchGoals();
    } catch (error) {
      setComebackVisible(false);
    }
  };

  const ensureProfileExists = async () => {
    try {
      const data = await api.get(`/users?userId=${user.id}`);
      if (data.user) {
        fetchGoals();
        return;
      }
    } catch (error) {
      if (
        error.message?.includes("404") ||
        error.message?.includes("not found") ||
        error.message?.includes("User not found")
      ) {
        try {
          const baseUsername = (
            user.name ||
            user.email?.split("@")[0] ||
            "user"
          )
            .toLowerCase()
            .replace(/[^a-z0-9_]/g, "")
            .substring(0, 16);
          const username =
            baseUsername + Math.floor(1000 + Math.random() * 8999);

          await api.post("/users", {
            username,
            displayName: user.name || user.email?.split("@")[0] || "User",
          });
          fetchGoals();
          return;
        } catch (createError) {
          if (
            createError.message?.includes("409") ||
            createError.message?.includes("already exists")
          ) {
            fetchGoals();
            return;
          }
          console.error("Error creating user profile:", createError);
        }
      } else {
        console.error("Error checking user profile:", error);
      }
    }
    fetchGoals();
  };

  const checkNotificationPermissions = async () => {
    try {
      const prompted = await AsyncStorage.getItem("notificationsPrompted");
      if (!prompted) {
        notificationTimeoutRef.current = setTimeout(() => {
          promptForNotifications();
        }, 2000);
      }
    } catch (error) {
      console.error("Error checking notification permissions:", error);
    }
  };

  const promptForNotifications = () => {
    Alert.alert(
      "🔥 Stay on Track",
      "LastUp sends the following notifications:\n\n• Daily check-in reminders\n• Streak-at-risk warnings\n• Battle updates from friends\n• Achievement & milestone celebrations\n\nYou can customize these anytime in Settings.",
      [
        {
          text: "Not Now",
          style: "cancel",
          onPress: async () => {
            await AsyncStorage.setItem("notificationsPrompted", "true");
          },
        },
        {
          text: "Enable Notifications",
          onPress: async () => {
            const token = await registerForPushNotifications();
            if (token) {
              await scheduleDailyReminder(20, 0);
              await scheduleStreakRiskCheck(21, 30);
              await registerPushTokenWithServer(api, token);
              Alert.alert(
                "You're all set!",
                "You'll get daily reminders at 8 PM and streak warnings at 9:30 PM. Adjust notification preferences anytime in Settings.",
              );
            }
            await AsyncStorage.setItem("notificationsPrompted", "true");
          },
        },
      ],
    );
  };

  const fetchGoals = async () => {
    if (!user?.id) return;
    try {
      const data = await api.get(`/goals?userId=${user.id}`);
      setGoals(data.goals || []);
    } catch (error) {
      console.error("Error fetching goals:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      initialLoadDone.current = true;
    }
  };

  const handleCheckIn = async (
    streakId,
    goalName,
    currentStreak,
    lastCheckIn,
  ) => {
    if (!user?.id) return;

    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    const lastDate = lastCheckIn
      ? new Date(lastCheckIn).toISOString().split("T")[0]
      : null;
    const wasBroken = currentStreak > 0 && lastDate && lastDate < yesterdayStr;

    try {
      const result = await api.post("/streaks/checkin", { streakId });
      const newStreak = result?.streak?.current_streak || 1;

      Analytics.checkInCompleted(streakId, newStreak);

      if (wasBroken) {
        setBrokenStreakData({ goalName, daysLost: currentStreak });
        setStreakBreakVisible(true);
        Analytics.streakBroken(streakId, currentStreak);
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error,
          );
        } catch (e) {
          /* haptics not available */
        }
      } else if (MILESTONE_DAYS.includes(newStreak)) {
        setMilestoneData({ goalName, day: newStreak });
        setMilestoneVisible(true);
        Analytics.milestoneReached(newStreak);
        try {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success,
          );
        } catch (e) {
          /* haptics not available */
        }
      } else {
        try {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        } catch (e) {
          /* haptics not available */
        }
      }

      fetchGoals();
    } catch (error) {
      console.error("Error checking in:", error);
      Alert.alert(
        "Error",
        error.message || "Failed to check in. Please try again.",
      );
    }
  };

  const handleChallengeFromGoal = async (goalId, goalName) => {
    try {
      await api.post("/challenge-battle", { goalId });
      Analytics.battleChallengeCreated(goalId);

      try {
        await Share.share({
          message: `I'm challenging you to "${goalName}" on LastUp! 🔥 Can you keep a longer streak than me? Join my battle and prove it!`,
        });
        Analytics.friendInvited("challenge_from_goal");
      } catch (shareErr) {
        // User cancelled share
      }

      Alert.alert(
        "Battle Created!",
        "Your challenge is live. Share the link to invite friends!",
      );
      fetchGoals();
    } catch (error) {
      console.error("Error creating challenge:", error);
      Alert.alert("Error", error.message || "Failed to create challenge.");
    }
  };

  const handleShareProgress = async (goalName, streak) => {
    try {
      Analytics.shareTapped("goal_progress", streak);
      await Share.share({
        message: `🔥 Day ${streak} of ${goalName} on LastUp! Building unbreakable habits. Can you beat my streak?`,
      });
    } catch (error) {
      // User cancelled share
    }
  };

  const handleShareMilestone = async () => {
    if (!milestoneData) return;
    try {
      Analytics.shareTapped("milestone", milestoneData.day);
      const dayCount = milestoneData.day;
      const celebrationText =
        dayCount >= 100
          ? "Triple digits!"
          : dayCount >= 30
            ? "A whole month!"
            : "Consistency is key!";
      await Share.share({
        message: `🏆 I just hit Day ${dayCount} of ${milestoneData.goalName} on LastUp! ${celebrationText} 🔥`,
      });
    } catch (error) {
      // User cancelled share
    }
    setMilestoneVisible(false);
  };

  const handleFreezeStreak = async (streakId, freezesAvailable) => {
    if (!user?.id) return;

    if (freezesAvailable <= 0) {
      Alert.alert(
        "No Freezes Available",
        "You don't have any freezes right now. You can get more from the Premium tab in your profile.",
        [{ text: "OK", style: "default" }],
      );
      return;
    }

    Alert.alert(
      "❄️ Freeze This Streak?",
      "Use 1 freeze to protect your streak for 24 hours. You can skip check-in today without breaking it.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Use Freeze",
          onPress: async () => {
            try {
              await api.post("/streaks/freeze", { streakId });
              Alert.alert(
                "✓ Streak Frozen!",
                "Your streak is protected for 24 hours",
              );
              fetchGoals();
            } catch (error) {
              console.error("Error freezing streak:", error);
              Alert.alert(
                "Error",
                error.message || "Failed to freeze streak. Please try again.",
              );
            }
          },
        },
      ],
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchGoals();
  };

  const isCheckedInToday = (lastCheckIn) => {
    if (!lastCheckIn) return false;
    const today = new Date().toISOString().split("T")[0];
    return lastCheckIn === today;
  };

  if (userLoading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          paddingTop: insets.top,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <StatusBar style="light" />
        <ActivityIndicator size="large" color="#FF8C00" />
        <Text style={{ color: "#888", marginTop: 16 }}>Loading...</Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          paddingTop: insets.top,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 40,
        }}
      >
        <StatusBar style="light" />
        <Image
          source={{
            uri: "https://raw.createusercontent.com/965de5a8-9836-437f-8823-18764464b0d0/",
          }}
          style={{ width: 80, height: 80, borderRadius: 20 }}
          contentFit="cover"
        />
        <Text
          style={{
            color: "#fff",
            fontSize: 28,
            fontWeight: "bold",
            marginTop: 24,
            textAlign: "center",
          }}
        >
          Welcome to LastUp!
        </Text>
        <Text
          style={{
            color: "#888",
            fontSize: 16,
            marginTop: 12,
            textAlign: "center",
            lineHeight: 24,
          }}
        >
          Build unbreakable streaks, compete with friends, and achieve your
          goals.
        </Text>
        <TouchableOpacity
          onPress={signIn}
          accessibilityLabel="Sign in to your account"
          accessibilityRole="button"
          style={{
            backgroundColor: "#FF8C00",
            paddingHorizontal: 40,
            paddingVertical: 16,
            borderRadius: 16,
            marginTop: 32,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            Sign In
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={signUp}
          accessibilityLabel="Create a new account"
          accessibilityRole="button"
          style={{
            backgroundColor: "#1a1a1a",
            paddingHorizontal: 40,
            paddingVertical: 16,
            borderRadius: 16,
            marginTop: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
            Create Account
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const checkedInToday = goals.filter((g) =>
    isCheckedInToday(g.last_check_in),
  ).length;

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          padding: 20,
          paddingBottom: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "flex-start",
        }}
      >
        <View style={{ flex: 1 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image
              source={{
                uri: "https://raw.createusercontent.com/965de5a8-9836-437f-8823-18764464b0d0/",
              }}
              style={{ width: 36, height: 36, borderRadius: 8 }}
              contentFit="cover"
            />
            <Text
              style={{ fontSize: 32, fontWeight: "bold", color: "#FF8C00" }}
            >
              LastUp
            </Text>
          </View>
          <Text
            style={{
              fontSize: 14,
              color: "#888",
              marginTop: 2,
              fontStyle: "italic",
            }}
          >
            Rise. Compete. Conquer.
          </Text>
        </View>
        {!isSubscribed && (
          <TouchableOpacity
            onPress={() => router.push("/paywall")}
            accessibilityLabel="Upgrade to premium"
            accessibilityRole="button"
            style={{
              backgroundColor: "#FF8C00",
              paddingHorizontal: 16,
              paddingVertical: 8,
              borderRadius: 20,
              flexDirection: "row",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Crown color="#fff" size={16} />
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>
              Go Pro
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{
          padding: 20,
          paddingTop: 10,
          paddingBottom: insets.bottom + 100,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#FF8C00"
          />
        }
      >
        {/* Daily Challenge */}
        {goals.length > 0 && (
          <View
            style={{
              backgroundColor: "#FF8C00",
              borderRadius: 20,
              padding: 20,
              marginBottom: 20,
              shadowColor: "#FF8C00",
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 28 }}>⚡</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}
                >
                  Daily Challenge
                </Text>
                <Text style={{ fontSize: 14, color: "#fff", opacity: 0.9 }}>
                  Check in to all streaks today
                </Text>
              </View>
            </View>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 8,
                marginTop: 8,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 8,
                  backgroundColor: "#ffffff30",
                  borderRadius: 4,
                }}
              >
                <View
                  style={{
                    width: `${goals.length > 0 ? (checkedInToday / goals.length) * 100 : 0}%`,
                    height: "100%",
                    backgroundColor: "#fff",
                    borderRadius: 4,
                  }}
                />
              </View>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 14 }}>
                {checkedInToday}/{goals.length}
              </Text>
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
          <TouchableOpacity
            onPress={() => router.push("/create-goal")}
            accessibilityLabel="Create a new goal"
            accessibilityRole="button"
            style={{
              flex: 1,
              backgroundColor: "#1a1a1a",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#FF8C00",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Plus color="#FF8C00" size={20} />
            <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 15 }}>
              New Goal
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push("/(tabs)/battles")}
            accessibilityLabel="Find a battle to join"
            accessibilityRole="button"
            style={{
              flex: 1,
              backgroundColor: "#1a1a1a",
              borderRadius: 16,
              padding: 16,
              borderWidth: 1,
              borderColor: "#2a2a2a",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
          >
            <Target color="#888" size={20} />
            <Text style={{ color: "#888", fontWeight: "bold", fontSize: 15 }}>
              Find Battle
            </Text>
          </TouchableOpacity>
        </View>

        {loading ? (
          <Text style={{ color: "#666", textAlign: "center", marginTop: 40 }}>
            Loading your streaks...
          </Text>
        ) : goals.length === 0 ? (
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <Image
              source={{
                uri: "https://raw.createusercontent.com/965de5a8-9836-437f-8823-18764464b0d0/",
              }}
              style={{ width: 64, height: 64, borderRadius: 16, opacity: 0.4 }}
              contentFit="cover"
            />
            <Text
              style={{
                color: "#666",
                fontSize: 18,
                marginTop: 20,
                textAlign: "center",
              }}
            >
              No goals yet!{"\n"}Tap "New Goal" above to start
            </Text>
          </View>
        ) : (
          <>
            <Text
              style={{
                fontSize: 20,
                fontWeight: "bold",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              Your Streaks
            </Text>
            {goals.map((goal, index) => {
              const checkedIn = isCheckedInToday(goal.last_check_in);
              const streak = Number(goal.current_streak) || 0;
              const longestStreak = Number(goal.longest_streak) || 0;
              const rawProgress =
                longestStreak > 0
                  ? (streak / longestStreak) * 100
                  : streak > 0
                    ? 100
                    : 0;
              const progress = Number.isFinite(rawProgress)
                ? Math.min(rawProgress, 100)
                : 0;
              const freezesAvailable = Number(goal.freezes_available) || 0;
              const isFrozen = goal.freeze_active || false;
              const streakId = goal.streak_id;

              return (
                <View
                  key={goal.id || `goal-${index}`}
                  style={{
                    backgroundColor: isFrozen ? "#1a2a3a" : "#1a1a1a",
                    borderRadius: 16,
                    padding: 20,
                    marginBottom: 16,
                    borderWidth: 2,
                    borderColor: isFrozen
                      ? "#4FC3F7"
                      : streak > 0
                        ? "#FF8C00"
                        : "#2a2a2a",
                  }}
                >
                  {isFrozen && (
                    <View
                      style={{
                        backgroundColor: "#4FC3F720",
                        borderRadius: 8,
                        padding: 8,
                        marginBottom: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Snowflake color="#4FC3F7" size={16} />
                      <Text
                        style={{
                          color: "#4FC3F7",
                          fontSize: 14,
                          fontWeight: "bold",
                        }}
                      >
                        Streak Frozen - Safe for 24h
                      </Text>
                    </View>
                  )}

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
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "#fff",
                          marginBottom: 4,
                        }}
                      >
                        {goal.name}
                      </Text>
                      {goal.category && (
                        <Text
                          style={{
                            fontSize: 14,
                            color: "#888",
                            textTransform: "capitalize",
                          }}
                        >
                          {goal.category}
                        </Text>
                      )}
                    </View>
                    <View style={{ alignItems: "center" }}>
                      <Flame
                        color={streak > 0 ? "#FF8C00" : "#666"}
                        size={32}
                      />
                      <Text
                        style={{
                          fontSize: 24,
                          fontWeight: "bold",
                          color: "#FF8C00",
                          marginTop: 4,
                        }}
                      >
                        {streak}
                      </Text>
                    </View>
                  </View>

                  {/* Freezes Available */}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 12,
                      backgroundColor: "#2a2a2a",
                      paddingHorizontal: 12,
                      paddingVertical: 6,
                      borderRadius: 8,
                      alignSelf: "flex-start",
                    }}
                  >
                    <Snowflake color="#4FC3F7" size={14} />
                    <Text
                      style={{
                        color: "#4FC3F7",
                        fontSize: 13,
                        fontWeight: "600",
                      }}
                    >
                      {freezesAvailable}{" "}
                      {freezesAvailable === 1 ? "freeze" : "freezes"} available
                    </Text>
                  </View>

                  <View style={{ marginTop: 12 }}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        marginBottom: 6,
                      }}
                    >
                      <Text style={{ fontSize: 12, color: "#666" }}>
                        Progress to best
                      </Text>
                      <Text
                        style={{
                          fontSize: 12,
                          color: "#FF8C00",
                          fontWeight: "bold",
                        }}
                      >
                        Best: {longestStreak} days
                      </Text>
                    </View>
                    <View
                      style={{
                        height: 8,
                        backgroundColor: "#2a2a2a",
                        borderRadius: 4,
                        overflow: "hidden",
                      }}
                    >
                      <View
                        style={{
                          width: `${progress}%`,
                          height: "100%",
                          backgroundColor: "#FF8C00",
                          borderRadius: 4,
                        }}
                      />
                    </View>
                  </View>

                  {/* Check In + Freeze Row */}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 16 }}>
                    <TouchableOpacity
                      onPress={() =>
                        handleCheckIn(
                          streakId,
                          goal.name,
                          streak,
                          goal.last_check_in,
                        )
                      }
                      disabled={checkedIn || isFrozen || !streakId}
                      style={{
                        flex: 1,
                        backgroundColor: checkedIn ? "#2a5a2a" : "#FF8C00",
                        paddingVertical: 14,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 8,
                        opacity: checkedIn || isFrozen || !streakId ? 0.6 : 1,
                      }}
                    >
                      {checkedIn && <CheckCircle color="#fff" size={18} />}
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 16,
                        }}
                      >
                        {checkedIn
                          ? "Checked In! ✓"
                          : isFrozen
                            ? "Frozen"
                            : "Check In Now"}
                      </Text>
                    </TouchableOpacity>
                    {!isFrozen && (
                      <TouchableOpacity
                        onPress={() =>
                          handleFreezeStreak(streakId, freezesAvailable)
                        }
                        disabled={!streakId}
                        style={{
                          backgroundColor: "#2a2a2a",
                          paddingHorizontal: 16,
                          paddingVertical: 14,
                          borderRadius: 12,
                          justifyContent: "center",
                          alignItems: "center",
                          opacity: !streakId ? 0.6 : 1,
                        }}
                      >
                        <Snowflake color="#4FC3F7" size={20} />
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Challenge + Share Row */}
                  <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
                    <TouchableOpacity
                      onPress={() =>
                        handleChallengeFromGoal(goal.id, goal.name)
                      }
                      style={{
                        flex: 1,
                        backgroundColor: "#2a2a2a",
                        paddingVertical: 12,
                        borderRadius: 12,
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "center",
                        gap: 6,
                      }}
                    >
                      <Swords color="#FF8C00" size={16} />
                      <Text
                        style={{
                          color: "#FF8C00",
                          fontWeight: "bold",
                          fontSize: 13,
                        }}
                      >
                        Challenge Friend
                      </Text>
                    </TouchableOpacity>
                    {streak > 0 && (
                      <TouchableOpacity
                        onPress={() => handleShareProgress(goal.name, streak)}
                        style={{
                          backgroundColor: "#2a2a2a",
                          paddingHorizontal: 16,
                          paddingVertical: 12,
                          borderRadius: 12,
                          flexDirection: "row",
                          alignItems: "center",
                          justifyContent: "center",
                          gap: 6,
                        }}
                      >
                        <Share2 color="#888" size={16} />
                        <Text
                          style={{
                            color: "#888",
                            fontWeight: "600",
                            fontSize: 13,
                          }}
                        >
                          Share
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>
              );
            })}
          </>
        )}
      </ScrollView>

      {/* Streak Break Modal */}
      <Modal
        visible={streakBreakVisible}
        transparent
        onRequestClose={() => setStreakBreakVisible(false)}
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(180,30,30,0.85)",
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
          }}
        >
          <View
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 24,
              padding: 32,
              width: "100%",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#FF3B30",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#FF3B3020",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 40 }}>💔</Text>
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#FF3B30",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Streak Broken!
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#ccc",
                textAlign: "center",
                marginBottom: 8,
                lineHeight: 22,
              }}
            >
              Your {brokenStreakData?.daysLost || 0}-day streak has ended.
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#888",
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 20,
              }}
            >
              Don't give up! Every champion falls. What matters is getting back
              up. Use freezes next time to protect your streak. 💪
            </Text>
            <TouchableOpacity
              onPress={() => setStreakBreakVisible(false)}
              style={{
                backgroundColor: "#FF8C00",
                paddingHorizontal: 32,
                paddingVertical: 14,
                borderRadius: 14,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Start Comeback Streak 🔥
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Milestone Modal */}
      <Modal
        visible={milestoneVisible}
        transparent
        onRequestClose={() => setMilestoneVisible(false)}
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.85)",
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
          }}
        >
          <View
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 24,
              padding: 32,
              width: "100%",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#FF8C00",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#FF8C0020",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 40 }}>🏆</Text>
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#FF8C00",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Milestone Reached!
            </Text>
            <Text
              style={{
                fontSize: 18,
                color: "#fff",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Day {milestoneData?.day || 0} of {milestoneData?.goalName || ""}
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#888",
                textAlign: "center",
                marginBottom: 24,
                lineHeight: 20,
              }}
            >
              {(milestoneData?.day || 0) >= 100
                ? "Triple digits! You're in the top tier! 🌟"
                : (milestoneData?.day || 0) >= 30
                  ? "A whole month! You're unstoppable! 🚀"
                  : "You're building real consistency! Keep going! 💪"}
            </Text>
            <TouchableOpacity
              onPress={handleShareMilestone}
              style={{
                backgroundColor: "#FF8C00",
                paddingHorizontal: 32,
                paddingVertical: 14,
                borderRadius: 14,
                width: "100%",
                alignItems: "center",
                flexDirection: "row",
                justifyContent: "center",
                gap: 8,
                marginBottom: 12,
              }}
            >
              <Share2 color="#fff" size={18} />
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}>
                Share This Win!
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setMilestoneVisible(false)}
              style={{ paddingVertical: 12 }}
            >
              <Text style={{ color: "#888", fontSize: 14 }}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Streak Saver Modal */}
      <Modal
        visible={streakSaverVisible}
        transparent
        onRequestClose={() => setStreakSaverVisible(false)}
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
          }}
        >
          <View
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 24,
              padding: 32,
              width: "100%",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#FF3B30",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#FF3B3020",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 40 }}>🚨</Text>
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#FF3B30",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Streaks at Risk!
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#ccc",
                textAlign: "center",
                marginBottom: 16,
                lineHeight: 22,
              }}
            >
              {atRiskStreaks.length === 1
                ? `Your ${atRiskStreaks[0].current_streak}-day "${atRiskStreaks[0].goal_name}" streak will break!`
                : `${atRiskStreaks.length} streaks are about to break!`}
            </Text>

            {atRiskStreaks.slice(0, 3).map((streak, idx) => (
              <View
                key={idx}
                style={{
                  backgroundColor: "#2a2a2a",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 8,
                  width: "100%",
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View style={{ flex: 1 }}>
                  <Text
                    style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                  >
                    {streak.goal_name}
                  </Text>
                  <Text style={{ color: "#FF8C00", fontSize: 14 }}>
                    🔥 {streak.current_streak} days
                  </Text>
                </View>
                {streak.freezes_available > 0 ? (
                  <TouchableOpacity
                    onPress={() =>
                      handleStreakSave(streak.streak_id, "use_freeze")
                    }
                    style={{
                      backgroundColor: "#4FC3F7",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 13,
                      }}
                    >
                      ❄️ Freeze
                    </Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    onPress={() => {
                      setStreakSaverVisible(false);
                      router.push("/paywall");
                    }}
                    style={{
                      backgroundColor: "#FF8C00",
                      paddingHorizontal: 16,
                      paddingVertical: 8,
                      borderRadius: 12,
                    }}
                  >
                    <Text
                      style={{
                        color: "#fff",
                        fontWeight: "bold",
                        fontSize: 13,
                      }}
                    >
                      Get Freezes
                    </Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}

            {!isSubscribed && (
              <TouchableOpacity
                onPress={() => {
                  setStreakSaverVisible(false);
                  router.push("/paywall");
                }}
                style={{
                  backgroundColor: "#FF8C00",
                  paddingHorizontal: 32,
                  paddingVertical: 14,
                  borderRadius: 14,
                  width: "100%",
                  alignItems: "center",
                  marginTop: 12,
                  flexDirection: "row",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Crown color="#fff" size={18} />
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Go Premium — Never Lose a Streak
                </Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              onPress={() => setStreakSaverVisible(false)}
              style={{ paddingVertical: 12, marginTop: 8 }}
            >
              <Text style={{ color: "#888", fontSize: 14 }}>
                Check In Instead
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Comeback Modal */}
      <Modal
        visible={comebackVisible}
        transparent
        onRequestClose={() => setComebackVisible(false)}
        animationType="fade"
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "rgba(0,0,0,0.9)",
            justifyContent: "center",
            alignItems: "center",
            padding: 30,
          }}
        >
          <View
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 24,
              padding: 32,
              width: "100%",
              alignItems: "center",
              borderWidth: 2,
              borderColor: "#4ADE80",
            }}
          >
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#4ADE8020",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 20,
              }}
            >
              <Text style={{ fontSize: 40 }}>
                {comebackData?.comebackTier === "legendary_return"
                  ? "🏆"
                  : comebackData?.comebackTier === "epic_return"
                    ? "👑"
                    : "💪"}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 24,
                fontWeight: "bold",
                color: "#4ADE80",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              {comebackData?.comebackMessage || "Welcome Back!"}
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#ccc",
                textAlign: "center",
                marginBottom: 8,
                lineHeight: 22,
              }}
            >
              It's been {comebackData?.daysInactive || 0} days since your last
              visit.
            </Text>

            {comebackData?.activeBattles?.length > 0 && (
              <View
                style={{
                  backgroundColor: "#2a2a2a",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    color: "#FF8C00",
                    fontWeight: "bold",
                    marginBottom: 4,
                  }}
                >
                  ⚔️ Your battles are still going!
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  {comebackData.activeBattles.length} active battle
                  {comebackData.activeBattles.length > 1 ? "s" : ""} waiting for
                  you
                </Text>
              </View>
            )}

            {comebackData?.friendActivity?.length > 0 && (
              <View
                style={{
                  backgroundColor: "#2a2a2a",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 12,
                  width: "100%",
                }}
              >
                <Text
                  style={{
                    color: "#4FC3F7",
                    fontWeight: "bold",
                    marginBottom: 4,
                  }}
                >
                  👥 While you were away...
                </Text>
                <Text style={{ color: "#888", fontSize: 14 }}>
                  {comebackData.friendActivity[0]?.display_name ||
                    comebackData.friendActivity[0]?.username}{" "}
                  and {comebackData.friendActivity.length - 1} others have been
                  active
                </Text>
              </View>
            )}

            {comebackData?.bonusXp > 0 && (
              <View
                style={{
                  backgroundColor: "#4ADE8020",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 16,
                  width: "100%",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ color: "#4ADE80", fontWeight: "bold", fontSize: 18 }}
                >
                  🎁 +{comebackData.bonusXp} Comeback XP
                </Text>
                <Text style={{ color: "#888", fontSize: 13, marginTop: 4 }}>
                  Claim your welcome back bonus!
                </Text>
              </View>
            )}

            <TouchableOpacity
              onPress={handleClaimComeback}
              style={{
                backgroundColor: "#4ADE80",
                paddingHorizontal: 32,
                paddingVertical: 14,
                borderRadius: 14,
                width: "100%",
                alignItems: "center",
              }}
            >
              <Text style={{ color: "#000", fontWeight: "bold", fontSize: 16 }}>
                Claim Bonus & Start Fresh 🔥
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setComebackVisible(false)}
              style={{ paddingVertical: 12, marginTop: 8 }}
            >
              <Text style={{ color: "#888", fontSize: 14 }}>Maybe Later</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
