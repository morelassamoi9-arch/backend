import { Button } from "../components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { StatCard } from "../components/StatCard";
import { Link } from "react-router";
import { 
  Shield, 
  FileText, 
  Clock, 
  CheckCircle2, 
  BarChart3,
  Users,
  TrendingUp,
  LogOut,
  Settings
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
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts";

export default function AgentDashboard() {
  const requestsPerDay = [
    { day: "Lun", count: 12 },
    { day: "Mar", count: 19 },
    { day: "Mer", count: 15 },
    { day: "Jeu", count: 22 },
    { day: "Ven", count: 18 },
    { day: "Sam", count: 8 },
    { day: "Dim", count: 5 },
  ];

  const statusDistribution = [
    { name: "En attente", value: 45 },
    { name: "Vérifiée", value: 32 },
    { name: "Confirmée", value: 78 },
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
                <SidebarMenuButton asChild isActive>
                  <Link to="/agent">
                    <BarChart3 className="w-5 h-5" />
                    <span>Tableau de bord</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
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
                <h2 className="text-xl font-semibold">Tableau de bord</h2>
                <p className="text-sm text-muted-foreground">Vue d'ensemble des demandes</p>
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
            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total des demandes"
                value="155"
                icon={FileText}
                iconColor="text-secondary"
              />
              <StatCard
                title="En attente"
                value="45"
                icon={Clock}
                iconColor="text-amber-600"
              />
              <StatCard
                title="Vérifiées"
                value="32"
                icon={CheckCircle2}
                iconColor="text-blue-600"
              />
              <StatCard
                title="Confirmées"
                value="78"
                icon={CheckCircle2}
                iconColor="text-green-600"
              />
            </div>

            {/* Charts */}
            <div className="grid lg:grid-cols-2 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>Demandes par jour</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={requestsPerDay}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E3" />
                      <XAxis dataKey="day" stroke="#6B6B6B" />
                      <YAxis stroke="#6B6B6B" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E8E6E3',
                          borderRadius: '8px' 
                        }}
                      />
                      <Bar dataKey="count" fill="#C86A4A" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Distribution des statuts</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={statusDistribution} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E3" />
                      <XAxis type="number" stroke="#6B6B6B" />
                      <YAxis dataKey="name" type="category" stroke="#6B6B6B" width={100} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E8E6E3',
                          borderRadius: '8px' 
                        }}
                      />
                      <Bar dataKey="value" fill="#2E6B57" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Quick Stats */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Taux de confirmation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">87.3%</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    +5.2% ce mois
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Clock className="w-5 h-5 text-primary" />
                    Temps moyen de traitement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-primary">2.4 jours</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    -0.3 jours ce mois
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="w-5 h-5 text-secondary" />
                    Citoyens actifs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-secondary">1,247</div>
                  <p className="text-sm text-muted-foreground mt-1">
                    +124 ce mois
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <div className="grid md:grid-cols-2 gap-6">
              <Link to="/agent/requests">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                        <Clock className="w-6 h-6 text-amber-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Demandes en attente</h3>
                        <p className="text-sm text-muted-foreground">45 demandes nécessitent votre attention</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link to="/agent/statistics">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
                        <BarChart3 className="w-6 h-6 text-secondary" />
                      </div>
                      <div>
                        <h3 className="font-semibold">Rapports et statistiques</h3>
                        <p className="text-sm text-muted-foreground">Consultez les analyses détaillées</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
