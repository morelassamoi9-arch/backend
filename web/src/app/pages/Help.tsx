import { useState, useMemo } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MobileNav } from "../components/MobileNav";
import { useNavigate } from "react-router";
import { 
  ArrowLeft, 
  ChevronDown, 
  Send, 
  FileText, 
  CheckCircle2, 
  Search, 
  BookOpen, 
  Phone, 
  Mail, 
  MapPin, 
  X, 
  Globe, 
  HelpCircle,
  Shield,
  LifeBuoy
} from "lucide-react";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

// ============================================
// BASE DE DONNÉES DES GUIDES D'UTILISATION
// ============================================
interface Guide {
  id: string;
  titre: string;
  categorie: string;
  description: string;
  etapes: string[];
}

const guidesData: Guide[] = [
  {
    id: "inscription",
    titre: "Comment créer un compte ?",
    categorie: "Débuter",
    description: "Guide étape par étape pour s'inscrire sur la plateforme e-Citoyen CI.",
    etapes: [
      "Cliquez sur 'Créer un compte' depuis la page d'accueil ou la page de connexion.",
      "Renseignez votre nom complet, votre adresse e-mail et choisissez un mot de passe sécurisé (minimum 8 caractères, contenant une majuscule, une minuscule, un chiffre et un caractère spécial).",
      "Saisissez éventuellement votre numéro de téléphone pour faciliter le suivi.",
      "Validez l'inscription. Votre compte est créé immédiatement et vous serez connecté automatiquement."
    ]
  },
  {
    id: "connexion",
    titre: "Comment se connecter ?",
    categorie: "Débuter",
    description: "Guide de connexion pour accéder à votre espace citoyen.",
    etapes: [
      "Rendez-vous sur la page de connexion de l'application.",
      "Saisissez l'adresse e-mail et le mot de passe renseignés lors de votre inscription.",
      "Cliquez sur 'Se connecter' pour être redirigé vers votre tableau de bord personnel."
    ]
  },
  {
    id: "demande",
    titre: "Comment soumettre une demande ?",
    categorie: "Utilisation",
    description: "Comment utiliser l'assistant intelligent pour obtenir des informations sur vos démarches.",
    etapes: [
      "Depuis votre tableau de bord, cliquez sur le bouton '+ Nouvelle Demande'.",
      "Saisissez votre demande en langage naturel et décrivez votre situation avec précision (ex: 'Je souhaite renouveler ma CNI expirée depuis 3 mois' ou 'Quelles sont les pièces pour un passeport bébé ?').",
      "Cliquez sur 'Envoyer' pour soumettre la demande. Notre IA multi-agents (CrewAI & Gemini) va analyser votre texte.",
      "Attendez quelques secondes pendant le traitement en arrière-plan."
    ]
  },
  {
    id: "suivi",
    titre: "Comment suivre une demande ?",
    categorie: "Utilisation",
    description: "Suivre l'historique et l'avancement de vos demandes d'aide.",
    etapes: [
      "Rendez-vous dans la section 'Mes demandes' ou faites défiler le tableau de bord pour voir les 'Demandes récentes'.",
      "Consultez le statut de votre demande : 'En attente', 'En cours' (l'IA analyse votre dossier), ou 'Traitée'.",
      "Cliquez sur la demande pour afficher le rapport complet contenant : le résumé de la situation, les pièces justificatives requises, les coûts officiels, les délais estimés, les adresses des guichets physiques et une lettre type si nécessaire."
    ]
  },
  {
    id: "conseils",
    titre: "Conseils pour formuler vos demandes",
    categorie: "Sécurité",
    description: "Astuces pour obtenir les meilleures réponses possibles de l'assistant virtuel.",
    etapes: [
      "Soyez le plus précis possible dans votre description.",
      "Mentionnez l'âge de la personne concernée ou les détails temporels si pertinent (ex: 'délai de 3 mois dépassé').",
      "Indiquez la localité ou la mairie concernée pour des conseils géographiques précis.",
      "Ne transmettez jamais d'informations hautement confidentielles comme des numéros de carte bancaire, des numéros de pièces d'identité originaux ou des mots de passe."
    ]
  }
];

const categories = [
  "Toutes",
  "Débuter",
  "Utilisation",
  "Sécurité"
];

// ============================================
// QUESTIONS FRÉQUENTES (FAQ) SUR L'APPLICATION
// ============================================
const faqData = [
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
    answer: "Vos données personnelles (nom, email, historique des demandes) sont stockées dans une base de données sécurisée. Nous respectons les réglementations de protection des données personnelles et n'utilisons vos saisies que pour vous fournir le service d'assistance demandé. Aucun partage commercial n'est effectué."
  },
  {
    question: "Puis-je modifier mes informations de profil ?",
    answer: "Oui, vous pouvez modifier votre nom, prénom et numéro de téléphone directement depuis l'onglet 'Mon profil' ou via l'interface correspondante. Vous pouvez également changer votre mot de passe en toute sécurité dans cette même section."
  },
  {
    question: "Que faire si l'assistant affiche une erreur lors d'une demande ?",
    answer: "Si le traitement échoue (par exemple en cas de forte affluence sur les serveurs d'IA ou de dépassement de quota), la demande passe au statut 'Erreur'. Vous pouvez cliquer sur la demande pour voir l'explication ou tenter de la relancer en cliquant sur 'Régénérer'."
  },
  {
    question: "Comment supprimer mon compte définitivement ?",
    answer: "Vous pouvez supprimer votre compte à tout moment depuis la page de gestion du profil. Cette action supprimera définitivement votre compte utilisateur et l'ensemble de votre historique de demandes sans possibilité de récupération."
  }
];

export default function Help() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Toutes");
  const [activeGuide, setActiveGuide] = useState<Guide | null>(null);
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Filtrer les guides selon la recherche et la catégorie
  const filteredGuides = useMemo(() => {
    return guidesData.filter((guide) => {
      const matchesCategory = selectedCategory === "Toutes" || guide.categorie === selectedCategory;
      const matchesSearch = 
        guide.titre.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        guide.categorie.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setShowContactModal(false);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-8">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/citizen")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div className="flex items-center gap-3">
              <img src="/Icone.png" alt="e-Citoyen CI" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-lg font-semibold text-foreground">Centre d'Aide & Support</h1>
                <p className="text-xs text-muted-foreground">
                  Guide d'utilisation, FAQ générale et assistance technique de la plateforme
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-10">
        
        {/* Barre de recherche & Filtres */}
        <section className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="relative w-full md:max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Rechercher un guide ou tutoriel (ex: inscription, connexion...)"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                    selectedCategory === cat
                      ? "bg-primary text-white"
                      : "bg-muted text-muted-foreground hover:bg-muted/80"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Index des guides */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Guides d'utilisation & Tutoriels</h2>
          </div>
          {filteredGuides.length === 0 ? (
            <div className="text-center py-10 bg-white rounded-xl border border-border">
              <p className="text-muted-foreground">Aucun guide ne correspond à votre recherche.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGuides.map((guide) => (
                <Card 
                  key={guide.id} 
                  className="bg-white border border-border hover:border-primary/50 transition-all cursor-pointer flex flex-col justify-between"
                  onClick={() => setActiveGuide(guide)}
                >
                  <CardHeader className="pb-2">
                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/10 px-2.5 py-1 rounded-full w-max">
                      {guide.categorie}
                    </span>
                    <CardTitle className="text-sm font-bold text-foreground pt-2 leading-snug">
                      {guide.titre}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-3">
                    <p className="text-xs text-muted-foreground line-clamp-2">
                      {guide.description}
                    </p>
                    <div className="flex items-center justify-end text-[11px] font-medium border-t border-border/50 pt-2 text-primary">
                      <span>Consulter le guide →</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* FAQ Accordion */}
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold text-foreground">Questions fréquentes (FAQ)</h2>
          </div>
          <Card className="bg-white border border-border overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              {faqData.map((item, idx) => {
                const isOpen = openFAQIndex === idx;
                return (
                  <div key={idx} className="transition-colors hover:bg-muted/10">
                    <button
                      className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm md:text-base text-foreground focus:outline-none"
                      onClick={() => toggleFAQ(idx)}
                    >
                      <span>{item.question}</span>
                      <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isOpen ? "transform rotate-180 text-primary" : ""}`} />
                    </button>
                    <div 
                      className={`overflow-hidden transition-all duration-300 ${
                        isOpen ? "max-h-[300px] border-t border-border/40" : "max-h-0"
                      }`}
                    >
                      <div className="p-5 text-sm text-muted-foreground leading-relaxed bg-muted/20">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </section>

        {/* Support Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch">
          {/* Contact Details Card */}
          <Card className="bg-white border border-border flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-primary" />
                Assistance technique
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground flex-1">
              <p>Vous rencontrez un bug ou un problème de connexion avec l'application ? Nos techniciens sont à votre écoute.</p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>support@ecitoyen.ci</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+225 07 00 00 00 00 (Lundi - Vendredi 8h - 17h)</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Plateau, Abidjan, République de Côte d'Ivoire</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Form Card */}
          <Card className="border border-primary/20 bg-primary/5 flex flex-col justify-between p-6">
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Écrire à l'assistance technique
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Vous avez besoin de contacter un conseiller ? Remplissez notre formulaire pour envoyer un ticket d'assistance technique directement à notre équipe de support.
              </p>
            </div>
            <Button 
              onClick={() => setShowContactModal(true)} 
              className="w-full mt-6 active:scale-95 transition-transform"
            >
              Ouvrir le formulaire
            </Button>
          </Card>
        </section>
      </div>

      {/* MODAL / DRAWER DETAIL D'UN GUIDE */}
      {activeGuide && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setActiveGuide(null)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="p-6 border-b border-border flex justify-between items-center bg-muted/20">
              <div>
                <span className="text-[10px] uppercase tracking-wider font-bold text-primary bg-primary/15 px-2.5 py-1 rounded-full">
                  {activeGuide.categorie}
                </span>
                <h2 className="text-lg font-bold text-foreground mt-2 leading-snug">
                  {activeGuide.titre}
                </h2>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setActiveGuide(null)}
                className="rounded-full hover:bg-muted"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1 text-sm text-muted-foreground leading-relaxed">
              {/* Description */}
              <div className="space-y-1">
                <h3 className="font-bold text-foreground text-base">Description</h3>
                <p className="text-sm">{activeGuide.description}</p>
              </div>

              {/* Étapes */}
              <div className="space-y-3 pt-2">
                <h3 className="font-bold text-foreground text-base flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-primary" />
                  Étapes à suivre
                </h3>
                <ol className="space-y-3 pl-1 text-foreground font-medium">
                  {activeGuide.etapes.map((etape, idx) => (
                    <li key={idx} className="flex gap-3 items-start font-normal text-muted-foreground">
                      <span className="flex-shrink-0 w-6 h-6 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="flex-1 pt-0.5 text-sm">{etape}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border flex justify-end gap-3 bg-muted/20">
              <Button onClick={() => setActiveGuide(null)} className="bg-primary hover:bg-primary/95 text-white">
                Compris, fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONTACT */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setShowContactModal(false)}>
          <div 
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 border-b border-border flex justify-between items-center bg-accent/20">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Formulaire de Support Technique
              </h2>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowContactModal(false)}
                className="rounded-full hover:bg-muted"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>

            {isSubmitted ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-4 animate-scale-up">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Message envoyé !</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Notre équipe de support technique vous répondra par e-mail dans les plus brefs délais.
                  </p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleContactSubmit} className="p-5 space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Votre nom complet</label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="Ex: Jean Kouadio" 
                    value={contactForm.name}
                    onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Votre adresse e-mail</label>
                  <Input 
                    type="email" 
                    required 
                    placeholder="Ex: jean.kouadio@email.com" 
                    value={contactForm.email}
                    onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Sujet du problème</label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="Ex: Erreur de déconnexion, chargement lent..." 
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Description du problème technique</label>
                  <Textarea 
                    required 
                    rows={4}
                    placeholder="Saisissez les détails de l'erreur rencontrée..." 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>

                <div className="pt-2 border-t border-border flex justify-end gap-3 bg-accent/10 -mx-5 -mb-5 p-4 mt-4">
                  <Button variant="ghost" type="button" onClick={() => setShowContactModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="active:scale-95 transition-transform">
                    <Send className="w-4 h-4 mr-2" />
                    Soumettre le ticket
                  </Button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
