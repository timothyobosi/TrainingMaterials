import { useEffect, useState } from 'react';
import './App.css';
import MainContainer from './components/MainContainer';
import Button from './components/Button';
import AudioPlayer from './components/AudioPlayer';
import { mockAudioData } from './utils/mockData';
import { login, setPassword, completeResetPassword, changePassword, resetPassword } from './api/auth';

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

  // Training states
  const [currentStep, setCurrentStep] = useState(0); // 0=start, 1-4 = Audio steps, 5 = done
  const [audioData, setAudioData] = useState(mockAudioData); // Fixed object syntax
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState({
    1: false,
    2: false,
    3: false,
    4: false,
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tk = params.get('token');
    if (tk) {
      setResetToken(tk);
      setMode('completeReset');
    }
    console.log('Initial mode from URL:', mode); // Debug initial mode
  }, []);

  // Load data on mount
  useEffect(() => {
    console.log('Mode changed to:', mode); // Debug mode changes
    if (mode === 'training') {
      const savedProgress = JSON.parse(sessionStorage.getItem('britamTrainingProgress')) || {};
      const savedAudioData = JSON.parse(sessionStorage.getItem('britamTrainingAudioData')) || {};
      if (savedProgress.currentStep) setCurrentStep(savedProgress.currentStep);
      if (savedProgress.audioCompleted) setAudioCompleted(savedProgress.audioCompleted);
      setAudioData(savedAudioData);
    }
  }, [mode]);

  // Save progress whenever things change
  useEffect(() => {
    if (mode === 'training') {
      sessionStorage.setItem('britamTrainingProgress', JSON.stringify({ currentStep, audioCompleted }));
      sessionStorage.setItem('britamTrainingAudioData', JSON.stringify(audioData));
    }
  }, [currentStep, audioCompleted, audioData, mode]);

  const clearMessages = () => {
    setError('');
    setSuccess('');
  };

  const handleLogin = async () => {
    clearMessages();
    if (!email || !password) return setError('Please enter email and password');
    try {
      const data = await login(email, password);
      if (data.status === 'Success') {
        setToken(data.token);
        setMode('training');
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
        setMode('training');
      } else {
        setError(data.message || 'Failed to set password');
      }
    } catch (e) {
      setError('Network error' + e.message);
    }
  };

  const handleSignup = async () =>{
    clearMessages();
    if (!email || !password || !confirmPassword) return setError('Please fill all fields');
    if (password !== confirmPassword) return setError('Passwords do not match');
    try{
      const data = await setPassword(email,password);
      if (data.status=== 'Success') {
        setSuccess('Account created successfully. Please login.');
        setTimeout(()=> setMode('login'),3000);
      }else{
        setError(data.message || 'Failed to sign up');
      }
      
    } catch(e){
      setError('Network error:'+e.message);
    }
  }

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
        setTimeout(() => setMode('training'), 2000);
      } else {
        setError(data.message || 'Failed to change password');
      }
    } catch (e) {
      setError('Network error' + e.message);
    }
  };

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
    else setCurrentStep(5);
  };
  const handleReturn = () => {
    sessionStorage.removeItem('britamTrainingProgress');
    sessionStorage.removeItem('britamTrainingAudioData');
    window.location.href = audioData.returnUrl || 'http://example.com';
  };

  const handlePlayPause = (play) => setIsPlaying(play);
  const handleRestart = () => {
    setAudioCompleted((prev) => ({ ...prev, [currentStep]: false }));
    setIsPlaying(true);
  };
  const handleEnded = () => {
    setAudioCompleted((prev) => ({ ...prev, [currentStep]: true }));
    setIsPlaying(false);
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            aria-label="Email input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            aria-label="Password input"
          />
          <div style={{textAlign:'right',marginBottom:'1rem'}}>
            <p 
            style={{cursor:'pointer',textDecoration:'underline', margin:'0', display:'inline-block',color:'rgba(255,255,255,0.5)',fontSize:'0.9rem'}}
            onClick={()=> setMode('signup')}
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
          onChange={(e) =>setEmail(e.target.value)}
          placeholder="Email"
          aria-label="Email input for signup"
          />
          <input type="password" 
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          aria-label="Password input for signup"
          />
          <input type="password" 
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          aria-label="Confirm password inpu for signup"
          />
          <Button onClick={handleSignup} disabled={!email || !password ||!confirmPassword} aria-label ="Sign up button">
            Sign up
          </Button>
          <p 
            style={{cursor:'pointer', textDecoration:'underline', marginTop:'1rem'}}
            onClick={() =>setMode('login')}
            aria-label="Back to login link"
          >
            Back to login
          </p>
          {error && <p className="error">{error} </p> }
          {success && <p className="success">{success} </p> }
        </div>
      )}
      {mode === 'setPassword' && (
        <div className="auth-card">
          <h1>Set Password</h1>
          <p>For email: {email}</p>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New password"
            aria-label="New password input"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm password"
            aria-label="Confirm password input"
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
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            aria-label="Email input for reset"
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
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            aria-label="New password input"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            aria-label="Confirm password input"
          />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            aria-label="Email input"
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
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            aria-label="New Password input for reset"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm Password"
            aria-label="Confirm password input for reset"
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
            onChange={(e) => setOldPassword(e.target.value)}
            placeholder="Old Password"
            aria-label="Old password input"
          />
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="New Password"
            aria-label="New password input"
          />
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            aria-label="Confirm new password input"
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
            onClick={() => setMode('training')}
            aria-label="Back to training link"
          >
            Proceed to Training
          </p>
          {error && <p className="error">{error}</p>}
          {success && <p className="success">{success}</p>}
        </div>
      )}
      {mode === 'training' && (
        <>
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
        </>
      )}
    </MainContainer>
  );
}

export default App;