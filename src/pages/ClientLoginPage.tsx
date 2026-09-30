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
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import InputAdornment from "@mui/material/InputAdornment";
import { tokens } from "../theme/tokens";
import { authService } from "../services/authService";

export default function ClientLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      setError("Invalid login credentials. Please check your default email & password sent to your email.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
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
              src="https://webliix.com/logo.svg"
              onError={(e: any) => { e.target.onerror = null; e.target.src = "https://webliix.in/favicon.ico"; }}
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
              Client Portal Login
            </Typography>
            <Typography variant="body2" color="text.secondary">
              login.webliix.com — Access your project progress, billing & instructions
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
                <Typography variant="caption" fontWeight={700} color={tokens.colors.secondary[700]} sx={{ mb: 0.75, display: "block" }}>
                  Password
                </Typography>
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
                {loading ? <CircularProgress size={24} sx={{ color: "#ffffff" }} /> : "Log In to Client Portal"}
              </Button>
            </Box>
          </form>

          <Box sx={{ mt: 4, pt: 3, borderTop: `1px solid ${tokens.colors.secondary[200]}`, textAlign: "center" }}>
            <Typography variant="caption" color="text.secondary" display="block">
              Check your welcome email from <strong>noreply@webliix.com</strong> for your default credentials.
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
