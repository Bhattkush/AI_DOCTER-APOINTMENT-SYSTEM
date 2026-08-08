import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import api from "../api/api";
import { colors, spacing } from "../theme";

function nextNDays(n) {
  const days = [];
  const today = new Date();
  for (let i = 0; i < n; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    days.push(d);
  }
  return days;
}

function formatDateLabel(date) {
  return date.toLocaleDateString("en-IN", { weekday: "short", day: "2-digit", month: "short" });
}

function toISODate(date) {
  return date.toISOString().split("T")[0];
}

export default function DoctorDetailsScreen({ route, navigation }) {
  const { doctorId } = route.params;
  const [doctor, setDoctor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [dates] = useState(nextNDays(14));
  const [selectedDate, setSelectedDate] = useState(dates[0]);
  const [slots, setSlots] = useState([]);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/doctors/${doctorId}`);
        setDoctor(data);
      } catch (err) {
        Alert.alert("Error", err.message);
      } finally {
        setLoading(false);
      }
    })();
  }, [doctorId]);

  useEffect(() => {
    (async () => {
      setSlotsLoading(true);
      setSelectedSlot(null);
      try {
        const { data } = await api.get(`/doctors/${doctorId}/slots`, {
          params: { date: toISODate(selectedDate) },
        });
        setSlots(data);
      } catch (err) {
        Alert.alert("Error loading slots", err.message);
        setSlots([]);
      } finally {
        setSlotsLoading(false);
      }
    })();
  }, [doctorId, selectedDate]);

  const handleBook = () => {
    if (!selectedSlot) {
      Alert.alert("Select a slot", "Please choose an available time slot first.");
      return;
    }
    navigation.navigate("Payment", {
      doctorId,
      doctorName: doctor.full_name,
      clinicName: doctor.clinic?.name,
      fee: doctor.consultation_fee,
      appointmentDate: toISODate(selectedDate),
      appointmentDateLabel: formatDateLabel(selectedDate),
      appointmentTime: selectedSlot,
    });
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (!doctor) {
    return (
      <View style={styles.center}>
        <Text>Doctor not found.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <ScrollView contentContainerStyle={{ padding: spacing.lg, paddingBottom: 120 }}>
        <View style={styles.headerCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{doctor.full_name?.charAt(0)}</Text>
          </View>
          <Text style={styles.doctorName}>{doctor.full_name}</Text>
          <Text style={styles.specialization}>{doctor.specialization?.name}</Text>
          <Text style={styles.experience}>{doctor.experience_years} years experience</Text>

          <View style={styles.feeRow}>
            <Text style={styles.feeLabel}>Consultation Fee</Text>
            <Text style={styles.feeValue}>₹{doctor.consultation_fee}</Text>
          </View>

          {doctor.clinic && (
            <View style={styles.clinicBox}>
              <Text style={styles.clinicName}>{doctor.clinic.name}</Text>
              <Text style={styles.clinicAddress}>{doctor.clinic.address}</Text>
              <Text style={styles.clinicCity}>{doctor.clinic.city}</Text>
            </View>
          )}

          {doctor.bio && <Text style={styles.bio}>{doctor.bio}</Text>}
        </View>

        <Text style={styles.sectionTitle}>Select Date</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: spacing.md }}>
          {dates.map((d) => {
            const active = toISODate(d) === toISODate(selectedDate);
            return (
              <TouchableOpacity
                key={toISODate(d)}
                style={[styles.dateChip, active && styles.dateChipActive]}
                onPress={() => setSelectedDate(d)}
              >
                <Text style={[styles.dateChipText, active && styles.dateChipTextActive]}>
                  {formatDateLabel(d)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <Text style={styles.sectionTitle}>Select Time Slot</Text>
        {slotsLoading ? (
          <ActivityIndicator color={colors.primary} />
        ) : slots.length === 0 ? (
          <Text style={styles.noSlots}>Doctor is not available on this date.</Text>
        ) : (
          <View style={styles.slotGrid}>
            {slots.map((slot) => {
              const active = selectedSlot === slot.time;
              return (
                <TouchableOpacity
                  key={slot.time}
                  disabled={!slot.available}
                  style={[
                    styles.slotChip,
                    active && styles.slotChipActive,
                    !slot.available && styles.slotChipDisabled,
                  ]}
                  onPress={() => setSelectedSlot(slot.time)}
                >
                  <Text
                    style={[
                      styles.slotText,
                      active && styles.slotTextActive,
                      !slot.available && styles.slotTextDisabled,
                    ]}
                  >
                    {slot.time}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.bookButton} onPress={handleBook}>
          <Text style={styles.bookButtonText}>
            Book Appointment {selectedSlot ? `• ${selectedSlot}` : ""}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  headerCard: {
    backgroundColor: "#fff", borderRadius: 16, padding: spacing.lg, alignItems: "center",
    marginBottom: spacing.lg, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  avatar: {
    width: 64, height: 64, borderRadius: 32, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", marginBottom: spacing.sm,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 24 },
  doctorName: { fontSize: 20, fontWeight: "700", color: colors.text },
  specialization: { color: colors.textMuted, marginTop: 2 },
  experience: { color: colors.textMuted, fontSize: 12, marginTop: 2 },
  feeRow: {
    flexDirection: "row", justifyContent: "space-between", width: "100%",
    marginTop: spacing.md, paddingTop: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  feeLabel: { color: colors.textMuted },
  feeValue: { color: colors.primaryDark, fontWeight: "700", fontSize: 16 },
  clinicBox: { width: "100%", backgroundColor: "#F9FAFB", borderRadius: 10, padding: spacing.sm, marginTop: spacing.md },
  clinicName: { fontWeight: "700", color: colors.text },
  clinicAddress: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  clinicCity: { color: colors.textMuted, fontSize: 13 },
  bio: { color: colors.textMuted, marginTop: spacing.md, textAlign: "center", fontSize: 13 },
  sectionTitle: { fontSize: 15, fontWeight: "700", color: colors.text, marginBottom: spacing.sm },
  dateChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#fff",
    borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm,
  },
  dateChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  dateChipText: { color: colors.text, fontSize: 12, fontWeight: "600" },
  dateChipTextActive: { color: "#fff" },
  noSlots: { color: colors.textMuted, fontStyle: "italic" },
  slotGrid: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
  slotChip: {
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 10, backgroundColor: "#fff",
    borderWidth: 1, borderColor: colors.border, marginRight: 10, marginBottom: 10,
  },
  slotChipActive: { backgroundColor: colors.primary, borderColor: colors.primary },
  slotChipDisabled: { backgroundColor: "#F3F4F6", borderColor: "#F3F4F6" },
  slotText: { color: colors.text, fontWeight: "600", fontSize: 13 },
  slotTextActive: { color: "#fff" },
  slotTextDisabled: { color: "#B0B7C3", textDecorationLine: "line-through" },
  footer: {
    position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "#fff",
    padding: spacing.md, borderTopWidth: 1, borderTopColor: colors.border,
  },
  bookButton: { backgroundColor: colors.primary, borderRadius: 12, paddingVertical: 14, alignItems: "center" },
  bookButtonText: { color: "#fff", fontWeight: "700", fontSize: 15 },
});
