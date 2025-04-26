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
      <Header user={user} />

      <main className="flex-1">{children}</main>

      <Footer />

      <div className="h-16" />
    </div>
  );
}
