import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { StatusBadge } from "../components/StatusBadge";
import { MobileNav } from "../components/MobileNav";
import { Link, useLocation } from "react-router";
import { toast } from "sonner";
import { 
  Shield, 
  ArrowLeft, 
  Copy, 
  Download, 
  Mail, 
  Volume2,
  CheckCircle2,
  MapPin,
  Calendar,
  Clock,
  Banknote,
  FileText
} from "lucide-react";

export default function AIResponse() {
  const { state } = useLocation();
  const reponse = state?.reponse;
  const procedures = [
    {
      step: 1,
      title: "Se rendre à l'hôpital",
      description: "Demander le certificat médical de naissance",
      duration: "1 jour"
    },
    {
      step: 2,
      title: "Aller au centre d'état civil",
      description: "Déposer la déclaration avec les documents requis",
      duration: "2-3 jours"
    },
    {
      step: 3,
      title: "Récupérer l'acte de naissance",
      description: "Retirer le document officiel au centre d'état civil",
      duration: "1 jour"
    }
  ];

  const documents = [
    "Certificat médical de naissance",
    "Pièce d'identité des parents",
    "Certificat de mariage (si marié)",
    "Attestation de résidence"
  ];

  const locations = [
    {
      name: "Hôpital Général d'Anyama",
      address: "Boulevard Principal, Anyama",
      hours: "Lun-Ven: 8h-16h"
    },
    {
      name: "Centre d'État Civil d'Anyama",
      address: "Rue de la Mairie, Anyama",
      hours: "Lun-Ven: 7h30-15h30"
    }
  ];

  const buildFullText = () => {
    const lines = [];
    lines.push("e-Citoyen CI — Réponse à votre demande");
    lines.push("");
    if (reponse?.resume_situation) {
      lines.push("RÉSUMÉ :");
      lines.push(reponse.resume_situation);
      lines.push("");
    }
    if (reponse?.plan_action?.length) {
      lines.push("ÉTAPES À SUIVRE :");
      reponse.plan_action.forEach((etape: string, i: number) => {
        lines.push(`${i + 1}. ${etape}`);
      });
      lines.push("");
    }
    if (reponse?.documents_a_apporter?.length) {
      lines.push("DOCUMENTS NÉCESSAIRES :");
      reponse.documents_a_apporter.forEach((d: string) => lines.push(`- ${d}`));
      lines.push("");
    }
    if (reponse?.lieu) lines.push(`OÙ SE RENDRE : ${reponse.lieu}`);
    if (reponse?.delai_estime) lines.push(`DÉLAI : ${reponse.delai_estime}`);
    if (reponse?.cout) lines.push(`COÛT : ${reponse.cout}`);
    if (reponse?.contenu_lettre) {
      lines.push("");
      lines.push("LETTRE GÉNÉRÉE :");
      lines.push(reponse.contenu_lettre);
    }
    return lines.join("\n");
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(buildFullText());
      toast.success("Copié dans le presse-papiers");
    } catch (err) {
      toast.error("Impossible de copier");
    }
  };

  const handleDownload = () => {
    const blob = new Blob([buildFullText()], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "declaration-naissance-e-citoyen-ci.txt";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleEmail = () => {
    const subject = encodeURIComponent("Déclaration de naissance — e-Citoyen CI");
    const body = encodeURIComponent(buildFullText());
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  const handleListen = () => {
    if (!("speechSynthesis" in window)) {
      toast.error("La lecture vocale n'est pas disponible sur ce navigateur");
      return;
    }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(buildFullText());
    utterance.lang = "fr-FR";
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-3">
            <Link to="/citizen">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="w-5 h-5" />
              </Button>
            </Link>
            <div className="flex items-center gap-3 flex-1">
              <img src="/Icone.png" alt="e-Citoyen CI" className="w-10 h-10 object-contain" />
              <div className="flex-1">
                <h1 className="text-lg font-semibold">Résultat de l'analyse</h1>
                <p className="text-xs text-muted-foreground">Déclaration de naissance</p>
              </div>
              <StatusBadge status="pending" />
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Summary */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Résumé de la situation</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground leading-relaxed">
              {reponse?.resume_situation || "Chargement..."}
            </p>
          </CardContent>
        </Card>

        {/* Procedures Timeline */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Démarches à effectuer</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {(reponse?.plan_action || []).map((etape: string, index: number) => (
                <div key={index} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center font-semibold flex-shrink-0">
                      {index + 1}
                    </div>
                    {index < (reponse?.plan_action?.length - 1) && (
                      <div className="w-0.5 h-full bg-border mt-2" />
                    )}
                  </div>
                  <div className="flex-1 pb-6">
                    <p className="font-medium">{etape}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Documents Required */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Documents requis</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {(reponse?.documents_a_apporter || []).map((doc: string, index: number) => (
                <div key={index} className="flex items-center gap-3 p-3 rounded-lg bg-accent">
                  <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Locations */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Lieux concernés</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
             <div className="p-4 rounded-lg border border-border">
                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-primary mt-0.5 flex-shrink-0" />
                  <p className="font-medium">{reponse?.lieu || "—"}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Délais et coûts*/}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-primary" />
                Délais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Délai estimé</span>
                  <span className="font-semibold">{reponse?.delai_estime || "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="w-5 h-5 text-primary" />
                Coûts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Coût total</span>
                  <span className="font-semibold text-green-600">Gratuit</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{reponse?.cout || "—"}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Generated Letter Preview */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Lettre générée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="p-6 rounded-lg bg-accent border border-border font-mono text-sm whitespace-pre-wrap">
              {reponse?.contenu_lettre || "Aucune lettre générée pour cette demande."}
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Button variant="outline" className="w-full" onClick={handleCopy}>
            <Copy className="w-4 h-4 mr-2" />
            Copier
          </Button>
          <Button variant="outline" className="w-full" onClick={handleDownload}>
            <Download className="w-4 h-4 mr-2" />
            Télécharger
          </Button>
          <Button variant="outline" className="w-full" onClick={handleEmail}>
            <Mail className="w-4 h-4 mr-2" />
            Envoyer
          </Button>
          <Button variant="outline" className="w-full" onClick={handleListen}>
            <Volume2 className="w-4 h-4 mr-2" />
            Écouter
          </Button>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
