import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
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

// Icons
import AddIcon from "@mui/icons-material/Add";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import SearchIcon from "@mui/icons-material/Search";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import DoneAllIcon from "@mui/icons-material/DoneAll";

import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { ticketApi, type ClientTicket, type TicketComment } from "../services/ticketApi";
import { ClientFadeWebliixLoader } from "../components/common/ClientSkeleton";

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
  const [resolvingTicket, setResolvingTicket] = useState(false);

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

      const targetId = autoSelectId ?? (ticketIdParam ? Number(ticketIdParam) : null);
      if (list.length > 0) {
        if (targetId) {
          const match = list.find((t) => t.id === targetId);
          if (match) {
            handleSelectTicket(match);
          } else {
            handleSelectTicket(list[0]);
          }
        } else if (!selectedTicket) {
          handleSelectTicket(list[0]);
        }
      }
    } catch (err) {
      console.error("Failed to load tickets", err);
    } finally {
      setLoadingTickets(false);
    }
  };

  // Fetch comments for selected ticket
  const loadComments = async (ticketId: number) => {
    setLoadingComments(true);
    try {
      const data = await ticketApi.getComments(ticketId);
      setComments(Array.isArray(data) ? data : []);
      setTimeout(scrollToBottom, 100);
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setLoadingComments(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, []);

  // Sync ticketId from URL param
  useEffect(() => {
    if (ticketIdParam && tickets.length > 0) {
      const found = tickets.find((t) => t.id === Number(ticketIdParam));
      if (found && found.id !== selectedTicket?.id) {
        handleSelectTicket(found, true);
      }
    }
  }, [ticketIdParam, tickets]);

  const handleSelectTicket = (t: ClientTicket, openMobile: boolean = false) => {
    setSelectedTicket(t);
    loadComments(t.id);
    setSearchParams({ ticketId: String(t.id) });
    if (openMobile) {
      setMobileShowChat(true);
    }
  };

  // Send Reply
  const handleSendReply = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedTicket || !replyText.trim() || sendingReply) return;

    const content = replyText.trim();
    setSendingReply(true);

    try {
      const author = user?.name || "Client";
      const newComment = await ticketApi.addComment(selectedTicket.id, content, author);
      if (newComment) {
        setComments((prev) => [...prev, newComment]);
        setReplyText("");
        setTimeout(scrollToBottom, 100);
      }
    } catch (err) {
      console.error("Failed to send message", err);
    } finally {
      setSendingReply(false);
    }
  };

  // End Chat & Mark Ticket as Resolved
  const handleEndChatAndResolve = async () => {
    if (!selectedTicket || resolvingTicket) return;
    setResolvingTicket(true);
    try {
      await ticketApi.resolveTicket(selectedTicket.id);
      await ticketApi.addComment(
        selectedTicket.id,
        "Chat session ended by client. Ticket marked as RESOLVED.",
        user?.name || "Client"
      );
      const updated = { ...selectedTicket, status: "RESOLVED" };
      setSelectedTicket(updated);
      setTickets((prev) => prev.map((t) => (t.id === selectedTicket.id ? updated : t)));
      const updatedComments = await ticketApi.getComments(selectedTicket.id);
      setComments(updatedComments);
    } catch (err) {
      console.error("Failed to resolve ticket", err);
    } finally {
      setResolvingTicket(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendReply();
    }
  };

  // Create New Ticket
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newDescription.trim() || creating) return;

    setCreating(true);
    try {
      const created = await ticketApi.createTicket(newTitle.trim(), newDescription.trim(), newCategory);
      if (created) {
        await loadTickets(created.id);
        setNewTitle("");
        setNewDescription("");
        setNewCategory("SUPPORT");
        setOpenModal(false);
        handleSelectTicket(created, true);
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
        <ClientFadeWebliixLoader message="Loading Support & Live Chat Hub..." size="medium" />
      </Box>
    );
  }

  return (
    <Box sx={{ height: { xs: "calc(100vh - 140px)", md: "calc(100vh - 120px)" }, display: "flex", flexDirection: "column" }}>
      {/* Top Banner with Crisp Square Button */}
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2.5, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
            <Typography variant="h5" fontWeight={900} color="#0f172a" letterSpacing="-0.02em">
              Support & Live Chat Hub
            </Typography>
            <Chip
              label={`${tickets.length} Inquiries`}
              size="small"
              sx={{ fontWeight: 800, bgcolor: "#f1f5f9", color: "#0f172a", borderRadius: "4px" }}
            />
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25 }}>
            Connect directly with Webliix engineers. Any live chat started is saved here to review and reopen anytime.
          </Typography>
        </Box>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{
            bgcolor: "#0f172a",
            color: "#ffffff",
            borderRadius: "6px",
            fontWeight: 800,
            px: 2.5,
            py: 1,
            textTransform: "none",
            boxShadow: "0 1px 3px rgba(0,0,0,0.1)",
            "&:hover": { bgcolor: "#1e293b" },
          }}
        >
          Start New Support Chat
        </Button>
      </Box>

      {/* Main 2-Column Chat & Queue Container with Square Edges */}
      <Box
        sx={{
          flex: 1,
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "380px 1fr" },
          bgcolor: "#ffffff",
          borderRadius: "8px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
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
            bgcolor: "#f8fafc",
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
              sx={{ mb: 1.5, "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
            />

            <Tabs
              value={filterTab}
              onChange={(_, val) => setFilterTab(val)}
              variant="fullWidth"
              sx={{
                minHeight: 36,
                "& .MuiTab-root": {
                  minHeight: 36,
                  fontSize: "0.78rem",
                  fontWeight: 800,
                  textTransform: "none",
                  borderRadius: "4px",
                  p: 0,
                },
                "& .Mui-selected": { color: "#0f172a" },
                "& .MuiTabs-indicator": { bgcolor: "#0f172a", height: 2 },
              }}
            >
              <Tab label={`All (${tickets.length})`} value="ALL" />
              <Tab
                label={`Active (${tickets.filter((t) => t.status !== "RESOLVED" && t.status !== "CLOSED").length})`}
                value="ACTIVE"
              />
              <Tab
                label={`Resolved (${tickets.filter((t) => t.status === "RESOLVED" || t.status === "CLOSED").length})`}
                value="RESOLVED"
              />
            </Tabs>
          </Box>

          {/* Tickets List */}
          <Box
            sx={{
              flex: 1,
              overflowY: "auto",
              p: 1.5,
              display: "flex",
              flexDirection: "column",
              gap: 1,
            }}
          >
            {filteredTickets.length === 0 ? (
              <Box sx={{ py: 6, textAlign: "center", color: "text.secondary" }}>
                <Typography variant="body2" fontWeight={700}>
                  No tickets found
                </Typography>
                <Typography variant="caption">Start a new support chat or adjust filters.</Typography>
              </Box>
            ) : (
              filteredTickets.map((t) => {
                const isSelected = selectedTicket?.id === t.id;
                const isResolved = t.status === "RESOLVED" || t.status === "CLOSED";
                const title = t.title || t.subject || "Support Inquiry";

                return (
                  <Card
                    key={t.id}
                    onClick={() => handleSelectTicket(t, true)}
                    sx={{
                      p: 2,
                      cursor: "pointer",
                      borderRadius: "6px",
                      border: isSelected ? "1.5px solid #0f172a" : "1px solid #e2e8f0",
                      bgcolor: isSelected ? "#f1f5f9" : "#ffffff",
                      boxShadow: isSelected ? "0 2px 6px rgba(0,0,0,0.06)" : "none",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        borderColor: isSelected ? "#0f172a" : "#cbd5e1",
                        bgcolor: isSelected ? "#f1f5f9" : "#fafafa",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 1 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <Chip
                          label={t.ticketNumber || `#${t.id}`}
                          size="small"
                          sx={{
                            fontWeight: 800,
                            fontSize: "0.68rem",
                            height: 20,
                            bgcolor: isSelected ? "#0f172a" : "#f1f5f9",
                            color: isSelected ? "#ffffff" : "#0f172a",
                            borderRadius: "4px",
                          }}
                        />
                        {t.category && (
                          <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, fontSize: "0.68rem" }}>
                            {t.category}
                          </Typography>
                        )}
                      </Box>
                      <Chip
                        label={t.status || "OPEN"}
                        size="small"
                        color={isResolved ? "success" : t.status === "IN_PROGRESS" ? "primary" : "warning"}
                        sx={{ fontSize: "0.68rem", height: 20, fontWeight: 700, borderRadius: "4px" }}
                      />
                    </Box>

                    <Typography variant="body2" fontWeight={800} noWrap sx={{ color: "#0f172a", mb: 0.5 }}>
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
                        lineHeight: 1.35,
                        mb: 1,
                      }}
                    >
                      {t.description}
                    </Typography>

                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", pt: 1, borderTop: "1px dashed #f1f5f9" }}>
                      <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.7rem", fontWeight: 600 }}>
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
              {/* Chat Header with End Chat & Resolve Button */}
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
                  <IconButton
                    size="small"
                    onClick={() => setMobileShowChat(false)}
                    sx={{ display: { xs: "flex", md: "none" }, color: "#64748b", borderRadius: "4px" }}
                  >
                    <ArrowBackIcon fontSize="small" />
                  </IconButton>

                  <Avatar sx={{ bgcolor: "#0f172a", width: 38, height: 38, borderRadius: "6px" }}>
                    <SupportAgentIcon fontSize="small" />
                  </Avatar>

                  <Box>
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1, flexWrap: "wrap" }}>
                      <Typography variant="subtitle1" fontWeight={900} sx={{ color: "#0f172a", fontSize: "0.95rem" }}>
                        {selectedTicket.title || selectedTicket.subject || "Support Inquiry"}
                      </Typography>
                      <Chip
                        label={selectedTicket.ticketNumber || `TIC-${selectedTicket.id}`}
                        size="small"
                        sx={{ fontWeight: 800, fontSize: "0.68rem", height: 20, borderRadius: "4px" }}
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
                        sx={{ fontWeight: 800, fontSize: "0.68rem", height: 20, borderRadius: "4px" }}
                      />
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mt: 0.25 }}>
                      <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        <FiberManualRecordIcon sx={{ fontSize: 9, color: "#10b981" }} />
                        <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700 }}>
                          {selectedTicket.assignedToName
                            ? `Assigned: ${selectedTicket.assignedToName}`
                            : "Webliix Support Engineers"}
                        </Typography>
                      </Box>
                      <Typography variant="caption" sx={{ color: "#94a3b8" }}>
                        • Priority: {selectedTicket.priority || "MEDIUM"}
                      </Typography>
                    </Box>
                  </Box>
                </Box>

                {/* End Chat / Resolve Action Controls */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                  {selectedTicket.status !== "RESOLVED" && selectedTicket.status !== "CLOSED" ? (
                    <Button
                      size="small"
                      variant="outlined"
                      color="error"
                      onClick={handleEndChatAndResolve}
                      disabled={resolvingTicket}
                      startIcon={<CheckCircleOutlineIcon sx={{ fontSize: 16 }} />}
                      sx={{
                        borderRadius: "6px",
                        fontWeight: 800,
                        fontSize: "0.78rem",
                        textTransform: "none",
                        borderColor: "#ef4444",
                        color: "#ef4444",
                        "&:hover": { bgcolor: "#fef2f2", borderColor: "#dc2626" },
                      }}
                    >
                      {resolvingTicket ? "Ending..." : "End Chat & Resolve"}
                    </Button>
                  ) : (
                    <Chip
                      icon={<DoneAllIcon sx={{ fontSize: "14px !important" }} />}
                      label="Ticket Resolved"
                      size="small"
                      color="success"
                      sx={{ fontWeight: 800, fontSize: "0.75rem", borderRadius: "4px" }}
                    />
                  )}

                  <Tooltip title="Refresh chat messages">
                    <IconButton size="small" onClick={() => loadComments(selectedTicket.id)} sx={{ borderRadius: "4px" }}>
                      <RefreshIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </Box>

              {/* Resolved Banner */}
              {(selectedTicket.status === "RESOLVED" || selectedTicket.status === "CLOSED") && (
                <Box sx={{ px: 2, py: 1.25, bgcolor: "#f0fdf4", borderBottom: "1px solid #dcfce7", display: "flex", alignItems: "center", gap: 1 }}>
                  <CheckCircleOutlineIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                  <Typography variant="caption" fontWeight={700} sx={{ color: "#166534" }}>
                    This conversation is marked as RESOLVED. Send a new reply if you need to reopen this thread.
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
                    <ClientFadeWebliixLoader message="Loading messages..." size="small" />
                  </Box>
                ) : comments.length === 0 ? (
                  <Box sx={{ my: "auto", textAlign: "center", py: 4 }}>
                    <ChatBubbleOutlineIcon sx={{ fontSize: 44, color: "#cbd5e1", mb: 1 }} />
                    <Typography variant="subtitle2" fontWeight={800} sx={{ color: "#64748b" }}>
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
                            <Avatar sx={{ width: 22, height: 22, bgcolor: "#334155", fontSize: "0.65rem", borderRadius: "4px" }}>
                              <SupportAgentIcon sx={{ fontSize: 14 }} />
                            </Avatar>
                          )}
                          <Typography variant="caption" fontWeight={800} sx={{ color: "#64748b", fontSize: "0.75rem" }}>
                            {isClient ? "You" : c.commentedBy || "Webliix Support"}
                          </Typography>
                          <Typography variant="caption" sx={{ color: "#94a3b8", fontSize: "0.68rem" }}>
                            {c.createdAt ? new Date(c.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                          </Typography>
                        </Box>

                        <Box
                          sx={{
                            maxWidth: { xs: "88%", sm: "75%" },
                            p: 1.75,
                            borderRadius: "6px",
                            bgcolor: isClient ? "#0f172a" : "#f1f5f9",
                            color: isClient ? "#ffffff" : "#0f172a",
                            border: isClient ? "none" : "1px solid #e2e8f0",
                            lineHeight: 1.55,
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
                  placeholder="Write a message to our engineering team... (Press Enter to send)"
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
                      borderRadius: "6px",
                    },
                  }}
                />
                <Button
                  type="submit"
                  variant="contained"
                  disabled={sendingReply || !replyText.trim()}
                  sx={{
                    minWidth: 48,
                    height: 40,
                    borderRadius: "6px",
                    bgcolor: "#0f172a",
                    color: "#ffffff",
                    px: 2,
                    "&:hover": { bgcolor: "#1e293b" },
                  }}
                >
                  <SendIcon fontSize="small" />
                </Button>
              </Box>
            </>
          ) : (
            /* Empty Right Pane when no ticket exists */
            <Box sx={{ my: "auto", textAlign: "center", p: 4 }}>
              <SupportAgentIcon sx={{ fontSize: 56, color: "#cbd5e1", mb: 2 }} />
              <Typography variant="h6" fontWeight={900} color="#0f172a" gutterBottom>
                Support & Live Chat Hub
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 440, mx: "auto", mb: 3 }}>
                Select an existing chat inquiry from the left to view messages and rejoin the conversation, or initiate a new request below.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenModal(true)}
                sx={{ borderRadius: "6px", fontWeight: 800, bgcolor: "#0f172a", textTransform: "none", px: 3, "&:hover": { bgcolor: "#1e293b" } }}
              >
                Create Support Inquiry
              </Button>
            </Box>
          )}
        </Box>
      </Box>

      {/* New Ticket / Live Chat Modal */}
      <Dialog
        open={openModal}
        onClose={() => setOpenModal(false)}
        maxWidth="sm"
        fullWidth
        PaperProps={{ sx: { borderRadius: "8px", p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 900, color: "#0f172a", pb: 1 }}>Start Support Inquiry</DialogTitle>
        <form onSubmit={handleCreateTicket}>
          <DialogContent dividers sx={{ borderColor: "#f1f5f9" }}>
            <Box sx={{ display: "grid", gap: 2.5, pt: 1 }}>
              <TextField
                select
                label="Inquiry Category"
                fullWidth
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              >
                <MenuItem value="SUPPORT">General Support & Technical</MenuItem>
                <MenuItem value="BILLING">Billing & Invoice Query</MenuItem>
                <MenuItem value="FEATURE">Feature Request / Revision</MenuItem>
                <MenuItem value="BUG">Bug Report & Incident</MenuItem>
              </TextField>

              <TextField
                label="Subject / Topic"
                fullWidth
                required
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="e.g. Need assistance with staging build deployment"
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />

              <TextField
                label="Detailed Description"
                fullWidth
                required
                multiline
                rows={4}
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Describe your question or issue in detail..."
                sx={{ "& .MuiOutlinedInput-root": { borderRadius: "6px" } }}
              />
            </Box>
          </DialogContent>
          <DialogActions sx={{ p: 2 }}>
            <Button onClick={() => setOpenModal(false)} sx={{ fontWeight: 700, color: "#64748b", borderRadius: "6px" }}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={creating || !newTitle.trim() || !newDescription.trim()}
              sx={{ bgcolor: "#0f172a", "&:hover": { bgcolor: "#1e293b" }, fontWeight: 800, borderRadius: "6px", px: 3 }}
            >
              {creating ? "Starting..." : "Start Chat"}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}
