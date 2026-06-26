export interface HistoryItem {
  id: string;
  action: string;
  description: string;
  status: "success" | "pending" | "failed";
  createdAt: string;
  route?: string;
  metadata?: Record<string, any>;
}

const MAX_HISTORY_ITEMS = 500;
const DUPLICATE_TIME_WINDOW_MS = 3000; // 3 seconds window to prevent duplicate logs

// Helper to get the scoped localStorage key based on the logged-in user
const getStorageKey = (): string => {
  try {
    const userStr = sessionStorage.getItem("user");
    if (userStr) {
      const user = JSON.parse(userStr);
      const identifier = user.id || user.email || user.nom;
      if (identifier) {
        return `ecitoyen_history_${identifier}`;
      }
    }
  } catch (e) {
    console.error("Error reading user from sessionStorage:", e);
  }
  return "ecitoyen_history_guest";
};

// Dispatch a custom event to notify components of history changes reactively
const notifyHistoryChanged = () => {
  window.dispatchEvent(new CustomEvent("ecitoyen_history_changed"));
};

export const historyService = {
  /**
   * Retrieves the full history for the current logged-in user, ordered by date descending.
   */
  getHistory(): HistoryItem[] {
    try {
      const key = getStorageKey();
      const raw = localStorage.getItem(key);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      if (!Array.isArray(parsed)) return [];
      
      // Ensure sorting by date descending
      return parsed.sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } catch (e) {
      console.error("Failed to read history from localStorage:", e);
      return [];
    }
  },

  /**
   * Adds an item to the user's action history.
   * Auto-generates unique ID and ISO timestamp.
   * Excludes rapid identical actions to avoid duplicates.
   */
  addHistory(
    item: Omit<HistoryItem, "id" | "createdAt"> & { id?: string; createdAt?: string }
  ): HistoryItem | null {
    try {
      const key = getStorageKey();
      const currentHistory = this.getHistory(); // already sorted descending

      // 1. Prevent exact duplicate actions within a short time window
      if (currentHistory.length > 0) {
        const lastItem = currentHistory[0]; // most recent
        const isIdentical =
          lastItem.action === item.action &&
          lastItem.description === item.description &&
          lastItem.status === item.status &&
          lastItem.route === item.route;

        if (isIdentical) {
          const timeDiff = Date.now() - new Date(lastItem.createdAt).getTime();
          if (timeDiff < DUPLICATE_TIME_WINDOW_MS) {
            // Duplicate detected within the window, skip adding
            return null;
          }
        }
      }

      // 2. Create the new item
      const newItem: HistoryItem = {
        id: item.id || `hist-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        action: item.action,
        description: item.description,
        status: item.status,
        createdAt: item.createdAt || new Date().toISOString(),
        route: item.route,
        metadata: item.metadata,
      };

      // 3. Add to the collection
      const updatedList = [newItem, ...currentHistory];

      // 4. Enforce size limit
      const trimmedList = updatedList.slice(0, MAX_HISTORY_ITEMS);

      // 5. Save and notify
      localStorage.setItem(key, JSON.stringify(trimmedList));
      notifyHistoryChanged();

      return newItem;
    } catch (e) {
      console.error("Failed to add item to history:", e);
      return null;
    }
  },

  /**
   * Removes a specific item from the history by its ID.
   */
  removeHistory(id: string): void {
    try {
      const key = getStorageKey();
      const currentHistory = this.getHistory();
      const filtered = currentHistory.filter((item) => item.id !== id);
      localStorage.setItem(key, JSON.stringify(filtered));
      notifyHistoryChanged();
    } catch (e) {
      console.error("Failed to remove history item:", e);
    }
  },

  /**
   * Clears the entire history list for the current active user key.
   */
  clearHistory(): void {
    try {
      const key = getStorageKey();
      localStorage.removeItem(key);
      notifyHistoryChanged();
    } catch (e) {
      console.error("Failed to clear history:", e);
    }
  },
};

export default historyService;
