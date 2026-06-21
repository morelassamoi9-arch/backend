import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { StatCard } from "../components/StatCard";
import { Link } from "react-router";
import { 
  Shield, 
  FileText, 
  Clock, 
  CheckCircle2,
  TrendingUp,
  Users,
  Calendar,
  LogOut
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
  BarChart, 
  Bar, 
  LineChart, 
  Line, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from "recharts";
import { BarChart3, Settings } from "lucide-react";
import { Button } from "../components/ui/button";

export default function Statistics() {
  const monthlyRequests = [
    { month: "Jan", total: 145, confirmed: 120, pending: 25 },
    { month: "Fév", total: 178, confirmed: 150, pending: 28 },
    { month: "Mar", total: 165, confirmed: 142, pending: 23 },
    { month: "Avr", total: 189, confirmed: 161, pending: 28 },
    { month: "Mai", total: 203, confirmed: 175, pending: 28 },
    { month: "Juin", total: 155, confirmed: 110, pending: 45 },
  ];

  const requestTypes = [
    { name: "Déclaration de naissance", value: 385, color: "#C86A4A" },
    { name: "Carte d'identité", value: 298, color: "#2E6B57" },
    { name: "Assurance maladie", value: 234, color: "#F97316" },
    { name: "Passeport", value: 156, color: "#F59E0B" },
    { name: "Permis de conduire", value: 128, color: "#8B5A3C" },
    { name: "Autres", value: 97, color: "#6B6B6B" },
  ];

  const processingTime = [
    { day: "Lun", avgTime: 2.3 },
    { day: "Mar", avgTime: 2.1 },
    { day: "Mer", avgTime: 2.5 },
    { day: "Jeu", avgTime: 2.2 },
    { day: "Ven", avgTime: 2.7 },
    { day: "Sam", avgTime: 3.1 },
    { day: "Dim", avgTime: 3.5 },
  ];

  const confirmationRate = [
    { month: "Jan", rate: 82.8 },
    { month: "Fév", rate: 84.3 },
    { month: "Mar", rate: 86.1 },
    { month: "Avr", rate: 85.2 },
    { month: "Mai", rate: 86.2 },
    { month: "Juin", rate: 87.3 },
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
                <SidebarMenuButton asChild>
                  <Link to="/agent/requests">
                    <FileText className="w-5 h-5" />
                    <span>Gestion des demandes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive>
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
                <h2 className="text-xl font-semibold">Statistiques</h2>
                <p className="text-sm text-muted-foreground">Rapports et analyses détaillées</p>
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
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total traité"
                value="1,298"
                icon={FileText}
                iconColor="text-primary"
              />
              <StatCard
                title="En attente"
                value="45"
                icon={Clock}
                iconColor="text-amber-600"
              />
              <StatCard
                title="Taux de confirmation"
                value="87.3%"
                icon={CheckCircle2}
                iconColor="text-green-600"
              />
              <StatCard
                title="Citoyens actifs"
                value="1,247"
                icon={Users}
                iconColor="text-secondary"
              />
            </div>

            {/* Charts Row 1 */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Demandes mensuelles</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart data={monthlyRequests}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E3" />
                      <XAxis dataKey="month" stroke="#6B6B6B" />
                      <YAxis stroke="#6B6B6B" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E8E6E3',
                          borderRadius: '8px' 
                        }}
                      />
                      <Legend />
                      <Bar dataKey="confirmed" fill="#2E6B57" name="Confirmées" radius={[8, 8, 0, 0]} />
                      <Bar dataKey="pending" fill="#F59E0B" name="En attente" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Types de demandes</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={350}>
                    <PieChart>
                      <Pie
                        data={requestTypes}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {requestTypes.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E8E6E3',
                          borderRadius: '8px' 
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Charts Row 2 */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <Card>
                <CardHeader>
                  <CardTitle>Temps moyen de traitement (jours)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={processingTime}>
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
                      <Line 
                        type="monotone" 
                        dataKey="avgTime" 
                        stroke="#C86A4A" 
                        strokeWidth={3}
                        dot={{ fill: '#C86A4A', r: 5 }}
                        name="Temps moyen"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Taux de confirmation (%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={confirmationRate}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#E8E6E3" />
                      <XAxis dataKey="month" stroke="#6B6B6B" />
                      <YAxis stroke="#6B6B6B" domain={[80, 90]} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #E8E6E3',
                          borderRadius: '8px' 
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="#2E6B57" 
                        strokeWidth={3}
                        dot={{ fill: '#2E6B57', r: 5 }}
                        name="Taux"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Summary Cards */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Calendar className="w-5 h-5 text-primary" />
                    Cette semaine
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Demandes traitées</span>
                    <span className="font-semibold">78</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Nouvelles demandes</span>
                    <span className="font-semibold">82</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Temps moyen</span>
                    <span className="font-semibold">2.4 jours</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <TrendingUp className="w-5 h-5 text-green-600" />
                    Tendances
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Demandes</span>
                    <span className="font-semibold text-green-600">+12.5%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Confirmations</span>
                    <span className="font-semibold text-green-600">+5.2%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Efficacité</span>
                    <span className="font-semibold text-green-600">+8.1%</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Users className="w-5 h-5 text-secondary" />
                    Performance agents
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Agents actifs</span>
                    <span className="font-semibold">24</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Moyenne/agent</span>
                    <span className="font-semibold">54 demandes</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-muted-foreground">Satisfaction</span>
                    <span className="font-semibold">94%</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
}
