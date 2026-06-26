import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";

export type RequestStatus = "pending" | "verified" | "confirmed" | "rejected" | "en_attente" | "en_cours" | "traitee" | "rejetee";

interface StatusBadgeProps {
  status: RequestStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const statusConfig = {
    pending: {
      label: "En attente",
      className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    },
    en_attente: {
      label: "En attente",
      className: "bg-amber-100 text-amber-800 hover:bg-amber-100",
    },
    verified: {
      label: "En cours",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    en_cours: {
      label: "En cours",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    confirmed: {
      label: "Traitée",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    traitee: {
      label: "Traitée",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
    rejected: {
      label: "Rejetée",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
    rejetee: {
      label: "Rejetée",
      className: "bg-red-100 text-red-800 hover:bg-red-100",
    },
  };

  const config = statusConfig[status] || statusConfig.pending;

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
