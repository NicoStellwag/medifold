"use client";

import { OnboardingProvider } from '@/context/OnboardingContext';
import { OnboardingFlow } from '@/components/onboarding/OnboardingFlow';

// This page now simply sets up the context and renders the flow component
const OnboardingPage = () => {
  return (
    <OnboardingProvider>
      <OnboardingFlow />
    </OnboardingProvider>
  );
};

export default OnboardingPage; 