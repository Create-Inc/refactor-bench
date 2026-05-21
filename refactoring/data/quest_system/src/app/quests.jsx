import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Target, Star, TrendingUp, Users, Zap, X } from "lucide-react-native";
import { useRouter } from "expo-router";
import api from "@/utils/api";
import useUser from "@/utils/auth/useUser";

export default function QuestsScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: currentUser } = useUser();
  const [quests, setQuests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isPersonalized, setIsPersonalized] = useState(false);

  useEffect(() => {
    loadQuests();
  }, []);

  const loadQuests = async () => {
    try {
      // Try personalized quests first
      const data = await api.get("/personalized-quests");
      setQuests(data.quests || []);
      setIsPersonalized(data.personalized || false);
    } catch (error) {
      console.error("Error loading personalized quests:", error);
      // Fallback to regular quests
      try {
        const fallback = await api.get("/quests");
        setQuests(fallback.quests || []);
      } catch (e) {
        console.error("Error loading fallback quests:", e);
      }
    } finally {
      setLoading(false);
    }
  };

  const getQuestIcon = (questType) => {
    if (questType.includes("checkin") || questType.includes("comeback"))
      return <Target size={32} color="#FF8C00" />;
    if (questType.includes("battle") || questType.includes("join"))
      return <Users size={32} color="#F59E0B" />;
    if (questType.includes("maintain") || questType.includes("streak"))
      return <TrendingUp size={32} color="#4ADE80" />;
    if (questType.includes("follow") || questType.includes("friend"))
      return <Users size={32} color="#4FC3F7" />;
    if (questType.includes("share")) return <Star size={32} color="#AB47BC" />;
    if (questType.includes("create") || questType.includes("goal"))
      return <Target size={32} color="#4ADE80" />;
    return <Star size={32} color="#8B5CF6" />;
  };

  const getQuestDescription = (quest) => {
    // Use server-provided description if available
    if (quest.description) return quest.description;

    const type = quest.quest_type;
    if (type.startsWith("checkin_"))
      return `Check in to ${quest.quest_target} of your goals today`;
    if (type === "join_battle") return "Join a battle and compete with others";
    if (type === "follow_friends")
      return "Follow a new friend to stay connected";
    if (type === "share_progress")
      return "Share your streak progress with friends";
    if (type === "create_goal") return "Create a new goal to track";
    if (type === "comeback_checkin")
      return `Complete ${quest.quest_target} check-ins today`;
    if (type.startsWith("maintain_") && type.endsWith("_streak"))
      return `Keep a streak going for ${quest.quest_target} days`;
    if (type.startsWith("maintain_") && type.endsWith("_streaks"))
      return `Maintain ${quest.quest_target} active streaks`;
    return "Complete this quest for bonus XP";
  };

  const renderQuestCard = (quest) => {
    const isCompleted = !!quest.completed_at;
    const progress = Math.min(
      (quest.quest_progress / quest.quest_target) * 100,
      100,
    );

    return (
      <View
        key={quest.id}
        style={{
          backgroundColor: isCompleted ? "#1A3A1A" : "#1A1A1A",
          borderRadius: 16,
          padding: 20,
          marginBottom: 16,
          borderWidth: 2,
          borderColor: isCompleted ? "#4ADE80" : "#2A2A2A",
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "flex-start" }}>
          <View style={{ flex: 1 }}>
            {getQuestIcon(quest.quest_type)}
            <Text
              style={{
                color: "#FFF",
                fontSize: 18,
                fontWeight: "bold",
                marginTop: 12,
                marginBottom: 6,
              }}
            >
              {getQuestDescription(quest)}
            </Text>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Zap size={16} color="#FFA500" />
              <Text
                style={{
                  color: "#FFA500",
                  fontSize: 16,
                  fontWeight: "600",
                  marginLeft: 6,
                }}
              >
                +{quest.xp_reward} XP
              </Text>
            </View>
          </View>

          {isCompleted && (
            <View
              style={{
                backgroundColor: "#4ADE80",
                paddingHorizontal: 12,
                paddingVertical: 6,
                borderRadius: 20,
              }}
            >
              <Text style={{ color: "#000", fontSize: 14, fontWeight: "600" }}>
                ✓ Complete
              </Text>
            </View>
          )}
        </View>

        {/* Progress Bar */}
        {!isCompleted && (
          <>
            <View
              style={{
                height: 8,
                backgroundColor: "#2A2A2A",
                borderRadius: 4,
                marginTop: 16,
                overflow: "hidden",
              }}
            >
              <View
                style={{
                  height: "100%",
                  width: `${progress}%`,
                  backgroundColor: "#FF8C00",
                  borderRadius: 4,
                }}
              />
            </View>
            <Text style={{ color: "#888", fontSize: 14, marginTop: 8 }}>
              Progress: {quest.quest_progress}/{quest.quest_target}
            </Text>
          </>
        )}
      </View>
    );
  };

  const completedCount = quests.filter((q) => q.completed_at).length;
  const totalXP = quests
    .filter((q) => q.completed_at)
    .reduce((sum, q) => sum + q.xp_reward, 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#000", paddingTop: insets.top }}>
      <StatusBar style="light" />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          alignItems: "center",
          justifyContent: "space-between",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
          <Star size={28} color="#FF8C00" />
          <Text
            style={{
              color: "#FFF",
              fontSize: 28,
              fontWeight: "bold",
              marginLeft: 12,
            }}
          >
            Daily Quests
          </Text>
          {isPersonalized && (
            <View
              style={{
                backgroundColor: "#4ADE8020",
                paddingHorizontal: 8,
                paddingVertical: 3,
                borderRadius: 8,
                marginLeft: 8,
                borderWidth: 1,
                borderColor: "#4ADE80",
              }}
            >
              <Text
                style={{ color: "#4ADE80", fontSize: 10, fontWeight: "bold" }}
              >
                FOR YOU
              </Text>
            </View>
          )}
        </View>
        <TouchableOpacity onPress={() => router.back()}>
          <X size={28} color="#888" />
        </TouchableOpacity>
      </View>

      {/* Stats Bar */}
      <View
        style={{
          flexDirection: "row",
          paddingHorizontal: 20,
          marginBottom: 20,
          gap: 12,
        }}
      >
        <View
          style={{
            flex: 1,
            backgroundColor: "#1A1A1A",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FF8C00", fontSize: 24, fontWeight: "bold" }}>
            {completedCount}/{quests.length}
          </Text>
          <Text style={{ color: "#888", fontSize: 14, marginTop: 4 }}>
            Completed
          </Text>
        </View>
        <View
          style={{
            flex: 1,
            backgroundColor: "#1A1A1A",
            borderRadius: 12,
            padding: 16,
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#FFA500", fontSize: 24, fontWeight: "bold" }}>
            {totalXP}
          </Text>
          <Text style={{ color: "#888", fontSize: 14, marginTop: 4 }}>
            XP Earned
          </Text>
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
        {loading ? (
          <ActivityIndicator
            size="large"
            color="#FF8C00"
            style={{ marginTop: 40 }}
          />
        ) : quests.length === 0 ? (
          <Text style={{ color: "#888", textAlign: "center", marginTop: 40 }}>
            No quests available today
          </Text>
        ) : (
          quests.map((quest) => renderQuestCard(quest))
        )}

        <View
          style={{
            backgroundColor: "#1A1A1A",
            borderRadius: 16,
            padding: 20,
            marginTop: 8,
          }}
        >
          <Text
            style={{
              color: "#FFF",
              fontSize: 16,
              fontWeight: "600",
              marginBottom: 8,
            }}
          >
            ⏰ New quests refresh daily
          </Text>
          <Text style={{ color: "#888", fontSize: 14 }}>
            Complete quests to earn bonus XP and level up faster!
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}
