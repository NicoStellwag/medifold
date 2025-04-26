import type React from "react";
import Link from "next/link";
import { Bell, Calendar, FileText, Home, Settings, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-10 border-b bg-background">
        <div className="flex h-16 items-center px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/medifold_logo.png"
              alt="Medifold Logo"
              width={48}
              height={48}
              className="object-contain [filter:brightness(0)_saturate(100%)_invert(48%)_sepia(61%)_saturate(6457%)_hue-rotate(175deg)_brightness(101%)_contrast(102%)] dark:[filter:brightness(0)_saturate(100%)_invert(80%)_sepia(32%)_saturate(4619%)_hue-rotate(178deg)_brightness(101%)_contrast(105%)]"
            />
            <span className="sr-only">Medifold</span>
          </Link>
          <nav className="ml-auto flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
              <span className="sr-only">Account</span>
            </Button>
          </nav>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/">
                <Home className="mr-2 h-4 w-4" />
                Dashboard
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/documents">
                <FileText className="mr-2 h-4 w-4" />
                Documents
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/calendar">
                <Calendar className="mr-2 h-4 w-4" />
                Calendar
              </Link>
            </Button>
            <Button variant="ghost" className="justify-start" asChild>
              <Link href="/settings">
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Link>
            </Button>
          </nav>
        </aside>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}
