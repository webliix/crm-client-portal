import { useState, useEffect, type FormEvent } from "react";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import Chip from "@mui/material/Chip";
import Divider from "@mui/material/Divider";
import CircularProgress from "@mui/material/CircularProgress";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SaveIcon from "@mui/icons-material/Save";
import { tokens } from "../theme/tokens";
import { authService, type ClientUser } from "../services/authService";

export default function ClientProfilePage() {
  const [user, setUser] = useState<ClientUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [jobTitle, setJobTitle] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");

  // Password Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [savingPassword, setSavingPassword] = useState(false);
  const [passwordSuccess, setPasswordSuccess] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    authService.getProfile().then((u) => {
      if (u) {
        setUser(u);
        setFirstName(u.firstName || u.name.split(" ")[0] || "");
        setLastName(u.lastName || u.name.split(" ")[1] || "");
        setPhone(u.phone || "");
        setJobTitle(u.jobTitle || "Client Partner");
        setBio(u.bio || "Webliix Enterprise Client Account");
        setTimezone(u.timezone || "Asia/Kolkata");
      }
      setLoading(false);
    });
  }, []);

  const handleUpdateProfile = async (e: FormEvent) => {
    e.preventDefault();
    setSavingProfile(true);
    setProfileSuccess(null);
    setProfileError(null);

    const updated = await authService.updateProfile({
      firstName,
      lastName,
      phone,
      jobTitle,
      bio,
      timezone,
    });

    if (updated) {
      setUser(updated);
      setProfileSuccess("Profile details updated successfully!");
    } else {
      setProfileError("Failed to update profile. Please try again.");
    }
    setSavingProfile(false);
  };

  const handleChangePassword = async (e: FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setPasswordError("New passwords do not match.");
      return;
    }
    if (newPassword.length < 6) {
      setPasswordError("Password must be at least 6 characters long.");
      return;
    }

    setSavingPassword(true);
    setPasswordSuccess(null);
    setPasswordError(null);

    const ok = await authService.changePassword(currentPassword, newPassword);
    if (ok) {
      setPasswordSuccess("Password changed successfully!");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      setPasswordError("Current password is incorrect or password change failed.");
    }
    setSavingPassword(false);
  };

  if (loading) {
    return (
      <Box sx={{ py: 10, textAlign: "center" }}>
        <CircularProgress size={40} sx={{ color: tokens.colors.primary.main }} />
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2.5, md: 4 } }}>
      {/* Page Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
          Account Profile & Settings
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Manage your personal details, contact preferences, and account security.
        </Typography>
      </Box>

      {/* User Header Card */}
      <Card
        sx={{
          borderRadius: tokens.borderRadius.xl,
          border: `1px solid ${tokens.colors.secondary[200]}`,
          mb: 4,
          background: `linear-gradient(135deg, #ffffff 0%, ${tokens.colors.primary[50]} 100%)`,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 }, display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <Avatar
            sx={{
              width: 72,
              height: 72,
              bgcolor: tokens.colors.primary.main,
              fontSize: "2rem",
              fontWeight: 800,
              boxShadow: `0 8px 20px ${tokens.colors.primary[200]}`,
            }}
          >
            {(user?.name || "C").charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
              <Typography variant="h5" fontWeight={800} color={tokens.colors.secondary[900]}>
                {user?.name || "Client Partner"}
              </Typography>
              <Chip label="Verified Client" color="primary" size="small" sx={{ fontWeight: 700 }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {user?.email} • {jobTitle}
            </Typography>
          </Box>
        </CardContent>
      </Card>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.1fr 0.9fr" }, gap: 4 }}>
        {/* Left Column: Personal Information */}
        <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <PersonOutlinedIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Personal Information
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {profileSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: tokens.borderRadius.md }}>
                {profileSuccess}
              </Alert>
            )}
            {profileError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: tokens.borderRadius.md }}>
                {profileError}
              </Alert>
            )}

            <form onSubmit={handleUpdateProfile}>
              <Box sx={{ display: "grid", gap: 2.5 }}>
                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="First Name"
                    fullWidth
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                  <TextField
                    label="Last Name"
                    fullWidth
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="Email Address"
                    fullWidth
                    disabled
                    value={user?.email || ""}
                    helperText="Contact system admin to change email"
                  />
                  <TextField
                    label="Phone Number"
                    fullWidth
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                  />
                </Box>

                <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" }, gap: 2 }}>
                  <TextField
                    label="Job Title / Position"
                    fullWidth
                    value={jobTitle}
                    onChange={(e) => setJobTitle(e.target.value)}
                  />
                  <TextField
                    label="Timezone"
                    fullWidth
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                  />
                </Box>

                <TextField
                  label="Account Bio / Notes"
                  fullWidth
                  multiline
                  rows={3}
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />

                <Button
                  type="submit"
                  variant="contained"
                  startIcon={<SaveIcon />}
                  disabled={savingProfile}
                  sx={{ borderRadius: tokens.borderRadius.md, fontWeight: 700, px: 3, py: 1.25, width: "fit-content" }}
                >
                  {savingProfile ? "Saving..." : "Save Profile Changes"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>

        {/* Right Column: Change Password */}
        <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 3 }}>
              <LockOutlinedIcon color="primary" />
              <Typography variant="h6" fontWeight={700}>
                Security & Password
              </Typography>
            </Box>
            <Divider sx={{ mb: 3 }} />

            {passwordSuccess && (
              <Alert severity="success" sx={{ mb: 3, borderRadius: tokens.borderRadius.md }}>
                {passwordSuccess}
              </Alert>
            )}
            {passwordError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: tokens.borderRadius.md }}>
                {passwordError}
              </Alert>
            )}

            <form onSubmit={handleChangePassword}>
              <Box sx={{ display: "grid", gap: 2.5 }}>
                <TextField
                  label="Current Password"
                  type="password"
                  fullWidth
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <TextField
                  label="New Password"
                  type="password"
                  fullWidth
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <TextField
                  label="Confirm New Password"
                  type="password"
                  fullWidth
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
                <Button
                  type="submit"
                  variant="outlined"
                  disabled={!currentPassword || !newPassword || savingPassword}
                  sx={{ borderRadius: tokens.borderRadius.md, fontWeight: 700, py: 1.25 }}
                >
                  {savingPassword ? "Updating Password..." : "Change Password"}
                </Button>
              </Box>
            </form>
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}
