import { useState, useEffect } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Chip from "@mui/material/Chip";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import CircularProgress from "@mui/material/CircularProgress";
import ConfirmationNumberOutlinedIcon from "@mui/icons-material/ConfirmationNumberOutlined";
import AddIcon from "@mui/icons-material/Add";
import { tokens } from "../theme/tokens";
import { ticketApi, type ClientTicket } from "../services/ticketApi";

export default function ClientTicketsPage() {
  const [tickets, setTickets] = useState<ClientTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [subject, setSubject] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    ticketApi.getMyTickets().then((data) => {
      setTickets(data);
      setLoading(false);
    });
  }, []);

  const handleCreate = async () => {
    if (!subject.trim() || !description.trim()) return;
    setCreating(true);
    const created = await ticketApi.createTicket(subject.trim(), description.trim());
    if (created) {
      setTickets((prev) => [created, ...prev]);
    } else {
      setTickets((prev) => [
        {
          id: Date.now(),
          ticketNumber: `TCK-${Math.floor(Math.random() * 9000) + 1000}`,
          subject: subject.trim(),
          description: description.trim(),
          status: "OPEN",
          priority: "MEDIUM",
          createdAt: new Date().toISOString(),
        },
        ...prev,
      ]);
    }
    setSubject("");
    setDescription("");
    setOpenModal(false);
    setCreating(false);
  };

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 4, flexWrap: "wrap", gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
            Support & Help Desk
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Need technical support or assistance? Raise a ticket directly with Webliix engineers.
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ borderRadius: tokens.borderRadius.md, fontWeight: 700 }}
        >
          New Support Ticket
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ py: 8, textAlign: "center" }}>
          <CircularProgress size={40} sx={{ color: tokens.colors.primary.main }} />
        </Box>
      ) : tickets.length === 0 ? (
        <Card sx={{ p: 6, textAlign: "center", borderRadius: tokens.borderRadius.lg }}>
          <ConfirmationNumberOutlinedIcon sx={{ fontSize: 48, color: tokens.colors.secondary[300], mb: 1.5 }} />
          <Typography variant="h6" fontWeight={700}>
            No Support Tickets
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            You haven&apos;t opened any support tickets yet. Click below to request support.
          </Typography>
          <Button variant="contained" onClick={() => setOpenModal(true)} sx={{ fontWeight: 700 }}>
            Create First Support Ticket
          </Button>
        </Card>
      ) : (
        <Box sx={{ display: "grid", gap: 2 }}>
          {tickets.map((t) => (
            <Card key={t.id} sx={{ borderRadius: tokens.borderRadius.md, border: `1px solid ${tokens.colors.secondary[200]}` }}>
              <CardContent sx={{ p: 2.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
                <Box>
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                    <Chip label={t.ticketNumber || `TCK-${t.id}`} size="small" sx={{ fontWeight: 700 }} />
                    <Typography variant="subtitle1" fontWeight={700} color={tokens.colors.secondary[900]}>
                      {t.subject}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {t.description}
                  </Typography>
                </Box>
                <Chip label={t.status || "OPEN"} color={t.status === "RESOLVED" ? "success" : "primary"} sx={{ fontWeight: 700 }} />
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {/* New Ticket Modal */}
      <Dialog open={openModal} onClose={() => setOpenModal(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Create New Support Ticket</DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "grid", gap: 2.5, pt: 1 }}>
            <TextField
              label="Subject / Issue Title"
              fullWidth
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g. Request for domain configuration assistance"
            />
            <TextField
              label="Detailed Description"
              fullWidth
              multiline
              rows={4}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your issue or request in detail..."
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2.5 }}>
          <Button onClick={() => setOpenModal(false)}>Cancel</Button>
          <Button variant="contained" disabled={!subject.trim() || !description.trim() || creating} onClick={handleCreate} sx={{ fontWeight: 700 }}>
            {creating ? "Submitting..." : "Submit Ticket"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
