"use client";

import { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Bell } from 'lucide-react';
import { motion } from 'framer-motion';

export const NotificationPermissionScreen = () => {
  const { nextStep, prevStep } = useOnboarding();
  // TODO: Consider moving notificationPref state to context if needed elsewhere
  const [notificationPref, setNotificationPref] = useState('not-now');

  const handleContinue = () => {
    // TODO: Save preference (e.g., to context state or API call)
    console.log("Notification preference:", notificationPref);
    nextStep();
  };

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
              className="relative p-1 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="p-3 bg-white rounded-full">
                <Bell className="h-8 w-8 text-indigo-500" />
              </div>
            </motion.div>
            <motion.div variants={item}>
              <CardTitle className="text-2xl font-bold text-cyan-600 mb-2">Stay Updated</CardTitle>
            </motion.div>
            <motion.div variants={item}>
              <CardDescription className="text-gray-600">Enable notifications to receive your weekly health summaries</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <motion.div variants={item}>
              <RadioGroup defaultValue="not-now" onValueChange={setNotificationPref} className="space-y-4">
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Label
                    htmlFor="enable-notifications"
                    className={`flex flex-col p-4 rounded-lg border cursor-pointer shadow-sm ${notificationPref === 'yes' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="yes" id="enable-notifications" />
                      <div className="flex-1">
                        <span className="font-semibold block">Yes, enable notifications</span>
                        <span className="text-sm text-gray-500">Get weekly health insights delivered to you</span>
                      </div>
                    </div>
                  </Label>
                </motion.div>
                <motion.div 
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 400, damping: 17 }}
                >
                  <Label
                    htmlFor="disable-notifications"
                    className={`flex flex-col p-4 rounded-lg border cursor-pointer shadow-sm ${notificationPref === 'not-now' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'}`}
                  >
                    <div className="flex items-center space-x-3">
                      <RadioGroupItem value="not-now" id="disable-notifications" />
                      <div className="flex-1">
                        <span className="font-semibold block">Not now</span>
                        <span className="text-sm text-gray-500">You can enable this later in settings</span>
                      </div>
                    </div>
                  </Label>
                </motion.div>
              </RadioGroup>
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
                  onClick={handleContinue} 
                  className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-semibold py-2 px-6"
                >
                  Continue
                </Button>
              </motion.div>
            </motion.div>
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
}; 