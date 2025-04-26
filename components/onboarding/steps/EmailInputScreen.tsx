"use client";

import { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Mail, Lock, UserPlus } from 'lucide-react';
import { motion } from 'framer-motion';

export const EmailInputScreen = () => {
  const { nextStep, prevStep } = useOnboarding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Basic email validation regex
  const isValidEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleContinue = () => {
    setError(null);
    
    if (!isValidEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    // TODO: Actual registration implementation with Supabase or other auth provider
    console.log("Registration data:", { email, password });
    
    // For now, just proceed with onboarding
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
              className="relative p-1 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="p-3 bg-white rounded-full">
                <UserPlus className="h-8 w-8 text-blue-500" />
              </div>
            </motion.div>
            <motion.div variants={item}>
              <CardTitle className="text-2xl font-bold text-cyan-600 mb-2">Create Your Account</CardTitle>
            </motion.div>
            <motion.div variants={item}>
              <CardDescription className="text-gray-600">Register to start tracking your health journey</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 flex items-center">
                <Mail className="h-4 w-4 mr-2 text-gray-500" />
                Email address
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
              />
            </motion.div>

            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-gray-500" />
                Password
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
              />
            </motion.div>

            <motion.div variants={item} className="space-y-2">
              <Label htmlFor="confirm-password" className="text-gray-700 flex items-center">
                <Lock className="h-4 w-4 mr-2 text-gray-500" />
                Confirm Password
              </Label>
              <Input
                id="confirm-password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="border-gray-300 focus:border-blue-400 focus:ring-blue-400"
              />
            </motion.div>

            {error && (
              <motion.p 
                variants={item}
                className="text-sm text-red-600 bg-red-50 p-2 rounded-md border border-red-100"
              >
                {error}
              </motion.p>
            )}

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
                  disabled={loading || !email || !password || !confirmPassword}
                  className="bg-gradient-to-r from-blue-500 to-teal-400 hover:from-blue-600 hover:to-teal-500 text-white font-semibold py-2 px-6 disabled:opacity-50"
                >
                  {loading ? "Creating account..." : "Register & Continue"}
                </Button>
              </motion.div>
            </motion.div>

            <motion.div variants={item} className="text-center text-sm text-gray-500 pt-2">
              Already have an account?{" "}
              <a href="/login" className="text-blue-600 hover:underline">
                Login
              </a>
            </motion.div>
          </CardContent>
        </motion.div>
      </Card>
    </motion.div>
  );
}; 