import { useState, useEffect } from "react";
import { Box, Button, Card, CardContent, Grid, Typography } from "@mui/material";
import { britamBlue, successColor } from "../data/colors";
import { useNavigate } from "react-router-dom";
import { changePassword } from "../api/auth";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("Training materials");
  const [firstName, setFirstName] = useState(localStorage.getItem("britamFirstName") || "");
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const token = localStorage.getItem("britamToken") || "";

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 17) return "Good afternoon";
    return "Good evening";
  };

  const handleLogout = () => {
    localStorage.removeItem("britamToken");
    localStorage.removeItem("britamFirstName");
    navigate("/login");
  };

  const handleChangePassword = async () => {
    if (!newPassword || !confirmPassword || !oldPassword) {
      setError("All fields are required");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      const data = await changePassword(oldPassword, newPassword, token);
      if (data.status === "Success") {
        setSuccess("Password changed successfully");
        setOldPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setError(data.message || "Failed to change password");
      }
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case "Training materials":
        return (
          <Typography>
            Here you can access training materials. Content will be fetched from the training API.
          </Typography>
        );
      case "Test":
        return <Typography>Take your training test here.</Typography>;
      case "Account management":
        return (
          <Box>
            <FormControl>
              <Typography sx={{ fontWeight: "bold", mb: "4px", color: britamBlue }}>Old Password</Typography>
              <TextField
                type={showPassword ? "text" : "password"}
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                slotProps={{ input: { style: { borderRadius: 10 } } }}
              />
            </FormControl>
            <FormControl>
              <Typography sx={{ fontWeight: "bold", mb: "4px", color: britamBlue }}>New Password</Typography>
              <TextField
                type={showPassword ? "text" : "password"}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                slotProps={{ input: { style: { borderRadius: 10 } } }}
              />
            </FormControl>
            <FormControl>
              <Typography sx={{ fontWeight: "bold", mb: "4px", color: britamBlue }}>Confirm Password</Typography>
              <TextField
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                slotProps={{ input: { style: { borderRadius: 10 } } }}
              />
            </FormControl>
            <Button
              variant="contained"
              sx={{ mt: "1em", backgroundColor: britamBlue, borderRadius: 50, padding: "10px 0" }}
              onClick={handleChangePassword}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Change Password"}
            </Button>
            {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
            {success && <Typography color={successColor} sx={{ mt: 2 }}>{success}</Typography>}
          </Box>
        );
      default:
        return null;
    }
  };

  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  return (
    <Box
      sx={{
        width: "100%",
        minHeight: "100vh",
        backgroundColor: "#f5f5f5",
        p: 4,
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", mb: 4 }}>
        <img src="/src/assets/images/Britam logo.png" alt="Britam logo" width={100} />
      </Box>
      <Card sx={{ p: 4, borderRadius: 2, boxShadow: 2 }}>
        <CardContent>
          <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, color: britamBlue }}>
            {`${getGreeting()}, ${firstName}!`}
          </Typography>
          <Box sx={{ mb: 4 }}>
            <Button
              variant={activeTab === "Training materials" ? "contained" : "outlined"}
              sx={{ mr: 2, borderRadius: 50, textTransform: "capitalize" }}
              onClick={() => setActiveTab("Training materials")}
            >
              Training materials
            </Button>
            <Button
              variant={activeTab === "Test" ? "contained" : "outlined"}
              sx={{ mr: 2, borderRadius: 50, textTransform: "capitalize" }}
              onClick={() => setActiveTab("Test")}
            >
              Test
            </Button>
            <Button
              variant="outlined"
              sx={{ mr: 2, borderRadius: 50, textTransform: "capitalize" }}
              onClick={handleLogout}
            >
              Logout
            </Button>
          </Box>
          <Box>{renderContent()}</Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Dashboard;