import { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, ScrollView, StyleSheet, ActivityIndicator } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
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

function StatCard({ title, value, icon, iconColor, bgColor }: { title: string; value: string; icon: string; iconColor: string; bgColor: string }) {
  return (
    <View style={styles.statCard}>
      <View style={[styles.statIconContainer, { backgroundColor: bgColor }]}>
        <Text style={styles.statIcon}>{icon}</Text>
      </View>
      <View style={styles.statContent}>
        <Text style={styles.statValue}>{value}</Text>
        <Text style={styles.statTitle}>{title}</Text>
      </View>
    </View>
  );
}

function QuickActionCard({ title, icon, iconColor, bgColor, onPress }: { title: string; icon: string; iconColor: string; bgColor: string; onPress: () => void }) {
  return (
    <TouchableOpacity style={styles.quickActionCard} onPress={onPress}>
      <View style={[styles.quickActionIconContainer, { backgroundColor: bgColor }]}>
        <Text style={styles.quickActionIcon}>{icon}</Text>
      </View>
      <Text style={styles.quickActionTitle}>{title}</Text>
    </TouchableOpacity>
  );
}

export default function CitizenDashboard() {
  const { user, requests, isLoading, fetchRequests, logout } = useAppStore();
  const [loadingStats, setLoadingStats] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    fetchRequests().finally(() => setLoadingStats(false));
  }, []);

  const recent = requests.slice(0, 3);

  // Calcul des statistiques
  const stats = {
    total: requests.length,
    pending: requests.filter(r => r.status === 'en_attente').length,
    confirmed: requests.filter(r => r.status === 'traitee').length,
  };

  const userName = user?.prenom || user?.nom || "Citoyen";

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 32 }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <View style={styles.headerContent}>
          <View style={styles.logoContainer}>
            <Text style={styles.logoText}>🇨🇮</Text>
          </View>
          <View>
            <Text style={styles.headerTitle}>e-Citoyen CI</Text>
            <Text style={styles.headerSubtitle}>Tableau de bord</Text>
          </View>
        </View>
        <TouchableOpacity onPress={logout} style={styles.logoutBtn}>
          <Text style={styles.logoutText}>🚪</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <Text style={styles.greeting}>
            {loadingStats ? "..." : `Bienvenue, ${userName} 👋`}
          </Text>
          <Text style={styles.subtitle}>Gérez vos démarches administratives en toute simplicité</Text>
        </View>

        {/* Statistics */}
        <View style={styles.statsContainer}>
          <StatCard
            title="Total de demandes"
            value={loadingStats ? "..." : String(stats.total)}
            icon="📄"
            iconColor={Colors.primary}
            bgColor={Colors.primary + '20'}
          />
          <StatCard
            title="En attente"
            value={loadingStats ? "..." : String(stats.pending)}
            icon="⏰"
            iconColor={Colors.pending}
            bgColor={Colors.pending + '20'}
          />
          <StatCard
            title="Confirmées"
            value={loadingStats ? "..." : String(stats.confirmed)}
            icon="✅"
            iconColor={Colors.success}
            bgColor={Colors.success + '20'}
          />
        </View>

        {/* New Request Button */}
        <TouchableOpacity
          style={styles.newRequestBtn}
          onPress={() => router.push("/(citizen)/new-request")}
        >
          <Text style={styles.newRequestText}>+ Nouvelle Demande</Text>
        </TouchableOpacity>

        {/* Recent Requests */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Demandes récentes</Text>
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
              <Text style={styles.emptyText}>Aucune demande pour le moment</Text>
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

        {/* Quick Actions */}
        <View style={styles.quickActionsContainer}>
          <QuickActionCard
            title="Mes demandes"
            icon="📄"
            iconColor={Colors.primary}
            bgColor={Colors.primary + '20'}
            onPress={() => router.push("/(citizen)/requests")}
          />
          <QuickActionCard
            title="Nouvelle demande"
            icon="➕"
            iconColor={Colors.success}
            bgColor={Colors.success + '20'}
            onPress={() => router.push("/(citizen)/new-request")}
          />
          <QuickActionCard
            title="Historique"
            icon="⏰"
            iconColor={Colors.pending}
            bgColor={Colors.pending + '20'}
            onPress={() => router.push("/(citizen)/requests")}
          />
          <QuickActionCard
            title="Aide"
            icon="❓"
            iconColor={Colors.success}
            bgColor={Colors.success + '20'}
            onPress={() => router.push("/(citizen)/help")}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  logoContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primary + '20',
    justifyContent: "center",
    alignItems: "center",
  },
  logoText: {
    fontSize: 20,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  headerSubtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  logoutBtn: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.background,
    justifyContent: "center",
    alignItems: "center",
  },
  logoutText: {
    fontSize: 20,
  },
  content: {
    padding: 16,
  },
  welcomeSection: {
    marginBottom: 24,
  },
  greeting: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "45%",
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  statIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  statIcon: {
    fontSize: 20,
  },
  statContent: {
    flex: 1,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
  },
  statTitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  newRequestBtn: {
    backgroundColor: Colors.primary,
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 24,
  },
  newRequestText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: "600",
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  seeAll: {
    fontSize: 14,
    color: Colors.primary,
  },
  emptyCard: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: "center",
  },
  emptyText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    padding: 16,
    marginBottom: 12,
  },
  cardMessage: {
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardDate: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: "600",
  },
  quickActionsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickActionCard: {
    width: "48%",
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: "center",
  },
  quickActionIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  quickActionIcon: {
    fontSize: 24,
  },
  quickActionTitle: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.text,
  },
});