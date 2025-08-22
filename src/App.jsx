import { useEffect, useState } from 'react'
import './App.css'
import { parseQuery } from './utils/parseQuery'
import MainContainer from './components/MainContainer'
import Button from './components/Button'

function App() {
  const [currentStep, setCurrentStep] = useState(0) //0=start , 1-4 = Audio steps, 5 =done
  const [audioData, setAudioData] = useState ({audio1:null,audio2:null,audio3:null,audio4:null, returnUrl:null})

  useEffect(()=>{

    const savedAudioData = JSON.parse(sessionStorage.getItem('britamTrainingProgress')) || {};
    if (savedAudioData) setAudioData (savedAudioData);

    //parse query params on mount
    const queryData = parseQuery();
    setAudioData(queryData);
    sessionStorage.setItem('britamTrainingAudioData',JSON.stringify(queryData))

    //load progress from sessionStorage on mount
    const savedProgress  = JSON.parse(sessionStorage.getItem('britamTrainingProgress')) || {};
    if(savedProgress.currentStep) setCurrentStep(savedProgress.currentStep);
    //save progress on change
    sessionStorage.setItem('britamTrainingProgress', JSON.stringify({currentStep}))
  },[currentStep])

  const handleStart = () => setCurrentStep(1);
  const handleNext = () => setCurrentStep((prev) => prev +1)
  const handleReturn = () => {
    sessionStorage.removeItem('britamTrainingProgress');
    sessionStorage.removeItem('britamTrainingAudioData');
    window.location.href = audioData.returnUrl || 'http://example.com' //Use parsed returnUrl or fallback   //Temporary Placeholder
  }

  return (
    <MainContainer>
      <h1>Britam Training</h1>
      {currentStep === 0 && <Button onClick={handleStart}> Start </Button> }
      {currentStep > 0 && currentStep < 5 && (
        <div>
          <p>Audio {currentStep} of 4</p>
          <button onClick={handleNext} disabled={currentStep ===4} >
            Next
          </button>
        </div>
      ) }
      {currentStep ===5 && (
        <div>
          <p> All Audios complete</p>
          <Button onClick={handleReturn}> Return</Button>
        </div>
      )}
    </MainContainer>
    
  )
}

export default App
