import React, { useState, useEffect, useRef } from 'react';

const FILLER_WORDS = ['um', 'uh', 'like', 'you know', 'basically', 'actually', 'sort of'];

const VoiceRecorder = ({ onStop }) => {
  const isRecording = useRef(false);
  const [, forceUpdate] = useState({});
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const globalTranscriptRef = useRef('');
  const [elapsedTime, setElapsedTime] = useState(0);
  const [fillerCount, setFillerCount] = useState(0);
  const [pauseCount, setPauseCount] = useState(0);
  const [detectedFillers, setDetectedFillers] = useState([]);
  
  const recognitionRef = useRef(null);
  const timerRef = useRef(null);
  const lastWordTimeRef = useRef(Date.now());
  const transcriptRef = useRef('');

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser. Please use Chrome.");
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-IN';
    recognition.maxAlternatives = 3;

    recognition.onresult = (event) => {
      let sessionFinal = '';
      let sessionInterim = '';

      for (let i = 0; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          sessionFinal += event.results[i][0].transcript;
        } else {
          sessionInterim += event.results[i][0].transcript;
        }
      }
      
      const currentFullTranscript = globalTranscriptRef.current + sessionFinal;
      const newFinal = currentFullTranscript.slice(transcriptRef.current.length).toLowerCase();
      
      if (newFinal.trim() || sessionInterim.trim()) {
        lastWordTimeRef.current = Date.now();
      }

      if (newFinal.trim()) {
        FILLER_WORDS.forEach(filler => {
          if (newFinal.includes(filler)) {
            setFillerCount(prev => prev + 1);
            setDetectedFillers(prev => [...prev, filler]);
          }
        });
      }
      
      transcriptRef.current = currentFullTranscript;
      setTranscript(currentFullTranscript);
      setInterimTranscript(sessionInterim);
    };

    recognition.onend = () => {
      globalTranscriptRef.current = transcriptRef.current;
      if (isRecording.current) {
        try { recognition.start(); } catch(e) {} // Auto-restart if it cuts out
      }
    };

    recognitionRef.current = recognition;
  }, []);



  const startRecording = () => {
    setTranscript('');
    setInterimTranscript('');
    transcriptRef.current = '';
    globalTranscriptRef.current = '';
    setElapsedTime(0);
    setFillerCount(0);
    setPauseCount(0);
    setDetectedFillers([]);
    lastWordTimeRef.current = Date.now();
    
    isRecording.current = true;
    forceUpdate({});
    try { recognitionRef.current.start(); } catch(e) {}
    
    clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setElapsedTime(prev => prev + 1);
      if (Date.now() - lastWordTimeRef.current > 2000) {
          setPauseCount(prev => prev + 1);
          lastWordTimeRef.current = Date.now();
      }
    }, 1000);
  };

  const stopRecording = () => {
    isRecording.current = false;
    forceUpdate({});
    clearInterval(timerRef.current);
    
    if (recognitionRef.current) {
      recognitionRef.current.stop();
      recognitionRef.current.abort();
    }
    
    const wordCount = transcriptRef.current.trim().split(/\s+/).length;
    const minutes = elapsedTime / 60;
    const wpm = minutes > 0 ? Math.round(wordCount / minutes) : 0;

    onStop({
      transcript: transcriptRef.current,
      duration: elapsedTime,
      fillers: Array.from(new Set(detectedFillers)),
      fillerCount,
      pauses: pauseCount,
      wpm
    });
  };

  useEffect(() => {
    return () => clearInterval(timerRef.current);
  }, []);

  return (
    <div style={{ textAlign: 'center', padding: '40px 0' }}>
      <div style={{ marginBottom: 40, position: 'relative' }}>
        <button 
          onClick={isRecording.current ? stopRecording : startRecording}
          style={{
            width: 120, height: 120, borderRadius: '50%',
            background: isRecording.current ? '#EF4444' : '#6366F1',
            border: 'none', cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            boxShadow: isRecording.current ? '0 0 40px rgba(239, 68, 68, 0.4)' : '0 10px 30px rgba(99, 102, 241, 0.3)',
            animation: isRecording.current ? 'pulse-red 1.5s infinite shadow' : 'none'
          }}
        >
          {isRecording.current ? (
            <div style={{ width: 40, height: 40, background: '#fff', borderRadius: 8 }} />
          ) : (
            <div style={{ width: 0, height: 0, borderTop: '20px solid transparent', borderBottom: '20px solid transparent', borderLeft: '35px solid #fff', marginLeft: 10 }} />
          )}
        </button>
        
        {isRecording.current && (
          <div className="recording-ring" style={{
            position: 'absolute', top: '50%', left: '50%',
            transform: 'translate(-50%, -50%)',
            width: 150, height: 150,
            borderRadius: '50%',
            border: '2px solid rgba(239, 68, 68, 0.3)',
            animation: 'ping-ring 2s infinite'
          }} />
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 500, margin: '0 auto 40px' }}>
        <div style={{ padding: 16, background: 'rgba(30,41,59,0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Time</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#fff' }}>{Math.floor(elapsedTime / 60)}:{(elapsedTime % 60).toString().padStart(2, '0')}</div>
        </div>
        <div style={{ padding: 16, background: 'rgba(30,41,59,0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Fillers</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#EF4444' }}>{fillerCount}</div>
        </div>
        <div style={{ padding: 16, background: 'rgba(30,41,59,0.4)', borderRadius: 16, border: '1px solid rgba(255,255,255,0.05)' }}>
          <div style={{ fontSize: 12, color: '#94A3B8', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Pauses</div>
          <div style={{ fontSize: 24, fontWeight: 900, color: '#F59E0B' }}>{pauseCount}</div>
        </div>
      </div>

      <div style={{ 
        maxWidth: 700, margin: '0 auto', textAlign: 'left', 
        padding: 24, background: 'rgba(15,23,42,0.3)', borderRadius: 20, 
        border: '1px solid rgba(255,255,255,0.05)', minHeight: 100,
        position: 'relative', overflow: 'hidden'
      }}>
        {!transcript && !interimTranscript && !isRecording.current ? (
           <p style={{ color: '#64748B', textAlign: 'center', marginTop: 20 }}>Click the button to start your response...</p>
        ) : (
           <p style={{ color: '#D1D5DB', lineHeight: 1.6, fontSize: 16 }}>
             {transcript}
             <span style={{ color: '#64748B' }}>{interimTranscript}</span>
             {isRecording.current && <span className="typing-cursor">|</span>}
           </p>
        )}
      </div>

      <style>{`
        @keyframes ping-ring {
          0% { transform: translate(-50%, -50%) scale(1); opacity: 1; }
          100% { transform: translate(-50%, -50%) scale(1.5); opacity: 0; }
        }
        .typing-cursor {
          animation: blink 1s infinite;
          color: #6366F1;
          font-weight: 900;
          margin-left: 4px;
        }
        @keyframes blink { 50% { opacity: 0; } }
      `}</style>
    </div>
  );
};

export default VoiceRecorder;
