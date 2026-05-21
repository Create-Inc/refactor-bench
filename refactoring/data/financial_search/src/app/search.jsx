import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Search as SearchIcon,
  Shield,
  ArrowUpRight,
  ArrowDownLeft,
  Calendar,
  X,
  DollarSign,
  FileText,
  Users,
} from "lucide-react-native";
import TrustMeter from "@/components/TrustMeter";
import useUser from "@/utils/auth/useUser";

const getScoreColor = (s) => {
  if (s >= 81) return "#047857";
  if (s >= 61) return "#059669";
  if (s >= 41) return "#EAB308";
  if (s >= 21) return "#D97706";
  return "#DC2626";
};

export default function SearchScreen() {
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState(null);

  // Get authenticated user
  const { data: currentUser, loading: userLoading } = useUser();
  const userId = currentUser?.id;

  // Modal states
  const [lendModalVisible, setLendModalVisible] = useState(false);
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [lendAmount, setLendAmount] = useState("");
  const [lendDays, setLendDays] = useState("30");
  const [requestAmount, setRequestAmount] = useState("");
  const [requestReason, setRequestReason] = useState("");
  const [loading, setLoading] = useState(false);

  const { data: allUsers } = useQuery({
    queryKey: ["all-users"],
    queryFn: async () => {
      const res = await fetch("/api/users");
      if (!res.ok) return [];
      const d = await res.json();
      return (Array.isArray(d) ? d : []).filter((u) => u.id !== userId);
    },
    enabled: !!userId,
  });

  if (userLoading || !userId) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#141820",
          justifyContent: "center",
          alignItems: "center",
          paddingTop: insets.top,
        }}
      >
        <Text style={{ color: "#FFF", fontSize: 18, fontWeight: "600" }}>
          Loading...
        </Text>
      </View>
    );
  }

  const searchTerm = query.trim().toLowerCase();
  const results = searchTerm
    ? (allUsers || []).filter((u) => {
        const uname = (u.username || "").toLowerCase();
        const fname = (u.full_name || "").toLowerCase();
        return uname.includes(searchTerm) || fname.includes(searchTerm);
      })
    : allUsers || [];

  const handleLend = useCallback((user) => {
    setSelectedUser(user);
    setLendAmount("");
    setLendDays("30");
    setLendModalVisible(true);
  }, []);

  const handleRequest = useCallback((user) => {
    setSelectedUser(user);
    setRequestAmount("");
    setRequestReason("");
    setRequestModalVisible(true);
  }, []);

  const confirmLend = useCallback(async () => {
    if (!lendAmount || parseFloat(lendAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!lendDays || parseInt(lendDays) <= 0) {
      Alert.alert("Error", "Please enter valid days");
      return;
    }

    setLoading(true);
    try {
      const dueDate = new Date();
      dueDate.setDate(dueDate.getDate() + parseInt(lendDays));

      const response = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lenderId: userId,
          borrowerId: selectedUser.id,
          amount: parseFloat(lendAmount),
          dueDate: dueDate.toISOString(),
          interestRate: selectedUser.interest_rate,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create loan");
      }

      // Refresh queries to update data
      queryClient.invalidateQueries({ queryKey: ["loans"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });

      setLendModalVisible(false);
      setSelectedUser(null);
      Alert.alert(
        "Loan Created",
        `You've lent $${lendAmount} to @${selectedUser.username}. They'll need to repay $${(parseFloat(lendAmount) + parseFloat(lendAmount) * (selectedUser.interest_rate / 100) * (parseInt(lendDays) / 30)).toFixed(2)} by ${dueDate.toLocaleDateString()}.`,
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }, [lendAmount, lendDays, selectedUser, queryClient, userId]);

  const confirmRequest = useCallback(async () => {
    if (!requestAmount || parseFloat(requestAmount) <= 0) {
      Alert.alert("Error", "Please enter a valid amount");
      return;
    }
    if (!requestReason.trim()) {
      Alert.alert("Error", "Please provide a reason for the loan");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/loan-requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          amount: parseFloat(requestAmount),
          reason: requestReason.trim(),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create loan request");
      }

      // Refresh queries to update data
      queryClient.invalidateQueries({ queryKey: ["loan-requests"] });
      queryClient.invalidateQueries({ queryKey: ["activity"] });

      setRequestModalVisible(false);
      setSelectedUser(null);
      Alert.alert(
        "Request Posted",
        `Your loan request for $${requestAmount} has been posted. @${selectedUser.username} and other users can now fund it.`,
      );
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  }, [requestAmount, requestReason, selectedUser, queryClient, userId]);

  const renderUser = ({ item }) => {
    const sc = getScoreColor(item.trust_score);
    const joinDate = new Date(item.created_at).toLocaleDateString("en-US", {
      month: "short",
      year: "numeric",
    });

    if (selectedUser?.id === item.id) {
      return (
        <View
          style={{
            backgroundColor: "#1C2230",
            borderRadius: 16,
            padding: 20,
            marginBottom: 10,
            borderWidth: 1,
            borderColor: "#1E40AF",
          }}
        >
          <TouchableOpacity
            onPress={() => setSelectedUser(null)}
            style={{ alignItems: "center", marginBottom: 12 }}
          >
            <TrustMeter score={item.trust_score} />
          </TouchableOpacity>
          <Text
            style={{
              color: "#FFF",
              fontSize: 20,
              fontWeight: "800",
              textAlign: "center",
            }}
          >
            @{item.username}
          </Text>
          {item.full_name && (
            <Text
              style={{
                color: "#8E8E93",
                fontSize: 13,
                textAlign: "center",
                marginTop: 2,
              }}
            >
              {item.full_name}
            </Text>
          )}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "center",
              gap: 12,
              marginTop: 8,
            }}
          >
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
            >
              <Calendar color="#8E8E93" size={12} />
              <Text style={{ color: "#8E8E93", fontSize: 11 }}>
                Joined {joinDate}
              </Text>
            </View>
            {item.verified && (
              <View
                style={{ flexDirection: "row", alignItems: "center", gap: 4 }}
              >
                <Shield color="#1E40AF" size={12} />
                <Text
                  style={{ color: "#1E40AF", fontSize: 11, fontWeight: "600" }}
                >
                  Verified
                </Text>
              </View>
            )}
          </View>
          <Text
            style={{
              color: "#8E8E93",
              fontSize: 12,
              textAlign: "center",
              marginTop: 6,
            }}
          >
            Interest Rate: {item.interest_rate}%
          </Text>
          <View style={{ flexDirection: "row", gap: 10, marginTop: 16 }}>
            <TouchableOpacity
              onPress={() => handleLend(item)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: "#059669",
                paddingVertical: 12,
                borderRadius: 10,
              }}
            >
              <ArrowUpRight color="#FFF" size={16} />
              <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "700" }}>
                Lend
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => handleRequest(item)}
              style={{
                flex: 1,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 6,
                backgroundColor: "#1E40AF",
                paddingVertical: 12,
                borderRadius: 10,
              }}
            >
              <ArrowDownLeft color="#FFF" size={16} />
              <Text style={{ color: "#FFF", fontSize: 14, fontWeight: "700" }}>
                Request
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      );
    }

    return (
      <TouchableOpacity
        onPress={() => setSelectedUser(item)}
        style={{
          backgroundColor: "#1C2230",
          borderRadius: 14,
          padding: 14,
          marginBottom: 8,
          flexDirection: "row",
          alignItems: "center",
          borderWidth: 1,
          borderColor: "#252B3B",
        }}
      >
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            backgroundColor: sc + "20",
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 2,
            borderColor: sc,
          }}
        >
          <Text
            style={{
              fontSize: 16,
              fontWeight: "700",
              color: sc,
            }}
          >
            {(item.username || "?").charAt(0).toUpperCase()}
          </Text>
        </View>
        <View style={{ flex: 1, marginLeft: 12 }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
            <Text style={{ color: "#FFF", fontSize: 15, fontWeight: "700" }}>
              @{item.username}
            </Text>
            {item.verified && <Shield color="#1E40AF" size={12} />}
          </View>
          {item.full_name && (
            <Text style={{ color: "#8E8E93", fontSize: 12, marginTop: 1 }}>
              {item.full_name}
            </Text>
          )}
        </View>
        <View style={{ alignItems: "flex-end" }}>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <View
              style={{
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: sc,
              }}
            />
            <Text style={{ color: sc, fontSize: 14, fontWeight: "700" }}>
              {item.trust_score}%
            </Text>
          </View>
          <Text style={{ color: "#8E8E93", fontSize: 10, marginTop: 2 }}>
            {item.interest_rate}% rate
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{ flex: 1, backgroundColor: "#141820", paddingTop: insets.top }}
    >
      <View style={{ paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 }}>
        <Text style={{ color: "#FFFFFF", fontSize: 28, fontWeight: "800" }}>
          Search
        </Text>
        <Text
          style={{ color: "rgba(255,255,255,0.4)", fontSize: 13, marginTop: 4 }}
        >
          Find people to lend to or borrow from.
        </Text>
      </View>

      {/* Search bar */}
      <View
        style={{
          marginHorizontal: 20,
          marginTop: 12,
          marginBottom: 16,
          flexDirection: "row",
          alignItems: "center",
          backgroundColor: "#1C2230",
          borderRadius: 12,
          paddingHorizontal: 14,
          borderWidth: 1,
          borderColor: "rgba(255,255,255,0.06)",
        }}
      >
        <SearchIcon color="#8E8E93" size={18} />
        <TextInput
          style={{
            flex: 1,
            color: "#FFF",
            fontSize: 15,
            paddingVertical: 14,
            marginLeft: 10,
          }}
          placeholder="Search by username..."
          placeholderTextColor="#3A3A3C"
          value={query}
          onChangeText={setQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item.id}
        renderItem={renderUser}
        contentContainerStyle={{
          paddingHorizontal: 20,
          paddingBottom: insets.bottom + 20,
        }}
        ListEmptyComponent={
          <View style={{ alignItems: "center", marginTop: 60 }}>
            <View
              style={{
                width: 80,
                height: 80,
                borderRadius: 40,
                backgroundColor: "#1C2230",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: 16,
                borderWidth: 1,
                borderColor: "#252B3B",
              }}
            >
              <Users color="#64748B" size={32} />
            </View>
            <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "600" }}>
              No users found
            </Text>
            <Text style={{ color: "#8E8E93", fontSize: 12, marginTop: 4 }}>
              Try a different search term.
            </Text>
          </View>
        }
      />

      {/* Lend Modal */}
      <Modal
        visible={lendModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setLendModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#141820" }}>
          <View
            style={{
              paddingTop: insets.top + 16,
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#252B3B",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "700" }}>
              Lend to @{selectedUser?.username}
            </Text>
            <TouchableOpacity
              onPress={() => setLendModalVisible(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#252B3B",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X color="#8E8E93" size={18} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Amount to Lend
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1C2230",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: "#252B3B",
                }}
              >
                <DollarSign color="#8E8E93" size={20} />
                <TextInput
                  style={{
                    flex: 1,
                    color: "#FFF",
                    fontSize: 18,
                    fontWeight: "600",
                    paddingVertical: 16,
                    marginLeft: 8,
                  }}
                  placeholder="0"
                  placeholderTextColor="#3A3A3C"
                  value={lendAmount}
                  onChangeText={setLendAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Loan Duration (days)
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1C2230",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: "#252B3B",
                }}
              >
                <Calendar color="#8E8E93" size={20} />
                <TextInput
                  style={{
                    flex: 1,
                    color: "#FFF",
                    fontSize: 18,
                    fontWeight: "600",
                    paddingVertical: 16,
                    marginLeft: 8,
                  }}
                  placeholder="30"
                  placeholderTextColor="#3A3A3C"
                  value={lendDays}
                  onChangeText={setLendDays}
                  keyboardType="numeric"
                />
              </View>
            </View>

            {lendAmount && lendDays && (
              <View
                style={{
                  backgroundColor: "#1C2230",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 24,
                  borderWidth: 1,
                  borderColor: "#252B3B",
                }}
              >
                <Text
                  style={{ color: "#8E8E93", fontSize: 14, marginBottom: 8 }}
                >
                  Loan Summary
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: "#FFF", fontSize: 15 }}>
                    Principal:
                  </Text>
                  <Text
                    style={{ color: "#FFF", fontSize: 15, fontWeight: "600" }}
                  >
                    ${parseFloat(lendAmount || 0).toFixed(2)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 4,
                  }}
                >
                  <Text style={{ color: "#FFF", fontSize: 15 }}>
                    Interest Rate:
                  </Text>
                  <Text
                    style={{ color: "#FFF", fontSize: 15, fontWeight: "600" }}
                  >
                    {selectedUser?.interest_rate}%
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 8,
                  }}
                >
                  <Text style={{ color: "#FFF", fontSize: 15 }}>Interest:</Text>
                  <Text
                    style={{ color: "#FFF", fontSize: 15, fontWeight: "600" }}
                  >
                    $
                    {(
                      parseFloat(lendAmount || 0) *
                      ((selectedUser?.interest_rate || 0) / 100) *
                      (parseInt(lendDays || 0) / 30)
                    ).toFixed(2)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    paddingTop: 8,
                    borderTopWidth: 1,
                    borderTopColor: "#252B3B",
                  }}
                >
                  <Text
                    style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}
                  >
                    Total Repayment:
                  </Text>
                  <Text
                    style={{
                      color: "#059669",
                      fontSize: 16,
                      fontWeight: "700",
                    }}
                  >
                    $
                    {(
                      parseFloat(lendAmount || 0) +
                      parseFloat(lendAmount || 0) *
                        ((selectedUser?.interest_rate || 0) / 100) *
                        (parseInt(lendDays || 0) / 30)
                    ).toFixed(2)}
                  </Text>
                </View>
              </View>
            )}
          </View>

          <View
            style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
          >
            <TouchableOpacity
              onPress={confirmLend}
              disabled={loading || !lendAmount || !lendDays}
              style={{
                backgroundColor:
                  loading || !lendAmount || !lendDays ? "#252B3B" : "#059669",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    loading || !lendAmount || !lendDays ? "#8E8E93" : "#FFF",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                {loading ? "Creating Loan..." : "Confirm Loan"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Request Modal */}
      <Modal
        visible={requestModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={{ flex: 1, backgroundColor: "#141820" }}>
          <View
            style={{
              paddingTop: insets.top + 16,
              paddingHorizontal: 20,
              paddingBottom: 20,
              borderBottomWidth: 1,
              borderBottomColor: "#252B3B",
              flexDirection: "row",
              alignItems: "center",
              justifyContent: "space-between",
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "700" }}>
              Request from @{selectedUser?.username}
            </Text>
            <TouchableOpacity
              onPress={() => setRequestModalVisible(false)}
              style={{
                width: 32,
                height: 32,
                borderRadius: 16,
                backgroundColor: "#252B3B",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <X color="#8E8E93" size={18} />
            </TouchableOpacity>
          </View>

          <View style={{ flex: 1, paddingHorizontal: 20, paddingTop: 24 }}>
            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Amount Needed
              </Text>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  backgroundColor: "#1C2230",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  borderWidth: 1,
                  borderColor: "#252B3B",
                }}
              >
                <DollarSign color="#8E8E93" size={20} />
                <TextInput
                  style={{
                    flex: 1,
                    color: "#FFF",
                    fontSize: 18,
                    fontWeight: "600",
                    paddingVertical: 16,
                    marginLeft: 8,
                  }}
                  placeholder="0"
                  placeholderTextColor="#3A3A3C"
                  value={requestAmount}
                  onChangeText={setRequestAmount}
                  keyboardType="numeric"
                />
              </View>
            </View>

            <View style={{ marginBottom: 24 }}>
              <Text
                style={{
                  color: "#FFF",
                  fontSize: 16,
                  fontWeight: "600",
                  marginBottom: 8,
                }}
              >
                Reason for Loan
              </Text>
              <TextInput
                style={{
                  backgroundColor: "#1C2230",
                  borderRadius: 12,
                  paddingHorizontal: 16,
                  paddingVertical: 16,
                  color: "#FFF",
                  fontSize: 15,
                  borderWidth: 1,
                  borderColor: "#252B3B",
                  minHeight: 120,
                  textAlignVertical: "top",
                }}
                placeholder="Explain why you need this loan..."
                placeholderTextColor="#3A3A3C"
                value={requestReason}
                onChangeText={setRequestReason}
                multiline
              />
            </View>

            <View
              style={{
                backgroundColor: "#1C2230",
                borderRadius: 12,
                padding: 16,
                marginBottom: 24,
                borderWidth: 1,
                borderColor: "#1E40AF",
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: "#1E40AF20",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
              >
                <FileText color="#1E40AF" size={16} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: "#1E40AF",
                    fontSize: 14,
                    fontWeight: "600",
                    marginBottom: 4,
                  }}
                >
                  Note
                </Text>
                <Text style={{ color: "#FFF", fontSize: 14, lineHeight: 20 }}>
                  This will create a public loan request that @
                  {selectedUser?.username} and other users can fund at their own
                  interest rates.
                </Text>
              </View>
            </View>
          </View>

          <View
            style={{ paddingHorizontal: 20, paddingBottom: insets.bottom + 20 }}
          >
            <TouchableOpacity
              onPress={confirmRequest}
              disabled={loading || !requestAmount || !requestReason.trim()}
              style={{
                backgroundColor:
                  loading || !requestAmount || !requestReason.trim()
                    ? "#252B3B"
                    : "#1E40AF",
                borderRadius: 12,
                paddingVertical: 16,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color:
                    loading || !requestAmount || !requestReason.trim()
                      ? "#8E8E93"
                      : "#FFF",
                  fontSize: 16,
                  fontWeight: "700",
                }}
              >
                {loading ? "Creating Request..." : "Post Loan Request"}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
