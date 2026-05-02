"use client";

import Box from "@mui/material/Box";
import ToggleButton from "@mui/material/ToggleButton";
import ToggleButtonGroup from "@mui/material/ToggleButtonGroup";
import WorkIcon from "@mui/icons-material/Work";
import SchoolIcon from "@mui/icons-material/School";
import EventIcon from "@mui/icons-material/Event";
import AllInclusiveIcon from "@mui/icons-material/AllInclusive";
import type { NotificationType } from "@/api/notifications";

interface Props {
  selected: NotificationType | "";
  onChange: (val: NotificationType | "") => void;
}

export default function FilterBar({ selected, onChange }: Props) {
  return (
    <Box display="flex" alignItems="center" gap={1} flexWrap="wrap">
      <ToggleButtonGroup
        value={selected}
        exclusive
        onChange={(_, val) => onChange(val ?? "")}
        size="small"
        sx={{ bgcolor: "white", borderRadius: 2 }}
      >
        <ToggleButton value="" sx={{ px: 2, textTransform: "none", fontWeight: 600 }}>
          <AllInclusiveIcon fontSize="small" sx={{ mr: 0.5 }} /> All
        </ToggleButton>
        <ToggleButton value="Placement" sx={{ px: 2, textTransform: "none", fontWeight: 600 }}>
          <WorkIcon fontSize="small" sx={{ mr: 0.5 }} /> Placement
        </ToggleButton>
        <ToggleButton value="Result" sx={{ px: 2, textTransform: "none", fontWeight: 600 }}>
          <SchoolIcon fontSize="small" sx={{ mr: 0.5 }} /> Result
        </ToggleButton>
        <ToggleButton value="Event" sx={{ px: 2, textTransform: "none", fontWeight: 600 }}>
          <EventIcon fontSize="small" sx={{ mr: 0.5 }} /> Event
        </ToggleButton>
      </ToggleButtonGroup>
    </Box>
  );
}
