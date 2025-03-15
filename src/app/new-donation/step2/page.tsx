"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Step2() {
  const router = useRouter();
  const [temperature, setTemperature] = useState(false);
  const [photos, setPhotos] = useState<File[]>([]);
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  // Sample requested items
  const requestedItems = [
    {
      id: 1,
      name: "Meat patties",
      details: "20-25 portions • 1 container",
    },
    {
      id: 2,
      name: "Rice",
      details: "20-25 portions • 2 container",
    },
  ];

  // Handle file uploads
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setPhotos(prev => [...prev, ...newFiles]);
      
      // Create object URLs for previews
      const newUrls = newFiles.map(file => URL.createObjectURL(file));
      setPhotoUrls(prev => [...prev, ...newUrls]);
    }
  };

  // Remove a photo by index
  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
    
    // Revoke the object URL to avoid memory leaks
    URL.revokeObjectURL(photoUrls[index]);
    setPhotoUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col min-h-screen bg-white p-6 pt-4">
      {/* Header with back button */}
      <header className="flex items-center mb-6">
        <Link href="/new-donation" className="mr-6">
          <div className="text-3xl">←</div>
        </Link>
        <h1 className="text-3xl font-medium">New donation</h1>
      </header>

      {/* Progress stepper - two steps active */}
      <div className="flex gap-2 mb-12">
        <div className="h-2 rounded-full bg-green-800 flex-1"></div>
        <div className="h-2 rounded-full bg-green-800 flex-1"></div>
        <div className="h-2 rounded-full bg-red-100 flex-1"></div>
        <div className="h-2 rounded-full bg-red-100 flex-1"></div>
      </div>

      {/* Form section */}
      <main className="flex-1 flex flex-col">
        <h2 className="text-3xl font-medium mb-6">Requested items</h2>
        
        {/* Requested items list */}
        <div className="space-y-4 mb-6">
          {requestedItems.map((item) => (
            <div key={item.id} className="bg-red-50 rounded-xl p-4">
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-3">
                  <div className="w-5 h-5 bg-gray-400 rounded-full"></div>
                  <span className="font-medium text-lg">{item.name}</span>
                </div>
                <button className="p-1">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                  </svg>
                </button>
              </div>
              <div className="ml-8 text-gray-500">{item.details}</div>
            </div>
          ))}
        </div>
        
        {/* Add photos section */}
        <div className="mb-8">
          <h3 className="text-lg font-medium mb-2">Photos</h3>
          
          {/* Photo grid with previews */}
          {photoUrls.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mb-4">
              {photoUrls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img 
                    src={url} 
                    alt={`Upload ${index + 1}`} 
                    className="w-full h-full object-cover rounded-lg"
                  />
                  <button 
                    onClick={() => removePhoto(index)}
                    className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-4 h-4 text-red-500">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {/* Upload button */}
          <label className="border-2 border-dashed border-gray-300 rounded-xl p-4 flex items-center justify-center w-full cursor-pointer hover:bg-gray-50 transition-colors">
            <input 
              type="file" 
              accept="image/*" 
              multiple 
              onChange={handlePhotoUpload} 
              className="hidden" 
            />
            <div className="flex items-center justify-center py-2">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="w-5 h-5 text-green-800 mr-2">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              <span className="text-base">Add photos for better reach</span>
            </div>
          </label>
        </div>
        
        {/* Temperature toggle */}
        <div className="flex justify-between items-center mb-16">
          <span className="text-base">Temperature is below 6 C</span>
          <button 
            className={`w-12 h-6 rounded-full ${temperature ? 'bg-green-800' : 'bg-gray-300'} relative`}
            onClick={() => setTemperature(!temperature)}
          >
            <div className={`w-5 h-5 bg-white rounded-full absolute top-0.5 transition-all ${temperature ? 'right-0.5' : 'left-0.5'}`}></div>
          </button>
        </div>
        
        {/* Continue button */}
        <button 
          className="w-full bg-green-800 text-white text-xl py-4 rounded-full mt-auto"
          onClick={() => router.push("/new-donation/step3")}
        >
          Continue
        </button>
      </main>
    </div>
  );
} 