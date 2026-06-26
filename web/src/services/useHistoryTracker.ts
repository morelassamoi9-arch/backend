import { useLocation } from "react-router";
import { historyService } from "./historyService";

export function useHistoryTracker() {
  const location = useLocation();

  const trackAction = (
    action: string,
    description: string,
    status: "success" | "pending" | "failed" = "success",
    metadata?: Record<string, any>
  ) => {
    return historyService.addHistory({
      action,
      description,
      status,
      route: location.pathname,
      metadata,
    });
  };

  return { trackAction };
}
