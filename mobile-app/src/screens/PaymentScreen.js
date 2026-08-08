import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";
import api from "../api/api";
import { colors, spacing } from "../theme";

export default function PaymentScreen({ route, navigation }) {
  const {
    doctorId,
    doctorName,
    clinicName,
    fee,
    appointmentDate,
    appointmentDateLabel,
    appointmentTime,
  } = route.params;

  const [paying, setPaying] = useState(false);
  const [webviewHtml, setWebviewHtml] = useState(null);

  const buildPaymentHtml = (order) => `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width, initial-scale=1.0" /></head><body><script src="https://checkout.razorpay.com/v1/checkout.js"></script><script>window.onload = function() { const options = { key: '${order.razorpay_key_id}', amount: ${order.amount_paise}, currency: '${order.currency}', name: 'MediBook', description: 'Consultation Fee', order_id: '${order.razorpay_order_id}', handler: function(response) { window.ReactNativeWebView.postMessage(JSON.stringify({ success: true, razorpay_payment_id: response.razorpay_payment_id, razorpay_order_id: response.razorpay_order_id, razorpay_signature: response.razorpay_signature })); }, modal: { ondismiss: function() { window.ReactNativeWebView.postMessage(JSON.stringify({ success: false, error: 'Payment was cancelled' })); } } }; const rzp = new Razorpay(options); rzp.open(); };</script></body></html>`;

  const handlePay = async () => {
    setPaying(true);
    try {
      const { data } = await api.post("/payments/create-order", {
        doctor_id: doctorId,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
      });
      setWebviewHtml(buildPaymentHtml(data));
    } catch (err) {
      Alert.alert("Payment initialization failed", err.message);
    } finally {
      setPaying(false);
    }
  };

  const handleWebViewMessage = async ({ nativeEvent }) => {
    try {
      const payload = JSON.parse(nativeEvent.data);
      if (!payload.success) {
        setWebviewHtml(null);
        Alert.alert("Payment cancelled", payload.error || "The payment was cancelled.");
        return;
      }
      setPaying(true);
      const { data } = await api.post("/payments/verify", {
        razorpay_order_id: payload.razorpay_order_id,
        razorpay_payment_id: payload.razorpay_payment_id,
        razorpay_signature: payload.razorpay_signature,
      });
      setWebviewHtml(null);
      navigation.reset({
        index: 1,
        routes: [
          { name: "Home" },
          { name: "PaymentSuccess", params: { appointment: data.appointment } },
        ],
      });
    } catch (err) {
      setWebviewHtml(null);
      Alert.alert("Payment verification failed", err.message);
    } finally {
      setPaying(false);
    }
  };

  if (webviewHtml) {
    return (
      <WebView
        originWhitelist={["*"]}
        javaScriptEnabled
        source={{ html: webviewHtml }}
        onMessage={handleWebViewMessage}
      />
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Confirm & Pay</Text>

        <View style={styles.row}>
          <Text style={styles.label}>Doctor</Text>
          <Text style={styles.value}>{doctorName}</Text>
        </View>
        {clinicName ? (
          <View style={styles.row}>
            <Text style={styles.label}>Clinic</Text>
            <Text style={styles.value}>{clinicName}</Text>
          </View>
        ) : null}
        <View style={styles.row}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{appointmentDateLabel}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Time</Text>
          <Text style={styles.value}>{appointmentTime}</Text>
        </View>

        <View style={styles.divider} />

        <View style={styles.row}>
          <Text style={styles.amountLabel}>Amount to Pay</Text>
          <Text style={styles.amountValue}>₹{fee}</Text>
        </View>

        <Text style={styles.note}>
          Payment will be processed in Razorpay Test Mode. Complete the checkout to confirm your appointment.
        </Text>

        <TouchableOpacity style={styles.payButton} onPress={handlePay} disabled={paying}>
          {paying ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.payButtonText}>{`Pay ₹${fee}`}</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, padding: spacing.lg, justifyContent: "center" },
  card: {
    backgroundColor: "#fff", borderRadius: 16, padding: spacing.lg,
    shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 2,
  },
  title: { fontSize: 20, fontWeight: "700", color: colors.text, marginBottom: spacing.md, textAlign: "center" },
  row: { flexDirection: "row", justifyContent: "space-between", marginBottom: spacing.sm },
  label: { color: colors.textMuted },
  value: { color: colors.text, fontWeight: "600" },
  divider: { height: 1, backgroundColor: colors.border, marginVertical: spacing.md },
  amountLabel: { fontSize: 16, fontWeight: "700", color: colors.text },
  amountValue: { fontSize: 20, fontWeight: "800", color: colors.primaryDark },
  note: { color: colors.textMuted, fontSize: 12, marginTop: spacing.lg, textAlign: "center" },
  payButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: spacing.lg },
  payButtonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
