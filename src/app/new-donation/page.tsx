"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

// Type declarations for the Web Speech API
interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  error: any;
}

interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  length: number;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
  isFinal: boolean;
}

interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start(): void;
  stop(): void;
  abort(): void;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionEvent) => void;
  onstart: (event: Event) => void;
  onend: (event: Event) => void;
}

// Add type declaration for window
declare global {
  interface Window {
    SpeechRecognition?: new () => SpeechRecognition;
    webkitSpeechRecognition?: new () => SpeechRecognition;
  }
}

export default function NewDonation() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);
  const [language, setLanguage] = useState<'en-US' | 'fi-FI'>('fi-FI'); // Default to Finnish
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0); // State for audio level visualization
  const [timeLeft, setTimeLeft] = useState(60); // Time left in seconds
  
  // References for audio processing
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const microphoneStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Initialize speech recognition with the selected language
  const initSpeechRecognition = (lang: string) => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        // Stop any existing speech recognition
        if (speechRecognition) {
          speechRecognition.stop();
          setIsListening(false);
          stopAudioVisualization();
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;
        
        recognition.onstart = () => {
          setIsListening(true);
          setTimeLeft(60); // Reset timer to 60 seconds
          
          // Set a timeout to stop recording after 1 minute (60000 ms)
          const timeoutId = setTimeout(() => {
            if (recognition) {
              recognition.stop();
              setIsListening(false);
              // Generate summary after auto-stopping
              if (description.trim()) {
                generateSummaryWithGPT(description);
              }
            }
          }, 60000);
          
          // Start countdown timer
          const countdownInterval = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                clearInterval(countdownInterval);
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
          
          // Store the IDs on the recognition object to clear them later
          (recognition as any).timeoutId = timeoutId;
          (recognition as any).countdownInterval = countdownInterval;
          
          // Start audio visualization
          startAudioVisualization();
        };

        recognition.onend = () => {
          setIsListening(false);
          // Clear the timeout if it exists
          if ((recognition as any).timeoutId) {
            clearTimeout((recognition as any).timeoutId);
          }
          // Clear the interval if it exists
          if ((recognition as any).countdownInterval) {
            clearInterval((recognition as any).countdownInterval);
          }
          // Stop audio visualization
          stopAudioVisualization();
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          const transcript = Array.from(event.results)
            .map(result => result[0])
            .map(result => result.transcript)
            .join('');
          
          setDescription(transcript);
        };

        recognition.onerror = (event: SpeechRecognitionEvent) => {
          console.error('Speech recognition error', event.error);
          setIsListening(false);
        };

        setSpeechRecognition(recognition);
      }
    }
  };

  // Clean up on component unmount
  useEffect(() => {
    return () => {
      stopAudioVisualization();
      
      // Stop any active speech recognition when component unmounts
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, []);
  
  // Initialize speech recognition on component mount
  useEffect(() => {
    initSpeechRecognition(language);
    
    // Cleanup on unmount
    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
        stopAudioVisualization();
      }
    };
  }, [language, speechRecognition]); // Re-initialize when language changes

  const toggleListening = () => {
    if (!speechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    try {
      if (isListening) {
        speechRecognition.stop();
        // After stopping, generate the summary if there's text
        if (description.trim()) {
          generateSummaryWithGPT(description);
        }
      } else {
        // Check if the browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
          alert(language === 'fi-FI'
            ? 'Selaimesi ei tue mikrofonin käyttöä.'
            : 'Your browser does not support microphone access.');
          return;
        }
        
        // Start speech recognition
        speechRecognition.start();
        setShowSummary(false);
      }
    } catch (error) {
      console.error('Error toggling speech recognition:', error);
      alert(language === 'fi-FI'
        ? 'Virhe puheentunnistuksessa. Yritä uudelleen.'
        : 'Error with speech recognition. Please try again.');
      setIsListening(false);
    }
  };

  const toggleLanguage = () => {
    setLanguage(prevLang => prevLang === 'en-US' ? 'fi-FI' : 'en-US');
  };

  const handleContinue = () => {
    if (description.trim()) {
      router.push("/new-donation/step2");
    }
  };

  // Function to summarize text using OpenAI GPT
  const generateSummaryWithGPT = async (text: string) => {
    if (!text.trim()) return;
    
    setIsSummarizing(true);
    
    try {
      const response = await fetch('/api/summarize', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          text,
          language
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to summarize text');
      }
      
      const data = await response.json();
      setSummaryPoints(data.bulletPoints);
      setShowSummary(true);
    } catch (error) {
      console.error('Error summarizing text:', error);
      // Fallback to local summary if API fails
      generateLocalSummary(text);
    } finally {
      setIsSummarizing(false);
    }
  };
  
  // Fallback function for local summarization if API fails
  const generateLocalSummary = (text: string) => {
    // Split the text into sentences
    const sentences = text.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0);
    
    // Initialize results array
    let points: string[] = [];
    
    if (sentences.length <= 4) {
      // If we have 4 or fewer sentences, use them all
      points = sentences.map(s => s.trim());
    } else {
      // Extract keywords and important phrases - simplified version
      points = sentences.slice(0, 4).map(s => s.trim());
    }
    
    // Ensure we have exactly 4 points
    while (points.length < 4) {
      points.push("");
    }
    
    // Update state with the summary points
    setSummaryPoints(points);
    setShowSummary(true);
  };

  // Start audio visualization
  const startAudioVisualization = async () => {
    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
        .catch(err => {
          console.error('Microphone permission denied:', err);
          alert(language === 'fi-FI' 
            ? 'Mikrofonin käyttöoikeus evätty. Salli mikrofonin käyttö selaimesi asetuksista.'
            : 'Microphone permission denied. Please allow microphone access in your browser settings.');
          throw err;
        });
        
      microphoneStreamRef.current = stream;
      
      // Create audio context and analyzer
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      audioContextRef.current = audioContext;
      
      // Create analyzer node
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyserRef.current = analyser;
      
      // Connect microphone to analyzer
      const source = audioContext.createMediaStreamSource(stream);
      source.connect(analyser);
      
      // Start visualization loop
      updateAudioVisualization();
    } catch (error) {
      console.error('Error accessing microphone', error);
      // Reset the listening state if there was an error
      setIsListening(false);
      if (speechRecognition) {
        speechRecognition.stop();
      }
    }
  };
  
  // Update audio visualization
  const updateAudioVisualization = () => {
    if (!analyserRef.current) return;
    
    const analyser = analyserRef.current;
    const dataArray = new Uint8Array(analyser.frequencyBinCount);
    
    // Get frequency data
    analyser.getByteFrequencyData(dataArray);
    
    // Calculate average volume level (0-100)
    const average = dataArray.reduce((acc, val) => acc + val, 0) / dataArray.length;
    const normalizedLevel = Math.min(100, Math.max(0, average * 1.5)); // Scale up a bit for better visibility
    
    // Update state with new audio level
    setAudioLevel(normalizedLevel);
    
    // Continue the loop
    animationFrameRef.current = requestAnimationFrame(updateAudioVisualization);
  };
  
  // Stop audio visualization
  const stopAudioVisualization = () => {
    // Cancel animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    // Close audio context
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      audioContextRef.current.close();
      audioContextRef.current = null;
    }
    
    // Stop microphone stream
    if (microphoneStreamRef.current) {
      microphoneStreamRef.current.getTracks().forEach(track => track.stop());
      microphoneStreamRef.current = null;
    }
    
    // Reset audio level
    setAudioLevel(0);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 pt-4">
      {/* Header with back button */}
      <header className="flex items-center mb-6">
        <Link href="/" className="mr-6">
          <div className="text-3xl">←</div>
        </Link>
        <h1 className="text-3xl font-medium">New donation</h1>
      </header>

      {/* Progress stepper */}
      <div className="flex gap-2 mb-12">
        <div className="h-2 rounded-full bg-green-800 flex-1"></div>
        <div className="h-2 rounded-full bg-red-100 flex-1"></div>
        <div className="h-2 rounded-full bg-red-100 flex-1"></div>
        <div className="h-2 rounded-full bg-red-100 flex-1"></div>
      </div>

      {/* Form section */}
      <main className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-medium text-gray-900">Donation description</h2>
          
          {/* Language toggle */}
          <button 
            onClick={toggleLanguage}
            className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-800 hover:bg-gray-200 transition-colors border border-gray-200"
          >
            {language === 'fi-FI' ? '🇫🇮 Suomi' : '🇺🇸 English'}
          </button>
        </div>
        
        {/* Text input area with voice button */}
        <div className="relative mb-auto">
          <div className="bg-red-50 rounded-3xl p-6 min-h-64 flex items-start">
            <textarea 
              placeholder={language === 'fi-FI' ? "Ruoan määrä ja tyyppi" : "Amount and type of food"}
              className="bg-transparent w-full h-full resize-none text-gray-700 text-xl outline-none placeholder:text-gray-500"
              rows={8}
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setShowSummary(false);
              }}
            />
          </div>
          
          {/* Summary of key points */}
          {showSummary && (
            <div className="absolute top-4 right-4 left-4 bg-white rounded-xl shadow-md p-4 z-10 border border-green-800/20">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">
                  {language === 'fi-FI' ? 'Yhteenveto (GPT)' : 'Summary (GPT)'}
                </h3>
                <button 
                  onClick={() => setShowSummary(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ×
                </button>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {summaryPoints.map((point, index) => (
                  <li key={index} className={point ? "text-gray-800" : "text-gray-400"}>
                    {point || (language === 'fi-FI' ? 'Ei tarpeeksi tietoa' : 'Not enough information')}
                  </li>
                ))}
              </ul>
              <div className="mt-3 flex justify-end">
                <button 
                  onClick={() => setShowSummary(false)}
                  className="text-green-800 text-sm font-medium hover:text-green-900"
                >
                  {language === 'fi-FI' ? 'OK' : 'OK'}
                </button>
              </div>
            </div>
          )}
          
          {/* Summarization in progress indicator */}
          {isSummarizing && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white/90 rounded-xl p-4 z-10 flex flex-col items-center shadow-md border border-green-800/20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-800 mb-2"></div>
              <p className="text-sm font-medium text-green-800">
                {language === 'fi-FI' ? 'Tiivistetään...' : 'Summarizing...'}
              </p>
            </div>
          )}
          
          {/* Microphone button with language indicator */}
          <div className="absolute bottom-4 right-4 flex gap-3">
            {/* Preview summary button */}
            <button 
              className={`rounded-full px-4 py-3 transition-colors shadow-sm ${
                !description.trim()
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-gray-300/50' // Disabled
                  : showSummary
                    ? 'bg-green-50 text-green-700 border border-green-300 hover:bg-green-100' // Summary showing
                    : 'bg-gray-200 text-gray-600 border border-gray-300 hover:bg-gray-300' // Ready to preview
              }`}
              onClick={() => {
                // If we're listening, stop the microphone first
                if (isListening && speechRecognition) {
                  speechRecognition.stop();
                }
                
                if (description.trim() && !showSummary) {
                  generateSummaryWithGPT(description);
                } else if (showSummary) {
                  setShowSummary(false);
                }
              }}
              disabled={!description.trim()}
            >
              <div className="flex items-center text-sm font-medium">
                {showSummary ? (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    {language === 'fi-FI' ? 'Sulje' : 'Close'}
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 mr-1">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                    {language === 'fi-FI' ? 'Esikatselu' : 'Preview'}
                  </>
                )}
              </div>
            </button>
            
            {/* Voice input button */}
            <button 
              className={`rounded-full p-4 transition-colors shadow-md ${
                isListening ? 'bg-red-600 animate-pulse' : 'bg-green-800 hover:bg-green-900'
              }`}
              onClick={toggleListening}
            >
              <div className="text-white w-8 h-8 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                </svg>
              </div>
            </button>
          </div>
          
          {/* Speech status message with visualization and timer */}
          {isListening && (
            <div className="absolute bottom-20 right-4 bg-green-100 text-green-800 py-1.5 px-4 rounded-full text-sm font-medium border border-green-300 shadow-sm flex items-center space-x-2">
              {/* Voice level indicator */}
              <div className="relative h-4 w-24 bg-green-200 rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 left-0 h-full bg-green-600 transition-all duration-100"
                  style={{ width: `${audioLevel}%` }}
                ></div>
              </div>
              
              {/* Timer */}
              <span className="whitespace-nowrap">{Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}</span>
              
              {/* Status message */}
              <span>{language === 'fi-FI' ? 'Kuuntelee...' : 'Listening...'}</span>
            </div>
          )}
        </div>
        
        {/* Bottom buttons */}
        <div className="space-y-4 mt-6">
          <button 
            className={`w-full ${description.trim() ? 'bg-green-800' : 'bg-gray-400'} text-white text-xl font-medium py-4 rounded-full transition-colors ${description.trim() ? 'hover:bg-green-900' : ''}`}
            onClick={handleContinue}
            disabled={!description.trim()}
          >
            {language === 'fi-FI' ? 'Jatka' : 'Continue'}
          </button>
          
          <button 
            className="w-full border-2 border-green-800 text-green-800 text-xl font-medium py-4 rounded-full hover:bg-green-50 transition-colors"
            onClick={() => router.push("/new-donation/step2")}
          >
            {language === 'fi-FI' ? 'Ohita' : 'Skip'}
          </button>
        </div>
      </main>
    </div>
  );
} 