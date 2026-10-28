import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Badge from "@mui/material/Badge";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import MenuItemSelect from "@mui/material/MenuItem";
import Paper from "@mui/material/Paper";
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";

// Icons
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import SearchIcon from "@mui/icons-material/Search";
import AddIcon from "@mui/icons-material/Add";
import MenuIcon from "@mui/icons-material/Menu";

import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { notificationApi } from "../services/notificationApi";
import { ticketApi } from "../services/ticketApi";
import { ClientNotificationDrawer } from "../components/notifications/ClientNotificationDrawer";
import { ClientFloatingChatWidget } from "../components/chat/ClientFloatingChatWidget";

interface ClientLayoutProps {
  children: React.ReactNode;
}

export function ClientLayout({ children }: ClientLayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = authService.getCurrentUser();

  const [mobileOpen, setMobileOpen] = useState(false);
  const [notifDrawerOpen, setNotifDrawerOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  // Quick New Project Inquiry Modal
  const [openNewProjectModal, setOpenNewProjectModal] = useState(false);
  const [inquiryTitle, setInquiryTitle] = useState("");
  const [inquiryType, setInquiryType] = useState("NEW_PROJECT");
  const [inquiryDetails, setInquiryDetails] = useState("");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);

  const loadNotifications = () => {
    notificationApi
      .getMyNotifications()
      .then((list) => {
        const unread = list.filter((n) => n.status !== "READ").length;
        setUnreadCount(unread);
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleLogout = () => {
    authService.logout();
    navigate("/login");
  };

  const handleCreateInquiry = async () => {
    if (!inquiryTitle.trim() || !inquiryDetails.trim()) return;
    setSubmittingInquiry(true);
    try {
      await ticketApi.createTicket(
        `[${inquiryType}] ${inquiryTitle}`,
        inquiryDetails,
        "PROJECT_INQUIRY"
      );
      setOpenNewProjectModal(false);
      setInquiryTitle("");
      setInquiryDetails("");
      navigate("/tickets");
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingInquiry(false);
    }
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: <DashboardOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: "Projects", path: "/projects", icon: <FolderSpecialOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: "Invoices", path: "/invoices", icon: <ReceiptLongOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: "Chat & Support", path: "/tickets", icon: <ForumOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: "Articles & News", path: "/articles", icon: <ArticleOutlinedIcon sx={{ fontSize: 20 }} /> },
    { label: "Notifications", path: "/notifications", icon: <NotificationsNoneOutlinedIcon sx={{ fontSize: 20 }} /> },
  ];

  // Dynamic Date string
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
        width: 240,
        height: "100%",
        bgcolor: "#ffffff",
        color: "#0f172a",
        display: "flex",
        flexDirection: "column",
        borderRight: "1px solid #e2e8f0",
        p: 2.5,
      }}
    >
      {/* Brand Header - Text Webliix Removed, Logo Enlarged */}
      <Box sx={{ mb: 3.5, display: "flex", alignItems: "center", justifyContent: "flex-start", pt: 0.5 }}>
        <Box
          component="img"
          src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
          alt="Client Portal"
          sx={{ height: 42, maxWidth: 170, objectFit: "contain" }}
        />
      </Box>

      {/* Nav List with Crisp Square Buttons */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", gap: 0.75 }}>
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
                    color: active ? "#0f172a" : "#64748b",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {item.icon}
                </Box>
              }
              sx={{
                justifyContent: "flex-start",
                px: 2,
                py: 1.2,
                borderRadius: "6px",
                fontWeight: active ? 800 : 600,
                fontSize: "0.86rem",
                textTransform: "none",
                color: active ? "#0f172a" : "#64748b",
                bgcolor: active ? "#f1f5f9" : "transparent",
                border: active ? "1px solid #e2e8f0" : "1px solid transparent",
                boxShadow: "none",
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: active ? "#f1f5f9" : "#f8fafc",
                  color: "#0f172a",
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
            py: 1.2,
            borderRadius: "6px",
            fontWeight: 600,
            fontSize: "0.86rem",
            textTransform: "none",
            color: "#64748b",
            mt: 1.5,
            "&:hover": {
              bgcolor: "#fef2f2",
              color: "#ef4444",
            },
          }}
        >
          Log out
        </Button>
      </Box>

      {/* User Profile Square Card at Bottom of Sidebar */}
      <Box
        component={Link}
        to="/profile"
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          p: 1.5,
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          bgcolor: "#f8fafc",
          textDecoration: "none",
          transition: "background-color 0.15s ease",
          "&:hover": { bgcolor: "#f1f5f9" },
        }}
      >
        <Avatar
          sx={{
            width: 36,
            height: 36,
            bgcolor: "#0f172a",
            color: "#ffffff",
            fontWeight: 800,
            fontSize: "0.85rem",
            borderRadius: "6px",
          }}
        >
          {(user?.name || "C").charAt(0).toUpperCase()}
        </Avatar>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="body2" fontWeight={800} color="#0f172a" noWrap>
            {user?.name || "Client Account"}
          </Typography>
          <Typography variant="caption" color="#64748b" sx={{ fontSize: "0.72rem", display: "block" }} noWrap>
            {user?.email || "Settings & Profile"}
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
          width: 240,
          zIndex: 40,
        }}
      >
        {sidebarContent}
      </Box>

      {/* Main Content Area */}
      <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, ml: { xs: 0, md: "240px" } }}>
        {/* Top Header Bar */}
        <Box
          sx={{
            px: { xs: 2.5, md: 4 },
            py: 2.5,
            bgcolor: "#ffffff",
            borderBottom: "1px solid #e2e8f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: 2,
          }}
        >
          {/* Prominent High-Contrast Greeting on Left */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <IconButton
              onClick={() => setMobileOpen(true)}
              sx={{ display: { xs: "inline-flex", md: "none" }, p: 0.5, borderRadius: "6px" }}
            >
              <MenuIcon />
            </IconButton>

            <Box>
              <Typography
                variant="h4"
                fontWeight={900}
                color="#0f172a"
                letterSpacing="-0.03em"
                sx={{
                  fontSize: { xs: "1.45rem", sm: "1.75rem", md: "2rem" },
                  lineHeight: 1.15,
                }}
              >
                Hello, {firstName} 👋
              </Typography>
              <Typography variant="body2" sx={{ color: "#475569", fontSize: "0.86rem", fontWeight: 600, mt: 0.35 }}>
                Today is {formattedToday}
              </Typography>
            </Box>
          </Box>

          {/* Action Buttons on Right */}
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            {/* Search Square Button */}
            <Tooltip title="Search projects">
              <IconButton
                onClick={() => navigate("/projects")}
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  width: 38,
                  height: 38,
                  borderRadius: "6px",
                  color: "#0f172a",
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}
              >
                <SearchIcon fontSize="small" />
              </IconButton>
            </Tooltip>

            {/* Notification Bell Square Button with Badge */}
            <Tooltip title="Notifications">
              <IconButton
                onClick={() => setNotifDrawerOpen(true)}
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  width: 38,
                  height: 38,
                  borderRadius: "6px",
                  color: "#0f172a",
                  "&:hover": { bgcolor: "#f1f5f9" },
                }}
              >
                <Badge badgeContent={unreadCount} color="error" variant="dot">
                  <NotificationsNoneOutlinedIcon fontSize="small" />
                </Badge>
              </IconButton>
            </Tooltip>

            {/* + New projects Square Button */}
            <Button
              variant="contained"
              startIcon={<AddIcon sx={{ fontSize: 17 }} />}
              onClick={() => setOpenNewProjectModal(true)}
              sx={{
                bgcolor: "#0f172a",
                color: "#ffffff",
                px: 2.25,
                py: 0.95,
                borderRadius: "6px",
                fontWeight: 800,
                fontSize: "0.85rem",
                textTransform: "none",
                boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
                "&:hover": {
                  bgcolor: "#1e293b",
                },
              }}
            >
              + New projects
            </Button>
          </Box>
        </Box>

        {/* Content Body with Proper Spacing Rule */}
        <Box component="main" sx={{ flex: 1, p: { xs: 2.5, md: 4 }, pb: { xs: 9, md: 4 }, minWidth: 0, overflowX: "hidden" }}>
          {children}
        </Box>

        {/* Mobile Bottom Navigation Bar */}
        <Paper
          elevation={4}
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
              height: 56,
              "& .MuiBottomNavigationAction-root": {
                minWidth: "auto",
                px: 1,
                color: "#64748b",
                "&.Mui-selected": { color: "#0f172a", fontWeight: 800 },
              },
            }}
          >
            <BottomNavigationAction label="Dashboard" value="/dashboard" icon={<DashboardOutlinedIcon sx={{ fontSize: 19 }} />} />
            <BottomNavigationAction label="Projects" value="/projects" icon={<FolderSpecialOutlinedIcon sx={{ fontSize: 19 }} />} />
            <BottomNavigationAction label="Invoices" value="/invoices" icon={<ReceiptLongOutlinedIcon sx={{ fontSize: 19 }} />} />
            <BottomNavigationAction label="Chat" value="/tickets" icon={<ForumOutlinedIcon sx={{ fontSize: 19 }} />} />
            <BottomNavigationAction label="Profile" value="/profile" icon={<PersonOutlinedIcon sx={{ fontSize: 19 }} />} />
          </BottomNavigation>
        </Paper>

        {/* Notification Drawer */}
        <ClientNotificationDrawer
          open={notifDrawerOpen}
          onClose={() => setNotifDrawerOpen(false)}
          onUnreadChange={(count: number) => setUnreadCount(count)}
        />

        {/* Floating Chat Widget */}
        <ClientFloatingChatWidget />

        {/* New Project / Inquiry Square Modal */}
        <Dialog
          open={openNewProjectModal}
          onClose={() => setOpenNewProjectModal(false)}
          maxWidth="sm"
          fullWidth
          PaperProps={{ sx: { borderRadius: "8px", p: 1 } }}
        >
          <DialogTitle sx={{ fontWeight: 800, color: "#0f172a", pb: 1 }}>Submit Project Inquiry / Request</DialogTitle>
          <DialogContent dividers sx={{ borderColor: "#f1f5f9" }}>
            <Box sx={{ display: "grid", gap: 2.5, pt: 1 }}>
              <TextField
                select
                label="Request Type"
                fullWidth
                value={inquiryType}
                onChange={(e) => setInquiryType(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
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
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
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
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenNewProjectModal(false)} sx={{ fontWeight: 700, color: "#64748b", borderRadius: "6px" }}>
              Cancel
            </Button>
            <Button
              variant="contained"
              disabled={!inquiryTitle.trim() || !inquiryDetails.trim() || submittingInquiry}
              onClick={handleCreateInquiry}
              sx={{ bgcolor: "#0f172a", "&:hover": { bgcolor: "#1e293b" }, fontWeight: 800, borderRadius: "6px", px: 3 }}
            >
              {submittingInquiry ? "Submitting..." : "Send Request"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </Box>
  );
}
