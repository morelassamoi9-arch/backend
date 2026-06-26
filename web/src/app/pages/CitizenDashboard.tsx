import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { StatCard } from "../components/StatCard";
import { StatusBadge, RequestStatus } from "../components/StatusBadge";
import { MobileNav } from "../components/MobileNav";
import { Link, useNavigate } from "react-router";
import { FileText, Clock, CheckCircle2, Plus, LogOut } from "lucide-react";
import { demandes, users } from "../../services/api";
import { useHistoryTracker } from "../../services/useHistoryTracker";
import { useAuth } from "../../hooks/useAuth";

interface ApiDemande {
  id: string | number;
  message: string;
  categorie?: string;
  status: string;
  created_at: string;
}

interface Stats {
  total: number;
  pending: number;
  confirmed: number;
}

function mapStatut(statut: string): RequestStatus {
  switch (statut) {
    case "traitee": return "confirmed";
    case "en_cours": return "verified";
    case "rejetee": return "rejected";
    case "en_attente":
    default: return "pending";
  }
}

function formatDate(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleDateString("fr-FR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return dateStr;
  }
}

function SkeletonLine({ width = "w-full" }: { width?: string }) {
  return (
    <div className={`h-4 bg-gray-200 rounded animate-pulse ${width}`} />
  );
}

export default function CitizenDashboard() {
  const { trackAction } = useHistoryTracker();
  const { logout } = useAuth();
  const [userName, setUserName] = useState<string>("...");
  const [stats, setStats] = useState<Stats>({ total: 0, pending: 0, confirmed: 0 });
  const [recentRequests, setRecentRequests] = useState<ApiDemande[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    trackAction("NAVIGATE", "Accès au tableau de bord citoyen", "success");
    // Chargement initial complet (nom + stats + demandes)
    async function fetchInitial() {
      try {
        const [userInfo, statsData, demandesData] = await Promise.all([
          users.me(),
          demandes.getStats(),
          demandes.getAll({ limit: 3 }),
        ]);

        const prenom = userInfo?.prenom || userInfo?.nom || "Citoyen";
        setUserName(prenom);

        setStats({
          total: statsData?.total_demandes ?? 0,
          pending: statsData?.demandes_en_attente ?? 0,
          confirmed: statsData?.demandes_traitee ?? 0,
        });

        const list: ApiDemande[] = Array.isArray(demandesData)
          ? demandesData
          : demandesData?.items ?? demandesData?.demandes ?? [];
        setRecentRequests(list.slice(0, 3));
      } catch (err) {
        console.error("Erreur chargement dashboard :", err);
      } finally {
        setLoading(false);
      }
    }

    // Rafraîchissement silencieux (sans spinner) pour les stats et demandes
    async function refreshStats() {
      try {
        const [statsData, demandesData] = await Promise.all([
          demandes.getStats(),
          demandes.getAll({ limit: 3 }),
        ]);

        setStats({
          total: statsData?.total_demandes ?? 0,
          pending: statsData?.demandes_en_attente ?? 0,
          confirmed: statsData?.demandes_traitee ?? 0,
        });

        const list: ApiDemande[] = Array.isArray(demandesData)
          ? demandesData
          : demandesData?.items ?? demandesData?.demandes ?? [];
        setRecentRequests(list.slice(0, 3));
      } catch (err) {
        console.error("Erreur rafraîchissement stats :", err);
      }
    }

    fetchInitial();

    // Mise à jour automatique toutes les 30 secondes
    const interval = setInterval(refreshStats, 30_000);

    // Nettoyage à la destruction du composant
    return () => clearInterval(interval);
  }, []);


  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              to="/"
              aria-label="Retour à l'accueil"
              className="flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95"
            >
              <img src="/Icone.png" alt="e-Citoyen CI" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-lg font-semibold">e-Citoyen CI</h1>
                <p className="text-xs text-muted-foreground">Tableau de bord</p>
              </div>
            </Link>
            <Button variant="ghost" size="icon" onClick={() => {
              trackAction("LOGOUT", "Déconnexion de la session citoyen", "success");
              logout();
            }}>
              <LogOut className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            {loading ? (
              <SkeletonLine width="w-48" />
            ) : (
              <>Bienvenue, {userName} 👋</>
            )}
          </h2>
          <p className="text-muted-foreground">
            Gérez vos démarches administratives en toute simplicité
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <StatCard
            title="Total de demandes"
            value={loading ? "..." : String(stats.total)}
            icon={FileText}
            iconColor="text-primary"
          />
          <StatCard
            title="En attente"
            value={loading ? "..." : String(stats.pending)}
            icon={Clock}
            iconColor="text-amber-600"
          />
          <StatCard
            title="Confirmées"
            value={loading ? "..." : String(stats.confirmed)}
            icon={CheckCircle2}
            iconColor="text-green-600"
          />
        </div>

        {/* New Request Button */}
        <div className="mb-8">
          <Link to="/citizen/new-request">
            <Button size="lg" className="w-full md:w-auto">
              <Plus className="w-5 h-5 mr-2" />
              Nouvelle Demande
            </Button>
          </Link>
        </div>

        {/* Recent Requests */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Demandes récentes</CardTitle>
              <Link to="/citizen/requests">
                <Button variant="ghost" size="sm">
                  Voir tout
                </Button>
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {loading ? (
                [1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 rounded-lg border border-border">
                    <div className="flex-1 space-y-2">
                      <SkeletonLine width="w-3/4" />
                      <SkeletonLine width="w-1/3" />
                    </div>
                    <div className="h-6 w-20 bg-gray-200 rounded animate-pulse ml-4" />
                  </div>
                ))
              ) : recentRequests.length === 0 ? (
                <p className="text-center text-muted-foreground py-6">Aucune demande pour le moment</p>
              ) : (
                recentRequests.map((req) => (
                  <Link key={req.id} to={`/citizen/request/${req.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
                      <div className="flex-1">
                        <h4 className="font-semibold mb-1 line-clamp-1">{req.message}</h4>
                        <p className="text-sm text-muted-foreground">{formatDate(req.created_at)}</p>
                      </div>
                      <StatusBadge status={mapStatut(req.status)} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Link to="/citizen/requests">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <FileText className="w-6 h-6 text-primary" />
                </div>
                <p className="text-sm font-medium">Mes demandes</p>
              </CardContent>
            </Card>
          </Link>

          <Link to="/citizen/new-request">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                  <Plus className="w-6 h-6 text-secondary" />
                </div>
                <p className="text-sm font-medium">Nouvelle demande</p>
              </CardContent>
            </Card>
          </Link>

          <Card 
            className="hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 bg-white border border-border"
            onClick={() => navigate("/citizen/history")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-sm font-medium">Historique</p>
            </CardContent>
          </Card>

          <Card 
            className="hover:shadow-md transition-all duration-200 cursor-pointer active:scale-95 bg-white border border-border"
            onClick={() => navigate("/citizen/help")}
          >
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center mx-auto mb-3">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-medium">Aide</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <MobileNav />
    </div>
  );
}
