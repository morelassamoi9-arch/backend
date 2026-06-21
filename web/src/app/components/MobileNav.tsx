import { Home, FileText, Plus, Bell, User } from "lucide-react";
import { Link, useLocation } from "react-router";
import { cn } from "./ui/utils";

export function MobileNav() {
  const location = useLocation();

  const navItems = [
    { icon: Home, label: "Accueil", path: "/citizen" },
    { icon: FileText, label: "Demandes", path: "/citizen/requests" },
    { icon: Plus, label: "Nouvelle", path: "/citizen/new-request" },
    { icon: Bell, label: "Notifications", path: "/citizen/notifications" },
    { icon: User, label: "Profil", path: "/citizen/profile" },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-border z-50">
      <div className="flex items-center justify-around h-16">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center justify-center gap-1 px-3 py-2 rounded-lg transition-colors",
                isActive ? "text-primary" : "text-muted-foreground"
              )}
            >
              <Icon className="w-5 h-5" />
              <span className="text-xs">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
