import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MobileNav } from "../components/MobileNav";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, ChevronDown, Send, FileText, CheckCircle2, MessageSquare, HelpCircle, Mail, Phone, MapPin, X } from "lucide-react";
import { Input } from "../components/ui/input";
import { Textarea } from "../components/ui/textarea";

interface FAQItem {
  question: string;
  answer: string;
}

const faqData: FAQItem[] = [
  {
    question: "Comment puis-je suivre l'avancement de ma demande ?",
    answer: "Vous pouvez suivre l'avancement de votre demande directement depuis l'écran 'Mes Demandes'. Le badge de statut passera de 'En attente' à 'En cours' puis à 'Traitée' ou 'Rejetée' en temps réel selon les étapes de l'analyse automatique."
  },
  {
    question: "Quelles pièces dois-je fournir pour une demande de CNI ?",
    answer: "Pour une demande de Carte Nationale d'Identité (CNI), vous devez généralement fournir : un extrait d'acte de naissance récent (moins de 3 mois), un certificat de nationalité, un reçu de paiement du timbre fiscal de 5 000 FCFA, et un justificatif de domicile (facture CIE/SODECI)."
  },
  {
    question: "Que faire en cas de rejet de ma demande ?",
    answer: "Si votre demande est rejetée, le statut de la demande passera à 'Rejetée' et le motif détaillé du rejet sera précisé dans la section 'Réponse de l'Assistant'. Vous pourrez corriger les pièces manquantes ou erronées et soumettre à nouveau une nouvelle demande."
  },
  {
    question: "Comment fonctionne l'analyse intelligente des demandes ?",
    answer: "Notre assistant virtuel e-Citoyen utilise l'intelligence artificielle pour analyser instantanément votre message. Il identifie la catégorie administrative correspondante, extrait les démarches requises, détermine les pièces justificatives nécessaires, estime le coût réglementaire et peut même vous prérédiger une lettre administrative de demande."
  }
];

interface GuideStep {
  title: string;
  desc: string;
  icon: any;
  color: string;
}

const guideSteps: GuideStep[] = [
  {
    title: "1. Décrivez votre besoin",
    desc: "Saisissez simplement votre demande en texte libre de manière naturelle.",
    icon: MessageSquare,
    color: "bg-blue-100 text-blue-600"
  },
  {
    title: "2. Analyse instantanée",
    desc: "L'intelligence artificielle e-Citoyen extrait immédiatement les formalités requises.",
    icon: HelpCircle,
    color: "bg-amber-100 text-amber-600"
  },
  {
    title: "3. Traitement intelligent",
    desc: "Votre demande est analysée et structurée en conformité avec les règles officielles.",
    icon: FileText,
    color: "bg-purple-100 text-purple-600"
  },
  {
    title: "4. Réception & Retrait",
    desc: "Suivez le statut en temps réel et recevez vos documents officiels finalisés.",
    icon: CheckCircle2,
    color: "bg-green-100 text-green-600"
  }
];

export default function Help() {
  const navigate = useNavigate();
  const [openFAQIndex, setOpenFAQIndex] = useState<number | null>(null);
  const [showContactModal, setShowContactModal] = useState(false);
  const [contactForm, setContactForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [isSubmitted, setIsSubmitted] = useState(false);

  const toggleFAQ = (index: number) => {
    setOpenFAQIndex(openFAQIndex === index ? null : index);
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulation d'envoi API
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setShowContactModal(false);
      setContactForm({ name: "", email: "", subject: "", message: "" });
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
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
                <h1 className="text-lg font-semibold">Centre d'Aide & Support</h1>
                <p className="text-xs text-muted-foreground">
                  Foire aux questions, guides et contact direct
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl space-y-10">
        {/* Quick Guide */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Guide rapide d'utilisation</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {guideSteps.map((step, idx) => (
              <Card key={idx} className="bg-white border border-border">
                <CardContent className="p-5 text-center space-y-3">
                  <div className={`w-12 h-12 rounded-2xl ${step.color} flex items-center justify-center mx-auto`}>
                    <step.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground">{step.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{step.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* FAQ Accordion */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-foreground">Foire Aux Questions (FAQ)</h2>
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
                <Phone className="w-5 h-5 text-primary" />
                Coordonnées du support
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground">
              <p>Nos équipes d'assistance sont disponibles du Lundi au Vendredi de 8h00 à 17h00.</p>
              <div className="space-y-3 pt-2">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-primary" />
                  <span>support@ecitoyen.ci</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-primary" />
                  <span>+225 07 00 00 00 00</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-primary" />
                  <span>Plateau, Abidjan, Côte d'Ivoire</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prompt Form card */}
          <Card className="border border-primary/20 bg-primary/5 flex flex-col justify-between p-6">
            <div className="space-y-3">
              <h3 className="font-bold text-lg text-primary flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Une question spécifique ?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Si vous ne trouvez pas de réponse dans notre FAQ ou notre guide d'utilisation, vous pouvez envoyer un message direct à nos conseillers.
              </p>
            </div>
            <Button 
              onClick={() => setShowContactModal(true)} 
              className="w-full mt-6 active:scale-95 transition-transform"
            >
              Nous contacter
            </Button>
          </Card>
        </section>
      </div>

      {/* Contact Support Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div 
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 border-b border-border flex justify-between items-center bg-accent/20">
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <Mail className="w-5 h-5 text-primary" />
                Formulaire d'Assistance
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

            {/* Modal Body */}
            {isSubmitted ? (
              <div className="p-8 text-center flex flex-col items-center justify-center gap-4 animate-scale-up">
                <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-foreground">Message envoyé avec succès !</h3>
                  <p className="text-muted-foreground text-sm mt-1">
                    Nos conseillers reviendront vers vous sous 24 à 48 heures.
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
                  <label className="text-xs font-semibold text-muted-foreground">Sujet de la demande</label>
                  <Input 
                    type="text" 
                    required 
                    placeholder="Ex: Difficultés de paiement, Document manquant..." 
                    value={contactForm.subject}
                    onChange={(e) => setContactForm({ ...contactForm, subject: e.target.value })}
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground">Votre message</label>
                  <Textarea 
                    required 
                    rows={4}
                    placeholder="Décrivez votre problème en détail..." 
                    value={contactForm.message}
                    onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                  />
                </div>

                {/* Modal Footer */}
                <div className="pt-2 border-t border-border flex justify-end gap-3 bg-accent/10 -mx-5 -mb-5 p-4 mt-4">
                  <Button variant="ghost" type="button" onClick={() => setShowContactModal(false)}>
                    Annuler
                  </Button>
                  <Button type="submit" className="active:scale-95 transition-transform">
                    <Send className="w-4 h-4 mr-2" />
                    Envoyer le message
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
