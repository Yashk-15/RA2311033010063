"use client";

import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import FiberNewIcon from "@mui/icons-material/FiberNew";
import type { Notification, NotificationType } from "@/api/notifications";

interface Props {
  notification: Notification;
  isRead: boolean;
  rank?: number;
  onMarkRead: (id: string) => void;
}

const TYPE_CONFIG: Record<NotificationType, { color: "success" | "primary" | "warning"; icon: React.ReactNode; bg: string }> = {
  Placement: { color: "success", icon: <WorkIcon fontSize="small" />, bg: "rgba(46,125,50,0.08)" },
  Result: { color: "primary", icon: <SchoolIcon fontSize="small" />, bg: "rgba(25,118,210,0.08)" },
  Event: { color: "warning", icon: <EventIcon fontSize="small" />, bg: "rgba(237,108,2,0.08)" },
};

function formatTimestamp(ts: string): string {
  const d = new Date(ts.replace(" ", "T"));
  return d.toLocaleString("en-IN", {
    day: "2-digit", month: "short", year: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

export default function NotificationCard({ notification, isRead, rank, onMarkRead }: Props) {
  const config = TYPE_CONFIG[notification.Type];

  return (
    <Card
      elevation={isRead ? 0 : 2}
      sx={{
        mb: 1.5,
        border: isRead ? "1px solid #e0e0e0" : "1px solid #90caf9",
        bgcolor: isRead ? "#fafafa" : config.bg,
        transition: "all 0.2s ease",
        "&:hover": { transform: "translateY(-1px)", boxShadow: 3 },
        opacity: isRead ? 0.75 : 1,
      }}
    >
      <CardContent sx={{ py: "12px !important", px: 2 }}>
        <Box display="flex" alignItems="flex-start" gap={1.5}>
          {/* Rank badge */}
          {rank !== undefined && (
            <Box
              sx={{
                minWidth: 32, height: 32, borderRadius: "50%",
                bgcolor: "primary.main", color: "white",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontWeight: 700, fontSize: 13, flexShrink: 0,
              }}
            >
              {rank}
            </Box>
          )}

          {/* Content */}
          <Box flex={1}>
            <Box display="flex" alignItems="center" gap={1} mb={0.5} flexWrap="wrap">
              <Chip
                icon={config.icon}
                label={notification.Type}
                color={config.color}
                size="small"
                sx={{ fontWeight: 600, fontSize: 11 }}
              />
              {!isRead && (
                <Chip
                  icon={<FiberNewIcon />}
                  label="New"
                  size="small"
                  sx={{ bgcolor: "#e3f2fd", color: "#1565c0", fontWeight: 600, fontSize: 11 }}
                />
              )}
            </Box>

            <Typography variant="body1" fontWeight={isRead ? 400 : 600} color={isRead ? "text.secondary" : "text.primary"}>
              {notification.Message}
            </Typography>

            <Typography variant="caption" color="text.secondary" mt={0.5} display="block">
              {formatTimestamp(notification.Timestamp)}
            </Typography>
          </Box>

          {/* Mark read button */}
          {!isRead && (
            <Tooltip title="Mark as read">
              <IconButton
                size="small"
                onClick={() => onMarkRead(notification.ID)}
                sx={{ color: "primary.main", flexShrink: 0 }}
              >
                <DoneAllIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
        </Box>
      </CardContent>
    </Card>
  );
}
