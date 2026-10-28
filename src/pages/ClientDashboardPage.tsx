import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import IconButton from "@mui/material/IconButton";
import LinearProgress from "@mui/material/LinearProgress";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";

// Icons
import MoreVertIcon from "@mui/icons-material/MoreVert";
import TuneIcon from "@mui/icons-material/Tune";
import NorthEastIcon from "@mui/icons-material/NorthEast";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PauseIcon from "@mui/icons-material/Pause";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import AddIcon from "@mui/icons-material/Add";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { projectApi, type ClientProject } from "../services/projectApi";
import { invoiceApi } from "../services/invoiceApi";
import { ticketApi } from "../services/ticketApi";
import { BrandLoader } from "../components/common/BrandLoader";
import { ClientDashboardSkeleton } from "../components/common/ClientSkeleton";
import { IsometricCubeIllustration, GeometricBadge } from "../components/common/PortalIllustrations";

export default function ClientDashboardPage() {
  const navigate = useNavigate();
  const user = authService.getCurrentUser();

  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [invoicesCount, setInvoicesCount] = useState<number>(0);
  const [ticketsCount, setTicketsCount] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);

  // Time tracker mini widget state
  const [timerRunning, setTimerRunning] = useState<boolean>(true);

  // 3-dots menu anchor
  const [menuAnchor, setMenuAnchor] = useState<{ el: HTMLElement | null; projectId: number | null }>({
    el: null,
    projectId: null,
  });

  useEffect(() => {
    Promise.all([
      projectApi.getMyProjects(),
      invoiceApi.getMyInvoices(),
      ticketApi.getMyTickets(),
    ])
      .then(([pList, iList, tList]) => {
        setProjects(Array.isArray(pList) ? pList : []);
        setInvoicesCount(Array.isArray(iList) ? iList.length : 0);
        setTicketsCount(Array.isArray(tList) ? tList.length : 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  // Format today's date for Calendar
  const todayDateStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date());

  const upcomingDateStr = new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(Date.now() + 86400000 * 2));

  // 3 Hero Projects matching reference design pastel cards
  const heroCards = [
    {
      id: projects[0]?.id || 101,
      title: projects[0]?.projectName || "Web Development",
      tasksLabel: "10 tasks | 46%",
      progress: projects[0]?.progressPercentage || 46,
      badgeType: "cube" as const,
      palette: tokens.colors.pastel.mint,
    },
    {
      id: projects[1]?.id || 102,
      title: projects[1]?.projectName || "Mobile App Design",
      tasksLabel: "12 tasks | 90%",
      progress: projects[1]?.progressPercentage || 90,
      badgeType: "hexagon" as const,
      palette: tokens.colors.pastel.lilac,
    },
    {
      id: projects[2]?.id || 103,
      title: projects[2]?.projectName || "UX Research Summary",
      tasksLabel: "5 tasks | 73%",
      progress: projects[2]?.progressPercentage || 73,
      badgeType: "star" as const,
      palette: tokens.colors.pastel.blush,
    },
  ];

  // Tasks for today
  const tasksForToday = [
    {
      id: 1,
      title: "Mobile app",
      subtitle: "Prepare Figma file",
      badgeType: "diamond" as const,
      time: "3h",
    },
    {
      id: 2,
      title: "UX Wireframes",
      subtitle: "Design Sign in flow",
      badgeType: "cube" as const,
      time: "2h",
    },
    {
      id: 3,
      title: "Mobile app",
      subtitle: "Research",
      badgeType: "rings" as const,
      time: "8h",
    },
    {
      id: 4,
      title: "App Flow",
      subtitle: "Work on comments",
      badgeType: "hexagon" as const,
      time: "1h",
    },
  ];

  // Timeline schedule items
  const calendarTimeline = [
    {
      groupDate: todayDateStr,
      events: [
        { time: "10:00", title: "Dribble shot", subtitle: "Fintech app" },
        { time: "13:30", title: "Design", subtitle: "Task management" },
      ],
    },
    {
      groupDate: upcomingDateStr,
      events: [
        { time: "10:00", title: "UX Research", subtitle: "Insurance corp" },
        { time: "14:00", title: "Design", subtitle: "Team meeting" },
        { time: "15:30", title: "Traffic analysis", subtitle: "Insurance corp" },
        { time: "17:00", title: "Summary", subtitle: "Insurance corp" },
      ],
    },
  ];

  if (loading) {
    return <ClientDashboardSkeleton />;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
      {/* 1. TOP HERO SECTION: 3 Pastel Cards Matching Reference Image */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "repeat(3, 1fr)" },
          gap: 3,
        }}
      >
        {heroCards.map((card) => {
          return (
            <Card
              key={card.id}
              onClick={() => {
                if (projects.length > 0 && card.id) {
                  navigate(`/projects/${card.id}`);
                } else {
                  navigate("/projects");
                }
              }}
              sx={{
                bgcolor: card.palette.bg,
                border: `1px solid ${card.palette.border}`,
                borderRadius: "20px",
                p: 2.75,
                boxShadow: "none",
                cursor: "pointer",
                transition: "all 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
                position: "relative",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 24px -4px rgba(0,0,0,0.06)",
                },
              }}
            >
              {/* Top Row: Geometric Icon Badge & 3-Dots Menu */}
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 3 }}>
                <GeometricBadge type={card.badgeType} size={36} />
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    setMenuAnchor({ el: e.currentTarget, projectId: card.id });
                  }}
                  sx={{ color: "#475569", p: 0.5 }}
                >
                  <MoreVertIcon fontSize="small" />
                </IconButton>
              </Box>

              {/* Title */}
              <Typography
                variant="h6"
                fontWeight={800}
                letterSpacing="-0.02em"
                sx={{ color: card.palette.title, fontSize: "1.15rem", lineHeight: 1.3, mb: 1 }}
              >
                {card.title}
              </Typography>

              {/* Tasks / Progress Text */}
              <Typography
                variant="caption"
                fontWeight={700}
                sx={{ color: card.palette.text, fontSize: "0.8125rem", display: "block", mb: 1.25 }}
              >
                {card.tasksLabel}
              </Typography>

              {/* Dark Progress Bar */}
              <Box sx={{ width: "100%", bgcolor: "rgba(0, 0, 0, 0.08)", borderRadius: "9999px", height: 5, overflow: "hidden" }}>
                <Box
                  sx={{
                    width: `${card.progress}%`,
                    height: "100%",
                    bgcolor: card.palette.bar,
                    borderRadius: "9999px",
                  }}
                />
              </Box>
            </Card>
          );
        })}
      </Box>

      {/* 2. MAIN BOTTOM GRID: Left (Tasks) | Middle (Widgets & Promo) | Right (Calendar) */}
      <Box
        sx={{
          display: "grid",
          gridTemplateColumns: { xs: "1fr", lg: "1.05fr 1fr 1.05fr" },
          gap: 3.5,
          alignItems: "start",
        }}
      >
        {/* COLUMN 1: Task for today */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={900} letterSpacing="-0.02em" color="#0f172a">
              Task for today
            </Typography>
            <IconButton size="small" onClick={() => navigate("/projects")} sx={{ color: "#64748b" }}>
              <TuneIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* List of Tasks */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
            {tasksForToday.map((task) => (
              <Box
                key={task.id}
                onClick={() => navigate("/projects")}
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  p: 1.5,
                  borderRadius: "14px",
                  bgcolor: "#ffffff",
                  border: "1px solid #f1f5f9",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  "&:hover": {
                    bgcolor: "#f8fafc",
                    borderColor: "#e2e8f0",
                    transform: "translateX(2px)",
                  },
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.75 }}>
                  <GeometricBadge type={task.badgeType} size={38} />
                  <Box>
                    <Typography variant="subtitle2" fontWeight={800} color="#111827" sx={{ lineHeight: 1.25 }}>
                      {task.title}
                    </Typography>
                    <Typography variant="caption" color="#94a3b8" sx={{ fontSize: "0.75rem" }}>
                      {task.subtitle}
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, color: "#94a3b8" }}>
                  <Typography variant="caption" fontWeight={700} sx={{ fontSize: "0.8rem", color: "#64748b" }}>
                    🕒 {task.time}
                  </Typography>
                </Box>
              </Box>
            ))}
          </Box>
        </Box>

        {/* COLUMN 2: Widgets & Featured Article / Guidelines Card */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <Typography variant="h6" fontWeight={900} letterSpacing="-0.02em" color="#0f172a">
              Widgets
            </Typography>
            <IconButton size="small" onClick={() => navigate("/articles")} sx={{ color: "#64748b" }}>
              <NorthEastIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Top 2 Mini Cards: Timer / Tracker + New Widget Action */}
          <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 2 }}>
            {/* Widget A: Sprint / Hours Tracker */}
            <Card
              sx={{
                bgcolor: "#ede9fe",
                borderRadius: "18px",
                p: 2,
                boxShadow: "none",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                minHeight: 120,
              }}
            >
              <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box
                  onClick={() => setTimerRunning(!timerRunning)}
                  sx={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    bgcolor: "#111827",
                    color: "#ffffff",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                  }}
                >
                  {timerRunning ? <PauseIcon sx={{ fontSize: 14 }} /> : <PlayArrowIcon sx={{ fontSize: 14 }} />}
                </Box>
                <Typography variant="caption" fontWeight={800} color="#111827">
                  01:35
                </Typography>
                <ArrowUpwardIcon sx={{ fontSize: 14, color: "#111827" }} />
              </Box>

              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 1 }}>
                {/* Mini Pie / Donut SVG Graphic */}
                <Box
                  component="svg"
                  width="36"
                  height="36"
                  viewBox="0 0 36 36"
                  sx={{ transform: "rotate(-90deg)" }}
                >
                  <circle cx="18" cy="18" r="14" fill="transparent" stroke="#ddd6fe" strokeWidth="5" />
                  <circle
                    cx="18"
                    cy="18"
                    r="14"
                    fill="transparent"
                    stroke="#111827"
                    strokeWidth="5"
                    strokeDasharray="88"
                    strokeDashoffset="54"
                    strokeLinecap="round"
                  />
                </Box>
                <Box>
                  <Typography variant="body2" fontWeight={800} color="#111827" sx={{ lineHeight: 1 }}>
                    2/7
                  </Typography>
                  <Typography variant="caption" color="#64748b" sx={{ fontSize: "0.6875rem" }}>
                    hours
                  </Typography>
                </Box>
              </Box>
            </Card>

            {/* Widget B: New Widget / Quick Action Dashed Card */}
            <Card
              onClick={() => navigate("/invoices")}
              sx={{
                bgcolor: "#f1f5f9",
                borderRadius: "18px",
                border: "1.5px dashed #cbd5e1",
                p: 2,
                boxShadow: "none",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: 1,
                cursor: "pointer",
                minHeight: 120,
                transition: "all 0.15s ease",
                "&:hover": {
                  bgcolor: "#e2e8f0",
                },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  bgcolor: "#111827",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <AddIcon sx={{ fontSize: 18 }} />
              </Box>
              <Typography variant="caption" fontWeight={700} color="#111827">
                Billing & Pay
              </Typography>
            </Card>
          </Box>

          {/* Bottom Featured Banner: Dark Card with 3D Isometric Illustration */}
          <Card
            onClick={() => navigate("/articles")}
            sx={{
              bgcolor: "#000000",
              color: "#ffffff",
              borderRadius: "20px",
              p: 2.75,
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              minHeight: 175,
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "translateY(-2px)",
              },
            }}
          >
            {/* 3D Isometric Geometric Illustration Background */}
            <Box
              sx={{
                position: "absolute",
                right: -20,
                top: -10,
                width: 200,
                height: 180,
                pointerEvents: "none",
                opacity: 0.95,
              }}
            >
              <IsometricCubeIllustration width="100%" height="100%" />
            </Box>

            <Box sx={{ position: "relative", zIndex: 2, maxWidth: 170 }}>
              <Typography
                variant="h6"
                fontWeight={900}
                letterSpacing="-0.02em"
                sx={{ color: "#ffffff", lineHeight: 1.25, mb: 0.5 }}
              >
                Product guidelines
              </Typography>
            </Box>

            <Box sx={{ position: "relative", zIndex: 2, display: "flex", alignItems: "center", gap: 0.75, mt: 3 }}>
              <Typography variant="caption" fontWeight={800} sx={{ color: "#f8fafc", fontSize: "0.8125rem" }}>
                Find out more
              </Typography>
              <ArrowForwardIcon sx={{ fontSize: 14, color: "#f8fafc" }} />
            </Box>
          </Card>
        </Box>

        {/* COLUMN 3: Calendar & Timeline Schedule */}
        <Box sx={{ display: "flex", flexDirection: "column" }}>
          {/* Header */}
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Typography variant="h6" fontWeight={900} letterSpacing="-0.02em" color="#0f172a">
              Calendar
            </Typography>
            <IconButton size="small" sx={{ color: "#111827" }}>
              <CalendarMonthIcon fontSize="small" />
            </IconButton>
          </Box>

          {/* Timeline Groups */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
            {calendarTimeline.map((group, gIdx) => (
              <Box key={gIdx}>
                {/* Date Header */}
                <Typography variant="caption" fontWeight={700} color="#94a3b8" sx={{ fontSize: "0.8rem", mb: 1.5, display: "block" }}>
                  {group.groupDate}
                </Typography>

                {/* Timeline Events */}
                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.75 }}>
                  {group.events.map((evt, eIdx) => (
                    <Box
                      key={eIdx}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2,
                        p: 1.25,
                        borderRadius: "12px",
                        transition: "background-color 0.15s ease",
                        "&:hover": { bgcolor: "#ffffff" },
                      }}
                    >
                      {/* Time Column */}
                      <Typography
                        variant="body2"
                        fontWeight={800}
                        color="#111827"
                        sx={{ width: 50, fontSize: "0.875rem", fontFamily: "monospace" }}
                      >
                        {evt.time}
                      </Typography>

                      {/* Black Vertical Separator Line */}
                      <Box sx={{ width: 2.5, height: 26, bgcolor: "#111827", borderRadius: 1 }} />

                      {/* Content */}
                      <Box>
                        <Typography variant="body2" fontWeight={800} color="#111827" sx={{ lineHeight: 1.25 }}>
                          {evt.title}
                        </Typography>
                        <Typography variant="caption" color="#94a3b8" sx={{ fontSize: "0.75rem" }}>
                          {evt.subtitle}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </Box>
            ))}
          </Box>
        </Box>
      </Box>

      {/* Menu for Hero Cards */}
      <Menu
        anchorEl={menuAnchor.el}
        open={Boolean(menuAnchor.el)}
        onClose={() => setMenuAnchor({ el: null, projectId: null })}
        PaperProps={{
          sx: { borderRadius: "12px", boxShadow: tokens.shadows.md, border: "1px solid #e2e8f0" },
        }}
      >
        <MenuItem
          onClick={() => {
            const pid = menuAnchor.projectId;
            setMenuAnchor({ el: null, projectId: null });
            if (pid) navigate(`/projects/${pid}`);
          }}
          sx={{ fontSize: "0.875rem", fontWeight: 700 }}
        >
          View Project Details
        </MenuItem>
        <MenuItem
          onClick={() => {
            setMenuAnchor({ el: null, projectId: null });
            navigate("/tickets");
          }}
          sx={{ fontSize: "0.875rem", fontWeight: 700 }}
        >
          Open Support Inquiry
        </MenuItem>
      </Menu>
    </Box>
  );
}
