import { useEffect, useState } from 'react'
import './App.css'
import MainContainer from './components/MainContainer'
import Button from './components/Button'
import AudioPlayer from './components/AudioPlayer'
import { mockAudioData } from './utils/mockData'

const baseURL = 'https://brm-partners.britam.com/api/Agents'

function App() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setconfirmPassowrd] = useState('')
  const [oldPassword, setOldPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [token, setToken] = useState('')
  const [resetToken, setResetToken] = useState('')

  //training states
  const [currentStep, setCurrentStep] = useState(0) //0=start , 1-4 = Audio steps, 5 =done
  const [audioData, setAudioData] = useState({ mockAudioData })
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState({
    1: false,
    2: false,
    3: false,
    4: false
  })

  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const tk = params.get('token')
    if (tk) {
      setResetToken(tk)
      setMode('completedRest')
    }
  }, [])


  //load data on mount
  useEffect(() => {
    //load progress from sessionStorage on mount
    if (mode === 'training') {
      const savedProgress = JSON.parse(sessionStorage.getItem('britamTrainingProgress')) || {};
      const savedAudioData = JSON.parse(sessionStorage.getItem('britamTrainingAudioData')) || {};

      //Use saved progress or default
      if (savedProgress.currentStep) setCurrentStep(savedProgress.currentStep);
      if (savedProgress.audioCompleted) setAudioCompleted(savedProgress.audioCompleted)
      setAudioData(savedAudioData);
    }
  }, [mode])

  //save progress whenever things change
  useEffect(() => {
    if (mode === 'training') {
      sessionStorage.setItem('britamTrainingProgress', JSON.stringify({ currentStep, audioCompleted }))
      sessionStorage.setItem('britamTrainingAudioData', JSON.stringify(audioData))
    }
  }, [currentStep, audioCompleted, audioData, mode])

  const clearMessages = () => {
    setError('')
    setSuccess('')
  }


  const handleLogin = async () => {
    clearMessages()
    if (!email || !password) return setError('Please enter email and password')
    try {
      const res = await fetch(`${baseURL}/login`, {
        method: 'POST',
        headers: { 'content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const data = await res.json()
      if (res.ok && data.status === 'Success') {
        setToken(data.token)
        setMode('training')
      } else if (data.status === 'PasswordNotSet') {
        setMode('setPassword')
      } else {
        setError(data.message || 'Login failed')
      }
    } catch (e) {
      setError('Network error' + e.message)

    }

  }


  const handleSetPassword = async () => {
    clearMessages()
    if (!password || !confirmPassword) return setError('Please enter password and confirmation')
    if (password !== confirmPassword) return setError('Passwords do not match')
    try {
      const res = await fetch(`${baseURL}/set-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })
      const data = await res.json()
      if (res.ok && data.status === 'Success'){
        setToken(data.token)
        setMode('training')
      }else{
        setError(data.message || 'Failed to set password')
      }

    } catch (e) {
      setError('Network error' + e.message)
    }
  }


  const handleResetPassword = async () => {
    clearMessages()
    if (!email) return setError('Please enter email')
    try {
      const res = await fetch(`${baseURL}/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (res.ok) {
        setSuccess('Reset link sent to your email')
        setTimeout(() => setMode('login'), 3000)
      } else {
        setError(data.message || 'Failed to send reset link')
      }
    } catch (e) {
      setError('Network error' + e.message)
    }
  }


  const handleChangePassword = async () => {
    clearMessages()
    if(!oldPassword || password || !confirmPassword) return setError('Please fill all fields')
    if(password !== confirmPassword) return setError('New passwords do not match')
      try{
    const res = await fetch(`${baseURL}/change-password`,{
      method:'POST',
      headers:{
        'Content-Type' : 'application/json',
        'Authorization' : `Bearer ${token}`
      },
      body: JSON.stringify({oldPassword, newPassword:password})
    })
    const data =  await res.json()
    if(res.ok){
      setSuccess('Password changed successfully')
      setOldPassword('')
      setPassword('')
      setconfirmPassowrd('')
      setTimeout(() => setMode('training'), 2000)
    }else{
      setError(data.message || 'Failed to change password')
    }
    }catch(e){
      setError('Network error' +e.message)
    }
  }

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
    else setCurrentStep(5)
  }
  const handleReturn = () => {
    sessionStorage.removeItem('britamTrainingProgress');
    sessionStorage.removeItem('britamTrainingAudioData');
    window.location.href = audioData.returnUrl || 'http://example.com'; //Use parsed returnUrl or fallback   //Temporary Placeholder
  }

  const handlePlayPause = (play) => setIsPlaying(play);

  const handleRestart = () => {
    setAudioCompleted((prev) => ({ ...prev, [currentStep]: false }));
    setIsPlaying(true);
  }

  const handleEnded = () => {
    setAudioCompleted(prev => ({ ...prev, [currentStep]: true }))
    setIsPlaying(false)
  }

  const currentAudio = audioData[`audio${currentStep}`];

  return (
    <MainContainer>
      <h1>Britam Agent Training</h1>
      <p>Listen to the audio until it ends, then click Next</p>
      {currentStep === 0 && (
        <Button onClick={handleStart} aria-label="Start training">
          Start
        </Button>
      )
      }
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
          <p> All audios complete!</p>
          <Button onClick={handleReturn} aria-label="Return to main page">
            Return
          </Button>
        </div>
      )}
    </MainContainer>

  )
}

export default App
