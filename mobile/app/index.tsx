import { useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, SafeAreaView } from "react-native";
import { useRouter } from "expo-router";
import { useAppStore } from "@/store/useAppStore";
import { Colors } from "@/constants/Colors";
import { LinearGradient } from "expo-linear-gradient";

export default function Index() {
  const isAuthenticated = useAppStore((s) => s.isAuthenticated);
  const router = useRouter();

  useEffect(() => {
    // Ne plus rediriger automatiquement, afficher la landing page
  }, []);

  const handleStart = () => {
    if (isAuthenticated) {
      router.replace("/(citizen)");
    } else {
      router.replace("/login");
    }
  };

  const services = [
    "Déclaration de naissance",
    "Carte nationale d'identité",
    "Assurance maladie",
    "Prestations sociales",
    "Extrait de naissance",
    "Passeport",
    "Permis de conduire",
    "Certificats divers"
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.logoContainer}>
            <View style={styles.logoPlaceholder}>
              <Text style={styles.logoText}>🇨🇮</Text>
            </View>
            <View>
              <Text style={styles.title}>e-Citoyen CI</Text>
              <Text style={styles.subtitle}>République de Côte d'Ivoire</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={handleStart}
          >
            <Text style={styles.headerButtonText}>
              {isAuthenticated ? "Tableau de bord" : "Connexion"}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Hero Section */}
        <View style={styles.hero}>
          <View style={styles.badge}>
            <Text style={styles.badgeIcon}>✨</Text>
            <Text style={styles.badgeText}>Assisté par Intelligence Artificielle</Text>
          </View>

          <Text style={styles.heroTitle}>
            Votre assistant administratif intelligent
          </Text>

          <Text style={styles.heroDescription}>
            Simplifiez vos démarches administratives avec e-Citoyen CI.
            Notre assistant IA vous guide à travers toutes vos procédures gouvernementales.
          </Text>

          <TouchableOpacity
            style={styles.primaryButton}
            onPress={handleStart}
          >
            <Text style={styles.primaryButtonText}>
              {isAuthenticated ? "Continuer ma demande" : "Commencer"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryButton}
          >
            <Text style={styles.secondaryButtonText}>Découvrir le service</Text>
          </TouchableOpacity>
        </View>

        {/* Illustration Section */}
        <View style={styles.illustration}>
          <View style={styles.illustrationCard}>
            <View style={styles.illustrationContent}>
              <View style={styles.illustrationPlaceholder}>
                <Text style={styles.illustrationIcon}>🛡️</Text>
                <Text style={styles.illustrationText}>Illustration</Text>
                <Text style={styles.illustrationSubtext}>Citoyen & IA</Text>
              </View>
              <View style={styles.featuresList}>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>📄</Text>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Démarches simplifiées</Text>
                    <Text style={styles.featureDescription}>
                      Décrivez votre situation et recevez un guide personnalisé
                    </Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>✨</Text>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Intelligence artificielle</Text>
                    <Text style={styles.featureDescription}>
                      Notre IA analyse et génère des réponses précises
                    </Text>
                  </View>
                </View>
                <View style={styles.featureItem}>
                  <Text style={styles.featureIcon}>✅</Text>
                  <View style={styles.featureTextContainer}>
                    <Text style={styles.featureTitle}>Conformité réglementaire</Text>
                    <Text style={styles.featureDescription}>
                      Toutes les réponses se basent sur les textes officiels ivoiriens
                    </Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Features Section */}
        <View style={styles.features}>
          <Text style={styles.sectionTitle}>Comment ça fonctionne ?</Text>
          <Text style={styles.sectionDescription}>
            Un processus simple en trois étapes pour toutes vos démarches administratives
          </Text>

          <View style={styles.stepsContainer}>
            <View style={styles.step}>
              <View style={styles.stepIconContainer}>
                <Text style={styles.stepIcon}>📄</Text>
              </View>
              <Text style={styles.stepTitle}>1. Décrivez votre situation</Text>
              <Text style={styles.stepDescription}>
                Expliquez votre besoin administratif en quelques phrases ou à la voix
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIconContainerSecondary}>
                <Text style={styles.stepIcon}>✨</Text>
              </View>
              <Text style={styles.stepTitle}>2. L'IA analyse</Text>
              <Text style={styles.stepDescription}>
                Notre assistant génère un guide complet avec documents, délais et coûts
              </Text>
            </View>

            <View style={styles.step}>
              <View style={styles.stepIconContainerGreen}>
                <Text style={styles.stepIcon}>✅</Text>
              </View>
              <Text style={styles.stepTitle}>3. Guide complet</Text>
              <Text style={styles.stepDescription}>
                Obtenez immédiatement la marche à suivre, la liste des pièces et la lettre prérédigée
              </Text>
            </View>
          </View>
        </View>

        {/* Services Section */}
        <View style={styles.services}>
          <Text style={styles.sectionTitle}>Services disponibles</Text>
          <Text style={styles.sectionDescription}>
            Toutes vos démarches administratives en un seul endroit
          </Text>

          <View style={styles.servicesGrid}>
            {services.map((service, index) => (
              <View key={index} style={styles.serviceCard}>
                <View style={styles.serviceIconContainer}>
                  <Text style={styles.serviceIcon}>📄</Text>
                </View>
                <Text style={styles.serviceTitle}>{service}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* CTA Section */}
        <LinearGradient
          colors={[Colors.primary, Colors.success]}
          style={styles.cta}
        >
          <Text style={styles.ctaTitle}>Prêt à simplifier vos démarches ?</Text>
          <Text style={styles.ctaDescription}>
            Rejoignez des milliers de citoyens qui utilisent déjà e-Citoyen CI
          </Text>
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={handleStart}
          >
            <Text style={styles.ctaButtonText}>
              {isAuthenticated ? "Accéder à mon espace" : "Commencer maintenant"}
            </Text>
          </TouchableOpacity>
        </LinearGradient>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>© 2026 e-Citoyen CI - République de Côte d'Ivoire</Text>
          <Text style={styles.footerSubtext}>Service public numérique officiel</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  logoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: Colors.textSecondary,
  },
  headerButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.primary,
  },
  headerButtonText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  hero: {
    padding: 24,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary + '15',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  badgeIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  badgeText: {
    color: Colors.primary,
    fontSize: 14,
    fontWeight: '500',
  },
  heroTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 16,
  },
  heroDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  primaryButton: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    marginBottom: 12,
    minWidth: 200,
  },
  primaryButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  secondaryButton: {
    borderWidth: 1,
    borderColor: Colors.primary,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  secondaryButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '500',
    textAlign: 'center',
  },
  illustration: {
    padding: 16,
  },
  illustrationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  illustrationContent: {
    gap: 16,
  },
  illustrationPlaceholder: {
    backgroundColor: Colors.primary + '20',
    borderRadius: 12,
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  illustrationIcon: {
    fontSize: 48,
    marginBottom: 8,
  },
  illustrationText: {
    fontSize: 16,
    color: Colors.textSecondary,
  },
  illustrationSubtext: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  featuresList: {
    gap: 16,
  },
  featureItem: {
    flexDirection: 'row',
    gap: 12,
  },
  featureIcon: {
    fontSize: 20,
    marginTop: 2,
  },
  featureTextContainer: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.text,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  features: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#E5E7EB',
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: 24,
  },
  stepsContainer: {
    gap: 24,
  },
  step: {
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  stepIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIconContainerSecondary: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: Colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIconContainerGreen: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: '#22C55E' + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  stepIcon: {
    fontSize: 32,
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: Colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  stepDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
  services: {
    padding: 24,
  },
  servicesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  serviceCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  serviceIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  serviceIcon: {
    fontSize: 20,
  },
  serviceTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.text,
  },
  cta: {
    padding: 32,
    alignItems: 'center',
  },
  ctaTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 12,
  },
  ctaDescription: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  ctaButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
    minWidth: 200,
  },
  ctaButtonText: {
    color: Colors.primary,
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  footerSubtext: {
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
  },
});
