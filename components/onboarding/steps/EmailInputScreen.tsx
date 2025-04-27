"use client";

import { useState, useEffect } from "react";
import { useOnboarding } from "@/context/OnboardingContext";
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
import { Mail, Lock, UserPlus } from "lucide-react";
import { motion } from "framer-motion";
import { createClient } from "@/utils/supabase/client";

export const EmailInputScreen = () => {
  const { nextStep, prevStep } = useOnboarding();
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userData, setUserData] = useState<{
    name?: string;
    age?: number;
    weight?: number;
    sex?: string;
  }>({});

  // Basic email validation regex
  const isValidEmail = (email: string) =>
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  // Get user data from sessionStorage
  useEffect(() => {
    const storedName = sessionStorage.getItem("onboarding_name");
    const storedAge = sessionStorage.getItem("onboarding_age");
    const storedWeight = sessionStorage.getItem("onboarding_weight");
    const storedSex = sessionStorage.getItem("onboarding_sex");

    const data: typeof userData = {};
    if (storedName) data.name = storedName;
    if (storedAge) data.age = parseInt(storedAge);
    if (storedWeight) data.weight = parseFloat(storedWeight);
    if (storedSex) data.sex = storedSex;

    setUserData(data);
  }, []);

  const handleContinue = async () => {
    setError(null);
    setLoading(true);

    try {
      if (!isValidEmail(email)) {
        throw new Error("Please enter a valid email address");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters");
      }

      if (password !== confirmPassword) {
        throw new Error("Passwords do not match");
      }

      // Register the user with Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      });

      if (authError) throw new Error(authError.message);

      // If registration was successful, store user profile data
      if (authData?.user) {
        const userId = authData.user.id;

        // Insert into the public.users table
        const { error: profileError } = await supabase.from("users").insert({
          id: userId,
          name: userData.name || "",
          age: userData.age,
          weight: userData.weight,
          sex: userData.sex,
        });

        if (profileError) {
          // Log the full error object for debugging
          console.error(
            "Error saving profile data:",
            JSON.stringify(profileError, null, 2)
          );
          // Don't throw here - we want to continue onboarding even if profile data fails
        }
      }

      // Clear session storage items - they're now in the database
      sessionStorage.removeItem("onboarding_name");
      sessionStorage.removeItem("onboarding_age");
      sessionStorage.removeItem("onboarding_weight");
      sessionStorage.removeItem("onboarding_sex");

      // Proceed to next step
      nextStep();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
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
              className="relative p-1 bg-gradient-to-br from-blue-400 to-cyan-400 rounded-full mb-6"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="p-3 bg-white rounded-full">
                <UserPlus className="h-8 w-8 text-blue-500" />
              </div>
            </motion.div>
            <motion.div variants={item}>
              <CardTitle className="text-2xl font-bold text-cyan-600 mb-2">
                Create Your Account
              </CardTitle>
            </motion.div>
            <motion.div variants={item}>
              <CardDescription className="text-gray-600">
                Register to start tracking your health journey
              </CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8 space-y-4">
            <motion.div variants={item} className="space-y-2">
              <Label
                htmlFor="email"
                className="text-gray-700 flex items-center"
              >
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
              <Label
                htmlFor="password"
                className="text-gray-700 flex items-center"
              >
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
              <Label
                htmlFor="confirm-password"
                className="text-gray-700 flex items-center"
              >
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

            <motion.div
              variants={item}
              className="text-center text-sm text-gray-500 pt-2"
            >
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
