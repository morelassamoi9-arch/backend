import { useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import type { DemandeRequest } from "@/store/types";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const demandes = useAppStore((s) => s.demandes);

  const handleNewRequest = useCallback(() => {
    router.push("/nouvelle-demande");
  }, [router]);

  const handleViewRequest = useCallback(
    (demande: DemandeRequest) => {
      router.push({
        pathname: "/resultat",
        params: { id: demande.id },
      });
    },
    [router]
  );

  const formattedDemandes = useMemo(() => {
    return demandes.map((d) => ({
      ...d,
      formattedDate: new Date(d.createdAt).toLocaleDateString("fr-FR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
      truncatedMessage:
        d.message.length > 80 ? `${d.message.slice(0, 80)}...` : d.message,
    }));
  }, [demandes]);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={[
        styles.contentContainer,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Flag accent strip */}
      <View style={styles.flagStrip}>
        <View style={[styles.flagBand, { backgroundColor: Colors.flagOrange }]} />
        <View style={[styles.flagBand, { backgroundColor: Colors.flagWhite }]} />
        <View style={[styles.flagBand, { backgroundColor: Colors.flagGreen }]} />
      </View>

      {/* Logo */}
      <View style={styles.logoContainer}>
        <Image
          source={require("../assets/app-icon.png")}
          style={[styles.logo, { width: Math.min(width * 0.4, 160), height: Math.min(width * 0.4, 160) }]}
          contentFit="contain"
        />
      </View>

      {/* Title */}
      <Text style={styles.title} selectable>
        e-Citoyen CI
      </Text>
      <Text style={styles.subtitle} selectable>
        Vos d{"é"}marches, simplifi{"é"}es
      </Text>

      {/* Action buttons */}
      <View style={styles.buttonsContainer}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={handleNewRequest}
          activeOpacity={0.8}
        >
          <Ionicons name="add-circle-outline" size={22} color={Colors.white} />
          <Text style={styles.primaryButtonText}>Nouvelle demande</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={() => {}}
          activeOpacity={0.8}
        >
          <Ionicons name="document-text-outline" size={22} color={Colors.primary} />
          <Text style={styles.secondaryButtonText}>Mes demandes</Text>
        </TouchableOpacity>
      </View>

      {/* Requests section */}
      <View style={styles.requestsSection}>
        <Text style={styles.sectionTitle}>Mes demandes r{"é"}centes</Text>

        {formattedDemandes.length === 0 ? (
          <View style={styles.emptyState}>
            <View style={styles.emptyIconContainer}>
              <Ionicons name="folder-open-outline" size={48} color={Colors.primary} />
            </View>
            <Text style={styles.emptyText}>
              Aucune demande pour l&apos;instant
            </Text>
            <Text style={styles.emptySubtext}>
              Commencez par d{"é"}crire votre situation pour obtenir un accompagnement personnalis{"é"}.
            </Text>
          </View>
        ) : (
          <View style={styles.requestsList}>
            {formattedDemandes.map((demande) => (
              <TouchableOpacity
                key={demande.id}
                style={styles.requestCard}
                onPress={() => handleViewRequest(demande)}
                activeOpacity={0.7}
              >
                <View style={styles.requestCardHeader}>
                  <Ionicons name="time-outline" size={16} color={Colors.textMuted} />
                  <Text style={styles.requestDate}>{demande.formattedDate}</Text>
                </View>
                <Text style={styles.requestMessage} numberOfLines={2}>
                  {demande.truncatedMessage}
                </Text>
                <View style={styles.requestCardFooter}>
                  <Text style={styles.viewMore}>Voir le r{"é"}sultat</Text>
                  <Ionicons name="chevron-forward" size={16} color={Colors.accent} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: 24,
    alignItems: "center",
  },
  flagStrip: {
    flexDirection: "row",
    width: 80,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
    marginBottom: 24,
  },
  flagBand: {
    flex: 1,
    height: "100%",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  logo: {
    borderRadius: 20,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 32,
    color: Colors.primary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Fonts.medium,
    fontSize: 17,
    color: Colors.accent,
    textAlign: "center",
    marginTop: 6,
    fontStyle: "italic",
  },
  buttonsContainer: {
    width: "100%",
    marginTop: 32,
    gap: 14,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    boxShadow: "0 4px 14px rgba(46, 107, 87, 0.25)",
  },
  primaryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.white,
  },
  secondaryButton: {
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    backgroundColor: "transparent",
  },
  secondaryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.primary,
  },
  requestsSection: {
    width: "100%",
    marginTop: 40,
  },
  sectionTitle: {
    fontFamily: Fonts.semiBold,
    fontSize: 18,
    color: Colors.textPrimary,
    marginBottom: 16,
  },
  emptyState: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 32,
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  emptyIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.background,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
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
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    borderCurve: "continuous",
  },
  requestCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 8,
  },
  requestDate: {
    fontFamily: Fonts.regular,
    fontSize: 13,
    color: Colors.textMuted,
  },
  requestMessage: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  requestCardFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    gap: 4,
    marginTop: 12,
  },
  viewMore: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.accent,
  },
});
