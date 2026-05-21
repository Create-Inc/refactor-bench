import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  Modal,
  ScrollView,
  Alert,
} from "react-native";
import {
  X,
  DollarSign,
  FileText,
  Send,
  AlertTriangle,
} from "lucide-react-native";

export const BorrowModal = ({
  visible,
  onClose,
  onSubmit,
  isSubmitting,
  insets,
}) => {
  const [amount, setAmount] = useState("");
  const [reason, setReason] = useState("");

  const handleSubmit = () => {
    if (!amount || isNaN(amount) || parseFloat(amount) <= 0) {
      Alert.alert("Invalid", "Enter a valid amount.");
      return;
    }
    if (!reason.trim()) {
      Alert.alert("Missing", "Add a reason for your request.");
      return;
    }
    onSubmit({ amount: parseFloat(amount), reason: reason.trim() });
    setAmount("");
    setReason("");
  };

  const handleClose = () => {
    setAmount("");
    setReason("");
    onClose();
  };

  return (
    <Modal transparent visible={visible} animationType="slide">
      <View
        style={{
          flex: 1,
          backgroundColor: "rgba(0,0,0,0.6)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#1C2230",
            borderTopLeftRadius: 20,
            borderTopRightRadius: 20,
            paddingTop: 8,
            paddingBottom: insets.bottom + 20,
          }}
        >
          <View
            style={{
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: "#3A3A3C",
              alignSelf: "center",
              marginBottom: 16,
            }}
          />
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              marginBottom: 20,
            }}
          >
            <Text style={{ color: "#FFF", fontSize: 20, fontWeight: "800" }}>
              Request a Loan
            </Text>
            <TouchableOpacity onPress={handleClose}>
              <X color="#8E8E93" size={22} />
            </TouchableOpacity>
          </View>
          <ScrollView style={{ paddingHorizontal: 20 }}>
            <View
              style={{
                backgroundColor: "#252B3B",
                borderRadius: 12,
                padding: 16,
                marginBottom: 14,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <DollarSign color="#7B61FF" size={16} />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Amount
                </Text>
              </View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 36,
                    fontWeight: "300",
                  }}
                >
                  $
                </Text>
                <TextInput
                  style={{
                    flex: 1,
                    color: "#FFF",
                    fontSize: 36,
                    fontWeight: "700",
                    marginLeft: 4,
                    padding: 0,
                  }}
                  placeholder="0"
                  placeholderTextColor="rgba(255,255,255,0.15)"
                  keyboardType="decimal-pad"
                  value={amount}
                  onChangeText={setAmount}
                />
              </View>
            </View>
            <View
              style={{
                backgroundColor: "#252B3B",
                borderRadius: 12,
                padding: 16,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 10,
                }}
              >
                <FileText color="#00C853" size={16} />
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 12,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                  }}
                >
                  Reason
                </Text>
              </View>
              <TextInput
                style={{
                  color: "#FFF",
                  fontSize: 15,
                  lineHeight: 22,
                  minHeight: 70,
                  textAlignVertical: "top",
                  padding: 0,
                }}
                placeholder="Why do you need this loan?"
                placeholderTextColor="rgba(255,255,255,0.15)"
                multiline
                value={reason}
                onChangeText={setReason}
              />
            </View>

            {/* Interest Calculator Preview */}
            {amount && !isNaN(amount) && parseFloat(amount) > 0 && (
              <View
                style={{
                  backgroundColor: "rgba(124,77,255,0.08)",
                  borderRadius: 12,
                  padding: 16,
                  marginBottom: 14,
                  borderWidth: 1,
                  borderColor: "rgba(124,77,255,0.15)",
                }}
              >
                <Text
                  style={{
                    color: "rgba(255,255,255,0.5)",
                    fontSize: 11,
                    fontWeight: "600",
                    textTransform: "uppercase",
                    letterSpacing: 1,
                    marginBottom: 10,
                  }}
                >
                  Estimated Repayment
                </Text>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}
                  >
                    Loan amount
                  </Text>
                  <Text
                    style={{ color: "#FFF", fontSize: 13, fontWeight: "600" }}
                  >
                    ${parseFloat(amount).toFixed(2)}
                  </Text>
                </View>
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginBottom: 6,
                  }}
                >
                  <Text
                    style={{ color: "rgba(255,255,255,0.5)", fontSize: 13 }}
                  >
                    Interest (~10%)
                  </Text>
                  <Text
                    style={{
                      color: "#FF9800",
                      fontSize: 13,
                      fontWeight: "600",
                    }}
                  >
                    +${(parseFloat(amount) * 0.1).toFixed(2)}
                  </Text>
                </View>
                <View
                  style={{
                    height: 1,
                    backgroundColor: "rgba(255,255,255,0.06)",
                    marginVertical: 8,
                  }}
                />
                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                  }}
                >
                  <Text
                    style={{ color: "#FFF", fontSize: 15, fontWeight: "700" }}
                  >
                    Total to repay
                  </Text>
                  <Text
                    style={{
                      color: "#7B61FF",
                      fontSize: 18,
                      fontWeight: "800",
                    }}
                  >
                    ${(parseFloat(amount) * 1.1).toFixed(2)}
                  </Text>
                </View>
                <Text
                  style={{
                    color: "rgba(255,255,255,0.3)",
                    fontSize: 10,
                    marginTop: 6,
                  }}
                >
                  Final rate depends on the lender who funds your request
                </Text>
              </View>
            )}

            {/* Safety note in modal */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "flex-start",
                gap: 8,
                backgroundColor: "rgba(255,152,0,0.06)",
                borderRadius: 10,
                padding: 12,
                marginBottom: 14,
                borderWidth: 1,
                borderColor: "rgba(255,152,0,0.1)",
              }}
            >
              <AlertTriangle
                color="#FF9800"
                size={13}
                style={{ marginTop: 1 }}
              />
              <Text
                style={{
                  flex: 1,
                  color: "rgba(255,255,255,0.4)",
                  fontSize: 11,
                  lineHeight: 16,
                }}
              >
                Late repayment will lower your trust score by up to 75 points.
                Always repay on time.
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={{
                backgroundColor: isSubmitting ? "#4A3E99" : "#7B61FF",
                borderRadius: 12,
                paddingVertical: 16,
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                marginBottom: 20,
              }}
            >
              <Send color="#FFF" size={18} />
              <Text style={{ color: "#FFF", fontSize: 16, fontWeight: "700" }}>
                {isSubmitting ? "Posting..." : "Post Request"}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};
