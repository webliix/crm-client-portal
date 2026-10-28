import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import MenuItem from "@mui/material/MenuItem";
import Tooltip from "@mui/material/Tooltip";
import InputAdornment from "@mui/material/InputAdornment";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";

import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonIcon from "@mui/icons-material/Person";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ForumOutlinedIcon from "@mui/icons-material/ForumOutlined";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";

import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { ticketApi, type ClientTicket, type TicketComment } from "../services/ticketApi";
import { BrandLoader } from "../components/common/BrandLoader";

export default function ClientTicketsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const ticketIdParam = searchParams.get("ticketId");

  const [tickets, setTickets] = useState<ClientTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<ClientTicket | null>(null);
  const [comments, setComments] = useState<TicketComment[]>([]);
  const [loadingTickets, setLoadingTickets] = useState(true);
  const [loadingComments, setLoadingComments] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [sendingReply, setSendingReply] = useState(false);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [filterTab, setFilterTab] = useState<"ALL" | "ACTIVE" | "RESOLVED">("ALL");

  // Create Modal State
  const [openModal, setOpenModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newCategory, setNewCategory] = useState("SUPPORT");
  const [newDescription, setNewDescription] = useState("");
  const [creating, setCreating] = useState(false);

  // Mobile navigation between list and chat view
  const [mobileShowChat, setMobileShowChat] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const user = authService.getCurrentUser();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Fetch Tickets
  const loadTickets = async (autoSelectId?: number | null) => {
    try {
      const data = await ticketApi.getMyTickets();
      const list = Array.isArray(data) ? data : [];
      setTickets(list);

      // Determine ticket to select
      const targetId = autoSelectId ?? (ticketIdParam ? Number(ticketIdParam) : null);
      if (targetId) {
        const found = list.find((t) => t.id === targetId);
        if (found) {
          handleSelectTicket(found, false);
          return;
        }
      }

      if (!selectedTicket && list.length > 0) {
        handleSelectTicket(list[0], false);
      }
    } catch (err) {
      console.error("Failed to load tickets:", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [ticketIdParam]);

  // Fetch comments for selected ticket
  const loadComments = async (ticketId: number, silent = false) => {
    if (!silent) setLoadingComments(true);
    try {
      const comms = await ticketApi.getComments(ticketId);
      setComments(comms || []);
      // Also fetch latest ticket details (status/assigned engineer)
      const freshTicket = await ticketApi.getTicket(ticketId);
      if (freshTicket) {
        setSelectedTicket(freshTicket);
        setTickets((prev) => prev.map((t) => (t.id === freshTicket.id ? freshTicket : t)));
      }
    } catch (err) {
      console.error("Error loading comments:", err);
    } finally {
      if (!silent) setLoadingComments(false);
    }
  };

  // Poll for updates on active ticket every 3 seconds
  useEffect(() => {
    if (!selectedTicket?.id) return;

    loadComments(selectedTicket.id, true);
    const interval = setInterval(() => {
      loadComments(selectedTicket.id, true);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedTicket?.id]);

  useEffect(() => {
    scrollToBottom();
  }, [comments]);

  const handleSelectTicket = (t: ClientTicket, updateUrl = true) => {
    setSelectedTicket(t);
    setMobileShowChat(true);
    if (updateUrl) {
      setSearchParams({ ticketId: String(t.id) });
    }
    loadComments(t.id, false);
  };

  // Send a new reply
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTicket || !replyText.trim() || sendingReply) return;

    const text = replyText.trim();
    setReplyText("");
    setSendingReply(true);

    try {
      const authorName = user?.name || "Client";
      const sent = await ticketApi.addComment(selectedTicket.id, text, authorName);
      if (sent) {
        setComments((prev) => [...prev, sent]);
      } else {
        await loadComments(selectedTicket.id, true);
      }
    } catch (err) {
      console.error("Failed to send reply:", err);
    } finally {
      setSendingReply(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Create new ticket / live chat thread
  const handleCreateTicket = async () => {
    if (!newTitle.trim() || !newDescription.trim() || creating) return;

    setCreating(true);
    try {
      const created = await ticketApi.createTicket(newTitle.trim(), newDescription.trim(), newCategory);
      if (created) {
        setTickets((prev) => [created, ...prev]);
        setNewTitle("");
        setNewDescription("");
        setNewCategory("SUPPORT");
        setOpenModal(false);
        handleSelectTicket(created, true);
      } else {
        alert("Failed to submit support request. Please try again.");
      }
    } catch (err: any) {
      alert(err?.message || "Failed to submit support request");
    } finally {
      setCreating(false);
    }
  };

  // Filtered tickets
  const filteredTickets = tickets.filter((t) => {
    const matchesSearch =
      !searchQuery.trim() ||
      (t.title && t.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.subject && t.subject.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.ticketNumber && t.ticketNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (t.description && t.description.toLowerCase().includes(searchQuery.toLowerCase()));

    if (!matchesSearch) return false;

    if (filterTab === "ACTIVE") {
      return t.status === "OPEN" || t.status === "IN_PROGRESS" || t.status === "REOPENED";
    }
    if (filterTab === "RESOLVED") {
      return t.status === "RESOLVED" || t.status === "CLOSED";
    }
    return true;
  });

  const isClientMessage = (comment: TicketComment) => {
    if (comment.commentedBy === "Client") return true;
    if (user?.name && comment.commentedBy?.toLowerCase() === user.name.toLowerCase()) return true;
    if (user?.email && comment.commentedBy?.toLowerCase().includes(user.email.toLowerCase())) return true;
    return false;
  };

  if (loadingTickets) {
    return (
      <Box sx={{ py: 10, textAlign: "center" }}>
        <BrandLoader message="Loading Support & Live Chat Hub..." size="medium" />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, md: 3.5 }, height: "calc(100vh - 84px)", display: "flex", flexDirection: "column" }}>
      {/* Top Banner */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h5" fontWeight={800} color={tokens.colors.secondary[900]}>
              Support & Live Chat Hub
            </Typography>
            <Chip
              label={`${tickets.length} Inquiries`}
              size="small"
              sx={{ fontWeight: 700, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary.main }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary">
            Connect directly with Webliix engineers. Any chat started via the live chat icon is accessible here to rejoin anytime.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ borderRadius: tokens.borderRadius.md, fontWeight: 700, px: 2.5, py: 1, textTransform: "none" }}
        >
          Start New Support Chat
        </Button>
      </Box>

      {/* Main 2-Column Chat & Queue Container */}
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "380px 1fr" },
          bgcolor: "#ffffff",
          borderRadius: `${tokens.borderRadius.xl}px`,
          border: `1px solid ${tokens.colors.secondary[200]}`,
          boxShadow: tokens.shadows.sm,
          overflow: "hidden",
          minHeight: 0,
        }}
      >
        {/* Left Column: Tickets & Inquiries List */}
        <Box
          sx={{
            display: { xs: mobileShowChat ? "none" : "flex", md: "flex" },
            flexDirection: "column",
            borderRight: { md: "1px solid #e2e8f0" },
            bgcolor: "#fafafa",
            minHeight: 0,
          }}
        >
          {/* Search & Filter Header */}
          <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0", bgcolor: "#ffffff" }}>
            <TextField
              size="small"
              fullWidth
              placeholder="Search chat or ticket #..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" sx={{ color: "#94a3b8" }} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 1.5 }}
            />

            <Tabs
              value={filterTab}
              onChange={(_, val) => setFilterTab(val)}
              variant="fullWidth"
              sx={{
                minHeight: 32,
                "& .MuiTab-root": { minHeight: 32, py: 0.5, fontSize: "0.75rem", fontWeight: 700, textTransform: "none" },
              }}
            >
              <Tab label={`All (${tickets.length})`} value="ALL" />
              <Tab
                label={`Active (${tickets.filter((t) => t.status === "OPEN" || t.status === "IN_PROGRESS" || t.status === "REOPENED").length})`}
                value="ACTIVE"
              />
              <Tab
                label={`Resolved (${tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length})`}
                value="RESOLVED"
              />
            </Tabs>
          </Box>

          {/* Ticket Queue List */}
          <Box sx={{ flex: 1, overflowY: "auto", p: 1.5, display: "flex", flexDirection: "column", gap: 1 }}>
            {filteredTickets.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center", px: 2 }}>
                <ForumOutlinedIcon sx={{ fontSize: 40, color: "#cbd5e1", mb: 1 }} />
                <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#64748b" }}>
                  No support chats found
                </Typography>
                <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                  Start a new inquiry using the button above or the floating chat icon.
                </Typography>
              </Box>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const title = t.title || t.subject || "Support Inquiry";
                const isResolved = t.status === "RESOLVED" || t.status === "CLOSED";

                return (
                  <Card
                    key={t.id}
                    onClick={() => handleSelectTicket(t, true)}
                    sx={{
                      p: 1.5,
                      borderRadius: `${tokens.borderRadius.md}px`,
                      cursor: "pointer",
                      border: "1.5px solid",
                      borderColor: isSelected ? tokens.colors.primary.main : "#e2e8f0",
                      bgcolor: isSelected ? tokens.colors.primary[50] : "#ffffff",
                      boxShadow: isSelected ? tokens.shadows.sm : "none",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: isSelected ? tokens.colors.primary[50] : "#f8fafc",
                        borderColor: isSelected ? tokens.colors.primary.main : "#cbd5e1",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          label={t.ticketNumber || `TIC-${t.id}`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.6875rem",
                            height: 20,
                            bgcolor: isSelected ? tokens.colors.primary.main : "#e2e8f0",
                            color: isSelected ? "#ffffff" : "#475569",
                          }}
                        />
                        {t.category && (
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, fontSize: "0.6875rem" }}>
                            {t.category}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={t.status || "OPEN"}
                        size="small"
                        color={isResolved ? "success" : t.status === "IN_PROGRESS" ? "primary" : "warning"}
                        sx={{ fontSize: "0.6875rem", height: 20, fontWeight: 700 }}
                      />
                    </Box>

                    <Typography variant="body2" fontWeight={700} noWrap sx={{ color: tokens.colors.secondary[900], mb: 0.5 }}>
                      {title}
                    </Typography>

                    <Typography
                      variant="caption"
                      sx={{
                        color: "#64748b",
                        display: "-webkit-box",
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: "vertical",
                        overflow: "hidden",
                        lineHeight: 1.3,
                        mb: 1,
                      }}
                    >
                      {t.description}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 0.5, borderTop: "1px dashed #f1f5f9" }}>
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem" }}>
                        {t.assignedToName ? `Staff: ${t.assignedToName}` : "Waiting assignment"}
                      </Typography>
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem" }}>
                        {t.createdAt ? new Date(t.createdAt).toLocaleDateString() : ""}
                      </Typography>
                    </Box>
                  </Card>
                );
              })
            )}
          </Box>
        </Box>

        {/* Right Column: Live Chat & Conversation Pane */}
        <Box
          sx={{
            display: { xs: mobileShowChat ? "flex" : "none", md: "flex" },
            flexDirection: "column",
            bgcolor: "#ffffff",
            minHeight: 0,
            height: "100%",
          }}
        >
          {selectedTicket ? (
            <>
              {/* Chat Header */}
              <Box
                sx={{
                  p: 2,
                  borderBottom: "1px solid #e2e8f0",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: 1.5,
                  bgcolor: "#ffffff",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                  {/* Mobile Back Button */}
                  <IconButton
                    size="small"
                    onClick={() => setMobileShowChat(false)}
                    sx={{ display: { xs: "flex", md: "none" }, color: "#64748b" }}
                  >
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>

                  <Avatar sx={{ bgcolor: tokens.colors.primary.main, width: 40, height: 40 }}>
                    <SupportAgentIcon />
                  </Avatar>

                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="subtitle1" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                        {selectedTicket.title || selectedTicket.subject || "Support Inquiry"}
                      </Typography>
                      <Chip
                        label={selectedTicket.ticketNumber || `TIC-${selectedTicket.id}`}
                        size="small"
                        sx={{ fontWeight: 700, fontSize: "0.6875rem", height: 20 }}
                      />
                      <Chip
                        label={selectedTicket.status || "OPEN"}
                        size="small"
                        color={
                          selectedTicket.status === "RESOLVED" || selectedTicket.status === "CLOSED"
                            ? "success"
                            : selectedTicket.status === "IN_PROGRESS"
                            ? "primary"
                            : "warning"
                        }
                        sx={{ fontWeight: 700, fontSize: "0.6875rem", height: 20 }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.25 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <FiberManualRecordIcon sx={{ fontSize: 10, color: "#10b981" }} />
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                          {selectedTicket.assignedToName
                            ? `Assigned: ${selectedTicket.assignedToName}`
                            : "Connected to Webliix Help Desk"}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        • Priority: {selectedTicket.priority || "MEDIUM"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  <Chip
                    icon={<FiberManualRecordIcon sx={{ fontSize: "10px !important", color: "#10b981 !important" }} />}
                    label="Live Chat Active"
                    size="small"
                    variant="outlined"
                    sx={{ fontWeight: 700, fontSize: "0.75rem", color: "#10b981", borderColor: "#a7f3d0" }}
                  />
                  <Tooltip title="Refresh chat messages">
                    <IconButton size="small" onClick={() => loadComments(selectedTicket.id)}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Initial Issue Summary Banner */}
              {selectedTicket.description && (
                <Box sx={{ p: 2, bgcolor: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
                  <Typography variant="caption" fontWeight={800} sx={{ color: "#64748b", display: "block", mb: 0.5 }}>
                    ORIGINAL INQUIRY / ISSUE DETAILS:
                  </Typography>
                  <Typography variant="body2" sx={{ color: "#334155" }}>
                    {selectedTicket.description}
                  </Typography>
                </Box>
              )}

              {/* Chat Messages Body */}
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  p: 2.5,
                  bgcolor: "#ffffff",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {loadingComments && comments.length === 0 ? (
                  <Box sx={{ py: 6, textAlign: "center" }}>
                    <BrandLoader message="Loading messages..." size="small" />
                  </Box>
                ) : comments.length === 0 ? (
                  <Box sx={{ my: "auto", textAlign: "center", py: 4 }}>
                    <ChatBubbleOutlineIcon sx={{ fontSize: 44, color: "#cbd5e1", mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ color: "#64748b" }}>
                      Conversation thread started
                    </Typography>
                    <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                      Send a message below to communicate directly with our engineering team.
                    </Typography>
                  </Box>
                ) : (
                  comments.map((c) => {
                    const isClient = isClientMessage(c);
                    return (
                      <Box
                        key={c.id}
                        sx={{
                          display: "flex",
                          flexDirection: "column",
                          alignItems: isClient ? "flex-end" : "flex-start",
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                          {!isClient && (
                            <Avatar sx={{ width: 22, height: 22, bgcolor: tokens.colors.secondary[700], fontSize: "0.65rem" }}>
                              <SupportAgentIcon sx={{ fontSize: 14 }} />
                            </Avatar>
                          )}
                          <Typography variant="caption" fontWeight={700} sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                            {isClient ? "You" : c.commentedBy || "Webliix Support"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.6875rem" }}>
                            {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            maxWidth: { xs: "88%", sm: "75%" },
                            p: 1.75,
                            borderRadius: `${tokens.borderRadius.lg}px`,
                            borderTopRightRadius: isClient ? 2 : undefined,
                            borderTopLeftRadius: !isClient ? 2 : undefined,
                            bgcolor: isClient ? tokens.colors.primary.main : "#f1f5f9",
                            color: isClient ? "#ffffff" : "#0f172a",
                            boxShadow: isClient ? tokens.shadows.sm : "none",
                            lineHeight: 1.5,
                            wordBreak: "break-word",
                          }}
                        >
                          <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                            {c.comment}
                          </Typography>
                        </Box>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Chat Input Bar */}
              <Box
                component="form"
                onSubmit={handleSendReply}
                sx={{
                  p: 2,
                  borderTop: "1px solid #e2e8f0",
                  bgcolor: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  gap: 1.5,
                }}
              >
                <TextField
                  placeholder="Write a message to Webliix engineering team... (Press Enter to send)"
                  size="small"
                  fullWidth
                  multiline
                  maxRows={3}
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={sendingReply}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: `${tokens.borderRadius.md}px`,
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={sendingReply || !replyText.trim()}
                  sx={{
                    minWidth: 48,
                    height: 42,
                    borderRadius: `${tokens.borderRadius.md}px`,
                    bgcolor: tokens.colors.primary.main,
                    px: 2,
                  }}
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Box>
            </>
          ) : (
            /* Empty Right Pane when no ticket exists */
            <Box sx={{ my: "auto", textAlign: "center", p: 4 }}>
              <SupportAgentIcon sx={{ fontSize: 64, color: "#cbd5e1", mb: 2 }} />
              <Typography variant="h6" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
                Webliix Support & Live Chat Hub
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: "auto", mb: 3 }}>
                Select an existing chat inquiry from the left to view messages and rejoin the conversation, or initiate a new request below.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenModal(true)}
                sx={{ borderRadius: tokens.borderRadius.md, fontWeight: 700 }}
              >
                Create Support Inquiry
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* New Ticket / Live Chat Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Start Support Chat / Ticket</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2.5, pt: 1 }}>
            <TextField
              select
              label="Inquiry Category"
              fullWidth
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
            >
              <MenuItem value="SUPPORT">Technical Support & Issue</MenuItem>
              <MenuItem value="BILLING">Billing, Invoices & Quotations</MenuItem>
              <MenuItem value="FEATURE">Project Scope & Feature Request</MenuItem>
              <MenuItem value="BUG">Bug Report / Revision</MenuItem>
            </TextField>

            <TextField
              label="Subject / Topic"
              fullWidth
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Assistance needed with SSL configuration or DNS"
            />

            <TextField
              label="Detailed Message / Issue Description"
              fullWidth
              required
              multiline
              rows={4}
              value={newDescription}
              onChange={(e) => setNewDescription(e.target.value)}
              placeholder="Please describe your question or issue in detail..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 600 }}>
            Cancel
          </Button>
          <Button
            variant="contained"
            disabled={!newTitle.trim() || !newDescription.trim() || creating}
            onClick={handleCreateTicket}
            sx={{ fontWeight: 700, borderRadius: tokens.borderRadius.md, px: 3 }}
          >
            {creating ? "Starting..." : "Start Chat"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
