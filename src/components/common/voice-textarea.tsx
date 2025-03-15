import React from 'react';
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface VoiceTextareaProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  isListening?: boolean;
  onToggleListening?: () => void;
  onSummarize?: () => void;
  summaryPoints?: string[];
  showSummary?: boolean;
  isSummarizing?: boolean;
  language?: 'en-US' | 'fi-FI';
  className?: string;
}

export function VoiceTextarea({
  value,
  onChange,
  placeholder,
  isListening = false,
  onToggleListening,
  onSummarize,
  summaryPoints = [],
  showSummary = false,
  isSummarizing = false,
  language = 'en-US',
  className
}: VoiceTextareaProps) {
  return (
    <div className={cn("relative", className)}>
      <div className="bg-red-50 rounded-3xl p-6 min-h-64 flex items-start">
        <Textarea
          placeholder={placeholder}
          className="bg-transparent w-full h-full resize-none text-xl outline-none border-none shadow-none min-h-[12rem] focus-visible:ring-0 focus-visible:ring-offset-0"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>
      
      {/* Summary of key points */}
      {showSummary && summaryPoints.length > 0 && (
        <div className="absolute top-4 right-4 left-4 bg-white rounded-xl shadow-md p-4 z-10 border border-green-800/20">
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-medium">
              {language === 'fi-FI' ? 'Yhteenveto (GPT)' : 'Summary (GPT)'}
            </h3>
            <button 
              onClick={onSummarize}
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
              onClick={onSummarize}
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
      
      {/* Microphone button */}
      <div className="absolute bottom-4 right-4">
        <button 
          className={cn(
            "rounded-full p-4 transition-colors shadow-md",
            isListening ? "bg-red-600 animate-pulse" : "bg-green-800 hover:bg-green-900"
          )}
          onClick={onToggleListening}
        >
          <div className="text-white w-8 h-8 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </div>
        </button>
      </div>
      
      {/* Speech status message */}
      {isListening && (
        <div className="absolute bottom-20 right-4 bg-green-100 text-green-800 py-1.5 px-4 rounded-full text-sm font-medium animate-pulse border border-green-300 shadow-sm">
          {language === 'fi-FI' ? 'Kuuntelee...' : 'Listening...'}
        </div>
      )}
    </div>
  );
} 