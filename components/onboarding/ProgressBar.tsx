import { useOnboarding } from '@/context/OnboardingContext';

export const ProgressBar = () => {
  const { progress } = useOnboarding();
  
  // Debug: Check the progress value
  // console.log('Progress Value:', progress);

  return (
    // Apply styles directly using Tailwind classes
    <div className="h-2 w-full overflow-hidden rounded-full bg-gray-200"> {/* Replicates .progress-bar-container */} 
      <div 
        // Apply indicator styles directly, including gradient
        className="h-full rounded-full bg-gradient-to-r from-blue-500 to-teal-400 transition-all duration-300 ease-in-out" 
        style={{ width: `${progress}%` }}
        // Accessibility attributes remain the same
        aria-valuenow={progress}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
        aria-label="Onboarding progress"
      ></div>
    </div>
  );
};
