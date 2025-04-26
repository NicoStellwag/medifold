"use client";

import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';

export const ValuePropositionScreen = () => {
  const { nextStep, prevStep } = useOnboarding();

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
              className="relative p-1 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="p-3 bg-white rounded-full">
                <CalendarDays className="h-8 w-8 text-blue-500" />
              </div>
            </motion.div>
            <motion.div variants={item}>
              <CardTitle className="text-2xl font-bold text-cyan-600 mb-2">Weekly Health Insights</CardTitle>
            </motion.div>
            <motion.div variants={item}>
              <CardDescription className="text-gray-600">Get personalized summaries and actionable health recommendations</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <motion.div 
              variants={item}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl border border-blue-100 shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold text-blue-800">Your Weekly Summary</h3>
                <Badge variant="secondary" className="bg-blue-100 text-blue-700">Every Monday</Badge>
              </div>
              <ul className="list-disc list-inside text-gray-700 space-y-2 pl-2">
                <li>Progress tracking based on your uploads</li>
                <li>Trends in your health metrics</li>
                <li>Personalized recommendations</li>
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
                  onClick={nextStep} 
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