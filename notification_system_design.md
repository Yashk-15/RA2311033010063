# Stage 1

## Priority Inbox — Approach & Design

### Problem

Users were losing track of important campus notifications due to high volume. The goal is to always surface the top **N** most important unread notifications (where N = 10, 15, 20, etc. as per user choice).

---

### Priority Formula

Each notification is assigned a numeric **priority score**:

```
score = type_weight × 10¹² + timestamp_unix_ms
```

**Type weights (higher = more important):**

| Type      | Weight |
|-----------|--------|
| Placement | 3      |
| Result    | 2      |
| Event     | 1      |

**Why this formula?**
- Multiplying `type_weight` by `10¹²` ensures the notification type **always dominates** recency. No Event, however recent, can ever outscore a Placement.
- Adding `timestamp_unix_ms` means that within the same type, **more recent notifications rank higher**.
- The combined score is a single integer — easy to compare and heap-manageable.

---

### Data Structure: Min-Heap of Size N

To efficiently maintain the top N notifications, especially as new notifications continuously arrive, I use a **min-heap of fixed size N**.

**Algorithm:**

```
for each incoming notification:
    compute its priority score
    if heap.size < N:
        push notification into heap
    else if score > heap.min.score:
        pop the lowest-priority item from heap
        push the new notification
```

At the end, the heap contains exactly the top N notifications. Extract and sort descending for display.

**Why a min-heap?**

| Approach                    | Time per new notification | Space  |
|-----------------------------|---------------------------|--------|
| Re-sort full array          | O(M log M)                | O(M)   |
| **Min-heap of size N**      | **O(log N)**              | **O(N)**|

As new notifications stream in continuously, the min-heap approach is significantly more efficient — we only ever need to maintain N items in memory and each insertion is O(log N).

---

### Handling Continuous Notification Streams

The min-heap naturally handles streaming data:
- We never need to store all notifications.
- For each new notification, a single comparison (`score > heap.min.score`) and at most one heap operation (`O(log N)`) is needed.
- Memory usage stays bounded at O(N) regardless of total notification volume.

---

### Code Structure

```
notification_app_be/
└── priorityInbox.ts    ← Main script
    ├── computeScore()  ← Priority scoring formula
    ├── MinHeap class   ← Min-heap implementation
    ├── getTopN()       ← Top-N algorithm
    └── fetchNotifications() ← Authenticated API call
```

---

### How to Run

```bash
# Set your auth token
$env:AUTH_TOKEN="your_token_here"    # PowerShell

# Install dependencies
cd notification_app_be
npm install

# Find top 10 (default)
npx ts-node priorityInbox.ts

# Find top 15 or 20
npx ts-node priorityInbox.ts 15
npx ts-node priorityInbox.ts 20
```

---

### Sample Output

```
──────────────────────────────────────────────────────────────────────
 Rank │ Type          │ Message                              │ Timestamp
──────────────────────────────────────────────────────────────────────
    1 │ Placement     │ CSX Corporation hiring               │ 2026-04-22 17:51:18
    2 │ Placement     │ Advanced Micro Devices Inc. hiring   │ 2026-04-22 17:49:42
    3 │ Result        │ mid-sem                              │ 2026-04-22 17:51:30
    4 │ Result        │ mid-sem                              │ 2026-04-22 17:50:54
    5 │ Result        │ project-review                       │ 2026-04-22 17:50:42
    6 │ Result        │ external                             │ 2026-04-22 17:50:30
    7 │ Result        │ project-review                       │ 2026-04-22 17:50:18
    8 │ Result        │ project-review                       │ 2026-04-22 17:49:54
    9 │ Event         │ farewell                             │ 2026-04-22 17:51:06
   10 │ Event         │ tech-fest                            │ 2026-04-22 17:50:06
──────────────────────────────────────────────────────────────────────
```
