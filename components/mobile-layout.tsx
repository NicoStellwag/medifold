"use client";

import React, { useState, useEffect } from "react";
import {
  Home,
  FileText,
  Settings,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { createClient } from "@/utils/supabase/client";
import type { User } from "@supabase/supabase-js";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

interface MobileLayoutProps {
  children: React.ReactNode;
  user: User | null;
}

export default function MobileLayout({
  children,
  user: initialUser,
}: MobileLayoutProps) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(initialUser);

  useEffect(() => {
    setUser(initialUser);

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [initialUser, supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.pathname = "/";
  };

  // TODO: Implement handleLogin and handleRegister
  // These will likely redirect to specific pages or open modals
  // const handleLogin = () => { /* ... */ }
  // const handleRegister = () => { /* ... */ }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Light mode decorative background elements */}
      <div className="fixed inset-0 bg-gradient-to-br from-purple-50 via-white to-blue-50 opacity-70 z-0 pointer-events-none dark:hidden"></div>

      {/* Dark mode decorative background elements */}
      <div className="fixed inset-0 hidden dark:block bg-gradient-to-br from-blue-950/40 via-background to-cyan-950/30 opacity-70 z-0 pointer-events-none"></div>

      {/* Light mode top decorative blob */}
      <div className="fixed top-0 right-0 h-96 w-96 bg-gradient-to-b from-blue-200 to-transparent rounded-full blur-3xl opacity-20 -z-10 pointer-events-none dark:hidden"></div>

      {/* Dark mode top decorative blob */}
      <div className="fixed top-0 right-0 hidden dark:block h-96 w-96 bg-gradient-to-b from-blue-500/20 to-transparent rounded-full blur-3xl opacity-20 -z-10 pointer-events-none"></div>

      {/* Light mode bottom decorative blob */}
      <div className="fixed bottom-0 left-0 h-96 w-96 bg-gradient-to-t from-purple-200 to-transparent rounded-full blur-3xl opacity-20 -z-10 pointer-events-none dark:hidden"></div>

      {/* Dark mode bottom decorative blob */}
      <div className="fixed bottom-0 left-0 hidden dark:block h-96 w-96 bg-gradient-to-t from-cyan-500/20 to-transparent rounded-full blur-3xl opacity-20 -z-10 pointer-events-none"></div>

      <Header user={user} />

      <main className="flex-1 relative z-10 px-4 pt-4 pb-8">{children}</main>

      <Footer />

      <div className="h-16" />
    </div>
  );
}
