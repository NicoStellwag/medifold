"use client";

import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle } from 'lucide-react';
import { Label } from "@/components/ui/label";
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

export const CompletionScreen = () => {
  const { prevStep, completeOnboarding } = useOnboarding();
  const router = useRouter();

  // Example profile completion - TODO: get this from context or calculate
  const profileCompletion = 100; // Assuming 100% at the final screen for now

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <Card className="w-full max-w-md shadow-xl bg-white rounded-2xl overflow-hidden border-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="relative z-10"
        >
          <CardHeader className="items-center text-center p-6 pt-8">
            <motion.div 
              variants={item}
              className="relative p-1 bg-gradient-to-br from-green-400 to-emerald-400 rounded-full mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="p-3 bg-white rounded-full">
                <CheckCircle className="h-10 w-10 text-green-500" />
              </div>
            </motion.div>
            <motion.div variants={item}>
              <CardTitle className="text-2xl font-bold text-cyan-600 mb-2">You're All Set!</CardTitle>
            </motion.div>
            <motion.div variants={item}>
              <CardDescription className="text-gray-600">Welcome aboard!</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <motion.div variants={item} className="space-y-2 text-center">
              <Label htmlFor="profile-completion" className="text-gray-700">Profile Completion</Label>
              <Progress id="profile-completion" value={profileCompletion} className="w-full h-2 bg-blue-100" />
              <p className="text-xs text-gray-500">{profileCompletion}% Complete</p>
              {/* Conditional message if completion is not 100% */} 
              {profileCompletion < 100 && (
                <p className="text-sm text-gray-600 pt-2">You can complete your profile later in settings</p>
              )}
            </motion.div>

            <motion.div 
              variants={item}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl text-center shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <h3 className="font-semibold text-gray-800 mb-2">What's Next?</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1 pl-2 text-left">
                <li>Check your email to confirm your registration.</li>
                <li>Start uploading your health documents</li>
                <li>Explore the app and customize your settings</li>
              </ul>
            </motion.div>

            {/* Buttons */}
            <motion.div 
              variants={item}
              className="flex justify-between items-center pt-4"
            >
              <Button 
                variant="ghost" 
                onClick={prevStep} 
                className="text-gray-600 hover:text-gray-800"
              >
                Back
              </Button>
              <motion.div
                whileHover={{ scale: 1.03 }} 
                whileTap={{ scale: 0.97 }}
              >
                <Button 
                  onClick={() => router.push('/login')} 
                  className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-semibold py-2 px-6"
                >
                  Get Started
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
}; 