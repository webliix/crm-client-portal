import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import CalendarMonthOutlinedIcon from "@mui/icons-material/CalendarMonthOutlined";
import AssignmentTurnedInOutlinedIcon from "@mui/icons-material/AssignmentTurnedInOutlined";

import { tokens } from "../theme/tokens";
import { projectApi, type ClientProject } from "../services/projectApi";
import { BrandLoader } from "../components/common/BrandLoader";
import { ClientCardSkeleton, ClientFadeWebliixLoader } from "../components/common/ClientSkeleton";
import { GeometricBadge } from "../components/common/PortalIllustrations";

const PASTEL_THEMES = [
  {
    bg: tokens.colors.pastel.mint.bg,
    border: tokens.colors.pastel.mint.border,
    accent: tokens.colors.pastel.mint.bar,
    badgeShape: "cube" as const,
  },
  {
    bg: tokens.colors.pastel.lilac.bg,
    border: tokens.colors.pastel.lilac.border,
    accent: tokens.colors.pastel.lilac.bar,
    badgeShape: "hexagon" as const,
  },
  {
    bg: tokens.colors.pastel.blush.bg,
    border: tokens.colors.pastel.blush.border,
    accent: tokens.colors.pastel.blush.bar,
    badgeShape: "star" as const,
  },
  {
    bg: tokens.colors.pastel.sky.bg,
    border: tokens.colors.pastel.sky.border,
    accent: tokens.colors.pastel.sky.bar,
    badgeShape: "diamond" as const,
  },
];

export default function ClientProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "ACTIVE" | "COMPLETED">("ALL");

  useEffect(() => {
    projectApi.getMyProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  const filteredProjects = projects.filter((proj) => {
    const matchesSearch =
      proj.projectName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (proj.projectCode && proj.projectCode.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (proj.description && proj.description.toLowerCase().includes(searchTerm.toLowerCase()));

    const isCompleted = proj.status?.toUpperCase() === "COMPLETED";
    if (statusFilter === "ACTIVE") return matchesSearch && !isCompleted;
    if (statusFilter === "COMPLETED") return matchesSearch && isCompleted;
    return matchesSearch;
  });

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      {/* Top Header */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography variant="h4" fontWeight={900} color={tokens.colors.secondary[900]} letterSpacing="-0.02em" gutterBottom>
            Projects
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Monitor deliverables, timeline progress, task breakdowns, and phase milestones.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap", width: { xs: "100%", sm: "auto" } }}>
          <TextField
            size="small"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "text.secondary", fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: { xs: "100%", sm: 220 },
              "& .MuiOutlinedInput-root": {
                borderRadius: tokens.borderRadius.full,
                bgcolor: "#fff",
              },
            }}
          />
        </Box>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ display: "flex", gap: 1, mb: 3.5, flexWrap: "wrap" }}>
        {[
          { key: "ALL", label: `All Projects (${projects.length})` },
          { key: "ACTIVE", label: `In Progress (${projects.filter((p) => p.status?.toUpperCase() !== "COMPLETED").length})` },
          { key: "COMPLETED", label: `Completed (${projects.filter((p) => p.status?.toUpperCase() === "COMPLETED").length})` },
        ].map((tab) => (
          <Chip
            key={tab.key}
            label={tab.label}
            clickable
            onClick={() => setStatusFilter(tab.key as any)}
            sx={{
              fontWeight: 800,
              fontSize: "0.8rem",
              borderRadius: tokens.borderRadius.full,
              px: 1,
              py: 2.2,
              bgcolor: statusFilter === tab.key ? "#0f172a" : "#fff",
              color: statusFilter === tab.key ? "#fff" : tokens.colors.secondary[700],
              border: `1px solid ${statusFilter === tab.key ? "#0f172a" : tokens.colors.secondary[200]}`,
              "&:hover": {
                bgcolor: statusFilter === tab.key ? "#1e293b" : tokens.colors.secondary[100],
              },
            }}
          />
        ))}
      </Box>

      {loading ? (
        <Box sx={{ py: 2 }}>
          <ClientFadeWebliixLoader message="Fetching client projects..." size="small" />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3, mt: 3 }}>
            <ClientCardSkeleton />
            <ClientCardSkeleton />
            <ClientCardSkeleton />
          </Box>
        </Box>
      ) : filteredProjects.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center", borderRadius: tokens.borderRadius.xl, border: `1px solid ${tokens.colors.secondary[200]}`, bgcolor: "#fff" }}>
          <FolderSpecialOutlinedIcon sx={{ fontSize: 56, color: tokens.colors.secondary[300], mb: 2 }} />
          <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[800]} gutterBottom>
            No Projects Found
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: "auto" }}>
            {searchTerm ? "No project matching your search query was found." : "There are currently no active projects linked to your account."}
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3 }}>
          {filteredProjects.map((proj, idx) => {
            const theme = PASTEL_THEMES[idx % PASTEL_THEMES.length];
            const progress = proj.progressPercentage ?? 0;
            const isCompleted = proj.status?.toUpperCase() === "COMPLETED";

            return (
              <Card
                key={proj.id}
                onClick={() => navigate(`/projects/${proj.id}`)}
                sx={{
                  bgcolor: theme.bg,
                  borderRadius: "28px",
                  border: `1.5px solid ${theme.border}`,
                  p: 3,
                  cursor: "pointer",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    transform: "translateY(-4px)",
                    boxShadow: "0 20px 35px -10px rgba(0,0,0,0.09)",
                    borderColor: "#0f172a",
                  },
                }}
              >
                <CardContent sx={{ p: 0, "&:last-child": { pb: 0 }, display: "flex", flexDirection: "column", height: "100%" }}>
                  {/* Top Bar: Geometric Icon & Code */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2.5 }}>
                    <GeometricBadge type={theme.badgeShape} size={44} />
                    <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                      <Chip
                        label={proj.projectCode || `PRJ-${proj.id}`}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.72rem",
                          bgcolor: "rgba(255,255,255,0.85)",
                          color: "#0f172a",
                          border: "1px solid rgba(0,0,0,0.06)",
                        }}
                      />
                      <Chip
                        label={isCompleted ? "Completed" : "In Progress"}
                        size="small"
                        sx={{
                          fontWeight: 800,
                          fontSize: "0.72rem",
                          bgcolor: isCompleted ? "#0f172a" : "rgba(255,255,255,0.9)",
                          color: isCompleted ? "#fff" : "#0f172a",
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Title & Description */}
                  <Typography variant="h6" fontWeight={900} color="#0f172a" letterSpacing="-0.02em" sx={{ mb: 1, lineHeight: 1.3 }}>
                    {proj.projectName}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      mb: 3,
                      flexGrow: 1,
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {proj.description || "Custom digital product architecture, user experience design and full-stack cloud implementation."}
                  </Typography>

                  {/* Progress Stats */}
                  <Box sx={{ mb: 2.5, bgcolor: "rgba(255,255,255,0.7)", p: 2, borderRadius: "20px", border: "1px solid rgba(0,0,0,0.04)" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1 }}>
                      <Typography variant="caption" fontWeight={800} color="#0f172a">
                        Delivery Phase
                      </Typography>
                      <Typography variant="caption" fontWeight={900} color="#0f172a">
                        {progress}%
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={progress}
                      sx={{
                        height: 7,
                        borderRadius: 4,
                        bgcolor: "rgba(0,0,0,0.08)",
                        "& .MuiLinearProgress-bar": { bgcolor: "#0f172a", borderRadius: 4 },
                      }}
                    />
                  </Box>

                  {/* Action Link Footer */}
                  <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                      <AssignmentTurnedInOutlinedIcon sx={{ fontSize: 16 }} />
                      Tasks & Milestones
                    </Typography>
                    <Box
                      sx={{
                        width: 34,
                        height: 34,
                        borderRadius: "50%",
                        bgcolor: "#0f172a",
                        color: "#fff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        transition: "transform 0.2s ease",
                        "&:hover": { transform: "translateX(3px)" },
                      }}
                    >
                      <ArrowForwardIcon sx={{ fontSize: 16 }} />
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}
    </Box>
  );
}
