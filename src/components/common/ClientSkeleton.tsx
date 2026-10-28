import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { tokens } from "../../theme/tokens";
import "../../styles/loader.css";

export function ClientFadeWebliixLoader({
  message = "Loading...",
  size = "medium",
}: {
  message?: string;
  size?: "small" | "medium" | "large";
}) {
  const containerClass =
    size === "small"
      ? "logo-loader-sm"
      : size === "large"
      ? "logo-loader-lg"
      : "logo-loader";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        py: size === "small" ? 1 : 2.5,
      }}
    >
      <div className={containerClass}>
        <img src="/icon.svg" alt="Webliix" />
      </div>
      {message && (
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            fontWeight: 700,
            mt: 1,
            letterSpacing: "0.04em",
            textTransform: "uppercase",
            fontSize: "0.7rem",
          }}
        >
          {message}
        </Typography>
      )}
    </Box>
  );
}

export function ClientCardSkeleton() {
  return (
    <Card
      sx={{
        borderRadius: "28px",
        border: `1px solid ${tokens.colors.secondary[200]}`,
        bgcolor: "#ffffff",
        p: 3,
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5 }}>
        <Skeleton variant="circular" width={44} height={44} />
        <Box sx={{ display: "flex", gap: 1 }}>
          <Skeleton variant="rectangular" width={60} height={24} sx={{ borderRadius: 3 }} />
          <Skeleton variant="rectangular" width={75} height={24} sx={{ borderRadius: 3 }} />
        </Box>
      </Box>
      <Skeleton variant="text" width="65%" height={32} sx={{ mb: 1, borderRadius: 1 }} />
      <Skeleton variant="text" width="95%" height={20} sx={{ borderRadius: 1 }} />
      <Skeleton variant="text" width="75%" height={20} sx={{ mb: 2.5, borderRadius: 1 }} />
      <Skeleton variant="rectangular" height={8} sx={{ borderRadius: 4, mb: 2.5 }} />
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1 }}>
        <Skeleton variant="text" width="40%" height={20} />
        <Skeleton variant="circular" width={34} height={34} />
      </Box>
    </Card>
  );
}

export function ClientKpiSkeleton() {
  return (
    <Card
      sx={{
        borderRadius: "28px",
        border: `1px solid ${tokens.colors.secondary[200]}`,
        bgcolor: "#ffffff",
        boxShadow: "0 10px 30px -10px rgba(0,0,0,0.04)",
      }}
    >
      <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2.5 }}>
        <Skeleton variant="circular" width={50} height={50} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="45%" height={16} sx={{ mb: 0.5 }} />
          <Skeleton variant="text" width="55%" height={36} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function ClientDashboardSkeleton() {
  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 4, p: { xs: 2.5, md: 4 } }}>
      {/* Top Banner with Fade Icon */}
      <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", py: 2 }}>
        <ClientFadeWebliixLoader message="Synchronizing client workspace..." size="small" />
      </Box>

      {/* 3 Pastel Hero Cards Skeletons */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(3, 1fr)" }, gap: 3 }}>
        <ClientCardSkeleton />
        <ClientCardSkeleton />
        <ClientCardSkeleton />
      </Box>

      {/* 3 Column Grid Skeletons */}
      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.1fr 1.3fr 1fr" }, gap: 3 }}>
        <Card sx={{ p: 3, borderRadius: "28px", border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <Skeleton variant="text" width="50%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 3, mb: 1.5 }} />
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 3, mb: 1.5 }} />
          <Skeleton variant="rectangular" height={60} sx={{ borderRadius: 3 }} />
        </Card>
        <Card sx={{ p: 3, borderRadius: "28px", border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <Skeleton variant="text" width="40%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={100} sx={{ borderRadius: 3, mb: 2 }} />
          <Skeleton variant="rectangular" height={120} sx={{ borderRadius: 3 }} />
        </Card>
        <Card sx={{ p: 3, borderRadius: "28px", border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <Skeleton variant="text" width="45%" height={28} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3, mb: 1.5 }} />
          <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 3 }} />
        </Card>
      </Box>
    </Box>
  );
}
