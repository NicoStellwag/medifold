"use client";

import React, { useState, useEffect } from "react";
import { User as UserIcon, LogOut, UserCog } from "lucide-react";
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
import { motion } from "framer-motion";
import { ThemeToggle } from "@/components/theme-toggle";
import Image from "next/image";

interface HeaderProps {
  user: User | null;
}

export default function Header({ user: initialUser }: HeaderProps) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(initialUser);

  // Effect to update user state based on prop and auth changes
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
    // Redirect to home after logout
    window.location.pathname = "/";
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 px-4 py-3 backdrop-blur-md shadow-sm">
      <div className="flex items-center justify-between">
      <Link href="/" passHref className="flex items-center">
          <Image
            src="/medifold_logo.png"
            alt="Medifold Logo"
            width={36}
            height={36}
            className="object-contain [filter:brightness(0)_saturate(100%)_invert(48%)_sepia(61%)_saturate(6457%)_hue-rotate(175deg)_brightness(101%)_contrast(102%)] dark:[filter:brightness(0)_saturate(100%)_invert(80%)_sepia(32%)_saturate(4619%)_hue-rotate(178deg)_brightness(101%)_contrast(105%)]"
          />
          <span className="ml-2 text-lg font-semibold bg-gradient-to-r from-[#0596D5] to-[#1A8FE0] bg-clip-text text-transparent">Medifold</span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu key="user-dropdown">
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-1 bg-primary/10 hover:bg-primary/20 transition-all"
                >
                  <Avatar className="h-8 w-8 border-2 border-background">
                    {/* Potential place for user avatar image */}
                    {/* <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} /> */}
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.email ? (
                        user.email[0].toUpperCase()
                      ) : (
                        <UserIcon className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="rounded-xl border border-border shadow-lg"
              >
                <DropdownMenuItem
                  asChild
                  className="rounded-lg hover:bg-primary/10"
                >
                  <Link href="/profile">
                    <UserCog className="mr-2 h-4 w-4 text-primary" />
                    <span className="text-foreground">Profile</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={handleLogout}
                  className="rounded-lg hover:bg-primary/10"
                >
                  <LogOut className="mr-2 h-4 w-4 text-primary" />
                  <span className="text-foreground">Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div key="auth-buttons" className="space-x-2">
              <Button
                variant="ghost"
                size="sm"
                asChild
                className="bg-background/80 hover:bg-background backdrop-blur-sm text-primary hover:text-primary/80 border border-border shadow-sm rounded-lg"
              >
                <Link href="/login">Login</Link>
              </Button>
              <Button
                size="sm"
                asChild
                className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-md rounded-lg border-0"
              >
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
