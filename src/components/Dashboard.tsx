import { useState, useEffect } from "react";
import { Box, Button, Card, CardContent, CircularProgress, FormControl, Grid, TextField, Typography } from "@mui/material";
import { britamBlue, successColor } from "../data/colors";
import { useNavigate } from "react-router-dom";
import { changePassword, getNextTraining, updateTrainingProgress } from "../api/auth";
import AudioPlayer from "./AudioPlayer";

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
  const [trainingData, setTrainingData] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState({});
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

  const fetchTrainingData = async (step = 1) => {
    try {
      setLoading(true);
      const data = await getNextTraining(token, step);
      setTrainingData(data);
      setAudioCompleted((prev) => ({ ...prev, [step]: data.isComplete || false }));
      setLoading(false);
    } catch (e) {
      setError("Failed to fetch training data: " + e.message);
      setLoading(false);
    }
  };

  const handlePlayPause = (play) => setIsPlaying(play);

  const handleEnded = async () => {
    setAudioCompleted((prev) => ({ ...prev, [currentStep]: true }));
    setIsPlaying(false);
    await updateTrainingProgress(token, trainingData.moduleId, trainingData.duration * 60); // Convert duration to seconds
  };

  const handleNext = async () => {
    if (currentStep < 4 && audioCompleted[currentStep]) {
      setCurrentStep((prev) => prev + 1);
      await fetchTrainingData(currentStep + 1);
    } else if (currentStep === 4 && audioCompleted[currentStep]) {
      setCurrentStep(5); // Mark as complete
      setTrainingData(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      fetchTrainingData(currentStep - 1);
    }
  };

  const handleRestart = () => {
    setAudioCompleted((prev) => ({ ...prev, [currentStep]: false }));
    setIsPlaying(true);
  };

  useEffect(() => {
    if (!token) navigate("/login");
    if (activeTab === "Training materials" && !trainingData) {
      fetchTrainingData();
    }
  }, [token, navigate, activeTab, trainingData]);

  const renderContent = () => {
    switch (activeTab) {
      case "Training materials":
        return trainingData ? (
          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2 }}>
            <Typography sx={{ textAlign: "center" }}>
              Audio {currentStep} of 4: {trainingData.title}
            </Typography>
            <AudioPlayer
              src={`https://brm-partners.britam.com${trainingData.filePath}`}
              onEnded={handleEnded}
              onRestart={handleRestart}
              isPlaying={isPlaying}
              onPlayPause={handlePlayPause}
              aria-label={`Audio ${currentStep} player`}
            />
            <Box sx={{ display: "flex", gap: 2 }}>
              <Button
                variant="outlined"
                sx={{ borderRadius: 50, textTransform: "capitalize" }}
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: britamBlue, borderRadius: 50, textTransform: "capitalize" }}
                onClick={handleNext}
                disabled={!audioCompleted[currentStep] && currentStep < 5}
              >
                {currentStep === 4 && audioCompleted[4] ? "Finish" : "Next"}
              </Button>
            </Box>
            {loading && <CircularProgress />}
            {error && <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>{error}</Typography>}
          </Box>
        ) : (
          <Typography sx={{ textAlign: "center" }}>
            {loading ? "Loading training materials..." : "Content will be fetched from the training API."}
          </Typography>
        );
      case "Test":
        return <Typography sx={{ textAlign: "center" }}>Take your training test here.</Typography>;
      case "Account management":
        return (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, maxWidth: "400px", margin: "0 auto" }}>
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
            {error && <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>{error}</Typography>}
            {success && <Typography color={successColor} sx={{ mt: 2, textAlign: "center" }}>{success}</Typography>}
          </Box>
        );
      default:
        return null;
    }
  };

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
      <Grid container spacing={4} direction="column" alignItems="center">
        <Grid item xs={12}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2, width: "100%", maxWidth: "600px" }}>
            <CardContent>
              <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, color: britamBlue, textAlign: "center" }}>
                {`${getGreeting()}, ${firstName}!`}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2, width: "100%", maxWidth: "600px" }}>
            <CardContent>
              <Box sx={{ mb: 2, display: "flex", justifyContent: "center", gap: 2 }}>
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
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12}>
          <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2, width: "100%", maxWidth: "600px" }}>
            <CardContent sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>{renderContent()}</CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;