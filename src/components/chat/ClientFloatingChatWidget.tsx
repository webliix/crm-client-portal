import React, { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import Paper from "@mui/material/Paper";
import Badge from "@mui/material/Badge";
import Fab from "@mui/material/Fab";

import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import CloseIcon from "@mui/icons-material/Close";
import SendIcon from "@mui/icons-material/Send";
import ChatIcon from "@mui/icons-material/Chat";
import RefreshIcon from "@mui/icons-material/Refresh";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";

import { tokens } from "../../theme/tokens";
import { authService } from "../../services/authService";
import { ticketApi, type ClientTicket, type TicketComment } from "../../services/ticketApi";

export function ClientFloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTicket, setActiveTicket] = useState<ClientTicket | null>(null);
  const [messages, setMessages] = useState<TicketComment[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputMessage, setInputMessage] = useState("");

  // Initial inquiry form state
  const [problemDescription, setProblemDescription] = useState("");
  const [problemCategory, setProblemCategory] = useState("General Support");
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquiryError, setInquiryError] = useState<string | null>(null);

  // Previous tickets state
  const [existingTickets, setExistingTickets] = useState<ClientTicket[]>([]);
  const [viewHistory, setViewHistory] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const user = authService.getCurrentUser();

  // Scroll messages to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  // Load user tickets on mount
  const loadUserTickets = async () => {
    try {
      const tickets = await ticketApi.getMyTickets();
      setExistingTickets(tickets);
      // Auto-select latest open ticket if available
      const openTicket = tickets.find((t) => t.status === "OPEN" || t.status === "IN_PROGRESS" || t.status === "REOPENED");
      if (openTicket && !activeTicket) {
        setActiveTicket(openTicket);
      }
    } catch (err) {
      console.error("Failed to load user tickets", err);
    }
  };

  useEffect(() => {
    if (user) {
      loadUserTickets();
    }
  }, [isOpen]);

  // Fetch comments for active ticket
  const fetchComments = async (ticketId: number, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const data = await ticketApi.getComments(ticketId);
      setMessages(data || []);

      // Also refresh ticket status and assigned staff
      const updatedTicket = await ticketApi.getTicket(ticketId);
      if (updatedTicket) {
        setActiveTicket(updatedTicket);
      }
    } catch (err) {
      console.error("Failed to load ticket comments", err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  // Setup WebSocket / polling for active ticket
  useEffect(() => {
    if (!activeTicket) return;

    fetchComments(activeTicket.id);

    // Fallback polling every 3 seconds for guaranteed live sync
    const interval = setInterval(() => {
      fetchComments(activeTicket.id, true);
    }, 3000);

    // Try connecting to WebSocket
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const host = window.location.host;
      const wsUrl = `${protocol}//${host}/ws/websocket`;
      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onmessage = (event) => {
        try {
          if (event.data && event.data.includes("topic/tickets")) {
            fetchComments(activeTicket.id, true);
          }
        } catch {
          // ignore parsing error
        }
      };

      ws.onerror = () => {
        // Fallback polling continues
      };
    } catch {
      // ignore WS connection errors in environments where ws is disabled
    }

    return () => {
      clearInterval(interval);
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, [activeTicket?.id]);

  // Handle starting a new live chat inquiry
  const handleStartInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!problemDescription.trim()) return;

    setSubmittingInquiry(true);
    setInquiryError(null);

    try {
      const ticketTitle = `${problemCategory}: ${problemDescription.slice(0, 45)}...`;
      const newTicket = await ticketApi.createTicket(ticketTitle, problemDescription.trim());

      if (newTicket) {
        setActiveTicket(newTicket);
        setProblemDescription("");
        setViewHistory(false);
        await fetchComments(newTicket.id);
        loadUserTickets();
      } else {
        setInquiryError("Failed to initiate live support session. Please try again.");
      }
    } catch (err: any) {
      setInquiryError(err?.response?.data?.message || "Failed to initiate support session.");
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // Handle sending a chat message
  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!activeTicket || !inputMessage.trim() || sending) return;

    const text = inputMessage.trim();
    setInputMessage("");
    setSending(true);

    try {
      const authorName = user?.name || "Client";
      const sent = await ticketApi.addComment(activeTicket.id, text, authorName);
      if (sent) {
        setMessages((prev) => [...prev, sent]);
      } else {
        fetchComments(activeTicket.id, true);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const isClientMessage = (comment: TicketComment) => {
    if (comment.commentedBy === "Client") return true;
    if (user?.name && comment.commentedBy?.toLowerCase() === user.name.toLowerCase()) return true;
    if (user?.email && comment.commentedBy?.toLowerCase().includes(user.email.toLowerCase())) return true;
    return false;
  };

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <Box
          sx={{
            position: "fixed",
            bottom: { xs: 16, sm: 24 },
            right: { xs: 16, sm: 24 },
            zIndex: 1300,
          }}
        >
          <Fab
            color="primary"
            variant="extended"
            onClick={() => setIsOpen(true)}
            sx={{
              bgcolor: tokens.colors.primary.main,
              color: "#ffffff",
              boxShadow: "0 8px 24px rgba(0, 102, 255, 0.35)",
              fontWeight: 800,
              textTransform: "none",
              px: 2.5,
              py: 1.5,
              "&:hover": {
                bgcolor: tokens.colors.primary[700],
              },
            }}
          >
            <SupportAgentIcon sx={{ mr: 1, fontSize: 24 }} />
            Live Chat
          </Fab>
        </Box>
      )}

      {/* Floating Chat Modal / Fullscreen on Mobile */}
      {isOpen && (
        <Paper
          elevation={12}
          sx={{
            position: "fixed",
            // Mobile: Full screen responsive view
            top: { xs: 0, sm: "auto" },
            left: { xs: 0, sm: "auto" },
            right: { xs: 0, sm: 24 },
            bottom: { xs: 0, sm: 24 },
            width: { xs: "100%", sm: 400 },
            height: { xs: "100%", sm: 580 },
            borderRadius: { xs: 0, sm: 3 },
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 1400,
            boxShadow: "0 12px 48px rgba(0, 0, 0, 0.25)",
            border: `1px solid ${tokens.colors.secondary[200]}`,
            bgcolor: "#ffffff",
          }}
        >
          {/* Header */}
          <Box
            sx={{
              p: 2,
              bgcolor: "#0f172a",
              color: "#ffffff",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              {activeTicket && (
                <IconButton
                  size="small"
                  onClick={() => {
                    setActiveTicket(null);
                    setViewHistory(true);
                  }}
                  sx={{ color: "#ffffff", p: 0.5 }}
                >
                  <ArrowBackIcon fontSize="small" />
                </IconButton>
              )}
              <Avatar
                sx={{
                  bgcolor: tokens.colors.primary.main,
                  width: 36,
                  height: 36,
                }}
              >
                <SupportAgentIcon fontSize="small" />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" fontWeight={800} lineHeight={1.2}>
                  Webliix Live Support
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.25 }}>
                  <FiberManualRecordIcon
                    sx={{
                      fontSize: 10,
                      color: activeTicket?.assignedToName ? tokens.colors.success.main : tokens.colors.warning.main,
                    }}
                  />
                  <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 600 }}>
                    {activeTicket?.assignedToName
                      ? `Chatting with ${activeTicket.assignedToName}`
                      : "Support Engineers Online"}
                  </Typography>
                </Box>
              </Box>
            </Box>

            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {activeTicket && (
                <Tooltip title="Refresh conversation">
                  <IconButton
                    size="small"
                    onClick={() => fetchComments(activeTicket.id)}
                    sx={{ color: "#94a3b8", "&:hover": { color: "#ffffff" } }}
                  >
                    <RefreshIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              )}
              <IconButton
                size="small"
                onClick={() => setIsOpen(false)}
                sx={{ color: "#94a3b8", "&:hover": { color: "#ffffff" } }}
              >
                <CloseIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>

          {/* Body Content */}
          {!activeTicket ? (
            /* Inquiry Screen: Ask for problem & start chat */
            <Box
              sx={{
                flex: 1,
                p: 3,
                display: "flex",
                flexDirection: "column",
                overflowY: "auto",
                bgcolor: "#f8fafc",
              }}
            >
              <Box sx={{ textAlign: "center", my: 2 }}>
                <Box
                  component="img"
                  src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
                  alt="Webliix Logo"
                  sx={{ height: 42, mb: 1.5, objectFit: "contain" }}
                />
                <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]}>
                  How can we help you today?
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                  Ask any question or report an issue. Your request will be directly routed to our engineering and support team in real time.
                </Typography>
              </Box>

              {inquiryError && (
                <Box sx={{ p: 1.5, mb: 2, bgcolor: "#fee2e2", borderRadius: 1.5, color: "#991b1b" }}>
                  <Typography variant="caption" fontWeight={600}>
                    {inquiryError}
                  </Typography>
                </Box>
              )}

              <Box component="form" onSubmit={handleStartInquiry} sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box>
                  <Typography variant="caption" fontWeight={700} color={tokens.colors.secondary[700]} sx={{ mb: 0.75, display: "block" }}>
                    Select Topic
                  </Typography>
                  <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                    {["General Support", "Technical / Code", "Billing & Payment", "Project Scope"].map((cat) => (
                      <Chip
                        key={cat}
                        label={cat}
                        size="small"
                        clickable
                        onClick={() => setProblemCategory(cat)}
                        color={problemCategory === cat ? "primary" : "default"}
                        variant={problemCategory === cat ? "filled" : "outlined"}
                        sx={{ fontWeight: 600, fontSize: "0.75rem" }}
                      />
                    ))}
                  </Box>
                </Box>

                <TextField
                  label="Describe your query or problem..."
                  multiline
                  rows={4}
                  required
                  fullWidth
                  placeholder="Tell us what you need help with..."
                  value={problemDescription}
                  onChange={(e) => setProblemDescription(e.target.value)}
                  sx={{ bgcolor: "#ffffff", borderRadius: 2 }}
                />

                <Button
                  type="submit"
                  variant="contained"
                  fullWidth
                  disabled={submittingInquiry || !problemDescription.trim()}
                  startIcon={submittingInquiry ? <CircularProgress size={18} color="inherit" /> : <ChatIcon />}
                  sx={{
                    py: 1.25,
                    fontWeight: 800,
                    borderRadius: 2,
                    textTransform: "none",
                    bgcolor: tokens.colors.primary.main,
                  }}
                >
                  {submittingInquiry ? "Connecting to Support..." : "Start Live Chat"}
                </Button>
              </Box>

              {/* Previous tickets section */}
              {existingTickets.length > 0 && (
                <Box sx={{ mt: 3, pt: 2, borderTop: `1px solid ${tokens.colors.secondary[200]}` }}>
                  <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ textTransform: "uppercase" }}>
                    Recent Support Requests
                  </Typography>
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 1, mt: 1 }}>
                    {existingTickets.slice(0, 3).map((t) => (
                      <Box
                        key={t.id}
                        onClick={() => {
                          setActiveTicket(t);
                          fetchComments(t.id);
                        }}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          bgcolor: "#ffffff",
                          border: `1px solid ${tokens.colors.secondary[200]}`,
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          "&:hover": { bgcolor: tokens.colors.primary[50], borderColor: tokens.colors.primary.main },
                        }}
                      >
                        <Box sx={{ overflow: "hidden", pr: 1 }}>
                          <Typography variant="body2" fontWeight={700} noWrap>
                            {t.title || t.subject || "Support Ticket"}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {t.ticketNumber} • {t.assignedToName ? `Assigned to ${t.assignedToName}` : "Unassigned"}
                          </Typography>
                        </Box>
                        <Chip
                          label={t.status}
                          size="small"
                          color={t.status === "RESOLVED" || t.status === "CLOSED" ? "success" : "primary"}
                          sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                        />
                      </Box>
                    ))}
                  </Box>
                </Box>
              )}
            </Box>
          ) : (
            /* Active Live Chat Thread Screen */
            <Box sx={{ flex: 1, display: "flex", flexDirection: "column", minHeight: 0, bgcolor: "#f8fafc" }}>
              {/* Ticket Banner */}
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  bgcolor: "#f1f5f9",
                  borderBottom: `1px solid ${tokens.colors.secondary[200]}`,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, overflow: "hidden" }}>
                  <Chip
                    label={activeTicket.ticketNumber}
                    size="small"
                    sx={{ fontWeight: 800, fontSize: "0.65rem", height: 20, bgcolor: tokens.colors.primary[100], color: tokens.colors.primary[700] }}
                  />
                  <Typography variant="caption" fontWeight={700} color={tokens.colors.secondary[800]} noWrap>
                    {activeTicket.title || activeTicket.subject || "Live Support"}
                  </Typography>
                </Box>
                <Chip
                  label={activeTicket.status}
                  size="small"
                  color={activeTicket.status === "RESOLVED" ? "success" : "info"}
                  sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                />
              </Box>

              {/* Status Note on Assignment */}
              <Box
                sx={{
                  px: 2,
                  py: 0.75,
                  bgcolor: activeTicket.assignedToName ? "#f0fdf4" : "#fffbeb",
                  borderBottom: `1px solid ${activeTicket.assignedToName ? "#bbf7d0" : "#fef08a"}`,
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                }}
              >
                <FiberManualRecordIcon
                  sx={{
                    fontSize: 8,
                    color: activeTicket.assignedToName ? "#16a34a" : "#ca8a04",
                  }}
                />
                <Typography variant="caption" fontWeight={600} color={activeTicket.assignedToName ? "#166534" : "#854d0e"}>
                  {activeTicket.assignedToName
                    ? `Live with engineer: ${activeTicket.assignedToName}`
                    : "Connecting with an agent... Someone will respond shortly."}
                </Typography>
              </Box>

              {/* Chat Messages */}
              <Box
                sx={{
                  flex: 1,
                  p: 2,
                  overflowY: "auto",
                  display: "flex",
                  flexDirection: "column",
                  gap: 1.5,
                }}
              >
                {loadingMessages ? (
                  <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                    <CircularProgress size={24} />
                  </Box>
                ) : messages.length === 0 ? (
                  <Box sx={{ textAlign: "center", py: 4, color: "text.secondary" }}>
                    <Typography variant="body2">No messages yet in this ticket.</Typography>
                  </Box>
                ) : (
                  messages.map((msg) => {
                    const isClient = isClientMessage(msg);
                    return (
                      <Box
                        key={msg.id}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isClient ? "flex-end" : "flex-start",
                          maxWidth: "82%",
                          alignSelf: isClient ? "flex-end" : "flex-start",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.25, px: 0.5 }}>
                          <Typography variant="caption" fontWeight={700} color={isClient ? tokens.colors.primary.main : tokens.colors.secondary[800]}>
                            {isClient ? "You" : (msg.commentedBy || "Webliix Support")}
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.68rem" }}>
                            {msg.createdAt
                              ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
                              : ""}
                          </Typography>
                        </Box>
                        <Box
                          sx={{
                            p: 1.5,
                            borderRadius: 2,
                            borderTopRightRadius: isClient ? 2 : 2,
                            borderTopLeftRadius: !isClient ? 2 : 2,
                            bgcolor: isClient ? tokens.colors.primary.main : "#ffffff",
                            color: isClient ? "#ffffff" : tokens.colors.secondary[900],
                            boxShadow: "0 1px 3px rgba(0,0,0,0.06)",
                            border: isClient ? "none" : `1px solid ${tokens.colors.secondary[200]}`,
                            whiteSpace: "pre-line",
                            wordBreak: "break-word",
                          }}
                        >
                          <Typography variant="body2" sx={{ lineHeight: 1.45, fontSize: "0.875rem" }}>
                            {msg.comment}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Chat Input Field */}
              <Box
                component="form"
                onSubmit={handleSendMessage}
                sx={{
                  p: 1.5,
                  bgcolor: "#ffffff",
                  borderTop: `1px solid ${tokens.colors.secondary[200]}`,
                  display: "flex",
                  gap: 1,
                  alignItems: "flex-end",
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  maxRows={3}
                  size="small"
                  placeholder="Type a message (Press Enter)..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  sx={{ bgcolor: "#f8fafc", borderRadius: 2 }}
                />
                <IconButton
                  type="submit"
                  color="primary"
                  disabled={!inputMessage.trim() || sending}
                  sx={{
                    bgcolor: tokens.colors.primary.main,
                    color: "#ffffff",
                    "&:hover": { bgcolor: tokens.colors.primary[700] },
                    "&.Mui-disabled": { bgcolor: tokens.colors.secondary[200], color: "#94a3b8" },
                  }}
                >
                  {sending ? <CircularProgress size={18} color="inherit" /> : <SendIcon fontSize="small" />}
                </IconButton>
              </Box>
            </Box>
          )}
        </Paper>
      )}
    </>
  );
}
