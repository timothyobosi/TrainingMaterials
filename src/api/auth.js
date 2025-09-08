const BASE_URL = import.meta.env.VITE_API_TARGET + import.meta.env.VITE_API_BASE_URL; // https://brm-partners.britam.com/api/Agents
const TRAINING_BASEURL = import.meta.env.VITE_API_TARGET + import.meta.env.VITE_TRAINING_BASE_URL; // https://brm-partners.britam.com/api/Training
const QUIZ_BASE_URL = import.meta.env.VITE_API_TARGET + '/api/Quiz'; // https://brm-partners.britam.com/api/Quiz

export async function login(email, password) {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function setPassword(email, password) {
  const res = await fetch(`${BASE_URL}/set-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return res.json();
}

export async function resetPassword(email) {
  const res = await fetch(`${BASE_URL}/reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email }),
  });
  return res.json();
}

export async function completeResetPassword(token, password, email) {
  const res = await fetch(`${BASE_URL}/complete-reset-password`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      token,
      newPassword: password,
      email,
    }),
  });
  return res.json();
}

export async function changePassword(oldPassword, newPassword, token) {
  const res = await fetch(`${BASE_URL}/change-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ oldPassword, newPassword }),
  });
  return res.json();
}

// Training API functions
export async function getNextTraining(token, step) {
  const res = await fetch(`${TRAINING_BASEURL}/next?step=${step}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP error! status ${res.status}`);
  return res.json();
}

export async function getTrainingById(token, id) {
  const res = await fetch(`${TRAINING_BASEURL}/${id}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function updateTrainingProgress(token, moduleId, watchSeconds) {
  const res = await fetch(`${TRAINING_BASEURL}/progress`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ moduleId, watchSeconds }),
  });

  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to post training progress: ${res.status}`, text);
    throw new Error(`HTTP error! status: ${res.status}`);
  }

  return res.json();
}

export async function getTrainingStatus(token) {
  const res = await fetch(`${TRAINING_BASEURL}/status`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function getCompletionReport(token) {
  const res = await fetch(`${TRAINING_BASEURL}/completion-report`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

// Quiz API functions
export async function getQuizQuestions(token, moduleId) {
  const res = await fetch(`${QUIZ_BASE_URL}/questions/${moduleId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': '*/*',
    },
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function getQuizScore(token, agentId, moduleId) {
  const res = await fetch(`${QUIZ_BASE_URL}/score/${agentId}/${moduleId}`, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': '*/*',
    },
  });
  if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
  return res.json();
}

export async function submitQuizAnswers(token, agentId, moduleId, answers) {
  const res = await fetch(`${QUIZ_BASE_URL}/submit-answer`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({
      agentId,
      questionId: answers[0]?.questionId || 0, // Adjust based on first answer
      selectedOptionId: answers[0]?.selectedAnswer ? 1 : 0, // Placeholder, needs mapping
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error(`Failed to submit answer at ${QUIZ_BASE_URL}/submit-answer: ${res.status} - ${text}`);
    throw new Error(`HTTP error! status: ${res.status}`);
  }
  return res.json();
}