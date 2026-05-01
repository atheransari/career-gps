const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000') + '/api';
const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const getAuthHeader = () => {
    const token = localStorage.getItem('cp-token');
    return token ? { 'Authorization': `Bearer ${token}` } : {};
};

export const checkHealth = async () => {
  try {
    const res = await fetch(`${BASE_URL}/health`, { signal: AbortSignal.timeout(4000) });
    return res.ok;
  } catch {
    return false;
  }
};

export const api = {
  // --- Auth ---
  async signup(email, password) {
    const res = await fetch(`${API_URL}/auth/signup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Signup failed');
    }
    const data = await res.json();
    localStorage.setItem('cp-token', data.access_token);
    return data;
  },

  async login(email, password) {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Login failed');
    }
    const data = await res.json();
    localStorage.setItem('cp-token', data.access_token);
    return data;
  },

  logout() {
    localStorage.removeItem('cp-token');
    localStorage.removeItem('cp-user');
  },

  async forgotPassword(email) {
    const res = await fetch(`${API_URL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || 'Failed to send reset email');
    }
    return res.json();
  },

  // --- Analysis ---
  async parseResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/parse-resume`, { 
        method: 'POST', 
        body: formData,
        headers: getAuthHeader()
    });
    if (!res.ok) {
      let err;
      try { err = await res.json(); } catch(e) { err = await res.text(); }
      throw new Error(err.detail || err || 'Failed to parse resume');
    }
    return res.json();
  },

  async getAtsScore(resumeText) {
    const res = await fetch(`${API_URL}/ats-score`, {
      method: 'POST', 
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText })
    });
    if (!res.ok) {
      let err;
      try { err = await res.json(); } catch(e) { err = await res.text(); }
      throw new Error(err.detail || err || 'Failed to get ATS score');
    }
    return res.json();
  },

  async rewriteResume(resumeText) {
    const res = await fetch(`${API_URL}/rewrite-resume`, {
      method: 'POST', 
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText })
    });
    if (!res.ok) {
      let err;
      try { err = await res.json(); } catch(e) { err = await res.text(); }
      throw new Error(err.detail || err || 'Failed to rewrite resume');
    }
    return res.json();
  },

  async extractJobTitles(resumeText) {
    const res = await fetch(`${API_URL}/extract-job-titles`, {
      method: 'POST', 
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText })
    });
    if (!res.ok) {
        let err;
        try { err = await res.json(); } catch(e) { err = await res.text(); }
        throw new Error(err.detail || err || 'Failed to extract job titles');
    }
    return res.json();
  },

  async fetchJobs(query) {
    const res = await fetch(`${API_URL}/jobs?query=${encodeURIComponent(query)}`, {
        headers: getAuthHeader()
    });
    if (!res.ok) {
        let err;
        try { err = await res.json(); } catch(e) { err = await res.text(); }
        throw new Error(err.detail || err || 'Failed to fetch jobs');
    }
    return res.json();
  },

  async analyzeSkillGap(resumeText, jobDescription) {
    const res = await fetch(`${API_URL}/skill-gap`, {
      method: 'POST', 
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription })
    });
    if (!res.ok) {
        let err;
        try { err = await res.json(); } catch(e) { err = await res.text(); }
        throw new Error(err.detail || err || 'Failed to analyze skill gap');
    }
    return res.json();
  },

  async generateRoadmap(missingSkills, jobTitle) {
    const res = await fetch(`${API_URL}/roadmap`, {
      method: 'POST', 
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ missing_skills: missingSkills, job_title: jobTitle })
    });
    if (!res.ok) {
        let err;
        try { err = await res.json(); } catch(e) { err = await res.text(); }
        throw new Error(err.detail || err || 'Failed to generate roadmap');
    }
    return res.json();
  },

  async getInterviewPrep(resumeText, jobDescription, jobTitle) {
    const res = await fetch(`${API_URL}/interview-prep`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription, job_title: jobTitle })
    });
    if (!res.ok) {
        let err;
        try { err = await res.json(); } catch(e) { err = await res.text(); }
        throw new Error(err.detail || err || 'Failed to generate interview questions');
    }
    return res.json();
  },

  // --- Tracks ---
  async getTracks() {
    const res = await fetch(`${API_URL}/tracks`, { headers: getAuthHeader() });
    if (!res.ok) {
      let err; try { err = await res.json(); } catch { err = {}; }
      throw new Error(err.detail || 'Failed to fetch tracks');
    }
    return res.json();
  },

  async createTrack(trackData) {
    const res = await fetch(`${API_URL}/tracks`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify({
          job_title: trackData.job_title,
          job_description: trackData.job_description,
          resume_text: trackData.resume_text,
          ats_score: Math.round(trackData.ats_score),
          skill_gap: trackData.skill_gap,
          roadmap: trackData.roadmap
      })
    });
    if (!res.ok) {
      let err; try { err = await res.json(); } catch { err = {}; }
      throw new Error(err.detail || 'Failed to save track');
    }
    return res.json();
  },

  async getTrack(id) {
    const res = await fetch(`${API_URL}/tracks/${id}`, { headers: getAuthHeader() });
    if (!res.ok) {
      let err; try { err = await res.json(); } catch { err = {}; }
      throw new Error(err.detail || 'Failed to fetch track details');
    }
    return res.json();
  },

  async updateTrack(id, updateData) {
    const res = await fetch(`${API_URL}/tracks/${id}`, {
      method: 'PATCH',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(updateData)
    });
    if (!res.ok) {
      let err; try { err = await res.json(); } catch { err = {}; }
      throw new Error(err.detail || 'Failed to update track');
    }
    return res.json();
  },

  // --- Voice Interview ---
  async getInterviewQuestions(type) {
    const res = await fetch(`${API_URL}/interview/questions?type=${type}`, { headers: getAuthHeader() });
    if (!res.ok) {
      let err; try { err = await res.json(); } catch { err = {}; }
      throw new Error(err.detail || 'Failed to fetch interview questions');
    }
    return res.json();
  },

  async analyseInterview(data) {
    const res = await fetch(`${API_URL}/interview/analyse`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      let err; try { err = await res.json(); } catch { err = {}; }
      throw new Error(err.detail || 'Failed to analyse interview');
    }
    return res.json();
  },

  // --- Interview Sessions ---
  async saveInterviewSession(sessionData) {
    const res = await fetch(`${API_URL}/interview/sessions`, {
      method: 'POST',
      headers: { ...getAuthHeader(), 'Content-Type': 'application/json' },
      body: JSON.stringify(sessionData)
    });
    if (!res.ok) {
      let err; try { err = await res.json(); } catch { err = {}; }
      throw new Error(err.detail || 'Failed to save session');
    }
    return res.json();
  },

  async getInterviewSessions() {
    const res = await fetch(`${API_URL}/interview/sessions`, { headers: getAuthHeader() });
    if (!res.ok) {
      let err; try { err = await res.json(); } catch { err = {}; }
      throw new Error(err.detail || 'Failed to fetch sessions');
    }
    return res.json();
  },

  async getResumeHistory() {
    const res = await fetch(`${API_URL}/resume/history`, { headers: getAuthHeader() });
    if (!res.ok) {
      let err; try { err = await res.json(); } catch { err = {}; }
      throw new Error(err.detail || 'Failed to fetch resume history');
    }
    return res.json();
  },
};
