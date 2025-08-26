import { useEffect, useState } from 'react'
import './App.css'
import MainContainer from './components/MainContainer'
import Button from './components/Button'
import AudioPlayer from './components/AudioPlayer'
import { mockAudioData } from './utils/mockData'

function App() {
  const [currentStep, setCurrentStep] = useState(0) //0=start , 1-4 = Audio steps, 5 =done
  const [audioData, setAudioData] = useState({
    audio1: null,
    audio2: null,
    audio3: null,
    audio4: null,
    returnUrl: null,
  })

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState({
    1: false,
    2: false,
    3: false,
    4: false
  })

  //load data on mount
  useEffect(() => {
    //load progress from sessionStorage on mount
    const savedProgress = JSON.parse(sessionStorage.getItem('britamTrainingProgress')) || {};
    const savedAudioData = JSON.parse(sessionStorage.getItem('britamTrainingAudioData')) || {};

    //Use saved progress or default
    if (savedProgress.currentStep) setCurrentStep(savedProgress.currentStep);
    if (savedProgress.audioCompleted) setAudioCompleted(savedProgress.audioCompleted)

    //if nothing saved, use Mockdata    
    //Use mock data with actual audio files
    const dataToUse = Object.keys(savedAudioData).length ? savedAudioData : mockAudioData
    setAudioData(dataToUse);
    sessionStorage.setItem('britamTrainingAudioData', JSON.stringify(dataToUse));
  }, [])

  //save progress whenever things change
  useEffect(() =>{
    sessionStorage.setItem('britamTrainingProgress',JSON.stringify({currentStep, audioCompleted}))
  },[currentStep,audioCompleted])


  const handleStart = () => {
    setIsPlaying(true);
    setCurrentStep(1);
  };

  const handleNext = () => {
    if (currentStep<4) setCurrentStep((prev) => prev + 1);
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

  const handleEnded = () =>{
    setAudioCompleted(prev =>({...prev, [currentStep]:true}))
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
