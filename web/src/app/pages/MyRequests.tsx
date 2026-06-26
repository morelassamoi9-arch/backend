import { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { StatusBadge, RequestStatus } from "../components/StatusBadge";
import { MobileNav } from "../components/MobileNav";
import { Link } from "react-router";
import { ArrowLeft, Search, Filter, Loader2 } from "lucide-react";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { demandes } from "../../services/api";

interface ApiDemande {
  id: string | number;
  message: string;
  categorie?: string;
  status: string;
  created_at: string;
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

export default function MyRequests() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [allRequests, setAllRequests] = useState<ApiDemande[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchDemandes() {
      try {
        setLoading(true);
        const data = await demandes.getAll({ limit: 100 });
        const list: ApiDemande[] = Array.isArray(data)
          ? data
          : data?.items ?? data?.demandes ?? [];
        setAllRequests(list);
      } catch (err: any) {
        console.error("Erreur chargement demandes :", err);
        setError(err?.message || "Impossible de charger les demandes");
      } finally {
        setLoading(false);
      }
    }
    fetchDemandes();
  }, []);

  const filteredRequests = allRequests.filter((req) => {
    const mappedStatus = mapStatut(req.status);
    const matchesStatus = statusFilter === "all" || mappedStatus === statusFilter;
    const matchesSearch =
      req.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(req.id).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (req.categorie ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
            <div className="flex items-center gap-3">
              <img src="/Icone.png" alt="e-Citoyen CI" className="w-10 h-10 object-contain" />
              <div>
                <h1 className="text-lg font-semibold">Mes Demandes</h1>
                <p className="text-xs text-muted-foreground">
                  {loading ? "Chargement..." : `${filteredRequests.length} demande(s)`}
                </p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Filters */}
        <div className="mb-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher par sujet ou numéro..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full md:w-[200px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filtrer par statut" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les statuts</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
                <SelectItem value="verified">En cours</SelectItem>
                <SelectItem value="confirmed">Traitée</SelectItem>
                <SelectItem value="rejected">Rejetée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Error state */}
        {error && (
          <Card className="mb-4 border-red-200 bg-red-50">
            <CardContent className="p-4 text-center text-red-600 text-sm">
              {error}
            </CardContent>
          </Card>
        )}

        {/* Loading state */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-16 gap-4">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-muted-foreground text-sm">Chargement de vos demandes…</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <Card className="hidden md:block">
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-accent border-b border-border">
                      <tr>
                        <th className="text-left p-4 font-semibold text-sm">N° Demande</th>
                        <th className="text-left p-4 font-semibold text-sm">Sujet</th>
                        <th className="text-left p-4 font-semibold text-sm">Catégorie</th>
                        <th className="text-left p-4 font-semibold text-sm">Date</th>
                        <th className="text-left p-4 font-semibold text-sm">Statut</th>
                        <th className="text-left p-4 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((req) => (
                        <tr key={req.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                          <td className="p-4">
                            <span className="font-mono text-sm text-muted-foreground">
                              #{String(req.id).padStart(4, "0")}
                            </span>
                          </td>
                          <td className="p-4 max-w-xs">
                            <span className="font-medium line-clamp-2">{req.message}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground capitalize">
                              {req.categorie || "—"}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground">{formatDate(req.created_at)}</span>
                          </td>
                          <td className="p-4">
                            <StatusBadge status={mapStatut(req.status)} />
                          </td>
                          <td className="p-4">
                            <Link to={`/citizen/request/${req.id}`}>
                              <Button variant="ghost" size="sm">
                                Voir
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Mobile Card View */}
            <div className="md:hidden space-y-4">
              {filteredRequests.map((req) => (
                <Link key={req.id} to={`/citizen/request/${req.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <p className="font-mono text-xs text-muted-foreground mb-1">
                            #{String(req.id).padStart(4, "0")}
                            {req.categorie && (
                              <span className="ml-2 capitalize text-muted-foreground">{req.categorie}</span>
                            )}
                          </p>
                          <h4 className="font-semibold mb-1 line-clamp-2">{req.message}</h4>
                          <p className="text-sm text-muted-foreground">{formatDate(req.created_at)}</p>
                        </div>
                        <StatusBadge status={mapStatut(req.status)} />
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {filteredRequests.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-muted-foreground">Aucune demande trouvée</p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      <MobileNav />
    </div>
  );
}
