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

interface MobileLayoutProps {
  children: React.ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const supabase = createClient();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const checkUser = async () => {
      const { data, error } = await supabase.auth.getUser();
      if (!error && data?.user) {
        setUser(data.user);
      }
    };

    checkUser();

    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, [supabase]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    // Optionally redirect user after logout
    // router.push('/');
  };

  // TODO: Implement handleLogin and handleRegister
  // These will likely redirect to specific pages or open modals
  // const handleLogin = () => { /* ... */ }
  // const handleRegister = () => { /* ... */ }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-card px-4 py-3 backdrop-blur-sm">
        <div className="flex items-center justify-between">
          <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-xl font-bold text-transparent">
            Medifold
          </span>
          <div>
            {user ? (
              <DropdownMenu key="user-dropdown">
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      {/* Add user avatar image if available */}
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
                  {/* Add more items like Profile, Settings etc. if needed */}
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Logout</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div key="auth-buttons" className="space-x-2">
                {/* Replace with Link components or onClick handlers for actual routing/modals */}
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

      <main className="flex-1">{children}</main>

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

      {/* Add padding at the bottom to account for the fixed nav */}
      <div className="h-16" />
    </div>
  );
}
