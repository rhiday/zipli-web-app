import React from 'react';
import { cn } from "@/lib/utils";

interface ProgressStepperProps {
  steps: number;
  currentStep: number;
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export function ProgressStepper({
  steps,
  currentStep,
  className,
  activeColor = 'bg-green-800',
  inactiveColor = 'bg-red-100'
}: ProgressStepperProps) {
  return (
    <div className={cn("flex gap-2", className)}>
      {Array.from({ length: steps }, (_, i) => (
        <div 
          key={i} 
          className={cn(
            "h-2 rounded-full flex-1",
            i < currentStep ? activeColor : inactiveColor
          )}
        />
      ))}
    </div>
  );
} 