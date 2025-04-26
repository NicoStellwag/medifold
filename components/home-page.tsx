"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  UploadCloud,
  History,
  BarChartHorizontalBig,
  LogIn,
  UserPlus,
} from "lucide-react"; // Import icons
import { motion } from "framer-motion";

export function HomePage() {
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.3,
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
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-white/80 py-3 backdrop-blur-md shadow-sm">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="bg-gradient-to-r from-blue-500 to-cyan-400 bg-clip-text text-xl font-bold text-transparent">
              Medifold
            </span>
          </Link>
          <nav className="flex items-center space-x-2">
            <Button
              variant="ghost"
              asChild
              className="bg-white/80 hover:bg-white backdrop-blur-sm text-blue-600 hover:text-blue-700 border border-blue-100 shadow-sm rounded-lg"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
            <Button
              asChild
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white shadow-md rounded-lg border-0"
            >
              <Link href="/register">
                <UserPlus className="mr-2 h-4 w-4" /> Register
              </Link>
            </Button>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        <section className="container grid items-center gap-6 pb-8 pt-6 md:py-10">
          <motion.div
            className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent md:text-5xl lg:text-6xl">
              Manage Your Health Documents Effortlessly
            </h1>
            <p className="max-w-[700px] text-lg text-gray-600">
              Upload, organize, and track your health documents all in one place
              with Medifold's simple and secure platform.
            </p>
          </motion.div>
          <motion.div
            className="mx-auto flex max-w-[980px] justify-center gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-blue-500 to-cyan-400 hover:from-blue-600 hover:to-cyan-500 text-white shadow-md rounded-xl border-0"
            >
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="bg-white/80 hover:bg-white backdrop-blur-sm text-blue-600 hover:text-blue-700 border border-blue-100 shadow-sm rounded-xl"
            >
              <Link href="/register">
                <UserPlus className="mr-2 h-4 w-4" /> Register
              </Link>
            </Button>
          </motion.div>
        </section>

        {/* How It Works Section */}
        <section className="container py-12 md:py-16">
          <motion.div
            className="mx-auto mb-10 max-w-[980px] text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-2xl font-bold md:text-3xl bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">
              How Medifold Works
            </h2>
          </motion.div>
          <motion.div
            className="grid gap-6 md:grid-cols-3"
            variants={container}
            initial="hidden"
            animate="show"
          >
            <motion.div variants={item}>
              <Card className="shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
                <div className="relative z-10">
                  <CardHeader className="items-center">
                    <div className="mb-3 rounded-full bg-gradient-to-br from-blue-400 to-cyan-400 p-3 text-white shadow-md">
                      <UploadCloud className="h-6 w-6" />
                    </div>
                    <CardTitle>Upload Documents</CardTitle>
                    <CardDescription className="text-center">
                      Easily upload and categorize your health-related documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-sm text-gray-600">
                    Upload diet records, photos for tracking, and medical
                    reports with simple drag and drop functionality.
                  </CardContent>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
                <div className="relative z-10">
                  <CardHeader className="items-center">
                    <div className="mb-3 rounded-full bg-gradient-to-br from-cyan-400 to-blue-400 p-3 text-white shadow-md">
                      <History className="h-6 w-6" />
                    </div>
                    <CardTitle>View History</CardTitle>
                    <CardDescription className="text-center">
                      Access and review all your uploaded documents
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-sm text-gray-600">
                    Browse through your document history, organized by category
                    and date for easy reference.
                  </CardContent>
                </div>
              </Card>
            </motion.div>

            <motion.div variants={item}>
              <Card className="shadow-xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-cyan-50 opacity-50" />
                <div className="relative z-10">
                  <CardHeader className="items-center">
                    <div className="mb-3 rounded-full bg-gradient-to-br from-cyan-400 to-purple-400 p-3 text-white shadow-md">
                      <BarChartHorizontalBig className="h-6 w-6" />
                    </div>
                    <CardTitle>Weekly Summaries</CardTitle>
                    <CardDescription className="text-center">
                      Get regular insights about your health documentation
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center text-sm text-gray-600">
                    Receive weekly summaries with visualizations to help you
                    track patterns and trends in your health documents.
                  </CardContent>
                </div>
              </Card>
            </motion.div>
          </motion.div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 bg-white/80 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-gray-600 md:text-left">
            © {new Date().getFullYear()} Medifold. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
