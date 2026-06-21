import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { StatCard } from "../components/StatCard";
import { StatusBadge, RequestStatus } from "../components/StatusBadge";
import { MobileNav } from "../components/MobileNav";
import { Link } from "react-router";
import { Shield, FileText, Clock, CheckCircle2, Plus, LogOut } from "lucide-react";

interface Request {
  id: string;
  title: string;
  date: string;
  status: RequestStatus;
}

export default function CitizenDashboard() {
  const requests: Request[] = [
    {
      id: "1",
      title: "Déclaration de naissance - Anyama",
      date: "19 juin 2026",
      status: "confirmed"
    },
    {
      id: "2",
      title: "Demande de carte d'identité nationale",
      date: "18 juin 2026",
      status: "verified"
    },
    {
      id: "3",
      title: "Inscription assurance maladie",
      date: "17 juin 2026",
      status: "pending"
    },
  ];

  return (
    <div className="min-h-screen bg-background pb-20 md:pb-0">
      {/* Header */}
      <header className="bg-white border-b border-border sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold">e-Citoyen CI</h1>
                <p className="text-xs text-muted-foreground">Tableau de bord</p>
              </div>
            </div>
            <Link to="/">
              <Button variant="ghost" size="icon">
                <LogOut className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
            Bienvenue, Jean-Paul
          </h2>
          <p className="text-muted-foreground">
            Gérez vos démarches administratives en toute simplicité
          </p>
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8">
          <StatCard
            title="Total de demandes"
            value="12"
            icon={FileText}
            iconColor="text-primary"
          />
          <StatCard
            title="En attente"
            value="3"
            icon={Clock}
            iconColor="text-amber-600"
          />
          <StatCard
            title="Confirmées"
            value="7"
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
              {requests.map((request) => (
                <Link key={request.id} to={`/citizen/request/${request.id}`}>
                  <div className="flex items-center justify-between p-4 rounded-lg border border-border hover:bg-accent transition-colors cursor-pointer">
                    <div className="flex-1">
                      <h4 className="font-semibold mb-1">{request.title}</h4>
                      <p className="text-sm text-muted-foreground">{request.date}</p>
                    </div>
                    <StatusBadge status={request.status} />
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-primary" />
              </div>
              <p className="text-sm font-medium">Mes demandes</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mx-auto mb-3">
                <Shield className="w-6 h-6 text-secondary" />
              </div>
              <p className="text-sm font-medium">Documents</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardContent className="p-6 text-center">
              <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-amber-600" />
              </div>
              <p className="text-sm font-medium">Historique</p>
            </CardContent>
          </Card>

          <Card className="hover:shadow-md transition-shadow cursor-pointer">
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
