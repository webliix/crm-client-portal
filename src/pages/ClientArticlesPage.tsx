import React, { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Alert from "@mui/material/Alert";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";

// Icons
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { tokens } from "../theme/tokens";
import { articleApi, type ClientArticle } from "../services/articleApi";
import { BrandLoader } from "../components/common/BrandLoader";
import { IsometricCubeIllustration } from "../components/common/PortalIllustrations";

export default function ClientArticlesPage() {
  const [articles, setArticles] = useState<ClientArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedArticle, setSelectedArticle] = useState<ClientArticle | null>(null);

  // Newsletter subscribe
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  useEffect(() => {
    articleApi
      .getPublishedArticles()
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setArticles(data);
        } else {
          // Curated default client articles & guidelines
          setArticles([
            {
              id: 1,
              title: "Product Guidelines: Webliix Enterprise Engineering Standard",
              slug: "product-guidelines-enterprise-standard",
              excerpt: "Explore the comprehensive design system, security protocols, and CI/CD pipelines applied to all client software builds.",
              category: "Guidelines",
              readTimeMinutes: 5,
              createdAt: new Date().toISOString(),
              coverImage: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=800&auto=format&fit=crop&q=60",
              content: `### Webliix Engineering Standards
All client projects deployed through Webliix Hub comply with strict architectural specifications:
1. **Zero-Trust Security**: End-to-end encryption for API keys and customer records.
2. **Speed & Core Web Vitals**: Target Largest Contentful Paint (LCP) under 1.2s on production CDN.
3. **Continuous Deployment**: Automated rollback mechanisms and containerized staging replicas.`,
            },
            {
              id: 2,
              title: "Cloud Infrastructure & High Availability Scaling in 2026",
              slug: "cloud-infrastructure-2026",
              excerpt: "How our dedicated multi-region deployments ensure 99.99% uptime for business applications.",
              category: "Cloud Architecture",
              readTimeMinutes: 7,
              createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
              coverImage: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60",
              content: `### High Availability Overview
We implement automated failovers across AWS, Cloudflare Enterprise CDN, and Google Cloud Run. Databases feature point-in-time recovery and continuous snapshots.`,
            },
            {
              id: 3,
              title: "SEO & Digital Performance Playbook for Modern Brands",
              slug: "seo-digital-performance-playbook",
              excerpt: "Key strategies for technical SEO, schema markup, and programmatic content scaling that drives organic traffic.",
              category: "Growth & SEO",
              readTimeMinutes: 4,
              createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
              coverImage: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
              content: `### Organic Growth Strategies
Optimizing semantic HTML structure, dynamic JSON-LD metadata, and server-side pre-rendering ensures rapid indexation by search engines.`,
            },
          ]);
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subscribeEmail.trim()) return;
    setSubscribing(true);
    const ok = await articleApi.subscribeNewsletter(subscribeEmail.trim());
    if (ok) {
      setSubscribeSuccess(true);
      setSubscribeEmail("");
    }
    setSubscribing(false);
  };

  if (loading) {
    return (
      <Box sx={{ py: 12, textAlign: "center" }}>
        <BrandLoader message="Loading articles & product guidelines..." size="medium" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
      {/* Featured Header Card with 3D Isometric Illustration */}
      <Card
        sx={{
          bgcolor: "#000000",
          color: "#ffffff",
          borderRadius: "24px",
          p: { xs: 3, md: 5 },
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 12px 32px rgba(0,0,0,0.25)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: { xs: -40, md: 20 },
            top: { xs: -20, md: -10 },
            width: { xs: 240, md: 360 },
            height: { xs: 200, md: 280 },
            pointerEvents: "none",
            opacity: { xs: 0.7, md: 0.95 },
          }}
        >
          <IsometricCubeIllustration width="100%" height="100%" />
        </Box>

        <Box sx={{ position: "relative", zIndex: 2, maxWidth: 640 }}>
          <Chip
            label="Articles & Guidelines"
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#ffffff", fontWeight: 800, mb: 1.5 }}
          />
          <Typography
            variant="h4"
            fontWeight={900}
            letterSpacing="-0.03em"
            sx={{ color: "#ffffff", fontSize: { xs: "1.6rem", md: "2.2rem" }, mb: 1.5 }}
          >
            Product Guidelines & Tech Newsletter
          </Typography>
          <Typography variant="body1" sx={{ color: "#94a3b8", lineHeight: 1.6, mb: 3 }}>
            Read published whitepapers, release notes, and engineering documentation maintained by Webliix for enterprise client partners.
          </Typography>

          <Button
            variant="contained"
            component="a"
            href="https://webliix.com/blog"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon fontSize="small" />}
            sx={{
              bgcolor: "#ffffff",
              color: "#000000",
              fontWeight: 800,
              borderRadius: "9999px",
              px: 3,
              py: 1.25,
              textTransform: "none",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            Visit Public Knowledge Base
          </Button>
        </Box>
      </Card>

      {/* Articles Grid */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
        {articles.map((item) => (
          <Card
            key={item.id}
            onClick={() => setSelectedArticle(item)}
            sx={{
              borderRadius: "20px",
              border: "1px solid #e2e8f0",
              bgcolor: "#ffffff",
              cursor: "pointer",
              overflow: "hidden",
              transition: "transform 0.2s ease, box-shadow 0.2s ease",
              "&:hover": {
                transform: "translateY(-3px)",
                boxShadow: "0 10px 24px -4px rgba(0,0,0,0.08)",
              },
            }}
          >
            {item.coverImage && (
              <CardMedia component="img" height="160" image={item.coverImage} alt={item.title} />
            )}
            <CardContent sx={{ p: 2.75 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Chip
                  label={item.category || "Documentation"}
                  size="small"
                  sx={{ bgcolor: "#f1f5f9", color: "#111827", fontWeight: 700, fontSize: "0.6875rem" }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94a3b8" }}>
                  <AccessTimeIcon sx={{ fontSize: 13 }} />
                  <Typography variant="caption">{item.readTimeMinutes || 5}m read</Typography>
                </Box>
              </Box>

              <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ fontSize: "1.05rem", lineHeight: 1.35, mb: 1 }}>
                {item.title}
              </Typography>

              <Typography
                variant="body2"
                color="#64748b"
                sx={{
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  fontSize: "0.8125rem",
                  lineHeight: 1.5,
                  mb: 2,
                }}
              >
                {item.excerpt || item.content?.slice(0, 140)}
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#111827" }}>
                <Typography variant="caption" fontWeight={800}>
                  Read Full Article
                </Typography>
                <ArrowForwardIcon sx={{ fontSize: 13 }} />
              </Box>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Newsletter Subscribe Box */}
      <Card
        sx={{
          p: { xs: 3, md: 4 },
          borderRadius: "20px",
          bgcolor: "#ede9fe",
          border: "1px solid #ddd6fe",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 3,
        }}
      >
        <Box sx={{ maxWidth: 520 }}>
          <Typography variant="h6" fontWeight={900} color="#0f172a" gutterBottom>
            Subscribe to Webliix Engineering Dispatch
          </Typography>
          <Typography variant="body2" color="#64748b">
            Receive monthly security summaries, feature releases, and cloud infrastructure tips directly in your inbox.
          </Typography>
          {subscribeSuccess && (
            <Alert severity="success" sx={{ mt: 1.5, borderRadius: "10px" }}>
              Thank you for subscribing! You will receive our next monthly dispatch.
            </Alert>
          )}
        </Box>

        <Box component="form" onSubmit={handleSubscribe} sx={{ display: "flex", gap: 1.5, minWidth: { xs: "100%", sm: 360 } }}>
          <TextField
            placeholder="Enter business email..."
            size="small"
            fullWidth
            type="email"
            required
            value={subscribeEmail}
            onChange={(e) => setSubscribeEmail(e.target.value)}
            sx={{ bgcolor: "#ffffff", borderRadius: "10px" }}
          />
          <Button
            type="submit"
            variant="contained"
            disabled={subscribing || !subscribeEmail.trim()}
            sx={{ bgcolor: "#111827", "&:hover": { bgcolor: "#1e293b" }, borderRadius: "10px", px: 3, fontWeight: 700 }}
          >
            {subscribing ? "..." : "Subscribe"}
          </Button>
        </Box>
      </Card>

      {/* Article Detail Modal */}
      <Dialog open={Boolean(selectedArticle)} onClose={() => setSelectedArticle(null)} maxWidth="md" fullWidth>
        {selectedArticle && (
          <>
            <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>{selectedArticle.title}</DialogTitle>
            <DialogContent dividers>
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 2 }}>
                <Chip label={selectedArticle.category || "Documentation"} size="small" />
                <Typography variant="caption" color="text.secondary">
                  Published: {new Date(selectedArticle.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
              <Typography variant="body1" sx={{ whiteSpace: "pre-wrap", lineHeight: 1.7, color: "#334155" }}>
                {selectedArticle.content || selectedArticle.excerpt}
              </Typography>
            </DialogContent>
            <DialogActions sx={{ p: 2 }}>
              <Button onClick={() => setSelectedArticle(null)} sx={{ fontWeight: 700 }}>
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
