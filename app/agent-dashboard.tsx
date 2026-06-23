import { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import type { AgentDemande, DemandeStatut } from "@/store/types";

const API_URL = "https://e-citoyen-ci-backend.onrender.com/api/demandes/";

type FilterType = "toutes" | "en_attente" | "verifiee" | "confirmee";

const FILTERS: { key: FilterType; label: string }[] = [
  { key: "toutes", label: "Toutes" },
  { key: "en_attente", label: "En attente" },
  { key: "verifiee", label: "Vérifiée" },
  { key: "confirmee", label: "Confirmée" },
];

function getStatusColor(statut: DemandeStatut): string {
  switch (statut) {
    case "en_attente":
      return Colors.accent;
    case "verifiee":
      return "#2196F3";
    case "confirmee":
      return Colors.primary;
    default:
      return Colors.textMuted;
  }
}

function getStatusLabel(statut: DemandeStatut): string {
  switch (statut) {
    case "en_attente":
      return "En attente";
    case "verifiee":
      return "Vérifiée";
    case "confirmee":
      return "Confirmée";
    default:
      return statut;
  }
}

export default function AgentDashboard() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const accessToken = useAppStore((s) => s.accessToken);
  const user = useAppStore((s) => s.user);
  const logout = useAppStore((s) => s.logout);

  const [demandes, setDemandes] = useState<AgentDemande[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<FilterType>("toutes");

  const fetchDemandes = useCallback(async (showFullLoader = false) => {
    if (!accessToken) {
      setError("Session expirée. Veuillez vous reconnecter.");
      return;
    }

    if (showFullLoader) {
      setIsLoading(true);
    }
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Session expirée. Veuillez vous reconnecter.");
        }
        throw new Error(`Erreur serveur (${response.status}). Veuillez réessayer.`);
      }

      const data = await response.json();
      // Handle both array and object with demandes property
      const demandesList: AgentDemande[] = Array.isArray(data) ? data : data.demandes ?? [];
      setDemandes(demandesList);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Impossible de charger les demandes. Vérifiez votre connexion.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [accessToken]);

  useEffect(() => {
    fetchDemandes(true);
  }, [fetchDemandes]);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    fetchDemandes(false);
  }, [fetchDemandes]);

  const handleRetry = useCallback(() => {
    fetchDemandes(true);
  }, [fetchDemandes]);

  const handleLogout = useCallback(() => {
    logout();
    router.replace("/login");
  }, [logout, router]);

  const handleDemandePress = useCallback(
    (demande: AgentDemande) => {
      router.push({
        pathname: "/agent-demande-detail",
        params: { id: demande._id },
      });
    },
    [router]
  );

  const filteredDemandes = useMemo(() => {
    if (activeFilter === "toutes") return demandes;
    return demandes.filter((d) => d.statut === activeFilter);
  }, [demandes, activeFilter]);

  const handleFilterPress = useCallback((filter: FilterType) => {
    setActiveFilter(filter);
  }, []);

  const renderDemandeItem = useCallback(
    ({ item }: { item: AgentDemande }) => {
      const dateStr = new Date(item.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
      const displayName = item.userName || item.userEmail || "Citoyen anonyme";
      const statusColor = getStatusColor(item.statut);
      const statusLabel = getStatusLabel(item.statut);

      return (
        <TouchableOpacity
          style={styles.demandeCard}
          onPress={() => handleDemandePress(item)}
          activeOpacity={0.7}
        >
          <View style={styles.cardTopRow}>
            <View style={styles.userInfo}>
              <View style={styles.avatarContainer}>
                <Ionicons name="person-outline" size={18} color={Colors.primary} />
              </View>
              <Text style={styles.userName} numberOfLines={1}>
                {displayName}
              </Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor }]}>
              <Text style={styles.statusBadgeText}>{statusLabel}</Text>
            </View>
          </View>

          <Text style={styles.demandeMessage} numberOfLines={2}>
            {item.message}
          </Text>

          <View style={styles.cardFooter}>
            <View style={styles.dateRow}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textMuted} />
              <Text style={styles.dateText}>{dateStr}</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={Colors.accent} />
          </View>
        </TouchableOpacity>
      );
    },
    [handleDemandePress]
  );

  const renderEmptyState = useCallback(() => {
    if (isLoading) return null;
    return (
      <View style={styles.emptyState}>
        <View style={styles.emptyIconContainer}>
          <Ionicons name="documents-outline" size={48} color={Colors.primary} />
        </View>
        <Text style={styles.emptyText}>
          {activeFilter === "toutes"
            ? "Aucune demande pour le moment"
            : `Aucune demande "${getStatusLabel(activeFilter as DemandeStatut)}"`}
        </Text>
        <Text style={styles.emptySubtext}>
          Les demandes des citoyens apparaitront ici.
        </Text>
      </View>
    );
  }, [isLoading, activeFilter]);

  // Redirect if not agent
  if (!accessToken || user?.role !== "agent") {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <View style={styles.errorState}>
          <Ionicons name="lock-closed-outline" size={56} color={Colors.accent} />
          <Text style={styles.errorTitle}>Accès refusé</Text>
          <Text style={styles.errorSubtitle}>
            Vous devez être connecté en tant qu&apos;agent pour accéder à cette page.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={() => router.replace("/login")}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Se connecter</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>Tableau de bord</Text>
          <Text style={styles.headerSubtitle}>Agent administratif</Text>
        </View>
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogout}
          activeOpacity={0.7}
        >
          <Ionicons name="log-out-outline" size={22} color={Colors.accent} />
        </TouchableOpacity>
      </View>

      {/* Filter bar */}
      <View style={styles.filterContainer}>
        <FlatList
          horizontal
          data={FILTERS}
          keyExtractor={(item) => item.key}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterList}
          style={{ flexGrow: 0 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.filterButton,
                activeFilter === item.key && styles.filterButtonActive,
              ]}
              onPress={() => handleFilterPress(item.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.filterButtonText,
                  activeFilter === item.key && styles.filterButtonTextActive,
                ]}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Error state */}
      {error ? (
        <View style={styles.errorBanner}>
          <Ionicons name="alert-circle" size={18} color={Colors.error} />
          <Text style={styles.errorBannerText}>{error}</Text>
          <TouchableOpacity onPress={handleRetry} activeOpacity={0.7}>
            <Text style={styles.retryText}>Réessayer</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Loading state */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={Colors.primary} />
          <Text style={styles.loadingText}>Chargement des demandes...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredDemandes}
          keyExtractor={(item) => item._id}
          renderItem={renderDemandeItem}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: insets.bottom + 24 },
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={renderEmptyState}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary}
              colors={[Colors.primary]}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  centerContent: {
    alignItems: "center",
    justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontFamily: Fonts.bold,
    fontSize: 24,
    color: Colors.primary,
    letterSpacing: -0.3,
  },
  headerSubtitle: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textMuted,
    marginTop: 2,
  },
  logoutButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterList: {
    paddingHorizontal: 24,
    gap: 10,
  },
  filterButton: {
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: Colors.cardBackground,
    borderWidth: 1,
    borderColor: Colors.border,
    minHeight: 44,
    justifyContent: "center",
  },
  filterButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  filterButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  filterButtonTextActive: {
    color: Colors.white,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginHorizontal: 24,
    marginBottom: 12,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#FFCCCC",
  },
  errorBannerText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.error,
    lineHeight: 20,
  },
  retryText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.primary,
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.textMuted,
  },
  listContent: {
    paddingHorizontal: 24,
    gap: 12,
  },
  demandeCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    borderCurve: "continuous",
    boxShadow: "0 2px 8px rgba(46, 107, 87, 0.08)",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  userInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    flex: 1,
    marginRight: 12,
  },
  avatarContainer: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  userName: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.textPrimary,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
    color: Colors.white,
  },
  demandeMessage: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  dateRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dateText: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textMuted,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 24,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  emptySubtext: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textMuted,
    textAlign: "center",
    marginTop: 8,
    lineHeight: 20,
  },
  errorState: {
    alignItems: "center",
    padding: 32,
    gap: 12,
  },
  errorTitle: {
    fontFamily: Fonts.bold,
    fontSize: 20,
    color: Colors.textPrimary,
    textAlign: "center",
  },
  errorSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 32,
    marginTop: 20,
  },
  primaryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.white,
  },
});
