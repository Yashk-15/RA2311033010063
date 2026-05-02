/**
 * Read/Unread state management via localStorage
 * package: "state" (frontend stack)
 */

const STORAGE_KEY = "read_notification_ids";

export function getReadIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? new Set(JSON.parse(stored) as string[]) : new Set();
  } catch {
    return new Set();
  }
}

export function markAsRead(id: string): void {
  const ids = getReadIds();
  ids.add(id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(ids)));
}

export function markAllAsRead(ids: string[]): void {
  const existing = getReadIds();
  ids.forEach((id) => existing.add(id));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(existing)));
}

export function isRead(id: string): boolean {
  return getReadIds().has(id);
}
