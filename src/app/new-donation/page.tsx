"use client";

import Link from "next/link";
import Image from "next/image";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { VoiceTextarea } from "@/components/common/voice-textarea";
import { ProgressStepper } from "@/components/common/progress-stepper";

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

  // Initialize speech recognition with the selected language
  const initSpeechRecognition = (lang: string) => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI = window.SpeechRecognition || window.webkitSpeechRecognition;
      
      if (SpeechRecognitionAPI) {
        // Stop any existing speech recognition
        if (speechRecognition) {
          speechRecognition.stop();
          setIsListening(false);
        }

        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = lang;
        
        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onend = () => {
          setIsListening(false);
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

  // Initialize speech recognition on component mount
  useEffect(() => {
    initSpeechRecognition(language);
    
    // Cleanup on unmount
    return () => {
      if (speechRecognition) {
        speechRecognition.stop();
      }
    };
  }, [language]); // Re-initialize when language changes

  // Add a timer to limit recording to 1 minute
  useEffect(() => {
    let timer: NodeJS.Timeout | null = null;
    
    if (isListening) {
      // Set a timer to stop recording after 1 minute
      timer = setTimeout(() => {
        if (speechRecognition && isListening) {
          speechRecognition.stop();
          // After stopping, generate the summary if there's text
          if (description.trim()) {
            generateSummaryWithGPT(description);
          }
        }
      }, 60000); // 60 seconds = 1 minute
    }
    
    // Clear the timer if listening stops before the time limit
    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [isListening, speechRecognition, description]);

  const toggleListening = () => {
    if (!speechRecognition) {
      alert('Speech recognition is not supported in your browser.');
      return;
    }

    if (isListening) {
      speechRecognition.stop();
      // After stopping, generate the summary if there's text
      if (description.trim()) {
        generateSummaryWithGPT(description);
      }
    } else {
      speechRecognition.start();
      setShowSummary(false);
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
    <div className="flex flex-col min-h-screen bg-white p-6 pt-4">
      {/* Header with back button */}
      <header className="flex items-center mb-6">
        <Link href="/" className="mr-6">
          <div className="text-3xl">←</div>
        </Link>
        <h1 className="text-3xl font-medium">New donation</h1>
      </header>

      {/* Progress stepper */}
      <ProgressStepper 
        steps={4} 
        currentStep={1} 
        className="mb-12" 
      />

      {/* Form section */}
      <main className="flex-1 flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-3xl font-medium">Donation description</h2>
          
          {/* Language toggle */}
          <Button 
            onClick={toggleLanguage}
            variant="outline"
            className="px-3 py-1.5 bg-gray-100 rounded-full text-sm font-medium text-gray-800 hover:bg-gray-200 transition-colors border border-gray-200"
          >
            {language === 'fi-FI' ? '🇫🇮 Suomi' : '🇺🇸 English'}
          </Button>
        </div>
        
        {/* Voice textarea component */}
        <VoiceTextarea
          value={description}
          onChange={setDescription}
          placeholder={language === 'fi-FI' ? "Ruoan määrä ja tyyppi" : "Amount and type of food"}
          isListening={isListening}
          onToggleListening={toggleListening}
          onSummarize={() => setShowSummary(!showSummary)}
          summaryPoints={summaryPoints}
          showSummary={showSummary}
          isSummarizing={isSummarizing}
          language={language}
          className="mb-auto"
        />
        
        {/* Bottom buttons */}
        <div className="space-y-4 mt-6">
          <Button 
            className={`w-full ${description.trim() ? 'bg-green-800' : 'bg-gray-400'} text-white text-xl font-medium py-4 rounded-full transition-colors ${description.trim() ? 'hover:bg-green-900' : ''}`}
            onClick={handleContinue}
            disabled={!description.trim()}
          >
            {language === 'fi-FI' ? 'Jatka' : 'Continue'}
          </Button>
          
          <Button 
            variant="outline"
            className="w-full border-2 border-green-800 text-green-800 text-xl font-medium py-4 rounded-full hover:bg-green-50 transition-colors"
            onClick={() => router.push("/new-donation/step2")}
          >
            {language === 'fi-FI' ? 'Ohita' : 'Skip'}
          </Button>
        </div>
      </main>
    </div>
  );
} 