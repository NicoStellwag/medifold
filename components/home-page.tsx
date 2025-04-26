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

export function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center justify-between">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-xl font-bold text-transparent">
              Medifold
            </span>
          </Link>
          <nav className="flex items-center space-x-2">
            <Button variant="outline" asChild>
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
            <Button asChild>
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
          <div className="mx-auto flex max-w-[980px] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-extrabold leading-tight tracking-tighter md:text-5xl lg:text-6xl">
              Manage Your Health Documents Effortlessly
            </h1>
            <p className="max-w-[700px] text-lg text-muted-foreground">
              Upload, organize, and track your health documents all in one place
              with Medifold's simple and secure platform.
            </p>
          </div>
          <div className="mx-auto flex max-w-[980px] justify-center gap-4">
            <Button asChild size="lg">
              <Link href="/login">
                <LogIn className="mr-2 h-4 w-4" /> Login
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg">
              <Link href="/register">
                <UserPlus className="mr-2 h-4 w-4" /> Register
              </Link>
            </Button>
          </div>
        </section>

        {/* How It Works Section */}
        <section className="container py-12 md:py-16">
          <div className="mx-auto mb-10 max-w-[980px] text-center">
            <h2 className="text-2xl font-bold md:text-3xl">
              How Medifold Works
            </h2>
          </div>
          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardHeader className="items-center">
                <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                  <UploadCloud className="h-6 w-6" />
                </div>
                <CardTitle>Upload Documents</CardTitle>
                <CardDescription className="text-center">
                  Easily upload and categorize your health-related documents
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                Upload diet records, photos for tracking, and medical reports
                with simple drag and drop functionality.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="items-center">
                <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                  <History className="h-6 w-6" />
                </div>
                <CardTitle>View History</CardTitle>
                <CardDescription className="text-center">
                  Access and review all your uploaded documents
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                Browse through your document history, organized by category and
                date for easy reference.
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="items-center">
                <div className="mb-3 rounded-full bg-primary/10 p-3 text-primary">
                  <BarChartHorizontalBig className="h-6 w-6" />
                </div>
                <CardTitle>Weekly Summaries</CardTitle>
                <CardDescription className="text-center">
                  Get regular insights about your health documentation
                </CardDescription>
              </CardHeader>
              <CardContent className="text-center text-sm text-muted-foreground">
                Receive weekly summaries with visualizations to help you track
                patterns and trends in your health documents.
              </CardContent>
            </Card>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t py-6 md:py-8">
        <div className="container flex flex-col items-center justify-center gap-4 md:h-16 md:flex-row">
          <p className="text-center text-sm leading-loose text-muted-foreground md:text-left">
            © {new Date().getFullYear()} Medifold. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
