import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Snackbar from "@mui/material/Snackbar";
import CircularProgress from "@mui/material/CircularProgress";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import RocketLaunchOutlinedIcon from "@mui/icons-material/RocketLaunchOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import CloudDoneOutlinedIcon from "@mui/icons-material/CloudDoneOutlined";
import SmartphoneOutlinedIcon from "@mui/icons-material/SmartphoneOutlined";
import SendIcon from "@mui/icons-material/Send";
import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { ticketApi } from "../services/ticketApi";
import { offerApi, type ClientOffer } from "../services/offerApi";

interface OfferDisplayItem {
  id: string | number;
  badge: string;
  badgeColor: "primary" | "secondary" | "success" | "warning";
  title: string;
  discount: string;
  code: string;
  description: string;
  features: string[];
  expiresAt: string;
}

const FALLBACK_OFFERS: OfferDisplayItem[] = [
  {
    id: "ai-copilot",
    badge: "Most Popular",
    badgeColor: "primary",
    title: "AI Integration & Workflow Copilot",
    discount: "25% OFF Retainer",
    code: "WEBLIIX-AI-25",
    description: "Add generative AI search, automated customer intake assistants, and intelligent document indexing to your existing platform.",
    features: [
      "Custom LLM fine-tuning or RAG pipelines",
      "Seamless integration with your existing database",
      "Private deployment & strict data residency",
      "Dedicated AI architect consultation",
    ],
    expiresAt: "November 30, 2026",
  },
  {
    id: "cloud-optimization",
    badge: "Cost Saver",
    badgeColor: "success",
    title: "Cloud Infrastructure & DevOps Optimization",
    discount: "$1,200 Credit",
    code: "CLOUD-OPTIM-30",
    description: "Audit your AWS, GCP, or Azure infrastructure for cost leaks, enhance CI/CD delivery pipelines, and configure auto-scaling.",
    features: [
      "Infrastructure cost audit & reduction plan",
      "Zero-downtime containerized CI/CD pipelines",
      "Multi-region automated disaster recovery",
      "24/7 cloud monitoring & telemetry alerts",
    ],
    expiresAt: "December 15, 2026",
  },
  {
    id: "security-audit",
    badge: "Enterprise Grade",
    badgeColor: "secondary",
    title: "SOC 2 & Penetration Testing Package",
    discount: "Free Compliance Review",
    code: "SEC-AUDIT-2026",
    description: "Comprehensive vulnerability assessment, automated dependency scanning, and compliance roadmapping for enterprise readiness.",
    features: [
      "Full OWASP Top 10 web & API pen test",
      "Automated secret scanning & CVE mitigation",
      "Executive security compliance report",
      "Actionable remediation patch guidance",
    ],
    expiresAt: "December 31, 2026",
  },
  {
    id: "mobile-booster",
    badge: "New Expansion",
    badgeColor: "warning",
    title: "Cross-Platform Mobile App Companion",
    discount: "20% OFF Development",
    code: "MOBILE-EXPAND-20",
    description: "Extend your Webliix web application into iOS and Android with React Native / Flutter featuring native offline support.",
    features: [
      "Shared backend APIs and authentication",
      "Push notification architecture via FCM/APNS",
      "App Store & Google Play submission management",
      "Cross-platform responsive design fidelity",
    ],
    expiresAt: "November 15, 2026",
  },
];

export default function ClientOffersPage() {
  const [offers, setOffers] = useState<OfferDisplayItem[]>(FALLBACK_OFFERS);
  const [loading, setLoading] = useState(true);
  const [claimModalOpen, setClaimModalOpen] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<OfferDisplayItem | null>(null);
  const [claimNotes, setClaimNotes] = useState("");
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [snackbarMsg, setSnackbarMsg] = useState<string | null>(null);

  useEffect(() => {
    offerApi.getActiveOffers().then((data) => {
      if (data && data.length > 0) {
        const formatted: OfferDisplayItem[] = data.map((d) => ({
          id: d.id,
          badge: d.badge || "Special Deal",
          badgeColor: (d.badgeColor as any) || "primary",
          title: d.title,
          discount: d.discount,
          code: d.code,
          description: d.description || "",
          features: d.features
            ? d.features.split("\n").filter((f) => f.trim().length > 0)
            : ["Full service scoping", "Direct engineer consultation", "Priority implementation queue"],
          expiresAt: d.expiresAt || "Ongoing / Limited Time",
        }));
        setOffers(formatted);
      }
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });
  }, []);

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setSnackbarMsg(`Promo code "${code}" copied to clipboard!`);
  };

  const handleOpenClaimModal = (offer: OfferDisplayItem) => {
    setSelectedOffer(offer);
    setClaimNotes(`Hi Webliix Team, I would like to claim the "${offer.title}" offer (Code: ${offer.code}) for our account.`);
    setClaimModalOpen(true);
  };

  const handleSubmitClaim = async () => {
    if (!selectedOffer) return;
    setSubmittingClaim(true);
    try {
      await ticketApi.createTicket(
        `Offer Claim: ${selectedOffer.title} [${selectedOffer.code}]`,
        claimNotes
      );
      setClaimModalOpen(false);
      setSnackbarMsg(`Your request for "${selectedOffer.title}" has been submitted to your account manager!`);
    } catch {
      setSnackbarMsg("Failed to submit request. Please try again or open a support ticket.");
    } finally {
      setSubmittingClaim(false);
    }
  };

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      {/* Page Header Banner */}
      <Card
        sx={{
          borderRadius: tokens.borderRadius.xl,
          border: `1px solid ${tokens.colors.primary[200]}`,
          mb: 4,
          background: `linear-gradient(135deg, ${tokens.colors.primary[50]} 0%, #ffffff 50%, ${tokens.colors.primary[100]} 100%)`,
          boxShadow: tokens.shadows.md,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4.5 } }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
            <LocalOfferOutlinedIcon sx={{ color: tokens.colors.primary.main, fontSize: 24 }} />
            <Typography variant="caption" fontWeight={800} color="primary" textTransform="uppercase" letterSpacing="0.08em">
              Exclusive Client Perks & Service Upgrades
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
            Special Offers & Expansion Bundles
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 750, lineHeight: 1.6 }}>
            Exclusive discounts and modernization packages available to active Webliix partners. Apply promo codes to your upcoming milestones or claim an offer to schedule scoping directly with your engineering lead.
          </Typography>
        </CardContent>
      </Card>

      {/* Offers Grid */}
      {loading ? (
        <Box sx={{ py: 6, display: "flex", justifyContent: "center" }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
          {offers.map((offer) => {
            return (
              <Box key={offer.id}>
                <Card
                  sx={{
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    borderRadius: tokens.borderRadius.lg,
                    border: `1px solid ${tokens.colors.secondary[200]}`,
                    boxShadow: tokens.shadows.sm,
                    transition: "all 0.25s ease",
                    "&:hover": {
                      transform: "translateY(-4px)",
                      boxShadow: tokens.shadows.lg,
                      borderColor: tokens.colors.primary[300],
                    },
                  }}
                >
                  <CardContent sx={{ p: 3.5, flex: 1, display: "flex", flexDirection: "column" }}>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 2 }}>
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: tokens.borderRadius.md,
                          bgcolor: `${tokens.colors.primary[50]}`,
                          color: tokens.colors.primary.main,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <LocalOfferOutlinedIcon fontSize="medium" />
                      </Box>
                      <Chip
                        label={offer.badge}
                        color={offer.badgeColor}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: "0.75rem" }}
                      />
                    </Box>

                  <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
                    {offer.title}
                  </Typography>

                  <Box sx={{ display: "flex", alignItems: "baseline", gap: 1, mb: 1.5 }}>
                    <Typography variant="h5" fontWeight={900} color="primary.main">
                      {offer.discount}
                    </Typography>
                  </Box>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                    {offer.description}
                  </Typography>

                  {/* Features List */}
                  <Box sx={{ mb: 3, display: "flex", flexDirection: "column", gap: 1 }}>
                    {offer.features.map((feat, idx) => (
                      <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <CheckCircleOutlineIcon sx={{ color: "success.main", fontSize: 18, mt: 0.2 }} />
                        <Typography variant="body2" color={tokens.colors.secondary[800]}>
                          {feat}
                        </Typography>
                      </Box>
                    ))}
                  </Box>

                  <Box sx={{ mt: "auto" }}>
                    {/* Promo Code Box */}
                    <Box
                      sx={{
                        p: 1.5,
                        borderRadius: tokens.borderRadius.md,
                        bgcolor: "action.hover",
                        border: "1px dashed",
                        borderColor: "divider",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        mb: 2,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" color="text.secondary" fontWeight={700}>
                          PROMO CODE:
                        </Typography>
                        <Typography variant="body2" fontWeight={800} sx={{ fontFamily: "monospace", letterSpacing: "0.05em" }}>
                          {offer.code}
                        </Typography>
                      </Box>
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<ContentCopyIcon fontSize="small" />}
                        onClick={() => handleCopyCode(offer.code)}
                        sx={{ fontSize: "0.75rem", fontWeight: 700 }}
                      >
                        Copy
                      </Button>
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                      <Typography variant="caption" color="text.secondary">
                        Valid until: <strong>{offer.expiresAt}</strong>
                      </Typography>
                      <Button
                        variant="contained"
                        startIcon={<RocketLaunchOutlinedIcon />}
                        onClick={() => handleOpenClaimModal(offer)}
                        sx={{ fontWeight: 800, textTransform: "none" }}
                      >
                        Claim Offer / Request Scope
                      </Button>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
          );
        })}
      </Box>
      )}

      {/* Claim Offer Dialog */}
      <Dialog
        open={claimModalOpen}
        onClose={() => !submittingClaim && setClaimModalOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800 }}>
          Claim Offer: {selectedOffer?.title}
        </DialogTitle>
        <DialogContent sx={{ display: "flex", flexDirection: "column", gap: 2.5, pt: "16px !important" }}>
          <Alert severity="info" sx={{ fontWeight: 600 }}>
            Applying Promo Code: <strong>{selectedOffer?.code}</strong> ({selectedOffer?.discount})
          </Alert>
          <Typography variant="body2" color="text.secondary">
            Provide any specific project requirements or goals for your account manager. We will schedule a scoping session and apply the discount to your statement.
          </Typography>
          <TextField
            multiline
            rows={4}
            fullWidth
            label="Additional Notes / Scope Requirements"
            value={claimNotes}
            onChange={(e) => setClaimNotes(e.target.value)}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setClaimModalOpen(false)} disabled={submittingClaim}>
            Cancel
          </Button>
          <Button
            variant="contained"
            onClick={handleSubmitClaim}
            disabled={submittingClaim || !claimNotes.trim()}
            startIcon={<SendIcon />}
            sx={{ fontWeight: 800 }}
          >
            {submittingClaim ? "Submitting..." : "Confirm & Send to Account Team"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar feedback */}
      <Snackbar
        open={!!snackbarMsg}
        autoHideDuration={4000}
        onClose={() => setSnackbarMsg(null)}
        message={snackbarMsg}
      />
    </Box>
  );
}
