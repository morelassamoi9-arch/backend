import { useEffect, useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as Clipboard from "expo-clipboard";
import * as Speech from "expo-speech";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";

export default function RequestDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { currentRequest, isLoadingRequests, requestError, fetchRequestById } =
    useAppStore();
  const [checkedDocs, setCheckedDocs] = useState<Record<number, boolean>>({});
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [copiedLetter, setCopiedLetter] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRequestById(id);
    }
  }, [id, fetchRequestById]);

  const handleBack = useCallback(() => {
    router.back();
  }, [router]);

  const toggleDoc = useCallback((index: number) => {
    setCheckedDocs((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  }, []);

  const handleCopyLetter = useCallback(async () => {
    if (currentRequest?.aiResponse?.letter) {
      await Clipboard.setStringAsync(currentRequest.aiResponse.letter);
      setCopiedLetter(true);
      setTimeout(() => setCopiedLetter(false), 2000);
    }
  }, [currentRequest]);

  const handleSpeak = useCallback(async () => {
    if (isSpeaking) {
      Speech.stop();
      setIsSpeaking(false);
      return;
    }

    if (currentRequest?.aiResponse) {
      const { situation, actionPlan, letter } = currentRequest.aiResponse;
      const textToRead = [
        `Resume de votre situation: ${situation}`,
        `Plan d'action: ${actionPlan.join(". ")}`,
        letter ? `Lettre generee: ${letter}` : "",
      ]
        .filter(Boolean)
        .join(". ");

      setIsSpeaking(true);
      Speech.speak(textToRead, {
        language: "fr-FR",
        onDone: () => setIsSpeaking(false),
        onError: () => setIsSpeaking(false),
      });
    }
  }, [isSpeaking, currentRequest]);

  useEffect(() => {
    return () => {
      Speech.stop();
    };
  }, []);

  if (isLoadingRequests) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Chargement...</Text>
      </View>
    );
  }

  if (requestError) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Ionicons name="alert-circle-outline" size={48} color={Colors.error} />
        <Text style={styles.errorTitle}>Erreur</Text>
        <Text style={styles.errorMessage}>{requestError}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={() => fetchRequestById(id)}>
          <Text style={styles.retryButtonText}>Reessayer</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (!currentRequest) {
    return (
      <View style={[styles.centered, { paddingTop: insets.top }]}>
        <Text style={styles.errorMessage}>Demande introuvable</Text>
        <TouchableOpacity style={styles.retryButton} onPress={handleBack}>
          <Text style={styles.retryButtonText}>Retour</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const { aiResponse } = currentRequest;

  return (
    <View style={{ flex: 1, backgroundColor: Colors.background }}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <TouchableOpacity style={styles.backButton} onPress={handleBack} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={20} color={Colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Details de la demande</Text>
        <TouchableOpacity
          style={[styles.speakButton, isSpeaking && styles.speakButtonActive]}
          onPress={handleSpeak}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isSpeaking ? "volume-mute" : "volume-high"}
            size={20}
            color={isSpeaking ? Colors.white : Colors.primary}
          />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 24 }]}
        showsVerticalScrollIndicator={false}
      >
        {/* Situation Summary */}
        {aiResponse?.situation && (
          <View style={styles.situationCard}>
            <Text style={styles.cardLabel}>Resume de votre situation</Text>
            <Text style={styles.situationText} selectable>
              {aiResponse.situation}
            </Text>
          </View>
        )}

        {/* Action Plan */}
        {aiResponse?.actionPlan && aiResponse.actionPlan.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>{"Plan d'action"}</Text>
            <View style={styles.timelineContainer}>
              {aiResponse.actionPlan.map((step, index) => (
                <View key={index} style={styles.timelineItem}>
                  <View style={styles.timelineDot}>
                    <Text style={styles.timelineNumber}>{index + 1}</Text>
                  </View>
                  {index < aiResponse.actionPlan.length - 1 && (
                    <View style={styles.timelineLine} />
                  )}
                  <Text style={styles.timelineText} selectable>
                    {step}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Documents Checklist */}
        {aiResponse?.documents && aiResponse.documents.length > 0 && (
          <View style={styles.sectionBlock}>
            <Text style={styles.sectionTitle}>Pieces a fournir</Text>
            <View style={styles.checklistContainer}>
              {aiResponse.documents.map((doc, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.checklistItem}
                  onPress={() => toggleDoc(index)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.checkbox,
                      checkedDocs[index] && styles.checkboxChecked,
                    ]}
                  >
                    {checkedDocs[index] && (
                      <Ionicons name="checkmark" size={14} color={Colors.white} />
                    )}
                  </View>
                  <Text
                    style={[
                      styles.checklistText,
                      checkedDocs[index] && styles.checklistTextChecked,
                    ]}
                    selectable
                  >
                    {doc}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Info Badges */}
        {(aiResponse?.location || aiResponse?.delay || aiResponse?.cost) && (
          <View style={styles.badgesRow}>
            {aiResponse.location && (
              <View style={[styles.badge, { backgroundColor: "#EDF5F2" }]}>
                <Ionicons name="location-outline" size={16} color={Colors.success} />
                <Text style={[styles.badgeText, { color: Colors.success }]}>
                  {aiResponse.location}
                </Text>
              </View>
            )}
            {aiResponse.delay && (
              <View style={[styles.badge, { backgroundColor: "#FFF4EC" }]}>
                <Ionicons name="time-outline" size={16} color={Colors.stamp} />
                <Text style={[styles.badgeText, { color: Colors.stamp }]}>
                  {aiResponse.delay}
                </Text>
              </View>
            )}
            {aiResponse.cost && (
              <View style={[styles.badge, { backgroundColor: "#F5EFE3" }]}>
                <MaterialCommunityIcons
                  name="cash-multiple"
                  size={16}
                  color={Colors.primary}
                />
                <Text style={[styles.badgeText, { color: Colors.primary }]}>
                  {aiResponse.cost}
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Generated Letter */}
        {aiResponse?.letter && (
          <View style={styles.sectionBlock}>
            <View style={styles.letterHeader}>
              <Text style={styles.sectionTitle}>Lettre generee</Text>
              <TouchableOpacity
                style={styles.copyButton}
                onPress={handleCopyLetter}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={copiedLetter ? "checkmark-circle" : "copy-outline"}
                  size={18}
                  color={copiedLetter ? Colors.success : Colors.primary}
                />
                <Text
                  style={[
                    styles.copyText,
                    { color: copiedLetter ? Colors.success : Colors.primary },
                  ]}
                >
                  {copiedLetter ? "Copie !" : "Copier"}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.letterCard}>
              <Text style={styles.letterText} selectable>
                {aiResponse.letter}
              </Text>
            </View>
          </View>
        )}

        {/* No AI Response yet */}
        {!aiResponse && (
          <View style={styles.pendingCard}>
            <ActivityIndicator size="small" color={Colors.stamp} />
            <Text style={styles.pendingTitle}>Traitement en cours</Text>
            <Text style={styles.pendingText}>
              {"L'IA analyse votre demande. La reponse sera disponible dans quelques instants."}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: Colors.background,
    gap: 12,
    padding: 20,
  },
  loadingText: {
    fontFamily: Fonts.medium,
    fontSize: 15,
    color: Colors.textSecondary,
    marginTop: 8,
  },
  errorTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 20,
    color: Colors.text,
  },
  errorMessage: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
  },
  retryButton: {
    backgroundColor: Colors.primary,
    borderRadius: 10,
    paddingHorizontal: 20,
    paddingVertical: 10,
    marginTop: 8,
  },
  retryButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 14,
    color: Colors.white,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    backgroundColor: Colors.background,
    borderBottomWidth: 1,
    borderBottomColor: Colors.borderLight,
  },
  backButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  headerTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 18,
    color: Colors.text,
    flex: 1,
    textAlign: "center",
  },
  speakButton: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: Colors.white,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  speakButtonActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  content: {
    padding: 20,
    gap: 20,
  },
  situationCard: {
    backgroundColor: Colors.beigeCard,
    borderRadius: 16,
    padding: 18,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderCurve: "continuous",
  },
  cardLabel: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 15,
    color: Colors.text,
  },
  situationText: {
    fontFamily: Fonts.regular,
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 22,
  },
  sectionBlock: {
    gap: 12,
  },
  sectionTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 17,
    color: Colors.text,
  },
  timelineContainer: {
    gap: 0,
  },
  timelineItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
    minHeight: 48,
  },
  timelineDot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.success,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1,
  },
  timelineNumber: {
    fontFamily: Fonts.bold,
    fontSize: 12,
    color: Colors.white,
  },
  timelineLine: {
    position: "absolute",
    left: 13,
    top: 28,
    width: 2,
    height: 20,
    backgroundColor: Colors.success + "30",
  },
  timelineText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
    lineHeight: 20,
    paddingTop: 4,
  },
  checklistContainer: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 4,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderCurve: "continuous",
  },
  checklistItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 12,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.border,
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxChecked: {
    backgroundColor: Colors.success,
    borderColor: Colors.success,
  },
  checklistText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  checklistTextChecked: {
    textDecorationLine: "line-through",
    color: Colors.textLight,
  },
  badgesRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  badge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderCurve: "continuous",
  },
  badgeText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
  },
  letterHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  copyButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  copyText: {
    fontFamily: Fonts.medium,
    fontSize: 12,
  },
  letterCard: {
    backgroundColor: Colors.white,
    borderRadius: 14,
    padding: 18,
    borderWidth: 1,
    borderColor: Colors.border,
    borderCurve: "continuous",
  },
  letterText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 22,
  },
  pendingCard: {
    backgroundColor: Colors.white,
    borderRadius: 16,
    padding: 28,
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: Colors.borderLight,
    borderCurve: "continuous",
  },
  pendingTitle: {
    fontFamily: Fonts.serifSemiBold,
    fontSize: 16,
    color: Colors.stamp,
    marginTop: 4,
  },
  pendingText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    lineHeight: 20,
  },
});
