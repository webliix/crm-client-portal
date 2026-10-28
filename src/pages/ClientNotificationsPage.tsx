import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";

// Icons
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import FolderSpecialOutlinedIcon from "@mui/icons-material/FolderSpecialOutlined";
import ReceiptLongOutlinedIcon from "@mui/icons-material/ReceiptLongOutlined";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ArticleOutlinedIcon from "@mui/icons-material/ArticleOutlined";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import { tokens } from "../theme/tokens";
import { notificationApi, type ClientNotificationItem } from "../services/notificationApi";
import { BrandLoader } from "../components/common/BrandLoader";

export default function ClientNotificationsPage() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<ClientNotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterTab, setFilterTab] = useState<string>("ALL");

  const loadNotifications = async () => {
    try {
      const list = await notificationApi.getMyNotifications();
      if (Array.isArray(list) && list.length > 0) {
        setNotifications(list);
      } else {
        // Sample starter notifications if empty
        setNotifications([
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
        ]);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, []);

  const handleItemClick = async (item: ClientNotificationItem) => {
    if (item.status === "UNREAD" && item.id) {
      await notificationApi.markAsRead(item.id);
      setNotifications((prev) =>
        prev.map((n) => (n.id === item.id ? { ...n, status: "READ" } : n))
      );
    }
    const route = notificationApi.resolveRoute(item);
    navigate(route);
  };

  const handleMarkAllRead = async () => {
    await notificationApi.markAllAsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, status: "READ" })));
  };

  const handleClearAll = async () => {
    await notificationApi.clearAll();
    setNotifications([]);
  };

  const filtered = notifications.filter((item) => {
    if (filterTab === "UNREAD") return item.status === "UNREAD";
    if (filterTab === "PROJECTS") return item.referenceType === "PROJECT";
    if (filterTab === "INVOICES") return item.referenceType === "INVOICE";
    if (filterTab === "ARTICLES") return item.referenceType === "ARTICLE" || item.referenceType === "BLOG" || item.referenceType === "NEWSLETTER";
    return true;
  });

  const getIconForType = (type?: string) => {
    const t = (type || "").toUpperCase();
    if (t === "PROJECT") return <FolderSpecialOutlinedIcon sx={{ color: "#10b981" }} />;
    if (t === "INVOICE") return <ReceiptLongOutlinedIcon sx={{ color: "#6366f1" }} />;
    if (t === "TICKET") return <ForumOutlinedIcon sx={{ color: "#f59e0b" }} />;
    if (t === "ARTICLE" || t === "BLOG" || t === "NEWSLETTER") return <ArticleOutlinedIcon sx={{ color: "#ec4899" }} />;
    return <NotificationsNoneOutlinedIcon sx={{ color: "#64748b" }} />;
  };

  if (loading) {
    return (
      <Box sx={{ py: 12, textAlign: "center" }}>
        <BrandLoader message="Loading notification center..." size="medium" />
      </Box>
    );
  }

  const unreadCount = notifications.filter((n) => n.status === "UNREAD").length;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      {/* Header */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h5" fontWeight={900} letterSpacing="-0.02em" color="#0f172a">
              Notification Center
            </Typography>
            <Chip
              label={`${unreadCount} Unread`}
              size="small"
              sx={{ fontWeight: 800, bgcolor: "#111827", color: "#ffffff" }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Stay informed with real-time project updates, invoices, article links, and team replies.
          </Typography>
        </Box>

        <Box sx={{ display: "flex", gap: 1.5 }}>
          <Button
            variant="outlined"
            startIcon={<DoneAllIcon />}
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0}
            sx={{ borderRadius: "9999px", fontWeight: 700, textTransform: "none" }}
          >
            Mark all read
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteOutlineIcon />}
            onClick={handleClearAll}
            disabled={notifications.length === 0}
            sx={{ borderRadius: "9999px", fontWeight: 700, textTransform: "none" }}
          >
            Clear all
          </Button>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: "1px solid #e2e8f0" }}>
        <Tabs
          value={filterTab}
          onChange={(_, v) => setFilterTab(v)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 800, fontSize: "0.875rem" },
          }}
        >
          <Tab label={`All (${notifications.length})`} value="ALL" />
          <Tab label={`Unread (${unreadCount})`} value="UNREAD" />
          <Tab label="Projects" value="PROJECTS" />
          <Tab label="Invoices" value="INVOICES" />
          <Tab label="Articles & News" value="ARTICLES" />
        </Tabs>
      </Box>

      {/* Notifications List */}
      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {filtered.length === 0 ? (
          <Card sx={{ p: 8, textAlign: "center", borderRadius: "18px", border: "1px solid #e2e8f0" }}>
            <NotificationsNoneOutlinedIcon sx={{ fontSize: 56, color: "#cbd5e1", mb: 2 }} />
            <Typography variant="h6" fontWeight={800} color="#64748b" gutterBottom>
              No notifications found
            </Typography>
            <Typography variant="body2" color="#94a3b8">
              All caught up! Check back later for milestones and newsletter updates.
            </Typography>
          </Card>
        ) : (
          filtered.map((item) => {
            const isUnread = item.status === "UNREAD";
            return (
              <Card
                key={item.id}
                onClick={() => handleItemClick(item)}
                sx={{
                  borderRadius: "16px",
                  border: "1px solid",
                  borderColor: isUnread ? "#cbd5e1" : "#f1f5f9",
                  bgcolor: isUnread ? "#ffffff" : "#f8fafc",
                  cursor: "pointer",
                  boxShadow: isUnread ? "0 4px 12px rgba(0,0,0,0.04)" : "none",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    transform: "translateX(3px)",
                    borderColor: "#94a3b8",
                  },
                }}
              >
                <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2, minWidth: 260, flex: 1 }}>
                    <Avatar sx={{ width: 44, height: 44, bgcolor: "#ffffff", border: "1px solid #e2e8f0" }}>
                      {getIconForType(item.referenceType)}
                    </Avatar>
                    <Box>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                        <Typography variant="subtitle1" fontWeight={800} color="#0f172a">
                          {item.title}
                        </Typography>
                        {isUnread && (
                          <Chip label="NEW" size="small" color="primary" sx={{ height: 18, fontSize: "0.625rem", fontWeight: 800 }} />
                        )}
                      </Box>
                      <Typography variant="body2" color="#64748b" sx={{ maxWidth: 700, lineHeight: 1.4 }}>
                        {item.message}
                      </Typography>
                    </Box>
                  </Box>

                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Typography variant="caption" color="#94a3b8" sx={{ fontSize: "0.75rem" }}>
                      {item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}
                    </Typography>
                    <Button
                      size="small"
                      endIcon={<ArrowForwardIosIcon sx={{ fontSize: "11px !important" }} />}
                      sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.8125rem", color: "#111827" }}
                    >
                      Open
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })
        )}
      </Box>
    </Box>
  );
}
