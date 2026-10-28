import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import InputAdornment from "@mui/material/InputAdornment";
import Chip from "@mui/material/Chip";

// Icons
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";
import { IsometricCubeIllustration, GeometricBadge } from "../components/common/PortalIllustrations";

export default function ClientLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Forgot Password Modal State
  const [forgotModalOpen, setForgotModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [resetStep, setResetStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter both your client email and password.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await authService.login(email.trim(), password);
      navigate("/dashboard");
    } catch {
      setError("Invalid credentials. Please verify your client email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async (e: FormEvent) => {
    e.preventDefault();
    if (!resetEmail.trim()) return;
    setResetLoading(true);
    setResetMsg(null);
    try {
      const res = await authService.forgotPassword(resetEmail.trim());
      setResetStep("OTP");
      setResetMsg({
        type: "success",
        text: res.message || "A 6-digit verification code has been dispatched to your email.",
      });
    } catch (err: any) {
      setResetMsg({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to dispatch verification code.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  const handleVerifyOtpAndReset = async (e: FormEvent) => {
    e.preventDefault();
    if (!otpCode.trim() || !newPassword) return;
    if (newPassword.length < 6) {
      setResetMsg({ type: "error", text: "New password must be at least 6 characters long." });
      return;
    }
    setResetLoading(true);
    setResetMsg(null);
    try {
      let currentToken = resetToken;
      if (!currentToken) {
        const verifyRes = await authService.verifyResetOtp(resetEmail.trim(), otpCode.trim());
        currentToken = verifyRes.resetToken;
        setResetToken(currentToken);
      }
      const resetRes = await authService.resetPassword(resetEmail.trim(), currentToken, newPassword);
      setResetMsg({
        type: "success",
        text: resetRes.message || "Password reset successful! You can now sign in.",
      });
      setTimeout(() => {
        setForgotModalOpen(false);
        setResetStep("EMAIL");
        setResetEmail("");
        setOtpCode("");
        setNewPassword("");
        setResetToken("");
        setResetMsg(null);
      }, 2000);
    } catch (err: any) {
      setResetMsg({
        type: "error",
        text: err.response?.data?.message || err.message || "Verification code is invalid or has expired.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8fafc",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: { xs: 2, sm: 3 },
      }}
    >
      {/* Central Login Card */}
      <Card
        sx={{
          width: "100%",
          maxWidth: 960,
          borderRadius: "24px",
          border: "1px solid #e2e8f0",
          boxShadow: "0 20px 40px -8px rgba(0,0,0,0.06)",
          display: "grid",
          gridTemplateColumns: { xs: "1fr", md: "1.1fr 1fr" },
          overflow: "hidden",
          bgcolor: "#ffffff",
        }}
      >
        {/* Left Side: Login Form */}
        <Box sx={{ p: { xs: 3, sm: 5 }, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {/* Brand Logo & Title */}
          <Box sx={{ mb: 3, display: "flex", alignItems: "center", gap: 1.5 }}>
            <Box
              component="img"
              src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
              alt="Webliix"
              sx={{ height: 32, objectFit: "contain" }}
            />
            <Typography variant="h6" fontWeight={900} letterSpacing="-0.03em" fontStyle="italic" color="#111827">
              Webliix
            </Typography>
            <Chip
              label="Client Hub"
              size="small"
              sx={{ bgcolor: "#f1f5f9", fontWeight: 800, fontSize: "0.6875rem", height: 20 }}
            />
          </Box>

          <Typography variant="h5" fontWeight={900} letterSpacing="-0.03em" color="#0f172a" gutterBottom>
            Welcome Back
          </Typography>
          <Typography variant="body2" color="#64748b" sx={{ mb: 3 }}>
            Sign in to access your projects, milestone tasks, deliverables, and billing invoices.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2.5, borderRadius: "12px", fontSize: "0.8125rem" }}>
              {error}
            </Alert>
          )}

          <Box component="form" onSubmit={handleSubmit} sx={{ display: "grid", gap: 2 }}>
            <TextField
              label="Client Email"
              type="email"
              fullWidth
              required
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@company.com"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <EmailOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                },
              }}
            />

            <TextField
              label="Password"
              type="password"
              fullWidth
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ color: "#94a3b8", fontSize: 20 }} />
                  </InputAdornment>
                ),
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "14px",
                },
              }}
            />

            <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
              <Button
                size="small"
                onClick={() => {
                  setForgotModalOpen(true);
                  setResetMsg(null);
                  setResetStep("EMAIL");
                }}
                sx={{
                  textTransform: "none",
                  fontWeight: 700,
                  fontSize: "0.8125rem",
                  color: "#64748b",
                  "&:hover": { color: "#111827" },
                }}
              >
                Forgot Password?
              </Button>
            </Box>

            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={loading}
              endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: 18 }} />}
              sx={{
                bgcolor: "#000000",
                color: "#ffffff",
                py: 1.35,
                fontWeight: 800,
                fontSize: "0.9375rem",
                borderRadius: "9999px",
                textTransform: "none",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                "&:hover": {
                  bgcolor: "#1e293b",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.25)",
                },
              }}
            >
              {loading ? <CircularProgress size={22} color="inherit" /> : "Sign In to Client Workspace"}
            </Button>
          </Box>
        </Box>

        {/* Right Side: Showcase Banner with 3D Illustration & Pastel Accents */}
        <Box
          sx={{
            display: { xs: "none", md: "flex" },
            flexDirection: "column",
            justifyContent: "space-between",
            p: 4.5,
            bgcolor: "#000000",
            color: "#ffffff",
            position: "relative",
            overflow: "hidden",
          }}
        >
          {/* Ambient 3D Illustration */}
          <Box
            sx={{
              position: "absolute",
              right: -30,
              top: 20,
              width: 320,
              height: 260,
              pointerEvents: "none",
              opacity: 0.95,
            }}
          >
            <IsometricCubeIllustration width="100%" height="100%" />
          </Box>

          {/* Top badges */}
          <Box sx={{ position: "relative", zIndex: 2, display: "flex", gap: 1 }}>
            <GeometricBadge type="cube" size={32} />
            <GeometricBadge type="hexagon" size={32} />
            <GeometricBadge type="star" size={32} />
          </Box>

          {/* Bottom text */}
          <Box sx={{ position: "relative", zIndex: 2, mt: "auto" }}>
            <Typography variant="h5" fontWeight={900} letterSpacing="-0.03em" sx={{ lineHeight: 1.25, mb: 1 }}>
              Engineered for seamless client collaboration
            </Typography>
            <Typography variant="body2" sx={{ color: "#94a3b8", lineHeight: 1.5 }}>
              Track sprint velocity, view real-time deliverables, inspect code milestones, and review invoices in one unified workspace.
            </Typography>
          </Box>
        </Box>
      </Card>

      {/* Forgot Password Dialog */}
      <Dialog open={forgotModalOpen} onClose={() => setForgotModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>Reset Password</DialogTitle>
        <DialogContent dividers>
          {resetMsg && (
            <Alert severity={resetMsg.type} sx={{ mb: 2, borderRadius: "10px", fontSize: "0.8125rem" }}>
              {resetMsg.text}
            </Alert>
          )}

          {resetStep === "EMAIL" ? (
            <Box component="form" onSubmit={handleSendOtp} sx={{ display: "grid", gap: 2, pt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                Enter your registered client email to receive a 6-digit verification code.
              </Typography>
              <TextField
                label="Registered Email"
                type="email"
                fullWidth
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="name@company.com"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={resetLoading || !resetEmail.trim()}
                sx={{ bgcolor: "#000000", "&:hover": { bgcolor: "#1e293b" }, fontWeight: 700, borderRadius: "9999px", py: 1 }}
              >
                {resetLoading ? <CircularProgress size={20} color="inherit" /> : "Send Verification Code"}
              </Button>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleVerifyOtpAndReset} sx={{ display: "grid", gap: 2, pt: 1 }}>
              <TextField
                label="6-Digit OTP Code"
                fullWidth
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
              />
              <TextField
                label="New Password"
                type="password"
                fullWidth
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="At least 6 characters"
              />
              <Button
                type="submit"
                variant="contained"
                disabled={resetLoading || !otpCode.trim() || !newPassword}
                sx={{ bgcolor: "#000000", "&:hover": { bgcolor: "#1e293b" }, fontWeight: 700, borderRadius: "9999px", py: 1 }}
              >
                {resetLoading ? <CircularProgress size={20} color="inherit" /> : "Verify & Set New Password"}
              </Button>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setForgotModalOpen(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
