import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import api from "../api/api";
import { useAuth } from "../context/AuthContext";
import { colors, spacing } from "../theme";

export default function HomeScreen({ navigation }) {
  const { user, logout } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const loadDoctors = useCallback(async (searchTerm = "") => {
    try {
      setError(null);
      // GET /doctors requires only a valid login (any role) - this used to
      // fail silently on the patient app because the token wasn't being
      // attached; the axios interceptor in src/api/api.js fixes that.
      const { data } = await api.get("/doctors", {
        params: searchTerm ? { search: searchTerm } : {},
      });
      setDoctors(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      loadDoctors(search);
    }, [loadDoctors])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadDoctors(search);
  };

  const renderDoctor = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate("DoctorDetails", { doctorId: item.id })}
    >
      <View style={styles.cardHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{item.full_name?.charAt(0) || "D"}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.doctorName}>{item.full_name}</Text>
          <Text style={styles.specialization}>
            {item.specialization?.name || "General Physician"}
          </Text>
        </View>
        <View style={styles.feeBadge}>
          <Text style={styles.feeBadgeText}>₹{item.consultation_fee}</Text>
        </View>
      </View>

      {item.clinic && (
        <View style={styles.clinicRow}>
          <Text style={styles.clinicName}>{item.clinic.name}</Text>
          <Text style={styles.clinicCity}>{item.clinic.city}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.bookButton}
        onPress={() => navigation.navigate("DoctorDetails", { doctorId: item.id })}
      >
        <Text style={styles.bookButtonText}>View & Book Appointment</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.topBar}>
        <View>
          <Text style={styles.greeting}>Hello, {user?.full_name?.split(" ")[0] || "there"} 👋</Text>
          <Text style={styles.greetingSub}>Find and book a doctor</Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={styles.logout}>Logout</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search doctor by name..."
          value={search}
          onChangeText={setSearch}
          onSubmitEditing={() => {
            setLoading(true);
            loadDoctors(search);
          }}
          returnKeyType="search"
        />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }} size="large" color={colors.primary} />
      ) : error ? (
        <View style={styles.center}>
          <Text style={styles.errorText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => { setLoading(true); loadDoctors(search); }}>
            <Text style={styles.retryText}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : doctors.length === 0 ? (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No doctors found.</Text>
          <Text style={styles.emptySubText}>Try clearing your search or check back later.</Text>
        </View>
      ) : (
        <FlatList
          data={doctors}
          keyExtractor={(item) => item.id}
          renderItem={renderDoctor}
          contentContainerStyle={{ padding: spacing.md, paddingBottom: 40 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  topBar: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: spacing.lg, paddingTop: spacing.xl, paddingBottom: spacing.md,
  },
  greeting: { fontSize: 20, fontWeight: "700", color: colors.text },
  greetingSub: { color: colors.textMuted, marginTop: 2 },
  logout: { color: colors.danger, fontWeight: "600" },
  searchRow: { paddingHorizontal: spacing.lg, marginBottom: spacing.sm },
  searchInput: {
    backgroundColor: "#fff", borderRadius: 10, borderWidth: 1, borderColor: colors.border,
    paddingHorizontal: spacing.md, paddingVertical: 10, fontSize: 14,
  },
  card: {
    backgroundColor: "#fff", borderRadius: 14, padding: spacing.md, marginBottom: spacing.md,
    shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, elevation: 1,
  },
  cardHeader: { flexDirection: "row", alignItems: "center" },
  avatar: {
    width: 48, height: 48, borderRadius: 24, backgroundColor: colors.primary,
    alignItems: "center", justifyContent: "center", marginRight: spacing.sm,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 18 },
  doctorName: { fontSize: 16, fontWeight: "700", color: colors.text },
  specialization: { color: colors.textMuted, fontSize: 13, marginTop: 2 },
  feeBadge: { backgroundColor: "#F0FDFA", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  feeBadgeText: { color: colors.primaryDark, fontWeight: "700" },
  clinicRow: {
    flexDirection: "row", justifyContent: "space-between", marginTop: spacing.sm,
    paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border,
  },
  clinicName: { color: colors.text, fontWeight: "600", fontSize: 13 },
  clinicCity: { color: colors.textMuted, fontSize: 13 },
  bookButton: {
    backgroundColor: colors.primary, borderRadius: 8, paddingVertical: 10,
    alignItems: "center", marginTop: spacing.md,
  },
  bookButtonText: { color: "#fff", fontWeight: "700", fontSize: 13 },
  center: { flex: 1, alignItems: "center", justifyContent: "center", padding: spacing.lg },
  errorText: { color: colors.danger, textAlign: "center", marginBottom: spacing.md },
  retryButton: { backgroundColor: colors.primary, paddingHorizontal: 20, paddingVertical: 10, borderRadius: 8 },
  retryText: { color: "#fff", fontWeight: "700" },
  emptyText: { fontSize: 16, fontWeight: "600", color: colors.text },
  emptySubText: { color: colors.textMuted, marginTop: 4 },
});
