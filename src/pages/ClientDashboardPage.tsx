import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import LinearProgress from "@mui/material/LinearProgress";
import Chip from "@mui/material/Chip";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SparklesIcon from "@mui/icons-material/AutoAwesome";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { projectApi, type ClientProject } from "../services/projectApi";
import { invoiceApi } from "../services/invoiceApi";
import { ticketApi } from "../services/ticketApi";
import { ClientDashboardSkeleton } from "../components/common/ClientSkeleton";
import { BrandLoader } from "../components/common/BrandLoader";

export default function ClientDashboardPage() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [invoicesCount, setInvoicesCount] = useState<number>(0);
  const [ticketsCount, setTicketsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    Promise.all([
      projectApi.getMyProjects(),
      invoiceApi.getMyInvoices(),
      ticketApi.getMyTickets(),
    ]).then(([pList, iList, tList]) => {
      setProjects(pList);
      setInvoicesCount(iList.length);
      setTicketsCount(tList.length);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <Box sx={{ p: { xs: 2.5, md: 4 } }}>
        <BrandLoader message="Loading your enterprise dashboard..." size="medium" />
        <Box sx={{ mt: 2 }}>
          <ClientDashboardSkeleton />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      {/* Premium Branded Welcome Banner */}
      <Card
        sx={{
          borderRadius: tokens.borderRadius.xl,
          border: `1px solid ${tokens.colors.primary[200]}`,
          mb: 4,
          background: `linear-gradient(135deg, ${tokens.colors.primary[50]} 0%, #ffffff 50%, ${tokens.colors.primary[100]} 100%)`,
          boxShadow: tokens.shadows.md,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <SparklesIcon sx={{ color: tokens.colors.primary.main, fontSize: 20 }} />
            <Typography variant="caption" fontWeight={800} color="primary" textTransform="uppercase" letterSpacing="0.08em">
              Client Delivery Portal • login.webliix.com
            </Typography>
          </Box>

          <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
            Welcome, {user?.name || "Valued Client"}!
          </Typography>

          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 720, lineHeight: 1.6 }}>
            Track active project progress, inspect milestones, view billing statements, and submit design or feature instructions directly to your Webliix engineering team.
          </Typography>
        </CardContent>
      </Card>

      {/* KPI Overview Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 3, mb: 4 }}>
        <Card
          onClick={() => navigate("/projects")}
          sx={{
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${tokens.colors.secondary[200]}`,
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: tokens.shadows.md, borderColor: tokens.colors.primary.main },
          }}
        >
          <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: tokens.borderRadius.md,
                bgcolor: tokens.colors.primary[50],
                color: tokens.colors.primary.main,
                display: "flex",
              }}
            >
              <FolderSpecialOutlinedIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">
                Active Projects
              </Typography>
              <Typography variant="h3" fontWeight={800} color={tokens.colors.secondary[900]}>
                {projects.length}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigate("/invoices")}
          sx={{
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${tokens.colors.secondary[200]}`,
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: tokens.shadows.md, borderColor: tokens.colors.success.main },
          }}
        >
          <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: tokens.borderRadius.md,
                bgcolor: tokens.colors.success[50],
                color: tokens.colors.success.main,
                display: "flex",
              }}
            >
              <ReceiptLongOutlinedIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">
                Billing Invoices
              </Typography>
              <Typography variant="h3" fontWeight={800} color={tokens.colors.secondary[900]}>
                {invoicesCount}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card
          onClick={() => navigate("/tickets")}
          sx={{
            borderRadius: tokens.borderRadius.lg,
            border: `1px solid ${tokens.colors.secondary[200]}`,
            cursor: "pointer",
            transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
            "&:hover": { transform: "translateY(-2px)", boxShadow: tokens.shadows.md, borderColor: tokens.colors.warning.main },
          }}
        >
          <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2.5 }}>
            <Box
              sx={{
                p: 2,
                borderRadius: tokens.borderRadius.md,
                bgcolor: tokens.colors.warning[50],
                color: tokens.colors.warning.main,
                display: "flex",
              }}
            >
              <ConfirmationNumberOutlinedIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase" letterSpacing="0.05em">
                Support Tickets
              </Typography>
              <Typography variant="h3" fontWeight={800} color={tokens.colors.secondary[900]}>
                {ticketsCount}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Projects Quick View Section */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2.5 }}>
        <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]}>
          Your Active Deliverables
        </Typography>
        <Button
          endIcon={<ArrowForwardIcon />}
          onClick={() => navigate("/projects")}
          sx={{ fontWeight: 700, borderRadius: tokens.borderRadius.sm }}
        >
          View All Projects
        </Button>
      </Box>

      {projects.length === 0 ? (
        <Card sx={{ p: 5, textAlign: "center", borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <Typography variant="body1" color="text.secondary" fontWeight={500}>
            No active deliverables currently assigned to your client account.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
          {projects.slice(0, 2).map((proj) => (
            <Card
              key={proj.id}
              sx={{
                borderRadius: tokens.borderRadius.lg,
                border: `1px solid ${tokens.colors.secondary[200]}`,
                p: 3,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: tokens.shadows.sm,
                transition: "box-shadow 0.2s ease",
                "&:hover": { boxShadow: tokens.shadows.md },
              }}
            >
              <Box sx={{ mb: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                  <Chip label={proj.projectCode || `PRJ-${proj.id}`} size="small" sx={{ fontWeight: 800, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary.main }} />
                  <Chip label={proj.status || "In Progress"} size="small" color="success" sx={{ fontWeight: 700 }} />
                </Box>
                <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
                  {proj.projectName}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40, lineHeight: 1.5 }}>
                  {proj.description || "High-performance software and cloud application delivery."}
                </Typography>
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    Overall Completion
                  </Typography>
                  <Typography variant="caption" fontWeight={800} color={tokens.colors.primary.main}>
                    {proj.progressPercentage ?? 0}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={proj.progressPercentage ?? 0}
                  sx={{ height: 8, borderRadius: 4, mb: 2.5, bgcolor: tokens.colors.secondary[100] }}
                />
                <Button
                  fullWidth
                  variant="outlined"
                  endIcon={<ArrowForwardIcon />}
                  onClick={() => navigate(`/projects/${proj.id}`)}
                  sx={{ borderRadius: tokens.borderRadius.md, fontWeight: 700 }}
                >
                  View Milestones & Instructions
                </Button>
              </Box>
            </Card>
          ))}
        </Box>
      )}

      {/* Offers & Platform Updates Highlights */}
      <Box sx={{ mt: 5 }}>
        <Typography variant="h5" fontWeight={800} color={tokens.colors.secondary[900]} sx={{ mb: 2.5 }}>
          Client Growth & Platform Status
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
          {/* Offers Card */}
          <Card
            sx={{
              borderRadius: tokens.borderRadius.lg,
              border: `1px solid ${tokens.colors.primary[200]}`,
              background: `linear-gradient(135deg, ${tokens.colors.primary[50]} 0%, #ffffff 100%)`,
              p: 3.5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: tokens.shadows.sm,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-2px)", boxShadow: tokens.shadows.md },
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: tokens.borderRadius.md,
                    bgcolor: tokens.colors.primary.main,
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <LocalOfferOutlinedIcon />
                </Box>
                <Chip label="Exclusive Deals" color="primary" size="small" sx={{ fontWeight: 800 }} />
              </Box>

              <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
                Special Offers & Modernization Credits
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 3 }}>
                Claim exclusive discounts on AI Workflow Copilot integration, Cloud DevOps optimization, and mobile app companion expansions.
              </Typography>
            </Box>

            <Button
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/offers")}
              sx={{ alignSelf: "flex-start", fontWeight: 700, borderRadius: tokens.borderRadius.md }}
            >
              Browse Special Offers
            </Button>
          </Card>

          {/* Live Support & Chat History Card */}
          <Card
            sx={{
              borderRadius: tokens.borderRadius.lg,
              border: `1px solid ${tokens.colors.secondary[200]}`,
              p: 3.5,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: tokens.shadows.sm,
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": { transform: "translateY(-2px)", boxShadow: tokens.shadows.md },
            }}
          >
            <Box>
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: tokens.borderRadius.md,
                    bgcolor: tokens.colors.primary[50],
                    color: tokens.colors.primary.main,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <ConfirmationNumberOutlinedIcon />
                </Box>
                <Chip label="24/7 Dedicated Support" color="info" size="small" sx={{ fontWeight: 800 }} />
              </Box>

              <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
                Live Support & Discussion History
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6, mb: 3 }}>
                Connect directly with your engineering leads, review prior ticket resolutions, and access complete project chat history at any time.
              </Typography>
            </Box>

            <Button
              variant="outlined"
              endIcon={<ArrowForwardIcon />}
              onClick={() => navigate("/tickets")}
              sx={{ alignSelf: "flex-start", fontWeight: 700, borderRadius: tokens.borderRadius.md }}
            >
              Open Support & Chat History
            </Button>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
