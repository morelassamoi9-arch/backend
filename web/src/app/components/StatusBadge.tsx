import { Badge } from "./ui/badge";
import { cn } from "./ui/utils";

export type RequestStatus = "pending" | "verified" | "confirmed";

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
    verified: {
      label: "Vérifiée",
      className: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    },
    confirmed: {
      label: "Confirmée",
      className: "bg-green-100 text-green-800 hover:bg-green-100",
    },
  };

  const config = statusConfig[status];

  return (
    <Badge className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
}
