'use client';

import React from 'react';
import { useState, useRef } from 'react';
import { Title } from './components/Title';
import { InputForm } from './components/InputForm';
import { Results } from './components/Results';
import { motion } from 'framer-motion';

export default function Home() {
  const [audioFile, setAudioFile] = useState<File | null>(null);
  const [targetSentence, setTargetSentence] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [results, setResults] = useState<{
    goodWords: Array<{ word: string; ipa: string }>;
    improveWords: Array<{ word: string; ipa: string }>;
    spokenText: string;
    ipa: string;
    tips: string[];
  }>({
    goodWords: [],
    improveWords: [],
    spokenText: '',
    ipa: '',
    tips: [],
  });
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [inputMethod, setInputMethod] = useState<string | null>(null);

  const cleanupCurrentSession = () => {
    console.log('Cleaning up current session...');
    // Stop any ongoing audio playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    
    // Reset file input
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }

    // Reset states
    setAudioFile(null);
    setIsAnalyzing(false);
    setIsRecording(false);
    // Don't reset input method here, let InputForm handle it
  };

  const checkAudioDuration = (file: File): Promise<number> => {
    return new Promise((resolve, reject) => {
      const audio = new Audio();
      const url = URL.createObjectURL(file);
      
      audio.addEventListener('loadedmetadata', () => {
        URL.revokeObjectURL(url);
        resolve(audio.duration);
      });

      audio.addEventListener('error', () => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load audio file'));
      });

      audio.src = url;
    });
  };

  const MAX_DURATION = 30; // 30 seconds

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const duration = await checkAudioDuration(file);
        console.log('Audio duration:', duration, 'seconds');

        if (duration > MAX_DURATION) {
          alert(
            `This audio file is ${Math.round(duration)} seconds long.\n\n` +
            'Free tier is limited to 30 seconds.\n\n' +
            'For longer recordings, please contact tian.shao@namelos.xyz for sponsorship options.'
          );
          // Reset file input
          e.target.value = '';
          return;
        }

        cleanupCurrentSession();
        setAudioFile(file);
      } catch (error) {
        console.error('Error checking audio duration:', error);
        alert('Failed to process audio file. Please try again with a different file.');
        e.target.value = '';
      }
    }
  };

  const handleTargetSentenceChange = (value: string) => {
    if (results.spokenText) {
      // If there are existing results, confirm before changing
      if (window.confirm('Changing the target sentence will clear the current analysis. Continue?')) {
        cleanupCurrentSession();
        setResults({
          goodWords: [],
          improveWords: [],
          spokenText: '',
          ipa: '',
          tips: [],
        });
      } else {
        // Revert the textarea value
        setTargetSentence(targetSentence);
        return;
      }
    }
    setTargetSentence(value);
  };

  const analyzePronunciation = async () => {
    if (!audioFile) return;
    console.log('Starting pronunciation analysis...');
    setIsAnalyzing(true);

    const recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';
    console.log('Speech recognition configured');

    // Add retry counter for network errors
    let networkRetries = 0;
    const MAX_NETWORK_RETRIES = 3;

    try {
      // Create a blob URL from the audio file
      const audioUrl = URL.createObjectURL(audioFile);
      audioRef.current = new Audio(audioUrl);
      console.log('Audio URL created');

      // Wait for audio to be properly loaded
      await new Promise<void>((resolve, reject) => {
        if (!audioRef.current) return reject('No audio element');

        // Handle audio loading
        const handleCanPlay = () => {
          console.log('Audio is ready to play');
          resolve();
        };

        // Handle loading errors
        const handleError = (e: ErrorEvent) => {
          console.error('Audio loading error:', e);
          reject(new Error('Failed to load audio file'));
        };

        audioRef.current.addEventListener('canplay', handleCanPlay);
        audioRef.current.addEventListener('error', handleError);

        // Cleanup listeners if loading takes too long
        const timeout = setTimeout(() => {
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
          audioRef.current?.removeEventListener('error', handleError);
          reject(new Error('Audio loading timeout'));
        }, 5000);

        // Cleanup function
        const cleanup = () => {
          clearTimeout(timeout);
          audioRef.current?.removeEventListener('canplay', handleCanPlay);
          audioRef.current?.removeEventListener('error', handleError);
        };

        // Add cleanup to both success and error paths
        audioRef.current.addEventListener('canplay', () => cleanup());
        audioRef.current.addEventListener('error', () => cleanup());
      });

      const playAudioAndRecognize = new Promise<string>((resolve, reject) => {
        if (!audioRef.current) return reject('No audio element');

        let transcriptParts: string[] = [];
        let isAudioFinished = false;
        let attempts = 0;
        const maxAttempts = 3;
        let recognitionTimeout: NodeJS.Timeout;

        recognition.onresult = async (event) => {
          console.log('Recognition result received');
          const lastResult = event.results[event.results.length - 1];
          if (lastResult.isFinal) {
            const newText = lastResult[0].transcript.toLowerCase();
            console.log('Partial speech recognized:', newText);
            transcriptParts.push(newText);
            
            // Only resolve if audio has finished playing
            if (isAudioFinished) {
              const finalText = transcriptParts.join(' ');
              console.log('Final speech recognized:', finalText);
              clearTimeout(recognitionTimeout);
              recognition.stop();
              resolve(finalText);
            }
          }
        };

        recognition.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          
          // Handle network errors specifically
          if (event.error === 'network') {
            if (networkRetries < MAX_NETWORK_RETRIES) {
              networkRetries++;
              console.log(`Retrying after network error (${networkRetries}/${MAX_NETWORK_RETRIES})...`);
              
              // Pause audio and reset position
              if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.currentTime = 0;
              }

              // Wait a moment before retrying
              setTimeout(() => {
                if (audioRef.current) {
                  try {
                    recognition.start();
                    audioRef.current.play();
                  } catch (error) {
                    console.error('Failed to restart recognition:', error);
                    reject(new Error('Failed to restart after network error'));
                  }
                }
              }, 2000);
              
              return; // Don't reject yet, we're retrying
            }
          }

          // Handle other errors
          if (event.error === 'no-speech' && attempts < maxAttempts) {
            attempts++;
            console.log(`Retrying recognition (attempt ${attempts}/${maxAttempts})...`);
            transcriptParts = []; // Clear previous attempts
            setTimeout(() => {
              if (audioRef.current) {
                audioRef.current.currentTime = 0;
                audioRef.current.play();
              }
            }, 500);
          } else {
            const errorMessage = event.error === 'network' 
              ? 'Network connection failed. Please check your internet connection and try again.'
              : event.error;
            reject(new Error(errorMessage));
          }
        };

        recognition.onend = () => {
          console.log('Recognition ended');
          if (!isAudioFinished) {
            console.log('Recognition ended before audio finished, restarting...');
            try {
              recognition.start();
            } catch (error) {
              console.error('Failed to restart recognition:', error);
            }
          } else if (transcriptParts.length === 0) {
            reject(new Error('Failed to recognize speech. Please try again.'));
          }
        };

        // Start recognition when audio starts playing
        audioRef.current.onplay = () => {
          console.log('Audio started playing');
          isAudioFinished = false;
          transcriptParts = []; // Reset transcript parts
          try {
            recognition.start();
            console.log('Recognition started');
          } catch (error) {
            console.error('Failed to start recognition:', error);
            reject(new Error('Failed to start speech recognition'));
          }
        };

        // Wait for audio to finish before finalizing recognition
        audioRef.current.onended = () => {
          console.log('Audio playback ended');
          isAudioFinished = true;
          
          // Give recognition extra time to process the final part
          recognitionTimeout = setTimeout(() => {
            if (transcriptParts.length === 0) {
              console.log('No transcript received after audio ended, stopping recognition...');
              recognition.stop();
              reject(new Error('No speech detected in the recording. Please try again.'));
            } else {
              // If we have transcripts, stop recognition and resolve
              const finalText = transcriptParts.join(' ');
              console.log('Final speech recognized:', finalText);
              recognition.stop();
              resolve(finalText);
            }
          }, 2000); // 2 second buffer after audio ends
        };

        // Add better error handling for audio playback
        audioRef.current.onerror = (e) => {
          const error = e as ErrorEvent;
          console.error('Audio playback error:', error);
          reject(new Error(`Audio playback failed: ${error.message}`));
        };

        // Start playing with a small delay to ensure recognition is ready
        setTimeout(() => {
          if (!audioRef.current) return reject('No audio element');
          
          audioRef.current.play().catch(error => {
            console.error('Audio play error:', error);
            reject(new Error('Failed to play audio'));
          });
        }, 500);

        // Set overall timeout
        const timeout = setTimeout(() => {
          if (transcriptParts.length === 0) {
            reject(new Error('Recognition timeout - no speech detected'));
          }
        }, 30000);
      });

      console.log('Waiting for speech recognition...');
      const spokenText = await playAudioAndRecognize;

      console.log('Calling AI analysis API...');
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          targetText: targetSentence || '',
          spokenText,
        }),
      });

      if (!response.ok) {
        throw new Error('Analysis failed');
      }

      const analysisData = await response.json();
      console.log('Analysis received:', analysisData);
      
      if (analysisData.targetText && !targetSentence) {
        setTargetSentence(analysisData.targetText);
      }
      
      setResults({
        goodWords: analysisData.content.goodPronunciation || [],
        improveWords: analysisData.content.needsImprovement || [],
        spokenText,
        ipa: analysisData.content.ipa || '',
        tips: analysisData.content.tips || [],
      });
      console.log('Results updated');

    } catch (error) {
      console.error('Error during analysis:', error);
      const errorMessage = error instanceof Error 
        ? error.message 
        : typeof error === 'string' 
          ? error 
          : 'Failed to analyze pronunciation. Please try again.';
      
      // Show more user-friendly error message
      alert(
        error instanceof Error && error.message.includes('network')
          ? 'Network connection failed. Please check your internet connection and try again.'
          : errorMessage
      );
      throw error;
    } finally {
      setIsAnalyzing(false);
      if (audioRef.current) {
        URL.revokeObjectURL(audioRef.current.src);
        audioRef.current.pause();
        audioRef.current = null;
      }
      console.log('Analysis completed, resources cleaned up');
    }
  };

  const handleRecordingComplete = async (audioBlob: Blob) => {
    console.log('Recording completed, creating file...');
    // Don't cleanup here as it resets the audio file
    const file = new File([audioBlob], 'recording.wav', { type: 'audio/wav' });
    setAudioFile(file);
    console.log('File created, starting analysis...');
    
    // Wait for state to update
    await new Promise(resolve => setTimeout(resolve, 0));
    
    try {
      await analyzePronunciation();
    } catch (error) {
      console.error('Analysis failed:', error);
      cleanupCurrentSession(); // Only cleanup on error
    }
  };

  const handleReset = () => {
    // Confirm before resetting
    if (window.confirm('Are you sure you want to reset? This will clear all current results.')) {
      cleanupCurrentSession();
      setTargetSentence('');
      setResults({
        goodWords: [],
        improveWords: [],
        spokenText: '',
        ipa: '',
        tips: [],
      });
    }
  };

  return (
    <main className="min-h-screen w-screen bg-black overflow-y-auto py-8">
      <div className="w-[95%] max-w-7xl mx-auto">
        <div className="flex gap-8 items-start">
          {/* Title Section */}
          <div className="w-1/3 sticky top-8">
            <Title />
          </div>

          {/* Form and Results Section */}
          <div className="flex-1">
            <InputForm 
              targetSentence={targetSentence}
              setTargetSentence={handleTargetSentenceChange}
              handleFileUpload={handleFileUpload}
              analyzePronunciation={analyzePronunciation}
              audioFile={audioFile}
              isAnalyzing={isAnalyzing}
              onRecordingComplete={handleRecordingComplete}
              isRecording={isRecording}
              onCleanup={cleanupCurrentSession}
              onReset={handleReset}
              hasResults={!!results.spokenText}
            />

            {results.spokenText && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
              >
                <Results 
                  goodWords={results.goodWords}
                  improveWords={results.improveWords}
                  spokenText={results.spokenText}
                  ipa={results.ipa}
                  tips={results.tips}
                />
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

