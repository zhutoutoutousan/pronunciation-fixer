import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';

interface RecordAudioProps {
  onRecordingComplete: (blob: Blob) => void;
  onRecordingStart: () => void;
  disabled: boolean;
}

export function RecordAudio({ onRecordingComplete, onRecordingStart, disabled }: RecordAudioProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const timerRef = useRef<NodeJS.Timeout>();
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        onRecordingComplete(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      timerRef.current = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
    } catch (err) {
      console.error('Error accessing microphone:', err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      clearInterval(timerRef.current);
      setRecordingTime(0);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    if (isRecording) {
      // Stop recording after MAX_DURATION
      const timeout = setTimeout(() => {
        if (isRecording) {
          stopRecording();
          alert(
            'Recording stopped at 30 seconds.\n\n' +
            'For longer recordings, please contact tian.shao@namelos.xyz for sponsorship options.'
          );
        }
      }, 30000);

      return () => clearTimeout(timeout);
    }
  }, [isRecording]);

  return (
    <div className="border-4 border-black p-6 text-center bg-white mt-4">
      <h3 className="text-2xl font-black mb-4 text-black uppercase">
        Or Record Your Voice
      </h3>
      <motion.button
        onClick={isRecording ? stopRecording : startRecording}
        className={`w-full py-4 text-white text-xl font-bold uppercase transform hover:-translate-y-1 transition-transform ${
          isRecording ? 'bg-red-600 hover:bg-red-700' : 'bg-black hover:bg-gray-900'
        }`}
        whileTap={{ scale: 0.98 }}
      >
        {isRecording ? (
          <>
            Stop Recording ({formatTime(recordingTime)})
            <span className="ml-2 animate-pulse">●</span>
          </>
        ) : (
          'Start Recording'
        )}
      </motion.button>
    </div>
  );
} 