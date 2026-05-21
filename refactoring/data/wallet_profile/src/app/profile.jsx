import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Animated,
} from "react-native";
import { useRef, useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import { Image } from "expo-image";
import { GlassView, isLiquidGlassAvailable } from "expo-glass-effect";
import { Menu, X, Heart, Users, Eye } from "lucide-react-native";
import { useTheme } from "@/utils/theme";
import { useCallTunes } from "@/utils/callTunesStore";
import { useCallStore } from "@/utils/callStore";
import { CallTunesSettings } from "@/components/CallTunesSettings";
import { CallerIdSettings } from "@/components/CallerIdSettings";
import { CallHistoryScreen } from "@/components/CallHistoryScreen";
import EditProfile from "@/components/EditProfile";
import VerificationBadge from "@/components/VerificationBadge";
import VerificationScreen from "@/components/VerificationScreen";
import AdminVerificationPanel from "@/components/AdminVerificationPanel";
import { useAuth } from "@/utils/auth/useAuth";
import { ProfilePostGrid } from "@/components/Profile/ProfilePostGrid";
import ProfileMenu from "@/components/Profile/ProfileMenu";
import { useAuthStore } from "@/utils/auth/store";
import WalletScreen from "@/components/WalletScreen";

const LOGO_URI =
  "https://ucarecdn.com/cfccb9f6-d836-41b0-8628-817a732ddf9f/-/format/auto/";

function formatStat(n) {
  if (n >= 1000000) return (n / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
  if (n >= 1000) return (n / 1000).toFixed(1).replace(/\.0$/, "") + "K";
  return String(n);
}

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { colors, isDark, toggleTheme } = useTheme();
  const { selectedRingtone, selectedCallout } = useCallTunes();
  const { callerId, callHistory } = useCallStore();
  const [showCallTunes, setShowCallTunes] = useState(false);
  const [showCallerId, setShowCallerId] = useState(false);
  const [showCallHistory, setShowCallHistory] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showVerification, setShowVerification] = useState(false);
  const [showAdminPanel, setShowAdminPanel] = useState(false);
  const [showWallet, setShowWallet] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuAnim = useRef(new Animated.Value(0)).current;
  const { signOut } = useAuth();

  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [stats, setStats] = useState({
    posts: 0,
    subscribers: 0,
    following: 0,
    totalViews: 0,
    totalLikes: 0,
  });

  const fetchStats = () => {
    const auth = useAuthStore.getState().auth;
    const headers = {};
    if (auth?.jwt) {
      headers["Authorization"] = "Bearer " + auth.jwt;
    }
    fetch("/api/profile/stats", { headers })
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (data) setStats(data);
      })
      .catch((err) => console.error("Stats fetch error:", err));
  };

  const refetchProfile = () => {
    setProfileLoading(true);
    fetch("/api/profile")
      .then((res) => {
        if (res.ok) return res.json();
        return null;
      })
      .then((data) => {
        if (data && data.user) setProfileData(data.user);
      })
      .catch((err) => console.error("Profile fetch error:", err))
      .finally(() => setProfileLoading(false));
  };

  useEffect(() => {
    refetchProfile();
    fetchStats();
  }, []);

  const handleProfileSaved = (updatedUser) => {
    setProfileData(updatedUser);
  };

  const isVerified = profileData?.is_verified || false;
  const isAdmin = profileData?.is_admin || false;
  const badgeUrl = profileData?.verification_badge_url || null;

  const isLoading = profileLoading;
  const displayName = profileData?.name || "User";
  const displayUsername = profileData?.username || "";
  const displayBio = profileData?.bio || "";
  const avatarInitial = displayName ? displayName.charAt(0).toUpperCase() : "?";

  const toggleMenu = () => {
    const toValue = menuOpen ? 0 : 1;
    setMenuOpen(!menuOpen);
    Animated.timing(menuAnim, {
      toValue,
      duration: 280,
      useNativeDriver: false,
    }).start();
  };

  const closeMenu = () => {
    setMenuOpen(false);
    Animated.timing(menuAnim, {
      toValue: 0,
      duration: 220,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: colors.bg, paddingTop: insets.top }}
    >
      <StatusBar style={colors.statusBar} />

      {/* Header */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 20,
          paddingTop: 16,
          paddingBottom: 12,
          zIndex: 20,
        }}
      >
        <View
          style={{
            width: 36,
            height: 36,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Image
            source={{ uri: LOGO_URI }}
            style={{
              width: 32,
              height: 32,
            }}
            contentFit="contain"
          />
        </View>
        <TouchableOpacity
          onPress={toggleMenu}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            backgroundColor: menuOpen
              ? isDark
                ? "rgba(255,255,255,0.1)"
                : "rgba(0,0,0,0.06)"
              : "transparent",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          {menuOpen ? (
            <X size={24} color={colors.text} />
          ) : (
            <Menu size={24} color={colors.textSecondary} />
          )}
        </TouchableOpacity>
      </View>

      {/* Menu Dropdown */}
      {menuOpen && (
        <ProfileMenu
          colors={colors}
          isDark={isDark}
          toggleTheme={toggleTheme}
          menuAnim={menuAnim}
          onClose={closeMenu}
          selectedRingtone={selectedRingtone}
          selectedCallout={selectedCallout}
          callerId={callerId}
          callHistory={callHistory}
          isVerified={isVerified}
          isAdmin={isAdmin}
          onCallTunes={() => setShowCallTunes(true)}
          onCallerId={() => setShowCallerId(true)}
          onCallHistory={() => setShowCallHistory(true)}
          onEditProfile={() => setShowEditProfile(true)}
          onVerification={() => setShowVerification(true)}
          onAdminPanel={() => setShowAdminPanel(true)}
          onWallet={() => setShowWallet(true)}
          onSignOut={signOut}
        />
      )}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: insets.bottom + 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Profile Card — Liquid Glass Separator */}
        <GlassView
          glassEffectStyle="clear"
          isInteractive={false}
          style={
            isLiquidGlassAvailable()
              ? {
                  marginHorizontal: 20,
                  marginBottom: 28,
                  marginTop: 8,
                  paddingVertical: 28,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                  alignItems: "center",
                }
              : {
                  marginHorizontal: 20,
                  marginBottom: 28,
                  marginTop: 8,
                  paddingVertical: 28,
                  paddingHorizontal: 20,
                  borderRadius: 20,
                  alignItems: "center",
                  backgroundColor: isDark
                    ? "rgba(255,255,255,0.06)"
                    : "rgba(0,0,0,0.03)",
                }
          }
        >
          {/* Avatar */}
          <View
            style={{
              width: 100,
              height: 100,
              borderRadius: 50,
              backgroundColor: isLoading
                ? isDark
                  ? colors.surfaceElevated
                  : colors.surface
                : colors.green,
              justifyContent: "center",
              alignItems: "center",
              marginBottom: 16,
              shadowColor: colors.green,
              shadowOffset: { width: 0, height: 0 },
              shadowOpacity: isLoading ? 0 : isDark ? 0.4 : 0.2,
              shadowRadius: 16,
              overflow: "hidden",
            }}
          >
            {profileData?.image ? (
              <Image
                source={{ uri: profileData.image }}
                style={{ width: 100, height: 100 }}
                contentFit="cover"
              />
            ) : isLoading ? null : (
              <Text
                style={{
                  color: colors.avatarText,
                  fontFamily: "Inter_700Bold",
                  fontSize: 42,
                }}
              >
                {avatarInitial}
              </Text>
            )}
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 6,
            }}
          >
            {isLoading ? (
              <View
                style={{
                  width: 160,
                  height: 28,
                  borderRadius: 8,
                  backgroundColor: isDark
                    ? colors.surfaceElevated
                    : colors.surface,
                }}
              />
            ) : (
              <>
                <Text
                  style={{
                    color: colors.text,
                    fontFamily: "Inter_700Bold",
                    fontSize: 24,
                    marginRight: 4,
                  }}
                >
                  {displayName}
                </Text>
                {isVerified && (
                  <VerificationBadge size={22} badgeUrl={badgeUrl} />
                )}
              </>
            )}
          </View>

          {isLoading ? (
            <View
              style={{
                width: 200,
                height: 18,
                borderRadius: 6,
                backgroundColor: isDark
                  ? colors.surfaceElevated
                  : colors.surface,
                marginBottom: 10,
              }}
            />
          ) : displayUsername ? (
            <Text
              style={{
                color: colors.green,
                fontFamily: "Inter_600SemiBold",
                fontSize: 15,
                marginBottom: 10,
              }}
            >
              @{displayUsername} • DanceX Creator
            </Text>
          ) : null}

          {isLoading ? (
            <View
              style={{
                width: 240,
                height: 36,
                borderRadius: 6,
                backgroundColor: isDark
                  ? colors.surfaceElevated
                  : colors.surface,
              }}
            />
          ) : displayBio ? (
            <Text
              style={{
                color: colors.textSecondary,
                fontFamily: "Inter_400Regular",
                fontSize: 15,
                textAlign: "center",
                lineHeight: 22,
              }}
            >
              {displayBio}
            </Text>
          ) : null}
        </GlassView>

        {/* ── Stats ── */}
        <View style={{ paddingHorizontal: 20, marginBottom: 24 }}>
          {/* Inline quick stats row */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-around",
              marginBottom: 16,
              paddingVertical: 14,
              borderRadius: 14,
              backgroundColor: isDark
                ? "rgba(255,255,255,0.04)"
                : "rgba(0,0,0,0.025)",
            }}
          >
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: colors.text,
                  fontFamily: "Inter_700Bold",
                  fontSize: 20,
                  letterSpacing: -0.3,
                }}
              >
                {formatStat(stats.posts)}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Posts
              </Text>
            </View>
            <View
              style={{
                width: 1,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            />
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: colors.text,
                  fontFamily: "Inter_700Bold",
                  fontSize: 20,
                  letterSpacing: -0.3,
                }}
              >
                {formatStat(stats.subscribers)}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Subscribers
              </Text>
            </View>
            <View
              style={{
                width: 1,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.08)"
                  : "rgba(0,0,0,0.06)",
              }}
            />
            <View style={{ alignItems: "center" }}>
              <Text
                style={{
                  color: colors.text,
                  fontFamily: "Inter_700Bold",
                  fontSize: 20,
                  letterSpacing: -0.3,
                }}
              >
                {formatStat(stats.following)}
              </Text>
              <Text
                style={{
                  color: colors.textSecondary,
                  fontFamily: "Inter_500Medium",
                  fontSize: 12,
                  marginTop: 2,
                }}
              >
                Following
              </Text>
            </View>
          </View>

          {/* Engagement cards row */}
          <View style={{ flexDirection: "row", gap: 10 }}>
            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.025)",
                borderLeftWidth: 3,
                borderLeftColor: "#27c175",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: isDark
                    ? "rgba(39,193,117,0.12)"
                    : "rgba(39,193,117,0.08)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Eye size={18} color="#27c175" />
              </View>
              <View>
                <Text
                  style={{
                    color: colors.text,
                    fontFamily: "Inter_700Bold",
                    fontSize: 17,
                    letterSpacing: -0.3,
                  }}
                >
                  {formatStat(stats.totalViews)}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: "Inter_400Regular",
                    fontSize: 11,
                    marginTop: 1,
                  }}
                >
                  Views
                </Text>
              </View>
            </View>

            <View
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 14,
                borderRadius: 14,
                backgroundColor: isDark
                  ? "rgba(255,255,255,0.04)"
                  : "rgba(0,0,0,0.025)",
                borderLeftWidth: 3,
                borderLeftColor: "#FF3B30",
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  backgroundColor: isDark
                    ? "rgba(255,59,48,0.12)"
                    : "rgba(255,59,48,0.06)",
                  justifyContent: "center",
                  alignItems: "center",
                  marginRight: 12,
                }}
              >
                <Heart size={18} color="#FF3B30" />
              </View>
              <View>
                <Text
                  style={{
                    color: colors.text,
                    fontFamily: "Inter_700Bold",
                    fontSize: 17,
                    letterSpacing: -0.3,
                  }}
                >
                  {formatStat(stats.totalLikes)}
                </Text>
                <Text
                  style={{
                    color: colors.textSecondary,
                    fontFamily: "Inter_400Regular",
                    fontSize: 11,
                    marginTop: 1,
                  }}
                >
                  Likes
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Post Grid */}
        <ProfilePostGrid colors={colors} isDark={isDark} />
      </ScrollView>

      {/* Overlay Screens */}
      {showCallTunes && (
        <CallTunesSettings
          onClose={() => setShowCallTunes(false)}
          colors={colors}
          isDark={isDark}
        />
      )}
      {showCallerId && (
        <CallerIdSettings
          onClose={() => setShowCallerId(false)}
          colors={colors}
          isDark={isDark}
        />
      )}
      {showCallHistory && (
        <CallHistoryScreen
          onClose={() => setShowCallHistory(false)}
          colors={colors}
          isDark={isDark}
        />
      )}
      {showEditProfile && (
        <EditProfile
          onClose={() => setShowEditProfile(false)}
          colors={colors}
          isDark={isDark}
          onSaved={handleProfileSaved}
        />
      )}
      {showVerification && (
        <VerificationScreen
          onClose={() => setShowVerification(false)}
          colors={colors}
          isDark={isDark}
        />
      )}
      {showAdminPanel && (
        <AdminVerificationPanel
          onClose={() => setShowAdminPanel(false)}
          colors={colors}
          isDark={isDark}
        />
      )}
      {showWallet && (
        <WalletScreen
          onClose={() => setShowWallet(false)}
          colors={colors}
          isDark={isDark}
        />
      )}
    </View>
  );
}
