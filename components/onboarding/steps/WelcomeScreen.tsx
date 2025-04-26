"use client";

import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { motion } from 'framer-motion';
import Image from "next/image";

export const WelcomeScreen = () => {
  const { nextStep } = useOnboarding();

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3
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
            {/* Logo */}
            <motion.div 
              variants={item}
              className="mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <Image 
                src="/medifold_logo.png"
                alt="Medifold Logo"
                width={120}
                height={120}
                className="object-contain"
              />
            </motion.div>
            {/* Title and Description */}
            <motion.div variants={item}>
              <CardTitle className="text-3xl font-bold text-cyan-600 mb-2">Welcome to Medifold</CardTitle>
            </motion.div>
            <motion.div variants={item}>
              <CardDescription className="text-gray-600 text-lg">Your all-in-one health tracking companion</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8 space-y-8">
            {/* Info Box */}
            <motion.div 
              variants={item}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl text-center shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <p className="text-gray-700 font-medium">Track, organize, and gain insights from your health journey</p>
            </motion.div>
            {/* Navigation Button */}
            <motion.div 
              variants={item}
              whileHover={{ scale: 1.03 }} 
              whileTap={{ scale: 0.98 }}
            >
              <Button 
                onClick={nextStep} 
                className="w-full bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-semibold py-6 rounded-xl text-lg shadow-md"
              >
                Get Started
              </Button>
            </motion.div>
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
};
