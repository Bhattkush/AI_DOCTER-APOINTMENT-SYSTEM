import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { colors, spacing } from "../theme";

export default function PaymentSuccessScreen({ route, navigation }) {
  const { appointment } = route.params || {};

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Payment Successful</Text>
        <Text style={styles.subtitle}>₹100 Paid</Text>
        <Text style={styles.status}>Appointment Confirmed</Text>

        {appointment ? (
          <View style={styles.details}>
            <Text style={styles.detailLabel}>Doctor</Text>
            <Text style={styles.detailValue}>{appointment.doctor?.full_name}</Text>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{appointment.appointment_date}</Text>
            <Text style={styles.detailLabel}>Time</Text>
            <Text style={styles.detailValue}>{appointment.appointment_time}</Text>
          </View>
        ) : null}

        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.reset({ index: 1, routes: [{ name: "Home" }, { name: "MyAppointments" }] })}
        >
          <Text style={styles.buttonText}>View My Appointments</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background, justifyContent: "center", padding: spacing.lg },
  card: { backgroundColor: "#fff", borderRadius: 16, padding: spacing.lg, shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 12, elevation: 2 },
  title: { fontSize: 24, fontWeight: "800", color: colors.text, marginBottom: spacing.sm, textAlign: "center" },
  subtitle: { fontSize: 20, fontWeight: "700", color: colors.primary, textAlign: "center", marginBottom: spacing.sm },
  status: { fontSize: 16, fontWeight: "700", color: colors.success, textAlign: "center", marginBottom: spacing.lg },
  details: { marginTop: spacing.md },
  detailLabel: { color: colors.textMuted, fontSize: 12, marginTop: spacing.sm },
  detailValue: { color: colors.text, fontSize: 16, fontWeight: "600" },
  button: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 16, alignItems: "center", marginTop: spacing.lg },
  buttonText: { color: "#fff", fontWeight: "700", fontSize: 16 },
});
