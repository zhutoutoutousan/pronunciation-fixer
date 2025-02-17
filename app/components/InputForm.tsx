import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { RecordAudio } from './RecordAudio';

interface InputFormProps {
  targetSentence: string;
  setTargetSentence: (value: string) => void;
  handleFileUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
  analyzePronunciation: () => void;
  audioFile: File | null;
  isAnalyzing: boolean;
  onRecordingComplete: (audioBlob: Blob) => void;
  isRecording: boolean;
  onCleanup: () => void;
  onReset: () => void;
  hasResults: boolean;
}

export function InputForm({
  targetSentence,
  setTargetSentence,
  handleFileUpload,
  analyzePronunciation,
  audioFile,
  isAnalyzing,
  onRecordingComplete,
  isRecording,
  onCleanup,
  onReset,
  hasResults
}: InputFormProps) {
  const [inputMethod, setInputMethod] = useState<'upload' | 'record' | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hasFile = e.target.files && e.target.files.length > 0;
    if (hasFile) {
      setInputMethod('upload');
      handleFileUpload(e);
    } else {
      setInputMethod(null);
      onCleanup();
    }
  };

  // Update input method when audioFile changes
  useEffect(() => {
    if (audioFile) {
      setInputMethod('upload');
    } else {
      // Only reset input method if we're not recording
      if (!isRecording) {
        setInputMethod(null);
        // Reset file input
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  }, [audioFile, isRecording]);

  const handleRecordingStart = () => {
    setInputMethod('record');
    onCleanup();
  };

  const playStandardPronunciation = () => {
    if (!targetSentence) return;
    
    const utterance = new SpeechSynthesisUtterance(targetSentence);
    utterance.lang = 'en-US';
    utterance.rate = 0.8; // Slightly slower for clarity
    speechSynthesis.speak(utterance);
  };

  return (
    <motion.div 
      className="bg-white p-6 border-4 border-black"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="mb-6">
        <p className="text-xl font-bold text-black mb-4">Target Sentence (Optional)</p>
        <div className="flex gap-4">
          <textarea 
            value={targetSentence}
            onChange={(e) => setTargetSentence(e.target.value)}
            placeholder="Enter the sentence you want to practice, or let AI reconstruct your speech"
            className="flex-1 p-4 text-xl border-4 border-black focus:outline-none focus:ring-2 focus:ring-gray-500 text-black"
            rows={3}
          />
          {targetSentence && (
            <motion.button
              onClick={playStandardPronunciation}
              className="px-4 bg-black text-white border-4 border-black hover:bg-gray-800"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              🔊 Listen
            </motion.button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        <div className={`p-4 border-4 ${inputMethod === 'upload' ? 'border-blue-500' : 'border-black'}`}>
          <p className="text-xl font-bold text-black mb-2">Upload Audio File</p>
          <p className="text-sm text-gray-600 mb-4">
            Max duration: 30 seconds. For longer recordings, please contact for sponsorship.
          </p>
          <input 
            ref={fileInputRef}
            type="file" 
            accept=".mp3,.m4a,.wav"
            onChange={handleFileInputChange}
            disabled={isRecording}
            className="mb-6 text-xl file:mr-4 file:py-2 file:px-4 file:border-4 file:border-black file:text-lg file:font-bold file:bg-white hover:file:bg-gray-100 file:text-black text-black disabled:opacity-50"
          />
          {audioFile && inputMethod === 'upload' && (
            <p className="text-green-600 font-medium">
              File uploaded: {audioFile.name}
            </p>
          )}
        </div>

        <div className={`p-4 border-4 ${inputMethod === 'record' ? 'border-blue-500' : 'border-black'}`}>
          <p className="text-xl font-bold text-black mb-4">Record Your Voice</p>
          <RecordAudio 
            onRecordingComplete={onRecordingComplete}
            onRecordingStart={handleRecordingStart}
            disabled={!!audioFile}
          />
        </div>
      </div>

      {!audioFile && !isRecording && (
        <motion.div 
          className="mt-4 p-4 bg-red-100 border-4 border-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg text-black">
            <span className="font-bold">Required:</span> Please choose one method: upload an audio file or record your voice.
          </p>
        </motion.div>
      )}

      {!targetSentence && audioFile && (
        <motion.div 
          className="mt-4 p-4 bg-yellow-100 border-4 border-black"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          <p className="text-lg text-black">
            <span className="font-bold">Note:</span> No target sentence provided. 
            AI will attempt to reconstruct your speech to create a target sentence for comparison.
          </p>
        </motion.div>
      )}

      <div className="flex gap-4 mt-6">
        <motion.button 
          onClick={analyzePronunciation}
          disabled={!audioFile || isAnalyzing}
          className={`flex-1 py-4 text-white text-xl font-bold uppercase transform hover:-translate-y-1 transition-transform ${
            !audioFile 
              ? 'bg-gray-300 cursor-not-allowed' 
              : isAnalyzing 
                ? 'bg-gray-500 cursor-wait' 
                : 'bg-black hover:bg-gray-900'
          }`}
          whileTap={audioFile && !isAnalyzing ? { scale: 0.98 } : undefined}
        >
          {isAnalyzing 
            ? '>> Analyzing...' 
            : !audioFile 
              ? '>> Record or Upload First'
              : '>> Analyze Pronunciation'
          }
        </motion.button>

        {hasResults && (
          <motion.button 
            onClick={onReset}
            className="px-8 py-4 bg-red-600 text-white text-xl font-bold uppercase hover:bg-red-700 transform hover:-translate-y-1 transition-transform"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            ↺ Reset
          </motion.button>
        )}
      </div>
    </motion.div>
  );
} 