import { useEffect } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator
} from "react-native";
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

export default function MyRequests() {
  const { requests, isLoading, fetchRequests } = useAppStore();

  useEffect(() => {
    fetchRequests();
  }, []);

  if (isLoading && requests.length === 0) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator color={Colors.primary} size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={styles.back}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mes demandes</Text>
        <Text style={styles.count}>
          {requests.length} demande{requests.length !== 1 ? "s" : ""}
        </Text>
      </View>

      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ padding: 16, paddingBottom: 32 }}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Text style={styles.emptyText}>Aucune demande</Text>
            <TouchableOpacity
              style={styles.newBtn}
              onPress={() => router.push("/(citizen)/new-request")}
            >
              <Text style={styles.newBtnText}>Faire une demande</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({ pathname: "/(citizen)/request/[id]", params: { id: item.id } })
            }
          >
            <View style={styles.cardTop}>
              <StatusBadge status={item.status} />
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString("fr-FR")}
              </Text>
            </View>
            <Text style={styles.cardMessage} numberOfLines={3}>{item.message}</Text>
            {item.aiResponse && (
              <Text style={styles.cardSituation} numberOfLines={2}>
                {item.aiResponse.situation}
              </Text>
            )}
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container:     { flex: 1, backgroundColor: Colors.background },
  centered:      { flex: 1, justifyContent: "center", alignItems: "center" },
  header:        { padding: 24, paddingTop: 56, borderBottomWidth: 1, borderBottomColor: Colors.border },
  back:          { fontSize: 14, color: Colors.primary, marginBottom: 8 },
  title:         { fontSize: 22, fontWeight: "700", color: Colors.text },
  count:         { fontSize: 13, color: Colors.textSecondary, marginTop: 2 },
  emptyCard:     { alignItems: "center", paddingVertical: 48 },
  emptyText:     { fontSize: 16, color: Colors.textSecondary },
  newBtn:        { marginTop: 16, backgroundColor: Colors.primary, paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10 },
  newBtnText:    { color: Colors.white, fontWeight: "600" },
  card:          { backgroundColor: Colors.beigeCard, borderRadius: 12, borderWidth: 1, borderColor: Colors.border, padding: 16, marginBottom: 12 },
  cardTop:       { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  cardDate:      { fontSize: 12, color: Colors.textSecondary },
  cardMessage:   { fontSize: 14, color: Colors.text, lineHeight: 20 },
  cardSituation: { fontSize: 13, color: Colors.textSecondary, marginTop: 8, fontStyle: "italic" },
  badge:         { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  badgeText:     { fontSize: 11, fontWeight: "600" },
});