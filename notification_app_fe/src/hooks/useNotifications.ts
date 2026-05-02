"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchNotifications, getAuthToken, type Notification, type FetchParams } from "@/api/notifications";
import { getReadIds, markAsRead, markAllAsRead } from "@/state/notificationStore";
import { Log } from "@/lib/logger";

export function useNotifications(params: FetchParams = {}) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [token, setToken] = useState<string>("");

  // Load read IDs from localStorage
  useEffect(() => {
    setReadIds(getReadIds());
  }, []);

  // Fetch token once and store in sessionStorage for logger
  useEffect(() => {
    getAuthToken().then((t) => {
      setToken(t);
      if (typeof window !== "undefined") sessionStorage.setItem("auth_token", t);
    }).catch((e: Error) => setError(e.message));
  }, []);

  const load = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    setError(null);
    await Log("frontend", "info", "hook", `Loading notifications: ${JSON.stringify(params)}`);
    try {
      const data = await fetchNotifications(token, params);
      setNotifications(data);
    } catch (e) {
      const msg = (e as Error).message;
      setError(msg);
      await Log("frontend", "error", "hook", `Failed to load notifications: ${msg}`);
    } finally {
      setLoading(false);
    }
  }, [token, JSON.stringify(params)]);

  useEffect(() => {
    load();
  }, [load]);

  const handleMarkAsRead = useCallback((id: string) => {
    markAsRead(id);
    setReadIds(getReadIds());
  }, []);

  const handleMarkAllAsRead = useCallback((ids: string[]) => {
    markAllAsRead(ids);
    setReadIds(getReadIds());
  }, []);

  return {
    notifications,
    readIds,
    loading,
    error,
    refetch: load,
    markAsRead: handleMarkAsRead,
    markAllAsRead: handleMarkAllAsRead,
  };
}
