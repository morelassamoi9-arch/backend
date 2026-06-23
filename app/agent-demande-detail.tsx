import { useState, useCallback, useEffect, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import type { AgentDemande, DemandeStatut } from "@/store/types";

const API_BASE = "https://e-citoyen-ci-backend.onrender.com/api/demandes";

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

export default function AgentDemandeDetail() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const accessToken = useAppStore((s) => s.accessToken);

  const [demande, setDemande] = useState<AgentDemande | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const fetchDemande = useCallback(async () => {
    if (!accessToken || !id) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`${API_BASE}/${id}`, {
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
        if (response.status === 404) {
          throw new Error("Demande introuvable.");
        }
        throw new Error(`Erreur serveur (${response.status}).`);
      }

      const data: AgentDemande = await response.json();
      setDemande(data);
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Impossible de charger la demande.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [accessToken, id]);

  useEffect(() => {
    fetchDemande();
  }, [fetchDemande]);

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleUpdateStatus = useCallback(
    async (newStatut: DemandeStatut) => {
      if (!accessToken || !id) return;

      setIsUpdating(true);
      setActionError(null);

      try {
        const response = await fetch(`${API_BASE}/${id}/statut`, {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ statut: newStatut }),
        });

        if (!response.ok) {
          if (response.status === 401) {
            throw new Error("Session expirée. Veuillez vous reconnecter.");
          }
          if (response.status === 403) {
            throw new Error("Vous n'avez pas les droits pour cette action.");
          }
          throw new Error(`Erreur lors de la mise à jour (${response.status}).`);
        }

        // Navigate back to dashboard on success
        router.back();
      } catch (err) {
        const errorMessage =
          err instanceof Error
            ? err.message
            : "Impossible de mettre à jour le statut.";
        setActionError(errorMessage);
      } finally {
        setIsUpdating(false);
      }
    },
    [accessToken, id, router]
  );

  const handleVerify = useCallback(() => {
    handleUpdateStatus("verifiee");
  }, [handleUpdateStatus]);

  const handleConfirm = useCallback(() => {
    handleUpdateStatus("confirmee");
  }, [handleUpdateStatus]);

  const formattedDate = useMemo(() => {
    if (!demande) return "";
    return new Date(demande.createdAt).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [demande]);

  // Loading state
  if (isLoading) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Chargement de la demande...</Text>
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={56} color={Colors.accent} />
          <Text style={styles.errorTitle}>Erreur</Text>
          <Text style={styles.errorSubtitle}>{error}</Text>
          <View style={styles.errorActions}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={handleGoBack}
              activeOpacity={0.8}
            >
              <Text style={styles.secondaryBtnText}>Retour</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.primaryBtn}
              onPress={fetchDemande}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryBtnText}>Réessayer</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  }

  if (!demande) return null;

  const reponse = demande.reponse_ia;
  const displayName = demande.userName || demande.userEmail || "Citoyen anonyme";

  return (
    <View style={[styles.container, { paddingTop: insets.top + 12 }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={handleGoBack}
          style={styles.backButton}
          activeOpacity={0.7}
        >
          <Ionicons name="arrow-back" size={24} color={Colors.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle} numberOfLines={1}>
          Détail de la demande
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 140 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Status and meta */}
        <View style={styles.metaCard}>
          <View style={styles.metaRow}>
            <View style={styles.metaItem}>
              <Ionicons name="person-outline" size={16} color={Colors.textMuted} />
              <Text style={styles.metaLabel}>{displayName}</Text>
            </View>
            <View
              style={[
                styles.statusBadge,
                { backgroundColor: getStatusColor(demande.statut) },
              ]}
            >
              <Text style={styles.statusBadgeText}>
                {getStatusLabel(demande.statut)}
              </Text>
            </View>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="calendar-outline" size={16} color={Colors.textMuted} />
            <Text style={styles.metaLabel}>{formattedDate}</Text>
          </View>
        </View>

        {/* Citizen message */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubble-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Message du citoyen</Text>
          </View>
          <Text style={styles.cardContent} selectable>
            {demande.message}
          </Text>
        </View>

        {/* AI Response sections */}
        {reponse ? (
          <>
            {/* Résumé */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
                <Text style={styles.cardTitle}>Résumé de la situation</Text>
              </View>
              <Text style={styles.cardContent} selectable>
                {reponse.resume_situation}
              </Text>
            </View>

            {/* Plan d'action */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="list-outline" size={20} color={Colors.primary} />
                <Text style={styles.cardTitle}>Plan d&apos;action</Text>
              </View>
              <Text style={styles.cardContent} selectable>
                {reponse.plan_action}
              </Text>
            </View>

            {/* Documents */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="folder-outline" size={20} color={Colors.primary} />
                <Text style={styles.cardTitle}>Documents à apporter</Text>
              </View>
              <Text style={styles.cardContent} selectable>
                {reponse.documents_a_apporter}
              </Text>
            </View>

            {/* Lieu */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="location-outline" size={20} color={Colors.primary} />
                <Text style={styles.cardTitle}>Lieu</Text>
              </View>
              <Text style={styles.cardContent} selectable>
                {reponse.lieu}
              </Text>
            </View>

            {/* Délai */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="time-outline" size={20} color={Colors.primary} />
                <Text style={styles.cardTitle}>Délai estimé</Text>
              </View>
              <Text style={styles.cardContent} selectable>
                {reponse.delai_estime}
              </Text>
            </View>

            {/* Coût */}
            <View style={styles.card}>
              <View style={styles.cardHeader}>
                <Ionicons name="cash-outline" size={20} color={Colors.primary} />
                <Text style={styles.cardTitle}>Coût</Text>
              </View>
              <Text style={styles.cardContent} selectable>
                {reponse.cout}
              </Text>
            </View>
          </>
        ) : (
          <View style={styles.noResponseCard}>
            <Ionicons name="information-circle-outline" size={24} color={Colors.textMuted} />
            <Text style={styles.noResponseText}>
              La réponse IA n&apos;est pas encore disponible pour cette demande.
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action buttons - fixed at bottom */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 16 }]}>
        {actionError ? (
          <View style={styles.actionErrorContainer}>
            <Ionicons name="alert-circle" size={16} color={Colors.error} />
            <Text style={styles.actionErrorText}>{actionError}</Text>
          </View>
        ) : null}

        <View style={styles.actionButtons}>
          <TouchableOpacity
            style={[
              styles.verifyButton,
              (isUpdating || demande.statut === "verifiee" || demande.statut === "confirmee") &&
                styles.buttonDisabled,
            ]}
            onPress={handleVerify}
            activeOpacity={0.8}
            disabled={isUpdating || demande.statut === "verifiee" || demande.statut === "confirmee"}
          >
            {isUpdating ? (
              <ActivityIndicator color={Colors.accent} size="small" />
            ) : (
              <>
                <Ionicons name="checkmark-circle-outline" size={20} color={Colors.accent} />
                <Text style={styles.verifyButtonText}>Vérifier</Text>
              </>
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.confirmButton,
              (isUpdating || demande.statut === "confirmee") && styles.buttonDisabled,
            ]}
            onPress={handleConfirm}
            activeOpacity={0.8}
            disabled={isUpdating || demande.statut === "confirmee"}
          >
            {isUpdating ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="shield-checkmark-outline" size={20} color={Colors.white} />
                <Text style={styles.confirmButtonText}>Confirmer</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Updating overlay */}
      {isUpdating ? (
        <View style={styles.updatingOverlay}>
          <View style={styles.updatingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.updatingText}>Mise à jour en cours...</Text>
          </View>
        </View>
      ) : null}
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
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: Colors.cardBackground,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    flex: 1,
    fontFamily: Fonts.bold,
    fontSize: 18,
    color: Colors.primary,
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 24,
    gap: 14,
  },
  metaCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 16,
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    borderCurve: "continuous",
  },
  metaRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  metaLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textSecondary,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontFamily: Fonts.semiBold,
    fontSize: 12,
    color: Colors.white,
  },
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    borderCurve: "continuous",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.primary,
  },
  cardContent: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 24,
  },
  noResponseCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    gap: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  noResponseText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textMuted,
    textAlign: "center",
    lineHeight: 22,
  },
  actionBar: {
    paddingHorizontal: 24,
    paddingTop: 14,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  actionErrorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 12,
    backgroundColor: "#FFF0F0",
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: "#FFCCCC",
  },
  actionErrorText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.error,
    lineHeight: 18,
  },
  actionButtons: {
    flexDirection: "row",
    gap: 12,
  },
  verifyButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: Colors.accent,
    backgroundColor: "transparent",
    minHeight: 52,
  },
  verifyButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.accent,
  },
  confirmButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: Colors.primary,
    minHeight: 52,
    boxShadow: "0 4px 14px rgba(46, 107, 87, 0.25)",
  },
  confirmButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.white,
  },
  buttonDisabled: {
    opacity: 0.4,
  },
  updatingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  updatingCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    gap: 16,
    boxShadow: "0 8px 32px rgba(46, 107, 87, 0.15)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  updatingText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.primary,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.textMuted,
    marginTop: 16,
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
  errorActions: {
    flexDirection: "row",
    gap: 12,
    marginTop: 20,
  },
  secondaryBtn: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  secondaryBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.primary,
  },
  primaryBtn: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  primaryBtnText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.white,
  },
});
