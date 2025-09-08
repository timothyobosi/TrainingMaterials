import { useState, useEffect } from 'react';
import {
  Box,
  Button,
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
} from '@mui/material';
import { britamBlue } from '../data/colors';
import { getQuizQuestions, submitQuizAnswers, getQuizScore } from '../api/auth';

interface Question {
  id: number;
  moduleId: number;
  question: string;
  options: string[];
}

interface TestProps {
  agentId: number;
  token: string;
  onComplete: (results: { moduleId: number; score: any }[]) => void;
}

const Test: React.FC<TestProps> = ({ agentId, token, onComplete }) => {
  const [selectedModule, setSelectedModule] = useState<number | ''>('');
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [submittedModules, setSubmittedModules] = useState<number[]>([]); // Track submitted modules

  // Mock questions data (replace with API response when available)
  const mockQuestions: Question[] = [
    // Module 1
    { id: 1, moduleId: 1, question: 'What is the main purpose of insurance?', options: ['To make profits for insurers', 'To act as a safety net against financial losses', 'To eliminate all risks', 'To provide loans to families'] },
    { id: 2, moduleId: 1, question: 'How does insurance work?', options: ['Each person pays premiums to cover only their own risk', 'Premiums are returned if no loss occurs', 'Government pays for all insurance losses', 'Everyone contributes small premiums into a pool, and claims are paid from it'] },
    { id: 3, moduleId: 1, question: 'What makes microinsurance different from traditional insurance?', options: ['It is simple, affordable, and accessible to ordinary households', 'It has higher premiums', 'It is designed only for big companies', 'It requires long contracts and heavy paperwork'] },
    { id: 4, moduleId: 1, question: 'Which example best explains a grace period?', options: ['Sharing a boda boda ride with a friend', 'Buying a ticket from Nairobi to Kisumu', 'Planting maize and waiting to harvest', 'A chama member being given more days to pay her contribution'] },
    { id: 5, moduleId: 1, question: 'Why is the role of an agent important in microinsurance?', options: ['To only collect premiums', 'To educate, build trust and expand access to insurance', 'To replace IRA in monitoring insurers', 'To convince customers forcefully to buy policies'] },
    // Module 2
    { id: 6, moduleId: 2, question: 'What is the role of the Insurance Regulatory Authority (IRA) in Kenya?', options: ['To sell insurance to the public', 'To collect taxes on insurance premiums', 'To regulate, license and monitor insurers and agents', 'To handle hospital bills'] },
    { id: 7, moduleId: 2, question: 'What is one key requirement for microinsurance policies under IRA regulations?', options: ['They must have short, simple documents in plain language', 'They must be written in complex legal terms', 'They must only be distributed in banks', 'They must cost more than traditional insurance'] },
    { id: 8, moduleId: 2, question: 'What happens if a customer feels mistreated by an insurer?', options: ['They cannot do anything', 'They must wait for the insurer’s goodwill', 'They must sue the insurer directly', 'They can escalate the complaint to IRA'] },
    { id: 9, moduleId: 2, question: 'Why must agents remind customers they represent a licensed insurer?', options: ['To increase commissions', 'To reduce paperwork', 'To build trust and credibility', 'To avoid paying taxes'] },
    { id: 10, moduleId: 2, question: 'How soon must claims be paid under IRA microinsurance rules once all documents are submitted?', options: ['90 days', '10 days', '30 days', '120 days'] },
    // Module 3
    { id: 11, moduleId: 3, question: 'What is the first step in selling insurance?', options: ['Building rapport', 'Handling objections', 'Prospecting', 'Closing the deal'] },
    { id: 12, moduleId: 3, question: 'Which of the following is a good source of insurance prospects?', options: ['Chama meetings', 'Church groups', 'Family referrals', 'All of the above'] },
    { id: 13, moduleId: 3, question: 'How should an agent handle objections like “Insurance never pays”?', options: ['Ignore the client’s concern', 'Argue and prove them wrong', 'Acknowledge the concern, then share real success stories', 'End the conversation immediately'] },
    { id: 14, moduleId: 3, question: 'Which statement best represents the closing phase?', options: ['“Let’s think about it another time.”', '“Shall we start the application today so you are immediately protected?”', '“I don’t think this is for you.”', '“You must buy now or lose the chance.”'] },
    { id: 15, moduleId: 3, question: 'Why is follow-up important after a sale?', options: ['To build long-term relationships and get referrals', 'To make sure clients never cancel', 'To increase premiums', 'To avoid IRA penalties'] },
    // Module 4
    { id: 16, moduleId: 4, question: 'Why is follow-up important after a sale?', options: ['To build long-term relationships and get referrals', 'To make sure clients never cancel', 'To increase premiums', 'To avoid IRA penalties'] },
    { id: 17, moduleId: 4, question: 'What is the main aim of Britam’s Microinsurance Medical Cover?', options: ['To offer luxury medical services', 'To replace SHIF', 'To make healthcare affordable and accessible to ordinary Kenyans', 'To cover only wealthy individuals'] },
    { id: 18, moduleId: 4, question: 'Which benefit is provided if someone is hospitalized for 3 or more nights?', options: ['Funeral costs', 'Outpatient Benefits', 'Hospital cash payout', 'Malkia Cancer Cash Benefit'] },
    { id: 19, moduleId: 4, question: 'What unique feature does the cover provide for women?', options: ['Free lung cancer treatment', 'A lump sum payment upon diagnosis of cervical, ovarian, or breast cancer', 'Free skincare services', 'Retirement savings'] },
    { id: 20, moduleId: 4, question: 'Which of the following is an exclusion under the policy?', options: ['Accidents', 'Infertility Treatments', 'Inpatient Care', 'Ambulance Services'] },
  ];

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      try {
        // const data = await getQuizQuestions(token); // Uncomment when API returns data
        setQuestions(mockQuestions); // Using mock data for now
        setError('');
      } catch (e: any) {
        setError('Failed to fetch questions: ' + e.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [token]);

  const handleAnswerChange = (questionId: number, answer: string) => {
    if (!submittedModules.includes(selectedModule as number)) {
      setAnswers((prev) => ({ ...prev, [questionId]: answer }));
    }
  };

  const handleClear = (questionId: number) => {
    if (!submittedModules.includes(selectedModule as number)) {
      setAnswers((prev) => {
        const newAnswers = { ...prev };
        delete newAnswers[questionId];
        return newAnswers;
      });
    }
  };

  const handleSubmit = async () => {
    if (!selectedModule) {
      setError('Please select a module');
      return;
    }
    if (Object.keys(answers).length === 0) {
      setError('Please answer at least one question');
      return;
    }
    if (submittedModules.includes(selectedModule as number)) {
      setError('This module has already been submitted');
      return;
    }
    setLoading(true);
    try {
      const answersArray = Object.entries(answers).map(([questionId, selectedAnswer]) => ({
        questionId: parseInt(questionId),
        selectedAnswer,
      }));
      await submitQuizAnswers(token, agentId, selectedModule, answersArray);
      const scoreData = await getQuizScore(token, agentId, selectedModule);
      setSubmittedModules((prev) => [...prev, selectedModule as number]); // Lock the module
      setAnswers({}); // Clear answers after submission
      setError('');
      onComplete([{ moduleId: selectedModule as number, score: scoreData }]); // Pass new result
    } catch (e: any) {
      setError('Failed to submit answers: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  const filteredQuestions = questions.filter((q) => q.moduleId === selectedModule);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: '600px', mx: 'auto' }}>
      <Typography variant="h6" sx={{ fontWeight: 'bold', color: britamBlue }}>
        Take Your Training Test
      </Typography>
      <FormControl fullWidth>
        <InputLabel id="module-select-label">Select Module</InputLabel>
        <Select
          labelId="module-select-label"
          value={selectedModule}
          onChange={(e) => {
            setSelectedModule(e.target.value as number);
            if (submittedModules.includes(e.target.value as number)) {
              setAnswers({}); // Reset answers if module was submitted
            }
          }}
          label="Select Module"
          disabled={loading}
        >
          <MenuItem value={1}>Module 1</MenuItem>
          <MenuItem value={2}>Module 2</MenuItem>
          <MenuItem value={3}>Module 3</MenuItem>
          <MenuItem value={4}>Module 4</MenuItem>
        </Select>
      </FormControl>
      {loading && <CircularProgress sx={{ alignSelf: 'center' }} />}
      {error && <Typography color="error">{error}</Typography>}
      {selectedModule && !submittedModules.includes(selectedModule) && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          {filteredQuestions.map((question) => (
            <Box key={question.id} sx={{ border: '1px solid #ddd', p: 2, borderRadius: 2 }}>
              <Typography sx={{ mb: 1, fontWeight: 'bold' }}>{question.question}</Typography>
              <RadioGroup
                value={answers[question.id] || ''}
                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
              >
                {question.options.map((option, index) => (
                  <FormControlLabel
                    key={index}
                    value={option}
                    control={<Radio />}
                    label={option}
                    disabled={submittedModules.includes(selectedModule)}
                  />
                ))}
              </RadioGroup>
              <Button
                variant="outlined"
                sx={{ mt: 1, borderRadius: 50, textTransform: 'capitalize' }}
                onClick={() => handleClear(question.id)}
                disabled={submittedModules.includes(selectedModule)}
              >
                Clear
              </Button>
            </Box>
          ))}
          <Button
            variant="contained"
            sx={{ backgroundColor: britamBlue, borderRadius: 50, textTransform: 'capitalize' }}
            onClick={handleSubmit}
            disabled={loading || submittedModules.includes(selectedModule) || filteredQuestions.length === 0}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Submit Test'}
          </Button>
        </Box>
      )}
      {selectedModule && submittedModules.includes(selectedModule) && (
        <Typography color="text.secondary" sx={{ textAlign: 'center' }}>
          This module has been submitted. Please select another module to continue.
        </Typography>
      )}
    </Box>
  );
};

export default Test;