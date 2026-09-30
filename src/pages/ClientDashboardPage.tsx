import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { projectApi, type ClientProject } from "../services/projectApi";
import { invoiceApi } from "../services/invoiceApi";
import { ticketApi } from "../services/ticketApi";

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

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      {/* Welcome Banner */}
      <Card
        sx={{
          borderRadius: tokens.borderRadius.xl,
          border: `1px solid ${tokens.colors.secondary[200]}`,
          mb: 4,
          background: `linear-gradient(135deg, #ffffff 0%, ${tokens.colors.primary[50]} 100%)`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
            Welcome, {user?.name || "Valued Client"}!
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, lineHeight: 1.6 }}>
            Here is your live project delivery, invoice billing, and support ticket overview on <strong>login.webliix.com</strong>.
          </Typography>
        </CardContent>
      </Card>

      {/* KPI Overview Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 3, mb: 4 }}>
        <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: tokens.borderRadius.md, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary.main }}>
              <FolderSpecialOutlinedIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                Active Projects
              </Typography>
              <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]}>
                {projects.length}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: tokens.borderRadius.md, bgcolor: tokens.colors.success[50], color: tokens.colors.success.main }}>
              <ReceiptLongOutlinedIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                Total Invoices
              </Typography>
              <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]}>
                {invoicesCount}
              </Typography>
            </Box>
          </CardContent>
        </Card>

        <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
            <Box sx={{ p: 1.5, borderRadius: tokens.borderRadius.md, bgcolor: tokens.colors.warning[50], color: tokens.colors.warning.main }}>
              <ConfirmationNumberOutlinedIcon fontSize="large" />
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                Support Tickets
              </Typography>
              <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]}>
                {ticketsCount}
              </Typography>
            </Box>
          </CardContent>
        </Card>
      </Box>

      {/* Projects Quick View */}
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
        <Typography variant="h6" fontWeight={700} color={tokens.colors.secondary[900]}>
          Your Active Projects
        </Typography>
        <Button endIcon={<ArrowForwardIcon />} onClick={() => navigate("/projects")} sx={{ fontWeight: 700 }}>
          View All Projects
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <CircularProgress size={36} sx={{ color: tokens.colors.primary.main }} />
        </Box>
      ) : projects.length === 0 ? (
        <Card sx={{ p: 4, textAlign: "center", borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <Typography variant="body2" color="text.secondary">
            No projects currently assigned to your account.
          </Typography>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
          {projects.slice(0, 2).map((proj) => (
            <Card key={proj.id} sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}`, p: 3 }}>
              <Typography variant="subtitle1" fontWeight={700} color={tokens.colors.secondary[900]} gutterBottom>
                {proj.projectName}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                {proj.description || "Website and application development deliverables."}
              </Typography>
              <Button size="small" variant="outlined" onClick={() => navigate(`/projects/${proj.id}`)}>
                View Milestone Progress
              </Button>
            </Card>
          ))}
        </Box>
      )}
    </Box>
  );
}
