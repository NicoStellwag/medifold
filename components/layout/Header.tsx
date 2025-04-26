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
    <header className="sticky top-0 z-50 border-b bg-card px-4 py-3 backdrop-blur-sm">
      <div className="flex items-center justify-between">
        <Link href="/" passHref>
          <span className="cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-xl font-bold text-transparent">
            Medifold
          </span>
        </Link>
        <div>
          {user ? (
            <DropdownMenu key="user-dropdown">
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="relative h-8 w-8 rounded-full"
                >
                  <Avatar className="h-8 w-8">
                    {/* Potential place for user avatar image */}
                    {/* <AvatarImage src={user.user_metadata?.avatar_url} alt={user.email} /> */}
                    <AvatarFallback>
                      {user.email ? (
                        user.email[0].toUpperCase()
                      ) : (
                        <UserIcon className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div key="auth-buttons" className="space-x-2">
              <Button variant="outline" size="sm" asChild>
                <Link href="/login">Login</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/register">Register</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
