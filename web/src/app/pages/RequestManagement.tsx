import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { StatusBadge, RequestStatus } from "../components/StatusBadge";
import { Link } from "react-router";
import { Shield, Search, Filter } from "lucide-react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
import { BarChart3, FileText, TrendingUp, Settings, LogOut } from "lucide-react";

interface Request {
  id: string;
  requestId: string;
  citizenName: string;
  subject: string;
  date: string;
  status: RequestStatus;
}

export default function RequestManagement() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const requests: Request[] = [
    {
      id: "1",
      requestId: "REQ-2026-001",
      citizenName: "Jean-Paul Kouassi",
      subject: "Déclaration de naissance - Anyama",
      date: "19 juin 2026",
      status: "confirmed"
    },
    {
      id: "2",
      requestId: "REQ-2026-002",
      citizenName: "Aminata Traoré",
      subject: "Demande de carte d'identité nationale",
      date: "19 juin 2026",
      status: "verified"
    },
    {
      id: "3",
      requestId: "REQ-2026-003",
      citizenName: "Koffi N'Guessan",
      subject: "Inscription assurance maladie",
      date: "19 juin 2026",
      status: "pending"
    },
    {
      id: "4",
      requestId: "REQ-2026-004",
      citizenName: "Mariam Diallo",
      subject: "Extrait de naissance",
      date: "18 juin 2026",
      status: "pending"
    },
    {
      id: "5",
      requestId: "REQ-2026-005",
      citizenName: "Yao Kouamé",
      subject: "Demande de passeport",
      date: "18 juin 2026",
      status: "pending"
    },
    {
      id: "6",
      requestId: "REQ-2026-006",
      citizenName: "Fatou Sylla",
      subject: "Renouvellement permis de conduire",
      date: "17 juin 2026",
      status: "verified"
    },
    {
      id: "7",
      requestId: "REQ-2026-007",
      citizenName: "Ibrahim Koné",
      subject: "Certificat de résidence",
      date: "17 juin 2026",
      status: "pending"
    },
    {
      id: "8",
      requestId: "REQ-2026-008",
      citizenName: "Aïcha Bamba",
      subject: "Déclaration de naissance",
      date: "16 juin 2026",
      status: "confirmed"
    },
  ];

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesSearch = 
      request.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.requestId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      request.citizenName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

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
              <div>
                <h2 className="text-xl font-semibold">Gestion des demandes</h2>
                <p className="text-sm text-muted-foreground">{filteredRequests.length} demande(s)</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right mr-4">
                  <p className="font-medium">Agent Marie Koné</p>
                  <p className="text-xs text-muted-foreground">Administration</p>
                </div>
                <Link to="/">
                  <Button variant="ghost" size="icon">
                    <LogOut className="w-5 h-5" />
                  </Button>
                </Link>
              </div>
            </div>
          </header>

          <div className="p-6">
            {/* Filters */}
            <div className="mb-6 space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    placeholder="Rechercher par nom, sujet ou numéro..."
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
                    <SelectItem value="verified">Vérifiée</SelectItem>
                    <SelectItem value="confirmed">Confirmée</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status Summary */}
              <div className="flex gap-4 flex-wrap">
                <div className="px-4 py-2 rounded-lg bg-amber-50 border border-amber-200">
                  <span className="text-sm font-medium text-amber-800">
                    {requests.filter(r => r.status === "pending").length} En attente
                  </span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-blue-50 border border-blue-200">
                  <span className="text-sm font-medium text-blue-800">
                    {requests.filter(r => r.status === "verified").length} Vérifiées
                  </span>
                </div>
                <div className="px-4 py-2 rounded-lg bg-green-50 border border-green-200">
                  <span className="text-sm font-medium text-green-800">
                    {requests.filter(r => r.status === "confirmed").length} Confirmées
                  </span>
                </div>
              </div>
            </div>

            {/* Requests Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-accent border-b border-border">
                      <tr>
                        <th className="text-left p-4 font-semibold text-sm">N° Demande</th>
                        <th className="text-left p-4 font-semibold text-sm">Citoyen</th>
                        <th className="text-left p-4 font-semibold text-sm">Sujet</th>
                        <th className="text-left p-4 font-semibold text-sm">Date de soumission</th>
                        <th className="text-left p-4 font-semibold text-sm">Statut</th>
                        <th className="text-left p-4 font-semibold text-sm">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRequests.map((request) => (
                        <tr key={request.id} className="border-b border-border hover:bg-accent/50 transition-colors">
                          <td className="p-4">
                            <span className="font-mono text-sm text-muted-foreground">
                              {request.requestId}
                            </span>
                          </td>
                          <td className="p-4">
                            <span className="font-medium">{request.citizenName}</span>
                          </td>
                          <td className="p-4">
                            <span>{request.subject}</span>
                          </td>
                          <td className="p-4">
                            <span className="text-sm text-muted-foreground">{request.date}</span>
                          </td>
                          <td className="p-4">
                            <StatusBadge status={request.status} />
                          </td>
                          <td className="p-4">
                            <div className="flex gap-2">
                              <Link to={`/agent/request/${request.id}`}>
                                <Button variant="outline" size="sm">
                                  Voir détails
                                </Button>
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {filteredRequests.length === 0 && (
                  <div className="p-12 text-center">
                    <p className="text-muted-foreground">Aucune demande trouvée</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
