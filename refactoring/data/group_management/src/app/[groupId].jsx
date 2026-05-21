import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
  Animated,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  Send,
  SmilePlus,
  Reply,
  BookOpen,
  X,
  Users,
} from "lucide-react-native";
import { format, isToday, isYesterday } from "date-fns";
import * as Haptics from "expo-haptics";

const AVATARS = {
  dove: "🕊️",
  lamb: "🐑",
  fish: "🐟",
  flame: "🔥",
  star: "⭐",
  tree: "🌳",
  mountain: "⛰️",
  sunrise: "🌅",
  heart: "❤️",
  candle: "🕯️",
  book: "📖",
  cross: "✝️",
};

const QUICK_EMOJIS = ["🙏", "❤️", "💡", "🔥", "✝️", "🙌"];

export default function GroupConversation() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { groupId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const scrollRef = useRef(null);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState("");
  const [showEmojiFor, setShowEmojiFor] = useState(null);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ["group-conversation", groupId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/conversation`);
      if (!res.ok) throw new Error("Failed to load conversation");
      return res.json();
    },
    refetchInterval: 15000,
  });

  const reactionMutation = useMutation({
    mutationFn: async ({ responseId, emoji }) => {
      const res = await fetch(
        `/api/groups/${groupId}/responses/${responseId}/react`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ emoji }),
        },
      );
      if (!res.ok) throw new Error("Failed to react");
      return res.json();
    },
    onSuccess: () => {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      queryClient.invalidateQueries({
        queryKey: ["group-conversation", groupId],
      });
      setShowEmojiFor(null);
    },
  });

  const replyMutation = useMutation({
    mutationFn: async ({ responseId, text }) => {
      const res = await fetch(
        `/api/groups/${groupId}/responses/${responseId}/reply`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ replyText: text }),
        },
      );
      if (!res.ok) throw new Error("Failed to reply");
      return res.json();
    },
    onSuccess: () => {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      queryClient.invalidateQueries({
        queryKey: ["group-conversation", groupId],
      });
      setReplyingTo(null);
      setReplyText("");
    },
  });

  useEffect(() => {
    if (data?.responses?.length > 0) {
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: false });
      }, 300);
    }
  }, [data?.responses?.length]);

  const currentUserId = data?.currentUserId;
  const responses = data?.responses || [];
  const groupInfo = data?.group || {};

  // Group messages by date
  const messagesByDate = [];
  let lastDate = null;
  for (const msg of responses) {
    const msgDate = new Date(msg.created_at);
    const dateKey = format(msgDate, "yyyy-MM-dd");
    if (dateKey !== lastDate) {
      messagesByDate.push({ type: "date", date: msgDate, key: dateKey });
      lastDate = dateKey;
    }
    messagesByDate.push({ type: "message", ...msg, key: msg.id });
  }

  const formatDateLabel = (date) => {
    if (isToday(date)) return "Today";
    if (isYesterday(date)) return "Yesterday";
    return format(date, "EEEE, MMM d");
  };

  if (isLoading) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#F8FAFC",
        }}
      >
        <ActivityIndicator size="large" color="#0F172A" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#F0F2F5" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
      keyboardVerticalOffset={0}
    >
      <StatusBar style="dark" />

      {/* Header */}
      <View
        style={{
          paddingTop: insets.top,
          backgroundColor: "#FFFFFF",
          borderBottomWidth: 1,
          borderBottomColor: "#E2E8F0",
        }}
      >
        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            paddingHorizontal: 16,
            paddingVertical: 12,
            gap: 12,
          }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={22} color="#0F172A" strokeWidth={1.5} />
          </TouchableOpacity>
          <View
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor: "#0F172A",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Users size={16} color="#FFFFFF" strokeWidth={1.5} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{ fontSize: 16, fontWeight: "600", color: "#020617" }}
              numberOfLines={1}
            >
              {groupInfo.name || "Group"}
            </Text>
            {groupInfo.module_title && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <BookOpen size={10} color="#64748B" strokeWidth={1.5} />
                <Text
                  style={{ fontSize: 11, color: "#64748B" }}
                  numberOfLines={1}
                >
                  {groupInfo.module_title}
                </Text>
              </View>
            )}
          </View>
        </View>
      </View>

      {/* Messages */}
      <ScrollView
        ref={scrollRef}
        style={{ flex: 1 }}
        contentContainerStyle={{
          paddingHorizontal: 12,
          paddingTop: 12,
          paddingBottom: 12,
        }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl
            refreshing={false}
            onRefresh={refetch}
            tintColor="#0F172A"
          />
        }
      >
        {responses.length === 0 ? (
          <View
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
              paddingVertical: 80,
              paddingHorizontal: 24,
            }}
          >
            <Users
              size={48}
              color="#CBD5E1"
              strokeWidth={1}
              style={{ marginBottom: 16 }}
            />
            <Text
              style={{
                fontSize: 18,
                fontWeight: "500",
                color: "#64748B",
                marginBottom: 8,
                textAlign: "center",
              }}
            >
              No responses yet
            </Text>
            <Text
              style={{
                fontSize: 14,
                color: "#94A3B8",
                textAlign: "center",
                lineHeight: 21,
              }}
            >
              When group members respond to journal prompts, their reflections
              will appear here as a conversation.
            </Text>
          </View>
        ) : (
          messagesByDate.map((item) => {
            if (item.type === "date") {
              return (
                <View
                  key={item.key}
                  style={{
                    alignItems: "center",
                    marginVertical: 16,
                  }}
                >
                  <View
                    style={{
                      backgroundColor: "#E2E8F0",
                      borderRadius: 12,
                      paddingHorizontal: 12,
                      paddingVertical: 4,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        fontWeight: "500",
                        color: "#64748B",
                      }}
                    >
                      {formatDateLabel(item.date)}
                    </Text>
                  </View>
                </View>
              );
            }

            const isMe = item.user_id === currentUserId;
            const displayName = item.first_name || item.user_name || "User";
            const avatarEmoji = AVATARS[item.avatar];
            const reactions = item.reactions || [];
            const replies = item.replies || [];

            // Group reactions by emoji
            const emojiGroups = {};
            for (const r of reactions) {
              if (!emojiGroups[r.emoji]) {
                emojiGroups[r.emoji] = {
                  emoji: r.emoji,
                  users: [],
                  hasMe: false,
                };
              }
              emojiGroups[r.emoji].users.push(r.user_name);
              if (r.user_id === currentUserId) {
                emojiGroups[r.emoji].hasMe = true;
              }
            }

            return (
              <View key={item.key} style={{ marginBottom: 16 }}>
                {/* Message bubble */}
                <View
                  style={{
                    flexDirection: isMe ? "row-reverse" : "row",
                    alignItems: "flex-end",
                    gap: 8,
                  }}
                >
                  {/* Avatar */}
                  {!isMe && (
                    <View
                      style={{
                        width: 32,
                        height: 32,
                        borderRadius: 16,
                        backgroundColor: avatarEmoji ? "#F1F5F9" : "#0F172A",
                        alignItems: "center",
                        justifyContent: "center",
                        marginBottom: 2,
                      }}
                    >
                      {avatarEmoji ? (
                        <Text style={{ fontSize: 16 }}>{avatarEmoji}</Text>
                      ) : (
                        <Text
                          style={{
                            fontSize: 12,
                            fontWeight: "600",
                            color: "#FFFFFF",
                          }}
                        >
                          {displayName[0]?.toUpperCase() || "?"}
                        </Text>
                      )}
                    </View>
                  )}

                  <View
                    style={{
                      maxWidth: "78%",
                      flex: 1,
                    }}
                  >
                    {/* Name + time */}
                    {!isMe && (
                      <Text
                        style={{
                          fontSize: 12,
                          fontWeight: "600",
                          color: "#475569",
                          marginBottom: 3,
                          marginLeft: 4,
                        }}
                      >
                        {displayName}
                      </Text>
                    )}

                    {/* Scripture context tag */}
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                        marginBottom: 4,
                        alignSelf: isMe ? "flex-end" : "flex-start",
                        marginHorizontal: 4,
                      }}
                    >
                      <BookOpen size={10} color="#94A3B8" strokeWidth={1.5} />
                      <Text style={{ fontSize: 10, color: "#94A3B8" }}>
                        Week {item.week_number}, Day {item.day_number} ·{" "}
                        {item.scripture_reference}
                      </Text>
                    </View>

                    {/* Bubble */}
                    <View
                      style={{
                        backgroundColor: isMe ? "#0F172A" : "#FFFFFF",
                        borderRadius: 16,
                        borderBottomRightRadius: isMe ? 4 : 16,
                        borderBottomLeftRadius: isMe ? 16 : 4,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        shadowColor: "#000",
                        shadowOffset: { width: 0, height: 1 },
                        shadowOpacity: 0.04,
                        shadowRadius: 3,
                        elevation: 1,
                      }}
                    >
                      {/* Reflection question */}
                      <Text
                        style={{
                          fontSize: 11,
                          fontStyle: "italic",
                          color: isMe ? "rgba(255,255,255,0.5)" : "#94A3B8",
                          marginBottom: 6,
                          lineHeight: 15,
                        }}
                      >
                        {item.reflection_question}
                      </Text>

                      {/* Response text */}
                      <Text
                        style={{
                          fontSize: 15,
                          lineHeight: 22,
                          color: isMe ? "#FFFFFF" : "#020617",
                        }}
                      >
                        {item.response_text}
                      </Text>

                      {/* Timestamp */}
                      <Text
                        style={{
                          fontSize: 10,
                          color: isMe ? "rgba(255,255,255,0.4)" : "#94A3B8",
                          alignSelf: "flex-end",
                          marginTop: 4,
                        }}
                      >
                        {format(new Date(item.created_at), "h:mm a")}
                      </Text>
                    </View>

                    {/* Reactions row */}
                    {Object.keys(emojiGroups).length > 0 && (
                      <View
                        style={{
                          flexDirection: "row",
                          flexWrap: "wrap",
                          gap: 4,
                          marginTop: 4,
                          marginHorizontal: 4,
                        }}
                      >
                        {Object.values(emojiGroups).map((eg) => (
                          <TouchableOpacity
                            key={eg.emoji}
                            onPress={() =>
                              reactionMutation.mutate({
                                responseId: item.id,
                                emoji: eg.emoji,
                              })
                            }
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 3,
                              backgroundColor: eg.hasMe ? "#EFF6FF" : "#F1F5F9",
                              borderWidth: eg.hasMe ? 1 : 0,
                              borderColor: "#BFDBFE",
                              borderRadius: 12,
                              paddingHorizontal: 8,
                              paddingVertical: 3,
                            }}
                          >
                            <Text style={{ fontSize: 13 }}>{eg.emoji}</Text>
                            {eg.users.length > 1 && (
                              <Text
                                style={{
                                  fontSize: 11,
                                  fontWeight: "500",
                                  color: "#64748B",
                                }}
                              >
                                {eg.users.length}
                              </Text>
                            )}
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Action buttons */}
                    <View
                      style={{
                        flexDirection: "row",
                        gap: 12,
                        marginTop: 4,
                        marginHorizontal: 4,
                      }}
                    >
                      <TouchableOpacity
                        onPress={() =>
                          setShowEmojiFor(
                            showEmojiFor === item.id ? null : item.id,
                          )
                        }
                        hitSlop={{
                          top: 8,
                          bottom: 8,
                          left: 8,
                          right: 8,
                        }}
                      >
                        <SmilePlus
                          size={14}
                          color="#94A3B8"
                          strokeWidth={1.5}
                        />
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setReplyingTo({
                            id: item.id,
                            name: displayName,
                            preview: item.response_text.substring(0, 50),
                          });
                          setShowEmojiFor(null);
                        }}
                        hitSlop={{
                          top: 8,
                          bottom: 8,
                          left: 8,
                          right: 8,
                        }}
                      >
                        <Reply size={14} color="#94A3B8" strokeWidth={1.5} />
                      </TouchableOpacity>
                    </View>

                    {/* Quick emoji picker */}
                    {showEmojiFor === item.id && (
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 4,
                          marginTop: 6,
                          marginHorizontal: 4,
                          backgroundColor: "#FFFFFF",
                          borderWidth: 1,
                          borderColor: "#E2E8F0",
                          borderRadius: 20,
                          paddingHorizontal: 8,
                          paddingVertical: 6,
                          alignSelf: "flex-start",
                          shadowColor: "#000",
                          shadowOffset: { width: 0, height: 2 },
                          shadowOpacity: 0.08,
                          shadowRadius: 8,
                          elevation: 3,
                        }}
                      >
                        {QUICK_EMOJIS.map((emoji) => (
                          <TouchableOpacity
                            key={emoji}
                            onPress={() =>
                              reactionMutation.mutate({
                                responseId: item.id,
                                emoji,
                              })
                            }
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 18,
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text style={{ fontSize: 20 }}>{emoji}</Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {/* Replies thread */}
                    {replies.length > 0 && (
                      <View
                        style={{
                          marginTop: 8,
                          marginLeft: 12,
                          borderLeftWidth: 2,
                          borderLeftColor: "#E2E8F0",
                          paddingLeft: 10,
                          gap: 6,
                        }}
                      >
                        {replies.map((rp) => {
                          const rpAvatarEmoji = AVATARS[rp.avatar];
                          const rpIsMe = rp.user_id === currentUserId;
                          return (
                            <View
                              key={rp.id}
                              style={{
                                flexDirection: "row",
                                gap: 8,
                                alignItems: "flex-start",
                              }}
                            >
                              <View
                                style={{
                                  width: 22,
                                  height: 22,
                                  borderRadius: 11,
                                  backgroundColor: rpAvatarEmoji
                                    ? "#F1F5F9"
                                    : "#64748B",
                                  alignItems: "center",
                                  justifyContent: "center",
                                }}
                              >
                                {rpAvatarEmoji ? (
                                  <Text style={{ fontSize: 10 }}>
                                    {rpAvatarEmoji}
                                  </Text>
                                ) : (
                                  <Text
                                    style={{
                                      fontSize: 8,
                                      fontWeight: "600",
                                      color: "#FFFFFF",
                                    }}
                                  >
                                    {rp.user_name?.[0]?.toUpperCase() || "?"}
                                  </Text>
                                )}
                              </View>
                              <View style={{ flex: 1 }}>
                                <View
                                  style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    gap: 6,
                                  }}
                                >
                                  <Text
                                    style={{
                                      fontSize: 12,
                                      fontWeight: "600",
                                      color: "#475569",
                                    }}
                                  >
                                    {rpIsMe ? "You" : rp.user_name}
                                  </Text>
                                  <Text
                                    style={{ fontSize: 10, color: "#94A3B8" }}
                                  >
                                    {format(new Date(rp.created_at), "h:mm a")}
                                  </Text>
                                </View>
                                <Text
                                  style={{
                                    fontSize: 13,
                                    lineHeight: 19,
                                    color: "#334155",
                                    marginTop: 1,
                                  }}
                                >
                                  {rp.reply_text}
                                </Text>
                              </View>
                            </View>
                          );
                        })}
                      </View>
                    )}
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Reply bar */}
      {replyingTo && (
        <View
          style={{
            backgroundColor: "#F8FAFC",
            borderTopWidth: 1,
            borderTopColor: "#E2E8F0",
            paddingHorizontal: 16,
            paddingVertical: 8,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 11, fontWeight: "600", color: "#0F172A" }}>
              Replying to {replyingTo.name}
            </Text>
            <Text style={{ fontSize: 11, color: "#94A3B8" }} numberOfLines={1}>
              {replyingTo.preview}...
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => {
              setReplyingTo(null);
              setReplyText("");
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <X size={16} color="#64748B" strokeWidth={1.5} />
          </TouchableOpacity>
        </View>
      )}

      {/* Input bar */}
      {replyingTo && (
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderTopWidth: replyingTo ? 0 : 1,
            borderTopColor: "#E2E8F0",
            paddingHorizontal: 12,
            paddingTop: 8,
            paddingBottom: insets.bottom + 8,
            flexDirection: "row",
            alignItems: "flex-end",
            gap: 8,
          }}
        >
          <TextInput
            value={replyText}
            onChangeText={setReplyText}
            placeholder="Write a reply..."
            placeholderTextColor="#94A3B8"
            multiline
            style={{
              flex: 1,
              backgroundColor: "#F1F5F9",
              borderRadius: 20,
              paddingHorizontal: 16,
              paddingTop: 10,
              paddingBottom: 10,
              fontSize: 15,
              color: "#020617",
              maxHeight: 100,
            }}
          />
          <TouchableOpacity
            onPress={() => {
              if (replyText.trim()) {
                replyMutation.mutate({
                  responseId: replyingTo.id,
                  text: replyText.trim(),
                });
              }
            }}
            disabled={!replyText.trim() || replyMutation.isPending}
            style={{
              width: 36,
              height: 36,
              borderRadius: 18,
              backgroundColor:
                replyText.trim() && !replyMutation.isPending
                  ? "#0F172A"
                  : "#E2E8F0",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 2,
            }}
          >
            <Send
              size={16}
              color={
                replyText.trim() && !replyMutation.isPending
                  ? "#FFFFFF"
                  : "#94A3B8"
              }
              strokeWidth={1.5}
            />
          </TouchableOpacity>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}
