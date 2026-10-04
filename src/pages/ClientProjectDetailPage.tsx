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
import Avatar from "@mui/material/Avatar";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlinedIcon from "@mui/icons-material/CheckCircleOutlined";
import FlagOutlinedIcon from "@mui/icons-material/FlagOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import PictureAsPdfOutlinedIcon from "@mui/icons-material/PictureAsPdfOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CalendarTodayOutlinedIcon from "@mui/icons-material/CalendarTodayOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import AccountBalanceWalletOutlinedIcon from "@mui/icons-material/AccountBalanceWalletOutlined";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import { tokens } from "../theme/tokens";
import {
  projectApi,
  type ClientProject,
  type ClientMilestone,
  type ClientComment,
} from "../services/projectApi";
import { invoiceApi, type ProjectBillingSummary } from "../services/invoiceApi";
import { BrandLoader } from "../components/common/BrandLoader";

export default function ClientProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [project, setProject] = useState<ClientProject | null>(null);
  const [milestones, setMilestones] = useState<ClientMilestone[]>([]);
  const [comments, setComments] = useState<ClientComment[]>([]);
  const [billing, setBilling] = useState<ProjectBillingSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [newInstruction, setNewInstruction] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let isMounted = true;
    setLoading(true);

    Promise.all([
      projectApi.getProjectDetails(id),
      projectApi.getMilestones(id),
      projectApi.getComments(id),
      invoiceApi.getProjectBilling(id),
    ]).then(([proj, mls, cmts, bill]) => {
      if (isMounted) {
        setProject(proj);
        setMilestones(mls);
        setComments(cmts);
        setBilling(bill);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [id]);

  const handleSend = async () => {
    if (!id || !newInstruction.trim()) return;
    setSubmitting(true);
    const added = await projectApi.addInstruction(id, newInstruction.trim());
    if (added) {
      setComments((prev) => [added, ...prev]);
      setNewInstruction("");
    }
    setSubmitting(false);
  };

  // Structured PDF Download & Print Export
  const handleExportPDF = () => {
    if (!project) return;
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Webliix Project Documentation - ${project.projectName}</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1e293b; line-height: 1.6; }
          .header { border-bottom: 3px solid #6366f1; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 26px; font-weight: 800; color: #0f172a; margin: 0; }
          .subtitle { color: #64748b; font-size: 14px; margin-top: 5px; }
          .badge { display: inline-block; padding: 4px 12px; border-radius: 4px; font-size: 12px; font-weight: 700; background: #e0e7ff; color: #4338ca; }
          .section { margin-bottom: 30px; }
          .section-title { font-size: 16px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #4338ca; border-bottom: 1px solid #e2e8f0; padding-bottom: 8px; margin-bottom: 15px; }
          .meta-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; margin-bottom: 20px; }
          .meta-item { background: #f8fafc; padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; }
          .meta-label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
          .meta-value { font-size: 14px; font-weight: 700; color: #0f172a; margin-top: 2px; }
          .phase-item { padding: 12px; border-left: 4px solid #6366f1; background: #f8fafc; margin-bottom: 10px; border-radius: 0 6px 6px 0; }
          .phase-title { font-weight: 700; font-size: 14px; }
          .phase-desc { font-size: 12px; color: #64748b; margin-top: 2px; }
          .code-block { background: #0f172a; color: #f8fafc; padding: 15px; border-radius: 6px; font-family: monospace; font-size: 12px; white-space: pre-wrap; }
          .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; text-align: center; font-size: 12px; color: #94a3b8; }
        </style>
      </head>
      <body>
        <div class="header">
          <div>
            <h1 class="title">${project.projectName}</h1>
            <div class="subtitle">Official Project Architecture Blueprint & Specification Summary</div>
          </div>
          <div>
            <span class="badge">${project.projectCode || "PRJ-" + project.id}</span>
          </div>
        </div>

        <div class="section">
          <div class="section-title">Project Overview & Timeline</div>
          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">Client Account</div>
              <div class="meta-value">${project.customerName || project.customerCompanyName || "Valued Client"}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Overall Completion</div>
              <div class="meta-value">${project.progressPercentage ?? 0}% (${project.status})</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Initiation Date</div>
              <div class="meta-value">${project.startDate || "N/A"}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Expected Handover Date</div>
              <div class="meta-value">${project.expectedEndDate || project.dueDate || "N/A"}</div>
            </div>
          </div>
          <p>${project.description || "Website and web application development project with Webliix."}</p>
        </div>

        <div class="section">
          <div class="section-title">Lifecycle Phases & Milestones</div>
          ${milestones.map((m, idx) => `
            <div class="phase-item">
              <div class="phase-title">Phase ${idx + 1}: ${m.title || m.milestoneName} ${m.completed ? "(Completed)" : "(In Progress)"}</div>
              <div class="phase-desc">${m.description || "Scheduled project milestone"} - Target: ${m.dueDate || "N/A"}</div>
            </div>
          `).join("")}
        </div>

        <div class="section">
          <div class="section-title">Technical Architecture & Specifications</div>
          <div class="code-block">${project.architectureNotes || "Standard Webliix Cloud Microservices Architecture with Spring Boot REST Backend and React Single Page App."}</div>
        </div>

        <div class="section">
          <div class="section-title">Financial Status & Billing Statement</div>
          <div class="meta-grid">
            <div class="meta-item">
              <div class="meta-label">Contract Budget</div>
              <div class="meta-value">${billing?.budget ? `₹${billing.budget.toLocaleString()}` : "Custom Scope"}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Total Billed</div>
              <div class="meta-value">₹${(billing?.totalBilled ?? 0).toLocaleString()}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Total Paid</div>
              <div class="meta-value" style="color: #16a34a;">₹${(billing?.totalPaid ?? 0).toLocaleString()}</div>
            </div>
            <div class="meta-item">
              <div class="meta-label">Remaining Contract Balance</div>
              <div class="meta-value" style="color: #b45309;">₹${(billing?.remainingProjectBalance ?? 0).toLocaleString()}</div>
            </div>
          </div>
        </div>

        <div class="footer">
          Official Webliix Client Document &bull; noreply@webliix.com &bull; &copy; ${new Date().getFullYear()} Webliix
        </div>
        <script>
          window.onload = function() { window.print(); }
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  };

  if (loading) {
    return (
      <Box sx={{ py: 6, textAlign: "center" }}>
        <BrandLoader message="Loading your project deliverables & live progress..." size="medium" />
      </Box>
    );
  }

  if (!project) {
    return (
      <Box sx={{ p: 4, textAlign: "center" }}>
        <Typography variant="h6" color="error" gutterBottom>
          Project Not Found
        </Typography>
        <Button startIcon={<ArrowBackIcon />} onClick={() => navigate("/projects")} sx={{ mt: 2 }}>
          Back to Projects
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      {/* Top Bar */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, flexWrap: "wrap", gap: 2 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate("/projects")}
          sx={{ fontWeight: 700, color: tokens.colors.secondary[700] }}
        >
          Back to My Projects
        </Button>

        <Button
          variant="outlined"
          startIcon={<PictureAsPdfOutlinedIcon />}
          onClick={handleExportPDF}
          sx={{ fontWeight: 700, borderRadius: tokens.borderRadius.md }}
        >
          Download PDF Documentation
        </Button>
      </Box>

      {/* Hero Header Card */}
      <Card
        sx={{
          borderRadius: tokens.borderRadius.lg,
          border: `1px solid ${tokens.colors.secondary[200]}`,
          mb: 4,
          background: `linear-gradient(135deg, #ffffff 0%, ${tokens.colors.primary[50]} 100%)`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2, mb: 2 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Chip
                label={project.projectCode || `PRJ-${project.id}`}
                sx={{ bgcolor: tokens.colors.primary.main, color: "#ffffff", fontWeight: 800 }}
              />
              <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]}>
                {project.projectName}
              </Typography>
            </Box>

            <Chip
              label={project.status || "In Progress"}
              sx={{ bgcolor: tokens.colors.success[100], color: tokens.colors.success[700], fontWeight: 700, px: 1.5 }}
            />
          </Box>

          <Typography variant="body1" color="text.secondary" sx={{ mb: 3, maxWidth: 840, lineHeight: 1.7 }}>
            {project.description || "Website and application development deliverables."}
          </Typography>

          <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", mb: 3, p: 2, bgcolor: "#ffffff", borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.secondary[200]}` }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: tokens.colors.primary.main }} />
              <Typography variant="body2" color="text.secondary">
                Initiation Date: <strong>{project.startDate || "Active"}</strong>
              </Typography>
            </Box>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <CalendarTodayOutlinedIcon sx={{ fontSize: 18, color: tokens.colors.primary.main }} />
              <Typography variant="body2" color="text.secondary">
                Expected Handover: <strong>{project.expectedEndDate || project.dueDate || "N/A"}</strong>
              </Typography>
            </Box>
          </Box>

          {/* Progress Overview */}
          <Box sx={{ bgcolor: "#ffffff", p: 2.5, borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.secondary[200]}` }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
              <Typography variant="subtitle2" fontWeight={700} color={tokens.colors.secondary[800]}>
                Overall Development Progress
              </Typography>
              <Typography variant="subtitle2" fontWeight={800} color={tokens.colors.primary.main}>
                {project.progressPercentage ?? 0}%
              </Typography>
            </Box>
            <LinearProgress
              variant="determinate"
              value={project.progressPercentage ?? 0}
              sx={{
                height: 10,
                borderRadius: 5,
                bgcolor: tokens.colors.secondary[100],
                "& .MuiLinearProgress-bar": { borderRadius: 5, bgcolor: tokens.colors.primary.main },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Project Financials & Billing Status Card */}
      <Card
        sx={{
          borderRadius: tokens.borderRadius.lg,
          border: `1px solid ${tokens.colors.secondary[200]}`,
          mb: 4,
          boxShadow: tokens.shadows.sm,
        }}
      >
        <CardContent sx={{ p: { xs: 2.5, md: 3.5 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2, flexWrap: "wrap", gap: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <AccountBalanceWalletOutlinedIcon color="primary" />
              <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]}>
                Project Billing & Financial Status
              </Typography>
            </Box>
            {billing && (
              <Chip
                label={
                  billing.remainingProjectBalance === 0 && billing.totalBilled > 0
                    ? "Fully Settled"
                    : billing.totalPaid > 0
                    ? "Partially Paid"
                    : "Payment Pending"
                }
                color={
                  billing.remainingProjectBalance === 0 && billing.totalBilled > 0
                    ? "success"
                    : billing.totalPaid > 0
                    ? "info"
                    : "warning"
                }
                size="small"
                sx={{ fontWeight: 700 }}
              />
            )}
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Real-time financial status, approved invoices, payments recorded, and remaining contract bill.
          </Typography>

          {/* Metric Cards Grid */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(4, 1fr)" }, gap: 2, mb: 3 }}>
            <Box sx={{ p: 2, borderRadius: tokens.borderRadius.md, bgcolor: tokens.colors.secondary[50], border: `1px solid ${tokens.colors.secondary[200]}` }}>
              <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                Contract Budget
              </Typography>
              <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]} sx={{ mt: 0.5 }}>
                {billing?.budget ? `₹${billing.budget.toLocaleString()}` : "Custom Scope"}
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: tokens.borderRadius.md, bgcolor: tokens.colors.primary[50], border: `1px solid ${tokens.colors.primary[100]}` }}>
              <Typography variant="caption" fontWeight={700} color={tokens.colors.primary[700]} textTransform="uppercase">
                Total Invoiced
              </Typography>
              <Typography variant="h6" fontWeight={800} color={tokens.colors.primary.main} sx={{ mt: 0.5 }}>
                ₹{(billing?.totalBilled ?? 0).toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: tokens.borderRadius.md, bgcolor: tokens.colors.success[50], border: `1px solid ${tokens.colors.success[100]}` }}>
              <Typography variant="caption" fontWeight={700} color={tokens.colors.success[700]} textTransform="uppercase">
                Total Paid
              </Typography>
              <Typography variant="h6" fontWeight={800} color={tokens.colors.success[700]} sx={{ mt: 0.5 }}>
                ₹{(billing?.totalPaid ?? 0).toLocaleString()}
              </Typography>
            </Box>

            <Box sx={{ p: 2, borderRadius: tokens.borderRadius.md, bgcolor: tokens.colors.warning[50], border: `1px solid ${tokens.colors.warning[100]}` }}>
              <Typography variant="caption" fontWeight={700} color={tokens.colors.warning[700]} textTransform="uppercase">
                Remaining Balance
              </Typography>
              <Typography variant="h6" fontWeight={800} color={tokens.colors.warning[700]} sx={{ mt: 0.5 }}>
                ₹{(billing?.remainingProjectBalance ?? 0).toLocaleString()}
              </Typography>
              {billing && billing.pendingDueOnInvoices > 0 && (
                <Typography variant="caption" color="error.main" fontWeight={600} display="block">
                  (₹{billing.pendingDueOnInvoices.toLocaleString()} due on issued bills)
                </Typography>
              )}
            </Box>
          </Box>

          {/* Project Invoices Table */}
          {billing?.invoices && billing.invoices.length > 0 ? (
            <TableContainer sx={{ border: `1px solid ${tokens.colors.secondary[200]}`, borderRadius: tokens.borderRadius.md }}>
              <Table size="small">
                <TableHead sx={{ bgcolor: tokens.colors.secondary[100] }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Invoice #</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Issue Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Due Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Total Billed</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Paid</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Pending Due</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {billing.invoices.map((inv) => (
                    <TableRow key={inv.id} hover>
                      <TableCell sx={{ fontWeight: 700, color: tokens.colors.primary.main }}>
                        {inv.invoiceNumber}
                      </TableCell>
                      <TableCell>{inv.issueDate ? new Date(inv.issueDate).toLocaleDateString() : "—"}</TableCell>
                      <TableCell>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString() : "—"}</TableCell>
                      <TableCell sx={{ fontWeight: 700 }}>₹{(inv.totalAmount || 0).toLocaleString()}</TableCell>
                      <TableCell sx={{ color: tokens.colors.success[700], fontWeight: 600 }}>
                        ₹{(inv.paidAmount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ color: (inv.pendingAmount || 0) > 0 ? tokens.colors.warning[700] : "text.secondary", fontWeight: 600 }}>
                        ₹{(inv.pendingAmount || 0).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={inv.status}
                          size="small"
                          color={inv.status === "PAID" ? "success" : inv.status === "PARTIALLY_PAID" ? "info" : "warning"}
                          sx={{ fontWeight: 700, fontSize: "0.75rem" }}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          ) : (
            <Box sx={{ p: 2, textAlign: "center", bgcolor: tokens.colors.secondary[50], borderRadius: tokens.borderRadius.md, border: `1px dashed ${tokens.colors.secondary[300]}` }}>
              <Typography variant="body2" color="text.secondary">
                No invoices have been issued for this project yet. Invoices generated by your project team will appear here automatically.
              </Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" }, gap: 4 }}>
        {/* Milestones & Architecture Documentation */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Milestones */}
          <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2.5 }}>
                <FlagOutlinedIcon color="primary" />
                <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]}>
                  Project Lifecycle Phases & Milestones
                </Typography>
              </Box>
              <Divider sx={{ mb: 2.5 }} />

              {milestones.length === 0 ? (
                <Box sx={{ p: 3, textAlign: "center", bgcolor: tokens.colors.secondary[50], borderRadius: tokens.borderRadius.md }}>
                  <Typography variant="body2" color="text.secondary">
                    Milestones are currently being configured by your Webliix project manager.
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
                        bgcolor: m.completed ? tokens.colors.success[50] : tokens.colors.secondary[50],
                        border: `1px solid ${m.completed ? tokens.colors.success[100] : tokens.colors.secondary[200]}`,
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                        <CheckCircleOutlinedIcon color={m.completed ? "success" : "disabled"} />
                        <Box>
                          <Typography variant="subtitle2" fontWeight={700} color={tokens.colors.secondary[900]}>
                            {m.title || m.milestoneName}
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
                          label={`Target: ${new Date(m.dueDate).toLocaleDateString()}`}
                          size="small"
                          sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                        />
                      )}
                    </Box>
                  ))}
                </Box>
              )}
            </CardContent>
          </Card>

          {/* Documentation & Specifications Card */}
          <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
            <CardContent sx={{ p: 3 }}>
              <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
                Project Documentation & Architecture Blueprint
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Technical design, schema specifications, and documentation for your cloud deliverables.
              </Typography>
              <Divider sx={{ mb: 2.5 }} />

              <Box sx={{ p: 2, borderRadius: tokens.borderRadius.md, bgcolor: tokens.colors.secondary[50], border: `1px solid ${tokens.colors.secondary[200]}`, mb: 2 }}>
                <Typography variant="caption" fontWeight={700} color="text.secondary" textTransform="uppercase">
                  System Architecture Specifications
                </Typography>
                <Typography variant="body2" color={tokens.colors.secondary[900]} sx={{ mt: 0.5, whiteSpace: "pre-wrap" }}>
                  {project.architectureNotes || "Standard Webliix Microservices Architecture: Spring Boot REST Backend with React UI."}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
                {project.documentationUrl && (
                  <Button
                    variant="outlined"
                    startIcon={<OpenInNewIcon />}
                    href={project.documentationUrl}
                    target="_blank"
                    sx={{ fontWeight: 700, borderRadius: tokens.borderRadius.md }}
                  >
                    Open Live Documentation
                  </Button>
                )}

                <Button
                  variant="contained"
                  startIcon={<PictureAsPdfOutlinedIcon />}
                  onClick={handleExportPDF}
                  sx={{ fontWeight: 700, borderRadius: tokens.borderRadius.md }}
                >
                  Download Structured PDF
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Box>

        {/* Client Instructions & Communication */}
        <Box>
          <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
            <CardContent sx={{ p: 3 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <ForumOutlinedIcon color="primary" />
                <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]}>
                  Submit Instructions & Feedback
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

              <Box sx={{ display: "grid", gap: 2, maxHeight: 420, overflowY: "auto" }}>
                {comments.length === 0 ? (
                  <Typography variant="caption" color="text.secondary" sx={{ fontStyle: "italic", py: 2, textAlign: "center" }}>
                    No instructions or updates recorded yet. Write your first update above.
                  </Typography>
                ) : (
                  comments.map((c) => (
                    <Box
                      key={c.id}
                      sx={{
                        p: 2,
                        borderRadius: tokens.borderRadius.md,
                        bgcolor: c.authorRole === "CLIENT" ? tokens.colors.primary[50] : tokens.colors.secondary[50],
                        border: `1px solid ${c.authorRole === "CLIENT" ? tokens.colors.primary[100] : tokens.colors.secondary[200]}`,
                      }}
                    >
                      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                          <Avatar sx={{ width: 24, height: 24, fontSize: "0.7rem", bgcolor: c.authorRole === "CLIENT" ? tokens.colors.primary.main : tokens.colors.secondary[800] }}>
                            {(c.authorName || "C").charAt(0)}
                          </Avatar>
                          <Typography variant="subtitle2" fontWeight={700} color={tokens.colors.secondary[900]}>
                            {c.authorName || (c.authorRole === "CLIENT" ? "You (Client)" : "Webliix Team")}
                          </Typography>
                        </Box>
                        {c.createdAt && (
                          <Typography variant="caption" color="text.secondary">
                            {new Date(c.createdAt).toLocaleDateString()}
                          </Typography>
                        )}
                      </Box>
                      <Typography variant="body2" color={tokens.colors.secondary[800]} sx={{ lineHeight: 1.5, mt: 0.5 }}>
                        {c.message || c.comment}
                      </Typography>
                    </Box>
                  ))
                )}
              </Box>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}
