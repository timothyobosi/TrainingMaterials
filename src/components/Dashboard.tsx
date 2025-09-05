import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  FormControl,
  Grid,
  TextField,
  Typography,
} from "@mui/material";
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
  const [trainingData, setTrainingData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState<Record<string, boolean>>({});
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
    } catch (e: any) {
      setError("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      const data = await getNextTraining(token);
      setTrainingData(data);
      setAudioCompleted((prev) => ({ ...prev, [data.moduleId]: data.isComplete || false }));
      setCurrentStep((prev) => (data.isComplete && prev < 4 ? prev + 1 : prev));
      setLoading(false);
    } catch (e: any) {
      setError("Failed to fetch training data: " + e.message);
      setLoading(false);
    }
  };

  const handlePlayPause = (play: boolean) => setIsPlaying(play);

  const handleEnded = async () => {
    setAudioCompleted((prev) => ({ ...prev, [trainingData.moduleId]: true }));
    setIsPlaying(false);
    try {
      await updateTrainingProgress(token, trainingData.moduleId, trainingData.duration * 60);
    } catch (e: any) {
      console.warn("Progress update failed due to CORS: ", e.message);
    }
  };

  const handleNext = async () => {
    if (currentStep < 4 && audioCompleted[trainingData.moduleId]) {
      await fetchTrainingData();
    } else if (currentStep === 4 && audioCompleted[trainingData.moduleId]) {
      setCurrentStep(5);
      setTrainingData(null);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
      fetchTrainingData();
    }
  };

  const handleRestart = () => {
    setAudioCompleted((prev) => ({ ...prev, [trainingData.moduleId]: false }));
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
                disabled={!audioCompleted[trainingData.moduleId] && currentStep < 5}
              >
                {currentStep === 4 && audioCompleted[trainingData.moduleId] ? "Finish" : "Next"}
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
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", width: "100%", minHeight: "100vh", backgroundColor: "#f5f5f5" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 200,
          backgroundColor: "white",
          borderRight: "1px solid #ddd",
          p: 2,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
        }}
      >
        <img src="/src/assets/images/Britam logo.png" alt="Britam logo" width={120} style={{ marginBottom: 20 }} />
        <Button
          variant={activeTab === "Training materials" ? "contained" : "outlined"}
          sx={{ mb: 2, borderRadius: 50, textTransform: "capitalize", width: "100%" }}
          onClick={() => setActiveTab("Training materials")}
        >
          Training materials
        </Button>
        <Button
          variant={activeTab === "Test" ? "contained" : "outlined"}
          sx={{ mb: 2, borderRadius: 50, textTransform: "capitalize", width: "100%" }}
          onClick={() => setActiveTab("Test")}
        >
          Test
        </Button>
        <Button
          variant="outlined"
          sx={{ borderRadius: 50, textTransform: "capitalize", width: "100%" }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, px:2, py: 4 }}>
        <Box sx={{maxWidth:"900px", mx:"auto"}}>
        <Grid container spacing={4} direction="column" >
          <Grid item xs={12}>
            <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2, width: "100%" }}>
              <CardContent>
                <Typography variant="h5" sx={{ fontWeight: "bold", mb: 2, color: britamBlue, textAlign: "left" }}>
                  {`${getGreeting()}, ${firstName}!`}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12}>
            <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2, width: "100%", maxWidth: "600px" }}>
              <CardContent sx={{ display: "flex", justifyContent: "center", alignItems: "center" }}>
                {renderContent()}
              </CardContent>
            </Card>
          </Grid>
        </Grid>
        </Box>
      </Box>
    </Box>
  );
};

export default Dashboard;
