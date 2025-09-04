import { useState, useEffect } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
} from "@mui/material";
import { VisibilityOffOutlined, VisibilityOutlined } from "@mui/icons-material";
import { britamBlue } from "../data/colors";
import { useNavigate } from "react-router";
import {
  login,
  setPassword,
  resetPassword,
  completeResetPassword,
} from "../api/auth";
import LoginLayout from "./LoginLayout";
import LoginFooter from "./LoginFooter";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetToken, setResetToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [isEmailValid, setIsEmailValid] = useState(true);
  const [isPasswordValid, setIsPasswordValid] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tk = params.get("token");
    if (tk) {
      setResetToken(tk);
      handleModeChange("completeReset");
    }
  }, []);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  useEffect(() => {
    setIsPasswordValid(password.length > 0);
  }, [password]);

  const clearMessages = () => {
    setError("");
    setSuccess("");
  };

  const handleLogin = async () => {
    clearMessages();
    if (!isEmailValid) return setError("Please enter a valid email address");
    if (!isPasswordValid) return setError("Please enter a password");
    setLoading(true);
    try {
      const data = await login(email, password);
      if (data.status === "Success") {
        localStorage.setItem("britamToken", data.token);
        const fname = data.name.split(" ")[0];
        localStorage.setItem("britamFirstName", fname);
        navigate("/dashboard");
      } else if (data.status === "PasswordNotSet") {
        handleModeChange("setPassword");
      } else {
        setError(data.message || "Login failed");
      }
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSetPassword = async () => {
    clearMessages();
    if (!isPasswordValid) return setError("Please enter a password");
    setLoading(true);
    try {
      const data = await setPassword(email, password);
      if (data.status === "Success") {
        localStorage.setItem("britamToken", data.token);
        navigate("/dashboard");
      } else {
        setError(data.message || "Failed to set password");
      }
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    clearMessages();
    if (!isEmailValid) return setError("Please enter a valid email address");
    setLoading(true);
    try {
      const data = await resetPassword(email);
      if (data.status === "Success" || data.message === "Password reset token generated successfully. Please check your email.") {
        setSuccess("Reset link sent to your email");
      } else {
        setError(data.message || "Failed to send reset link");
      }
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteReset = async () => {
    clearMessages();
    if (!isEmailValid) return setError("Please enter a valid email address");
    if (!isPasswordValid) return setError("Please enter a password");
    setLoading(true);
    try {
      const data = await completeResetPassword(resetToken, password, email);
      if (data.status === "Success") {
        setSuccess("Password reset successfully. Redirecting to login...");
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch (e) {
      setError("Network error: " + e.message);
    } finally {
      setLoading(false);
    }
  };

  const handleModeChange = (mode: string) => {
    switch (mode) {
      case "resetPassword":
        handleResetPassword();
        break;
      case "completeReset":
        handleCompleteReset();
        break;
      case "setPassword":
        handleSetPassword();
        break;
      default:
        handleLogin();
    }
  };

  return (
    <LoginLayout
      component={
        <Box mt={8} mr={18} className="flex flex-col login-form">
          <img
            src="/src/assets/images/Britam logo.png"
            width={200}
            alt="Britam logo"
            className="mb-16 self-center"
          />
          <form className="flex flex-col gap-4">
            <FormControl>
              <Typography sx={{ fontWeight: "bold", mb: "4px" }}>Email</Typography>
              <TextField
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                error={!isEmailValid && email.length > 0}
                helperText={!isEmailValid && email.length > 0 ? "Invalid email format" : ""}
                slotProps={{
                  input: {
                    style: {
                      borderRadius: 10,
                    },
                  },
                }}
              />
            </FormControl>
            <FormControl>
              <Box sx={{ display: "flex", justifyContent: "space-between", mb: "4px" }}>
                <Typography sx={{ fontWeight: "bold" }}>Password</Typography>
                <a
                  style={{ color: britamBlue, fontSize: "12px", fontWeight: "bold", cursor: "pointer" }}
                  onClick={() => handleModeChange("resetPassword")}
                >
                  Forgot password?
                </a>
              </Box>
              <TextField
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                error={!isPasswordValid && password.length > 0}
                helperText={!isPasswordValid && password.length > 0 ? "Password is required" : ""}
                slotProps={{
                  input: {
                    style: {
                      borderRadius: 10,
                      letterSpacing: 1,
                    },
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                          size="large"
                        >
                          {showPassword ? (
                            <VisibilityOutlined sx={{ fill: britamBlue }} />
                          ) : (
                            <VisibilityOffOutlined sx={{ fill: britamBlue }} />
                          )}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </FormControl>
            <Button
              variant="contained"
              sx={{
                mt: "1em",
                backgroundColor: britamBlue,
                textTransform: "capitalize",
                fontWeight: "bold",
                borderRadius: 50,
                padding: "10px 0",
                "&:disabled": {
                  backgroundColor: "#cccccc",
                  cursor: "not-allowed",
                },
              }}
              onClick={handleLogin}
              disabled={loading || !isEmailValid || !isPasswordValid}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Continue"}
            </Button>
          </form>
          <a
            style={{ color: britamBlue, fontWeight: "bold", mt: "16px", cursor: "pointer" }}
            onClick={() => navigate("/signup")}
          >
            Need help?
          </a>
          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          {success && <Typography color="success" sx={{ mt: 2 }}>{success}</Typography>}
        </Box>
      }
      footer={<LoginFooter />}
    />
  );
};

export default Login;