import Skeleton from "@mui/material/Skeleton";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import { tokens } from "../../theme/tokens";

export function ClientCardSkeleton() {
  return (
    <Card
      sx={{
        borderRadius: tokens.borderRadius.lg,
        border: `1px solid ${tokens.colors.secondary[200]}`,
        p: 3,
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 2 }}>
        <Skeleton variant="rectangular" width={80} height={24} sx={{ borderRadius: 1 }} />
        <Skeleton variant="rectangular" width={100} height={24} sx={{ borderRadius: 1 }} />
      </Box>
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="90%" height={20} />
      <Skeleton variant="text" width="70%" height={20} sx={{ mb: 3 }} />
      <Skeleton variant="rectangular" height={10} sx={{ borderRadius: 5, mb: 3 }} />
      <Skeleton variant="rectangular" height={40} sx={{ borderRadius: tokens.borderRadius.md }} />
    </Card>
  );
}

export function ClientKpiSkeleton() {
  return (
    <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
      <CardContent sx={{ p: 3, display: "flex", alignItems: "center", gap: 2 }}>
        <Skeleton variant="circular" width={48} height={48} />
        <Box sx={{ flex: 1 }}>
          <Skeleton variant="text" width="40%" height={16} />
          <Skeleton variant="text" width="30%" height={36} />
        </Box>
      </CardContent>
    </Card>
  );
}

export function ClientDashboardSkeleton() {
  return (
    <Box sx={{ display: "grid", gap: 4 }}>
      <Card sx={{ borderRadius: tokens.borderRadius.xl, p: 4 }}>
        <Skeleton variant="text" width="40%" height={40} />
        <Skeleton variant="text" width="70%" height={24} />
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" }, gap: 3 }}>
        <ClientKpiSkeleton />
        <ClientKpiSkeleton />
        <ClientKpiSkeleton />
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "repeat(2, 1fr)" }, gap: 3 }}>
        <ClientCardSkeleton />
        <ClientCardSkeleton />
      </Box>
    </Box>
  );
}
