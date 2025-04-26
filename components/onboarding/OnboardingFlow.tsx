import { useOnboarding } from '@/context/OnboardingContext';
import { WelcomeScreen } from './steps/WelcomeScreen';
import { CategoriesExplanationScreen } from './steps/CategoriesExplanationScreen';
import { ValuePropositionScreen } from './steps/ValuePropositionScreen';
import { NotificationPermissionScreen } from './steps/NotificationPermissionScreen';
import { NameInputScreen } from './steps/NameInputScreen';
import { EmailInputScreen } from './steps/EmailInputScreen';
import { HealthMetricsScreen } from './steps/HealthMetricsScreen';
import { DocumentUploadScreen } from './steps/DocumentUploadScreen';
import { CompletionScreen } from './steps/CompletionScreen';
import { motion, AnimatePresence } from "framer-motion";
import { ProgressBar } from './ProgressBar';
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogIn } from "lucide-react";
import { useEffect, useState } from "react";

export const OnboardingFlow = () => {
  const { currentStep } = useOnboarding();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  
  // This ensures the layout dimensions are calculated after hydration
  useEffect(() => {
    setMounted(true);
  }, []);
  
  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return <WelcomeScreen />;
      case 'categories':
        return <CategoriesExplanationScreen />;
      case 'value':
        return <ValuePropositionScreen />;
      case 'notifications':
        return <NotificationPermissionScreen />;
      case 'name':
        return <NameInputScreen />;
      case 'metrics':
        return <HealthMetricsScreen />;
      case 'email':
        return <EmailInputScreen />;
      case 'complete':
        return <CompletionScreen />;
      default:
        console.warn(`Unknown onboarding step: ${currentStep}`);
        return <WelcomeScreen />;
    }
  };
  
  return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gradient-to-br from-purple-100 via-purple-50 to-white p-4 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-200 via-purple-100 to-transparent opacity-70 z-0"></div>
      
      {/* Login Button */}
      <motion.div 
        className="fixed top-4 right-4 z-50"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.3 }}
      >
        <Button 
          variant="ghost" 
          size="sm" 
          className="bg-white/80 hover:bg-white backdrop-blur-sm text-purple-700 hover:text-purple-900 border border-purple-200 shadow-sm"
          onClick={() => router.push('/login')}
        >
          <LogIn className="h-4 w-4 mr-2" />
          Login
        </Button>
      </motion.div>
      
      <motion.div 
        className="fixed top-0 right-0 h-96 w-96 bg-gradient-to-b from-blue-200 to-transparent rounded-full blur-3xl opacity-20 -z-10"
        animate={{
          x: [0, 10, 0],
          y: [0, 15, 0],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      <motion.div
        className="fixed bottom-0 left-0 h-96 w-96 bg-gradient-to-t from-purple-200 to-transparent rounded-full blur-3xl opacity-20 -z-10"
        animate={{
          x: [0, -10, 0],
          y: [0, -15, 0],
        }}
        transition={{
          duration: 7,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
      
      {/* Main content with fixed height container and progress bar above it */}
      <div className="relative w-full max-w-md z-10 mt-8">
        {/* Progress bar positioned above the content */}
        <div className="mb-4">
          <ProgressBar />
        </div>
        
        {mounted && (
          <div className="relative min-h-[650px] flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                transition={{ 
                  type: "spring",
                  stiffness: 300,
                  damping: 30,
                  duration: 0.3
                }}
                className="z-10 w-full absolute top-0 left-0"
              >
                {renderStep()}
              </motion.div>
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
};
