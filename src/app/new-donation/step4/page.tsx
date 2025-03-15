"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Step4() {
  const router = useRouter();

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 pt-4">
      {/* Header with back button */}
      <header className="flex items-center mb-6">
        <Link href="/new-donation/step3" className="mr-6">
          <div className="text-3xl">←</div>
        </Link>
        <h1 className="text-3xl font-medium">New donation</h1>
      </header>

      {/* Progress stepper - all steps active */}
      <div className="flex gap-2 mb-12">
        <div className="h-2 rounded-full bg-green-800 flex-1"></div>
        <div className="h-2 rounded-full bg-green-800 flex-1"></div>
        <div className="h-2 rounded-full bg-green-800 flex-1"></div>
        <div className="h-2 rounded-full bg-green-800 flex-1"></div>
      </div>

      {/* Form section */}
      <main className="flex-1 flex flex-col">
        {/* Delivery details section */}
        <div className="mb-6">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-medium">Delivery details</h2>
            <button className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          
          <div className="bg-red-50 rounded-xl p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <p className="text-black">Kamppi O3941, Kaisaniemenkatu...</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-4 h-4 bg-gray-400 rounded-full"></div>
              <p className="text-black">Pickup time window 14 - 16</p>
            </div>
          </div>
        </div>
        
        {/* Message for driver section */}
        <div className="mb-auto">
          <div className="flex justify-between items-start mb-2">
            <h2 className="text-xl font-medium">Message for the driver</h2>
            <button className="p-1">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
          </div>
          
          <div className="bg-red-50 rounded-xl p-4">
            <p className="text-black">Park in garages and enter through staff only entrance. Thank you :)</p>
          </div>
        </div>
        
        {/* Continue button */}
        <button 
          className="w-full bg-green-800 text-white text-xl py-4 rounded-full mt-6"
          onClick={() => router.push("/")}
        >
          Continue
        </button>
      </main>
    </div>
  );
} 