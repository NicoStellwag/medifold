"use client";

import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { FileText, Camera, Headphones } from 'lucide-react';
import { motion, Variants } from 'framer-motion';
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

export const CategoriesExplanationScreen = () => {
  const { nextStep, prevStep } = useOnboarding();

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.07,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 24 } }
  };

  const shimmerAnimation: Variants = {
    hidden: { backgroundPosition: "0% 0%" },
    show: { 
      backgroundPosition: "100% 100%",
      transition: { 
        repeat: Infinity, 
        repeatType: "mirror" as const, 
        duration: 10,
        ease: "linear"
      }
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="relative"
    >
      {/* Background animated particles */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-10 right-10 w-24 h-24 rounded-full bg-cyan-200 opacity-30 blur-2xl"
          animate={{
            y: [-8, 8, -8],
            transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
          }}
        />
        <motion.div 
          className="absolute bottom-10 left-10 w-32 h-32 rounded-full bg-blue-200 opacity-30 blur-2xl"
          animate={{
            y: [10, -10, 10],
            transition: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 }
          }}
        />
        <motion.div 
          className="absolute top-1/3 left-1/4 w-16 h-16 rounded-full bg-cyan-200 opacity-20 blur-xl"
          animate={{
            y: [-5, 15, -5],
            transition: { duration: 8, repeat: Infinity, ease: "easeInOut", delay: 2 }
          }}
        />
      </div>

      <Card className="w-full max-w-md shadow-xl bg-white rounded-2xl overflow-hidden border-0 relative">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="relative z-10"
        >
          <CardHeader className="text-center p-6 pt-8">
            <motion.div variants={itemVariants}>
              <CardTitle className="text-2xl font-bold text-cyan-600">Your Health Documents</CardTitle>
            </motion.div>
            <motion.div variants={itemVariants}>
              <CardDescription className="text-gray-600">Medifold organizes your health data into three simple categories</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            {/* AI Classification Info */}
            <motion.div 
              variants={itemVariants}
              className="bg-gradient-to-r from-blue-50 to-cyan-50 p-5 rounded-xl text-center shadow-sm"
              whileHover={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 400, damping: 17 }}
            >
              <p className="text-gray-700 font-medium">
                <span className="inline-block">✨</span> Our AI automatically categorizes your uploaded documents for intelligent use
              </p>
            </motion.div>
            
            {/* List Items */}
            <div className="space-y-3">
              <motion.div 
                variants={itemVariants}
                className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 4px 12px rgba(8, 145, 178, 0.1)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mr-3">
                  <FileText className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-600">Diet Records</h3>
                  <p className="text-sm text-gray-600">Track your meals and nutrition</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 4px 12px rgba(8, 145, 178, 0.1)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mr-3">
                  <Camera className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-600">Photo Documentation</h3>
                  <p className="text-sm text-gray-600">Visual records of your progress</p>
                </div>
              </motion.div>
              
              <motion.div 
                variants={itemVariants}
                className="flex items-start p-4 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-lg border border-blue-100"
                whileHover={{ 
                  scale: 1.02,
                  boxShadow: "0 4px 12px rgba(8, 145, 178, 0.1)"
                }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 flex items-center justify-center mr-3">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-cyan-600">Medical Records</h3>
                  <p className="text-sm text-gray-600">Store important health documents</p>
                </div>
              </motion.div>
            </div>

            {/* Buttons */}
            <motion.div 
              variants={itemVariants}
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