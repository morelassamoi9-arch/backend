import { useState, useCallback, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";

export default function ResultatScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const demandes = useAppStore((s) => s.demandes);

  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);

  const demande = useMemo(
    () => demandes.find((d) => d.id === id),
    [demandes, id]
  );

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleGoHome = useCallback(() => {
    router.replace("/");
  }, [router]);

  const toggleCheckItem = useCallback((item: string) => {
    setCheckedItems((prev) => ({
      ...prev,
      [item]: !prev[item],
    }));
  }, []);

  const getFullResponseText = useCallback((): string => {
    if (!demande) return "";
    const r = demande.response;
    return [
      `RÉSUMÉ DE LA SITUATION:\n${r.resume_situation}`,
      `\nPLAN D'ACTION:\n${r.plan_action}`,
      `\nDOCUMENTS À APPORTER:\n${r.documents_a_apporter}`,
      `\nLIEU:\n${r.lieu}`,
      `\nDÉLAI ESTIMÉ:\n${r.delai_estime}`,
      `\nCOÛT:\n${r.cout}`,
      `\nCONTENU DE LA LETTRE:\n${r.contenu_lettre}`,
    ].join("\n");
  }, [demande]);

  const handleCopy = useCallback(async () => {
    try {
      const text = getFullResponseText();
      await Clipboard.setStringAsync(text);
      Alert.alert("Copié", "Le contenu a été copié dans le presse-papiers.");
    } catch {
      Alert.alert("Erreur", "Impossible de copier le contenu.");
    }
  }, [getFullResponseText]);

  const handleSpeak = useCallback(async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    try {
      const text = getFullResponseText();
      setIsSpeaking(true);
      Speech.speak(text, {
        language: "fr-FR",
        rate: 0.9,
        onDone: () => setIsSpeaking(false),
        onStopped: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    } catch {
      Alert.alert("Erreur", "Impossible de lire le contenu à voix haute.");
      setIsSpeaking(false);
    }
  }, [isSpeaking, getFullResponseText]);

  const handleShare = useCallback(() => {
    if (!demande) return;
    const subject = encodeURIComponent("Ma demande e-Citoyen CI");
    const body = encodeURIComponent(getFullResponseText());
    const mailtoUrl = `mailto:?subject=${subject}&body=${body}`;
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert("Erreur", "Impossible d'ouvrir l'application email.");
    });
  }, [demande, getFullResponseText]);

  // Document list parsing
  const documentsList = useMemo(() => {
    if (!demande) return [];
    const docs = demande.response.documents_a_apporter;
    // Split by newlines or by numbered/bulleted items
    return docs
      .split(/[\n\r]+/)
      .map((d) => d.replace(/^[\s\-\d.•·]+/, "").trim())
      .filter((d) => d.length > 0);
  }, [demande]);

  // Plan action steps
  const planSteps = useMemo(() => {
    if (!demande) return [];
    const plan = demande.response.plan_action;
    return plan
      .split(/[\n\r]+/)
      .map((s) => s.replace(/^[\s\-\d.•·]+/, "").trim())
      .filter((s) => s.length > 0);
  }, [demande]);

  if (!demande) {
    return (
      <View style={[styles.container, styles.centerContent, { paddingTop: insets.top }]}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={56} color={Colors.accent} />
          <Text style={styles.errorTitle}>Demande introuvable</Text>
          <Text style={styles.errorSubtitle}>
            Cette demande n&apos;existe plus ou n&apos;a pas {"é"}t{"é"} sauvegard{"é"}e.
          </Text>
          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleGoHome}
            activeOpacity={0.8}
          >
            <Text style={styles.primaryButtonText}>Retour {"à"} l&apos;accueil</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  const { response } = demande;

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
          R{"é"}sultat de votre demande
        </Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.scrollContent,
          { paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
      >
        {/* Section: Résumé */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="document-text-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>R{"é"}sum{"é"} de la situation</Text>
          </View>
          <Text style={styles.cardContent} selectable>
            {response.resume_situation}
          </Text>
        </View>

        {/* Section: Plan d'action */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="list-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Plan d&apos;action</Text>
          </View>
          <View style={styles.stepsList}>
            {planSteps.map((step, index) => (
              <View key={`step-${index}`} style={styles.stepItem}>
                <View style={styles.stepNumber}>
                  <Text style={styles.stepNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.stepText} selectable>
                  {step}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Section: Documents */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="folder-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Documents {"à"} apporter</Text>
          </View>
          <View style={styles.checkList}>
            {documentsList.map((doc, index) => (
              <TouchableOpacity
                key={`doc-${index}`}
                style={styles.checkItem}
                onPress={() => toggleCheckItem(doc)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={checkedItems[doc] ? "checkbox" : "square-outline"}
                  size={22}
                  color={checkedItems[doc] ? Colors.primary : Colors.textMuted}
                />
                <Text
                  style={[
                    styles.checkItemText,
                    checkedItems[doc] && styles.checkItemTextChecked,
                  ]}
                  selectable
                >
                  {doc}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Section: Lieu */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="location-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Lieu</Text>
          </View>
          <Text style={styles.cardContent} selectable>
            {response.lieu}
          </Text>
        </View>

        {/* Section: Délai estimé */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="time-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>D{"é"}lai estim{"é"}</Text>
          </View>
          <Text style={styles.cardContent} selectable>
            {response.delai_estime}
          </Text>
        </View>

        {/* Section: Coût */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="cash-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Co{"û"}t</Text>
          </View>
          <Text style={styles.cardContent} selectable>
            {response.cout}
          </Text>
        </View>

        {/* Section: Contenu de la lettre */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            <Text style={styles.cardTitle}>Contenu de la lettre</Text>
          </View>
          <ScrollView
            style={styles.letterScrollView}
            nestedScrollEnabled
            showsVerticalScrollIndicator
          >
            <Text style={styles.letterContent} selectable>
              {response.contenu_lettre}
            </Text>
          </ScrollView>
        </View>
      </ScrollView>

      {/* Action buttons - fixed at bottom */}
      <View style={[styles.actionBar, { paddingBottom: insets.bottom + 16 }]}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleCopy}
          activeOpacity={0.7}
        >
          <Ionicons name="copy-outline" size={20} color={Colors.accent} />
          <Text style={styles.actionButtonText}>Copier</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionButton, isSpeaking && styles.actionButtonActive]}
          onPress={handleSpeak}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSpeaking ? "stop-circle-outline" : "volume-high-outline"}
            size={20}
            color={isSpeaking ? Colors.white : Colors.accent}
          />
          <Text style={[styles.actionButtonText, isSpeaking && styles.actionButtonTextActive]}>
            {isSpeaking ? "Arrêter" : "Écouter"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={handleShare}
          activeOpacity={0.7}
        >
          <Ionicons name="share-outline" size={20} color={Colors.accent} />
          <Text style={styles.actionButtonText}>Partager</Text>
        </TouchableOpacity>
      </View>
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
  stepsList: {
    gap: 12,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  stepNumber: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.primary,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumberText: {
    fontFamily: Fonts.bold,
    fontSize: 13,
    color: Colors.white,
    fontVariant: ["tabular-nums"],
  },
  stepText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    paddingTop: 3,
  },
  checkList: {
    gap: 10,
  },
  checkItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 10,
    minHeight: 44,
    paddingVertical: 4,
  },
  checkItemText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textPrimary,
    lineHeight: 22,
    paddingTop: 1,
  },
  checkItemTextChecked: {
    textDecorationLine: "line-through",
    color: Colors.textMuted,
  },
  letterScrollView: {
    maxHeight: 220,
    backgroundColor: Colors.background,
    borderRadius: 12,
    padding: 14,
    flexGrow: 0,
  },
  letterContent: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 22,
  },
  actionBar: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 14,
    backgroundColor: Colors.cardBackground,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 10,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    backgroundColor: "transparent",
    minHeight: 48,
  },
  actionButtonActive: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  actionButtonText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.accent,
  },
  actionButtonTextActive: {
    color: Colors.white,
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
