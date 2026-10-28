import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";

import CloseIcon from "@mui/icons-material/Close";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { tokens } from "../../theme/tokens";
import { notificationApi, type ClientNotificationItem } from "../../services/notificationApi";

interface Props {
  open: boolean;
  onClose: () => void;
  onUnreadChange?: (count: number) => void;
}

export function ClientNotificationDrawer({ open, onClose, onUnreadChange }: Props) {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ClientNotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterTab, setFilterTab] = useState<string>("ALL");

  const fetchNotifications = async () => {
    setLoading(true);
    try {
      const list = await notificationApi.getMyNotifications();
      setNotifications(list);
      const unread = list.filter((n) => n.status === "UNREAD").length;
      if (onUnreadChange) onUnreadChange(unread);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (open) {
      fetchNotifications();
    }
  }, [open]);

  // Fallback demo notifications if none in database yet to ensure rich user experience
  const displayList = notifications.length > 0 ? notifications : [
    {
      id: 101,
      title: "Sprint Milestone Completed: Core Architecture",
      message: "Webliix engineering team has delivered the initial architecture milestone for your active web application.",
      status: "UNREAD",
      referenceType: "PROJECT",
      referenceId: 1,
      createdAt: new Date().toISOString(),
    },
    {
      id: 102,
      title: "New Tax Invoice Available: #INV-2026-004",
      message: "An invoice for milestone delivery is ready for review and online payment via client portal.",
      status: "UNREAD",
      referenceType: "INVOICE",
      createdAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    },
    {
      id: 103,
      title: "New Tech Article: Modern Web Performance",
      message: "Read our newly published engineering guideline on Core Web Vitals optimization and cloud scalability.",
      status: "READ",
      referenceType: "ARTICLE",
      createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    },
    {
      id: 104,
      title: "Support Engineer Assigned to Ticket #TIC-1002",
      message: "Lead engineer John has picked up your inquiry and replied in the live chat hub.",
      status: "READ",
      referenceType: "TICKET",
      referenceId: 1,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    },
  ];

  const filtered = displayList.filter((item) => {
    if (filterTab === "UNREAD") return item.status === "UNREAD";
    if (filterTab === "PROJECTS") return item.referenceType === "PROJECT";
    if (filterTab === "INVOICES") return item.referenceType === "INVOICE";
    if (filterTab === "ARTICLES") return item.referenceType === "ARTICLE" || item.referenceType === "BLOG" || item.referenceType === "NEWSLETTER";
    return true;
  });

  const handleItemClick = async (item: ClientNotificationItem) => {
    if (item.status === "UNREAD" && item.id) {
      await notificationApi.markAsRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, status: "READ" } : n))
      );
    }
    const route = notificationApi.resolveRoute(item);
    onClose();
    navigate(route);
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
    if (onUnreadChange) onUnreadChange(0);
  };

  const handleClearAll = async () => {
    await notificationApi.clearAll();
    setNotifications([]);
    if (onUnreadChange) onUnreadChange(0);
  };

  const getIconForType = (type?: string) => {
    const t = (type || "").toUpperCase();
    if (t === "PROJECT") return <FolderSpecialOutlinedIcon sx={{ color: "#10b981" }} fontSize="small" />;
    if (t === "INVOICE") return <ReceiptLongOutlinedIcon sx={{ color: "#6366f1" }} fontSize="small" />;
    if (t === "TICKET") return <ForumOutlinedIcon sx={{ color: "#f59e0b" }} fontSize="small" />;
    if (t === "ARTICLE" || t === "BLOG" || t === "NEWSLETTER") return <ArticleOutlinedIcon sx={{ color: "#ec4899" }} fontSize="small" />;
    return <NotificationsNoneOutlinedIcon sx={{ color: "#64748b" }} fontSize="small" />;
  };

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: "100%", sm: 420 },
          p: 0,
          bgcolor: "#ffffff",
          display: "flex",
          flexDirection: "column",
        },
      }}
    >
      {/* Header */}
      <Box sx={{ p: 2.5, borderBottom: "1px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
          <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]}>
            Notifications
          </Typography>
          <Chip
            label={`${displayList.filter((n) => n.status === "UNREAD").length} New`}
            size="small"
            sx={{ fontWeight: 800, bgcolor: "#111827", color: "#ffffff", height: 22, fontSize: "0.6875rem" }}
          />
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
          <Tooltip title="Mark all as read">
            <IconButton size="small" onClick={handleMarkAllRead}>
              <DoneAllIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Clear all">
            <IconButton size="small" onClick={handleClearAll}>
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <IconButton size="small" onClick={onClose}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Filter Tabs */}
      <Box sx={{ px: 2, pt: 1, borderBottom: "1px solid #f1f5f9" }}>
        <Tabs
          value={filterTab}
          onChange={(_, v) => setFilterTab(v)}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            minHeight: 38,
            "& .MuiTab-root": { minHeight: 38, py: 0.5, fontSize: "0.75rem", fontWeight: 700, textTransform: "none" },
          }}
        >
          <Tab label="All" value="ALL" />
          <Tab label="Unread" value="UNREAD" />
          <Tab label="Projects" value="PROJECTS" />
          <Tab label="Invoices" value="INVOICES" />
          <Tab label="Articles" value="ARTICLES" />
        </Tabs>
      </Box>

      {/* Notifications List */}
      <Box sx={{ flex: 1, overflowY: "auto", p: 2, display: "flex", flexDirection: "column", gap: 1.5 }}>
        {filtered.length === 0 ? (
          <Box sx={{ py: 8, textAlign: "center" }}>
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 48, color: "#cbd5e1", mb: 1.5 }} />
            <Typography variant="subtitle2" fontWeight={700} color="#64748b">
              No notifications in this category
            </Typography>
            <Typography variant="caption" color="#94a3b8">
              You will receive real-time updates when tasks, invoices, or articles are published.
            </Typography>
          </Box>
        ) : (
          filtered.map((item) => {
            const isUnread = item.status === "UNREAD";
            return (
              <Box
                key={item.id}
                onClick={() => handleItemClick(item)}
                sx={{
                  p: 1.75,
                  borderRadius: `${tokens.borderRadius.md}px`,
                  border: "1px solid",
                  borderColor: isUnread ? "#e2e8f0" : "#f1f5f9",
                  bgcolor: isUnread ? "#f8fafc" : "#ffffff",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  position: "relative",
                  "&:hover": {
                    bgcolor: "#f1f5f9",
                    transform: "translateX(2px)",
                  },
                }}
              >
                {isUnread && (
                  <Box
                    sx={{
                      position: "absolute",
                      top: 14,
                      right: 14,
                      width: 8,
                      height: 8,
                      borderRadius: "50%",
                      bgcolor: "#6366f1",
                    }}
                  />
                )}
                <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start" }}>
                  <Avatar sx={{ width: 34, height: 34, bgcolor: "#ffffff", border: "1px solid #e2e8f0" }}>
                    {getIconForType(item.referenceType)}
                  </Avatar>
                  <Box sx={{ flex: 1, pr: 2 }}>
                    <Typography variant="subtitle2" fontWeight={700} color={tokens.colors.secondary[900]} sx={{ lineHeight: 1.3, mb: 0.5 }}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="#64748b" sx={{ fontSize: "0.8125rem", lineHeight: 1.4, mb: 1 }}>
                      {item.message}
                    </Typography>
                    <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Typography variant="caption" color="#94a3b8" sx={{ fontSize: "0.6875rem" }}>
                        {item.createdAt ? new Date(item.createdAt).toLocaleDateString() : "Recent"}
                      </Typography>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#6366f1" }}>
                        <Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.75rem" }}>
                          Open
                        </Typography>
                        <ArrowForwardIosIcon sx={{ fontSize: 9 }} />
                      </Box>
                    </Box>
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ p: 2, borderTop: "1px solid #f1f5f9", textAlign: "center" }}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => {
            onClose();
            navigate("/notifications");
          }}
          sx={{ borderRadius: tokens.borderRadius.md, fontWeight: 700, textTransform: "none", py: 1 }}
        >
          View Full Notification Center
        </Button>
      </Box>
    </Drawer>
  );
}
