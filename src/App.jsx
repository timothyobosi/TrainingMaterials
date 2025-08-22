import { useState } from 'react'
import './App.css'

function App() {
  const [currentStep, setCurrentStep] = useState(0) //0=start , 1-4 = Audio steps, 5 =done

  const handleStart = () => setCurrentStep(1);
  const handleNext = () => setCurrentStep((prev) => prev +1)
  const handleReturn = () => {
    sessionStorage.removeItem('britamTrainingProgress');
    window.location.href = '';//Temporary Placeholder
  }

  return (
    <div>
      <h1>Britam Training</h1>
      {currentStep === 0 && <button onClick={handleStart}> Start </button> }
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
          <button onClick={handleReturn}> Return</button>
        </div>
      )}
    </div>
    
  )
}

export default App
