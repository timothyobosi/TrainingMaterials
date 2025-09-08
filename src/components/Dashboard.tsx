import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  Grid,
  Typography,
} from '@mui/material';
import { britamBlue } from '../data/colors';
import { useNavigate } from 'react-router-dom';
import { changePassword, getNextTraining, updateTrainingProgress, getTrainingStatus } from '../api/auth';
import AudioPlayer from './AudioPlayer';
import Test from './Test';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('Training materials');
  const [firstName, setFirstName] = useState(localStorage.getItem('britamFirstName') || '');
  const [agentId] = useState(Number(localStorage.getItem('britamAgentId') || '6')); // Assume agentId is stored
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [trainingData, setTrainingData] = useState<any>(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [audioCompleted, setAudioCompleted] = useState<Record<string, boolean>>({});
  const [testResults, setTestResults] = useState<{ moduleId: number; score: any }[]>([]);
  const [trainingStatus, setTrainingStatus] = useState<any>(null);
  const token = localStorage.getItem('britamToken') || '';

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const handleLogout = () => {
    localStorage.removeItem('britamToken');
    localStorage.removeItem('britamFirstName');
    localStorage.removeItem('britamAgentId');
    navigate('/login');
  };

  const fetchTrainingData = async () => {
    try {
      setLoading(true);
      const data = await getNextTraining(token, currentStep);
      setTrainingData(data);
      setAudioCompleted((prev) => ({ ...prev, [data.moduleId]: data.isComplete || false }));
      setLoading(false);
    } catch (e: any) {
      setError('Failed to fetch training data: ' + e.message);
      setLoading(false);
    }
  };

  const fetchTrainingStatus = async () => {
    try {
      const status = await getTrainingStatus(token);
      setTrainingStatus(status);
    } catch (e: any) {
      setError('Failed to fetch training status: ' + e.message);
    }
  };

  const handlePlayPause = (play: boolean) => setIsPlaying(play);

  const handleEnded = async () => {
    setAudioCompleted((prev) => ({ ...prev, [trainingData.moduleId]: true }));
    setIsPlaying(false);
    try {
      await updateTrainingProgress(token, trainingData.moduleId, trainingData.duration * 60);
      fetchTrainingStatus();
    } catch (e: any) {
      console.warn('Progress update failed: ', e.message);
    }
  };

  const handleNext = async () => {
    if (currentStep < 4 && audioCompleted[trainingData.moduleId]) {
      setCurrentStep((prev) => prev + 1);
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

  const handleTestComplete = (results: { moduleId: number; score: any }[]) => {
    setTestResults(results);
  };

  const calculateResults = () => {
    const totalModules = 4;
    const completedModules = Object.keys(audioCompleted).filter((id) => audioCompleted[id]).length;
    const courseCompletion = (completedModules / totalModules) * 100;

    const totalQuestions = testResults.reduce((sum, r) => sum + r.score.totalQuestions, 0);
    const totalCorrect = testResults.reduce((sum, r) => sum + r.score.correctAnswers, 0);
    const testCompletion = testResults.length > 0 ? (testResults.length / totalModules) * 100 : 0;
    const testPercentage = totalQuestions > 0 ? (totalCorrect / totalQuestions) * 100 : 0;

    return {
      courseCompletion: courseCompletion.toFixed(0) + '%',
      testCompletion: testCompletion.toFixed(0) + '%',
      testPercentage: testPercentage.toFixed(0) + '%',
      testResults: `Total score is ${totalCorrect} out of ${totalQuestions}`,
      overallStatus: testPercentage.toFixed(0) + '%',
    };
  };

  useEffect(() => {
    if (!token) navigate('/login');
    if (activeTab === 'Training materials' && !trainingData) {
      fetchTrainingData();
    }
    fetchTrainingStatus();
  }, [token, navigate, activeTab, currentStep]);

  const results = calculateResults();

  const renderContent = () => {
    switch (activeTab) {
      case 'Training materials':
        return trainingData ? (
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ textAlign: 'center' }}>
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
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                variant="outlined"
                sx={{ borderRadius: 50, textTransform: 'capitalize' }}
                onClick={handlePrevious}
                disabled={currentStep === 1}
              >
                Previous
              </Button>
              <Button
                variant="contained"
                sx={{ backgroundColor: britamBlue, borderRadius: 50, textTransform: 'capitalize' }}
                onClick={handleNext}
                disabled={!audioCompleted[trainingData.moduleId] && currentStep < 5}
              >
                {currentStep === 4 && audioCompleted[trainingData.moduleId] ? 'Finish' : 'Next'}
              </Button>
            </Box>
            {loading && <CircularProgress />}
            {error && <Typography color="error" sx={{ mt: 2, textAlign: 'center' }}>{error}</Typography>}
          </Box>
        ) : (
          <Typography sx={{ textAlign: 'center' }}>
            {loading ? 'Loading training materials...' : 'Content will be fetched from the training API.'}
          </Typography>
        );
      case 'Test':
        return <Test agentId={agentId} token={token} onComplete={handleTestComplete} />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: 'flex', width: '100%', minHeight: '100vh', backgroundColor: '#f5f5f5' }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: 200,
          backgroundColor: 'white',
          borderRight: '1px solid #ddd',
          p: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
        }}
      >
        <img src="/src/assets/images/Britam logo.png" alt="Britam logo" width={120} style={{ marginBottom: 20 }} />
        <Button
          variant={activeTab === 'Training materials' ? 'contained' : 'outlined'}
          sx={{ mb: 2, borderRadius: 50, textTransform: 'capitalize', width: '100%' }}
          onClick={() => setActiveTab('Training materials')}
        >
          Training materials
        </Button>
        <Button
          variant={activeTab === 'Test' ? 'contained' : 'outlined'}
          sx={{ mb: 2, borderRadius: 50, textTransform: 'capitalize', width: '100%' }}
          onClick={() => setActiveTab('Test')}
        >
          Test
        </Button>
        <Button
          variant="outlined"
          sx={{ borderRadius: 50, textTransform: 'capitalize', width: '100%' }}
          onClick={handleLogout}
        >
          Logout
        </Button>
      </Box>

      {/* Main content */}
      <Box sx={{ flex: 1, px: 2, py: 4 }}>
        <Box sx={{ maxWidth: '900px', mx: 'auto' }}>
          <Grid container spacing={4} direction="column">
            <Grid item xs={12}>
              <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2, width: '100%' }}>
                <CardContent>
                  <Typography variant="h5" sx={{ fontWeight: 'bold', mb: 2, color: britamBlue, textAlign: 'left' }}>
                    {`${getGreeting()}, ${firstName}!`}
                  </Typography>
                  {testResults.length > 0 && (
                    <Box sx={{ mb: 2 }}>
                      <Typography><strong>Completion of the course:</strong> {results.courseCompletion}</Typography>
                      <Typography><strong>Test completion:</strong> {results.testCompletion}</Typography>
                      <Typography><strong>Test Percentage:</strong> {results.testPercentage}</Typography>
                      <Typography><strong>Test Results:</strong> {results.testResults}</Typography>
                      <Typography><strong>Overall Status:</strong> {results.overallStatus}</Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
            <Grid item xs={12}>
              <Card sx={{ p: 2, borderRadius: 2, boxShadow: 2, width: '100%', maxWidth: '600px' }}>
                <CardContent sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
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