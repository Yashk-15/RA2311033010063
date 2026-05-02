/**
 * Stage 1 — Priority Inbox
 *
 * Campus Notification Platform
 *
 * Fetches notifications from the evaluation API and returns the top N
 * most important unread notifications, ranked by:
 *   1. Type weight  — Placement (3) > Result (2) > Event (1)
 *   2. Recency      — More recent timestamps rank higher within the same type
 *
 * Data structure: Min-Heap of size N
 *   - O(log N) per new notification  (efficient for streaming data)
 *   - O(N) space
 *
 * Run:
 *   npx ts-node priorityInbox.ts [N]
 *   e.g.  npx ts-node priorityInbox.ts 10
 */

import { Log } from "../logging middleware/index";

// ── Types ────────────────────────────────────────────────────────────────────

type NotificationType = "Placement" | "Result" | "Event";

interface Notification {
  ID: string;
  Type: NotificationType;
  Message: string;
  Timestamp: string; // ISO 8601 format, e.g. "2026-04-22 17:51:30"
}

interface ApiResponse {
  notifications: Notification[];
}

interface HeapNode {
  score: number;
  notification: Notification;
}

// ── Priority Weights ─────────────────────────────────────────────────────────

/**
 * Higher weight = more important.
 * Placement notifications always outrank Result, which outranks Event.
 */
const TYPE_WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

// ── Scoring Function ─────────────────────────────────────────────────────────

/**
 * Computes a numeric priority score for a notification.
 *
 * Formula: score = type_weight × 10^12 + timestamp_unix_ms
 *
 * Multiplying by 10^12 ensures the type weight always dominates.
 * Within the same type, more recent notifications score higher (larger ms value).
 */
function computeScore(notification: Notification): number {
  const weight = TYPE_WEIGHT[notification.Type] ?? 0;
  const recencyMs = new Date(notification.Timestamp).getTime();
  return weight * 1e12 + recencyMs;
}

// ── Min-Heap ─────────────────────────────────────────────────────────────────

/**
 * A min-heap keyed on `score`.
 * Maintaining a min-heap of size N lets us efficiently track the top-N
 * notifications as new ones stream in — O(log N) per insertion.
 */
class MinHeap {
  private heap: HeapNode[] = [];

  get size(): number {
    return this.heap.length;
  }

  get min(): HeapNode {
    return this.heap[0];
  }

  push(node: HeapNode): void {
    this.heap.push(node);
    this.bubbleUp(this.heap.length - 1);
  }

  pop(): HeapNode {
    const top = this.heap[0];
    const last = this.heap.pop()!;
    if (this.heap.length > 0) {
      this.heap[0] = last;
      this.sinkDown(0);
    }
    return top;
  }

  private bubbleUp(i: number): void {
    while (i > 0) {
      const parent = Math.floor((i - 1) / 2);
      if (this.heap[parent].score <= this.heap[i].score) break;
      [this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]];
      i = parent;
    }
  }

  private sinkDown(i: number): void {
    const n = this.heap.length;
    while (true) {
      let smallest = i;
      const left = 2 * i + 1;
      const right = 2 * i + 2;
      if (left < n && this.heap[left].score < this.heap[smallest].score)
        smallest = left;
      if (right < n && this.heap[right].score < this.heap[smallest].score)
        smallest = right;
      if (smallest === i) break;
      [this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]];
      i = smallest;
    }
  }
}

// ── Top-N Algorithm ──────────────────────────────────────────────────────────

/**
 * Returns the top N highest-priority notifications from the given list.
 *
 * Uses a min-heap of size N:
 *  - If heap is not full yet, push the notification.
 *  - If the new notification's score beats the current minimum, evict the
 *    minimum and insert the new one.
 * This maintains top-N in O(M log N) time for M total notifications.
 */
function getTopN(notifications: Notification[], n: number): Notification[] {
  const heap = new MinHeap();

  for (const notif of notifications) {
    const score = computeScore(notif);

    if (heap.size < n) {
      heap.push({ score, notification: notif });
    } else if (score > heap.min.score) {
      heap.pop();
      heap.push({ score, notification: notif });
    }
  }

  // Extract from heap; reverse to get descending priority order
  const result: Notification[] = [];
  while (heap.size > 0) {
    result.unshift(heap.pop().notification);
  }
  return result;
}

// ── API Fetch ────────────────────────────────────────────────────────────────

const NOTIFICATIONS_API =
  "http://20.207.122.201/evaluation-service/notifications";

async function fetchNotifications(): Promise<Notification[]> {
  const authToken = process.env.AUTH_TOKEN ?? "";

  await Log(
    "backend",
    "info",
    "handler",
    `Fetching notifications from ${NOTIFICATIONS_API}`
  );

  if (!authToken) {
    await Log(
      "backend",
      "fatal",
      "handler",
      "AUTH_TOKEN is not set — cannot authenticate with the notifications API"
    );
    throw new Error(
      "AUTH_TOKEN environment variable is not set. " +
        "Create a .env file with AUTH_TOKEN=<your_token> and run: " +
        "node -r dotenv/config priorityInbox.ts"
    );
  }

  const response = await fetch(NOTIFICATIONS_API, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${authToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    await Log(
      "backend",
      "error",
      "handler",
      `Notifications API returned HTTP ${response.status}: ${response.statusText}`
    );
    throw new Error(
      `Failed to fetch notifications — HTTP ${response.status}: ${response.statusText}`
    );
  }

  const data = (await response.json()) as ApiResponse;

  await Log(
    "backend",
    "info",
    "handler",
    `Successfully fetched ${data.notifications.length} notifications`
  );

  return data.notifications;
}

// ── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // Allow N to be passed as a CLI argument: npx ts-node priorityInbox.ts 15
  const N = parseInt(process.argv[2] ?? "10", 10);

  if (isNaN(N) || N <= 0) {
    console.error("Error: N must be a positive integer.");
    process.exit(1);
  }

  await Log(
    "backend",
    "info",
    "handler",
    `Priority Inbox started — computing top ${N} notifications`
  );

  console.log(`\n🔔  Campus Notification Platform — Priority Inbox`);
  console.log(`    Finding top ${N} notifications...\n`);

  try {
    const notifications = await fetchNotifications();

    if (notifications.length === 0) {
      console.log("No notifications found.");
      await Log("backend", "warn", "handler", "Notification list is empty");
      return;
    }

    const topN = getTopN(notifications, N);

    await Log(
      "backend",
      "info",
      "handler",
      `Top ${N} notifications computed successfully from ${notifications.length} total`
    );

    // ── Display Results ───────────────────────────────────────────────────────
    console.log(`${"─".repeat(70)}`);
    console.log(
      ` Rank │ Type          │ Message                              │ Timestamp`
    );
    console.log(`${"─".repeat(70)}`);

    topN.forEach((n, i) => {
      const rank = String(i + 1).padStart(4, " ");
      const type = n.Type.padEnd(13, " ");
      const msg = n.Message.padEnd(36, " ");
      console.log(` ${rank} │ ${type} │ ${msg} │ ${n.Timestamp}`);
    });

    console.log(`${"─".repeat(70)}`);
    console.log(`\n✅  Top ${topN.length} of ${notifications.length} total notifications shown.\n`);
  } catch (err) {
    await Log(
      "backend",
      "fatal",
      "handler",
      `Priority Inbox failed: ${(err as Error).message}`
    );
    console.error("\n❌  Error:", (err as Error).message);
    process.exit(1);
  }
}

main();
