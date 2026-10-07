import { useState, useEffect, useRef } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Chip from "@mui/material/Chip";
import Avatar from "@mui/material/Avatar";
import CircularProgress from "@mui/material/CircularProgress";
import Tooltip from "@mui/material/Tooltip";
import SendIcon from "@mui/icons-material/Send";
import RefreshIcon from "@mui/icons-material/Refresh";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import SupportAgentIcon from "@mui/icons-material/SupportAgent";
import PersonIcon from "@mui/icons-material/Person";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { projectApi, type ClientProject, type ClientComment } from "../services/projectApi";

export default function ClientLiveChatPage() {
  const user = authService.getCurrentUser();
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [messages, setMessages] = useState<ClientComment[]>([]);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [newMessage, setNewMessage] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Fetch projects on mount
  useEffect(() => {
    projectApi
      .getMyProjects()
      .then((data) => {
        setProjects(data);
        if (data.length > 0) {
          setSelectedProjectId(data[0].id);
        }
      })
      .finally(() => setLoadingProjects(false));
  }, []);

  // Fetch comments for selected project
  const fetchMessages = async (projectId: number, silent = false) => {
    if (!silent) setLoadingMessages(true);
    try {
      const data = await projectApi.getComments(projectId);
      setMessages(data || []);
    } catch (err) {
      console.error("Failed to fetch project comments", err);
    } finally {
      if (!silent) setLoadingMessages(false);
    }
  };

  useEffect(() => {
    if (!selectedProjectId) return;
    fetchMessages(selectedProjectId);

    // Live polling every 4 seconds
    const interval = setInterval(() => {
      fetchMessages(selectedProjectId, true);
    }, 4000);

    return () => clearInterval(interval);
  }, [selectedProjectId]);

  // Scroll to bottom on message change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedProjectId || !newMessage.trim() || sending) return;

    const messageText = newMessage.trim();
    setSending(true);
    try {
      const sent = await projectApi.addInstruction(
        selectedProjectId,
        messageText,
        user?.name || "Client"
      );
      if (sent) {
        setMessages((prev) => [...prev, sent]);
      } else {
        // Fallback fetch
        fetchMessages(selectedProjectId, true);
      }
      setNewMessage("");
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

  const activeProject = projects.find((p) => p.id === selectedProjectId);

  const isClientMessage = (msg: ClientComment) => {
    if (msg.authorRole === "CLIENT") return true;
    if (user && msg.authorName && msg.authorName.toLowerCase() === user.name?.toLowerCase()) return true;
    return false;
  };

  return (
    <Box sx={{ p: { xs: 2, md: 3 }, height: "calc(100vh - 64px)", display: "flex", flexDirection: "column" }}>
      {/* Page Header */}
      <Box sx={{ mb: 2, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
        <Box>
          <Typography variant="h5" fontWeight={800} color={tokens.colors.secondary[900]}>
            Live Project Chat
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Communicate directly with your assigned Webliix engineers and project managers in real time.
          </Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FiberManualRecordIcon sx={{ color: tokens.colors.success.main, fontSize: 14 }} />
          <Typography variant="caption" fontWeight={700} color="success.main">
            Connected to Webliix Team
          </Typography>
        </Box>
      </Box>

      {/* Main Chat Container */}
      <Card
        sx={{
          flex: 1,
          display: "flex",
          borderRadius: `${tokens.borderRadius.lg}px`,
          border: `1px solid ${tokens.colors.secondary[200]}`,
          boxShadow: tokens.shadows.sm,
          overflow: "hidden",
        }}
      >
        {/* Left Column: Projects List */}
        <Box
          sx={{
            width: { xs: 180, sm: 280 },
            borderRight: `1px solid ${tokens.colors.secondary[200]}`,
            bgcolor: "#f8fafc",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <Box sx={{ p: 2, borderBottom: `1px solid ${tokens.colors.secondary[200]}` }}>
            <Typography variant="subtitle2" fontWeight={800} color={tokens.colors.secondary[800]}>
              Active Projects ({projects.length})
            </Typography>
          </Box>
          <Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
            {loadingProjects ? (
              <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
                <CircularProgress size={24} />
              </Box>
            ) : projects.length === 0 ? (
              <Box sx={{ p: 2, textAlign: "center" }}>
                <Typography variant="caption" color="text.secondary">
                  No active projects found.
                </Typography>
              </Box>
            ) : (
              projects.map((proj) => {
                const isSelected = proj.id === selectedProjectId;
                return (
                  <Box
                    key={proj.id}
                    onClick={() => setSelectedProjectId(proj.id)}
                    sx={{
                      p: 1.5,
                      mb: 1,
                      borderRadius: `${tokens.borderRadius.md}px`,
                      cursor: "pointer",
                      bgcolor: isSelected ? tokens.colors.primary[50] : "transparent",
                      border: isSelected
                        ? `1.5px solid ${tokens.colors.primary.main}`
                        : "1px solid transparent",
                      transition: "all 0.15s ease",
                      "&:hover": {
                        bgcolor: isSelected ? tokens.colors.primary[50] : "#ffffff",
                      },
                    }}
                  >
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.5 }}>
                      <Chip
                        label={proj.projectCode}
                        size="small"
                        sx={{
                          height: 20,
                          fontSize: "0.65rem",
                          fontWeight: 800,
                          bgcolor: isSelected ? tokens.colors.primary.main : tokens.colors.secondary[200],
                          color: isSelected ? "#ffffff" : tokens.colors.secondary[700],
                        }}
                      />
                      <Chip
                        label={proj.status}
                        size="small"
                        variant="outlined"
                        color={proj.status === "COMPLETED" ? "success" : "default"}
                        sx={{ height: 18, fontSize: "0.6rem", fontWeight: 700 }}
                      />
                    </Box>
                    <Typography
                      variant="body2"
                      fontWeight={isSelected ? 800 : 600}
                      color={isSelected ? tokens.colors.primary.main : tokens.colors.secondary[900]}
                      noWrap
                    >
                      {proj.projectName}
                    </Typography>
                  </Box>
                );
              })
            )}
          </Box>
        </Box>

        {/* Right Column: Chat Messages & Input */}
        <Box sx={{ flex: 1, display: "flex", flexDirection: "column", bgcolor: "#ffffff" }}>
          {/* Chat Header */}
          <Box
            sx={{
              p: 2,
              px: 3,
              borderBottom: `1px solid ${tokens.colors.secondary[200]}`,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              bgcolor: "#ffffff",
            }}
          >
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color={tokens.colors.secondary[900]}>
                {activeProject ? activeProject.projectName : "Select a Project"}
              </Typography>
              <Typography variant="caption" color="text.secondary">
                {activeProject ? `Code: ${activeProject.projectCode} • Chat channel with Webliix Project Team` : "No project selected"}
              </Typography>
            </Box>
            {selectedProjectId && (
              <Tooltip title="Refresh chat messages">
                <IconButton size="small" onClick={() => fetchMessages(selectedProjectId)}>
                  <RefreshIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {/* Messages Area */}
          <Box
            sx={{
              flex: 1,
              p: 3,
              overflowY: "auto",
              display: "flex",
              flexDirection: "column",
              gap: 2,
              bgcolor: "#f8fafc",
            }}
          >
            {loadingMessages ? (
              <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <CircularProgress />
              </Box>
            ) : messages.length === 0 ? (
              <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", color: "text.secondary", gap: 1 }}>
                <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: tokens.colors.secondary[300] }} />
                <Typography variant="subtitle2" fontWeight={700}>
                  No messages on this project yet.
                </Typography>
                <Typography variant="caption">
                  Type a message below to start a live conversation with your Webliix project team!
                </Typography>
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
                      maxWidth: "75%",
                      alignSelf: isClient ? "flex-end" : "flex-start",
                    }}
                  >
                    {/* Author Label */}
                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5, px: 0.5 }}>
                      {!isClient && (
                        <Avatar sx={{ width: 20, height: 20, bgcolor: tokens.colors.primary.main, fontSize: "0.65rem" }}>
                          <SupportAgentIcon sx={{ fontSize: 14 }} />
                        </Avatar>
                      )}
                      <Typography variant="caption" fontWeight={700} color={isClient ? tokens.colors.primary.main : tokens.colors.secondary[800]}>
                        {isClient ? "You (Client)" : (msg.authorName || "Webliix Engineer")}
                      </Typography>
                      {!isClient && (
                        <Chip
                          label={msg.authorRole || "TEAM"}
                          size="small"
                          sx={{ height: 16, fontSize: "0.6rem", fontWeight: 800, bgcolor: tokens.colors.secondary[200] }}
                        />
                      )}
                      <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
                        {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : ""}
                      </Typography>
                    </Box>

                    {/* Balloon */}
                    <Box
                      sx={{
                        p: 1.75,
                        px: 2,
                        borderRadius: `${tokens.borderRadius.md}px`,
                        borderTopRightRadius: isClient ? 2 : `${tokens.borderRadius.md}px`,
                        borderTopLeftRadius: !isClient ? 2 : `${tokens.borderRadius.md}px`,
                        bgcolor: isClient ? tokens.colors.primary.main : "#ffffff",
                        color: isClient ? "#ffffff" : tokens.colors.secondary[900],
                        boxShadow: isClient ? tokens.shadows.sm : "0 1px 3px rgba(0,0,0,0.06)",
                        border: isClient ? "none" : `1px solid ${tokens.colors.secondary[200]}`,
                        wordBreak: "break-word",
                        whiteSpace: "pre-line",
                      }}
                    >
                      <Typography variant="body2" sx={{ lineHeight: 1.5 }}>
                        {msg.message || msg.comment}
                      </Typography>
                    </Box>
                  </Box>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </Box>

          {/* Input Area */}
          <Box
            component="form"
            onSubmit={handleSendMessage}
            sx={{
              p: 2,
              bgcolor: "#ffffff",
              borderTop: `1px solid ${tokens.colors.secondary[200]}`,
              display: "flex",
              gap: 1.5,
              alignItems: "flex-end",
            }}
          >
            <TextField
              fullWidth
              multiline
              maxRows={4}
              size="small"
              placeholder={selectedProjectId ? "Type a message to your Webliix project team (Press Enter to send)..." : "Select a project to chat"}
              disabled={!selectedProjectId || sending}
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              sx={{
                bgcolor: "#f8fafc",
                borderRadius: `${tokens.borderRadius.md}px`,
              }}
            />
            <Button
              type="submit"
              variant="contained"
              disabled={!selectedProjectId || !newMessage.trim() || sending}
              endIcon={sending ? <CircularProgress size={16} color="inherit" /> : <SendIcon />}
              sx={{
                height: 40,
                px: 3,
                fontWeight: 700,
                textTransform: "none",
                borderRadius: `${tokens.borderRadius.md}px`,
                bgcolor: tokens.colors.primary.main,
              }}
            >
              Send
            </Button>
          </Box>
        </Box>
      </Card>
    </Box>
  );
}
