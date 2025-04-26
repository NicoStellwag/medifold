"use client";

import React from "react";
import { Home, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function Footer() {
  // TODO: Add logic to dynamically set the active state based on current route
  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t bg-card backdrop-blur-sm">
      <div className="grid grid-cols-3 items-center">
        <Button
          variant="ghost"
          className="flex h-16 flex-col items-center justify-center rounded-none"
          asChild
        >
          <Link href="/">
            <Home className="h-5 w-5 text-foreground" />
            <span className="mt-1 text-xs font-medium text-foreground">
              Home
            </span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="flex h-16 flex-col items-center justify-center rounded-none"
          asChild
        >
          <Link href="/documents">
            <FileText className="h-5 w-5 text-foreground" />
            <span className="mt-1 text-xs font-medium text-foreground">
              Docs
            </span>
          </Link>
        </Button>
        <Button
          variant="ghost"
          className="flex h-16 flex-col items-center justify-center rounded-none"
          asChild
        >
          <Link href="/settings">
            <Settings className="h-5 w-5 text-foreground" />
            <span className="mt-1 text-xs font-medium text-foreground">
              Settings
            </span>
          </Link>
        </Button>
      </div>
    </nav>
  );
}
