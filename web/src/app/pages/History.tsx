import React, { useState, useEffect } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { MobileNav } from "../components/MobileNav";
import { useNavigate, Link } from "react-router";
import {
  ArrowLeft,
  Search,
  Filter,
  Clock,
  Calendar,
  FileText,
  ChevronRight,
  X,
  AlertCircle,
  Trash2,
  Trash,
  LogIn,
  LogOut,
  Sparkles,
  Edit3,
  CheckCircle2,
  Eye,
  Download,
  Compass,
  CornerDownRight,
  UserCheck
} from "lucide-react";
import { Input } from "../components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { historyService, HistoryItem } from "../../services/historyService";

// Helper to determine active action icon
const getActionIcon = (action: string) => {
  const iconClass = "w-5 h-5";
  switch (action) {
    case "LOGIN":
      return (
        <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center">
          <LogIn className={`${iconClass} text-indigo-600`} />
        </div>
      );
    case "LOGOUT":
      return (
        <div className="p-2.5 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center">
          <LogOut className={`${iconClass} text-gray-600`} />
        </div>
      );
    case "CREATE_REQUEST":
      return (
        <div className="p-2.5 rounded-xl bg-green-50 border border-green-100 flex items-center justify-center">
          <Sparkles className={`${iconClass} text-green-600`} />
        </div>
      );
    case "UPDATE_REQUEST":
      return (
        <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center">
          <Edit3 className={`${iconClass} text-amber-600`} />
        </div>
      );
    case "DELETE_REQUEST":
      return (
        <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100 flex items-center justify-center">
          <Trash2 className={`${iconClass} text-rose-600`} />
        </div>
      );
    case "VALIDATE_REQUEST":
      return (
        <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center">
          <UserCheck className={`${iconClass} text-emerald-600`} />
        </div>
      );
    case "OPEN_DETAILS":
      return (
        <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center">
          <Eye className={`${iconClass} text-blue-600`} />
        </div>
      );
    case "DOWNLOAD":
      return (
        <div className="p-2.5 rounded-xl bg-teal-50 border border-teal-100 flex items-center justify-center">
          <Download className={`${iconClass} text-teal-600`} />
        </div>
      );
    case "NAVIGATE":
      return (
        <div className="p-2.5 rounded-xl bg-cyan-50 border border-cyan-100 flex items-center justify-center">
          <Compass className={`${iconClass} text-cyan-600`} />
        </div>
      );
    default:
      return (
        <div className="p-2.5 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center">
          <Clock className={`${iconClass} text-slate-600`} />
        </div>
      );
  }
};

// Friendly action category names
const getActionLabel = (action: string) => {
  switch (action) {
    case "LOGIN": return "Connexion";
    case "LOGOUT": return "Déconnexion";
    case "CREATE_REQUEST": return "Création Demande";
    case "UPDATE_REQUEST": return "Modification";
    case "DELETE_REQUEST": return "Suppression";
    case "VALIDATE_REQUEST": return "Validation";
    case "OPEN_DETAILS": return "Consultation";
    case "DOWNLOAD": return "Téléchargement";
    case "NAVIGATE": return "Navigation";
    default: return action;
  }
};

// Format timestamps
function formatTime(dateStr: string): string {
  try {
    return new Date(dateStr).toLocaleTimeString("fr-FR", {
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return "";
  }
}

// Group items by day
const groupEventsByDate = (items: HistoryItem[]) => {
  const groups: Record<string, HistoryItem[]> = {};
  items.forEach((item) => {
    try {
      const date = new Date(item.createdAt);
      const today = new Date();
      const yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      let key = "";
      if (date.toDateString() === today.toDateString()) {
        key = "Aujourd'hui";
      } else if (date.toDateString() === yesterday.toDateString()) {
        key = "Hier";
      } else {
        key = date.toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric"
        });
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(item);
    } catch {
      if (!groups["Autre"]) groups["Autre"] = [];
      groups["Autre"].push(item);
    }
  });
  return groups;
};

export default function History() {
  const navigate = useNavigate();
  
  const backUrl = "/citizen";

  // History state
  const [historyList, setHistoryList] = useState<HistoryItem[]>(() => historyService.getHistory());
  
  // Event listener for real-time history updates
  useEffect(() => {
    const handleHistoryChange = () => {
      setHistoryList(historyService.getHistory());
    };
    window.addEventListener("ecitoyen_history_changed", handleHistoryChange);
    return () => {
      window.removeEventListener("ecitoyen_history_changed", handleHistoryChange);
    };
  }, []);

  // Filters and search queries
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [actionFilter, setActionFilter] = useState<string>("all");
  
  // Selected detail modal
  const [selectedItem, setSelectedItem] = useState<HistoryItem | null>(null);
  
  // Clear confirmation modal state
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  // Progressive loading / Pagination
  const [visibleCount, setVisibleCount] = useState(15);

  // Filter history items
  const filteredHistory = historyList.filter((item) => {
    const matchesStatus = statusFilter === "all" || item.status === statusFilter;
    const matchesAction = actionFilter === "all" || item.action === actionFilter;
    const matchesSearch =
      item.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.action.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.route ?? "").toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesAction && matchesSearch;
  });

  // Split view for pagination
  const paginatedHistory = filteredHistory.slice(0, visibleCount);

  // Groups for grouped rendering
  const groupedHistory = groupEventsByDate(paginatedHistory);

  // Delete single event
  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    historyService.removeHistory(id);
    if (selectedItem?.id === id) {
      setSelectedItem(null);
    }
  };

  // Clear all events
  const handleClearAll = () => {
    historyService.clearHistory();
    setShowClearConfirm(false);
  };

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(backUrl)} className="hover:bg-slate-100">
                <ArrowLeft className="w-5 h-5" />
              </Button>
              <Link
                to="/"
                aria-label="Retour à l'accueil"
                className="flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95"
              >
                <img src="/Icone.png" alt="e-Citoyen CI" className="w-10 h-10 object-contain" />
                <div>
                  <h1 className="text-lg font-bold text-slate-800">Historique d'activité</h1>
                  <p className="text-xs text-muted-foreground">
                    Suivi automatique de vos actions dans l'application
                  </p>
                </div>
              </Link>
            </div>

            {historyList.length > 0 && (
              <Button
                variant="destructive"
                size="sm"
                className="gap-2 active:scale-95 transition-transform"
                onClick={() => setShowClearConfirm(true)}
              >
                <Trash className="w-4 h-4" />
                Tout effacer
              </Button>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-6 max-w-5xl">
        {/* Filters */}
        <div className="mb-6 bg-white p-4 rounded-2xl border border-border shadow-sm space-y-4">
          <div className="flex flex-col lg:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Rechercher une action, description ou page..."
                className="pl-10 bg-slate-50/50 focus:bg-white"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setVisibleCount(15); // reset pagination on search
                }}
              />
            </div>
            
            {/* Filters Selectors */}
            <div className="flex flex-col sm:flex-row gap-4 sm:w-auto w-full">
              {/* Filter Action */}
              <Select value={actionFilter} onValueChange={(val) => { setActionFilter(val); setVisibleCount(15); }}>
                <SelectTrigger className="w-full sm:w-[200px] bg-white">
                  <Filter className="w-4 h-4 mr-2 text-muted-foreground" />
                  <SelectValue placeholder="Action" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="LOGIN">Connexions</SelectItem>
                  <SelectItem value="LOGOUT">Déconnexions</SelectItem>
                  <SelectItem value="CREATE_REQUEST">Créations</SelectItem>
                  <SelectItem value="UPDATE_REQUEST">Modifications</SelectItem>

                  <SelectItem value="OPEN_DETAILS">Consultations</SelectItem>
                  <SelectItem value="DOWNLOAD">Téléchargements</SelectItem>
                  <SelectItem value="NAVIGATE">Navigations</SelectItem>
                </SelectContent>
              </Select>

              {/* Filter Status */}
              <Select value={statusFilter} onValueChange={(val) => { setStatusFilter(val); setVisibleCount(15); }}>
                <SelectTrigger className="w-full sm:w-[160px] bg-white">
                  <span className="w-2 h-2 rounded-full bg-slate-400 mr-2" />
                  <SelectValue placeholder="Statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="success">Succès</SelectItem>
                  <SelectItem value="pending">En cours</SelectItem>
                  <SelectItem value="failed">Échec</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Action History Feed */}
        <div className="space-y-8">
          {filteredHistory.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="p-16 text-center flex flex-col items-center justify-center gap-4">
                <div className="w-16 h-16 rounded-full bg-slate-50 flex items-center justify-center border border-slate-100">
                  <AlertCircle className="w-8 h-8 text-slate-400" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-slate-800">Aucune activité enregistrée</h3>
                  <p className="text-muted-foreground text-sm max-w-md mx-auto mt-1">
                    {historyList.length === 0
                      ? "Vos interactions s'afficheront ici au fur et à mesure que vous utiliserez l'application."
                      : "Aucun événement ne correspond à vos filtres actuels."}
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            Object.entries(groupedHistory).map(([dateGroup, items]) => (
              <div key={dateGroup} className="space-y-3">
                {/* Date header */}
                <h3 className="text-sm font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2 px-1">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  {dateGroup}
                </h3>
                
                {/* Items in the date group */}
                <div className="grid gap-3">
                  {items.map((item) => {
                    const isSuccess = item.status === "success";
                    const isFailed = item.status === "failed";
                    const isPending = item.status === "pending";
                    
                    return (
                      <Card
                        key={item.id}
                        className="hover:shadow-md transition-all duration-200 border-border bg-white active:scale-[0.99] cursor-pointer"
                        onClick={() => setSelectedItem(item)}
                      >
                        <CardContent className="p-4 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3.5 flex-1 min-w-0">
                            {/* Action Icon */}
                            {getActionIcon(item.action)}

                            <div className="space-y-1 flex-1 min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                                  {getActionLabel(item.action)}
                                </span>
                                
                                {item.route && (
                                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                                    <CornerDownRight className="w-3.5 h-3.5 text-slate-400" />
                                    {item.route}
                                  </span>
                                )}
                              </div>
                              <p className="font-semibold text-slate-800 text-sm md:text-base truncate">
                                {item.description}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="text-xs font-medium text-slate-400 whitespace-nowrap">
                              {formatTime(item.createdAt)}
                            </span>
                            
                            {/* Status Bullet */}
                            <span className={`w-2.5 h-2.5 rounded-full ${
                              isSuccess ? "bg-emerald-500 shadow-emerald-200/50" :
                              isFailed ? "bg-rose-500 shadow-rose-200/50" :
                              "bg-amber-500 shadow-amber-200/50"
                            } shadow-sm`} />

                            <div className="flex items-center gap-1.5 border-l border-slate-100 pl-3">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="w-8 h-8 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50/50 active:scale-90 transition-transform"
                                onClick={(e) => handleDeleteItem(item.id, e)}
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                              <ChevronRight className="w-5 h-5 text-slate-300 hidden md:block" />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            ))
          )}
        </div>

        {/* Load More Button */}
        {filteredHistory.length > visibleCount && (
          <div className="mt-8 text-center">
            <Button
              variant="outline"
              size="lg"
              className="px-8 font-medium shadow-sm hover:bg-slate-50 transition-colors"
              onClick={() => setVisibleCount(prev => prev + 15)}
            >
              Charger plus d'événements
            </Button>
          </div>
        )}
      </div>

      {/* Details Modal */}
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-2xl w-full max-w-xl overflow-hidden shadow-2xl animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-100 flex justify-between items-start bg-slate-50/50">
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    #{selectedItem.id.substring(0, 13)}
                  </span>
                  <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    selectedItem.status === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" :
                    selectedItem.status === "failed" ? "bg-rose-50 text-rose-700 border border-rose-200" :
                    "bg-amber-50 text-amber-700 border border-amber-200"
                  }`}>
                    {selectedItem.status === "success" ? "Succès" :
                     selectedItem.status === "failed" ? "Échec" : "En cours"}
                  </span>
                </div>
                <h2 className="text-lg font-bold text-slate-800">
                  Détail de l'action
                </h2>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedItem(null)}
                className="rounded-full hover:bg-slate-100"
              >
                <X className="w-5 h-5 text-slate-500" />
              </Button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
              {/* Type and Description */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  Description
                </h4>
                <p className="text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-100 p-4 rounded-xl leading-relaxed">
                  {selectedItem.description}
                </p>
              </div>

              {/* Technical properties */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/30">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Catégorie</h5>
                  <p className="text-sm font-bold text-slate-700">{getActionLabel(selectedItem.action)}</p>
                </div>
                <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/30">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Horodatage</h5>
                  <p className="text-sm font-semibold text-slate-700">
                    {new Date(selectedItem.createdAt).toLocaleString("fr-FR")}
                  </p>
                </div>
              </div>

              {/* Route */}
              {selectedItem.route && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Page d'exécution (Route)
                  </h4>
                  <p className="text-sm font-mono text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    {selectedItem.route}
                  </p>
                </div>
              )}

              {/* Metadata */}
              {selectedItem.metadata && Object.keys(selectedItem.metadata).length > 0 && (
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Données additionnelles (Métadonnées)
                  </h4>
                  <pre className="text-xs font-mono text-slate-600 bg-slate-900 text-slate-300 p-4 rounded-xl overflow-x-auto">
                    {JSON.stringify(selectedItem.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-100 flex justify-between bg-slate-50/50">
              <Button
                variant="destructive"
                className="gap-2"
                onClick={(e) => {
                  handleDeleteItem(selectedItem.id, e);
                  setSelectedItem(null);
                }}
              >
                <Trash2 className="w-4 h-4" />
                Supprimer de l'historique
              </Button>
              <Button onClick={() => setSelectedItem(null)} className="px-6">
                Fermer
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div
            className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl p-6 space-y-4 animate-scale-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center gap-3 text-rose-600">
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                <AlertCircle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold">Confirmer l'effacement</h3>
            </div>
            
            <p className="text-slate-600 text-sm leading-relaxed">
              Êtes-vous sûr de vouloir supprimer définitivement l'intégralité de votre historique d'activité ?
              Cette action est irréversible et n'affecte que le profil en cours.
            </p>

            <div className="flex justify-end gap-3 pt-2">
              <Button
                variant="ghost"
                onClick={() => setShowClearConfirm(false)}
                className="hover:bg-slate-100 text-slate-600 font-medium"
              >
                Annuler
              </Button>
              <Button
                variant="destructive"
                onClick={handleClearAll}
                className="px-6 font-semibold shadow-sm shadow-rose-200"
              >
                Oui, tout effacer
              </Button>
            </div>
          </div>
        </div>
      )}

      <MobileNav />
    </div>
  );
}
