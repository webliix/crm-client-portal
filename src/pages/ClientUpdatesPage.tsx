import { useState } from "react";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import CampaignOutlinedIcon from "@mui/icons-material/CampaignOutlined";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import BuildCircleOutlinedIcon from "@mui/icons-material/BuildCircleOutlined";
import SecurityOutlinedIcon from "@mui/icons-material/SecurityOutlined";
import NewReleasesOutlinedIcon from "@mui/icons-material/NewReleasesOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { tokens } from "../theme/tokens";

interface UpdateItem {
  id: string;
  version: string;
  title: string;
  category: "RELEASE" | "SECURITY" | "FEATURE" | "MAINTENANCE";
  date: string;
  summary: string;
  highlights: string[];
  status: "LIVE" | "COMPLETED" | "SCHEDULED";
}

const PLATFORM_UPDATES: UpdateItem[] = [
  {
    id: "update-2-5-0",
    version: "v2.5.0",
    title: "Granular Project Deliverables & Real-Time Milestone Invoicing",
    category: "RELEASE",
    date: "October 07, 2026",
    summary: "Complete rollout of dedicated client portal invoice breakdowns, project team roster transparency, and live ticket synchronization.",
    highlights: [
      "Real-time breakdown of milestone invoices and contract budget balances directly in the client portal.",
      "Instant push notification emails dispatched upon milestone transitions.",
      "Encrypted document and deliverables file vault with 1-click cloud previews.",
      "Refined ticket submission workflow with direct live chat threads.",
    ],
    status: "LIVE",
  },
  {
    id: "update-sec-2026",
    version: "Security Patch 26.4",
    title: "Enhanced JWT Session Rotation & Multi-Factor Authentication",
    category: "SECURITY",
    date: "September 28, 2026",
    summary: "Enterprise security upgrade introducing hardened session validation, rate-limiting on sensitive endpoints, and automated audit trails.",
    highlights: [
      "Zero-trust credential verification on all client and employee portal routes.",
      "Strict TLS 1.3 encryption enforcement across all Webliix cloud APIs.",
      "Automated IP reputation checks and defense against automated credential stuffing.",
      "Enhanced tenant isolation ensuring data separation in multi-project environments.",
    ],
    status: "LIVE",
  },
  {
    id: "update-feat-portal",
    version: "Feature Drop 26.3",
    title: "Interactive Client Project Feedback & Change Request Submissions",
    category: "FEATURE",
    date: "September 15, 2026",
    summary: "Clients can now provide line-item comments on milestone deliverables and trigger automated review alerts for assigned lead engineers.",
    highlights: [
      "In-line design review comments with instant acknowledgment timestamps.",
      "One-click change request ticketing with automated priority tagging.",
      "Customizable email notification preferences for weekly executive summaries.",
      "Exportable project audit trails in professional branded PDF format.",
    ],
    status: "LIVE",
  },
  {
    id: "update-maint-db",
    version: "Infra Notice",
    title: "Scheduled Cloud Database Performance Tuning & Storage Optimization",
    category: "MAINTENANCE",
    date: "August 30, 2026",
    summary: "Completed cloud database maintenance window with zero service interruption. Enhanced read throughput by 42%.",
    highlights: [
      "Upgraded PostgreSQL query planner statistics and connection pooling.",
      "Migrated asset storage to high-bandwidth multi-region CDN clusters.",
      "Implemented automated hourly backup verification with instant failover testing.",
    ],
    status: "COMPLETED",
  },
];

export default function ClientUpdatesPage() {
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const categories = [
    { label: "All Updates", value: "ALL" },
    { label: "Releases", value: "RELEASE" },
    { label: "Features", value: "FEATURE" },
    { label: "Security", value: "SECURITY" },
    { label: "Maintenance", value: "MAINTENANCE" },
  ];

  const filteredUpdates = PLATFORM_UPDATES.filter((up) => {
    const matchesCategory = selectedCategory === "ALL" || up.category === selectedCategory;
    const matchesSearch =
      up.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      up.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      up.version.toLowerCase().includes(searchQuery.toLowerCase()) ||
      up.highlights.some((h) => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const getCategoryChip = (cat: UpdateItem["category"]) => {
    switch (cat) {
      case "RELEASE":
        return <Chip label="Product Release" color="primary" size="small" icon={<NewReleasesOutlinedIcon />} sx={{ fontWeight: 700 }} />;
      case "SECURITY":
        return <Chip label="Security & Trust" color="secondary" size="small" icon={<SecurityOutlinedIcon />} sx={{ fontWeight: 700 }} />;
      case "FEATURE":
        return <Chip label="New Feature" color="success" size="small" icon={<CheckCircleOutlineIcon />} sx={{ fontWeight: 700 }} />;
      case "MAINTENANCE":
        return <Chip label="Infrastructure" color="warning" size="small" icon={<BuildCircleOutlinedIcon />} sx={{ fontWeight: 700 }} />;
      default:
        return <Chip label={cat} size="small" />;
    }
  };

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      {/* Header Banner */}
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
            <CampaignOutlinedIcon sx={{ color: tokens.colors.primary.main, fontSize: 24 }} />
            <Typography variant="caption" fontWeight={800} color="primary" textTransform="uppercase" letterSpacing="0.08em">
              Webliix Platform Changelog & Service Status
            </Typography>
          </Box>
          <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
            Platform Updates & Announcements
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 750, lineHeight: 1.6 }}>
            Stay informed with the latest platform enhancements, architectural releases, security upgrades, and service status reports across the Webliix ecosystem.
          </Typography>
        </CardContent>
      </Card>

      {/* Filter and Search Bar */}
      <Card sx={{ p: 2.5, mb: 4, borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
        <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, gap: 2, alignItems: { md: "center" }, justifyContent: "space-between" }}>
          {/* Category Chips */}
          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
            {categories.map((cat) => (
              <Button
                key={cat.value}
                size="small"
                variant={selectedCategory === cat.value ? "contained" : "outlined"}
                onClick={() => setSelectedCategory(cat.value)}
                sx={{
                  borderRadius: 9999,
                  fontWeight: 700,
                  textTransform: "none",
                  px: 2,
                }}
              >
                {cat.label}
              </Button>
            ))}
          </Box>

          {/* Search Box */}
          <TextField
            size="small"
            placeholder="Search updates or changelog..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            sx={{ minWidth: { xs: "100%", md: 300 } }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" sx={{ color: "text.secondary" }} />
                </InputAdornment>
              ),
            }}
          />
        </Box>
      </Card>

      {/* Updates Timeline List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
        {filteredUpdates.length === 0 ? (
          <Card sx={{ p: 4, textAlign: "center", borderRadius: tokens.borderRadius.lg, border: "1px dashed", borderColor: "divider" }}>
            <InfoOutlinedIcon sx={{ fontSize: 40, color: "text.secondary", mb: 1 }} />
            <Typography variant="h6" fontWeight={700} color="text.secondary">
              No updates match your filter criteria
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Try selecting another category or clearing your search term.
            </Typography>
          </Card>
        ) : (
          filteredUpdates.map((item) => (
            <Card
              key={item.id}
              sx={{
                borderRadius: tokens.borderRadius.lg,
                border: `1px solid ${tokens.colors.secondary[200]}`,
                boxShadow: tokens.shadows.sm,
                transition: "all 0.2s ease",
                "&:hover": {
                  boxShadow: tokens.shadows.md,
                  borderColor: tokens.colors.primary[300],
                },
              }}
            >
              <CardContent sx={{ p: 3.5 }}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1.5, mb: 1.5 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                    <Chip
                      label={item.version}
                      sx={{
                        fontWeight: 800,
                        fontFamily: "monospace",
                        bgcolor: `${tokens.colors.primary[50]}`,
                        color: tokens.colors.primary.main,
                        border: `1px solid ${tokens.colors.primary[200]}`,
                      }}
                    />
                    {getCategoryChip(item.category)}
                  </Box>
                  <Typography variant="caption" fontWeight={700} color="text.secondary">
                    {item.date}
                  </Typography>
                </Box>

                <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]} sx={{ mb: 1 }}>
                  {item.title}
                </Typography>

                <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5, lineHeight: 1.6 }}>
                  {item.summary}
                </Typography>

                <Box sx={{ p: 2, borderRadius: tokens.borderRadius.md, bgcolor: "action.hover", border: "1px solid", borderColor: "divider" }}>
                  <Typography variant="caption" fontWeight={800} textTransform="uppercase" color="text.secondary" sx={{ display: "block", mb: 1 }}>
                    What&apos;s New & Highlights:
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                    {item.highlights.map((h, idx) => (
                      <Box key={idx} sx={{ display: "flex", alignItems: "flex-start", gap: 1 }}>
                        <CheckCircleOutlineIcon sx={{ color: "success.main", fontSize: 16, mt: 0.3 }} />
                        <Typography variant="body2" color={tokens.colors.secondary[800]}>
                          {h}
                        </Typography>
                      </Box>
                    ))}
                  </Box>
                </Box>
              </CardContent>
            </Card>
          ))
        )}
      </Box>
    </Box>
  );
}
