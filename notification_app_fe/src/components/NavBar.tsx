"use client";

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import NotificationsIcon from "@mui/icons-material/Notifications";
import StarIcon from "@mui/icons-material/Star";
import Box from "@mui/material/Box";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Log } from "@/lib/logger";

export default function NavBar() {
  const pathname = usePathname();

  const handleNav = async (page: string) => {
    await Log("frontend", "info", "component", `User navigated to ${page}`);
  };

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        background: "linear-gradient(135deg, #1a237e 0%, #283593 100%)",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
      }}
    >
      <Toolbar sx={{ justifyContent: "space-between" }}>
        <Box display="flex" alignItems="center" gap={1}>
          <NotificationsIcon sx={{ color: "#90caf9" }} />
          <Typography variant="h6" fontWeight={700} letterSpacing={0.5}>
            Campus Notify
          </Typography>
        </Box>

        <Box display="flex" gap={1}>
          <Link href="/notifications" passHref style={{ textDecoration: "none" }}>
            <Button
              onClick={() => handleNav("/notifications")}
              startIcon={<NotificationsIcon />}
              variant={pathname === "/notifications" ? "contained" : "text"}
              sx={{
                color: "white",
                bgcolor: pathname === "/notifications" ? "rgba(255,255,255,0.15)" : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              All Notifications
            </Button>
          </Link>
          <Link href="/priority" passHref style={{ textDecoration: "none" }}>
            <Button
              onClick={() => handleNav("/priority")}
              startIcon={<StarIcon />}
              variant={pathname === "/priority" ? "contained" : "text"}
              sx={{
                color: "white",
                bgcolor: pathname === "/priority" ? "rgba(255,255,255,0.15)" : "transparent",
                "&:hover": { bgcolor: "rgba(255,255,255,0.1)" },
                textTransform: "none",
                fontWeight: 600,
              }}
            >
              Priority Inbox
            </Button>
          </Link>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
