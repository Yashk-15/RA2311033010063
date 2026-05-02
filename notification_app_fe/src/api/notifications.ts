/**
 * Notification API client
 * package: "api" (frontend stack)
 */

import { Log } from "@/lib/logger";

const BASE_URL = "http://20.207.122.201/evaluation-service/notifications";

export type NotificationType = "Placement" | "Result" | "Event";

export interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string;
}

export interface FetchParams {
  limit?: number;
  page?: number;
  notification_type?: NotificationType | "";
}

export interface ApiResponse {
  notifications: Notification[];
}

export async function fetchNotifications(
  token: string,
  params: FetchParams = {}
): Promise<Notification[]> {
  await Log("frontend", "info", "api", `Fetching notifications with params: ${JSON.stringify(params)}`);

  const url = new URL(BASE_URL);
  if (params.limit) url.searchParams.set("limit", String(params.limit));
  if (params.page) url.searchParams.set("page", String(params.page));
  if (params.notification_type) url.searchParams.set("notification_type", params.notification_type);

  try {
    const res = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      await Log("frontend", "error", "api", `Notifications API error: HTTP ${res.status}`);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    const data: ApiResponse = await res.json() as ApiResponse;
    await Log("frontend", "info", "api", `Fetched ${data.notifications.length} notifications successfully`);
    return data.notifications;
  } catch (err) {
    await Log("frontend", "error", "api", `Failed to fetch notifications: ${(err as Error).message}`);
    throw err;
  }
}

export async function getAuthToken(): Promise<string> {
  await Log("frontend", "info", "api", "Fetching auth token from evaluation service");
  try {
    const res = await fetch("http://20.207.122.201/evaluation-service/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: "yk4568@srmist.edu.in",
        name: "Yash Kaushik",
        rollNo: "RA2311033010063",
        accessCode: "QkbpxH",
        clientID: "576ef24d-78c8-4067-83cb-f7c7b1a53253",
        clientSecret: "DqygQPuNMPfJxBAp",
      }),
      cache: "no-store",
    });
    const data = await res.json() as { access_token: string };
    await Log("frontend", "info", "api", "Auth token fetched successfully");
    return data.access_token;
  } catch (err) {
    await Log("frontend", "error", "api", `Auth token fetch failed: ${(err as Error).message}`);
    throw err;
  }
}
