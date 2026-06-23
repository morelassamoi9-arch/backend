import { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { MobileNav } from "../components/MobileNav";
import { ArrowLeft, Download, FileText, MapPin, Clock, CreditCard, Sparkles } from "lucide-react";
import { demandes } from "../../services/api";

interface DemandeDetail {
  id: string;
  message: string;
  categorie: string;
  status: string;
  created_at: string;
  reponse?: {
    etapes?: string[];
    documents?: string[];
    lieux?: string[];
    delai?: string;
    cout?: string;
    lettre?: string;
  };
}

export default function AIResponse() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const [demande, setDemande] = useState<DemandeDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    // Si on a des données passées via state (depuis NewRequest)
    if (location.state?.reponse) {
      console.log("Données reçues via state:", location.state.reponse);
      setDemande(location.state.reponse);
      setLoading(false);
      return;
    }

    // Sinon, récupérer depuis l'API
    if (id) {
      fetchDemande(id);
    }
  }, [id, location.state]);

  const fetchDemande = async (demandeId: string) => {
    try {
      setLoading(true);
      const data = await demandes.getOne(demandeId);
      console.log("Demande récupérée:", data);
      setDemande(data);
    } catch (err: any) {
      console.error("Erreur:", err);
      setError(err.message || "Impossible de charger la demande");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre demande...</p>
        </div>
      </div>
    );
  }

  if (error || !demande) {
    return (
      <div className="min-h-screen bg-background p-4">
        <div className="max-w-3xl mx-auto">
          <Button variant="ghost" onClick={() => navigate("/citizen")}>
            <ArrowLeft className="w-5 h-5 mr-2" />
            Retour
          </Button>
          <Card className="mt-4">
            <CardContent className="pt-6">
              <div className="text-center py-8">
                <p className="text-red-500">{error || "Demande non trouvée"}</p>
                <Button className="mt-4" onClick={() => navigate("/citizen/new-request")}>
                  Créer une nouvelle demande
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const reponse = demande.reponse || {};

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate("/citizen")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-lg font-semibold">Réponse de l'Assistant</h1>
              <p className="text-xs text-muted-foreground">
                {demande.categorie || "Demande"} • {new Date(demande.created_at).toLocaleDateString("fr-FR")}
              </p>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Status Badge */}
        <div className="mb-6 flex items-center gap-3">
          <span className="px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            {demande.status === "en_attente" ? "En attente" :
             demande.status === "en_cours" ? "En cours" :
             demande.status === "traitee" ? "Traitée" : "Rejetée"}
          </span>
          <span className="text-sm text-muted-foreground">
            {new Date(demande.created_at).toLocaleString("fr-FR")}
          </span>
        </div>

        {/* Message original */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="text-base">Votre demande</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{demande.message}</p>
          </CardContent>
        </Card>

        {/* Réponse IA */}
        <div className="space-y-4">
          {/* Étapes */}
          {reponse.etapes && reponse.etapes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-primary" />
                  Démarches à effectuer
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ol className="list-decimal list-inside space-y-2">
                  {reponse.etapes.map((etape, index) => (
                    <li key={index} className="text-muted-foreground">{etape}</li>
                  ))}
                </ol>
              </CardContent>
            </Card>
          )}

          {/* Documents */}
          {reponse.documents && reponse.documents.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Documents requis
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {reponse.documents.map((doc, index) => (
                    <li key={index} className="text-muted-foreground">{doc}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Lieux */}
          {reponse.lieux && reponse.lieux.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-5 h-5 text-primary" />
                  Lieux concernés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="list-disc list-inside space-y-2">
                  {reponse.lieux.map((lieu, index) => (
                    <li key={index} className="text-muted-foreground">{lieu}</li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {/* Délai et Coût */}
          <div className="grid md:grid-cols-2 gap-4">
            {reponse.delai && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <Clock className="w-5 h-5 text-primary" />
                    Délai estimé
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{reponse.delai}</p>
                </CardContent>
              </Card>
            )}

            {reponse.cout && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-base flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-primary" />
                    Coût total
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{reponse.cout}</p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Lettre générée */}
          {reponse.lettre && (
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <FileText className="w-5 h-5 text-primary" />
                  Lettre générée
                </CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="whitespace-pre-wrap text-sm text-muted-foreground font-sans bg-white p-4 rounded-lg border">
                  {reponse.lettre}
                </pre>
                <Button variant="outline" className="mt-4" onClick={() => {
                  const blob = new Blob([reponse.lettre || ""], { type: "text/plain" });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = `lettre_${demande.id}.txt`;
                  a.click();
                  URL.revokeObjectURL(url);
                }}>
                  <Download className="w-4 h-4 mr-2" />
                  Télécharger la lettre
                </Button>
              </CardContent>
            </Card>
          )}

          {Object.keys(reponse).length === 0 && (
            <Card>
              <CardContent className="pt-6 text-center py-8">
                <p className="text-muted-foreground">
                  L'analyse de votre demande est en cours. Les résultats apparaîtront ici.
                </p>
                <Button 
                  className="mt-4" 
                  onClick={() => fetchDemande(demande.id)}
                >
                  Actualiser
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-4">
          <Button onClick={() => navigate("/citizen/new-request")} className="flex-1">
            Nouvelle demande
          </Button>
          <Button variant="outline" onClick={() => navigate("/citizen/requests")} className="flex-1">
            Voir mes demandes
          </Button>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
