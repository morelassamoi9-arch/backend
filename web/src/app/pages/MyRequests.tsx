import { useState } from "react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { StatusBadge, RequestStatus } from "../components/StatusBadge";
import { MobileNav } from "../components/MobileNav";
import { Link } from "react-router";
import { Shield, ArrowLeft, Search, Filter } from "lucide-react";
import { Input } from "../components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";

interface Request {
  id: string;
  requestId: string;
  subject: string;
  date: string;
  status: RequestStatus;
}

export default function MyRequests() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const requests: Request[] = [
    {
      id: "1",
      requestId: "REQ-2026-001",
      subject: "Déclaration de naissance - Anyama",
      date: "19 juin 2026",
      status: "confirmed"
    },
    {
      id: "2",
      requestId: "REQ-2026-002",
      subject: "Demande de carte d'identité nationale",
      date: "18 juin 2026",
      status: "verified"
    },
    {
      id: "3",
      requestId: "REQ-2026-003",
      subject: "Inscription assurance maladie",
      date: "17 juin 2026",
      status: "pending"
    },
    {
      id: "4",
      requestId: "REQ-2026-004",
      subject: "Extrait de naissance",
      date: "15 juin 2026",
      status: "confirmed"
    },
    {
      id: "5",
      requestId: "REQ-2026-005",
      subject: "Demande de passeport",
      date: "12 juin 2026",
      status: "verified"
    },
    {
      id: "6",
      requestId: "REQ-2026-006",
      subject: "Renouvellement permis de conduire",
      date: "10 juin 2026",
      status: "pending"
    },
  ];

  const filteredRequests = requests.filter(request => {
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesSearch = request.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         request.requestId.toLowerCase().includes(searchQuery.toLowerCase());
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
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">Mes Demandes</h1>
                <p className="text-xs text-muted-foreground">{filteredRequests.length} demande(s)</p>
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
                <SelectItem value="verified">Vérifiée</SelectItem>
                <SelectItem value="confirmed">Confirmée</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Desktop Table View */}
        <Card className="hidden md:block">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-accent border-b border-border">
                  <tr>
                    <th className="text-left p-4 font-semibold text-sm">N° Demande</th>
                    <th className="text-left p-4 font-semibold text-sm">Sujet</th>
                    <th className="text-left p-4 font-semibold text-sm">Date</th>
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
                        <span className="font-medium">{request.subject}</span>
                      </td>
                      <td className="p-4">
                        <span className="text-sm text-muted-foreground">{request.date}</span>
                      </td>
                      <td className="p-4">
                        <StatusBadge status={request.status} />
                      </td>
                      <td className="p-4">
                        <Link to={`/citizen/request/${request.id}`}>
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
          {filteredRequests.map((request) => (
            <Link key={request.id} to={`/citizen/request/${request.id}`}>
              <Card className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <p className="font-mono text-xs text-muted-foreground mb-1">
                        {request.requestId}
                      </p>
                      <h4 className="font-semibold mb-1">{request.subject}</h4>
                      <p className="text-sm text-muted-foreground">{request.date}</p>
                    </div>
                    <StatusBadge status={request.status} />
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
      </div>

      <MobileNav />
    </div>
  );
}
