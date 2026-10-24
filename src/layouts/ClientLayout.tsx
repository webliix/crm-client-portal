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
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LocalOfferOutlinedIcon from "@mui/icons-material/LocalOfferOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import MenuIcon from "@mui/icons-material/Menu";
import Chip from "@mui/material/Chip";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { ClientFloatingChatWidget } from "../components/chat/ClientFloatingChatWidget";

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
    { label: "Support & Chat History", path: "/tickets", icon: <ConfirmationNumberOutlinedIcon fontSize="small" /> },
    { label: "Special Offers", path: "/offers", icon: <LocalOfferOutlinedIcon fontSize="small" />, badge: "Deals" },
    { label: "Profile & Settings", path: "/profile", icon: <PersonOutlinedIcon fontSize="small" /> },
  ];

  const currentNav = navItems.find((n) => location.pathname.startsWith(n.path)) || {
    label: "Client Workspace",
  };

  const sidebarContent = (
    <Box
      sx={{
        width: 270,
        height: "100%",
        bgcolor: "#090d16",
        color: "#ffffff",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
      }}
    >
      {/* Brand Header */}
      <Box
        sx={{
          p: 2.75,
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          bgcolor: "rgba(15, 23, 42, 0.6)",
        }}
      >
        <Box
          component="img"
          src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
          alt="Webliix Logo"
          sx={{
            height: 34,
            maxHeight: 34,
            objectFit: "contain",
          }}
        />
        <Box sx={{ minWidth: 0 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75 }}>
            <Typography variant="subtitle2" fontWeight={800} letterSpacing="-0.02em" noWrap>
              Webliix Hub
            </Typography>
            <Chip
              label="Client"
              size="small"
              sx={{
                height: 18,
                fontSize: "0.625rem",
                fontWeight: 800,
                bgcolor: "rgba(99, 102, 241, 0.2)",
                color: tokens.colors.primary[300],
                border: "1px solid rgba(99, 102, 241, 0.35)",
              }}
            />
          </Box>
          <Typography
            variant="caption"
            sx={{
              color: "#64748b",
              fontSize: "0.6875rem",
              fontFamily: "monospace",
              display: "block",
            }}
          >
            login.webliix.com
          </Typography>
        </Box>
      </Box>

      {/* Nav List */}
      <Box sx={{ flex: 1, py: 2.5, px: 1.75, display: "flex", flexDirection: "column", gap: 0.75, overflowY: "auto" }}>
        <Typography
          variant="caption"
          sx={{
            px: 1.5,
            mb: 0.5,
            color: "#475569",
            fontWeight: 700,
            fontSize: "0.6875rem",
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            fontFamily: "monospace",
          }}
        >
          Delivery Management
        </Typography>

        {navItems.map((item) => {
          const active = location.pathname.startsWith(item.path);
          return (
            <Button
              key={item.path}
              component={Link}
              to={item.path}
              onClick={() => setMobileOpen(false)}
              startIcon={
                <Box
                  sx={{
                    color: active ? "#ffffff" : "#64748b",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.icon}
                </Box>
              }
              sx={{
                justifyContent: "flex-start",
                px: 1.75,
                py: 1.15,
                borderRadius: tokens.borderRadius.md,
                fontWeight: active ? 700 : 500,
                fontSize: "0.84rem",
                textTransform: "none",
                color: active ? "#ffffff" : "#94a3b8",
                bgcolor: active ? tokens.colors.primary.main : "transparent",
                boxShadow: active ? "0 4px 14px rgba(99, 102, 241, 0.35)" : "none",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                position: "relative",
                "&:hover": {
                  bgcolor: active ? tokens.colors.primary.main : "rgba(255, 255, 255, 0.06)",
                  color: "#ffffff",
                  transform: "translateX(2px)",
                },
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", width: "100%" }}>
                <span>{item.label}</span>
                {item.badge && (
                  <Chip
                    label={item.badge}
                    size="small"
                    sx={{
                      height: 18,
                      fontSize: "0.625rem",
                      fontWeight: 800,
                      bgcolor: active ? "#ffffff" : "rgba(245, 158, 11, 0.2)",
                      color: active ? tokens.colors.primary.main : tokens.colors.warning.main,
                      border: active ? "none" : "1px solid rgba(245, 158, 11, 0.3)",
                    }}
                  />
                )}
              </Box>
            </Button>
          );
        })}
      </Box>

      {/* User Footer Profile Card */}
      <Box sx={{ p: 2, borderTop: "1px solid rgba(255, 255, 255, 0.08)", bgcolor: "rgba(15, 23, 42, 0.4)" }}>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            p: 1.25,
            borderRadius: tokens.borderRadius.md,
            bgcolor: "rgba(255, 255, 255, 0.04)",
            border: "1px solid rgba(255, 255, 255, 0.06)",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25, minWidth: 0 }}>
            <Avatar
              sx={{
                width: 32,
                height: 32,
                bgcolor: tokens.colors.primary.main,
                fontSize: "0.8125rem",
                fontWeight: 800,
              }}
            >
              {(user?.name || "C").charAt(0).toUpperCase()}
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography variant="body2" fontWeight={700} color="#f8fafc" noWrap sx={{ fontSize: "0.8125rem" }}>
                {user?.name || "Client User"}
              </Typography>
              <Typography variant="caption" color="#64748b" noWrap sx={{ fontSize: "0.6875rem", display: "block" }}>
                Active Session
              </Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={handleLogout} title="Log Out" sx={{ color: "#94a3b8", "&:hover": { color: "#ef4444" } }}>
            <LogoutOutlinedIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", minHeight: "100vh", bgcolor: "#f8fafc" }}>
      {/* Mobile Drawer */}
      <Drawer open={mobileOpen} onClose={() => setMobileOpen(false)}>
        {sidebarContent}
      </Drawer>

      {/* Desktop Sidebar */}
      <Box
        sx={{
          display: { xs: "none", md: "block" },
          position: "fixed",
          top: 0,
          left: 0,
          bottom: 0,
          width: 270,
          zIndex: 40,
        }}
      >
        {sidebarContent}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, ml: { xs: 0, md: "270px" } }}>
        {/* Header Bar */}
        <Box
          sx={{
            height: 64,
            px: { xs: 2, md: 4 },
            bgcolor: "rgba(255, 255, 255, 0.88)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "fixed",
            top: 0,
            right: 0,
            left: { xs: 0, md: "270px" },
            zIndex: 30,
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton onClick={() => setMobileOpen(true)} sx={{ display: { xs: "inline-flex", md: "none" } }}>
              <MenuIcon />
            </IconButton>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Typography variant="subtitle1" fontWeight={800} color="#0f172a" sx={{ letterSpacing: "-0.01em" }}>
                {currentNav.label}
              </Typography>
              <Chip
                label="Enterprise Live"
                size="small"
                icon={<ShieldOutlinedIcon style={{ fontSize: 13, color: tokens.colors.success.main }} />}
                sx={{
                  display: { xs: "none", sm: "inline-flex" },
                  height: 20,
                  fontSize: "0.6875rem",
                  fontWeight: 700,
                  bgcolor: tokens.colors.success[50],
                  color: tokens.colors.success[700],
                  border: `1px solid ${tokens.colors.success[200]}`,
                }}
              />
            </Box>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
            <Button
              component="a"
              href="https://webliix.com"
              target="_blank"
              rel="noopener noreferrer"
              size="small"
              startIcon={<ArrowBackIcon fontSize="small" />}
              sx={{
                display: { xs: "none", sm: "inline-flex" },
                textTransform: "none",
                fontWeight: 700,
                fontSize: "0.8125rem",
                color: "#64748b",
                "&:hover": { color: tokens.colors.primary.main, bgcolor: "rgba(99, 102, 241, 0.06)" },
              }}
            >
              Public Website
            </Button>

            <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
              <Box sx={{ textAlign: "right", display: { xs: "none", sm: "block" } }}>
                <Typography variant="subtitle2" fontWeight={700} color="#0f172a" lineHeight={1.2}>
                  {user?.name || "Client User"}
                </Typography>
                <Typography variant="caption" color="#64748b" sx={{ fontSize: "0.6875rem" }}>
                  {user?.email || "client@webliix.com"}
                </Typography>
              </Box>
              <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
                <Avatar
                  sx={{
                    width: 36,
                    height: 36,
                    bgcolor: tokens.colors.primary.main,
                    fontSize: "0.875rem",
                    fontWeight: 800,
                    boxShadow: "0 2px 8px rgba(99, 102, 241, 0.3)",
                  }}
                >
                  {(user?.name || "C").charAt(0).toUpperCase()}
                </Avatar>
              </IconButton>
            </Box>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
              PaperProps={{
                sx: {
                  mt: 1.5,
                  minWidth: 200,
                  borderRadius: tokens.borderRadius.md,
                  boxShadow: tokens.shadows.lg,
                  border: "1px solid #e2e8f0",
                },
              }}
            >
              <Box sx={{ px: 2, py: 1.5 }}>
                <Typography variant="subtitle2" fontWeight={800} color="#0f172a">
                  {user?.name}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {user?.email}
                </Typography>
              </Box>
              <Divider />
              <MenuItem onClick={() => { setAnchorEl(null); navigate("/profile"); }} sx={{ fontWeight: 600, fontSize: "0.875rem" }}>
                <PersonOutlinedIcon fontSize="small" sx={{ mr: 1, color: tokens.colors.primary.main }} /> My Profile
              </MenuItem>
              <MenuItem onClick={handleLogout} sx={{ color: tokens.colors.error.main, fontWeight: 600, fontSize: "0.875rem" }}>
                <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1 }} /> Log Out
              </MenuItem>
            </Menu>
          </Box>
        </Box>

        {/* Content Body */}
        <Box component="main" sx={{ flex: 1, mt: "64px" }}>
          {children}
        </Box>

        {/* Floating Live Chat Widget */}
        <ClientFloatingChatWidget />
      </Box>
    </Box>
  );
}
