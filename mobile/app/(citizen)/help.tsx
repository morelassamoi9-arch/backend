import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/Colors";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Comment fonctionne e-Citoyen CI ?",
    answer: "e-Citoyen CI utilise l'intelligence artificielle pour analyser votre demande administrative et vous fournir un guide personnalisé. Décrivez simplement votre situation en langage naturel, et notre système vous indiquera les étapes à suivre, les documents requis et les coûts."
  },
  {
    question: "Quels types de démarches sont couverts ?",
    answer: "Nous couvrons les principales démarches administratives ivoiriennes : déclaration de naissance, carte d'identité nationale, passeport, permis de conduire, assurance maladie (CMU), prestations sociales, et bien d'autres. Notre base de connaissances est régulièrement mise à jour."
  },
  {
    question: "Est-ce que le service est gratuit ?",
    answer: "Oui, e-Citoyen CI est un service public gratuit. Vous pouvez accéder à toutes les fonctionnalités sans frais. Notre objectif est de simplifier l'accès aux services administratifs pour tous les citoyens ivoiriens."
  },
  {
    question: "Mes données personnelles sont-elles sécurisées ?",
    answer: "Absolument. Nous respectons strictement la confidentialité de vos données. Toutes les informations sont protégées par chiffrement et ne sont jamais partagées avec des tiers. Seul le personnel autorisé peut accéder aux données pour traiter vos demandes."
  },
  {
    question: "Puis-je utiliser le service sans connexion internet ?",
    answer: "Une connexion internet est requise pour utiliser e-Citoyen CI car notre système d'IA fonctionne en ligne. Cependant, une fois vos demandes traitées, vous pouvez consulter les résultats hors ligne si vous les avez sauvegardés."
  },
  {
    question: "Comment contacter le support en cas de problème ?",
    answer: "Si vous rencontrez un problème technique ou avez une question non couverte dans cette aide, vous pouvez nous contacter via notre formulaire de contact ou envoyer un email à support@ecitoyen.ci. Notre équipe vous répondra dans les plus brefs délais."
  }
];

interface GuideItem {
  title: string;
  description: string;
  steps: string[];
}

const guidesData: GuideItem[] = [
  {
    title: "Comment faire une demande de CNI",
    description: "La Carte Nationale d'Identité est le document d'identité principal en Côte d'Ivoire.",
    steps: [
      "Rassemblez les documents requis : acte de naissance, certificat de nationalité, photos d'identité",
      "Rendez-vous au centre d'état civil le plus proche",
      "Remplissez le formulaire de demande sur place",
      "Payez les frais de dossier (environ 2000 FCFA)",
      "Récupérez votre CNI après le délai de traitement (généralement 2-3 semaines)"
    ]
  },
  {
    title: "Déclaration de naissance",
    description: "La déclaration de naissance doit être faite dans les 30 jours suivant la naissance.",
    steps: [
      "Obtenez le certificat d'accouchement de la maternité",
      "Rendez-vous à la mairie du lieu de naissance",
      "Présentez les pièces d'identité des parents",
      "Remplissez le formulaire de déclaration",
      "Récupérez l'extrait de naissance provisoire immédiatement"
    ]
  },
  {
    title: "Obtenir la CMU",
    description: "La Couverture Maladie Universelle assure l'accès aux soins de santé.",
    steps: [
      "Remplissez le formulaire d'adhésion",
      "Fournissez une copie de votre CNI ou acte de naissance",
      "Présentez vos justificatifs de revenus ou attestation de non-imposition",
      "Déposez le dossier au centre CMU le plus proche",
      "Attendez la validation (environ 15 jours)"
    ]
  }
];

function FAQItem({ item }: { item: FAQItem }) {
  return (
    <View style={styles.faqItem}>
      <Text style={styles.faqQuestion}>{item.question}</Text>
      <Text style={styles.faqAnswer}>{item.answer}</Text>
    </View>
  );
}

function GuideCard({ guide }: { guide: GuideItem }) {
  return (
    <View style={styles.guideCard}>
      <Text style={styles.guideTitle}>{guide.title}</Text>
      <Text style={styles.guideDescription}>{guide.description}</Text>
      <View style={styles.guideSteps}>
        {guide.steps.map((step, index) => (
          <View key={index} style={styles.stepItem}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{index + 1}</Text>
            </View>
            <Text style={styles.stepText}>{step}</Text>
          </View>
        ))}
      </View>
    </View>
  );
}

export default function HelpPage() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Aide</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introduction}>
          <Text style={styles.introTitle}>Besoin d'aide ?</Text>
          <Text style={styles.introText}>
            Trouvez des réponses à vos questions et découvrez comment utiliser e-Citoyen CI au mieux.
          </Text>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes</Text>
          {faqData.map((item, index) => (
            <FAQItem key={index} item={item} />
          ))}
        </View>

        {/* Guides Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guides pratiques</Text>
          {guidesData.map((guide, index) => (
            <GuideCard key={index} guide={guide} />
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Vous ne trouvez pas votre réponse ?</Text>
          <Text style={styles.contactText}>
            Notre équipe est là pour vous aider. N'hésitez pas à nous contacter.
          </Text>
          <TouchableOpacity style={styles.contactButton}>
            <Text style={styles.contactButtonText}>Contacter le support</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>Informations légales</Text>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>Conditions d'utilisation</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>Politique de confidentialité</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.legalLink}>
            <Text style={styles.legalLinkText}>Mentions légales</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 16,
    color: Colors.primary,
    fontWeight: "500",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
  },
  headerSpacer: {
    width: 60,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  introduction: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  introTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: Colors.text,
    marginBottom: 8,
  },
  introText: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 16,
  },
  faqItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  guideCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  guideTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  guideDescription: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 16,
    lineHeight: 20,
  },
  guideSteps: {
    gap: 12,
  },
  stepItem: {
    flexDirection: "row",
    gap: 12,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
  },
  stepNumberText: {
    fontSize: 12,
    fontWeight: "600",
    color: '#FFFFFF',
  },
  stepText: {
    flex: 1,
    fontSize: 14,
    color: Colors.text,
    lineHeight: 20,
  },
  contactSection: {
    backgroundColor: Colors.primary,
    borderRadius: 12,
    padding: 20,
    marginBottom: 24,
    alignItems: "center",
  },
  contactTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: "center",
  },
  contactText: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: "center",
    opacity: 0.9,
  },
  contactButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.primary,
  },
  legalSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  legalTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 12,
  },
  legalLink: {
    paddingVertical: 8,
  },
  legalLinkText: {
    fontSize: 14,
    color: Colors.primary,
  },
});