"use client";

import { useState } from 'react';
import { useOnboarding } from '@/context/OnboardingContext';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { UploadCloud, FileText, BrainCircuit } from 'lucide-react';
import { motion } from 'framer-motion';

// Placeholder for actual file upload component - Reuse or adapt as needed
function FileUploader() {
  // TODO: Implement actual file upload logic and state management
  const [fileName, setFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setFileName(file.name);
      // In a real implementation, you would upload the file here
    }
  };
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setFileName(file.name);
      // In a real implementation, you would upload the file here
    }
  };
  
  return (
    <motion.div 
      className={`mt-4 border-2 border-dashed ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'} rounded-lg p-8 text-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors`}
      whileHover={{ scale: 1.02 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      <label className="w-full h-full block cursor-pointer">
        <input 
          type="file" 
          className="hidden" 
          accept=".pdf,.jpg,.jpeg,.png" 
          onChange={handleFileSelect}
        />
        {fileName ? (
          <div className="flex flex-col items-center">
            <FileText className="h-12 w-12 mx-auto text-blue-500 mb-3" />
            <p className="font-semibold text-gray-700 break-all">{fileName}</p>
            <p className="text-sm text-blue-600 mt-2">File selected - click to change</p>
          </div>
        ) : (
          <>
            <UploadCloud className="h-12 w-12 mx-auto text-gray-400 mb-3" />
            <p className="font-semibold text-gray-700">Click to upload</p>
            <p className="text-sm text-gray-500">or drag and drop</p>
            <p className="text-xs text-gray-400 mt-1">PDF, JPG, PNG (max 10MB)</p>
          </>
        )}
      </label>
    </motion.div>
  );
}

export const DocumentUploadScreen = () => {
  const { nextStep, prevStep, skipTo } = useOnboarding();

  const handleContinue = () => {
    // TODO: Check if files were uploaded (potentially optional)
    nextStep();
  };

  const handleSkip = () => {
    skipTo('email'); // Navigate to the account creation screen instead of 'complete'
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
              className="relative p-1 bg-gradient-to-br from-blue-400 to-indigo-400 rounded-full mb-6 mx-auto"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400, damping: 10 }}
            >
              <div className="p-3 bg-white rounded-full">
                <BrainCircuit className="h-8 w-8 text-indigo-600" />
              </div>
            </motion.div>
            <motion.div variants={item}>
              <CardTitle className="text-2xl font-bold text-cyan-600 mb-2">Smart Document Upload</CardTitle>
            </motion.div>
            <motion.div variants={item}>
              <CardDescription className="text-gray-600">Let's upload your first document - we'll automatically classify it</CardDescription>
            </motion.div>
          </CardHeader>
          <CardContent className="p-8">
            <motion.div variants={item}>
              <motion.div 
                className="bg-gradient-to-r from-blue-50 to-indigo-50 p-5 rounded-xl shadow-sm mb-6"
                whileHover={{ scale: 1.01 }}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
              >
                <h3 className="font-semibold text-indigo-800 mb-2 flex items-center">
                  <BrainCircuit className="h-5 w-5 mr-2" /> 
                  Intelligent Classification
                </h3>
                <ul className="text-sm text-gray-700 space-y-2 list-disc list-inside">
                  <li>Upload any health document</li>
                  <li>Our AI automatically categorizes your document for intelligent use</li>
                </ul>
              </motion.div>
              
              <FileUploader />
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