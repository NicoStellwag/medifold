"use client";

import { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Ruler, Weight, Users, CalendarDays } from 'lucide-react';
import { motion } from 'framer-motion';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export const HealthMetricsScreen = () => {
  const { nextStep, prevStep, skipTo } = useOnboarding();
  // TODO: Consider moving metrics state to context if needed elsewhere
  const [sex, setSex] = useState('');
  const [height, setHeight] = useState('175');
  const [weight, setWeight] = useState('70');
  const [age, setAge] = useState('30');

  const handleContinue = () => {
    // TODO: Save basic info (sex, height, weight, age)
    console.log("Basic Info:", { sex, height, weight, age });
    // Add validation if needed
    nextStep();
  };

  const handleSkip = () => {
    skipTo('email'); // Skip directly to email step
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
          <CardHeader className="text-center p-6 pt-8">
            <motion.div 
              variants={item}
              className="relative p-1 bg-gradient-to-br from-blue-400 to-teal-400 rounded-full mb-6 mx-auto"
            >
              <div className="p-3 bg-white rounded-full">
                <Weight className="h-8 w-8 text-teal-500" />
              </div>
            </motion.div>
            <motion.div variants={item}>
              <CardTitle className="text-2xl font-bold text-cyan-600 mb-2">Basic Health Info</CardTitle>
            </motion.div>
            <motion.div variants={item}>
              <CardDescription className="text-gray-600">Help us personalize your health insights</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8 space-y-5">
            <motion.div 
              variants={item} 
              className="space-y-2 relative"
            >
              <Label htmlFor="sex" className="flex items-center mb-2 text-gray-700">
                <div className="p-1.5 bg-indigo-100 rounded-full mr-2">
                  <Users className="h-5 w-5 text-indigo-600" />
                </div>
                Sex
              </Label>
              <Select value={sex} onValueChange={setSex}>
                <SelectTrigger className="border-gray-300 focus:border-indigo-400 focus:ring-indigo-400">
                  <SelectValue placeholder="Select sex" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>

            <motion.div 
              variants={item} 
              className="space-y-2 relative"
            >
              <Label htmlFor="height" className="flex items-center mb-2 text-gray-700">
                <div className="p-1.5 bg-blue-100 rounded-full mr-2">
                  <Ruler className="h-5 w-5 text-blue-600" />
                </div>
                Height (cm)
              </Label>
              <Input
                id="height"
                type="number"
                placeholder="e.g., 175"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                className="border-gray-300 focus:border-blue-400 focus:ring-blue-400 pl-4"
              />
            </motion.div>

            <motion.div 
              variants={item} 
              className="space-y-2 relative"
            >
              <Label htmlFor="weight" className="flex items-center mb-2 text-gray-700">
                <div className="p-1.5 bg-green-100 rounded-full mr-2">
                  <Weight className="h-5 w-5 text-green-600" />
                </div>
                Weight (kg)
              </Label>
              <Input
                id="weight"
                type="number"
                placeholder="e.g., 70"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                className="border-gray-300 focus:border-green-400 focus:ring-green-400 pl-4"
              />
            </motion.div>

            <motion.div 
              variants={item} 
              className="space-y-2 relative"
            >
              <Label htmlFor="age" className="flex items-center mb-2 text-gray-700">
                <div className="p-1.5 bg-purple-100 rounded-full mr-2">
                  <CalendarDays className="h-5 w-5 text-purple-600" />
                </div>
                Age
              </Label>
              <Input
                id="age"
                type="number"
                placeholder="e.g., 30"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="border-gray-300 focus:border-purple-400 focus:ring-purple-400 pl-4"
              />
            </motion.div>

            {/* Buttons */}
            <motion.div 
              variants={item}
              className="flex justify-between items-center pt-6"
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
                    className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-semibold py-2 px-6"
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