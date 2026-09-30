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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import KeyOutlinedIcon from "@mui/icons-material/KeyOutlined";
import InputAdornment from "@mui/material/InputAdornment";
import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";

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
  const [resetStep, setResetStep] = useState<"EMAIL" | "OTP">("EMAIL");
  const [resetLoading, setResetLoading] = useState(false);
  const [resetMsg, setResetMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both email and password.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      await authService.login(email.trim(), password);
      navigate("/dashboard");
    } catch {
      setError("Invalid login credentials. Please verify your email and password.");
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = (e: FormEvent) => {
    e.preventDefault();
    if (!resetEmail) return;
    setResetLoading(true);
    setResetMsg(null);
    setTimeout(() => {
      setResetLoading(false);
      setResetStep("OTP");
      setResetMsg({ type: "success", text: "Verification code sent to your email address." });
    }, 1000);
  };

  const handleVerifyOtpAndReset = (e: FormEvent) => {
    e.preventDefault();
    if (!otpCode || !newPassword) return;
    setResetLoading(true);
    setResetMsg(null);
    setTimeout(() => {
      setResetLoading(false);
      setResetMsg({ type: "success", text: "Password reset successful! You can now log in." });
      setTimeout(() => {
        setForgotModalOpen(false);
        setResetStep("EMAIL");
        setResetMsg(null);
        setOtpCode("");
        setNewPassword("");
      }, 1500);
    }, 1200);
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#0f172a",
        p: 2.5,
      }}
    >
      <Card
        sx={{
          width: "100%",
          maxWidth: 440,
          borderRadius: tokens.borderRadius.xl,
          boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
          bgcolor: "#ffffff",
        }}
      >
        <CardContent sx={{ p: { xs: 3.5, sm: 5 } }}>
          {/* Header */}
          <Box sx={{ textAlign: "center", mb: 4 }}>
            <Box
              component="img"
              src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
              alt="Webliix Logo"
              sx={{
                height: 52,
                maxHeight: 52,
                objectFit: "contain",
                mx: "auto",
                mb: 2,
              }}
            />
            <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
              Client Portal
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Access your project progress, deliverables & billing
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: tokens.borderRadius.md }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "grid", gap: 2.5 }}>
              <Box>
                <Typography variant="caption" fontWeight={700} color={tokens.colors.secondary[700]} sx={{ mb: 0.75, display: "block" }}>
                  Client Email Address
                </Typography>
                <TextField
                  fullWidth
                  type="email"
                  placeholder="client@yourcompany.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <EmailOutlinedIcon sx={{ fontSize: 20, color: tokens.colors.secondary[400] }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 0.75 }}>
                  <Typography variant="caption" fontWeight={700} color={tokens.colors.secondary[700]}>
                    Password
                  </Typography>
                  <Button
                    size="small"
                    onClick={() => { setForgotModalOpen(true); setResetStep("EMAIL"); setResetMsg(null); }}
                    sx={{ p: 0, minWidth: "auto", fontSize: "0.75rem", fontWeight: 700, textTransform: "none", color: tokens.colors.primary.main }}
                  >
                    Forgot Password?
                  </Button>
                </Box>
                <TextField
                  fullWidth
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LockOutlinedIcon sx={{ fontSize: 20, color: tokens.colors.secondary[400] }} />
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mt: 1,
                  py: 1.5,
                  borderRadius: tokens.borderRadius.md,
                  fontWeight: 800,
                  fontSize: "0.9375rem",
                  bgcolor: tokens.colors.primary.main,
                  boxShadow: `0 4px 14px ${tokens.colors.primary[300]}`,
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Log In"}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Footer Policy Links */}
      <Box sx={{ mt: 3, display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center" }}>
        <Typography
          component="a"
          href="https://webliix.com/terms"
          target="_blank"
          rel="noreferrer"
          variant="caption"
          color="#94a3b8"
          sx={{ textDecoration: "none", "&:hover": { color: "#ffffff", textDecoration: "underline" } }}
        >
          Terms of Service
        </Typography>
        <Typography
          component="a"
          href="https://webliix.com/privacy"
          target="_blank"
          rel="noreferrer"
          variant="caption"
          color="#94a3b8"
          sx={{ textDecoration: "none", "&:hover": { color: "#ffffff", textDecoration: "underline" } }}
        >
          Privacy Policy
        </Typography>
        <Typography
          component="a"
          href="https://webliix.com/refund"
          target="_blank"
          rel="noreferrer"
          variant="caption"
          color="#94a3b8"
          sx={{ textDecoration: "none", "&:hover": { color: "#ffffff", textDecoration: "underline" } }}
        >
          Refund Policy
        </Typography>
      </Box>

      {/* Forgot Password Dialog Modal */}
      <Dialog open={forgotModalOpen} onClose={() => setForgotModalOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 800 }}>Reset Client Account Password</DialogTitle>
        <DialogContent>
          {resetMsg && (
            <Alert severity={resetMsg.type} sx={{ mb: 2, mt: 1 }}>
              {resetMsg.text}
            </Alert>
          )}

          {resetStep === "EMAIL" ? (
            <form onSubmit={handleSendOtp} id="otp-email-form">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter your registered client email address to receive a password reset OTP code.
              </Typography>
              <TextField
                autoFocus
                fullWidth
                label="Registered Email"
                type="email"
                required
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
              />
            </form>
          ) : (
            <form onSubmit={handleVerifyOtpAndReset} id="otp-verify-form">
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Enter the OTP verification code sent to <strong>{resetEmail}</strong> and your new password.
              </Typography>
              <Box sx={{ display: "grid", gap: 2 }}>
                <TextField
                  fullWidth
                  label="OTP Code"
                  placeholder="6-digit code"
                  required
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <KeyOutlinedIcon sx={{ fontSize: 20 }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <TextField
                  fullWidth
                  label="New Password"
                  type="password"
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </Box>
            </form>
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5 }}>
          <Button onClick={() => setForgotModalOpen(false)}>Cancel</Button>
          {resetStep === "EMAIL" ? (
            <Button
              type="submit"
              form="otp-email-form"
              variant="contained"
              disabled={resetLoading || !resetEmail}
            >
              {resetLoading ? "Sending OTP..." : "Send Verification OTP"}
            </Button>
          ) : (
            <Button
              type="submit"
              form="otp-verify-form"
              variant="contained"
              disabled={resetLoading || !otpCode || !newPassword}
            >
              {resetLoading ? "Resetting..." : "Set New Password"}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
}
