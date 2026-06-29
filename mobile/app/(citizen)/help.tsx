import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Linking } from "react-native";
import { router } from "expo-router";
import { Colors } from "../../constants/Colors";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Qu'est-ce que e-Citoyen CI ?",
    answer: "e-Citoyen CI est un copilote administratif basé sur l'intelligence artificielle. Il a pour but de guider les citoyens ivoiriens dans leurs démarches quotidiennes (CNI, passeport, actes civils) en leur fournissant un plan d'action clair et personnalisé à partir d'une simple description en langage naturel."
  },
  {
    question: "Les réponses de l'IA sont-elles officielles ?",
    answer: "L'assistant IA est entraîné sur les guides et procédures officiels de l'administration ivoirienne. Cependant, les rapports générés ont une valeur informative et d'accompagnement. Ils ne remplacent pas les décisions officielles des agents des administrations concernées (ONECI, SNEDAI, Mairies, Ministères)."
  },
  {
    question: "Comment mes données personnelles sont-elles protégées ?",
    answer: "Vos données personnelles (nom, email, historique des demandes) sont stockées dans une base de données sécurisée. Nous respectons les réglementations de protection des données et n'utilisons vos saisies que pour vous fournir le service d'assistance. Aucun partage commercial n'est effectué."
  },
  {
    question: "Puis-je modifier mon profil ?",
    answer: "Oui, vous pouvez modifier votre nom, prénom et numéro de téléphone directement depuis l'onglet 'Mon profil' (ou via l'interface correspondante). Vous pouvez également changer votre mot de passe en toute sécurité dans cette même section."
  },
  {
    question: "Que faire si l'assistant affiche une erreur ?",
    answer: "Si le traitement échoue (par exemple en cas de forte affluence sur les serveurs d'IA ou de dépassement de quota), la demande passe au statut 'Erreur'. Vous pouvez la relancer en cliquant sur le bouton 'Régénérer' ou en soumettant à nouveau votre texte."
  },
  {
    question: "Comment supprimer mon compte définitivement ?",
    answer: "La suppression du compte se fait directement depuis la page de gestion du profil de l'utilisateur. Cette action efface définitivement toutes vos données et votre historique de demandes de nos serveurs."
  }
];

interface GuideItem {
  title: string;
  description: string;
  steps: string[];
}

const guidesData: GuideItem[] = [
  {
    title: "Créer un compte",
    description: "Guide pour s'inscrire sur la plateforme e-Citoyen CI.",
    steps: [
      "Cliquez sur 'Créer un compte' sur l'écran de connexion.",
      "Renseignez votre nom, e-mail et choisissez un mot de passe sécurisé (min 8 caractères, majuscule, chiffre, caractère spécial).",
      "Saisissez éventuellement votre numéro de téléphone.",
      "Validez l'inscription pour être connecté automatiquement."
    ]
  },
  {
    title: "Soumettre une demande",
    description: "Comment utiliser l'assistant intelligent pour vos démarches.",
    steps: [
      "Depuis l'écran d'accueil, cliquez sur '+ Nouvelle Demande'.",
      "Décrivez précisément votre démarche administrative en langage naturel (ex: 'Quelles sont les pièces pour renouveler mon passeport ?').",
      "Cliquez sur 'Envoyer' pour lancer l'analyse par l'IA.",
      "Attendez quelques secondes pendant le traitement en arrière-plan."
    ]
  },
  {
    title: "Suivre vos dossiers",
    description: "Consulter l'historique et les rapports d'analyse.",
    steps: [
      "Allez dans l'onglet 'Mes demandes' depuis le menu principal.",
      "Consultez les statuts de traitement de vos demandes (En attente, En cours, Traitée, Erreur).",
      "Cliquez sur une demande pour lire la réponse structurée (pièces requises, coûts, délais, guichets, lettre type)."
    ]
  }
];

function FAQCard({ item }: { item: FAQItem }) {
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
  const handleContactSupport = () => {
    Linking.openURL("mailto:support@ecitoyen.ci?subject=Assistance Technique e-Citoyen CI");
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Text style={styles.backButtonText}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Centre d'Aide</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Introduction */}
        <View style={styles.introduction}>
          <Text style={styles.introTitle}>Besoin d'aide ?</Text>
          <Text style={styles.introText}>
            Découvrez comment utiliser l'application e-Citoyen CI au mieux grâce à nos guides et questions fréquentes.
          </Text>
        </View>

        {/* Guides Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Guides d'utilisation</Text>
          {guidesData.map((guide, index) => (
            <GuideCard key={index} guide={guide} />
          ))}
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Questions fréquentes (FAQ)</Text>
          {faqData.map((item, index) => (
            <FAQCard key={index} item={item} />
          ))}
        </View>

        {/* Contact Section */}
        <View style={styles.contactSection}>
          <Text style={styles.contactTitle}>Assistance technique</Text>
          <Text style={styles.contactText}>
            Vous rencontrez un bug ou un problème de connexion avec l'application ? Contactez notre support technique.
          </Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleContactSupport}>
            <Text style={styles.contactButtonText}>Contacter le support</Text>
          </TouchableOpacity>
        </View>

        {/* Legal Section */}
        <View style={styles.legalSection}>
          <Text style={styles.legalTitle}>Informations légales</Text>
          <View style={styles.legalLink}>
            <Text style={styles.legalLinkText}>• Services de l'Administration Ivoirienne</Text>
          </View>
          <View style={styles.legalLink}>
            <Text style={styles.legalLinkText}>• Données Personnelles Sécurisées</Text>
          </View>
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
    fontSize: 15,
    fontWeight: "600",
    color: Colors.text,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 18,
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
    fontSize: 13,
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: "center",
    opacity: 0.9,
    lineHeight: 18,
  },
  contactButton: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  contactButtonText: {
    fontSize: 15,
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
    paddingVertical: 6,
  },
  legalLinkText: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
});