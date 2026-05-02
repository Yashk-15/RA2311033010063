"use client";

import { useState, useMemo } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Slider from "@mui/material/Slider";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import StarIcon from "@mui/icons-material/Star";
import RefreshIcon from "@mui/icons-material/Refresh";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import FilterBar from "@/components/FilterBar";
import NotificationCard from "@/components/NotificationCard";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationType } from "@/api/notifications";

const TYPE_WEIGHT: Record<NotificationType, number> = {
  Placement: 3,
  Result: 2,
  Event: 1,
};

function computeScore(type: NotificationType, timestamp: string): number {
  return TYPE_WEIGHT[type] * 1e12 + new Date(timestamp.replace(" ", "T")).getTime();
}

export default function PriorityPage() {
  const [topN, setTopN] = useState<number>(10);
  const [typeFilter, setTypeFilter] = useState<NotificationType | "">("");

  const { notifications, readIds, loading, error, refetch, markAsRead, markAllAsRead } =
    useNotifications({ notification_type: typeFilter || undefined });

  // Compute top N by priority score (client-side ranking)
  const prioritized = useMemo(() => {
    const scored = notifications.map((n) => ({
      ...n,
      score: computeScore(n.Type, n.Timestamp),
    }));
    return scored.sort((a, b) => b.score - a.score).slice(0, topN);
  }, [notifications, topN]);

  const unreadCount = prioritized.filter((n) => !readIds.has(n.ID)).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <StarIcon sx={{ color: "#f9a825", fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              Priority Inbox
            </Typography>
            {unreadCount > 0 && (
              <Chip label={`${unreadCount} new`} color="primary" size="small" sx={{ fontWeight: 700 }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            Top {topN} notifications ranked by importance · Placement &gt; Result &gt; Event
          </Typography>
        </Box>

        <Box display="flex" gap={1} flexWrap="wrap">
          <Button
            variant="outlined"
            startIcon={<RefreshIcon />}
            onClick={refetch}
            size="small"
            sx={{ textTransform: "none" }}
          >
            Refresh
          </Button>
          {unreadCount > 0 && (
            <Button
              variant="contained"
              startIcon={<DoneAllIcon />}
              onClick={() => markAllAsRead(prioritized.map((n) => n.ID))}
              size="small"
              sx={{ textTransform: "none" }}
            >
              Mark all read
            </Button>
          )}
        </Box>
      </Box>

      {/* Top N Slider */}
      <Box sx={{ bgcolor: "white", borderRadius: 3, p: 2.5, mb: 3, boxShadow: 1 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Show top <Chip label={topN} size="small" color="primary" sx={{ fontWeight: 700, mx: 0.5 }} /> notifications
        </Typography>
        <Slider
          value={topN}
          min={5}
          max={20}
          step={5}
          marks={[
            { value: 5, label: "5" },
            { value: 10, label: "10" },
            { value: 15, label: "15" },
            { value: 20, label: "20" },
          ]}
          onChange={(_, val) => setTopN(val as number)}
          sx={{ mt: 1 }}
        />
      </Box>

      {/* Filter */}
      <Box mb={3}>
        <FilterBar selected={typeFilter} onChange={setTypeFilter} />
      </Box>

      <Divider sx={{ mb: 3 }} />

      {/* Content */}
      {loading && (
        <Box display="flex" justifyContent="center" py={8}>
          <CircularProgress />
        </Box>
      )}

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && prioritized.length === 0 && (
        <Box textAlign="center" py={8}>
          <StarIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography color="text.secondary">No notifications found.</Typography>
        </Box>
      )}

      {!loading &&
        prioritized.map((n, i) => (
          <NotificationCard
            key={n.ID}
            notification={n}
            isRead={readIds.has(n.ID)}
            rank={i + 1}
            onMarkRead={markAsRead}
          />
        ))}
    </Container>
  );
}
