import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Link, useNavigate } from "react-router";
import { AlertCircle, Home, ArrowLeft } from "lucide-react";
import React from "react";

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center items-center p-4">
      <Card className="w-full max-w-md border-2 border-primary/20 shadow-xl">
        <CardHeader className="text-center pb-4">
          <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-10 h-10 text-primary" />
          </div>
          <CardTitle className="text-3xl font-bold text-foreground">404 - Page Non Trouvée</CardTitle>
          <CardDescription className="text-base text-muted-foreground mt-2">
            La page que vous recherchez n'existe pas ou a été déplacée.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-center text-sm text-muted-foreground">
            L'espace Agent Administratif a été retiré. Seul le profil Citoyen/Client est désormais disponible.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
            <Button variant="outline" onClick={() => navigate(-1)} className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4" />
              Retour
            </Button>
            <Link to="/citizen" className="w-full sm:w-auto">
              <Button className="w-full flex items-center gap-2">
                <Home className="w-4 h-4" />
                Tableau de bord
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
