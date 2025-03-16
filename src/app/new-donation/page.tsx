"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";

export default function NewDonation() {
  const router = useRouter();
  const [description, setDescription] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [language, setLanguage] = useState<'en-US' | 'fi-FI'>('fi-FI'); // Default to Finnish
  const [summaryPoints, setSummaryPoints] = useState<string[]>([]);
  const [showSummary, setShowSummary] = useState(false);
  const [isSummarizing, setIsSummarizing] = useState(false);
  
  // For audio recording
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const [recordingError, setRecordingError] = useState<string | null>(null);

  // Start recording audio
  const startRecording = async () => {
    try {
      // Reset any previous errors
      setRecordingError(null);
      audioChunksRef.current = [];
      
      // Get audio permission and start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };
      
      mediaRecorder.onstop = async () => {
        setIsRecording(false);
        
        if (audioChunksRef.current.length > 0) {
          await processAudio();
        }
      };
      
      // Set a timer to stop recording after 1 minute
      setTimeout(() => {
        if (mediaRecorder.state === 'recording') {
          mediaRecorder.stop();
        }
      }, 60000); // 60 seconds
      
      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      setIsRecording(true);
      
    } catch (error) {
      console.error('Error starting recording:', error);
      setRecordingError('Could not access microphone. Please check permissions.');
      setIsRecording(false);
    }
  };

  // Stop recording audio
  const stopRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }
  };

  // Process the recorded audio
  const processAudio = async () => {
    if (audioChunksRef.current.length === 0) return;
    
    try {
      // Create a blob from the audio chunks
      const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
      
      // Create a FormData object to send the audio file
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', language);
      
      // Send the audio to our API endpoint
      const response = await fetch('/api/speech-to-text', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to transcribe audio');
      }
      
      const data = await response.json();
      
      // Update the description with the transcribed text
      if (data.text) {
        setDescription(prev => prev ? `${prev} ${data.text}` : data.text);
        
        // Generate summary automatically
        if (data.text.trim()) {
          generateSummaryWithGPT(data.text.trim());
        }
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      setRecordingError('Error processing the recording. Please try again.');
    }
  };

  // Toggle recording state
  const toggleRecording = () => {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
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

  return (
    <main className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 p-4 flex items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="text-green-800 mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </Link>
          <h1 className="text-xl font-medium text-gray-800">
            {language === 'fi-FI' ? 'Uusi Lahjoitus' : 'New Donation'}
          </h1>
        </div>
        <button
          onClick={toggleLanguage}
          className="flex items-center justify-center rounded-full w-8 h-8 bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
        >
          {language === 'fi-FI' ? '🇫🇮' : '🇺🇸'}
        </button>
      </header>

      <div className="flex-grow flex flex-col p-5 pb-24">
        {/* Step indicator */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className="w-8 h-8 bg-green-800 text-white rounded-full flex items-center justify-center font-medium">1</div>
              <span className="text-xs mt-1 text-green-800 font-medium">
                {language === 'fi-FI' ? 'Kuvaus' : 'Description'}
              </span>
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex flex-col items-center">
                <div className="w-8 h-8 bg-gray-200 text-gray-400 rounded-full flex items-center justify-center font-medium">{i + 2}</div>
                <span className="text-xs mt-1 text-gray-400">
                  {i === 0 && (language === 'fi-FI' ? 'Tiedot' : 'Details')}
                  {i === 1 && (language === 'fi-FI' ? 'Kuva' : 'Photo')}
                  {i === 2 && (language === 'fi-FI' ? 'Vahvista' : 'Confirm')}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
            <div className="h-full bg-green-800 rounded-full" style={{ width: '25%' }}></div>
          </div>
        </div>
        
        <h2 className="text-2xl font-semibold mb-3 text-gray-800">
          {language === 'fi-FI' ? 'Kerro ruoasta' : 'Describe the food'}
        </h2>
        <p className="text-gray-600 mb-6">
          {language === 'fi-FI' 
            ? 'Kuvaile, mitä ruokaa lahjoitat. Voit puhua tai kirjoittaa.' 
            : 'Describe what food you are donating. You can speak or type.'}
        </p>
        
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
          
          {/* Error message for recording */}
          {recordingError && (
            <div className="mt-2 text-sm text-red-600 px-2">
              <p>{recordingError}</p>
            </div>
          )}
          
          {/* Recording status message */}
          <div className="mt-2 text-sm text-gray-500 px-2 md:hidden">
            <p>
              {language === 'fi-FI' 
                ? "Paina mikrofoni-kuvaketta aloittaaksesi nauhoituksen. Nauhoitus loppuu automaattisesti minuutin jälkeen."
                : "Tap the microphone icon to start recording. Recording will automatically stop after one minute."}
            </p>
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
          
          {/* Controls section with proper spacing */}
          <div className="mt-4 space-y-4">
            {/* Microphone and preview buttons in a fixed container */}
            <div className="flex justify-end gap-3 mt-4">
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
                  // If currently recording, stop first
                  if (isRecording) {
                    stopRecording();
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
                  isRecording ? 'bg-red-600 animate-pulse' : 'bg-green-800 hover:bg-green-900'
                }`}
                onClick={toggleRecording}
              >
                <div className="text-white w-8 h-8 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
                  </svg>
                </div>
              </button>
            </div>
            
            {/* Recording status message */}
            <div className="flex justify-center mt-2">
              {isRecording && (
                <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full animate-pulse">
                  {language === 'fi-FI' ? 'Nauhoittaa...' : 'Recording...'}
                </span>
              )}
            </div>
          </div>
        </div>
        
        {/* Footer with navigation buttons */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 flex justify-between">
          <Link 
            href="/"
            className="px-6 py-2.5 rounded-full border border-gray-300 text-gray-600 font-medium hover:bg-gray-50 transition-colors"
          >
            {language === 'fi-FI' ? 'Peruuta' : 'Cancel'}
          </Link>
          <button
            className={`px-6 py-2.5 rounded-full font-medium transition-colors ${
              description.trim()
                ? 'bg-green-800 text-white hover:bg-green-900'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
            onClick={handleContinue}
            disabled={!description.trim()}
          >
            {language === 'fi-FI' ? 'Jatka' : 'Continue'}
          </button>
        </div>
      </div>
    </main>
  );
} 