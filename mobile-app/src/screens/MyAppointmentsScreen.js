import React, { useCallback, useState } from "react";
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/api";
import { colors, spacing } from "../theme";

const STATUS_COLORS = {
  pending: colors.warning,
  booked: colors.primary,
  accepted: colors.primary,
  completed: colors.success,
  rejected: colors.danger,
  cancelled: colors.danger,
};

export default function MyAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const { data } = await api.get("/appointments/my");
      setAppointments(data);
    } catch (err) {
      // no-op, could show a toast
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      load();
    }, [load])
  );

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.rowBetween}>
        <Text style={styles.doctorName}>{item.doctor?.full_name}</Text>
        <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[item.status] || colors.textMuted }]}>
          <Text style={styles.statusText}>{item.status}</Text>
        </View>
      </View>
      <Text style={styles.clinic}>{item.doctor?.clinic_name}</Text>
      <View style={styles.detailsRow}>
        <Text style={styles.detail}>{item.appointment_date}</Text>
        <Text style={styles.detail}>{item.appointment_time}</Text>
        <Text style={styles.detail}>₹{item.amount ?? item.doctor?.consultation_fee}</Text>
      </View>
      {item.payment_status && (
        <Text style={styles.paymentStatus}>Payment: {item.payment_status}</Text>
      )}
    </View>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {appointments.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>You have no appointments yet.</Text>
        </View>
      ) : (
        <FlatList
          data={appointments}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={{ padding: spacing.md }}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load(); }} />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  emptyText: { color: colors.textMuted },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: spacing.md, marginBottom: spacing.md,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  rowBetween: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  doctorName: { fontSize: 16, fontWeight: "700", color: colors.text },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { color: "#fff", fontSize: 11, fontWeight: "700", textTransform: "capitalize" },
  clinic: { color: colors.textMuted, marginTop: 2, fontSize: 13 },
  detailsRow: {
    flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm,
    paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border,
  },
  detail: { color: colors.text, fontSize: 13, fontWeight: "600" },
  paymentStatus: { color: colors.textMuted, fontSize: 12, marginTop: spacing.xs, textTransform: "capitalize" },
});
