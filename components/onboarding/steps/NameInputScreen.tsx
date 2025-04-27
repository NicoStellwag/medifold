"use client";

import { useState, useEffect } from "react";
import { useOnboarding, ONBOARDING_STEPS } from "@/context/OnboardingContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User } from "lucide-react";
import { motion } from "framer-motion";

export const NameInputScreen = () => {
  const { nextStep, prevStep, skipTo } = useOnboarding();
  const [name, setName] = useState("");

  // Load name from sessionStorage if available
  useEffect(() => {
    const storedName = sessionStorage.getItem("onboarding_name");
    if (storedName) {
      setName(storedName);
    }
  }, []);

  const handleContinue = () => {
    if (name.trim()) {
      // Only proceed if name is entered
      // Save name to sessionStorage
      sessionStorage.setItem("onboarding_name", name.trim());
      nextStep();
    }
  };

  const handleSkip = () => {
    // Clear the name from sessionStorage if skipping
    sessionStorage.removeItem("onboarding_name");
    skipTo("email"); // Assumes 'email' is the next step after name
  };

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24,
      },
    },
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
              className="relative p-1 bg-gradient-to-br from-teal-400 to-green-400 rounded-full mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="p-3 bg-white rounded-full">
                <User className="h-8 w-8 text-teal-500" />
              </div>
            </motion.div>
            <motion.div variants={item}>
              <CardTitle className="text-2xl font-bold text-cyan-600 mb-2">
                Let's Get Personal
              </CardTitle>
            </motion.div>
            <motion.div variants={item}>
              <CardDescription className="text-gray-600">
                Tell us your name so we can personalize your experience
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="name" className="text-gray-700">
                What should we call you?
              </Label>
              <Input
                id="name"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="border-gray-300 focus:border-teal-400 focus:ring-teal-400"
              />
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
              <div className="flex items-center space-x-2">
                <Button
                  variant="link"
                  onClick={handleSkip}
                  className="text-gray-500 hover:text-gray-700 px-4"
                >
                  Skip for now
                </Button>
                <motion.div
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <Button
                    onClick={handleContinue}
                    disabled={!name.trim()}
                    className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-semibold py-2 px-6 disabled:opacity-50"
                  >
                    Continue
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
};
