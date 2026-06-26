import { useEffect } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/Colors";
import { useAppStore } from "../../store/useAppStore";
import type { DemandeStatus } from "../../store/types";

const STATUS_CONFIG: Record<DemandeStatus, { label: string; color: string; bg: string }> = {
  en_attente: { label: "En attente", color: Colors.pending,    bg: "#FFF3E0" },
  en_cours:   { label: "En cours",   color: Colors.inProgress, bg: "#FFF8E1" },
  traitee:    { label: "Traitée",    color: Colors.success,    bg: "#E8F5E9" },
  rejetee:    { label: "Rejetée",    color: Colors.error,      bg: "#FFEBEE" },
};

function StatusBadge({ status }: { status: DemandeStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.en_attente;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

export default function CitizenDashboard() {
  const { user, requests, isLoading, fetchRequests, logout } = useAppStore();

  useEffect(() => {
    fetchRequests();
  }, []);

  const recent = requests.slice(0, 3);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Bonjour, {user?.nom} 👋</Text>
          <Text style={styles.subtitle}>Comment puis-je vous aider ?</Text>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>Déconnexion</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity
        style={styles.newRequestBtn}
        onPress={() => router.push("/(citizen)/new-request")}
      >
        <Text style={styles.newRequestText}>+ Nouvelle demande</Text>
        <Text style={styles.newRequestSub}>Décrivez votre situation, on s'occupe du reste</Text>
      </TouchableOpacity>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Mes dernières demandes</Text>
          {requests.length > 0 && (
            <TouchableOpacity onPress={() => router.push("/(citizen)/requests")}>
              <Text style={styles.seeAll}>Voir tout</Text>
            </TouchableOpacity>
          )}
        </View>

        {isLoading ? (
          <ActivityIndicator color={Colors.primary} style={{ marginTop: 16 }} />
        ) : recent.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucune demande pour l'instant</Text>
            <Text style={styles.emptyHint}>Appuyez sur "+ Nouvelle demande" pour commencer</Text>
          </View>
        ) : (
          recent.map((req) => (
            <TouchableOpacity
              key={req.id}
              style={styles.card}
              onPress={() =>
                router.push({ pathname: "/(citizen)/request/[id]", params: { id: req.id } })
              }
            >
              <Text style={styles.cardMessage} numberOfLines={2}>{req.message}</Text>
              <View style={styles.cardFooter}>
                <StatusBadge status={req.status} />
                <Text style={styles.cardDate}>
                  {new Date(req.createdAt).toLocaleDateString("fr-FR")}
                </Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:       { flex: 1, backgroundColor: Colors.background },
  header:          { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", padding: 24, paddingTop: 56 },
  greeting:        { fontSize: 22, fontWeight: "700", color: Colors.text },
  subtitle:        { fontSize: 14, color: Colors.textSecondary, marginTop: 2 },
  logoutBtn: { paddingHorizontal: 8, paddingVertical: 5, borderRadius: 8, borderWidth: 1, borderColor: Colors.border, maxWidth: 90 },
  logoutText: { fontSize: 11, color: Colors.textSecondary },
  newRequestBtn:   { marginHorizontal: 16, marginBottom: 24, padding: 20, backgroundColor: Colors.primary, borderRadius: 16 },
  newRequestText:  { fontSize: 18, fontWeight: "700", color: Colors.white },
  newRequestSub:   { fontSize: 12, color: "rgba(255,255,255,0.8)", marginTop: 4 },
  section:         { paddingHorizontal: 16 },
  sectionHeader:   { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  sectionTitle:    { fontSize: 16, fontWeight: "600", color: Colors.text },
  seeAll:          { fontSize: 13, color: Colors.primary },
  emptyCard:       { padding: 24, backgroundColor: Colors.beigeCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, alignItems: "center" },
  emptyText:       { fontSize: 15, color: Colors.text, fontWeight: "500" },
  emptyHint:       { fontSize: 12, color: Colors.textSecondary, marginTop: 4, textAlign: "center" },
  card:            { backgroundColor: Colors.beigeCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 12 },
  cardMessage:     { fontSize: 14, color: Colors.text, lineHeight: 20, marginBottom: 12 },
  cardFooter:      { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardDate:        { fontSize: 12, color: Colors.textSecondary },
  badge:           { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText:       { fontSize: 11, fontWeight: "600" },
});