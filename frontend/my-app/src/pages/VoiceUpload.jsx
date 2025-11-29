'use client';

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Upload, Mic, StopCircle, Play, Pause, Trash2, 
  CheckCircle, AlertCircle, ArrowLeft, ArrowRight,
  Volume2, FileAudio, Loader
} from "lucide-react";
import "./VoiceUpload.css";

export default function VoiceUpload({ id }) { // Voice memorial ID
  const router = useRouter();
  
  const [uploadMethod, setUploadMethod] = useState(null); // 'file' or 'record'
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const [audioFile, setAudioFile] = useState(null);
  const [audioURL, setAudioURL] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error
  const [errorMessage, setErrorMessage] = useState('');
  
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const audioRef = useRef(null);
  const timerRef = useRef(null);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (audioURL) URL.revokeObjectURL(audioURL);
    };
  }, [audioURL]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm'
      });
      
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioURL(url);
        setAudioFile(audioBlob);
        
        // Stop all tracks
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingTime(0);

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => {
          const newTime = prev + 1;
          // Auto-stop at 3 minutes (180 seconds)
          if (newTime >= 180) {
            stopRecording();
            return 180;
          }
          return newTime;
        });
      }, 1000);

    } catch (error) {
      console.error('Error accessing microphone:', error);
      alert('Could not access microphone. Please check permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }
  };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    const validTypes = ['audio/wav', 'audio/mp3', 'audio/mpeg', 'audio/webm', 'audio/ogg', 'audio/m4a'];
    if (!validTypes.includes(file.type) && !file.name.match(/\.(wav|mp3|webm|ogg|m4a)$/i)) {
      setErrorMessage('Please upload a valid audio file (WAV, MP3, M4A, WebM, or OGG)');
      return;
    }

    // Check file size (max 50MB)
    if (file.size > 50 * 1024 * 1024) {
      setErrorMessage('File size must be less than 50MB');
      return;
    }

    const url = URL.createObjectURL(file);
    setAudioURL(url);
    setAudioFile(file);
    setErrorMessage('');
  };

  const togglePlay = () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
    } else {
      audioRef.current.play();
    }
    setIsPlaying(!isPlaying);
  };

  const deleteAudio = () => {
    if (audioURL) {
      URL.revokeObjectURL(audioURL);
    }
    setAudioURL(null);
    setAudioFile(null);
    setRecordingTime(0);
    setIsPlaying(false);
    setErrorMessage('');
  };

  const uploadVoice = async () => {
    if (!audioFile) return;

    setUploadStatus('uploading');
    const formData = new FormData();
    formData.append('audio_sample', audioFile, 'voice_sample.webm');
    formData.append('tribute_id', id);
    formData.append('duration', recordingTime); // Add duration in seconds

    try {
      const response = await fetch('/api/backend/elevenLabsVoiceClone', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      if (data.success) {
        setUploadStatus('success');
        setTimeout(() => {
          router.push(`/grief-support/voice/${id}/memories`);
        }, 2000);
      } else {
        setUploadStatus('error');
        setErrorMessage(data.error || 'Upload failed. Please try again.');
      }
    } catch (error) {
      console.error('Upload error:', error);
      setUploadStatus('error');
      setErrorMessage('Network error. Please check your connection.');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="voice-upload-page">
      {/* Header */}
      <div className="upload-header">
        <button className="back-button" onClick={() => router.push(`/grief-support/voice/${id}/setup`)}>
          <ArrowLeft size={20} />
          <span>Back to Voice Settings</span>
        </button>

        <div className="upload-progress-indicator">
          <div className="progress-step active">1</div>
          <div className="progress-line"></div>
          <div className="progress-step">2</div>
          <div className="progress-line"></div>
          <div className="progress-step">3</div>
        </div>
      </div>

      {/* Main Content */}
      <div className="upload-container">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="upload-content"
        >
          <h1>Upload Voice Sample</h1>
          <p className="upload-description">
            Choose how you'd like to provide a voice sample. We need at least 30 seconds 
            of clear speech for the best results.
          </p>

          {/* Method Selection */}
          {!uploadMethod && !audioURL && (
            <div className="method-selection">
              <motion.div
                className="method-card"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUploadMethod('record')}
              >
                <div className="method-icon record">
                  <Mic size={48} />
                </div>
                <h3>Record Audio</h3>
                <p>Record directly using your device's microphone</p>
                <ul className="method-features">
                  <li>✓ Quick and easy</li>
                  <li>✓ No file needed</li>
                  <li>✓ Instant preview</li>
                </ul>
              </motion.div>

              <motion.div
                className="method-card"
                whileHover={{ scale: 1.02, y: -4 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setUploadMethod('file')}
              >
                <div className="method-icon upload">
                  <Upload size={48} />
                </div>
                <h3>Upload File</h3>
                <p>Use an existing audio or video file</p>
                <ul className="method-features">
                  <li>✓ Better quality</li>
                  <li>✓ Longer samples</li>
                  <li>✓ WAV, MP3, M4A</li>
                </ul>
              </motion.div>
            </div>
          )}

          {/* Recording Interface */}
          {uploadMethod === 'record' && !audioURL && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="recording-interface"
            >
              <div className="recording-visual">
                <div className={`recording-circle ${isRecording ? 'recording' : ''}`}>
                  {isRecording ? (
                    <StopCircle size={64} />
                  ) : (
                    <Mic size={64} />
                  )}
                </div>
                
                {isRecording && (
                  <div className="sound-waves">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                )}
              </div>

              <div className="recording-time">
                <span className="time-display">{formatTime(recordingTime)}</span>
                <span className="time-limit">/ 3:00 max</span>
              </div>

              <button
                className={`record-button ${isRecording ? 'recording' : ''}`}
                onClick={isRecording ? stopRecording : startRecording}
              >
                {isRecording ? (
                  <>
                    <StopCircle size={24} />
                    <span>Stop Recording</span>
                  </>
                ) : (
                  <>
                    <Mic size={24} />
                    <span>Start Recording</span>
                  </>
                )}
              </button>

              <button className="cancel-button" onClick={() => setUploadMethod(null)}>
                Choose Different Method
              </button>

              {recordingTime > 0 && recordingTime < 30 && !isRecording && (
                <div className="warning-message">
                  <AlertCircle size={20} />
                  <span>Recording should be at least 30 seconds for best results</span>
                </div>
              )}
            </motion.div>
          )}

          {/* File Upload Interface */}
          {uploadMethod === 'file' && !audioURL && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="file-upload-interface"
            >
              <input
                type="file"
                accept="audio/*"
                onChange={handleFileUpload}
                id="audio-file-input"
                style={{ display: 'none' }}
              />
              
              <label htmlFor="audio-file-input" className="file-upload-area">
                <FileAudio size={64} />
                <h3>Drag & drop audio file here</h3>
                <p>or click to browse</p>
                <span className="file-formats">Supports WAV, MP3, M4A, WebM, OGG</span>
              </label>

              <button className="cancel-button" onClick={() => setUploadMethod(null)}>
                Choose Different Method
              </button>

              {errorMessage && (
                <div className="error-message">
                  <AlertCircle size={20} />
                  <span>{errorMessage}</span>
                </div>
              )}
            </motion.div>
          )}

          {/* Audio Preview */}
          {audioURL && uploadStatus === 'idle' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="audio-preview"
            >
              <div className="preview-header">
                <CheckCircle size={32} className="success-icon" />
                <h3>Audio Ready!</h3>
                <p>Preview your audio sample below</p>
              </div>

              <div className="audio-player">
                <button className="play-button" onClick={togglePlay}>
                  {isPlaying ? <Pause size={32} /> : <Play size={32} />}
                </button>
                
                <div className="audio-info">
                  <div className="waveform">
                    <Volume2 size={20} />
                    <div className="waveform-bars">
                      {[...Array(20)].map((_, i) => (
                        <div key={i} className={`bar ${isPlaying ? 'playing' : ''}`}></div>
                      ))}
                    </div>
                  </div>
                  {recordingTime > 0 && (
                    <span className="duration">{formatTime(recordingTime)}</span>
                  )}
                </div>

                <button className="delete-button" onClick={deleteAudio}>
                  <Trash2 size={20} />
                </button>
              </div>

              <audio
                ref={audioRef}
                src={audioURL}
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />

              <div className="preview-actions">
                <button className="secondary-button" onClick={deleteAudio}>
                  <Trash2 size={20} />
                  <span>Re-record</span>
                </button>
                <button className="primary-button" onClick={uploadVoice}>
                  <span>Continue to Next Step</span>
                  <ArrowRight size={20} />
                </button>
              </div>

              {recordingTime > 0 && recordingTime < 30 && (
                <div className="warning-message">
                  <AlertCircle size={20} />
                  <span>
                    Audio is only {recordingTime} seconds. 
                    We recommend at least 30 seconds for better quality.
                  </span>
                </div>
              )}
            </motion.div>
          )}

          {/* Uploading State */}
          {uploadStatus === 'uploading' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="upload-status uploading"
            >
              <Loader size={64} className="spinner-icon" />
              <h3>Creating Voice Clone...</h3>
              <p>This may take a minute. Please don't close this page.</p>
              <div className="upload-progress-bar">
                <div className="upload-progress-fill"></div>
              </div>
            </motion.div>
          )}

          {/* Success State */}
          {uploadStatus === 'success' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="upload-status success"
            >
              <CheckCircle size={64} className="success-icon" />
              <h3>Voice Clone Created Successfully!</h3>
              <p>Redirecting to add memories and personality...</p>
            </motion.div>
          )}

          {/* Error State */}
          {uploadStatus === 'error' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="upload-status error"
            >
              <AlertCircle size={64} className="error-icon" />
              <h3>Upload Failed</h3>
              <p>{errorMessage}</p>
              <button className="retry-button" onClick={() => setUploadStatus('idle')}>
                Try Again
              </button>
            </motion.div>
          )}
        </motion.div>

        {/* Tips Sidebar */}
        <div className="tips-sidebar">
          <h3>📌 Tips for Best Results</h3>
          
          <div className="tip-card">
            <h4>✓ Quality Matters</h4>
            <p>Use a quiet environment with minimal background noise</p>
          </div>

          <div className="tip-card">
            <h4>✓ Natural Speech</h4>
            <p>Normal speaking voice - not shouting or whispering</p>
          </div>

          <div className="tip-card">
            <h4>✓ Varied Content</h4>
            <p>Include different sentences and emotions</p>
          </div>

          <div className="tip-card">
            <h4>✓ Duration</h4>
            <p>1-3 minutes is ideal, minimum 30 seconds</p>
          </div>

          <div className="tip-card">
            <h4>✓ Clear Audio</h4>
            <p>Speak directly into microphone for clarity</p>
          </div>
        </div>
      </div>
    </div>
  );
}
