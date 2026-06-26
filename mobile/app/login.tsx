import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  ScrollView,
  Platform,
} from "react-native";
import { Image } from "expo-image";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Colors } from "@/constants/Colors";
import { Fonts } from "@/constants/Typography";
import { useAppStore } from "@/store/useAppStore";

export default function LoginScreen() {
  const insets = useSafeAreaInsets();
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const { login, register, isLoading, error, clearError } = useAppStore();

  const handleSubmit = useCallback(async () => {
    try {
      if (isLogin) {
        await login(email.trim(), password);
      } else {
        await register(name.trim(), email.trim(), password);
      }
    } catch (e) {
      // L'erreur est gérée et stockée dans le store Zustand pour être affichée à l'écran.
      // On l'attrape ici pour éviter qu'elle ne remonte et provoque un crash (Unhandled Promise Rejection).
    }
  }, [isLogin, name, email, password, login, register]);

  const toggleMode = useCallback(() => {
    setIsLogin((prev) => !prev);
    clearError();
  }, [clearError]);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        style={{ flex: 1, backgroundColor: Colors.background }}
        contentContainerStyle={[
          styles.container,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Image
            source={require("@/assets/ecitoyen-logo.png")}
            style={styles.logo}
            contentFit="contain"
          />
          <Text style={styles.appTitle}>e-Citoyen CI</Text>
          <Text style={styles.appSubtitle}>Vos demarches, simplifiees.</Text>
        </View>

        {/* Toggle */}
        <View style={styles.toggleContainer}>
          <TouchableOpacity
            style={[styles.toggleButton, isLogin && styles.toggleActive]}
            onPress={toggleMode}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, isLogin && styles.toggleTextActive]}>
              Connexion
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleButton, !isLogin && styles.toggleActive]}
            onPress={toggleMode}
            activeOpacity={0.7}
          >
            <Text style={[styles.toggleText, !isLogin && styles.toggleTextActive]}>
              Inscription
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form */}
        <View style={styles.form}>
          {!isLogin && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>Nom complet</Text>
              <TextInput
                style={styles.input}
                placeholder="Amani Kouassi"
                placeholderTextColor={Colors.textLight}
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>
          )}

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="amani@email.com"
              placeholderTextColor={Colors.textLight}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mot de passe</Text>
            <TextInput
              style={styles.input}
              placeholder="Votre mot de passe"
              placeholderTextColor={Colors.textLight}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          <TouchableOpacity
            style={[styles.submitButton, isLoading && styles.submitDisabled]}
            onPress={handleSubmit}
            activeOpacity={0.8}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color={Colors.white} />
            ) : (
              <Text style={styles.submitText}>
                {isLogin ? "Se connecter" : "S'inscrire"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        <Text style={styles.footerText}>
          {isLogin
            ? "Pas encore de compte ? "
            : "Deja inscrit ? "}
          <Text style={styles.footerLink} onPress={toggleMode}>
            {isLogin ? "Creer un compte" : "Se connecter"}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    paddingHorizontal: 28,
    alignItems: "center",
  },
  logoContainer: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 100,
    height: 100,
    marginBottom: 12,
  },
  appTitle: {
    fontFamily: Fonts.serifBold,
    fontSize: 28,
    color: Colors.text,
    letterSpacing: -0.5,
  },
  appSubtitle: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    backgroundColor: Colors.white,
    borderRadius: 12,
    padding: 4,
    marginBottom: 28,
    width: "100%",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 10,
  },
  toggleActive: {
    backgroundColor: Colors.primary,
  },
  toggleText: {
    fontFamily: Fonts.semiBold,
    fontSize: 15,
    color: Colors.textSecondary,
  },
  toggleTextActive: {
    color: Colors.white,
  },
  form: {
    width: "100%",
    gap: 18,
  },
  inputGroup: {
    gap: 6,
  },
  label: {
    fontFamily: Fonts.medium,
    fontSize: 14,
    color: Colors.text,
    marginLeft: 4,
  },
  input: {
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontFamily: Fonts.regular,
    fontSize: 16,
    color: Colors.text,
  },
  errorContainer: {
    backgroundColor: "#FEF2F2",
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: "#FECACA",
  },
  errorText: {
    fontFamily: Fonts.medium,
    fontSize: 13,
    color: Colors.error,
    textAlign: "center",
  },
  submitButton: {
    backgroundColor: Colors.primary,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
    boxShadow: "0 4px 12px rgba(200, 106, 74, 0.3)",
  },
  submitDisabled: {
    opacity: 0.7,
  },
  submitText: {
    fontFamily: Fonts.semiBold,
    fontSize: 17,
    color: Colors.white,
  },
  footerText: {
    fontFamily: Fonts.regular,
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 24,
  },
  footerLink: {
    fontFamily: Fonts.semiBold,
    color: Colors.primary,
  },
});
