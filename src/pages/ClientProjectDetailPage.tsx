import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import LinearProgress from "@mui/material/LinearProgress";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import { tokens } from "../theme/tokens";
import {
  projectApi,
  type ClientProject,
  type ClientMilestone,
  type ClientComment,
} from "../services/projectApi";
import { BrandLoader } from "../components/common/BrandLoader";

export default function ClientProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ClientProject | null>(null);
  const [milestones, setMilestones] = useState<ClientMilestone[]>([]);
  const [comments, setComments] = useState<ClientComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [newInstruction, setNewInstruction] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    Promise.all([
      projectApi.getProjectDetails(id),
      projectApi.getMilestones(id),
      projectApi.getComments(id),
    ]).then(([p, m, c]) => {
      setProject(p);
      setMilestones(m);
      setComments(c);
      setLoading(false);
    });
  }, [id]);

  const handleSend = async () => {
    if (!id || !newInstruction.trim()) return;
    setSubmitting(true);
    const added = await projectApi.addInstruction(id, newInstruction.trim());
    if (added) {
      setComments((prev) => [added, ...prev]);
    } else {
      setComments((prev) => [
        {
          id: Date.now(),
          authorName: "You (Client)",
          comment: newInstruction.trim(),
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setNewInstruction("");
    setSubmitting(false);
  };

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2.5, md: 4 } }}>
        <BrandLoader message="Loading project details & milestones..." size="medium" />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error" fontWeight={700}>
          Project Not Found
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          The requested project record could not be loaded.
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/projects")} sx={{ mt: 2, fontWeight: 700 }}>
          Back to My Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/projects")} sx={{ mb: 3, fontWeight: 700 }}>
        Back to My Projects
      </Button>

      {/* Hero Header Card */}
      <Card
        sx={{
          borderRadius: tokens.borderRadius.lg,
          mb: 4,
          border: `1px solid ${tokens.colors.primary[200]}`,
          background: `linear-gradient(135deg, ${tokens.colors.primary[50]} 0%, #ffffff 100%)`,
          boxShadow: tokens.shadows.sm,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Box>
              <Chip
                label={project.projectCode || `PRJ-${project.id}`}
                sx={{ mb: 1.5, fontWeight: 800, bgcolor: tokens.colors.primary[100], color: tokens.colors.primary.main }}
              />
              <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]}>
                {project.projectName}
              </Typography>
            </Box>
            <Chip
              label={project.status || "Active"}
              color={project.status === "COMPLETED" ? "success" : "primary"}
              sx={{ fontWeight: 700, height: 32, px: 1 }}
            />
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 800, lineHeight: 1.6 }}>
            {project.description || "Webliix Custom Application & Website Engineering."}
          </Typography>

          <Box sx={{ bgcolor: "#ffffff", p: 3, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.secondary[200]}` }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} color={tokens.colors.secondary[800]}>
                Project Delivery Completion
              </Typography>
              <Typography variant="subtitle2" fontWeight={800} color={tokens.colors.primary.main}>
                {project.progressPercentage ?? 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progressPercentage ?? 0}
              sx={{ height: 10, borderRadius: 5, bgcolor: tokens.colors.secondary[100] }}
            />
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" }, gap: 4 }}>
        {/* Milestones Timeline */}
        <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <FlagOutlinedIcon color="primary" />
              <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]}>
                Project Milestones
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            {milestones.length === 0 ? (
              <Box sx={{ p: 3, textAlign: "center", bgcolor: tokens.colors.secondary[50], borderRadius: tokens.borderRadius.md }}>
                <Typography variant="body2" color="text.secondary">
                  Milestones are currently being arranged by your Webliix project manager.
                </Typography>
              </Box>
            ) : (
              <Box sx={{ display: "grid", gap: 2 }}>
                {milestones.map((m) => (
                  <Box
                    key={m.id}
                    sx={{
                      p: 2.5,
                      borderRadius: tokens.borderRadius.md,
                      bgcolor: tokens.colors.secondary[50],
                      border: `1px solid ${tokens.colors.secondary[200]}`,
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                      <CheckCircleOutlinedIcon color={m.status === "COMPLETED" ? "success" : "disabled"} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={700} color={tokens.colors.secondary[900]}>
                          {m.milestoneName}
                        </Typography>
                        {m.description && (
                          <Typography variant="caption" color="text.secondary" display="block">
                            {m.description}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                    {m.dueDate && (
                      <Chip
                        label={`Due: ${new Date(m.dueDate).toLocaleDateString()}`}
                        size="small"
                        variant="outlined"
                        sx={{ fontWeight: 600 }}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Client Instructions & Messages */}
        <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}`, boxShadow: tokens.shadows.sm }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <ForumOutlinedIcon color="primary" />
              <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]}>
                Submit Instructions & Updates
              </Typography>
            </Box>
            <Divider sx={{ mb: 2.5 }} />

            <Box sx={{ mb: 3 }}>
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder="Type your design feedback, feature request, or instructions for the developers..."
                value={newInstruction}
                onChange={(e) => setNewInstruction(e.target.value)}
                sx={{ mb: 1.5 }}
              />
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                disabled={!newInstruction.trim() || submitting}
                onClick={handleSend}
                sx={{ fontWeight: 700, borderRadius: tokens.borderRadius.md }}
              >
                {submitting ? "Sending..." : "Send Instruction"}
              </Button>
            </Box>

            <Box sx={{ display: "grid", gap: 2, maxHeight: 380, overflowY: "auto" }}>
              {comments.length === 0 ? (
                <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic" }}>
                  No instructions or updates recorded yet. Write your first update above.
                </Typography>
              ) : (
                comments.map((c) => (
                  <Box
                    key={c.id}
                    sx={{
                      p: 2,
                      borderRadius: tokens.borderRadius.md,
                      bgcolor: tokens.colors.secondary[50],
                      border: `1px solid ${tokens.colors.secondary[200]}`,
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                      <Typography variant="subtitle2" fontWeight={700} color={tokens.colors.primary.main}>
                        {c.authorName || "Client Instruction"}
                      </Typography>
                      {c.createdAt && (
                        <Typography variant="caption" color="text.secondary">
                          {new Date(c.createdAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                    <Typography variant="body2" color={tokens.colors.secondary[800]} sx={{ lineHeight: 1.5 }}>
                      {c.comment}
                    </Typography>
                  </Box>
                ))
              )}
            </Box>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
