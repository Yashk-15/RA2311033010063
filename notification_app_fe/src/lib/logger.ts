/**
 * Logging Middleware — Frontend copy
 * Sends structured logs to the evaluation server.
 */

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";

export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
export type FrontendPackage = "api" | "component" | "hook" | "page" | "state" | "style";
export type Package = FrontendPackage;

export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  // Only run client-side (needs auth token from sessionStorage)
  if (typeof window === "undefined") return;

  const authToken = sessionStorage.getItem("auth_token") ?? "";
  if (!authToken) return;

  try {
    await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify({ stack, level, package: pkg, message }),
    });
  } catch {
    // Never crash the app due to logging failure
  }
}
