import { Button } from "../components/ui/button";
import { Link } from "react-router";
import { Shield, Sparkles, FileText, Clock, CheckCircle2 } from "lucide-react";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">e-Citoyen CI</h1>
              <p className="text-xs text-muted-foreground">République de Côte d'Ivoire</p>
            </div>
          </div>
          <Link to="/login">
            <Button variant="outline">Connexion</Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary mb-6">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm">Assisté par Intelligence Artificielle</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-foreground mb-6">
            Votre assistant administratif intelligent
          </h2>
          
          <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Simplifiez vos démarches administratives avec e-Citoyen CI. 
            Notre assistant IA vous guide à travers toutes vos procédures gouvernementales.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/login">
              <Button size="lg" className="w-full sm:w-auto">
                Commencer
              </Button>
            </Link>
            <Button
              size="lg"
              variant="outline"
              className="w-full sm:w-auto"
              onClick={() => document.getElementById("decouvrir-service")?.scrollIntoView({ behavior: "smooth" })}
            >
              Découvrir le service
            </Button>
          </div>
        </div>

        {/* Illustration */}
        <div id="decouvrir-service" className="mt-16 max-w-3xl mx-auto">
          <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 border border-border">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <div className="w-full h-64 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-xl flex items-center justify-center">
                  <div className="text-center">
                    <Shield className="w-24 h-24 text-primary mx-auto mb-4" />
                    <p className="text-muted-foreground">Illustration</p>
                    <p className="text-sm text-muted-foreground">Citoyen & IA</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <FileText className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Démarches simplifiées</h4>
                    <p className="text-sm text-muted-foreground">
                      Décrivez votre situation et recevez un guide personnalisé
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Sparkles className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Intelligence artificielle</h4>
                    <p className="text-sm text-muted-foreground">
                      Notre IA analyse et génère des réponses précises
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="w-5 h-5 text-primary mt-1" />
                  <div>
                    <h4 className="font-semibold mb-1">Vérifié par des agents</h4>
                    <p className="text-sm text-muted-foreground">
                      Chaque demande est validée par nos agents administratifs
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="bg-white py-16 md:py-24 border-y border-border">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Comment ça fonctionne ?
            </h3>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Un processus simple en trois étapes pour toutes vos démarches administratives
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <h4 className="text-xl font-semibold mb-3">1. Décrivez votre situation</h4>
              <p className="text-muted-foreground">
                Expliquez votre besoin administratif en quelques phrases ou à la voix
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                <Sparkles className="w-8 h-8 text-secondary" />
              </div>
              <h4 className="text-xl font-semibold mb-3">2. L'IA analyse</h4>
              <p className="text-muted-foreground">
                Notre assistant génère un guide complet avec documents, délais et coûts
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 className="w-8 h-8 text-green-600" />
              </div>
              <h4 className="text-xl font-semibold mb-3">3. Validation</h4>
              <p className="text-muted-foreground">
                Un agent vérifie et confirme votre demande pour garantir sa conformité
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="container mx-auto px-4 py-16 md:py-24">
        <div className="text-center mb-12">
          <h3 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Services disponibles
          </h3>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Toutes vos démarches administratives en un seul endroit
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {[
            "Déclaration de naissance",
            "Carte nationale d'identité",
            "Assurance maladie",
            "Prestations sociales",
            "Extrait de naissance",
            "Passeport",
            "Permis de conduire",
            "Certificats divers"
          ].map((service) => (
            <div key={service} className="bg-white rounded-xl p-6 border border-border hover:shadow-md transition-shadow">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-3">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <h4 className="font-semibold">{service}</h4>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gradient-to-br from-primary to-secondary py-16 md:py-24">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-6">
            Prêt à simplifier vos démarches ?
          </h3>
          <p className="text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de citoyens qui utilisent déjà e-Citoyen CI
          </p>
          <Link to="/login">
            <Button size="lg" variant="secondary" className="bg-white text-primary hover:bg-white/90">
              Commencer maintenant
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-border py-8">
        <div className="container mx-auto px-4 text-center text-muted-foreground">
          <p>© 2026 e-Citoyen CI - République de Côte d'Ivoire</p>
          <p className="text-sm mt-2">Service public numérique officiel</p>
        </div>
      </footer>
    </div>
  );
}
