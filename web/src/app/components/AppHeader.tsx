import { Link } from "react-router";

interface AppHeaderProps {
  showBack?: boolean;
  backTo?: string;
  title?: string;
}

export function AppHeader({ showBack = false, backTo = "/", title }: AppHeaderProps) {
  return (
    <Link 
      to="/" 
      aria-label="Retour à l'accueil"
      className="flex items-center gap-3 cursor-pointer transition-all duration-200 hover:scale-[1.02] active:scale-95"
    >
      <img src="/Icone.png" alt="e-Citoyen CI" className="w-10 h-10 object-contain" />
      <div>
        <h1 className="text-xl font-semibold text-foreground">
          {title || "e-Citoyen CI"}
        </h1>
        <p className="text-xs text-muted-foreground">République de Côte d'Ivoire</p>
      </div>
    </Link>
  );
}
