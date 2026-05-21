import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Linking,
  Animated,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { useState, useMemo, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ArrowLeft,
  ChevronRight,
  ChevronDown,
  CheckCircle2,
  Lock,
  ExternalLink,
  BookOpen,
  Users,
  MessageSquare,
} from "lucide-react-native";
import { format } from "date-fns";
import KeyboardAvoidingAnimatedView from "@/components/KeyboardAvoidingAnimatedView";

const SHARED_INSTRUCTIONS = `Prayerfully read the passage of Scripture in your Bible, inviting God to speak to you through his Word. You may want to highlight, underline, or write notes in the margin of your Bible to make note of what you see, or thoughts you have. It's worthwhile to journal how you interact with God through his word. Then, write down your response to today's question.

This guide is rooted in your union with Jesus. You grow spiritually by resting in him, not performing for him. The Holy Spirit forms you. Being in relationship with other believers sustains you. Faithfulness is yours. Growth belongs to God.`;

export default function JourneyScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { assignmentId } = useLocalSearchParams();
  const queryClient = useQueryClient();
  const [responseText, setResponseText] = useState("");
  const [showInstructions, setShowInstructions] = useState(false);
  const [expandedWeek, setExpandedWeek] = useState(null);
  const [showGroupResponses, setShowGroupResponses] = useState(false);

  const { data: profile } = useQuery({
    queryKey: ["profile"],
    queryFn: async () => {
      const res = await fetch("/api/profile");
      if (!res.ok) throw new Error("Failed to load profile");
      return res.json();
    },
  });

  const bibleVersion = profile?.preferred_bible_translation || "ESV";

  const focusedPadding = 12;
  const paddingAnimation = useRef(
    new Animated.Value(insets.bottom + focusedPadding),
  ).current;

  const animateTo = (value) => {
    Animated.timing(paddingAnimation, {
      toValue: value,
      duration: 200,
      useNativeDriver: false,
    }).start();
  };

  const handleInputFocus = () => {
    if (Platform.OS === "web") return;
    animateTo(focusedPadding);
  };

  const handleInputBlur = () => {
    if (Platform.OS === "web") return;
    animateTo(insets.bottom + focusedPadding);
  };

  const { data, isLoading, error } = useQuery({
    queryKey: ["journey", assignmentId],
    queryFn: async () => {
      const res = await fetch(`/api/journey/${assignmentId}`);
      if (!res.ok) throw new Error("Journey not found");
      return res.json();
    },
  });

  const responseMutation = useMutation({
    mutationFn: async ({ dayId, text }) => {
      const res = await fetch("/api/responses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ assignmentId, dayId, responseText: text }),
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to submit response");
      }
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journey", assignmentId] });
      // Also refresh the group conversation so the response shows up as a chat bubble
      if (assignment?.group_id) {
        queryClient.invalidateQueries({
          queryKey: ["group-conversation", assignment.group_id],
        });
      }
      setResponseText("");
      setShowGroupResponses(true);
    },
  });

  const assignment = data?.assignment;
  const days = data?.days || [];
  const isGroupJourney = !!assignment?.group_id;

  const firstUnfinishedIndex = days.findIndex((d) => !d.response_text);
  const currentDayIndex =
    firstUnfinishedIndex === -1
      ? Math.max(days.length - 1, 0)
      : firstUnfinishedIndex;
  const currentDay = days[currentDayIndex] || null;
  const isModuleComplete = days.length > 0 && firstUnfinishedIndex === -1;

  const responsesCount = days.filter((d) => d.response_text).length;
  const progressPercent =
    days.length > 0 ? Math.round((responsesCount / days.length) * 100) : 0;

  const weekGroups = useMemo(() => {
    const groups = [];
    let currentWk = null;
    for (let i = 0; i < days.length; i++) {
      const day = days[i];
      if (!currentWk || currentWk.weekNumber !== day.week_number) {
        currentWk = {
          weekNumber: day.week_number,
          weekTitle: day.week_title || "Week " + day.week_number,
          weekPhase: day.week_phase,
          days: [],
          startIndex: i,
        };
        groups.push(currentWk);
      }
      currentWk.days.push({ ...day, globalIndex: i });
    }
    return groups;
  }, [days]);

  const currentWeekNumber = currentDay?.week_number;
  const activeExpandedWeek =
    expandedWeek !== null ? expandedWeek : currentWeekNumber;

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

  if (error || !assignment || days.length === 0) {
    return (
      <View
        style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: insets.top }}
      >
        <StatusBar style="dark" />
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            paddingHorizontal: 20,
          }}
        >
          <Text style={{ fontSize: 16, color: "#64748B", textAlign: "center" }}>
            {error ? error.message : "Journey not found."}
          </Text>
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              backgroundColor: "#0F172A",
              borderRadius: 6,
              paddingHorizontal: 16,
              paddingVertical: 10,
            }}
          >
            <Text style={{ fontSize: 14, fontWeight: "500", color: "#FFFFFF" }}>
              Back to Dashboard
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingAnimatedView
      style={{ flex: 1, backgroundColor: "#F8FAFC", paddingTop: insets.top }}
      behavior="padding"
    >
      <StatusBar style="dark" />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View
          style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 24 }}
        >
          <TouchableOpacity
            onPress={() => router.back()}
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 16,
            }}
          >
            <ArrowLeft size={16} color="#64748B" strokeWidth={1.5} />
            <Text style={{ fontSize: 14, color: "#64748B" }}>
              Back to Dashboard
            </Text>
          </TouchableOpacity>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 4,
            }}
          >
            <Text
              style={{
                fontSize: 28,
                fontWeight: "400",
                color: "#020617",
                letterSpacing: -0.5,
                flex: 1,
              }}
            >
              {assignment.title}
            </Text>
            {isGroupJourney && (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                  backgroundColor: "#EFF6FF",
                  borderWidth: 1,
                  borderColor: "#BFDBFE",
                  borderRadius: 12,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}
              >
                <Users size={12} color="#1E40AF" strokeWidth={1.5} />
                <Text
                  style={{ fontSize: 11, fontWeight: "500", color: "#1E40AF" }}
                >
                  Group
                </Text>
              </View>
            )}
          </View>

          {currentDay && (
            <Text style={{ fontSize: 16, color: "#64748B", marginBottom: 16 }}>
              Week {currentDay.week_number}: {currentDay.week_title || ""} — Day{" "}
              {currentDay.day_number}
            </Text>
          )}

          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <Text style={{ fontSize: 14, color: "#64748B" }}>
              Progress:{" "}
              <Text style={{ fontWeight: "500", color: "#020617" }}>
                {progressPercent}%
              </Text>
            </Text>
            <Text style={{ fontSize: 12, color: "#64748B" }}>
              {responsesCount} of {days.length} days
            </Text>
          </View>
          <View
            style={{
              height: 8,
              backgroundColor: "#F1F5F9",
              borderRadius: 4,
              overflow: "hidden",
              marginTop: 8,
            }}
          >
            <View
              style={{
                width: `${progressPercent}%`,
                height: "100%",
                backgroundColor: "#0F172A",
              }}
            />
          </View>
        </View>

        {/* Instructions */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          <TouchableOpacity
            onPress={() => setShowInstructions(!showInstructions)}
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              backgroundColor: "#F8FAFC",
              borderWidth: 1,
              borderColor: "#E2E8F0",
              borderRadius: 6,
              paddingHorizontal: 16,
              paddingVertical: 12,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <BookOpen size={16} color="#0F172A" strokeWidth={1.5} />
              <Text
                style={{ fontSize: 14, fontWeight: "500", color: "#0F172A" }}
              >
                How to Use This Guide
              </Text>
            </View>
            <ChevronDown
              size={16}
              color="#64748B"
              strokeWidth={1.5}
              style={{
                transform: [{ rotate: showInstructions ? "180deg" : "0deg" }],
              }}
            />
          </TouchableOpacity>
          {showInstructions && (
            <View
              style={{
                backgroundColor: "#FFFFFF",
                borderWidth: 1,
                borderColor: "#E2E8F0",
                borderRadius: 6,
                padding: 20,
                marginTop: 8,
              }}
            >
              <Text style={{ fontSize: 14, lineHeight: 22, color: "#475569" }}>
                {SHARED_INSTRUCTIONS}
              </Text>
            </View>
          )}
        </View>

        <View style={{ paddingHorizontal: 20 }}>
          {isModuleComplete ? (
            <View
              style={{
                backgroundColor: "#F0FDF4",
                borderWidth: 1,
                borderColor: "#065F46",
                borderRadius: 6,
                padding: 32,
                alignItems: "center",
              }}
            >
              <CheckCircle2
                size={40}
                color="#065F46"
                strokeWidth={1.5}
                style={{ marginBottom: 16 }}
              />
              <Text
                style={{
                  fontSize: 24,
                  fontWeight: "500",
                  color: "#065F46",
                  marginBottom: 8,
                }}
              >
                Journey Complete
              </Text>
              <Text
                style={{ fontSize: 16, color: "#475569", textAlign: "center" }}
              >
                You have completed {assignment.title}. Your responses are saved
                in your journal.
              </Text>
            </View>
          ) : (
            <View>
              {/* Today's Scripture */}
              <View style={{ marginBottom: 24 }}>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    marginBottom: 12,
                  }}
                >
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 12,
                        fontWeight: "500",
                        color: "#64748B",
                        textTransform: "uppercase",
                        letterSpacing: 1,
                        marginBottom: 4,
                      }}
                    >
                      Today's Scripture
                    </Text>
                    <Text
                      style={{
                        fontSize: 24,
                        fontWeight: "400",
                        color: "#020617",
                      }}
                    >
                      {currentDay?.scripture_reference}
                    </Text>
                  </View>
                  <TouchableOpacity
                    onPress={() => {
                      const url = `https://www.biblegateway.com/passage/?search=${encodeURIComponent(currentDay?.scripture_reference || "")}&version=${bibleVersion}`;
                      Linking.openURL(url);
                    }}
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "#FFFFFF",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      borderRadius: 6,
                      paddingHorizontal: 12,
                      paddingVertical: 8,
                    }}
                  >
                    <ExternalLink size={14} color="#0F172A" strokeWidth={1.5} />
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: "#0F172A",
                      }}
                    >
                      Read
                    </Text>
                  </TouchableOpacity>
                </View>

                <View
                  style={{
                    backgroundColor: "#F8FAFC",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 6,
                    padding: 20,
                  }}
                >
                  <Text
                    style={{ fontSize: 15, lineHeight: 24, color: "#475569" }}
                  >
                    {currentDay?.content}
                  </Text>
                </View>
              </View>

              {/* Reflection */}
              <View
                style={{
                  backgroundColor: "#FFFFFF",
                  borderWidth: 1,
                  borderColor: "#E2E8F0",
                  borderRadius: 6,
                  padding: 24,
                  marginBottom: 24,
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "500",
                    color: "#64748B",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 8,
                  }}
                >
                  Reflection
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    lineHeight: 27,
                    color: "#020617",
                    marginBottom: 20,
                  }}
                >
                  {currentDay?.reflection_question}
                </Text>

                <TextInput
                  value={responseText}
                  onChangeText={setResponseText}
                  placeholder="Write your response here... (minimum 25 characters)"
                  placeholderTextColor="#94A3B8"
                  multiline
                  numberOfLines={8}
                  textAlignVertical="top"
                  editable={!responseMutation.isPending}
                  onFocus={handleInputFocus}
                  onBlur={handleInputBlur}
                  style={{
                    minHeight: 180,
                    backgroundColor: "#FAFAFA",
                    borderWidth: 1,
                    borderColor: "#E2E8F0",
                    borderRadius: 6,
                    padding: 16,
                    fontSize: 16,
                    lineHeight: 24,
                    color: "#020617",
                    marginBottom: 12,
                  }}
                />

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    alignItems: "center",
                  }}
                >
                  <CharCount length={responseText.length} />
                  <TouchableOpacity
                    onPress={() =>
                      responseMutation.mutate({
                        dayId: currentDay.id,
                        text: responseText,
                      })
                    }
                    disabled={
                      responseMutation.isPending ||
                      responseText.length < 25 ||
                      responseText.length > 2000
                    }
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                      backgroundColor: "#0F172A",
                      borderRadius: 6,
                      paddingHorizontal: 20,
                      paddingVertical: 10,
                      opacity:
                        responseMutation.isPending ||
                        responseText.length < 25 ||
                        responseText.length > 2000
                          ? 0.4
                          : 1,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: "#FFFFFF",
                      }}
                    >
                      {responseMutation.isPending
                        ? "Saving..."
                        : "Submit Response"}
                    </Text>
                    {!responseMutation.isPending && (
                      <ChevronRight
                        size={16}
                        color="#FFFFFF"
                        strokeWidth={1.5}
                      />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              {isGroupJourney && currentDay?.response_text && (
                <GroupResponses
                  groupId={assignment.group_id}
                  dayId={currentDay.id}
                  showGroupResponses={showGroupResponses}
                  setShowGroupResponses={setShowGroupResponses}
                />
              )}
            </View>
          )}

          {/* Journey Timeline */}
          <View style={{ marginTop: 32 }}>
            <Text
              style={{
                fontSize: 12,
                fontWeight: "500",
                color: "#64748B",
                textTransform: "uppercase",
                letterSpacing: 1,
                marginBottom: 12,
              }}
            >
              Journey Timeline
            </Text>
            <View style={{ gap: 12 }}>
              {weekGroups.map((week) => {
                const isExpanded = activeExpandedWeek === week.weekNumber;
                const completedInWeek = week.days.filter(
                  (d) => d.response_text,
                ).length;
                const totalInWeek = week.days.length;
                const weekComplete = completedInWeek === totalInWeek;
                const isCurrentWeek = week.weekNumber === currentWeekNumber;

                return (
                  <View
                    key={week.weekNumber}
                    style={{
                      backgroundColor: "#FFFFFF",
                      borderWidth: 1,
                      borderColor: "#E2E8F0",
                      borderRadius: 6,
                      overflow: "hidden",
                    }}
                  >
                    <TouchableOpacity
                      onPress={() =>
                        setExpandedWeek(isExpanded ? null : week.weekNumber)
                      }
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                        backgroundColor: isCurrentWeek ? "#F1F5F9" : "#FFFFFF",
                        paddingHorizontal: 16,
                        paddingVertical: 12,
                      }}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                          flex: 1,
                        }}
                      >
                        {weekComplete ? (
                          <CheckCircle2
                            size={16}
                            color="#065F46"
                            strokeWidth={1.5}
                          />
                        ) : (
                          <View
                            style={{
                              width: 20,
                              height: 20,
                              borderRadius: 10,
                              backgroundColor: isCurrentWeek
                                ? "#0F172A"
                                : "#E2E8F0",
                              alignItems: "center",
                              justifyContent: "center",
                            }}
                          >
                            <Text
                              style={{
                                fontSize: 10,
                                fontWeight: "500",
                                color: isCurrentWeek ? "#FFFFFF" : "#64748B",
                              }}
                            >
                              {week.weekNumber}
                            </Text>
                          </View>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text
                            style={{
                              fontSize: 13,
                              fontWeight: "500",
                              color: "#020617",
                            }}
                          >
                            {week.weekTitle}
                          </Text>
                          {week.weekPhase && (
                            <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                              {week.weekPhase}
                            </Text>
                          )}
                        </View>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 8,
                        }}
                      >
                        <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                          {completedInWeek}/{totalInWeek}
                        </Text>
                        <ChevronDown
                          size={14}
                          color="#94A3B8"
                          style={{
                            transform: [
                              { rotate: isExpanded ? "180deg" : "0deg" },
                            ],
                          }}
                        />
                      </View>
                    </TouchableOpacity>

                    {isExpanded && (
                      <View
                        style={{
                          borderTopWidth: 1,
                          borderTopColor: "#E2E8F0",
                          backgroundColor: "#FFFFFF",
                          paddingHorizontal: 16,
                          paddingVertical: 8,
                        }}
                      >
                        {week.days.map((day) => (
                          <DayRow
                            key={day.id}
                            day={day}
                            currentDayIndex={currentDayIndex}
                          />
                        ))}
                      </View>
                    )}
                  </View>
                );
              })}
            </View>
          </View>
        </View>
        <Animated.View style={{ paddingBottom: paddingAnimation }} />
      </ScrollView>
    </KeyboardAvoidingAnimatedView>
  );
}

function GroupResponses({
  groupId,
  dayId,
  showGroupResponses,
  setShowGroupResponses,
}) {
  const { data: groupResponses, isLoading } = useQuery({
    queryKey: ["group-responses", groupId, dayId],
    queryFn: async () => {
      const res = await fetch(`/api/groups/${groupId}/responses/${dayId}`);
      if (!res.ok) throw new Error("Failed to load group responses");
      return res.json();
    },
    enabled: showGroupResponses,
  });

  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderWidth: 1,
        borderColor: "#E2E8F0",
        borderRadius: 6,
        overflow: "hidden",
        marginTop: 24,
      }}
    >
      <TouchableOpacity
        onPress={() => setShowGroupResponses(!showGroupResponses)}
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingVertical: 16,
        }}
      >
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          <MessageSquare size={16} color="#0F172A" strokeWidth={1.5} />
          <Text style={{ fontSize: 14, fontWeight: "500", color: "#0F172A" }}>
            Group Responses
          </Text>
        </View>
        <ChevronDown
          size={16}
          color="#64748B"
          strokeWidth={1.5}
          style={{
            transform: [{ rotate: showGroupResponses ? "180deg" : "0deg" }],
          }}
        />
      </TouchableOpacity>

      {showGroupResponses && (
        <View
          style={{
            borderTopWidth: 1,
            borderTopColor: "#E2E8F0",
            paddingHorizontal: 20,
            paddingVertical: 16,
            gap: 16,
          }}
        >
          {isLoading ? (
            <View style={{ paddingVertical: 16, alignItems: "center" }}>
              <ActivityIndicator size="small" color="#0F172A" />
            </View>
          ) : groupResponses?.length > 0 ? (
            groupResponses.map((response) => (
              <View
                key={response.id}
                style={{
                  backgroundColor: "#F8FAFC",
                  borderRadius: 6,
                  padding: 16,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <View
                      style={{
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: "#E2E8F0",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <Text
                        style={{
                          fontSize: 10,
                          fontWeight: "500",
                          color: "#64748B",
                        }}
                      >
                        {(response.first_name ||
                          response.user_name)?.[0]?.toUpperCase() || "?"}
                      </Text>
                    </View>
                    <Text
                      style={{
                        fontSize: 13,
                        fontWeight: "500",
                        color: "#020617",
                      }}
                    >
                      {response.first_name || response.user_name}
                    </Text>
                  </View>
                  <Text style={{ fontSize: 11, color: "#94A3B8" }}>
                    {response.created_at
                      ? format(new Date(response.created_at), "MMM d")
                      : ""}
                  </Text>
                </View>
                <Text
                  style={{ fontSize: 14, lineHeight: 21, color: "#475569" }}
                >
                  {response.response_text}
                </Text>
              </View>
            ))
          ) : (
            <Text
              style={{
                fontSize: 13,
                color: "#94A3B8",
                textAlign: "center",
                paddingVertical: 8,
              }}
            >
              No group members have responded to this day yet.
            </Text>
          )}
        </View>
      )}
    </View>
  );
}

function CharCount({ length }) {
  const isShort = length > 0 && length < 25;
  const colorClass = isShort ? "#991B1B" : "#64748B";
  return (
    <Text style={{ fontSize: 12, fontWeight: "500", color: colorClass }}>
      {length} / 2,000 characters
      {isShort && <Text> (25 minimum)</Text>}
    </Text>
  );
}

function DayRow({ day, currentDayIndex }) {
  const isLocked = day.globalIndex > currentDayIndex;
  const isCurrent = day.globalIndex === currentDayIndex;
  const isCompleted = !!day.response_text;

  let icon = null;
  if (isCompleted) {
    icon = <CheckCircle2 size={14} color="#065F46" strokeWidth={1.5} />;
  } else if (isLocked) {
    icon = <Lock size={14} color="#CBD5E1" strokeWidth={1.5} />;
  } else {
    icon = (
      <View
        style={{
          width: 16,
          height: 16,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: "#0F172A",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 6,
            height: 6,
            borderRadius: 3,
            backgroundColor: "#0F172A",
          }}
        />
      </View>
    );
  }

  const dateLabel = day.responded_at
    ? format(new Date(day.responded_at), "M/d")
    : null;

  return (
    <View
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
        backgroundColor: isCurrent ? "#F1F5F9" : "transparent",
        borderRadius: 4,
        paddingHorizontal: 8,
        paddingVertical: 8,
        opacity: isLocked ? 0.4 : 1,
      }}
    >
      {icon}
      <View style={{ flex: 1 }}>
        <Text style={{ fontSize: 12, fontWeight: "500", color: "#020617" }}>
          Day {day.day_number}
        </Text>
        <Text style={{ fontSize: 11, color: "#94A3B8" }} numberOfLines={1}>
          {day.scripture_reference}
        </Text>
      </View>
      {dateLabel && (
        <Text style={{ fontSize: 10, color: "#94A3B8" }}>{dateLabel}</Text>
      )}
    </View>
  );
}
