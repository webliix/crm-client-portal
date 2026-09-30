import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import { tokens } from "../theme/tokens";
import { projectApi, type ClientProject } from "../services/projectApi";
import { BrandLoader } from "../components/common/BrandLoader";
import { ClientCardSkeleton } from "../components/common/ClientSkeleton";

export default function ClientProjectsPage() {
  const navigate = useNavigate();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    projectApi.getMyProjects().then((data) => {
      setProjects(data);
      setLoading(false);
    });
  }, []);

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
          My Assigned Projects
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Track project completion %, milestone phases, interactive tasks, and communicate updates directly.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ py: 2 }}>
          <BrandLoader message="Fetching project deliverables..." size="medium" />
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3, mt: 3 }}>
            <ClientCardSkeleton />
            <ClientCardSkeleton />
            <ClientCardSkeleton />
          </Box>
        </Box>
      ) : projects.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center", borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <FolderSpecialOutlinedIcon sx={{ fontSize: 56, color: tokens.colors.secondary[300], mb: 2 }} />
          <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[800]} gutterBottom>
            No Projects Assigned
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: "auto" }}>
            There are currently no active projects linked to your client portal account.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3 }}>
          {projects.map((proj) => (
            <Card
              key={proj.id}
              sx={{
                borderRadius: tokens.borderRadius.lg,
                border: `1px solid ${tokens.colors.secondary[200]}`,
                boxShadow: tokens.shadows.sm,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                transition: "transform 0.2s ease, box-shadow 0.2s ease",
                "&:hover": { transform: "translateY(-3px)", boxShadow: tokens.shadows.md },
              }}
            >
              <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", height: "100%" }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Chip
                    label={proj.projectCode || `PRJ-${proj.id}`}
                    size="small"
                    sx={{ fontWeight: 800, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary.main }}
                  />
                  <Chip
                    label={proj.status || "In Progress"}
                    size="small"
                    color={proj.status === "COMPLETED" ? "success" : "primary"}
                    sx={{ fontWeight: 700 }}
                  />
                </Box>

                <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
                  {proj.projectName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, flexGrow: 1, minHeight: 48, lineHeight: 1.5 }}>
                  {proj.description || "Webliix Custom Engineering & Application Deliverable."}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                      Delivery Completion
                    </Typography>
                    <Typography variant="caption" fontWeight={800} color={tokens.colors.primary.main}>
                      {proj.progressPercentage ?? 0}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={proj.progressPercentage ?? 0}
                    sx={{ height: 8, borderRadius: 4, bgcolor: tokens.colors.secondary[100] }}
                  />
                </Box>

                <Button
                  fullWidth
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  sx={{ borderRadius: tokens.borderRadius.md, fontWeight: 700 }}
                >
                  View Milestones & Submit Instructions
                </Button>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
