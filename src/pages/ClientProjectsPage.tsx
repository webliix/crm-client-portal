import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import { tokens } from "../theme/tokens";
import { projectApi, type ClientProject } from "../services/projectApi";

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
          Track project completion %, milestones, tasks, and communicate directly with developers.
        </Typography>
      </Box>

      {loading ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress size={40} sx={{ color: tokens.colors.primary.main }} />
        </Box>
      ) : projects.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center", borderRadius: tokens.borderRadius.lg }}>
          <FolderSpecialOutlinedIcon sx={{ fontSize: 48, color: tokens.colors.secondary[300], mb: 1.5 }} />
          <Typography variant="h6" fontWeight={700}>
            No Projects Found
          </Typography>
          <Typography variant="body2" color="text.secondary">
            No active project deliverables are linked to your account.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)", lg: "repeat(3, 1fr)" }, gap: 3 }}>
          {projects.map((proj) => (
            <Card key={proj.id} sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
                  <Chip label={proj.projectCode || `PRJ-${proj.id}`} size="small" sx={{ fontWeight: 700 }} />
                  <Chip label={proj.status || "In Progress"} size="small" color="primary" />
                </Box>

                <Typography variant="h6" fontWeight={700} color={tokens.colors.secondary[900]} gutterBottom>
                  {proj.projectName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3, minHeight: 48 }}>
                  {proj.description || "Webliix Custom Development Deliverable."}
                </Typography>

                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" fontWeight={700}>
                      Progress
                    </Typography>
                    <Typography variant="caption" fontWeight={800} color={tokens.colors.primary.main}>
                      {proj.progressPercentage ?? 0}%
                    </Typography>
                  </Box>
                  <LinearProgress variant="determinate" value={proj.progressPercentage ?? 0} sx={{ height: 8, borderRadius: 4 }} />
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
