import { useState, useEffect, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
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
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import LinearProgress from "@mui/material/LinearProgress";
import CircularProgress from "@mui/material/CircularProgress";
import PersonOutlinedIcon from "@mui/icons-material/PersonOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import SaveIcon from "@mui/icons-material/Save";
import BusinessOutlinedIcon from "@mui/icons-material/BusinessOutlined";
import AssignmentOutlinedIcon from "@mui/icons-material/AssignmentOutlined";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MonetizationOnOutlinedIcon from "@mui/icons-material/MonetizationOnOutlined";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
import { tokens } from "../theme/tokens";
import { authService, type ClientUser } from "../services/authService";
import { projectApi, type ClientProject } from "../services/projectApi";

export default function ClientProfilePage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<ClientUser | null>(null);
  const [projects, setProjects] = useState<ClientProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const [tabValue, setTabValue] = useState(0);

  // Profile Form State
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [bio, setBio] = useState("");
  const [timezone, setTimezone] = useState("Asia/Kolkata");
  const [savingProfile, setSavingProfile] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

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
        setFirstName(u.firstName || u.name?.split(" ")[0] || "");
        setLastName(u.lastName || u.name?.split(" ")[1] || "");
        setPhone(u.phone || "");
        setBio(u.bio || "Webliix Enterprise Client Account");
        setTimezone(u.timezone || "Asia/Kolkata");
      }
      setLoading(false);
    });

    setLoadingProjects(true);
    projectApi
      .getMyProjects()
      .then((data) => {
        setProjects(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        setProjects([]);
      })
      .finally(() => {
        setLoadingProjects(false);
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

  // Metrics calculation
  const totalProjects = projects.length;
  const inProgressProjects = projects.filter(
    (p) => p.status === "IN_PROGRESS" || p.status === "ACTIVE" || p.status === "DEVELOPMENT"
  ).length;
  const completedProjects = projects.filter((p) => p.status === "COMPLETED").length;
  const totalContractBudget = projects.reduce((acc, p) => acc + (p.budget || 0), 0);

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
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={800} color={tokens.colors.secondary[900]} gutterBottom>
          Client Profile & Project Overview
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Access your personal details, company profile, active projects, and contract deliverables.
        </Typography>
      </Box>

      {/* Hero Client Summary Card */}
      <Card
        sx={{
          borderRadius: tokens.borderRadius.xl,
          border: `1px solid ${tokens.colors.secondary[200]}`,
          mb: 4,
          background: `linear-gradient(135deg, #ffffff 0%, ${tokens.colors.primary[50]} 100%)`,
          boxShadow: tokens.shadows.sm,
        }}
      >
        <CardContent sx={{ p: { xs: 3, md: 4 }, display: "flex", alignItems: "center", gap: 3, flexWrap: "wrap" }}>
          <Avatar
            sx={{
              width: 76,
              height: 76,
              bgcolor: tokens.colors.primary.main,
              fontSize: "2.2rem",
              fontWeight: 800,
              boxShadow: `0 8px 24px ${tokens.colors.primary[200]}`,
            }}
          >
            {(user?.name || "C").charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 260 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5, flexWrap: "wrap" }}>
              <Typography variant="h5" fontWeight={800} color={tokens.colors.secondary[900]}>
                {user?.name || "Client Partner"}
              </Typography>
              <Chip label="Verified Enterprise Client" color="primary" size="small" sx={{ fontWeight: 700 }} />
              <Chip label={`Client ID: #CLI-${user?.id || 101}`} variant="outlined" size="small" sx={{ fontWeight: 600 }} />
            </Box>
            <Typography variant="body2" color="text.secondary">
              {user?.email} • {phone || "No phone registered"} • Timezone: {timezone}
            </Typography>
          </Box>

          <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap" }}>
            <Box sx={{ textAlign: "center", px: 2, py: 1, bgcolor: "#ffffff", borderRadius: tokens.borderRadius.md, border: "1px solid #e2e8f0" }}>
              <Typography variant="h6" fontWeight={800} color={tokens.colors.primary[600]}>
                {totalProjects}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                Total Projects
              </Typography>
            </Box>
            <Box sx={{ textAlign: "center", px: 2, py: 1, bgcolor: "#ffffff", borderRadius: tokens.borderRadius.md, border: "1px solid #e2e8f0" }}>
              <Typography variant="h6" fontWeight={800} color="success.main">
                {inProgressProjects}
              </Typography>
              <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                Active / Running
              </Typography>
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: "divider", mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(_, val) => setTabValue(val)}
          sx={{
            "& .MuiTab-root": { textTransform: "none", fontWeight: 700, fontSize: "0.9375rem" },
          }}
        >
          <Tab icon={<PersonOutlinedIcon />} iconPosition="start" label="Profile & Company Details" />
          <Tab
            icon={<AssignmentOutlinedIcon />}
            iconPosition="start"
            label={`My Projects & Deliverables (${projects.length})`}
          />
          <Tab icon={<LockOutlinedIcon />} iconPosition="start" label="Security & Password" />
        </Tabs>
      </Box>

      {/* TAB 0: Profile & Company Details */}
      {tabValue === 0 && (
        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", lg: "1.15fr 0.85fr" }, gap: 4 }}>
          {/* Personal Information */}
          <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <PersonOutlinedIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Contact & Personal Details
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Keep your communication info updated so our engineering team can coordinate milestones directly.
              </Typography>
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
                      helperText="Contact system admin to modify login email"
                    />
                    <TextField
                      label="Phone Number"
                      fullWidth
                      value={phone}
                      placeholder="+91 9876543210"
                      onChange={(e) => setPhone(e.target.value)}
                    />
                  </Box>

                  <TextField
                    label="Timezone"
                    fullWidth
                    value={timezone}
                    onChange={(e) => setTimezone(e.target.value)}
                    helperText="Used for scheduling milestones and reviews"
                  />

                  <TextField
                    label="Account Bio / Organization Notes"
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
                    {savingProfile ? "Saving..." : "Save Profile Details"}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>

          {/* Company & Organization Details */}
          <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
            <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
              <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                  <BusinessOutlinedIcon color="primary" />
                  <Typography variant="h6" fontWeight={700}>
                    Company & Contract Organization
                  </Typography>
                </Box>
                <Divider sx={{ mb: 2.5 }} />

                <Box sx={{ display: "grid", gap: 2 }}>
                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      Company / Organization Name
                    </Typography>
                    <Typography variant="body1" fontWeight={700} sx={{ color: tokens.colors.secondary[900] }}>
                      {projects[0]?.customerCompanyName || user?.department || "Webliix Enterprise Partner"}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      Client Relationship Role
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.colors.secondary[800] }}>
                      Primary Project Stakeholder & Billing Owner
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      Registered Enterprise Email
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.colors.secondary[800] }}>
                      {user?.email}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      Dedicated Solutions Team
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.colors.secondary[800] }}>
                      Webliix Technical Project Lead & Dedicated Delivery Pod
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 700, textTransform: "uppercase" }}>
                      Billing & Legal Entity
                    </Typography>
                    <Typography variant="body2" sx={{ color: tokens.colors.secondary[800] }}>
                      Webliix Private Limited • MSME Registered Enterprise
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>

            {/* Quick Access Card */}
            <Card sx={{ borderRadius: tokens.borderRadius.lg, bgcolor: tokens.colors.primary[50], border: `1px solid ${tokens.colors.primary[200]}` }}>
              <CardContent sx={{ p: 3 }}>
                <Typography variant="subtitle1" fontWeight={800} color={tokens.colors.primary[900]} gutterBottom>
                  Need project updates or custom requests?
                </Typography>
                <Typography variant="body2" color={tokens.colors.primary[700]} sx={{ mb: 2 }}>
                  Submit support inquiries or schedule a sprint review with our delivery engineers.
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate("/tickets")}
                  sx={{ borderRadius: tokens.borderRadius.md, fontWeight: 700, textTransform: "none" }}
                >
                  Go to Support Tickets
                </Button>
              </CardContent>
            </Card>
          </Box>
        </Box>
      )}

      {/* TAB 1: My Projects & Deliverables */}
      {tabValue === 1 && (
        <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
          {/* Projects Metrics Bar */}
          <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr", md: "1fr 1fr 1fr 1fr" }, gap: 2.5 }}>
            <Card sx={{ p: 2.5, borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ bgcolor: tokens.colors.primary[50], color: tokens.colors.primary[700] }}>
                  <AssignmentOutlinedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800}>
                    {totalProjects}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Total Projects
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Card sx={{ p: 2.5, borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ bgcolor: "#ecfdf5", color: "#10b981" }}>
                  <AccessTimeIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ color: "#10b981" }}>
                    {inProgressProjects}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Active Development
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Card sx={{ p: 2.5, borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ bgcolor: "#eff6ff", color: "#3b82f6" }}>
                  <CheckCircleOutlineIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ color: "#3b82f6" }}>
                    {completedProjects}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Completed / Deployed
                  </Typography>
                </Box>
              </Box>
            </Card>

            <Card sx={{ p: 2.5, borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                <Avatar sx={{ bgcolor: "#faf5ff", color: "#9333ea" }}>
                  <MonetizationOnOutlinedIcon />
                </Avatar>
                <Box>
                  <Typography variant="h5" fontWeight={800} sx={{ color: "#9333ea" }}>
                    {totalContractBudget > 0 ? `₹${totalContractBudget.toLocaleString("en-IN")}` : "Enterprise"}
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748b", fontWeight: 600 }}>
                    Total Contract Value
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>

          {/* Projects List */}
          {loadingProjects ? (
            <Box sx={{ py: 6, textAlign: "center" }}>
              <CircularProgress size={32} />
            </Box>
          ) : projects.length === 0 ? (
            <Card sx={{ p: 6, textAlign: "center", borderRadius: tokens.borderRadius.lg }}>
              <Typography variant="h6" fontWeight={700} sx={{ color: "#64748b", mb: 1 }}>
                No active projects found under this account
              </Typography>
              <Typography variant="body2" sx={{ color: "#94a3b8", mb: 3 }}>
                When your Webliix contract is activated, all your milestones and deliverables will appear here.
              </Typography>
              <Button variant="outlined" onClick={() => navigate("/offers")}>
                View Pending Offers & Proposals
              </Button>
            </Card>
          ) : (
            <Box sx={{ display: "grid", gap: 3 }}>
              {projects.map((proj) => (
                <Card
                  key={proj.id}
                  sx={{
                    borderRadius: tokens.borderRadius.lg,
                    border: `1px solid ${tokens.colors.secondary[200]}`,
                    boxShadow: tokens.shadows.sm,
                    transition: "transform 0.2s, box-shadow 0.2s",
                    "&:hover": {
                      transform: "translateY(-2px)",
                      boxShadow: tokens.shadows.md,
                    },
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 2, mb: 2 }}>
                      <Box>
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 0.5 }}>
                          <Chip
                            label={proj.projectCode || `PRJ-${proj.id}`}
                            size="small"
                            sx={{ fontWeight: 800, bgcolor: tokens.colors.primary[50], color: tokens.colors.primary[700] }}
                          />
                          <Chip
                            label={proj.status.replace("_", " ")}
                            size="small"
                            color={proj.status === "COMPLETED" ? "success" : proj.status === "IN_PROGRESS" ? "primary" : "default"}
                            sx={{ fontWeight: 700 }}
                          />
                          {proj.priority && (
                            <Chip label={`Priority: ${proj.priority}`} size="small" variant="outlined" sx={{ fontWeight: 600 }} />
                          )}
                        </Box>
                        <Typography variant="h6" fontWeight={800} sx={{ color: tokens.colors.secondary[900] }}>
                          {proj.projectName}
                        </Typography>
                      </Box>

                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<ArrowForwardIcon />}
                        onClick={() => navigate(`/projects/${proj.id}`)}
                        sx={{ borderRadius: tokens.borderRadius.md, fontWeight: 700, textTransform: "none" }}
                      >
                        View Project Details
                      </Button>
                    </Box>

                    {proj.description && (
                      <Typography variant="body2" sx={{ color: "#64748b", mb: 2 }}>
                        {proj.description}
                      </Typography>
                    )}

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2.5 }}>
                      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.75 }}>
                        <Typography variant="caption" fontWeight={700} sx={{ color: "#475569" }}>
                          Execution Progress
                        </Typography>
                        <Typography variant="caption" fontWeight={800} sx={{ color: tokens.colors.primary[600] }}>
                          {proj.progressPercentage || 0}%
                        </Typography>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={proj.progressPercentage || 0}
                        sx={{
                          height: 8,
                          borderRadius: 4,
                          bgcolor: "#e2e8f0",
                          "& .MuiLinearProgress-bar": {
                            bgcolor: (proj.progressPercentage || 0) >= 100 ? "#10b981" : tokens.colors.primary[600],
                            borderRadius: 4,
                          },
                        }}
                      />
                    </Box>

                    {/* Detailed Metadata Grid */}
                    <Box
                      sx={{
                        display: "grid",
                        gridTemplateColumns: { xs: "1fr 1fr", sm: "1fr 1fr 1fr 1fr" },
                        gap: 2,
                        p: 2,
                        bgcolor: "#f8fafc",
                        borderRadius: tokens.borderRadius.md,
                      }}
                    >
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                          Start Date
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {proj.startDate || "Active"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                          Target Delivery
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {proj.expectedEndDate || proj.dueDate || "Ongoing"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                          Budget / Value
                        </Typography>
                        <Typography variant="body2" fontWeight={700}>
                          {proj.budget ? `₹${proj.budget.toLocaleString("en-IN")}` : "Milestone-based"}
                        </Typography>
                      </Box>
                      <Box>
                        <Typography variant="caption" sx={{ color: "#64748b", display: "block" }}>
                          Documentation
                        </Typography>
                        <Typography variant="body2" fontWeight={700} sx={{ color: tokens.colors.primary[600] }}>
                          {proj.documentationUrl ? "Attached" : "In Repository"}
                        </Typography>
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      )}

      {/* TAB 2: Security & Password */}
      {tabValue === 2 && (
        <Box sx={{ maxWidth: 640 }}>
          <Card sx={{ borderRadius: tokens.borderRadius.lg, border: `1px solid ${tokens.colors.secondary[200]}` }}>
            <CardContent sx={{ p: { xs: 2.5, md: 4 } }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
                <ShieldOutlinedIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Account Password & Authentication Security
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Ensure your portal credentials remain protected. Use at least 6 characters with a combination of numbers and letters.
              </Typography>
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
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />

                  <TextField
                    label="New Password"
                    type="password"
                    fullWidth
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                  />

                  <TextField
                    label="Confirm New Password"
                    type="password"
                    fullWidth
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                  />

                  <Button
                    type="submit"
                    variant="contained"
                    startIcon={<LockOutlinedIcon />}
                    disabled={savingPassword}
                    sx={{ borderRadius: tokens.borderRadius.md, fontWeight: 700, px: 3, py: 1.25, width: "fit-content" }}
                  >
                    {savingPassword ? "Updating Password..." : "Update Password"}
                  </Button>
                </Box>
              </form>
            </CardContent>
          </Card>
        </Box>
      )}
    </Box>
  );
}
