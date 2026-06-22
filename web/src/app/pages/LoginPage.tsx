// import { Button } from "../components/ui/button";
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
// import { Input } from "../components/ui/input";
// import { Label } from "../components/ui/label";
// import { Link, useNavigate } from "react-router";
// import { Shield, User, ShieldCheck } from "lucide-react";
// import { useState } from "react";

// export default function LoginPage() {
//   const navigate = useNavigate();
//   const [selectedRole, setSelectedRole] = useState<"citizen" | "agent" | null>(null);

//   const handleRoleSelection = (role: "citizen" | "agent") => {
//     setSelectedRole(role);
//   };

//   const handleLogin = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (selectedRole === "citizen") {
//       navigate("/citizen");
//     } else if (selectedRole === "agent") {
//       navigate("/agent");
//     }
//   };

//   return (
//     <div className="min-h-screen bg-background flex flex-col">
//       {/* Header */}
//       <header className="border-b border-border bg-white">
//         <div className="container mx-auto px-4 py-4 flex items-center justify-between">
//           <Link to="/" className="flex items-center gap-2">
//             <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
//               <Shield className="w-6 h-6 text-white" />
//             </div>
//             <div>
//               <h1 className="text-xl font-semibold text-foreground">e-Citoyen CI</h1>
//               <p className="text-xs text-muted-foreground">République de Côte d'Ivoire</p>
//             </div>
//           </Link>
//         </div>
//       </header>

//       {/* Main Content */}
//       <div className="flex-1 flex items-center justify-center p-4">
//         <div className="w-full max-w-4xl">
//           {!selectedRole ? (
//             <>
//               <div className="text-center mb-8">
//                 <h2 className="text-3xl font-bold text-foreground mb-2">
//                   Bienvenue sur e-Citoyen CI
//                 </h2>
//                 <p className="text-muted-foreground">
//                   Choisissez votre profil pour continuer
//                 </p>
//               </div>

//               <div className="grid md:grid-cols-2 gap-6">
//                 {/* Citizen Card */}
//                 <Card 
//                   className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
//                   onClick={() => handleRoleSelection("citizen")}
//                 >
//                   <CardHeader className="text-center pb-4">
//                     <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
//                       <User className="w-10 h-10 text-primary" />
//                     </div>
//                     <CardTitle className="text-2xl">Citoyen</CardTitle>
//                     <CardDescription className="text-base">
//                       Faire une demande administrative
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <Button className="w-full" size="lg">
//                       Continuer comme citoyen
//                     </Button>
//                     <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
//                       <li className="flex items-center gap-2">
//                         <div className="w-1.5 h-1.5 rounded-full bg-primary" />
//                         Soumettre des demandes
//                       </li>
//                       <li className="flex items-center gap-2">
//                         <div className="w-1.5 h-1.5 rounded-full bg-primary" />
//                         Suivre vos démarches
//                       </li>
//                       <li className="flex items-center gap-2">
//                         <div className="w-1.5 h-1.5 rounded-full bg-primary" />
//                         Recevoir des guides personnalisés
//                       </li>
//                     </ul>
//                   </CardContent>
//                 </Card>

//                 {/* Agent Card */}
//                 <Card 
//                   className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-secondary"
//                   onClick={() => handleRoleSelection("agent")}
//                 >
//                   <CardHeader className="text-center pb-4">
//                     <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
//                       <ShieldCheck className="w-10 h-10 text-secondary" />
//                     </div>
//                     <CardTitle className="text-2xl">Agent Administratif</CardTitle>
//                     <CardDescription className="text-base">
//                       Vérifier et confirmer les demandes
//                     </CardDescription>
//                   </CardHeader>
//                   <CardContent>
//                     <Button className="w-full bg-secondary hover:bg-secondary/90" size="lg">
//                       Continuer comme agent
//                     </Button>
//                     <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
//                       <li className="flex items-center gap-2">
//                         <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
//                         Gérer les demandes
//                       </li>
//                       <li className="flex items-center gap-2">
//                         <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
//                         Vérifier les informations
//                       </li>
//                       <li className="flex items-center gap-2">
//                         <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
//                         Consulter les statistiques
//                       </li>
//                     </ul>
//                   </CardContent>
//                 </Card>
//               </div>
//             </>
//           ) : (
//             <div className="max-w-md mx-auto">
//               <Button 
//                 variant="ghost" 
//                 onClick={() => setSelectedRole(null)}
//                 className="mb-6"
//               >
//                 ← Retour
//               </Button>

//               <Card>
//                 <CardHeader>
//                   <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
//                     {selectedRole === "citizen" ? (
//                       <User className="w-8 h-8 text-primary" />
//                     ) : (
//                       <ShieldCheck className="w-8 h-8 text-secondary" />
//                     )}
//                   </div>
//                   <CardTitle className="text-2xl text-center">
//                     {selectedRole === "citizen" ? "Connexion Citoyen" : "Connexion Agent"}
//                   </CardTitle>
//                   <CardDescription className="text-center">
//                     Entrez vos identifiants pour continuer
//                   </CardDescription>
//                 </CardHeader>
//                 <CardContent>
//                   <form onSubmit={handleLogin} className="space-y-4">
//                     <div className="space-y-2">
//                       <Label htmlFor="email">Email</Label>
//                       <Input 
//                         id="email" 
//                         type="email" 
//                         placeholder="votre.email@exemple.ci"
//                         required
//                       />
//                     </div>
//                     <div className="space-y-2">
//                       <Label htmlFor="password">Mot de passe</Label>
//                       <Input 
//                         id="password" 
//                         type="password"
//                         placeholder="••••••••"
//                         required
//                       />
//                     </div>
                    
//                     <Button 
//                       type="submit" 
//                       className="w-full" 
//                       size="lg"
//                       style={selectedRole === "agent" ? { backgroundColor: "var(--secondary)" } : undefined}
//                     >
//                       Se connecter
//                     </Button>

//                     <div className="text-center">
//                       <Button variant="link" type="button" className="text-sm">
//                         Créer un compte
//                       </Button>
//                     </div>
//                   </form>
//                 </CardContent>
//               </Card>
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Link, useNavigate } from "react-router";
import { Shield, User, ShieldCheck, AlertCircle } from "lucide-react";
import { useState } from "react";

// ============================================
// API Service (intégré directement)
// ============================================
const API_URL = 'http://localhost:8000';

async function apiLogin(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.detail || 'Erreur de connexion');
  }

  const data = await response.json();
  
  // Sauvegarder le token et l'utilisateur
  localStorage.setItem('token', data.access_token);
  localStorage.setItem('user', JSON.stringify(data.user));
  
  return data;
}

// ============================================
// COMPOSANT LOGIN
// ============================================
export default function LoginPage() {
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState<"citizen" | "agent" | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRoleSelection = (role: "citizen" | "agent") => {
    setSelectedRole(role);
    setError("");
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Appel API
      const result = await apiLogin(email, password);
      
      console.log('✅ Connecté:', result.user);

      // Redirection selon le rôle
      if (selectedRole === "agent" || result.user.role === "agent" || result.user.role === "admin") {
        navigate("/agent");
      } else {
        navigate("/citizen");
      }
    } catch (err: any) {
      console.error('❌ Erreur:', err.message);
      setError(err.message || "Email ou mot de passe incorrect");
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
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-foreground">e-Citoyen CI</h1>
              <p className="text-xs text-muted-foreground">République de Côte d'Ivoire</p>
            </div>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-4xl">
          {!selectedRole ? (
            <>
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold text-foreground mb-2">
                  Bienvenue sur e-Citoyen CI
                </h2>
                <p className="text-muted-foreground">
                  Choisissez votre profil pour continuer
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Citizen Card */}
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-primary"
                  onClick={() => handleRoleSelection("citizen")}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                      <User className="w-10 h-10 text-primary" />
                    </div>
                    <CardTitle className="text-2xl">Citoyen</CardTitle>
                    <CardDescription className="text-base">
                      Faire une demande administrative
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full" size="lg">
                      Continuer comme citoyen
                    </Button>
                    <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Soumettre des demandes
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Suivre vos démarches
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                        Recevoir des guides personnalisés
                      </li>
                    </ul>
                  </CardContent>
                </Card>

                {/* Agent Card */}
                <Card 
                  className="cursor-pointer hover:shadow-lg transition-all border-2 hover:border-secondary"
                  onClick={() => handleRoleSelection("agent")}
                >
                  <CardHeader className="text-center pb-4">
                    <div className="w-20 h-20 rounded-2xl bg-secondary/10 flex items-center justify-center mx-auto mb-4">
                      <ShieldCheck className="w-10 h-10 text-secondary" />
                    </div>
                    <CardTitle className="text-2xl">Agent Administratif</CardTitle>
                    <CardDescription className="text-base">
                      Vérifier et confirmer les demandes
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button className="w-full bg-secondary hover:bg-secondary/90" size="lg">
                      Continuer comme agent
                    </Button>
                    <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        Gérer les demandes
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        Vérifier les informations
                      </li>
                      <li className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-secondary" />
                        Consulter les statistiques
                      </li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          ) : (
            <div className="max-w-md mx-auto">
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSelectedRole(null);
                  setError("");
                }}
                className="mb-6"
              >
                ← Retour
              </Button>

              <Card>
                <CardHeader>
                  <div className="w-16 h-16 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    {selectedRole === "citizen" ? (
                      <User className="w-8 h-8 text-primary" />
                    ) : (
                      <ShieldCheck className="w-8 h-8 text-secondary" />
                    )}
                  </div>
                  <CardTitle className="text-2xl text-center">
                    {selectedRole === "citizen" ? "Connexion Citoyen" : "Connexion Agent"}
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
                      className="w-full" 
                      size="lg"
                      disabled={loading}
                      style={selectedRole === "agent" ? { backgroundColor: "var(--secondary)" } : undefined}
                    >
                      {loading ? "Connexion..." : "Se connecter"}
                    </Button>

                    <div className="text-center">
                      <Button variant="link" type="button" className="text-sm" onClick={() => navigate("/register")}>
                        Créer un compte
                      </Button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}