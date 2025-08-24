import { useEffect, useState } from 'react'
import './App.css'
import { parseQuery } from './utils/parseQuery'
import MainContainer from './components/MainContainer'
import Button from './components/Button'
import AudioPlayer from './components/AudioPlayer'

function App() {
  const [currentStep, setCurrentStep] = useState(0) //0=start , 1-4 = Audio steps, 5 =done
  const [audioData, setAudioData] = useState({ audio1: null, audio2: null, audio3: null, audio4: null, returnUrl: null })
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState({ 1: false, 2: false, 3: false, 4: false });

  useEffect(() => {

    const savedAudioData = JSON.parse(sessionStorage.getItem('britamTrainingProgress')) || {};
    if (savedAudioData) setAudioData(savedAudioData);

    //parse query params on mount
    const queryData = parseQuery();
    setAudioData(queryData);

    //save audio data to sessionStorage
    sessionStorage.setItem('britamTrainingAudioData', JSON.stringify(queryData))

    //load progress from sessionStorage on mount
    const savedProgress = JSON.parse(sessionStorage.getItem('britamTrainingProgress')) || {};
    if (savedProgress.currentStep) setCurrentStep(savedProgress.currentStep);
    //save progress on change
    sessionStorage.setItem('britamTrainingProgress', JSON.stringify({ currentStep }))
  }, [currentStep])

  const handlePlayPause = (play) => setCurrentStep(play);
  const handleEnded = () => {
    setAudioCompleted((prev) => ({ ...prev, [currentStep]: true }));
    setIsPlaying(false);
    if (currentStep < 4) setCurrentStep((prev) => prev + 1);
    else setCurrentStep(5);
  }
  const handleRestart = () => {
    setAudioCompleted((prev) => ({ ...prev, [currentStep]: false }));
    setIsPlaying(true);
  }

  const currentAudio = audioData[`audio${currentStep}`];

  return (
    <MainContainer>
      <h1>Britam Training</h1>
      <p>Listen to the audio until it ends, then click Next</p>
      {currentStep === 0 && <Button onClick={() => { setIsPlaying(true); setCurrentStep(1); }}> Start </Button>}
      {currentStep > 0 && currentStep < 5 && currentAudio && (
        <div>
          <p>Audio {currentStep} of 4</p>
          <AudioPlayer
            src={currentAudio}
            onEnded={handleEnded}
            onRestart={handleRestart}
            isPlaying={isPlaying}
            onPlayPause={handlePlayPause}
          />
          <Button onClick={() => setCurrentStep((prev) => prev + 1)} disabled={!audioCompleted[currentStep]}>
            Next
          </Button>
        </div>
      )}
      {currentStep === 5 && (
        <div>
          <p> All Audios complete</p>
          <Button onClick={() => {handleReturn();}}> Return</Button>
        </div>
      )}
    </MainContainer>

  )
}

export default App
