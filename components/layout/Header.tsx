"use client";

import React, { useState, useEffect } from "react";
import { User as UserIcon, LogOut } from "lucide-react";
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
        <Link href="/" passHref>
          <span className="cursor-pointer bg-gradient-to-r from-primary to-secondary bg-clip-text text-xl font-bold text-transparent">
            Medifold
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <DropdownMenu key="user-dropdown">
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-10 w-10 rounded-full p-1 bg-gradient-to-r from-primary/20 to-secondary/20 hover:from-primary/30 hover:to-secondary/30 transition-all dark:from-primary/10 dark:to-secondary/10 dark:hover:from-primary/20 dark:hover:to-secondary/20"
                >
                  <Avatar className="h-8 w-8 border-2 border-background">
                    {/* Potential place for user avatar image */}
                    {/* <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} /> */}
                    <AvatarFallback className="bg-gradient-to-r from-primary to-secondary text-primary-foreground">
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
                  onClick={handleLogout}
                  className="rounded-lg hover:bg-gradient-to-r hover:from-primary/10 hover:to-secondary/10"
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
                className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground shadow-md rounded-lg border-0"
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
