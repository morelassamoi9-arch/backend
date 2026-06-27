import { useEffect } from "react";
import {
  View, Text, TouchableOpacity, FlatList,
  StyleSheet, ActivityIndicator
} from "react-native";
import { router } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "../../constants/Colors";
import { Fonts } from "../../constants/Typography";
import { useAppStore } from "../../store/useAppStore";
import type { DemandeStatus } from "../../store/types";

const STATUS_CONFIG: Record<DemandeStatus, { label: string; color: string; bg: string; icon: string }> = {
  en_attente: { label: "En attente", color: Colors.pending,    bg: "#FFF3E0", icon: "time-outline" },
  en_cours:   { label: "En cours",   color: Colors.inProgress, bg: "#FFF8E1", icon: "sync-outline" },
  traitee:    { label: "Traitée",    color: Colors.success,    bg: "#E8F5E9", icon: "checkmark-circle-outline" },
  rejetee:    { label: "Rejetée",    color: Colors.error,      bg: "#FFEBEE", icon: "close-circle-outline" },
  erreur:     { label: "Erreur",     color: Colors.error,      bg: "#FFEBEE", icon: "alert-circle-outline" },
};

function StatusBadge({ status }: { status: DemandeStatus }) {
  const cfg = STATUS_CONFIG[status] ?? STATUS_CONFIG.en_attente;
  return (
    <View style={[styles.badge, { backgroundColor: cfg.bg }]}>
      <Ionicons name={cfg.icon as any} size={13} color={cfg.color} style={{ marginRight: 4 }} />
      <Text style={[styles.badgeText, { color: cfg.color }]}>{cfg.label}</Text>
    </View>
  );
}

export default function MyRequests() {
  const { requests, isLoading, fetchRequests } = useAppStore();
  const insets = useSafeAreaInsets();

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
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity style={styles.backBtn} onPress={() => router.back()} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={Colors.primary} />
          <Text style={styles.backText}>Retour</Text>
        </TouchableOpacity>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Mes demandes</Text>
          <View style={styles.countBadge}>
            <Text style={styles.countText}>
              {requests.length}
            </Text>
          </View>
        </View>
      </View>

      {/* List */}
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[styles.listContainer, { paddingBottom: insets.bottom + 20 }]}
        ListEmptyComponent={
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={48} color={Colors.textLight} />
            <Text style={styles.emptyText}>Aucune demande pour le moment</Text>
            <TouchableOpacity
              style={styles.newBtn}
              onPress={() => router.push("/(citizen)/new-request")}
              activeOpacity={0.8}
            >
              <Text style={styles.newBtnText}>Faire une nouvelle demande</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.card}
            onPress={() =>
              router.push({ pathname: "/(citizen)/request/[id]", params: { id: item.id } })
            }
            activeOpacity={0.85}
          >
            <View style={styles.cardTop}>
              <StatusBadge status={item.status} />
              <Text style={styles.cardDate}>
                {new Date(item.createdAt).toLocaleDateString("fr-FR")}
              </Text>
            </View>

            <Text style={styles.cardMessage} numberOfLines={2}>
              {item.message}
            </Text>

            {item.aiResponse ? (
              <View style={styles.aiSnippetContainer}>
                <Ionicons 
                  name="chatbubble-ellipses-outline" 
                  size={15} 
                  color={Colors.textSecondary} 
                  style={{ marginRight: 6, marginTop: 2 }} 
                />
                <Text style={styles.cardSituation} numberOfLines={2}>
                  {item.aiResponse.situation}
                </Text>
              </View>
            ) : (
              <View style={styles.aiPendingContainer}>
                <ActivityIndicator size="small" color={Colors.stamp} style={{ marginRight: 6 }} />
                <Text style={styles.aiPendingText}>Analyse administrative en cours...</Text>
              </View>
            )}

            <View style={styles.cardFooter}>
              <Text style={styles.viewDetailsText}>Consulter la réponse</Text>
              <Ionicons name="chevron-forward" size={14} color={Colors.primary} />
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: Colors.background 
  },
  centered: { 
    flex: 1, 
    justifyContent: "center", 
    alignItems: "center",
    backgroundColor: Colors.background 
  },
  header: { 
    paddingHorizontal: 20, 
    paddingBottom: 16, 
    borderBottomWidth: 1, 
    borderBottomColor: Colors.border,
    backgroundColor: Colors.white 
  },
  backBtn: { 
    flexDirection: "row", 
    alignItems: "center", 
    marginBottom: 10 
  },
  backText: { 
    fontFamily: Fonts.medium, 
    fontSize: 15, 
    color: Colors.primary, 
    marginLeft: 4 
  },
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8
  },
  title: { 
    fontFamily: Fonts.serifBold, 
    fontSize: 24, 
    color: Colors.text 
  },
  countBadge: {
    backgroundColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  countText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.textSecondary,
  },
  listContainer: { 
    padding: 16 
  },
  emptyCard: { 
    alignItems: "center", 
    paddingVertical: 64,
    backgroundColor: Colors.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 20,
    paddingHorizontal: 20
  },
  emptyText: { 
    fontFamily: Fonts.regular, 
    fontSize: 15, 
    color: Colors.textSecondary,
    marginTop: 12,
    textAlign: "center"
  },
  newBtn: { 
    marginTop: 20, 
    backgroundColor: Colors.primary, 
    paddingHorizontal: 20, 
    paddingVertical: 14, 
    borderRadius: 12,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3
  },
  newBtnText: { 
    color: Colors.white, 
    fontFamily: Fonts.semiBold, 
    fontSize: 15 
  },
  card: { 
    backgroundColor: Colors.white, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: Colors.border, 
    padding: 16, 
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  cardTop: { 
    flexDirection: "row", 
    justifyContent: "space-between", 
    alignItems: "center", 
    marginBottom: 12 
  },
  cardDate: { 
    fontFamily: Fonts.regular, 
    fontSize: 12, 
    color: Colors.textSecondary 
  },
  cardMessage: { 
    fontFamily: Fonts.medium, 
    fontSize: 15, 
    color: Colors.text, 
    lineHeight: 22,
    marginBottom: 12
  },
  aiSnippetContainer: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: Colors.beige,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  cardSituation: { 
    fontFamily: Fonts.regular, 
    fontSize: 13, 
    color: Colors.textSecondary, 
    lineHeight: 18,
    flex: 1
  },
  aiPendingContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.inputBg,
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: Colors.borderLight
  },
  aiPendingText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.stamp,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: Colors.borderLight,
    paddingTop: 10,
    marginTop: 4
  },
  viewDetailsText: {
    fontFamily: Fonts.semiBold,
    fontSize: 13,
    color: Colors.primary,
  },
  badge: { 
    flexDirection: "row", 
    alignItems: "center", 
    paddingHorizontal: 8, 
    paddingVertical: 4, 
    borderRadius: 8 
  },
  badgeText: { 
    fontFamily: Fonts.semiBold, 
    fontSize: 12 
  },
});