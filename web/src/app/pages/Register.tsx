import React, { useState } from "react";
import { Link, useNavigate } from "react-router";
import { ArrowLeft, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { RegisterForm } from "../components/RegisterForm";
import { useHistoryTracker } from "../../services/useHistoryTracker";

export default function Register() {
  const navigate = useNavigate();
  const { trackAction } = useHistoryTracker();
  const [success, setSuccess] = useState(false);

  const handleSuccess = () => {
    setSuccess(true);
    trackAction("REGISTER", "Création de compte réussie", "success");
    
    // Redirection automatique
    setTimeout(() => {
      navigate("/citizen");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#F5EFE3] flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/Icone.png" alt="e-Citoyen CI" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-semibold text-[#1E1E1E]">e-Citoyen CI</h1>
              <p className="text-xs text-muted-foreground">République de Côte d'Ivoire</p>
            </div>
          </Link>
          <Link to="/login">
            <Button variant="outline" className="border-[#C86A4A] text-[#C86A4A] hover:bg-[#C86A4A]/10">
              Connexion
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-lg">
          <Link to="/login" className="inline-flex items-center gap-2 text-sm font-medium text-[#C86A4A] hover:text-[#D9622B] mb-4 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            Retour à la connexion
          </Link>

          <Card className="bg-white rounded-2xl shadow-sm border border-border/50">
            <CardHeader className="text-center pb-2">
              <CardTitle className="text-2xl font-bold text-[#1E1E1E]">
                Créer un compte citoyen
              </CardTitle>
              <CardDescription className="text-sm text-muted-foreground">
                Inscrivez-vous pour effectuer vos démarches administratives en ligne.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4">
              {success ? (
                <div className="py-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-[#2E6B57]/10 flex items-center justify-center mx-auto animate-bounce">
                    <CheckCircle2 className="w-10 h-10 text-[#2E6B57]" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-[#2E6B57]">Compte créé avec succès</h3>
                    <p className="text-sm text-muted-foreground mt-2">
                      Connexion automatique en cours...
                    </p>
                  </div>
                </div>
              ) : (
                <>
                  <RegisterForm onSuccess={handleSuccess} />
                  
                  <div className="mt-6 text-center text-sm text-muted-foreground border-t pt-4">
                    Vous avez déjà un compte ?{" "}
                    <Link to="/login" className="font-semibold text-[#C86A4A] hover:text-[#D9622B] hover:underline transition-colors">
                      Se connecter
                    </Link>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
