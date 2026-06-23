import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  useWindowDimensions,
} from "react-native";
import { Image } from "expo-image";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";
import type { LoginResponse } from "@/store/types";

const API_URL = "https://e-citoyen-ci-backend.onrender.com/api/auth/login";

export default function LoginScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const setAuth = useAppStore((s) => s.setAuth);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = useCallback(async () => {
    if (!email.trim() || !password.trim()) {
      setError("Veuillez remplir tous les champs.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Email ou mot de passe incorrect.");
        }
        if (response.status === 404) {
          throw new Error("Compte introuvable. Vérifiez votre email.");
        }
        throw new Error("Erreur de connexion. Veuillez réessayer.");
      }

      const data: LoginResponse = await response.json();
      setAuth(data.access_token, data.user);

      if (data.user.role === "agent") {
        router.replace("/agent-dashboard");
      } else {
        router.replace("/");
      }
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Une erreur est survenue. Veuillez réessayer.";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [email, password, setAuth, router]);

  const handleContinueWithoutAccount = useCallback(() => {
    router.replace("/");
  }, [router]);

  const toggleShowPassword = useCallback(() => {
    setShowPassword((prev) => !prev);
  }, []);

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
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
            style={[
              styles.logo,
              { width: Math.min(width * 0.3, 120), height: Math.min(width * 0.3, 120) },
            ]}
            contentFit="contain"
          />
        </View>

        {/* Title */}
        <Text style={styles.title} selectable>
          e-Citoyen CI
        </Text>
        <Text style={styles.subtitle}>
          Connexion {"à"} votre espace
        </Text>

        {/* Login form */}
        <View style={styles.formContainer}>
          {/* Email input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.primary} />
            </View>
            <TextInput
              style={styles.textInput}
              placeholder="Adresse email"
              placeholderTextColor={Colors.textMuted}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoComplete="email"
              textContentType="emailAddress"
              editable={!isLoading}
            />
          </View>

          {/* Password input */}
          <View style={styles.inputWrapper}>
            <View style={styles.inputIconContainer}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.primary} />
            </View>
            <TextInput
              style={[styles.textInput, styles.passwordInput]}
              placeholder="Mot de passe"
              placeholderTextColor={Colors.textMuted}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              autoCapitalize="none"
              autoComplete="password"
              textContentType="password"
              editable={!isLoading}
            />
            <TouchableOpacity
              onPress={toggleShowPassword}
              style={styles.eyeButton}
              activeOpacity={0.7}
            >
              <Ionicons
                name={showPassword ? "eye-off-outline" : "eye-outline"}
                size={20}
                color={Colors.textMuted}
              />
            </TouchableOpacity>
          </View>

          {/* Error message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={18} color={Colors.error} />
              <Text style={styles.errorText} selectable>
                {error}
              </Text>
            </View>
          ) : null}

          {/* Login button */}
          <TouchableOpacity
            style={[
              styles.loginButton,
              isLoading && styles.loginButtonDisabled,
            ]}
            onPress={handleLogin}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} size="small" />
            ) : (
              <>
                <Ionicons name="log-in-outline" size={20} color={Colors.white} />
                <Text style={styles.loginButtonText}>Se connecter</Text>
              </>
            )}
          </TouchableOpacity>
        </View>

        {/* Divider */}
        <View style={styles.divider}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>ou</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Continue without account */}
        <TouchableOpacity
          style={styles.continueButton}
          onPress={handleContinueWithoutAccount}
          activeOpacity={0.7}
          disabled={isLoading}
        >
          <Ionicons name="person-outline" size={20} color={Colors.primary} />
          <Text style={styles.continueButtonText}>Continuer sans compte</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 12,
  },
  logo: {
    borderRadius: 20,
  },
  title: {
    fontFamily: Fonts.bold,
    fontSize: 28,
    color: Colors.primary,
    textAlign: "center",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontFamily: Fonts.medium,
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 6,
    marginBottom: 32,
  },
  formContainer: {
    width: "100%",
    gap: 16,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.cardBackground,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  inputIconContainer: {
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.textPrimary,
    paddingVertical: 16,
  },
  passwordInput: {
    paddingRight: 44,
  },
  eyeButton: {
    position: "absolute",
    right: 16,
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    backgroundColor: "#FFF0F0",
    borderRadius: 12,
    padding: 14,
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
  loginButton: {
    backgroundColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    paddingHorizontal: 24,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    marginTop: 8,
    boxShadow: "0 4px 14px rgba(46, 107, 87, 0.25)",
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  loginButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.white,
  },
  divider: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    marginVertical: 24,
    gap: 12,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerText: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.textMuted,
  },
  continueButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    width: "100%",
    backgroundColor: "transparent",
  },
  continueButtonText: {
    fontFamily: Fonts.semiBold,
    fontSize: 16,
    color: Colors.primary,
  },
});
