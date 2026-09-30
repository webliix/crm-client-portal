import { useState, type ReactNode } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Divider from "@mui/material/Divider";
import Drawer from "@mui/material/Drawer";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";

interface Props {
  children: ReactNode;
}

export function ClientLayout({ children }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const navItems = [
    { label: "Overview", path: "/dashboard", icon: <DashboardOutlinedIcon fontSize="small" /> },
    { label: "My Projects", path: "/projects", icon: <FolderSpecialOutlinedIcon fontSize="small" /> },
    { label: "Invoices & Billing", path: "/invoices", icon: <ReceiptLongOutlinedIcon fontSize="small" /> },
    { label: "Support Tickets", path: "/tickets", icon: <ConfirmationNumberOutlinedIcon fontSize="small" /> },
  ];

  const sidebarContent = (
    <Box sx={{ width: 260, height: "100%", bgcolor: "#0f172a", color: "#ffffff", display: "flex", flexDirection: "column" }}>
      {/* Brand Header */}
      <Box sx={{ p: 3, display: "flex", alignItems: "center", gap: 1.5, borderBottom: "1px solid rgba(255,255,255,0.1)" }}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: tokens.borderRadius.sm,
            bgcolor: tokens.colors.primary.main,
            color: "#ffffff",
            fontWeight: 800,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          W
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={800} lineHeight={1.2}>
            Webliix Client
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.primary[300], fontSize: "0.6875rem", fontWeight: 700 }}>
            login.webliix.com
          </Typography>
        </Box>
      </Box>

      {/* Nav List */}
      <Box sx={{ flex: 1, py: 3, px: 2, display: "flex", flexDirection: "column", gap: 0.5 }}>
        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              startIcon={item.icon}
              sx={{
                justifyContent: "flex-start",
                px: 2,
                py: 1.25,
                borderRadius: tokens.borderRadius.md,
                fontWeight: active ? 700 : 500,
                color: active ? "#ffffff" : "#94a3b8",
                bgcolor: active ? tokens.colors.primary.main : "transparent",
                "&:hover": {
                  bgcolor: active ? tokens.colors.primary.main : "rgba(255,255,255,0.06)",
                  color: "#ffffff",
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}
      </Box>

      {/* Footer */}
      <Divider sx={{ borderColor: "rgba(255,255,255,0.1)" }} />
      <Box sx={{ p: 2.5, textAlign: "center" }}>
        <Typography variant="caption" sx={{ color: "#64748b" }}>
          Webliix Client Portal v2.0
        </Typography>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: tokens.colors.secondary[50] }}>
      {/* Mobile Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {sidebarContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box sx={{ display: { xs: "none", md: "block" } }}>{sidebarContent}</Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <Box
          sx={{
            height: 64,
            px: { xs: 2, md: 4 },
            bgcolor: "#ffffff",
            borderBottom: `1px solid ${tokens.colors.secondary[200]}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { xs: "inline-flex", md: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="subtitle1" fontWeight={700} color={tokens.colors.secondary[900]}>
              Client Customer Workspace
            </Typography>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
              <Typography variant="subtitle2" fontWeight={700} color={tokens.colors.secondary[900]} lineHeight={1.2}>
                {user?.name || "Client User"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {user?.email || "customer@webliix.in"}
              </Typography>
            </Box>
            <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
              <Avatar sx={{ width: 36, height: 36, bgcolor: tokens.colors.primary.main, fontSize: "0.875rem", fontWeight: 700 }}>
                {(user?.name || "C").charAt(0)}
              </Avatar>
            </IconButton>
          </Box>

          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={() => setAnchorEl(null)}>
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Box>
                <Typography variant="subtitle2" fontWeight={700}>
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {user?.email}
                </Typography>
              </Box>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout} sx={{ color: tokens.colors.error.main, fontWeight: 600 }}>
              <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Log Out
            </MenuItem>
          </Menu>
        </Box>

        {/* Content Body */}
        <Box component="main" sx={{ flex: 1 }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}
