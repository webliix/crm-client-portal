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

// Icons
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { tokens } from "../theme/tokens";
import { articleApi, getExternalArticleUrl, type ClientArticle } from "../services/articleApi";
import { ClientFadeWebliixLoader } from "../components/common/ClientSkeleton";
import { IsometricCubeIllustration } from "../components/common/PortalIllustrations";

export default function ClientArticlesPage() {
  const [articles, setArticles] = useState<ClientArticle[]>([]);
  const [loading, setLoading] = useState(true);

  // Newsletter subscribe
  const [subscribeEmail, setSubscribeEmail] = useState("");
  const [subscribing, setSubscribing] = useState(false);
  const [subscribeSuccess, setSubscribeSuccess] = useState(false);

  useEffect(() => {
    articleApi
      .getPublishedArticles()
      .then((data) => {
        if (Array.isArray(data)) {
          setArticles(data);
        } else {
          setArticles([]);
        }
      })
      .catch(() => setArticles([]))
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

  const handleOpenExternal = (slug: string) => {
    const url = getExternalArticleUrl(slug);
    window.open(url, "_blank", "noopener,noreferrer");
  };

  if (loading) {
    return (
      <Box sx={{ py: 10, textAlign: "center" }}>
        <ClientFadeWebliixLoader message="Loading public blog articles & guidelines..." size="medium" />
      </Box>
    );
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
      {/* Featured Header Card with Crisp Square Edges */}
      <Card
        sx={{
          bgcolor: "#0f172a",
          color: "#ffffff",
          borderRadius: "8px",
          p: { xs: 3, md: 4.5 },
          position: "relative",
          overflow: "hidden",
          border: "1px solid #1e293b",
          boxShadow: "0 4px 16px rgba(15,23,42,0.15)",
        }}
      >
        <Box
          sx={{
            position: "absolute",
            right: { xs: -40, md: 20 },
            top: { xs: -20, md: -10 },
            width: { xs: 220, md: 320 },
            height: { xs: 180, md: 240 },
            pointerEvents: "none",
            opacity: { xs: 0.6, md: 0.9 },
          }}
        >
          <IsometricCubeIllustration width="100%" height="100%" />
        </Box>

        <Box sx={{ position: "relative", zIndex: 2, maxWidth: 620 }}>
          <Chip
            label="External Blog & Guidelines"
            size="small"
            sx={{ bgcolor: "rgba(255,255,255,0.15)", color: "#ffffff", fontWeight: 800, mb: 1.5, borderRadius: "4px" }}
          />
          <Typography
            variant="h4"
            fontWeight={900}
            letterSpacing="-0.03em"
            sx={{ color: "#ffffff", fontSize: { xs: "1.5rem", md: "2.1rem" }, mb: 1.5 }}
          >
            Engineering Guidelines & Industry News
          </Typography>
          <Typography variant="body1" sx={{ color: "#cbd5e1", lineHeight: 1.6, mb: 3 }}>
            All whitepapers, design principles, and technical articles are published directly on our public blog platform.
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
              color: "#0f172a",
              fontWeight: 800,
              borderRadius: "6px",
              px: 2.75,
              py: 1.1,
              textTransform: "none",
              boxShadow: "0 2px 6px rgba(0,0,0,0.2)",
              "&:hover": { bgcolor: "#f1f5f9" },
            }}
          >
            Explore Public Blog Hub
          </Button>
        </Box>
      </Card>

      {/* Articles Grid - Square Cards linking to external site */}
      {articles.length === 0 ? (
        <Card sx={{ p: 5, textAlign: "center", borderRadius: "3px", border: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
          <ArticleOutlinedIcon sx={{ fontSize: 48, color: "#94a3b8", mb: 1.5 }} />
          <Typography variant="h6" fontWeight={800} color="#0f172a" gutterBottom>
            Official Articles Published on Webliix Blog
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 460, mx: "auto", mb: 2.5 }}>
            Access all technical whitepapers, system guidelines, and cloud engineering articles on our public platform.
          </Typography>
          <Button
            variant="contained"
            component="a"
            href="https://webliix.com/blog"
            target="_blank"
            rel="noopener noreferrer"
            endIcon={<OpenInNewIcon fontSize="small" />}
            sx={{ bgcolor: "#0f172a", borderRadius: "3px", textTransform: "none", fontWeight: 800 }}
          >
            Open Webliix Blog
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
          {articles.map((item) => (
            <Card
              key={item.id}
              onClick={() => handleOpenExternal(item.slug)}
              sx={{
                borderRadius: "3px",
                border: "1px solid #e2e8f0",
                bgcolor: "#ffffff",
                cursor: "pointer",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                transition: "transform 0.2s ease, border-color 0.2s ease",
                "&:hover": {
                  transform: "translateY(-3px)",
                  borderColor: "#0f172a",
                  boxShadow: "0 8px 20px -4px rgba(0,0,0,0.08)",
                },
              }}
            >
            {item.coverImage && (
              <CardMedia
                component="img"
                height="170"
                image={item.coverImage}
                alt={item.title}
                sx={{ objectFit: "cover", borderBottom: "1px solid #f1f5f9" }}
              />
            )}
            <CardContent sx={{ p: 3, display: "flex", flexDirection: "column", flexGrow: 1 }}>
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 1.5 }}>
                <Chip
                  label={item.category || "Article"}
                  size="small"
                  sx={{
                    fontWeight: 800,
                    fontSize: "0.72rem",
                    bgcolor: "#f1f5f9",
                    color: "#0f172a",
                    borderRadius: "4px",
                  }}
                />
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#64748b" }}>
                  <AccessTimeIcon sx={{ fontSize: 14 }} />
                  <Typography variant="caption" fontWeight={700}>
                    {item.readTimeMinutes || 5} min read
                  </Typography>
                </Box>
              </Box>

              <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ fontSize: "1.05rem", mb: 1, lineHeight: 1.35 }}>
                {item.title}
              </Typography>

              <Typography
                variant="body2"
                color="text.secondary"
                sx={{
                  mb: 2.5,
                  flexGrow: 1,
                  display: "-webkit-box",
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: "vertical",
                  overflow: "hidden",
                  lineHeight: 1.55,
                }}
              >
                {item.excerpt || "Read full technical documentation and industry analysis on Webliix Blog."}
              </Typography>

              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: "1px solid #f1f5f9" }}>
                <Typography variant="caption" fontWeight={800} color="#0f172a" sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                  Read on webliix.com <OpenInNewIcon sx={{ fontSize: 13 }} />
                </Typography>
                <ArrowForwardIcon sx={{ fontSize: 16, color: "#0f172a" }} />
              </Box>
            </CardContent>
          </Card>
        ))}
        </Box>
      )}

      {/* Newsletter Subscription Box with Crisp Square Controls */}
      <Card
        sx={{
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          bgcolor: "#ffffff",
          p: { xs: 3, md: 4 },
        }}
      >
        <Box
          sx={{
            display: "flex",
            flexDirection: { xs: "column", md: "row" },
            justifyContent: "space-between",
            alignItems: { xs: "flex-start", md: "center" },
            gap: 3,
          }}
        >
          <Box sx={{ maxWidth: 520 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
              <MailOutlineIcon sx={{ color: "#0f172a", fontSize: 22 }} />
              <Typography variant="h6" fontWeight={900} color="#0f172a">
                Subscribe to Client Dispatch
              </Typography>
            </Box>
            <Typography variant="body2" color="text.secondary">
              Receive quarterly technical briefs, security patches, and product release updates directly to your inbox.
            </Typography>
          </Box>

          <Box component="form" onSubmit={handleSubscribe} sx={{ display: "flex", gap: 1.5, width: { xs: "100%", md: "auto" } }}>
            <TextField
              size="small"
              placeholder="Enter your email address"
              type="email"
              required
              value={subscribeEmail}
              onChange={(e) => setSubscribeEmail(e.target.value)}
              sx={{
                minWidth: { xs: "100%", sm: 260 },
                "& .MuiOutlinedInput-root": { borderRadius: "6px" },
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={subscribing}
              sx={{
                bgcolor: "#0f172a",
                color: "#ffffff",
                px: 3,
                fontWeight: 800,
                borderRadius: "6px",
                textTransform: "none",
                "&:hover": { bgcolor: "#1e293b" },
              }}
            >
              {subscribing ? "..." : "Subscribe"}
            </Button>
          </Box>
        </Box>

        {subscribeSuccess && (
          <Alert severity="success" sx={{ mt: 2, borderRadius: "6px" }}>
            You have successfully subscribed to Webliix updates!
          </Alert>
        )}
      </Card>
    </Box>
  );
}
