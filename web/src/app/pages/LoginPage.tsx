import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link, useNavigate } from "react-router";
import { User, AlertCircle } from "lucide-react";
import React, { useState, useEffect } from "react";
import { useHistoryTracker } from "../../services/useHistoryTracker";
import { useAuth } from "../../hooks/useAuth";

// ============================================
// COMPOSANT LOGIN
// ============================================
export default function LoginPage() {
  const navigate = useNavigate();
  const { trackAction } = useHistoryTracker();
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/citizen");
    }
  }, [isAuthenticated, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Appel API via le hook d'authentification centralisé
      const result = await login(email, password);
      
      console.log('✅ Connecté:', result.user);

      // Track successful login
      trackAction("LOGIN", `Connexion réussie : ${result.user.nom || email}`, "success", {
        email: result.user.email,
        role: result.user.role
      });

      // Redirection
      navigate("/citizen");
    } catch (err: any) {
      console.error('❌ Erreur:', err.message);
      const errMsg = err.message || "Email ou mot de passe incorrect";
      setError(errMsg);
      
      // Track failed login
      trackAction("LOGIN", `Échec de connexion pour l'adresse ${email}`, "failed", {
        email,
        error: errMsg
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <header className="border-b border-border bg-white">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <img src="/Icone.png" alt="e-Citoyen CI" className="w-10 h-10 object-contain" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">e-Citoyen CI</h1>
              <p className="text-xs text-muted-foreground">République de Côte d'Ivoire</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card>
            <CardHeader>
              <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <User className="w-8 h-8 text-primary" />
              </div>
              <CardTitle className="text-2xl text-center">
                Connexion
              </CardTitle>
              <CardDescription className="text-center">
                Entrez vos identifiants pour continuer
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleLogin} className="space-y-4">
                {/* Message d'erreur */}
                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-center gap-2 text-red-700 text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    placeholder="votre.email@exemple.ci"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Mot de passe</Label>
                  <Input 
                    id="password" 
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full py-6 text-base font-semibold transition-all shadow-sm rounded-xl text-white"
                  style={{
                    backgroundColor: "#C86A4A",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#D9622B")}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#C86A4A")}
                  disabled={loading}
                >
                  {loading ? "Connexion..." : "Se connecter"}
                </Button>

                <div className="text-center pt-2">
                  <Link to="/register" className="font-semibold text-[#C86A4A] hover:text-[#D9622B] hover:underline transition-colors text-sm">
                    Créer un compte
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}