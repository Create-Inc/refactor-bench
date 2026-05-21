import { useState, useRef, useEffect } from "react";
import { View, Text, TouchableOpacity, Switch, Animated } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import {
  Flame,
  Trophy,
  Shield,
  ArrowRight,
  CheckCircle,
  Users,
  Zap,
} from "lucide-react-native";
import { useRouter } from "expo-router";
import { setAnalyticsConsent } from "@/utils/analytics";
import * as Haptics from "expo-haptics";

const ONBOARDING_SCREENS = [
  {
    id: 1,
    icon: Flame,
    iconColor: "#FF8C00",
    title: "Build Unbreakable Streaks",
    description:
      "Track your daily habits and watch your streak grow. Miss a day? Your streak resets. Simple, powerful motivation.",
    socialProof: "Join 50,000+ people building better habits",
    socialEmoji: "🌍",
  },
  {
    id: 2,
    icon: Trophy,
    iconColor: "#FFD700",
    title: "Compete with Friends",
    description:
      "Challenge friends to streak battles, climb leaderboards, and hold each other accountable. Together is better.",
    socialProof: "10,000+ active battles happening now",
    socialEmoji: "⚔️",
  },
  {
    id: 3,
    icon: Zap,
    iconColor: "#4ADE80",
    title: "Your First Win!",
    description:
      "Tap the button below to check in and earn your first achievement right now. It takes 1 second!",
    isInteractiveStep: true,
  },
  {
    id: 4,
    icon: Shield,
    iconColor: "#4CAF50",
    title: "Your Data, Your Choice",
    description:
      "We collect basic usage data like check-ins and streaks to improve your experience and app features. This data stays within LastUp and is never shared with third parties for tracking or advertising.",
    isConsentScreen: true,
  },
];

export default function OnboardingScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [analyticsEnabled, setAnalyticsEnabled] = useState(true);
  const [firstCheckInDone, setFirstCheckInDone] = useState(false);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const confettiAnim = useRef(new Animated.Value(0)).current;

  const currentScreen = ONBOARDING_SCREENS[currentIndex];
  const isLastScreen = currentIndex === ONBOARDING_SCREENS.length - 1;

  useEffect(() => {
    if (currentScreen.isInteractiveStep && !firstCheckInDone) {
      // Pulse animation for the check-in button
      const pulse = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.05,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
        ]),
      );
      pulse.start();
      return () => pulse.stop();
    }
  }, [currentIndex, firstCheckInDone]);

  const handleFirstCheckIn = async () => {
    setFirstCheckInDone(true);
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (e) {
      /* haptics not available */
    }

    // Confetti animation
    Animated.timing(confettiAnim, {
      toValue: 1,
      duration: 600,
      useNativeDriver: true,
    }).start();
  };

  const handleNext = async () => {
    if (isLastScreen) {
      await setAnalyticsConsent(analyticsEnabled);
      router.replace("/(tabs)");
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleSkip = async () => {
    await setAnalyticsConsent(false);
    router.replace("/(tabs)");
  };

  const IconComponent = currentScreen.icon;

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <StatusBar style="light" />

      {/* Skip Button */}
      {!isLastScreen && (
        <TouchableOpacity
          onPress={handleSkip}
          style={{
            position: "absolute",
            top: insets.top + 16,
            right: 20,
            zIndex: 10,
            paddingHorizontal: 16,
            paddingVertical: 8,
          }}
        >
          <Text style={{ color: "#888", fontSize: 16, fontWeight: "600" }}>
            Skip
          </Text>
        </TouchableOpacity>
      )}

      {/* Content */}
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          paddingHorizontal: 32,
        }}
      >
        <View
          style={{
            width: 120,
            height: 120,
            borderRadius: 60,
            backgroundColor: currentScreen.iconColor + "20",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: 32,
          }}
        >
          <IconComponent size={60} color={currentScreen.iconColor} />
        </View>

        <Text
          style={{
            color: "#FFF",
            fontSize: 32,
            fontWeight: "bold",
            textAlign: "center",
            marginBottom: 16,
          }}
        >
          {currentScreen.title}
        </Text>

        <Text
          style={{
            color: "#AAA",
            fontSize: 18,
            textAlign: "center",
            lineHeight: 26,
            marginBottom: 16,
          }}
        >
          {currentScreen.description}
        </Text>

        {/* Social Proof Badge */}
        {currentScreen.socialProof && (
          <View
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 12,
              paddingHorizontal: 16,
              paddingVertical: 10,
              flexDirection: "row",
              alignItems: "center",
              gap: 8,
              marginBottom: 24,
            }}
          >
            <Text style={{ fontSize: 18 }}>{currentScreen.socialEmoji}</Text>
            <Text style={{ color: "#4ADE80", fontSize: 14, fontWeight: "600" }}>
              {currentScreen.socialProof}
            </Text>
          </View>
        )}

        {/* Interactive Check-In Step */}
        {currentScreen.isInteractiveStep && (
          <View
            style={{ width: "100%", alignItems: "center", marginBottom: 24 }}
          >
            {!firstCheckInDone ? (
              <Animated.View
                style={{ transform: [{ scale: pulseAnim }], width: "100%" }}
              >
                <TouchableOpacity
                  onPress={handleFirstCheckIn}
                  style={{
                    backgroundColor: "#FF8C00",
                    paddingVertical: 20,
                    borderRadius: 16,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 12,
                    shadowColor: "#FF8C00",
                    shadowOffset: { width: 0, height: 4 },
                    shadowOpacity: 0.5,
                    shadowRadius: 12,
                  }}
                >
                  <CheckCircle size={28} color="#fff" />
                  <Text
                    style={{ color: "#fff", fontSize: 20, fontWeight: "bold" }}
                  >
                    Tap to Check In!
                  </Text>
                </TouchableOpacity>
              </Animated.View>
            ) : (
              <Animated.View
                style={{
                  opacity: confettiAnim,
                  transform: [
                    {
                      scale: confettiAnim.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0.5, 1],
                      }),
                    },
                  ],
                  alignItems: "center",
                }}
              >
                <View
                  style={{
                    backgroundColor: "#4ADE8020",
                    borderRadius: 20,
                    padding: 24,
                    width: "100%",
                    alignItems: "center",
                    borderWidth: 2,
                    borderColor: "#4ADE80",
                  }}
                >
                  <Text style={{ fontSize: 48, marginBottom: 8 }}>🏆</Text>
                  <Text
                    style={{
                      color: "#4ADE80",
                      fontSize: 22,
                      fontWeight: "bold",
                      marginBottom: 4,
                    }}
                  >
                    First Check-In Complete!
                  </Text>
                  <Text style={{ color: "#888", fontSize: 14 }}>
                    Achievement unlocked: "Day One Hero" 🌟
                  </Text>
                  <Text
                    style={{
                      color: "#FF8C00",
                      fontWeight: "bold",
                      marginTop: 8,
                    }}
                  >
                    +25 XP
                  </Text>
                </View>
              </Animated.View>
            )}
          </View>
        )}

        {/* Consent Toggle - only on consent screen */}
        {currentScreen.isConsentScreen && (
          <View
            style={{
              backgroundColor: "#1a1a1a",
              borderRadius: 16,
              padding: 20,
              width: "100%",
              marginBottom: 24,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#FFF",
                    fontSize: 16,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  Help Improve LastUp
                </Text>
                <Text style={{ color: "#888", fontSize: 13, lineHeight: 18 }}>
                  Allow usage analytics linked to your account for internal app
                  improvement only
                </Text>
              </View>
              <Switch
                value={analyticsEnabled}
                onValueChange={setAnalyticsEnabled}
                trackColor={{ false: "#2a2a2a", true: "#4CAF50" }}
                thumbColor="#fff"
              />
            </View>
            <Text
              style={{
                color: "#666",
                fontSize: 12,
                marginTop: 12,
                lineHeight: 16,
              }}
            >
              You can change this anytime in Settings → Data & Privacy
            </Text>
          </View>
        )}

        {/* Page Indicators */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 48 }}>
          {ONBOARDING_SCREENS.map((_, index) => (
            <View
              key={index}
              style={{
                width: index === currentIndex ? 24 : 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: index === currentIndex ? "#FF8C00" : "#333",
              }}
            />
          ))}
        </View>
      </View>

      {/* Bottom Actions */}
      <View
        style={{ paddingHorizontal: 32, paddingBottom: insets.bottom + 32 }}
      >
        <TouchableOpacity
          onPress={handleNext}
          disabled={currentScreen.isInteractiveStep && !firstCheckInDone}
          style={{
            backgroundColor:
              currentScreen.isInteractiveStep && !firstCheckInDone
                ? "#333"
                : "#FF8C00",
            paddingVertical: 18,
            borderRadius: 16,
            flexDirection: "row",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "bold" }}>
            {isLastScreen ? "Get Started" : "Next"}
          </Text>
          <ArrowRight size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
