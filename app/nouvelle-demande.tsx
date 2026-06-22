import { useState, useCallback, useRef, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  Easing,
} from "react-native-reanimated";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import type { DemandeResponse } from "@/store/types";

const API_URL = "https://e-citoyen-ci-backend.onrender.com/api/demande";

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
}

export default function NouvelleDemande() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const addDemande = useAppStore((s) => s.addDemande);

  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const textInputRef = useRef<TextInput>(null);

  // Pulsing animation for mic button
  const pulseScale = useSharedValue(1);

  useEffect(() => {
    if (isRecording) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.15, { duration: 600, easing: Easing.inOut(Easing.ease) }),
          withTiming(1.0, { duration: 600, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 200 });
    }
  }, [isRecording, pulseScale]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const handleGoBack = useCallback(() => {
    router.back();
  }, [router]);

  const handleMicPress = useCallback(() => {
    // Toggle recording state - speech recognition requires native module
    // On web, show an alert that it's not supported
    if (Platform.OS === "web") {
      // Use Web Speech API on web
      if (!isRecording) {
        try {
          const SpeechRecognition =
            (window as unknown as Record<string, unknown>).SpeechRecognition ||
            (window as unknown as Record<string, unknown>).webkitSpeechRecognition;
          if (!SpeechRecognition) {
            Alert.alert(
              "Non disponible",
              "La reconnaissance vocale n'est pas disponible sur ce navigateur."
            );
            return;
          }
          interface WebSpeechRecognition {
            lang: string;
            continuous: boolean;
            interimResults: boolean;
            onresult: ((event: unknown) => void) | null;
            onerror: ((event: unknown) => void) | null;
            onend: (() => void) | null;
            start: () => void;
            stop: () => void;
          }
          const recognition = new (SpeechRecognition as unknown as new () => WebSpeechRecognition)();
          recognition.lang = "fr-FR";
          recognition.continuous = true;
          recognition.interimResults = true;
          recognition.onresult = (event: unknown) => {
            const results = (event as { results: SpeechRecognitionResultList }).results;
            let transcript = "";
            for (let i = 0; i < results.length; i++) {
              transcript += results[i][0].transcript;
            }
            setMessage((prev) => {
              const base = prev.endsWith(" ") || prev.length === 0 ? prev : `${prev} `;
              return base + transcript;
            });
          };
          recognition.onerror = () => {
            setIsRecording(false);
          };
          recognition.onend = () => {
            setIsRecording(false);
          };
          (window as unknown as Record<string, unknown>).__speechRecognition = recognition;
          recognition.start();
          setIsRecording(true);
        } catch {
          Alert.alert(
            "Erreur",
            "Impossible de démarrer la reconnaissance vocale."
          );
        }
      } else {
        try {
          const recognition = (window as unknown as Record<string, unknown>).__speechRecognition as {
            stop: () => void;
          } | undefined;
          if (recognition) {
            recognition.stop();
          }
        } catch {
          // ignore
        }
        setIsRecording(false);
      }
    } else {
      // Native: toggle state for visual feedback
      setIsRecording(!isRecording);
      if (!isRecording) {
        Alert.alert(
          "Info",
          "La reconnaissance vocale nécessite un appareil physique."
        );
      }
    }
  }, [isRecording]);

  const handleSubmit = useCallback(async () => {
    if (!message.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: message.trim() }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status})`);
      }

      const data: DemandeResponse = await response.json();

      const newDemande = {
        id: generateId(),
        message: message.trim(),
        createdAt: new Date().toISOString(),
        response: data,
      };

      addDemande(newDemande);

      router.push({
        pathname: "/resultat",
        params: { id: newDemande.id },
      });
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [message, addDemande, router]);

  const isButtonDisabled = !message.trim() || isLoading;

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 12, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={handleGoBack}
            style={styles.backButton}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={24} color={Colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Nouvelle demande</Text>
          <View style={styles.headerSpacer} />
        </View>

        {/* Instructions */}
        <View style={styles.instructionCard}>
          <Ionicons name="information-circle-outline" size={20} color={Colors.primary} />
          <Text style={styles.instructionText}>
            D{"é"}crivez votre situation ou votre besoin administratif. Vous pouvez {"é"}galement utiliser le micro pour dicter votre demande.
          </Text>
        </View>

        {/* Text input area */}
        <View style={styles.inputContainer}>
          <TextInput
            ref={textInputRef}
            style={styles.textInput}
            placeholder="Décrivez votre situation..."
            placeholderTextColor={Colors.textMuted}
            value={message}
            onChangeText={setMessage}
            multiline
            textAlignVertical="top"
            maxLength={2000}
          />
          <View style={styles.charCount}>
            <Text style={styles.charCountText}>{message.length}/2000</Text>
          </View>
        </View>

        {/* Microphone button */}
        <View style={styles.micContainer}>
          <Animated.View style={[styles.micButtonWrapper, pulseStyle]}>
            <TouchableOpacity
              style={[
                styles.micButton,
                isRecording && styles.micButtonRecording,
              ]}
              onPress={handleMicPress}
              activeOpacity={0.7}
            >
              <Ionicons
                name={isRecording ? "stop" : "mic"}
                size={28}
                color={Colors.white}
              />
            </TouchableOpacity>
          </Animated.View>
          <Text style={styles.micLabel}>
            {isRecording
              ? "Enregistrement en cours..."
              : "Appuyez pour dicter"}
          </Text>
        </View>

        {/* Error message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={18} color={Colors.error} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Submit button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isButtonDisabled && styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          activeOpacity={0.8}
          disabled={isButtonDisabled}
        >
          {isLoading ? (
            <ActivityIndicator color={Colors.white} size="small" />
          ) : (
            <>
              <Ionicons name="search-outline" size={20} color={Colors.white} />
              <Text style={styles.submitButtonText}>Analyser ma demande</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>

      {/* Loading overlay */}
      {isLoading ? (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingCard}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={styles.loadingText}>
              Analyse en cours...
            </Text>
            <Text style={styles.loadingSubtext}>
              Veuillez patienter quelques instants
            </Text>
          </View>
        </View>
      ) : null}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  contentContainer: {
    paddingHorizontal: 24,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
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
    fontSize: 20,
    color: Colors.primary,
    textAlign: "center",
  },
  headerSpacer: {
    width: 44,
  },
  instructionCard: {
    flexDirection: "row",
    backgroundColor: Colors.cardBackground,
    borderRadius: 14,
    padding: 14,
    gap: 10,
    alignItems: "flex-start",
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: 20,
  },
  instructionText: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  inputContainer: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 20,
  },
  textInput: {
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 140,
    lineHeight: 24,
    padding: 0,
  },
  charCount: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  charCountText: {
    fontFamily: Fonts.regular,
    fontSize: 12,
    color: Colors.textMuted,
  },
  micContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  micButtonWrapper: {
    marginBottom: 10,
  },
  micButton: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.accent,
    alignItems: "center",
    justifyContent: "center",
    boxShadow: "0 4px 14px rgba(200, 106, 74, 0.35)",
  },
  micButtonRecording: {
    backgroundColor: Colors.error,
  },
  micLabel: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textMuted,
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 14,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#FFCCCC",
  },
  errorText: {
    flex: 1,
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.error,
    lineHeight: 20,
  },
  submitButton: {
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
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.white,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.overlay,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 100,
  },
  loadingCard: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 24,
    padding: 40,
    alignItems: "center",
    gap: 16,
    boxShadow: "0 8px 32px rgba(46, 107, 87, 0.15)",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  loadingText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.primary,
  },
  loadingSubtext: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textMuted,
  },
});
