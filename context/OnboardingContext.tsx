"use client";

import React, { createContext, useState, useContext, useMemo, ReactNode } from 'react';
import { useRouter } from 'next/navigation'; // Keep router for final navigation

// Define the steps and their order/progress
const STEPS = [
  'welcome',
  'categories',
  'value',
  'notifications',
  'name',
  'metrics',
  // 'wearables', // removed from flow
  // 'documents', // removed from flow
  'email',
  'complete',
] as const;

type OnboardingStep = typeof STEPS[number];

interface OnboardingContextProps {
  currentStep: OnboardingStep;
  progress: number;
  nextStep: () => void;
  prevStep: () => void;
  skipTo: (step: OnboardingStep) => void; // For skip buttons
  completeOnboarding: () => void; // For final step
  // Add state setters if needed for data collection, e.g., setName, setEmail
}

const OnboardingContext = createContext<OnboardingContextProps | undefined>(undefined);

export const OnboardingProvider = ({ children }: { children: ReactNode }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const router = useRouter();

  const currentStep = STEPS[currentStepIndex];
  const progress = useMemo(() => {
    // Calculate progress based on step index, starting from 0%
    // If on first step (index 0), show 0%, otherwise calculate progress
    if (currentStepIndex === 0) return 0;
    
    // Use (current - 1) as numerator to make progress reflect completed steps
    return (currentStepIndex / (STEPS.length - 1)) * 100;
  }, [currentStepIndex]);

  const nextStep = () => {
    if (currentStepIndex < STEPS.length - 1) {
      setCurrentStepIndex(currentStepIndex + 1);
    } else {
       // Handle case where next is called on the last step (should ideally call completeOnboarding)
       completeOnboarding();
    }
  };

  const prevStep = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(currentStepIndex - 1);
    }
    // Optionally handle router.back() if mixing with browser history is desired, but context is cleaner
  };

  const skipTo = (step: OnboardingStep) => {
     const stepIndex = STEPS.indexOf(step);
     if (stepIndex !== -1) {
         setCurrentStepIndex(stepIndex);
     }
  }

  const completeOnboarding = () => {
     // TODO: Add logic to mark onboarding as complete (e.g., API call, local storage)
     console.log("Onboarding Complete!");
     router.push('/dashboard'); // Navigate to main app
  }

  const value = {
    currentStep,
    progress,
    nextStep,
    prevStep,
    skipTo,
    completeOnboarding,
  };

  return (
    <OnboardingContext.Provider value={value}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = (): OnboardingContextProps => {
  const context = useContext(OnboardingContext);
  if (context === undefined) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

// Export step names for convenience
export const ONBOARDING_STEPS = STEPS; 