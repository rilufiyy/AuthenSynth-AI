import { useState, useRef } from 'react';
import './App.css';

interface DetectResponse {
  verdict: 'ai_generated' | 'human_generated';
  confidence: number;
  band: 'Low' | 'Moderate' | 'Uncertain' | 'High' | 'Very High';
  confidence_adjustment: number;
  primary_indicators: string[];
  counter_evidence: string[];
  conflict_flag: boolean;
  explanation: string;
  adversarial_warning: string;
}

function UploadIcon() {
  return (
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ opacity: 0.7 }}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="17 8 12 3 7 8" />
      <line x1="12" y1="3" x2="12" y2="15" />
    </svg>
  );
}

function App() {
  const [content, setContent] = useState('');
  const [modality, setModality] = useState('text');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<DetectResponse | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setContent(reader.result);
          }
        };
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error accessing microphone:", err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const getAcceptedFileTypes = (mod: string) => {
    switch (mod) {
      case 'text': return '.txt,.doc,.docx,.pdf';
      case 'image': return 'image/*';
      case 'audio': return 'audio/*';
      case 'video': return 'video/*';
      case 'code': return '*';
      default: return '*';
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result;
      if (typeof result === 'string') {
        setContent(result);
      }
    };

    if (modality === 'text' || modality === 'code') {
      reader.readAsText(file);
    } else {
      reader.readAsDataURL(file);
    }

    // reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleAnalyze = async () => {
    if (!content.trim()) return;
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/v1/detect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content, modality })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <header className="header">
        <h1>AuthenSynth <span>AI</span></h1>
        <p>Production-grade multi-modal AI content detection system</p>
      </header>

      <main className="main-content">
        <div className="input-section glass-panel">
          <div className="modality-selector">
            {['text', 'image', 'audio', 'video', 'code'].map(mod => (
              <button
                key={mod}
                className={`mod-btn ${modality === mod ? 'active' : ''}`}
                onClick={() => setModality(mod)}
              >
                {mod.charAt(0).toUpperCase() + mod.slice(1)}
              </button>
            ))}
          </div>

          {modality === 'image' || modality === 'video' || modality === 'audio' ? (
            <div className="file-upload-only-box" onClick={() => !isRecording && fileInputRef.current?.click()}>
              {content ? (
                <div className="file-selected">
                  <div className="media-container">
                    {modality === 'image' && <img src={content} alt="Preview" className="media-preview" />}
                    {modality === 'video' && <video src={content} controls className="media-preview" />}
                    {modality === 'audio' && <audio src={content} controls className="media-preview" />}
                    {result && (modality === 'image' || modality === 'video') && (
                      <div className="media-overlay">
                        <div className={`overlay-badge top-right ${result.verdict}`}>
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                          {result.verdict === 'ai_generated' ? 'AI GENERATED' : 'MANUSIA ASLI'}
                        </div>
                        <div className="overlay-bottom">
                          <div className="overlay-score-container">
                            <span className="overlay-score">{result.confidence}%</span>
                            <span className={`overlay-label ${result.verdict}`}>
                              {result.verdict === 'ai_generated' ? 'AI' : 'ASLI'}
                            </span>
                          </div>
                          <div className="overlay-footer-text">
                            <span>Bisa tebak? Aku enggak. →</span>
                            <span className="watermark">authensynth.ai/scan</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <span className="change-prompt">Click to change file</span>
                </div>
              ) : (
                <div className="file-prompt">
                  <UploadIcon />
                  <span className="upload-title">Drag & drop or click to upload</span>
                  <span className="upload-subtitle">Supports {modality} formats</span>
                </div>
              )}
            </div>
          ) : (
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder={`Enter ${modality} content to analyze, or upload a file...`}
              rows={8}
            />
          )}

          <div className="action-buttons">
            <input
              type="file"
              ref={fileInputRef}
              style={{ display: 'none' }}
              accept={getAcceptedFileTypes(modality)}
              onChange={handleFileUpload}
            />
            {modality === 'audio' && (
              <button
                className={`upload-btn record-btn ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
                disabled={loading}
              >
                {isRecording ? 'Stop Recording' : 'Record Audio'}
              </button>
            )}
            <button
              className="upload-btn"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading || isRecording}
            >
              Upload File
            </button>
            <button
              className="analyze-btn"
              onClick={handleAnalyze}
              disabled={loading || isRecording || !content.trim()}
            >
              {loading ? 'Analyzing...' : 'Analyze'}
            </button>
          </div>
        </div>

        {result && (
          <div className="result-section fade-in">
            <div className={`result-card ${result.verdict}`}>
              <div className="result-header">
                <h2>{result.verdict === 'ai_generated' ? 'AI Generated' : 'Human Generated'}</h2>
              </div>

              <div className="confidence-gauge">
                <div className="gauge-label">
                  <span>Confidence Score</span>
                  <span><strong>{result.confidence}%</strong> ({result.band})</span>
                </div>
                <div className="gauge-track">
                  <div className={`gauge-fill ${result.verdict}`} style={{ width: `${result.confidence}%` }}></div>
                </div>
              </div>
            </div>

            {result.conflict_flag && (
              <div className="warning-banner">
                Conflict Detected between Local Model and Reasoning Layer
              </div>
            )}

            {result.adversarial_warning && (
              <div className="warning-banner adv-warning">
                Adversarial Warning: {result.adversarial_warning}
              </div>
            )}

            <div className="explanation-box">
              <h3>Reasoning</h3>
              <p>{result.explanation}</p>
            </div>

            <div className="indicators-grid">
              <div className="indicator-col">
                <h3>Primary Indicators</h3>
                <ul>
                  {result.primary_indicators.map((ind, i) => <li key={i}>{ind}</li>)}
                </ul>
              </div>
              {result.counter_evidence.length > 0 && (
                <div className="indicator-col">
                  <h3>Counter Evidence</h3>
                  <ul>
                    {result.counter_evidence.map((ind, i) => <li key={i}>{ind}</li>)}
                  </ul>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
