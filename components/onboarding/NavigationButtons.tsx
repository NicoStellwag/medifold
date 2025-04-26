
import { useOnboarding } from '@/context/OnboardingContext';

interface NavigationButtonsProps {
  nextDisabled?: boolean;
  hideBack?: boolean;
  skipStep?: () => void;
  nextLabel?: string;
  skipLabel?: string;
}

export const NavigationButtons = ({
  nextDisabled = false,
  hideBack = false,
  skipStep,
  nextLabel = "Continue",
  skipLabel = "Skip for now"
}: NavigationButtonsProps) => {
  const { nextStep, prevStep, isLastStep } = useOnboarding();

  return (
    <div className="mt-8 space-y-3">
      <button
        type="button"
        onClick={nextStep}
        disabled={nextDisabled}
        className={`onboarding-button-primary ${nextDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
        {isLastStep ? "Get Started" : nextLabel}
      </button>
      
      <div className="flex justify-between">
        {!hideBack && (
          <button 
            type="button" 
            onClick={prevStep}
            className="text-medifold-tertiary hover:underline px-3 py-1 rounded-md"
          >
            Back
          </button>
        )}
        
        {skipStep && (
          <button 
            type="button" 
            onClick={skipStep}
            className="text-gray-500 hover:underline ml-auto px-3 py-1 rounded-md"
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  );
};
