import { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Animated,
  ScrollView,
  Platform,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  ExpoSpeechRecognitionModule,
  useSpeechRecognitionEvent,
} from "expo-speech-recognition";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";

export default function NewRequestScreen() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const params = useLocalSearchParams<{ prefill?: string }>();
  const [description, setDescription] = useState(params.prefill || "");
  const [isRecording, setIsRecording] = useState(false);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  const { createRequest, isLoadingRequests, requestError, clearRequestError } =
    useAppStore();

  // Animation refs
  const wave1 = useRef(new Animated.Value(0)).current;
  const wave2 = useRef(new Animated.Value(0)).current;
  const wave3 = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (params.prefill) setDescription(params.prefill);
  }, [params.prefill]);

  // --- Reconnaissance vocale ---

  useSpeechRecognitionEvent("result", (event) => {
    if (event.results?.[0]?.transcript) {
      setDescription(event.results[0].transcript);
    }
  });

  useSpeechRecognitionEvent("end", () => {
    setIsRecording(false);
    stopWaveAnimation();
  });

  useSpeechRecognitionEvent("error", (event) => {
    setIsRecording(false);
    stopWaveAnimation();
    if (event.error !== "aborted") {
      setVoiceError("Reconnaissance vocale impossible. Réessayez ou tapez votre demande.");
    }
  });

  // --- Animations ondes ---

  const startWaveAnimation = useCallback(() => {
    wave1.setValue(0);
    wave2.setValue(0);
    wave3.setValue(0);

    const createWave = (value: Animated.Value, delay: number) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(delay),
          Animated.timing(value, { toValue: 1, duration: 1500, useNativeDriver: false }),
          Animated.timing(value, { toValue: 0, duration: 0, useNativeDriver: false }),
        ])
      );

    const animation = Animated.parallel([
      createWave(wave1, 0),
      createWave(wave2, 300),
      createWave(wave3, 600),
    ]);
    animationRef.current = animation;
    animation.start();
  }, [wave1, wave2, wave3]);

  const stopWaveAnimation = useCallback(() => {
    animationRef.current?.stop();
    wave1.setValue(0);
    wave2.setValue(0);
    wave3.setValue(0);
  }, [wave1, wave2, wave3]);

  // --- Bouton micro ---

  const handleMicPress = useCallback(async () => {
    setVoiceError(null);

    if (isRecording) {
      // Arrêter
      ExpoSpeechRecognitionModule.stop();
      setIsRecording(false);
      stopWaveAnimation();
      return;
    }

    // Demander la permission
    const { granted } = await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!granted) {
      setVoiceError("Permission microphone refusée. Activez-la dans les paramètres.");
      return;
    }

    // Démarrer
    try {
      ExpoSpeechRecognitionModule.start({
        lang: "fr-FR",
        interimResults: true,
        continuous: false,
      });
      setIsRecording(true);
      startWaveAnimation();
    } catch {
      setVoiceError("Impossible de démarrer la reconnaissance vocale.");
    }
  }, [isRecording, startWaveAnimation, stopWaveAnimation]);

  // --- Soumission ---

  const handleSubmit = useCallback(async () => {
    if (!description.trim()) return;
    clearRequestError();
    await createRequest(description.trim());
    const state = useAppStore.getState();
    if (state.currentRequest && !state.requestError) {
      router.push(`/(citizen)/request/${state.currentRequest.id}`);
    }
  }, [description, createRequest, clearRequestError, router]);

  // --- Rendu onde ---

  const renderWave = (anim: Animated.Value, baseSize: number) => {
    const scale = anim.interpolate({ inputRange: [0, 1], outputRange: [1, 1 + baseSize * 0.015] });
    const opacity = anim.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] });
    return (
      <Animated.View
        style={[
          styles.wave,
          { width: baseSize, height: baseSize, borderRadius: baseSize / 2, transform: [{ scale }], opacity },
        ]}
      />
    );
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: Colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 100 },
      ]}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={styles.title}>Nouvelle demande</Text>
      <Text style={styles.subtitle}>Décrivez votre situation</Text>
      <Text style={styles.hint}>
        Ex : Je souhaite obtenir un acte de naissance pour mon enfant né à Abidjan,
        quelles sont les démarches à suivre ?
      </Text>

      {/* Champ texte */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.textInput}
          placeholder="Décrivez votre besoin ici..."
          placeholderTextColor={Colors.textLight}
          value={description}
          onChangeText={setDescription}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
      </View>

      {/* Microphone */}
      <View style={styles.micContainer}>
        <Text style={styles.micLabel}>ou dictez par la voix</Text>
        <View style={styles.micWrapper}>
          {isRecording && renderWave(wave3, 130)}
          {isRecording && renderWave(wave2, 110)}
          {isRecording && renderWave(wave1, 90)}
          <TouchableOpacity
            style={[styles.micButton, isRecording && styles.micButtonActive]}
            onPress={handleMicPress}
            activeOpacity={0.8}
          >
            <Ionicons name={isRecording ? "stop" : "mic"} size={28} color={Colors.white} />
          </TouchableOpacity>
        </View>
        {isRecording && (
          <Text style={styles.recordingText}>Enregistrement en cours... (appuyez pour arrêter)</Text>
        )}
      </View>

      {/* Erreur vocale */}
      {voiceError && (
        <View style={styles.errorContainer}>
          <Ionicons name="mic-off-outline" size={18} color={Colors.error} />
          <Text style={styles.errorText}>{voiceError}</Text>
        </View>
      )}

      {/* Erreur API */}
      {requestError && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={18} color={Colors.error} />
          <Text style={styles.errorText}>{requestError}</Text>
        </View>
      )}

      {/* Bouton envoyer */}
      <TouchableOpacity
        style={[
          styles.submitButton,
          (!description.trim() || isLoadingRequests) && styles.submitDisabled,
        ]}
        onPress={handleSubmit}
        activeOpacity={0.85}
        disabled={!description.trim() || isLoadingRequests}
      >
        {isLoadingRequests ? (
          <ActivityIndicator color={Colors.white} />
        ) : (
          <>
            <Ionicons name="send" size={18} color={Colors.white} />
            <Text style={styles.submitText}>{"Envoyer à l'IA"}</Text>
          </>
        )}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { paddingHorizontal: 20, gap: 12 },
  title:            { fontFamily: Fonts.serifBold, fontSize: 26, color: Colors.text, letterSpacing: -0.3 },
  subtitle:         { fontFamily: Fonts.serifSemiBold, fontSize: 18, color: Colors.text, marginTop: 4 },
  hint:             { fontFamily: Fonts.regular, fontSize: 14, color: Colors.textSecondary, lineHeight: 20, marginTop: 4 },
  inputContainer:   { backgroundColor: Colors.white, borderRadius: 16, borderWidth: 1, borderColor: Colors.border, marginTop: 8 },
  textInput:        { fontFamily: Fonts.regular, fontSize: 16, color: Colors.text, padding: 16, minHeight: 140, lineHeight: 22 },
  micContainer:     { alignItems: "center", marginTop: 16, gap: 10 },
  micLabel:         { fontFamily: Fonts.regular, fontSize: 13, color: Colors.textLight },
  micWrapper:       { width: 140, height: 140, alignItems: "center", justifyContent: "center" },
  wave:             { position: "absolute", borderWidth: 2, borderColor: Colors.primary },
  micButton:        { width: 64, height: 64, borderRadius: 32, backgroundColor: Colors.primary, alignItems: "center", justifyContent: "center" },
  micButtonActive:  { backgroundColor: Colors.stamp },
  recordingText:    { fontFamily: Fonts.medium, fontSize: 13, color: Colors.stamp, textAlign: "center" },
  errorContainer:   { backgroundColor: "#FEF2F2", borderRadius: 10, padding: 12, flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#FECACA" },
  errorText:        { fontFamily: Fonts.regular, fontSize: 13, color: Colors.error, flex: 1 },
  submitButton:     { backgroundColor: Colors.primary, borderRadius: 14, paddingVertical: 16, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, marginTop: 12 },
  submitDisabled:   { opacity: 0.5 },
  submitText:       { fontFamily: Fonts.semiBold, fontSize: 17, color: Colors.white },
});
