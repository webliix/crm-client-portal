import React, { useState, useEffect, type ReactNode } from "react";
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
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItemSelect from "@mui/material/MenuItem";

// Icons
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SearchIcon from "@mui/icons-material/Search";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import Paper from "@mui/material/Paper";

import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { notificationApi } from "../services/notificationApi";
import { ticketApi } from "../services/ticketApi";
import { ClientNotificationDrawer } from "../components/notifications/ClientNotificationDrawer";
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
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(2);

  // New Project / Inquiry Modal State
  const [openNewProjectModal, setOpenNewProjectModal] = useState(false);
  const [inquiryType, setInquiryType] = useState("NEW_PROJECT");
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryDetails, setInquiryDetails] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  // Check unread count on mount
  useEffect(() => {
    notificationApi.getMyNotifications().then((list) => {
      const unread = list.filter((n) => n.status === "UNREAD").length;
      setUnreadCount(unread > 0 ? unread : 2);
    }).catch(() => {});
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleCreateInquiry = async () => {
    if (!inquiryTitle.trim() || !inquiryDetails.trim() || submittingInquiry) return;
    setSubmittingInquiry(true);
    try {
      const created = await ticketApi.createTicket(
        `[${inquiryType}] ${inquiryTitle.trim()}`,
        inquiryDetails.trim(),
        inquiryType === "NEW_PROJECT" ? "FEATURE" : "SUPPORT"
      );
      if (created) {
        setOpenNewProjectModal(false);
        setInquiryTitle("");
        setInquiryDetails("");
        navigate(`/tickets?ticketId=${created.id}`);
      } else {
        alert("Failed to submit inquiry. Please try again.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to submit inquiry");
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // Nav Items matching the clean template design
  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon sx={{ fontSize: 19 }} /> },
    { label: "Projects", path: "/projects", icon: <FolderSpecialOutlinedIcon sx={{ fontSize: 19 }} /> },
    { label: "Invoices & Billing", path: "/invoices", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 19 }} /> },
    { label: "Support & Live Chat", path: "/tickets", icon: <ForumOutlinedIcon sx={{ fontSize: 19 }} /> },
    { label: "Articles & News", path: "/articles", icon: <ArticleOutlinedIcon sx={{ fontSize: 19 }} /> },
    { label: "Settings", path: "/profile", icon: <SettingsOutlinedIcon sx={{ fontSize: 19 }} /> },
  ];

  // Dynamic formatted date e.g. "Monday, 20 May 2022"
  const formattedToday = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  const firstName = user?.firstName || user?.name?.split(" ")[0] || "Client";

  const sidebarContent = (
    <Box
      sx={{
        width: 250,
        height: "100%",
        bgcolor: "#ffffff",
        color: "#111827",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #f1f5f9",
        p: 3,
      }}
    >
      {/* Brand Header */}
      <Box sx={{ mb: 4, display: "flex", alignItems: "center", gap: 1.5 }}>
        <Box
          component="img"
          src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
          alt="Webliix"
          sx={{ height: 28, objectFit: "contain" }}
        />
        <Typography
          variant="h6"
          fontWeight={900}
          letterSpacing="-0.03em"
          sx={{ fontSize: "1.25rem", color: "#111827", fontStyle: "italic" }}
        >
          Webliix
        </Typography>
      </Box>

      {/* Nav List */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 1 }}>
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
                    color: active ? "#111827" : "#94a3b8",
                    display: "flex",
                    alignItems: "center",
                    transition: "color 0.15s ease",
                  }}
                >
                  {item.icon}
                </Box>
              }
              sx={{
                justifyContent: "flex-start",
                px: 2,
                py: 1.25,
                borderRadius: `${tokens.borderRadius.md}px`,
                fontWeight: active ? 800 : 500,
                fontSize: "0.875rem",
                textTransform: "none",
                color: active ? "#111827" : "#64748b",
                bgcolor: active ? "#f1f5f9" : "transparent",
                boxShadow: "none",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: active ? "#f1f5f9" : "#f8fafc",
                  color: "#111827",
                },
              }}
            >
              {item.label}
            </Button>
          );
        })}

        <Button
          onClick={handleLogout}
          startIcon={<LogoutOutlinedIcon sx={{ fontSize: 19, color: "#94a3b8" }} />}
          sx={{
            justifyContent: "flex-start",
            px: 2,
            py: 1.25,
            borderRadius: `${tokens.borderRadius.md}px`,
            fontWeight: 500,
            fontSize: "0.875rem",
            textTransform: "none",
            color: "#64748b",
            mt: 2,
            "&:hover": {
              bgcolor: "#fef2f2",
              color: "#ef4444",
            },
          }}
        >
          Log out
        </Button>
      </Box>

      {/* User Profile Pill at Bottom of Sidebar */}
      <Box
        component={Link}
        to="/profile"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.25,
          borderRadius: `${tokens.borderRadius.lg}px`,
          textDecoration: "none",
          transition: "background-color 0.15s ease",
          "&:hover": { bgcolor: "#f8fafc" },
        }}
      >
        <Avatar
          sx={{
            width: 38,
            height: 38,
            bgcolor: "#111827",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "0.875rem",
          }}
        >
          {(user?.name || "J").charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={800} color="#111827" noWrap>
            {user?.name || "Jane D."}
          </Typography>
          <Typography variant="caption" color="#94a3b8" sx={{ fontSize: "0.75rem" }}>
            Profile
          </Typography>
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
          width: 250,
          zIndex: 40,
        }}
      >
        {sidebarContent}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, ml: { xs: 0, md: "250px" } }}>
        {/* Top Header Bar matching reference image */}
        <Box
          sx={{
            px: { xs: 2.5, md: 5 },
            py: 2.5,
            bgcolor: "#f8fafc",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Greeting on Left */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" }, p: 0.5 }}
            >
              <MenuIcon />
            </IconButton>

            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                color="#0f172a"
                letterSpacing="-0.03em"
                sx={{ fontSize: { xs: "1.45rem", md: "1.85rem" } }}
              >
                Hello, {firstName}
              </Typography>
              <Typography variant="body2" color="#64748b" sx={{ fontSize: "0.85rem", fontWeight: 500, mt: 0.25 }}>
                Today is {formattedToday}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons on Right */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Search Icon */}
            <Tooltip title="Search workspace">
              <IconButton
                onClick={() => navigate("/projects")}
                sx={{
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  width: 40,
                  height: 40,
                  color: "#475569",
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Notification Bell with Badge */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={() => setNotifDrawerOpen(true)}
                sx={{
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  width: 40,
                  height: 40,
                  color: "#475569",
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}
              >
                <Badge badgeContent={unreadCount} color="error" variant="dot">
                  <NotificationsNoneOutlinedIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* + New projects Black Pill Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 18 }} />}
              onClick={() => setOpenNewProjectModal(true)}
              sx={{
                bgcolor: "#000000",
                color: "#ffffff",
                px: 2.75,
                py: 1.1,
                borderRadius: "9999px",
                fontWeight: 700,
                fontSize: "0.875rem",
                textTransform: "none",
                boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
                "&:hover": {
                  bgcolor: "#1e293b",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.25)",
                },
              }}
            >
              + New projects
            </Button>
          </Box>
        </Box>

        {/* Content Body */}
        <Box component="main" sx={{ flex: 1, px: { xs: 2, md: 5 }, pb: { xs: 9, md: 4 } }}>
          {children}
        </Box>

        {/* Mobile Bottom Navigation Bar */}
        <Paper
          elevation={12}
          sx={{
            display: { xs: "block", md: "none" },
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 40,
            borderTop: "1px solid #e2e8f0",
            bgcolor: "#ffffff",
          }}
        >
          <BottomNavigation
            showLabels
            value={location.pathname}
            onChange={(_, newValue) => navigate(newValue)}
            sx={{
              height: 60,
              "& .MuiBottomNavigationAction-root": {
                minWidth: "auto",
                px: 1,
                color: "#64748b",
                "&.Mui-selected": { color: "#111827", fontWeight: 800 },
              },
            }}
          >
            <BottomNavigationAction label="Dashboard" value="/dashboard" icon={<DashboardOutlinedIcon sx={{ fontSize: 20 }} />} />
            <BottomNavigationAction label="Projects" value="/projects" icon={<FolderSpecialOutlinedIcon sx={{ fontSize: 20 }} />} />
            <BottomNavigationAction label="Invoices" value="/invoices" icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} />} />
            <BottomNavigationAction label="Chat" value="/tickets" icon={<ForumOutlinedIcon sx={{ fontSize: 20 }} />} />
            <BottomNavigationAction label="Profile" value="/profile" icon={<PersonOutlinedIcon sx={{ fontSize: 20 }} />} />
          </BottomNavigation>
        </Paper>

        {/* Notification Drawer */}
        <ClientNotificationDrawer
          open={notifDrawerOpen}
          onClose={() => setNotifDrawerOpen(false)}
          onUnreadChange={(count) => setUnreadCount(count)}
        />

        {/* Floating Chat Widget */}
        <ClientFloatingChatWidget />

        {/* New Project / Inquiry Modal */}
        <Dialog open={openNewProjectModal} onClose={() => setOpenNewProjectModal(false)} maxWidth="sm" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Submit Project Inquiry / Request</DialogTitle>
          <DialogContent dividers>
            <Box sx={{ display: "grid", gap: 2.5, pt: 1 }}>
              <TextField
                select
                label="Request Type"
                fullWidth
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
              >
                <MenuItemSelect value="NEW_PROJECT">New Web / App Project</MenuItemSelect>
                <MenuItemSelect value="FEATURE_REQUEST">Feature Request / Enhancement</MenuItemSelect>
                <MenuItemSelect value="SEO_MARKETING">SEO & Growth Marketing</MenuItemSelect>
                <MenuItemSelect value="SUPPORT_ISSUE">Technical Support / Revision</MenuItemSelect>
              </TextField>

              <TextField
                label="Project or Inquiry Title"
                fullWidth
                required
                value={inquiryTitle}
                onChange={(e) => setInquiryTitle(e.target.value)}
                placeholder="e.g. Fintech Mobile App Redesign or Domain Migration"
              />

              <TextField
                label="Brief Description & Requirements"
                fullWidth
                required
                multiline
                rows={4}
                value={inquiryDetails}
                onChange={(e) => setInquiryDetails(e.target.value)}
                placeholder="Please outline the deliverables, timelines, or questions..."
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2.5 }}>
            <Button onClick={() => setOpenNewProjectModal(false)}>Cancel</Button>
            <Button
              variant="contained"
              disabled={!inquiryTitle.trim() || !inquiryDetails.trim() || submittingInquiry}
              onClick={handleCreateInquiry}
              sx={{ bgcolor: "#000000", "&:hover": { bgcolor: "#1e293b" }, fontWeight: 700, borderRadius: "9999px", px: 3 }}
            >
              {submittingInquiry ? "Submitting..." : "Send Request"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
