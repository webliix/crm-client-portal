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
import Chip from "@mui/material/Chip";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import CheckCircle2Icon from "@mui/icons-material/CheckCircleOutline";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
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
        text: res.message || "A 6-digit OTP verification code has been dispatched to your email address.",
      });
    } catch (err: any) {
      setResetMsg({
        type: "error",
        text: err.response?.data?.message || err.message || "Failed to dispatch verification code. Please check the email entered.",
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
        text: resetRes.message || "Password updated successfully! You can now log in.",
      });
      setTimeout(() => {
        setForgotModalOpen(false);
        setResetStep("EMAIL");
        setResetMsg(null);
        setOtpCode("");
        setNewPassword("");
        setResetToken("");
      }, 1500);
    } catch (err: any) {
      setResetMsg({
        type: "error",
        text: err.response?.data?.message || err.message || "Invalid or expired OTP code. Please check and try again.",
      });
    } finally {
      setResetLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#090d16",
        position: "relative",
        overflow: "hidden",
        p: { xs: 2.5, sm: 4 },
      }}
    >
      {/* Ambient Cyber Halos */}
      <Box
        sx={{
          position: "absolute",
          top: "-15%",
          left: "50%",
          transform: "translateX(-50%)",
          width: { xs: "360px", sm: "700px" },
          height: { xs: "360px", sm: "500px" },
          background: "radial-gradient(circle, rgba(99, 102, 241, 0.22) 0%, rgba(139, 92, 246, 0.12) 45%, transparent 70%)",
          filter: "blur(90px)",
          borderRadius: "50%",
          pointerEvents: "none",
        }}
      />

      {/* Main Login Card */}
      <Card
        sx={{
          width: "100%",
          maxWidth: 460,
          borderRadius: tokens.borderRadius.xl,
          boxShadow: "0 24px 60px -12px rgba(0, 0, 0, 0.5), 0 0 20px rgba(99, 102, 241, 0.15)",
          bgcolor: "#ffffff",
          border: "1px solid rgba(226, 232, 240, 0.8)",
          position: "relative",
          zIndex: 10,
          overflow: "hidden",
        }}
      >
        {/* Top Accent Gradient Bar */}
        <Box sx={{ height: 4, background: tokens.colors.primary.gradient }} />

        <CardContent sx={{ p: { xs: 3.5, sm: 4.5 } }}>
          {/* Logo & Headline */}
          <Box sx={{ textAlign: "center", mb: 3.5 }}>
            <Box
              component="img"
              src="https://res.cloudinary.com/vhth8clt/image/upload/v1788210409/logo.png"
              alt="Webliix Logo"
              sx={{
                height: 48,
                maxHeight: 48,
                objectFit: "contain",
                mx: "auto",
                mb: 2,
              }}
            />

            <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.75, mb: 1, px: 2, py: 0.5, borderRadius: tokens.borderRadius.full, bgcolor: tokens.colors.primary[50], border: `1px solid ${tokens.colors.primary[200]}` }}>
              <ShieldOutlinedIcon sx={{ fontSize: 14, color: tokens.colors.primary.main }} />
              <Typography variant="caption" fontWeight={800} color={tokens.colors.primary[700]} sx={{ letterSpacing: "0.04em" }}>
                SECURE CLIENT PORTAL
              </Typography>
            </Box>

            <Typography variant="h5" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
              Client Sign-In
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ fontSize: "0.875rem" }}>
              Access milestones, live engineering chat, and billing
            </Typography>
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 3, borderRadius: tokens.borderRadius.md, fontSize: "0.84rem" }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <Box sx={{ display: "grid", gap: 2.25 }}>
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
                        <EmailOutlinedIcon sx={{ fontSize: 19, color: tokens.colors.secondary[400] }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: tokens.borderRadius.md,
                      "&.Mui-focused fieldset": {
                        borderColor: tokens.colors.primary.main,
                        boxShadow: `0 0 0 3px ${tokens.colors.primary[100]}`,
                      },
                    },
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
                        <LockOutlinedIcon sx={{ fontSize: 19, color: tokens.colors.secondary[400] }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: tokens.borderRadius.md,
                      "&.Mui-focused fieldset": {
                        borderColor: tokens.colors.primary.main,
                        boxShadow: `0 0 0 3px ${tokens.colors.primary[100]}`,
                      },
                    },
                  }}
                />
              </Box>

              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                endIcon={!loading && <ArrowForwardIcon sx={{ fontSize: 18 }} />}
                sx={{
                  mt: 0.75,
                  py: 1.4,
                  borderRadius: tokens.borderRadius.md,
                  fontWeight: 800,
                  fontSize: "0.9375rem",
                  textTransform: "none",
                  background: tokens.colors.primary.gradient,
                  boxShadow: "0 6px 20px rgba(99, 102, 241, 0.4)",
                  "&:hover": {
                    background: "linear-gradient(135deg, #4f46e5 0%, #4338ca 100%)",
                    boxShadow: "0 8px 24px rgba(99, 102, 241, 0.5)",
                  },
                }}
              >
                {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Access Client Workspace"}
              </Button>
            </Box>
          </form>

          {/* Value Props Row */}
          <Box sx={{ mt: 3.5, pt: 3, borderTop: "1px solid #f1f5f9", display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 1, textAlign: "center" }}>
            <Box>
              <Typography variant="caption" fontWeight={800} color="#0f172a" sx={{ fontSize: "0.75rem", display: "block" }}>
                24/7 Access
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6875rem" }}>
                Live Tracking
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={800} color="#0f172a" sx={{ fontSize: "0.75rem", display: "block" }}>
                Direct Chat
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6875rem" }}>
                Engineering Team
              </Typography>
            </Box>
            <Box>
              <Typography variant="caption" fontWeight={800} color="#0f172a" sx={{ fontSize: "0.75rem", display: "block" }}>
                100% Verified
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.6875rem" }}>
                Invoices & Files
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Footer Support & Links */}
      <Box sx={{ mt: 3, textAlign: "center", position: "relative", zIndex: 10 }}>
        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap", justifyContent: "center", mb: 1 }}>
          <Typography
            component="a"
            href="https://webliix.com"
            target="_blank"
            rel="noopener noreferrer"
            variant="caption"
            sx={{ color: "#94a3b8", textDecoration: "none", fontWeight: 600, "&:hover": { color: "#ffffff" } }}
          >
            ← Back to Webliix.com
          </Typography>
          <Typography
            component="a"
            href="https://webliix.com/terms"
            target="_blank"
            rel="noopener noreferrer"
            variant="caption"
            sx={{ color: "#94a3b8", textDecoration: "none", fontWeight: 600, "&:hover": { color: "#ffffff" } }}
          >
            Terms of Service
          </Typography>
          <Typography
            component="a"
            href="https://webliix.com/privacy"
            target="_blank"
            rel="noopener noreferrer"
            variant="caption"
            sx={{ color: "#94a3b8", textDecoration: "none", fontWeight: 600, "&:hover": { color: "#ffffff" } }}
          >
            Privacy Policy
          </Typography>
        </Box>
        <Typography variant="caption" sx={{ color: "#64748b", fontSize: "0.6875rem", fontFamily: "monospace" }}>
          Official Webliix Client Portal • login.webliix.com
        </Typography>
      </Box>

      {/* Forgot Password OTP Modal */}
      <Dialog
        open={forgotModalOpen}
        onClose={() => setForgotModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: tokens.borderRadius.lg,
            p: 1,
            boxShadow: tokens.shadows.xl,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, pb: 1 }}>
          {resetStep === "EMAIL" ? "Reset Password" : "Enter Verification OTP"}
        </DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            {resetStep === "EMAIL"
              ? "Enter your client account email address to receive a 6-digit verification code."
              : `A 6-digit OTP code was sent to ${resetEmail}. Enter the code and choose a new password.`}
          </Typography>

          {resetMsg && (
            <Alert severity={resetMsg.type} sx={{ mb: 2, borderRadius: tokens.borderRadius.md }}>
              {resetMsg.text}
            </Alert>
          )}

          {resetStep === "EMAIL" ? (
            <Box component="form" onSubmit={handleSendOtp} sx={{ display: "grid", gap: 2 }}>
              <TextField
                autoFocus
                fullWidth
                type="email"
                label="Client Email"
                value={resetEmail}
                onChange={(e) => setResetEmail(e.target.value)}
                placeholder="client@yourcompany.com"
                required
              />
              <DialogActions sx={{ px: 0, pb: 0 }}>
                <Button onClick={() => setForgotModalOpen(false)} sx={{ fontWeight: 600 }}>
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={resetLoading || !resetEmail.trim()}
                  sx={{ fontWeight: 700, borderRadius: tokens.borderRadius.md }}
                >
                  {resetLoading ? <CircularProgress size={20} color="inherit" /> : "Send OTP"}
                </Button>
              </DialogActions>
            </Box>
          ) : (
            <Box component="form" onSubmit={handleVerifyOtpAndReset} sx={{ display: "grid", gap: 2 }}>
              <TextField
                autoFocus
                fullWidth
                label="6-Digit Verification Code"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                required
              />
              <TextField
                fullWidth
                type="password"
                label="New Password (min. 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
              />
              <DialogActions sx={{ px: 0, pb: 0 }}>
                <Button onClick={() => setResetStep("EMAIL")} sx={{ fontWeight: 600 }}>
                  Back
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={resetLoading || !otpCode.trim() || !newPassword}
                  sx={{ fontWeight: 700, borderRadius: tokens.borderRadius.md }}
                >
                  {resetLoading ? <CircularProgress size={20} color="inherit" /> : "Update Password"}
                </Button>
              </DialogActions>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
