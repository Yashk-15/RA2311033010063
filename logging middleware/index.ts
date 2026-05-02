/**
 * Logging Middleware — Campus Notification Platform
 *
 * Reusable Log function that sends structured log entries to the
 * evaluation server. Integrate this throughout the codebase to
 * trace the full lifecycle of application events.
 *
 * Usage:
 *   import { Log } from '../logging middleware';
 *   await Log("frontend", "info", "page", "Priority inbox page loaded");
 */

const LOG_API_URL = "http://20.207.122.201/evaluation-service/logs";

// ── Types ────────────────────────────────────────────────────────────────────

export type Stack = "backend" | "frontend";

export type Level = "debug" | "info" | "warn" | "error" | "fatal";

/** Packages allowed for frontend stack */
export type FrontendPackage =
  | "api"
  | "component"
  | "hook"
  | "page"
  | "state"
  | "style";

/** Packages allowed for backend stack */
export type BackendPackage =
  | "db"
  | "handler"
  | "middleware"
  | "util"
  | "service";

export type Package = FrontendPackage | BackendPackage;

// ── Core Log Function ────────────────────────────────────────────────────────

/**
 * Sends a structured log entry to the evaluation server.
 *
 * @param stack   - "frontend" | "backend"
 * @param level   - "debug" | "info" | "warn" | "error" | "fatal"
 * @param pkg     - The package/layer within the app (e.g. "api", "component")
 * @param message - A descriptive message about the event
 */
export async function Log(
  stack: Stack,
  level: Level,
  pkg: Package,
  message: string
): Promise<void> {
  const authToken = process.env.AUTH_TOKEN ?? "";

  if (!authToken) {
    console.warn(
      "[Logger] WARNING: AUTH_TOKEN is not set. Log will not be sent."
    );
    return;
  }

  const payload = {
    stack,
    level,
    package: pkg,
    message,
  };

  try {
    const response = await fetch(LOG_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      console.error(
        `[Logger] Failed to send log — HTTP ${response.status}: ${response.statusText}`
      );
    }
  } catch (err) {
    // Never let logging failures crash the application
    console.error("[Logger] Network error while sending log:", err);
  }
}
