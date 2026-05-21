import { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Share,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Gift,
  Users,
  Copy,
  Share2,
  Trophy,
  Award,
  Star,
  Crown,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import * as Clipboard from "expo-clipboard";
import useUser from "@/utils/auth/useUser";
import api from "@/utils/api";

export default function ReferralScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user, loading: userLoading } = useUser();
  const [referralCode, setReferralCode] = useState("");
  const [referralStats, setReferralStats] = useState({
    totalReferrals: 0,
    pendingRewards: 0,
    claimedRewards: 0,
  });
  const [rewards, setRewards] = useState([]);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [claiming, setClaiming] = useState(false);

  const rewardIcons = {
    "Community Builder": Award,
    Motivator: Star,
    Ambassador: Trophy,
    Legend: Crown,
    Grandmaster: Crown,
  };

  const rewardColors = {
    "Community Builder": "#4FC3F7",
    Motivator: "#FFA726",
    Ambassador: "#AB47BC",
    Legend: "#FFD700",
    Grandmaster: "#E040FB",
  };

  useEffect(() => {
    if (!userLoading && user) {
      fetchReferralData();
    } else if (!userLoading && !user) {
      setLoading(false);
    }
  }, [userLoading, user]);

  const fetchReferralData = async () => {
    if (!user) return;

    try {
      // Fetch from new rewards endpoint
      const rewardsData = await api.get("/referrals/rewards");
      setReferralCode(rewardsData.referralCode || "");
      setReferralStats({
        totalReferrals: rewardsData.totalReferrals || 0,
        pendingRewards:
          rewardsData.rewards?.filter((r) => r.canClaim).length || 0,
        claimedRewards:
          rewardsData.rewards?.filter((r) => r.claimed).length || 0,
      });
      setRewards(rewardsData.rewards || []);
    } catch (error) {
      console.error("Error fetching referral data:", error);
      // Fallback to old endpoint
      try {
        const data = await api.get(`/users?userId=${user.id}`);
        setReferralCode(data.user?.referral_code || "");
        setReferralStats({
          totalReferrals: data.user?.total_referrals || 0,
          pendingRewards: 0,
          claimedRewards: 0,
        });
      } catch (e) {
        console.error("Fallback error:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    await Clipboard.setStringAsync(referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `I'm building unbreakable streaks on LastUp! Join me and let's stay accountable together. Use code ${referralCode} when you sign up! 🔥`,
        title: "Join me on LastUp",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const handleClaimReward = async (threshold) => {
    if (claiming) return;
    setClaiming(true);
    try {
      const result = await api.post("/referrals/rewards", { threshold });
      if (result.success) {
        const msg =
          result.freezesAwarded > 0
            ? `You earned the "${result.reward.name}" badge + ${result.freezesAwarded} freezes + ${result.xpEarned} XP! 🎉`
            : `You earned the "${result.reward.name}" badge + ${result.xpEarned} XP! 🎉`;
        Alert.alert("🏆 Reward Claimed!", msg);
        fetchReferralData();
      }
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to claim reward");
    } finally {
      setClaiming(false);
    }
  };

  if (userLoading || loading) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <ActivityIndicator size="large" color="#FF8C00" />
      </View>
    );
  }

  if (!user) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 20,
        }}
      >
        <Text
          style={{
            color: "#fff",
            fontSize: 18,
            textAlign: "center",
            marginBottom: 20,
          }}
        >
          Please log in to access referral program
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{
            backgroundColor: "#FF8C00",
            paddingHorizontal: 24,
            paddingVertical: 12,
            borderRadius: 12,
          }}
        >
          <Text style={{ color: "#fff", fontWeight: "600" }}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

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
            Share & Earn Badges
          </Text>
          <Text style={{ fontSize: 14, color: "#888", marginTop: 2 }}>
            Unlock exclusive cosmetic profile rewards
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
      >
        {/* Hero Section */}
        <View
          style={{
            backgroundColor: "#FF8C00",
            borderRadius: 20,
            padding: 24,
            marginBottom: 24,
            shadowColor: "#FF8C00",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.4,
            shadowRadius: 12,
            elevation: 8,
          }}
        >
          <View style={{ alignItems: "center", marginBottom: 20 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#fff",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <Gift color="#FF8C00" size={40} />
            </View>
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#fff",
                textAlign: "center",
                marginBottom: 8,
              }}
            >
              Build Your Community
            </Text>
            <Text
              style={{
                fontSize: 16,
                color: "#fff",
                textAlign: "center",
                opacity: 0.95,
              }}
            >
              Invite friends and unlock exclusive{"\n"}cosmetic profile badges &
              titles!
            </Text>
          </View>

          {/* Referral Code */}
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              padding: 20,
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#888",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              Your Referral Code
            </Text>
            <Text
              style={{
                fontSize: 32,
                fontWeight: "bold",
                color: "#FF8C00",
                textAlign: "center",
                letterSpacing: 2,
                marginBottom: 16,
              }}
            >
              {referralCode}
            </Text>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity
                onPress={handleCopyCode}
                style={{
                  flex: 1,
                  backgroundColor: copied ? "#4CAF50" : "#FF8C00",
                  paddingVertical: 12,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Copy color="#fff" size={18} />
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  {copied ? "Copied!" : "Copy Code"}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleShare}
                style={{
                  flex: 1,
                  backgroundColor: "#1a1a1a",
                  paddingVertical: 12,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                <Share2 color="#fff" size={18} />
                <Text
                  style={{ color: "#fff", fontWeight: "bold", fontSize: 16 }}
                >
                  Share
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/* Stats */}
        <View style={{ flexDirection: "row", gap: 12, marginBottom: 24 }}>
          <View
            style={{
              flex: 1,
              backgroundColor: "#1a1a1a",
              borderRadius: 16,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Users color="#FF8C00" size={32} />
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#fff",
                marginTop: 12,
              }}
            >
              {referralStats.totalReferrals}
            </Text>
            <Text style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
              Friends Joined
            </Text>
          </View>
          <View
            style={{
              flex: 1,
              backgroundColor: "#1a1a1a",
              borderRadius: 16,
              padding: 20,
              alignItems: "center",
            }}
          >
            <Trophy color="#FFD700" size={32} />
            <Text
              style={{
                fontSize: 28,
                fontWeight: "bold",
                color: "#fff",
                marginTop: 12,
              }}
            >
              {referralStats.claimedRewards}
            </Text>
            <Text style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
              Rewards Claimed
            </Text>
          </View>
        </View>

        {/* Rewards Ladder */}
        <View>
          <Text
            style={{
              fontSize: 20,
              fontWeight: "bold",
              color: "#fff",
              marginBottom: 8,
            }}
          >
            Unlock Rewards
          </Text>
          <Text style={{ fontSize: 14, color: "#888", marginBottom: 16 }}>
            Earn badges, freezes, and XP by inviting friends
          </Text>
          {rewards.map((item, index) => {
            const IconComponent = rewardIcons[item.name] || Award;
            const itemColor = rewardColors[item.name] || "#FF8C00";
            return (
              <View
                key={index}
                style={{
                  backgroundColor: item.unlocked ? "#1a1a1a" : "#0a0a0a",
                  borderRadius: 16,
                  padding: 20,
                  marginBottom: 12,
                  borderWidth: 2,
                  borderColor: item.unlocked ? itemColor : "#2a2a2a",
                  opacity: item.unlocked ? 1 : 0.6,
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
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      flex: 1,
                      gap: 12,
                    }}
                  >
                    <IconComponent
                      color={item.unlocked ? itemColor : "#666"}
                      size={32}
                    />
                    <View style={{ flex: 1 }}>
                      <Text
                        style={{
                          fontSize: 18,
                          fontWeight: "bold",
                          color: "#fff",
                          marginBottom: 4,
                        }}
                      >
                        {item.emoji} {item.name}
                      </Text>
                      <Text style={{ fontSize: 14, color: "#888" }}>
                        {item.threshold}{" "}
                        {item.threshold === 1 ? "friend" : "friends"}
                        {item.freezes > 0 && ` • ❄️ +${item.freezes} freezes`}
                      </Text>
                    </View>
                  </View>
                  {item.claimed ? (
                    <View
                      style={{
                        backgroundColor: itemColor,
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#fff",
                          fontWeight: "bold",
                          fontSize: 12,
                        }}
                      >
                        ✓ CLAIMED
                      </Text>
                    </View>
                  ) : item.canClaim ? (
                    <TouchableOpacity
                      onPress={() => handleClaimReward(item.threshold)}
                      disabled={claiming}
                      style={{
                        backgroundColor: "#4ADE80",
                        paddingHorizontal: 14,
                        paddingVertical: 8,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#000",
                          fontWeight: "bold",
                          fontSize: 13,
                        }}
                      >
                        Claim! 🎁
                      </Text>
                    </TouchableOpacity>
                  ) : (
                    <View
                      style={{
                        backgroundColor: "#2a2a2a",
                        paddingHorizontal: 12,
                        paddingVertical: 6,
                        borderRadius: 12,
                      }}
                    >
                      <Text
                        style={{
                          color: "#666",
                          fontWeight: "bold",
                          fontSize: 12,
                        }}
                      >
                        {item.threshold - referralStats.totalReferrals} more
                      </Text>
                    </View>
                  )}
                </View>
                <View style={{ marginTop: 12 }}>
                  <View
                    style={{
                      height: 6,
                      backgroundColor: "#2a2a2a",
                      borderRadius: 3,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        width: item.unlocked
                          ? "100%"
                          : `${Math.min((referralStats.totalReferrals / item.threshold) * 100, 100)}%`,
                        height: "100%",
                        backgroundColor: item.unlocked ? itemColor : "#FF8C00",
                      }}
                    />
                  </View>
                </View>
              </View>
            );
          })}
        </View>

        {/* How it Works */}
        <View
          style={{
            backgroundColor: "#1a1a1a",
            borderRadius: 16,
            padding: 20,
            marginTop: 24,
          }}
        >
          <Text
            style={{
              fontSize: 18,
              fontWeight: "bold",
              color: "#fff",
              marginBottom: 16,
            }}
          >
            How It Works
          </Text>
          <View style={{ gap: 12 }}>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ fontSize: 20 }}>1️⃣</Text>
              <Text style={{ flex: 1, fontSize: 15, color: "#ddd" }}>
                Share your progress and invite friends to join your journey
                (completely optional)
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ fontSize: 20 }}>2️⃣</Text>
              <Text style={{ flex: 1, fontSize: 15, color: "#ddd" }}>
                Friends use your code when creating their account
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <Text style={{ fontSize: 20 }}>3️⃣</Text>
              <Text style={{ flex: 1, fontSize: 15, color: "#ddd" }}>
                Unlock exclusive cosmetic profile badges and show off your
                community leadership! (Cosmetic only - no freezes, premium
                features, or functional items. All core app features work
                without referrals.)
              </Text>
            </View>
          </View>

          <View
            style={{
              marginTop: 16,
              padding: 12,
              backgroundColor: "#2a2a2a",
              borderRadius: 8,
              borderLeftWidth: 3,
              borderLeftColor: "#4CAF50",
            }}
          >
            <Text style={{ fontSize: 13, color: "#aaa", lineHeight: 18 }}>
              ℹ️ Note: Referrals are completely optional. All app features
              (streak tracking, battles, leaderboards, etc.) work fully without
              referring anyone. Rewards are purely cosmetic profile decorations.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
