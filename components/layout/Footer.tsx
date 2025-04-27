"use client";

import React, { useState, useEffect } from "react";
import { Home, FileText, Settings } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();

  const isActive = (path: string) => {
    return pathname === path;
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 border-t border-border bg-background/80 backdrop-blur-md shadow-[0_-2px_10px_rgba(0,0,0,0.05)] dark:shadow-[0_-2px_10px_rgba(0,0,0,0.2)] z-50">
      <div className="grid grid-cols-3 items-center py-1">
        <Link
          href="/"
          className="flex flex-col items-center justify-center py-2"
        >
          <div
            className="flex h-12 w-12 flex-col items-center justify-center transition-all"
          >
            <Home
              className={`h-5 w-5 ${
                isActive("/") ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>
          <span
            className={`mt-1 text-xs font-medium ${
              isActive("/") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Home
          </span>
        </Link>

        <Link
          href="/documents"
          className="flex flex-col items-center justify-center py-2"
        >
          <div
            className="flex h-12 w-12 flex-col items-center justify-center transition-all"
          >
            <FileText
              className={`h-5 w-5 ${
                isActive("/documents") ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>
          <span
            className={`mt-1 text-xs font-medium ${
              isActive("/documents") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Docs
          </span>
        </Link>

        <Link
          href="/settings"
          className="flex flex-col items-center justify-center py-2"
        >
          <div
            className="flex h-12 w-12 flex-col items-center justify-center transition-all"
          >
            <Settings
              className={`h-5 w-5 ${
                isActive("/settings") ? "text-primary" : "text-muted-foreground"
              }`}
            />
          </div>
          <span
            className={`mt-1 text-xs font-medium ${
              isActive("/settings") ? "text-primary" : "text-muted-foreground"
            }`}
          >
            Settings
          </span>
        </Link>
      </div>
    </nav>
  );
}
