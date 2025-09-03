import { useEffect, useState } from 'react';
import './App.css';
import MainContainer from './components/MainContainer';
import Button from './components/Button';
import AudioPlayer from './components/AudioPlayer';
import { login, setPassword, completeResetPassword, changePassword, resetPassword, getNextTraining, getTrainingById, updateTrainingProgress } from './api/auth';

// Use the environment variable for TRAINING_BASEURL
const TRAINING_BASEURL = import.meta.env.VITE_API_TARGET + import.meta.env.VITE_TRAINING_BASE_URL;

function App() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [oldPassword, setOldPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [token, setToken] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [firstName, setFirstName] = useState(''); //first name from log in response
  const [greeting, setGreeting] = useState('')//State for time-based greeting
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [isPasswordValid, setIsPasswordValid] = useState(false);

  // Training states
  const [currentStep, setCurrentStep] = useState(0); // 0=start, 1-4 = Audio steps, 5 = done
  const [audioData, setAudioData] = useState({ audio1: null, audio2: null, audio3: null, audio4: null }); // Fixed object syntax
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });
  //Store module IDs
  const [moduleIds, setModuleIds] = useState({
    1: 1, // Hardcoded for now, adjust based on API
    2: 2,
    3: 3,
    4: 4
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tk = params.get('token');
    if (tk) {
      setResetToken(tk);
      setMode('completeReset');
    }
    console.log('Initial mode from URL:', mode); // Debug initial mode

    //load persisted data from local storage on mount for persistence across refresshes & sessions
    const savedToken = localStorage.getItem('britamToken');
    const savedFirstName = localStorage.getItem('britamFirstName');
    const savedMode = localStorage.getItem('britamMode');
    if (savedToken) {
      setToken(savedToken);
      setFirstName(savedFirstName || '');
      setMode(savedMode || 'dashboard'); //default to dash if mode not saved
    }

    //set Time-based greeting
    const hour = new Date().getHours();
    let newGreeting = 'Morning';
    if (hour >= 12 && hour < 18) newGreeting = 'Afternoon';
    else if (hour >= 18) newGreeting = 'Evening';
    setGreeting(newGreeting);
  }, []);

  useEffect(() => {
    console.log('Mode changed to:', mode);
    if (mode === 'training' && token) {
      fetchTrainingData();
    }
  }, [mode, token]);

  // Load data on mount
  useEffect(() => {
    if (mode === 'training') {
      const savedProgress = JSON.parse(sessionStorage.getItem('britamTrainingProgress')) || {};
      const savedAudioData = JSON.parse(sessionStorage.getItem('britamTrainingAudioData')) || {};
      const savedModuleIds = JSON.parse(sessionStorage.getItem('britamModuleIds')) || {};
      if (savedProgress.currentStep) setCurrentStep(savedProgress.currentStep);
      if (savedProgress.audioCompleted) setAudioCompleted(savedProgress.audioCompleted);
      setAudioData(savedAudioData);
      setModuleIds(savedModuleIds);
    }
  }, [mode]);

  // Save progress whenever things change
  useEffect(() => {
    if (mode === 'training') {
      sessionStorage.setItem('britamTrainingProgress', JSON.stringify({ currentStep, audioCompleted }));
      sessionStorage.setItem('britamTrainingAudioData', JSON.stringify(audioData));
      sessionStorage.setItem('britamModuleIds', JSON.stringify(moduleIds));
    }
  }, [currentStep, audioCompleted, audioData, moduleIds]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  // Email validation
  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsEmailValid(emailRegex.test(email));
  }, [email]);

  // Password validation (basic: non-empty)
  useEffect(() => {
    setIsPasswordValid(password.length > 0);
  }, [password]);


  const handleLogin = async () => {
    clearMessages();
    if (!email || !password) return setError('Please enter email and password');
    try {
      const data = await login(email, password);
      if (data.status === 'Success') {
        setToken(data.token);

        //Extract first name and persist to localStorage
        const fname = data.name.split(' ')[0];
        setFirstName(fname);
        localStorage.setItem('britamToken', data.token);
        localStorage.setItem('britamFirstName', fname);
        setMode('dashboard'); //set to dashboard from training
      } else if (data.status === 'PasswordNotSet') {
        setMode('setPassword');
      } else {
        setError(data.message || 'Login failed');
      }
    } catch (e) {
      setError('Network error' + e.message);
    }
  };

  const handleSetPassword = async () => {
    clearMessages();
    if (!password || !confirmPassword) return setError('Please enter password and confirmation');
    if (password !== confirmPassword) return setError('Passwords do not match');
    try {
      const data = await setPassword(email, password);
      if (data.status === 'Success') {
        setToken(data.token);

        //Persist token
        localStorage.setItem('britamToken', data.token);
        setMode('dashboard'); //removed training
      } else {
        setError(data.message || 'Failed to set password');
      }
    } catch (e) {
      setError('Network error' + e.message);
    }
  };

  const handleSignup = async () => {
    clearMessages();
    if (!email || !password || !confirmPassword) return setError('Please fill all fields');
    if (password !== confirmPassword) return setError('Passwords do not match');
    try {
      const data = await setPassword(email, password);
      if (data.status === 'Success') {
        setSuccess('Account created successfully. Please login.');
        setTimeout(() => setMode('login'), 3000);
      } else {
        setError(data.message || 'Failed to sign up');
      }
    } catch (e) {
      setError('Network error:' + e.message);
    }
  };

  const handleResetPassword = async () => {
    clearMessages();
    if (!email) return setError('Please enter email');
    try {
      const data = await resetPassword(email);
      console.log('Reset Password API response:', data); // Debug API response
      if (data.status === 'Success' || data.ok || data.message === 'Password reset token generated successfully. Please check your email.') {
        setSuccess('Reset link sent to your email');
        setMode('passwordReset');
      } else {
        setError(data.message || 'Failed to send reset link');
      }
    } catch (e) {
      setError('Network error' + e.message);
    }
  };

  const handleCompleteReset = async () => {
    clearMessages();
    try {
      if (!password || !confirmPassword) return setError('Please enter password and confirmation');
      if (password !== confirmPassword) return setError('Passwords do not match');

      const data = await completeResetPassword(resetToken, password, email);
      if (data.status === 'Success') {
        setSuccess('Password reset successfully. Please login');
        setTimeout(() => setMode('login'), 3000);
      } else {
        setError(data.message || 'Failed to reset password');
      }
    } catch (e) {
      setError('Network error:' + e.message);
    }
  };

  const handleChangePassword = async () => {
    clearMessages();
    if (!oldPassword || !password || !confirmPassword) return setError('Please fill all fields');
    if (password !== confirmPassword) return setError('New passwords do not match');
    try {
      const data = await changePassword(oldPassword, password, token);
      if (data.status === 'Success') {
        setSuccess('Password changed successfully');
        setOldPassword('');
        setPassword('');
        setConfirmPassword('');
        setTimeout(() => setMode('dashboard'), 2000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (e) {
      setError('Network error' + e.message);
    }
  };

  //Logout handler
  const handleLogout = () => {
    localStorage.clear();
    setToken('');
    setFirstName('');
    setMode('login');
  };

  const fetchTrainingData = async () => {
    try {
      for (let step = 1; step <= 4; step++) {
        const moduleId = moduleIds[step]; // Use predefined module IDs
        const data = await getTrainingById(token, moduleId);
        console.log('API response for step', step, ':', data); // Debug API response with step
        if (data.filePath && data.moduleId) {
          const fullAudioUrl = `${TRAINING_BASEURL}${data.filePath}`; // Current: /api/Training/videos/Lesson1-IntroductiontoInsurance.mp3
          console.log('Constructed URL:', fullAudioUrl); // Debug constructed URL
          setAudioData(prev => ({ ...prev, [`audio${step}`]: fullAudioUrl }));
          setModuleIds(prev => ({ ...prev, [step]: data.moduleId }));
        } else {
          setError(`Failed to fetch training audio for step ${step}`);
        }
      }
    } catch (e) {
      setError('Network error:' + e.message);
    }
  };

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep((prev) => prev + 1); //set isPlaying to true to start the next audio
      setIsPlaying(true); //ensure next audio plays automatically
    } else {
      setCurrentStep(5);
    }
  };
  const handleReturn = () => {
    setMode('dashboard');
  };

  const handlePlayPause = (play) => setIsPlaying(play);
  const handleRestart = () => {
    setAudioCompleted((prev) => ({ ...prev, [currentStep]: false }));
    setIsPlaying(true); //triggers playback
  };

  const handleEnded = async () => {
    setAudioCompleted((prev) => ({ ...prev, [currentStep]: true }));
    setIsPlaying(false); //Stop playback after ending
    if (moduleIds[currentStep]) {
      try {
        await updateTrainingProgress(token, moduleIds[currentStep], 0); //placeholder for duration
      } catch (e) {
        setError('Failed to update progress:' + e.message);
      }
    }
  };

  const currentAudio = audioData[`audio${currentStep}`];

  return (
    <MainContainer>
      {mode === 'login' && (
        <div className="auth-card">
          <h1>Sign in</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(e.target.value)) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid email
              } else {
                e.target.style.borderColor = 'red'; // Red for invalid
              }
            }}
            placeholder="Email"
            aria-label="Email input"
            style={{ borderColor: isEmailValid ? '#0e40d7' : 'red' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value.length > 0) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid password
              } else {
                e.target.style.borderColor = 'red'; // Red for empty
              }
            }}
            placeholder="Password"
            aria-label="Password input"
            style={{ borderColor: isPasswordValid ? '#0e40d7' : 'red' }}
          />
          <div style={{ textAlign: 'right', marginBottom: '1rem' }}>
            <p
              style={{ cursor: 'pointer', textDecoration: 'underline', margin: '0', display: 'inline-block', color: '#0e40d7', fontSize: '0.9rem' }} // Britam blue
              onClick={() => setMode('signup')}
              aria-label="Sign up link"
            >
              Sign up
            </p>
          </div>
          <Button onClick={handleLogin} disabled={!email || !password} aria-label="Login button">
            Login
          </Button>
          <p
            style={{ cursor: 'pointer', textDecoration: 'underline', marginTop: '1rem' }}
            onClick={() => setMode('resetPassword')}
            aria-label="Forgot password link"
          >
            Forgot Password
          </p>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      )}
      {mode === 'signup' && (
        <div className="auth-card">
          <h1>Sign up</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(e.target.value)) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid email
              } else {
                e.target.style.borderColor = 'red'; // Red for invalid
              }
            }}
            placeholder="Email"
            aria-label="Email input for signup"
            style={{ borderColor: isEmailValid ? '#0e40d7' : 'red' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value.length > 0) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid password
              } else {
                e.target.style.borderColor = 'red'; // Red for empty
              }
            }}
            placeholder="Password"
            aria-label="Password input for signup"
            style={{ borderColor: isPasswordValid ? '#0e40d7' : 'red' }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (e.target.value.length > 0 && e.target.value === password) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid confirmation
              } else {
                e.target.style.borderColor = 'red'; // Red for mismatch
              }
            }}
            placeholder="Confirm Password"
            aria-label="Confirm password input for signup"
            style={{ borderColor: confirmPassword === password && confirmPassword.length > 0 ? '#0e40d7' : 'red' }}
          />
          <Button onClick={handleSignup} disabled={!email || !password || !confirmPassword} aria-label="Sign up button">
            Sign up
          </Button>
          <p
            style={{ cursor: 'pointer', textDecoration: 'underline', marginTop: '1rem' }}
            onClick={() => setMode('login')}
            aria-label="Back to login link"
          >
            Back to login
          </p>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      )}
      {mode === 'setPassword' && (
       <div className="auth-card">
          <h1>Set Password</h1>
          <p>For email: {email}</p>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value.length > 0) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid password
              } else {
                e.target.style.borderColor = 'red'; // Red for empty
              }
            }}
            placeholder="New password"
            aria-label="New password input"
            style={{ borderColor: isPasswordValid ? '#0e40d7' : 'red' }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (e.target.value.length > 0 && e.target.value === password) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid confirmation
              } else {
                e.target.style.borderColor = 'red'; // Red for mismatch
              }
            }}
            placeholder="Confirm password"
            aria-label="Confirm password input"
            style={{ borderColor: confirmPassword === password && confirmPassword.length > 0 ? '#0e40d7' : 'red' }}
          />
          <Button onClick={handleSetPassword} disabled={!password || !confirmPassword} aria-label="Set password button">
            Set Password
          </Button>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      )}
      {mode === 'resetPassword' && (
        <div className="auth-card">
          <h1>Reset Password</h1>
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(e.target.value)) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid email
              } else {
                e.target.style.borderColor = 'red'; // Red for invalid
              }
            }}
            placeholder="Email"
            aria-label="Email input for reset"
            style={{ borderColor: isEmailValid ? '#0e40d7' : 'red' }}
          />
          <Button onClick={handleResetPassword} disabled={!email} aria-label="Send reset link button">
            Send Reset Link
          </Button>
          <p
            style={{ cursor: 'pointer', textDecoration: 'underline', marginTop: '1rem' }}
            onClick={() => setMode('login')}
            aria-label="Back to login link"
          >
            Back to Login
          </p>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      )}
      {mode === 'passwordReset' && (
        <div className="auth-card">
          <h1>Password Reset</h1>
          <input
            type="text"
            value={resetToken}
            onChange={(e) => setResetToken(e.target.value)}
            placeholder="Token"
            aria-label="Token input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value.length > 0) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid password
              } else {
                e.target.style.borderColor = 'red'; // Red for empty
              }
            }}
            placeholder="New Password"
            aria-label="New password input"
            style={{ borderColor: isPasswordValid ? '#0e40d7' : 'red' }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (e.target.value.length > 0 && e.target.value === password) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid confirmation
              } else {
                e.target.style.borderColor = 'red'; // Red for mismatch
              }
            }}
            placeholder="Confirm Password"
            aria-label="Confirm password input"
            style={{ borderColor: confirmPassword === password && confirmPassword.length > 0 ? '#0e40d7' : 'red' }}
          />
          <input
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
              if (emailRegex.test(e.target.value)) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid email
              } else {
                e.target.style.borderColor = 'red'; // Red for invalid
              }
            }}
            placeholder="Email"
            aria-label="Email input"
            style={{ borderColor: isEmailValid ? '#0e40d7' : 'red' }}
          />
          <Button
            onClick={handleCompleteReset}
            disabled={!resetToken || !password || !confirmPassword || !email}
            aria-label="Complete reset button"
          >
            Complete Reset
          </Button>
          <p
            style={{ cursor: 'pointer', textDecoration: 'underline', marginTop: '1rem' }}
            onClick={() => setMode('login')}
            aria-label="Back to login link"
          >
            Back to Login
          </p>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      )}
      {mode === 'completeReset' && (
        <div className="auth-card">
          <h1>Complete Reset</h1>
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value.length > 0) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid password
              } else {
                e.target.style.borderColor = 'red'; // Red for empty
              }
            }}
            placeholder="New Password"
            aria-label="New Password input for reset"
            style={{ borderColor: isPasswordValid ? '#0e40d7' : 'red' }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (e.target.value.length > 0 && e.target.value === password) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid confirmation
              } else {
                e.target.style.borderColor = 'red'; // Red for mismatch
              }
            }}
            placeholder="Confirm Password"
            aria-label="Confirm password input for reset"
            style={{ borderColor: confirmPassword === password && confirmPassword.length > 0 ? '#0e40d7' : 'red' }}
          />
          <Button onClick={handleCompleteReset} disabled={!password || !confirmPassword} aria-label="Reset password button">
            Reset Password
          </Button>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      )}
      {mode === 'changePassword' && (
        <div className="auth-card">
          <h1>Change password</h1>
          <input
            type="password"
            value={oldPassword}
            onChange={(e) => {
              setOldPassword(e.target.value);
              if (e.target.value.length > 0) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid password
              } else {
                e.target.style.borderColor = 'red'; // Red for empty
              }
            }}
            placeholder="Old Password"
            aria-label="Old password input"
            style={{ borderColor: oldPassword.length > 0 ? '#0e40d7' : 'red' }}
          />
          <input
            type="password"
            value={password}
            onChange={(e) => {
              setPassword(e.target.value);
              if (e.target.value.length > 0) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid password
              } else {
                e.target.style.borderColor = 'red'; // Red for empty
              }
            }}
            placeholder="New Password"
            aria-label="New password input"
            style={{ borderColor: isPasswordValid ? '#0e40d7' : 'red' }}
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (e.target.value.length > 0 && e.target.value === password) {
                e.target.style.borderColor = '#0e40d7'; // Blue for valid confirmation
              } else {
                e.target.style.borderColor = 'red'; // Red for mismatch
              }
            }}
            placeholder="Confirm new password"
            aria-label="Confirm new password input"
            style={{ borderColor: confirmPassword === password && confirmPassword.length > 0 ? '#0e40d7' : 'red' }}
          />
          <Button
            onClick={handleChangePassword}
            disabled={!oldPassword || !password || !confirmPassword}
            aria-label="Change password button"
          >
            Change Password
          </Button>
          <p
            style={{ cursor: 'pointer', textDecoration: 'underline', marginTop: '1rem' }}
            onClick={() => setMode('dashboard')}
            aria-label="Back to Dashboard"
          >
            Proceed to Dashboard
          </p>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      )}
      {mode === 'dashboard' && ( // dash mode with greeting cards
        <div className="dashboard-container">
          <h1 className="greeting">Good {greeting}, {firstName}</h1>
          <div className="dashboard-grid">
            <div className="dashboard-card" onClick={() => setMode('training')}>
              <h2>Training Audios</h2>
            </div>
            <div className="dashboard-card" onClick={() => setMode('changePassword')}>
              <h2>Account Management</h2>
            </div>
            <div className="dashboard-card" onClick={handleLogout}>
              <h2>Logout</h2>
            </div>
            <div className="dashboard-card" onClick={() => setMode('login')}>
              <h2>Back to Dashboard</h2>
            </div>
          </div>
        </div>
      )}
      {mode === 'training' && (
        <div className="training-container">
          <h1>Britam Agent Training</h1>
          <p>Listen to the audio until it ends, then click Next</p>
          {currentStep === 0 && (
            <Button onClick={handleStart} aria-label="Start training">
              Start
            </Button>
          )}
          {currentStep > 0 && currentStep < 5 && currentAudio && (
            <div>
              <p>Audio {currentStep} of 4</p>
              <AudioPlayer
                src={currentAudio}
                onEnded={handleEnded}
                onRestart={handleRestart}
                isPlaying={isPlaying}
                onPlayPause={handlePlayPause}
                aria-label={`Audio ${currentStep} player`}
              />
              <button
                onClick={handleNext}
                disabled={!audioCompleted[currentStep]}
                aria-label={`Next audio, disabled until audio ${currentStep} completes`}
              >
                Next
              </button>
            </div>
          )}
          {currentStep === 5 && (
            <div>
              <p>All audios complete!</p>
              <Button onClick={handleReturn} aria-label="Return to main page">
                Return
              </Button>
            </div>
          )}
        </div>
      )}
      
    </MainContainer>
  );
}

export default App;