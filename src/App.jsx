import { useEffect, useState } from 'react'
import './App.css'
import { parseQuery } from './utils/parseQuery'
import MainContainer from './components/MainContainer'
import Button from './components/Button'
import AudioPlayer from './components/AudioPlayer'

function App() {
  const [currentStep, setCurrentStep] = useState(0) //0=start , 1-4 = Audio steps, 5 =done
  const [audioData, setAudioData] = useState({
    audio1: null,
    audio2: null,
    audio3: null,
    audio4: null,
    returnUrl: null
  })

  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState({1:false,2:false,3:false,4:false})

  useEffect(() => {
    const savedAudioData = JSON.parse(sessionStorage.getItem('britamTrainingAudioData')) || {};
    if (savedAudioData) setAudioData(savedAudioData);

    //parse query params on mount
    const queryData = parseQuery();
    setAudioData(queryData);
    sessionStorage.setItem('britamTrainingAudioData', JSON.stringify(queryData))

    //load progress from sessionStorage on mount
    const savedProgress = JSON.parse(sessionStorage.getItem('britamTrainingProgress')) || {};
    if (savedProgress.currentStep) setCurrentStep(savedProgress.currentStep);
    //save progress on change
    sessionStorage.setItem('britamTrainingProgress', JSON.stringify({ currentStep }))
  }, [currentStep])

  const handleStart = () => {
    setIsPlaying(true);
    setCurrentStep(1);
  };

  const handleNext = () => setCurrentStep((prev) => prev + 1);
  const handleReturn = () => {
    sessionStorage.removeItem('britamTrainingProgress');
    sessionStorage.removeItem('britamTrainingAudioData');
    window.location.href = audioData.returnUrl || 'http://example.com'; //Use parsed returnUrl or fallback   //Temporary Placeholder
  }

  const handlePlayPause = (play) => setIsPlaying(play);
  const handleEnded = () =>{
    setAudioCompleted((prev)=>({...prev,[currentStep]:true}));
    setIsPlaying(false);
    if(currentStep <4) setCurrentStep((prev)=>prev+1);
    else setCurrentStep(5);
  }

  const handleRestart = () => {
    setAudioCompleted((prev) => ({...prev,[currentStep]:false}));
    setIsPlaying(true);
  }

  const currentAudio = audioData[`audio${currentStep}`];

  return (
    <MainContainer>
      <h1>Britam Training</h1>
      <p>Listen to the audio until it ends, then click Next</p>
      {currentStep === 0 && (
        <Button onClick={handleStart} aria-label ="Start training">
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
