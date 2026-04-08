const API_URL = 'http://localhost:8000/api';

export const api = {
  async parseResume(file) {
    const formData = new FormData();
    formData.append('file', file);
    const res = await fetch(`${API_URL}/parse-resume`, { method: 'POST', body: formData });
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
      headers: {'Content-Type': 'application/json'},
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
      headers: {'Content-Type': 'application/json'},
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
      headers: {'Content-Type': 'application/json'},
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
    const res = await fetch(`${API_URL}/jobs?query=${encodeURIComponent(query)}`);
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
      headers: {'Content-Type': 'application/json'},
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
      headers: {'Content-Type': 'application/json'},
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
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ resume_text: resumeText, job_description: jobDescription, job_title: jobTitle })
    });
    if (!res.ok) {
        let err;
        try { err = await res.json(); } catch(e) { err = await res.text(); }
        throw new Error(err.detail || err || 'Failed to generate interview questions');
    }
    return res.json();
  }
};
