import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { StatusBadge } from "../components/StatusBadge";
import { Link } from "react-router";
import { 
  Shield, 
  CheckCircle2,
  MapPin,
  Calendar,
  Banknote,
  FileText,
  User,
  Phone,
  Mail,
  MapPinned
} from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarProvider,
  SidebarInset,
} from "../components/ui/sidebar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { BarChart3, TrendingUp, Settings, LogOut } from "lucide-react";

export default function RequestDetails() {
  const [showVerifyDialog, setShowVerifyDialog] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

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

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-background">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader className="border-b border-border p-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">e-Citoyen CI</h1>
                <p className="text-xs text-muted-foreground">Espace Agent</p>
              </div>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/agent">
                    <BarChart3 className="w-5 h-5" />
                    <span>Tableau de bord</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
                  <Link to="/agent/requests">
                    <FileText className="w-5 h-5" />
                    <span>Gestion des demandes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/agent/statistics">
                    <TrendingUp className="w-5 h-5" />
                    <span>Statistiques</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link to="/agent/settings">
                    <Settings className="w-5 h-5" />
                    <span>Paramètres</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
        </Sidebar>

        {/* Main Content */}
        <SidebarInset className="flex-1">
          <header className="sticky top-0 z-40 border-b border-border bg-white">
            <div className="flex h-16 items-center justify-between px-6">
              <div className="flex items-center gap-4">
                <Link to="/agent/requests">
                  <Button variant="ghost">← Retour</Button>
                </Link>
                <div>
                  <h2 className="text-xl font-semibold">Détails de la demande</h2>
                  <p className="text-sm text-muted-foreground">REQ-2026-003</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="font-medium">Agent Marie Koné</p>
                  <p className="text-xs text-muted-foreground">Administration</p>
                </div>
                <Button variant="ghost" size="icon">
                  <LogOut className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </header>

          <div className="p-6">
            <div className="grid lg:grid-cols-3 gap-6">
              {/* Main Content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Citizen Information */}
                <Card>
                  <CardHeader>
                    <CardTitle>Informations du citoyen</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="flex items-center gap-3">
                        <User className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Nom complet</p>
                          <p className="font-medium">Jean-Paul Kouassi</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Phone className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Téléphone</p>
                          <p className="font-medium">+225 07 12 34 56 78</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">jp.kouassi@exemple.ci</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <MapPinned className="w-5 h-5 text-muted-foreground" />
                        <div>
                          <p className="text-sm text-muted-foreground">Adresse</p>
                          <p className="font-medium">Anyama, Abidjan</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Original Request */}
                <Card>
                  <CardHeader>
                    <CardTitle>Demande originale</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 rounded-lg bg-accent border border-border">
                      <p className="text-foreground leading-relaxed">
                        "Mon enfant est né hier à l'hôpital général d'Anyama. Je souhaite faire sa 
                        déclaration de naissance. Quelles sont les démarches à suivre ? Quels documents 
                        dois-je apporter ? Combien de temps cela prendra-t-il ?"
                      </p>
                      <p className="text-sm text-muted-foreground mt-3">
                        Soumis le 19 juin 2026 à 14:32
                      </p>
                    </div>
                  </CardContent>
                </Card>

                {/* AI Analysis */}
                <Card>
                  <CardHeader>
                    <CardTitle>Analyse de l'IA</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    {/* Summary */}
                    <div>
                      <h4 className="font-semibold mb-2">Résumé</h4>
                      <p className="text-foreground leading-relaxed">
                        Déclaration de naissance d'un enfant né à l'hôpital général d'Anyama. 
                        Cette démarche doit être effectuée dans les 30 jours suivant la naissance.
                      </p>
                    </div>

                    {/* Procedures */}
                    <div>
                      <h4 className="font-semibold mb-3">Démarches identifiées</h4>
                      <div className="space-y-4">
                        {procedures.map((procedure, index) => (
                          <div key={procedure.step} className="flex gap-3">
                            <div className="flex flex-col items-center">
                              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-sm flex-shrink-0">
                                {procedure.step}
                              </div>
                              {index < procedures.length - 1 && (
                                <div className="w-0.5 h-full bg-border mt-2" />
                              )}
                            </div>
                            <div className="flex-1 pb-4">
                              <div className="flex items-start justify-between gap-4 mb-1">
                                <p className="font-medium">{procedure.title}</p>
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {procedure.duration}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">{procedure.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Documents */}
                    <div>
                      <h4 className="font-semibold mb-3">Documents requis</h4>
                      <div className="space-y-2">
                        {documents.map((doc, index) => (
                          <div key={index} className="flex items-center gap-2 text-sm">
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                            <span>{doc}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Locations */}
                    <div>
                      <h4 className="font-semibold mb-3">Lieux</h4>
                      <div className="space-y-3">
                        <div className="p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-primary" />
                            <p className="font-medium text-sm">Hôpital Général d'Anyama</p>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">Boulevard Principal, Anyama</p>
                        </div>
                        <div className="p-3 rounded-lg border border-border">
                          <div className="flex items-center gap-2 mb-1">
                            <MapPin className="w-4 h-4 text-primary" />
                            <p className="font-medium text-sm">Centre d'État Civil d'Anyama</p>
                          </div>
                          <p className="text-xs text-muted-foreground ml-6">Rue de la Mairie, Anyama</p>
                        </div>
                      </div>
                    </div>

                    {/* Timeline and Costs */}
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg bg-accent border border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <Calendar className="w-4 h-4 text-primary" />
                          <h5 className="font-semibold text-sm">Délais</h5>
                        </div>
                        <p className="text-sm text-muted-foreground">Total estimé: 5-7 jours</p>
                      </div>
                      <div className="p-4 rounded-lg bg-accent border border-border">
                        <div className="flex items-center gap-2 mb-3">
                          <Banknote className="w-4 h-4 text-primary" />
                          <h5 className="font-semibold text-sm">Coûts</h5>
                        </div>
                        <p className="text-sm text-green-600 font-medium">Gratuit (0 FCFA)</p>
                      </div>
                    </div>

                    {/* Generated Letter */}
                    <div>
                      <h4 className="font-semibold mb-3">Lettre générée</h4>
                      <div className="p-4 rounded-lg bg-accent border border-border text-xs font-mono max-h-60 overflow-y-auto">
                        <p>Objet: Déclaration de naissance</p>
                        <br />
                        <p>Monsieur/Madame le Chef du Centre d'État Civil,</p>
                        <br />
                        <p>
                          Je soussigné(e), Jean-Paul Kouassi, viens par la présente procéder à la 
                          déclaration de naissance de mon enfant né le 18 juin 2026 à l'Hôpital Général d'Anyama...
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Sidebar - Actions */}
              <div className="space-y-6">
                {/* Status Card */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Statut de la demande</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <StatusBadge status="pending" className="w-full justify-center py-2" />
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">N° Demande:</span>
                        <span className="font-mono font-medium">REQ-2026-003</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Date:</span>
                        <span className="font-medium">19 juin 2026</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Heure:</span>
                        <span className="font-medium">14:32</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Actions */}
                <Card className="border-2 border-secondary">
                  <CardHeader>
                    <CardTitle className="text-base">Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button 
                      className="w-full bg-secondary hover:bg-secondary/90"
                      onClick={() => setShowVerifyDialog(true)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Vérifier la demande
                    </Button>
                    <Button 
                      className="w-full"
                      onClick={() => setShowConfirmDialog(true)}
                    >
                      <CheckCircle2 className="w-4 h-4 mr-2" />
                      Confirmer la demande
                    </Button>
                    <Button variant="outline" className="w-full">
                      Demander des précisions
                    </Button>
                    <Button variant="outline" className="w-full">
                      Télécharger le rapport
                    </Button>
                  </CardContent>
                </Card>

                {/* Notes */}
                <Card>
                  <CardHeader>
                    <CardTitle className="text-base">Notes internes</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <textarea 
                      className="w-full min-h-[100px] p-3 rounded-lg border border-border resize-none text-sm"
                      placeholder="Ajoutez vos notes sur cette demande..."
                    />
                    <Button variant="outline" className="w-full mt-3" size="sm">
                      Enregistrer les notes
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </SidebarInset>
      </div>

      {/* Verify Dialog */}
      <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Vérifier la demande</DialogTitle>
            <DialogDescription>
              Confirmez que vous avez vérifié toutes les informations de cette demande.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowVerifyDialog(false)}>
              Annuler
            </Button>
            <Button 
              className="bg-secondary hover:bg-secondary/90"
              onClick={() => setShowVerifyDialog(false)}
            >
              Confirmer la vérification
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirm Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la demande</DialogTitle>
            <DialogDescription>
              Cette action validera définitivement la demande. Le citoyen sera notifié.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
              Annuler
            </Button>
            <Button onClick={() => setShowConfirmDialog(false)}>
              Confirmer définitivement
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </SidebarProvider>
  );
}
