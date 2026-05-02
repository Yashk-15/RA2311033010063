"use client";

import { useState } from "react";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Divider from "@mui/material/Divider";
import Chip from "@mui/material/Chip";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import RefreshIcon from "@mui/icons-material/Refresh";
import NotificationsIcon from "@mui/icons-material/Notifications";
import FilterBar from "@/components/FilterBar";
import NotificationCard from "@/components/NotificationCard";
import { useNotifications } from "@/hooks/useNotifications";
import type { NotificationType } from "@/api/notifications";

export default function NotificationsPage() {
  const [typeFilter, setTypeFilter] = useState<NotificationType | "">("");

  const { notifications, readIds, loading, error, refetch, markAsRead, markAllAsRead } =
    useNotifications({ notification_type: typeFilter || undefined });

  const unreadCount = notifications.filter((n) => !readIds.has(n.ID)).length;

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" justifyContent="space-between" mb={3} flexWrap="wrap" gap={2}>
        <Box>
          <Box display="flex" alignItems="center" gap={1}>
            <NotificationsIcon sx={{ color: "primary.main", fontSize: 28 }} />
            <Typography variant="h5" fontWeight={700}>
              All Notifications
            </Typography>
            {unreadCount > 0 && (
              <Chip label={`${unreadCount} new`} color="primary" size="small" sx={{ fontWeight: 700 }} />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            {notifications.length} notifications total
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
              onClick={() => markAllAsRead(notifications.map((n) => n.ID))}
              size="small"
              sx={{ textTransform: "none" }}
            >
              Mark all read
            </Button>
          )}
        </Box>
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

      {!loading && !error && notifications.length === 0 && (
        <Box textAlign="center" py={8}>
          <NotificationsIcon sx={{ fontSize: 64, color: "text.disabled", mb: 2 }} />
          <Typography color="text.secondary">No notifications found.</Typography>
        </Box>
      )}

      {!loading && notifications.map((n) => (
        <NotificationCard
          key={n.ID}
          notification={n}
          isRead={readIds.has(n.ID)}
          onMarkRead={markAsRead}
        />
      ))}
    </Container>
  );
}
