"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Step3() {
  const router = useRouter();
  const [recurring, setRecurring] = useState(false);
  const [selectedDay, setSelectedDay] = useState<string | null>("M");
  const [startHour, setStartHour] = useState("10");
  const [startMinute, setStartMinute] = useState("00");
  const [endHour, setEndHour] = useState("16");
  const [endMinute, setEndMinute] = useState("00");

  const days = [
    { id: "M", label: "M" },
    { id: "Tu", label: "T" },
    { id: "W", label: "W" },
    { id: "Th", label: "T" },
    { id: "F", label: "F" },
    { id: "Sa", label: "Sa" },
    { id: "Su", label: "Su" }
  ];

  const handleDaySelect = (day: string) => {
    setSelectedDay(day);
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 pt-4">
      {/* Header with back button */}
      <header className="flex items-center mb-6">
        <Link href="/new-donation/step2" className="mr-6">
          <div className="text-3xl">←</div>
        </Link>
        <h1 className="text-3xl font-medium">New donation</h1>
      </header>

      {/* Progress stepper - three steps active */}
      <div className="flex gap-2 mb-12">
        <div className="h-2 rounded-full bg-green-800 flex-1"></div>
        <div className="h-2 rounded-full bg-green-800 flex-1"></div>
        <div className="h-2 rounded-full bg-green-800 flex-1"></div>
        <div className="h-2 rounded-full bg-red-100 flex-1"></div>
      </div>

      {/* Form section */}
      <main className="flex-1 flex flex-col">
        <h2 className="text-3xl font-medium mb-6">When should we pick up the donation</h2>
        
        {/* Day picker */}
        <div className="bg-red-50 rounded-2xl p-4 mb-6">
          <div className="flex justify-between">
            {days.map((day) => (
              <button
                key={day.id}
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium ${
                  selectedDay === day.id 
                    ? 'bg-green-800 text-white' 
                    : 'bg-white text-black'
                }`}
                onClick={() => handleDaySelect(day.id)}
              >
                {day.label}
              </button>
            ))}
          </div>
          
          {/* Time range picker */}
          <div className="flex items-center justify-between mt-6">
            {/* Start time */}
            <div className="flex items-center">
              <input
                type="text"
                value={startHour}
                onChange={(e) => setStartHour(e.target.value)}
                className="w-10 h-12 bg-white rounded-lg text-center text-xl"
                maxLength={2}
              />
              <span className="mx-1 text-xl">:</span>
              <input
                type="text"
                value={startMinute}
                onChange={(e) => setStartMinute(e.target.value)}
                className="w-10 h-12 bg-white rounded-lg text-center text-xl"
                maxLength={2}
              />
            </div>
            
            <span className="mx-3 text-xl">-</span>
            
            {/* End time */}
            <div className="flex items-center">
              <input
                type="text"
                value={endHour}
                onChange={(e) => setEndHour(e.target.value)}
                className="w-10 h-12 bg-white rounded-lg text-center text-xl"
                maxLength={2}
              />
              <span className="mx-1 text-xl">:</span>
              <input
                type="text"
                value={endMinute}
                onChange={(e) => setEndMinute(e.target.value)}
                className="w-10 h-12 bg-white rounded-lg text-center text-xl"
                maxLength={2}
              />
            </div>
          </div>
        </div>
        
        {/* Recurring toggle */}
        <div className="flex justify-between items-center mb-16">
          <span className="text-base">Recurring time window for pickup</span>
          <button 
            className={`w-12 h-6 rounded-full ${recurring ? 'bg-green-800' : 'bg-gray-300'} relative`}
            onClick={() => setRecurring(!recurring)}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${recurring ? 'right-0.5' : 'left-0.5'}`}></div>
          </button>
        </div>
        
        {/* Continue button */}
        <button 
          className="w-full bg-green-800 text-white text-xl py-4 rounded-full mt-auto"
          onClick={() => router.push("/new-donation/step4")}
        >
          Continue
        </button>
      </main>
    </div>
  );
} 