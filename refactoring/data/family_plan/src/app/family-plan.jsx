import { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  ArrowLeft,
  Users,
  Crown,
  UserPlus,
  UserMinus,
  Search,
  Shield,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { Image } from "expo-image";
import api from "@/utils/api";
import useUser from "@/utils/auth/useUser";
import useInAppPurchase from "@/utils/useInAppPurchase";

export default function FamilyPlanScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { data: user } = useUser();
  const { isSubscribed } = useInAppPurchase();
  const [groupData, setGroupData] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [groupName, setGroupName] = useState("");

  useEffect(() => {
    loadGroupData();
  }, []);

  const loadGroupData = async () => {
    try {
      const data = await api.get("/family");
      setGroupData(data);
      setMembers(data.members || []);
    } catch (error) {
      console.error("Error loading family group:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGroup = async (type) => {
    if (!isSubscribed) {
      Alert.alert(
        "Premium Required",
        "You need a Premium subscription to create a family or team group.",
        [
          { text: "Cancel", style: "cancel" },
          { text: "Go Premium", onPress: () => router.push("/paywall") },
        ],
      );
      return;
    }

    try {
      await api.post("/family", {
        action: "create",
        groupName: groupName || (type === "family" ? "My Family" : "My Team"),
        groupType: type,
      });
      Alert.alert(
        "✅ Group Created!",
        "Now invite friends and family to join.",
      );
      loadGroupData();
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to create group");
    }
  };

  const handleSearchFriends = async () => {
    if (!searchQuery.trim()) return;
    setSearching(true);
    try {
      const data = await api.get(
        `/friends?type=suggestions&search=${encodeURIComponent(searchQuery)}`,
      );
      setSearchResults(data.suggestions || data.users || []);
    } catch (error) {
      console.error("Error searching:", error);
    } finally {
      setSearching(false);
    }
  };

  const handleInvite = async (inviteUserId) => {
    const groupId = groupData?.ownedGroup?.id;
    if (!groupId) return;

    try {
      await api.post("/family", { action: "invite", inviteUserId, groupId });
      Alert.alert("✅ Invited!", "They've been added to your group.");
      loadGroupData();
      setSearchQuery("");
      setSearchResults([]);
    } catch (error) {
      Alert.alert("Error", error.message || "Failed to invite");
    }
  };

  const handleRemoveMember = async (memberId) => {
    const groupId = groupData?.ownedGroup?.id;
    if (!groupId) return;

    Alert.alert(
      "Remove Member",
      "Are you sure you want to remove this person?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Remove",
          style: "destructive",
          onPress: async () => {
            try {
              await api.post("/family", {
                action: "remove",
                inviteUserId: memberId,
                groupId,
              });
              loadGroupData();
            } catch (error) {
              Alert.alert("Error", error.message || "Failed to remove");
            }
          },
        },
      ],
    );
  };

  const handleLeaveGroup = async () => {
    const groupId = groupData?.memberGroup?.id;
    if (!groupId) return;

    Alert.alert("Leave Group", "Are you sure you want to leave this group?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Leave",
        style: "destructive",
        onPress: async () => {
          try {
            await api.post("/family", { action: "leave", groupId });
            loadGroupData();
          } catch (error) {
            Alert.alert("Error", error.message || "Failed to leave");
          }
        },
      },
    ]);
  };

  if (loading) {
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

  const hasGroup = groupData?.hasGroup;
  const ownedGroup = groupData?.ownedGroup;
  const memberGroup = groupData?.memberGroup;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

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
            Family & Teams
          </Text>
          <Text style={{ fontSize: 14, color: "#888", marginTop: 2 }}>
            Build habits together
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
        {!hasGroup ? (
          <>
            {/* Create Group CTA */}
            <View
              style={{
                backgroundColor: "#FF8C00",
                borderRadius: 20,
                padding: 24,
                marginBottom: 24,
                alignItems: "center",
              }}
            >
              <Users size={48} color="#fff" />
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "bold",
                  color: "#fff",
                  marginTop: 16,
                  textAlign: "center",
                }}
              >
                Better Together
              </Text>
              <Text
                style={{
                  fontSize: 15,
                  color: "#fff",
                  opacity: 0.9,
                  marginTop: 8,
                  textAlign: "center",
                  lineHeight: 22,
                }}
              >
                Create a family or team group and build habits together. Members
                share accountability and see each other's progress.
              </Text>
            </View>

            <TextInput
              value={groupName}
              onChangeText={setGroupName}
              placeholder="Group name (optional)"
              placeholderTextColor="#666"
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 12,
                padding: 16,
                color: "#fff",
                fontSize: 16,
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#2a2a2a",
              }}
            />

            <TouchableOpacity
              onPress={() => handleCreateGroup("family")}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 16,
                padding: 20,
                marginBottom: 12,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                borderWidth: 2,
                borderColor: "#FF8C00",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#FF8C0020",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Users size={24} color="#FF8C00" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}
                >
                  Family Plan
                </Text>
                <Text style={{ fontSize: 14, color: "#888", marginTop: 2 }}>
                  Up to 5 members
                </Text>
              </View>
              <Crown size={20} color="#FFD700" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleCreateGroup("team")}
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 16,
                padding: 20,
                marginBottom: 24,
                flexDirection: "row",
                alignItems: "center",
                gap: 16,
                borderWidth: 1,
                borderColor: "#2a2a2a",
              }}
            >
              <View
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 24,
                  backgroundColor: "#4FC3F720",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Shield size={24} color="#4FC3F7" />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{ fontSize: 18, fontWeight: "bold", color: "#fff" }}
                >
                  Team Plan
                </Text>
                <Text style={{ fontSize: 14, color: "#888", marginTop: 2 }}>
                  Up to 10 members
                </Text>
              </View>
              <Crown size={20} color="#FFD700" />
            </TouchableOpacity>

            {!isSubscribed && (
              <View
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: 12,
                  padding: 16,
                  borderLeftWidth: 3,
                  borderLeftColor: "#FF8C00",
                }}
              >
                <Text style={{ color: "#888", fontSize: 13, lineHeight: 18 }}>
                  ℹ️ Premium subscription required to create a group. Group
                  members don't need their own subscription.
                </Text>
              </View>
            )}
          </>
        ) : ownedGroup ? (
          <>
            {/* Group Management */}
            <View
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
                borderWidth: 2,
                borderColor: "#FF8C00",
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
                {ownedGroup.name}
              </Text>
              <Text style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
                {ownedGroup.group_type === "family" ? "👨‍👩‍👧‍👦" : "👥"}{" "}
                {ownedGroup.group_type} plan •{" "}
                {ownedGroup.member_count || members.length}/
                {ownedGroup.max_members} members
              </Text>
            </View>

            {/* Search & Invite */}
            <View style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}>
              <TextInput
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search users to invite..."
                placeholderTextColor="#666"
                onSubmitEditing={handleSearchFriends}
                style={{
                  flex: 1,
                  backgroundColor: "#1a1a1a",
                  borderRadius: 12,
                  padding: 14,
                  color: "#fff",
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: "#2a2a2a",
                }}
              />
              <TouchableOpacity
                onPress={handleSearchFriends}
                style={{
                  backgroundColor: "#FF8C00",
                  paddingHorizontal: 16,
                  borderRadius: 12,
                  justifyContent: "center",
                }}
              >
                <Search size={20} color="#fff" />
              </TouchableOpacity>
            </View>

            {searchResults.length > 0 && (
              <View style={{ marginBottom: 16 }}>
                {searchResults.map((result) => (
                  <View
                    key={result.id}
                    style={{
                      backgroundColor: "#0a0a0a",
                      borderRadius: 12,
                      padding: 14,
                      marginBottom: 8,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 12,
                      }}
                    >
                      {result.avatar_url ? (
                        <Image
                          source={{ uri: result.avatar_url }}
                          style={{ width: 36, height: 36, borderRadius: 18 }}
                          contentFit="cover"
                        />
                      ) : (
                        <View
                          style={{
                            width: 36,
                            height: 36,
                            borderRadius: 18,
                            backgroundColor: "#FF8C00",
                            alignItems: "center",
                            justifyContent: "center",
                          }}
                        >
                          <Text style={{ color: "#fff", fontWeight: "bold" }}>
                            {(result.display_name ||
                              result.username ||
                              "?")[0].toUpperCase()}
                          </Text>
                        </View>
                      )}
                      <Text style={{ color: "#fff", fontWeight: "600" }}>
                        {result.display_name || result.username}
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleInvite(result.id)}
                      style={{
                        backgroundColor: "#4ADE80",
                        paddingHorizontal: 14,
                        paddingVertical: 6,
                        borderRadius: 8,
                      }}
                    >
                      <UserPlus size={16} color="#000" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}

            {/* Members List */}
            <Text
              style={{
                fontSize: 18,
                fontWeight: "bold",
                color: "#fff",
                marginBottom: 12,
              }}
            >
              Members
            </Text>
            {members.map((member) => (
              <View
                key={member.id}
                style={{
                  backgroundColor: "#1a1a1a",
                  borderRadius: 12,
                  padding: 14,
                  marginBottom: 8,
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  {member.avatar_url ? (
                    <Image
                      source={{ uri: member.avatar_url }}
                      style={{ width: 40, height: 40, borderRadius: 20 }}
                      contentFit="cover"
                    />
                  ) : (
                    <View
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                        backgroundColor: "#FF8C00",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text style={{ color: "#fff", fontWeight: "bold" }}>
                        {(member.display_name ||
                          member.username ||
                          "?")[0].toUpperCase()}
                      </Text>
                    </View>
                  )}
                  <View>
                    <Text style={{ color: "#fff", fontWeight: "600" }}>
                      {member.display_name || member.username}
                    </Text>
                    <Text style={{ color: "#888", fontSize: 12 }}>
                      Level {member.level_number || 1} • {member.xp_points || 0}{" "}
                      XP
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => handleRemoveMember(member.user_id)}
                  style={{ padding: 8 }}
                >
                  <UserMinus size={18} color="#FF3B30" />
                </TouchableOpacity>
              </View>
            ))}

            {members.length === 0 && (
              <Text
                style={{ color: "#666", textAlign: "center", marginTop: 20 }}
              >
                No members yet. Search above to invite people!
              </Text>
            )}
          </>
        ) : memberGroup ? (
          <>
            {/* Member View */}
            <View
              style={{
                backgroundColor: "#1a1a1a",
                borderRadius: 16,
                padding: 20,
                marginBottom: 16,
              }}
            >
              <Text style={{ fontSize: 20, fontWeight: "bold", color: "#fff" }}>
                {memberGroup.name}
              </Text>
              <Text style={{ fontSize: 14, color: "#888", marginTop: 4 }}>
                Created by {memberGroup.owner_name} • {memberGroup.member_count}{" "}
                members
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleLeaveGroup}
              style={{
                backgroundColor: "#FF3B3020",
                borderRadius: 12,
                padding: 14,
                alignItems: "center",
                borderWidth: 1,
                borderColor: "#FF3B30",
              }}
            >
              <Text style={{ color: "#FF3B30", fontWeight: "bold" }}>
                Leave Group
              </Text>
            </TouchableOpacity>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
