import type { Metadata } from "next";
import MobileLayout from "@/components/mobile-layout";
import UploadButton from "@/components/upload-button";
import JournalEntry from "@/components/journal-entry";
import { Card } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server"; // Import Supabase server client
import { cookies } from "next/headers"; // Import cookies
import type { User } from "@supabase/supabase-js"; // Import User type
import { redirect } from "next/navigation"; // Import redirect
import Link from "next/link"; // Add Link import
import { BarChart as BarChartIcon, Upload, PenLine } from "lucide-react"; // Import BarChartIcon and other icons
import { motion } from "framer-motion";

// Placeholder for your actual authentication check function/hook
// Replace this with your real authentication logic
// const checkAuth = async () => {
//   // Example: Replace with your actual check (e.g., check session, cookie, etc.)
//   // For demonstration, let's assume the user is not authenticated by default.
//   // You might use next-auth, Clerk, Supabase Auth, etc.
//   // const session = await getSession(); return !!session?.user;
//   return false; // <-- Replace this line
// };
// Removed the placeholder checkAuth function

export const metadata: Metadata = {
  title: "Medifold - Health Document Management",
  description: "Upload and manage your health documents in one place",
};

export default async function Home() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data } = await supabase.auth.getUser(); // Fetch user data

  const user = data?.user; // Get the user object

  if (!user) {
    // Redirect unauthenticated users to onboarding page
    redirect("/onboarding");
  }

  // Show the main app content if logged in, passing the user object
  return (
    <MobileLayout user={user}>
      {" "}
      {/* Pass user as prop */}
      <div className="relative flex flex-col items-center justify-center py-6">
        {/* Premium glass card container */}
        <Card className="relative w-full max-w-lg mx-auto overflow-hidden shadow-2xl border-0 backdrop-blur-md">
          {/* Gradient background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-70 z-0" />

          {/* Decorative elements */}
          <div className="absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-r from-primary/30 to-secondary/30 blur-xl opacity-40" />
          <div className="absolute -left-12 -bottom-12 h-40 w-40 rounded-full bg-gradient-to-r from-secondary/30 to-primary/30 blur-xl opacity-40" />

          <div className="relative z-10 p-6 space-y-8">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Your Health Companion
              </h1>
              <p className="text-muted-foreground text-sm">
                Track your health journey and manage your documents
              </p>
            </div>

            {/* Upload section */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Upload className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  Upload Documents
                </h2>
              </div>
              <div className="flex justify-center">
                <UploadButton />
              </div>
            </div>

            {/* Journal Entry */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <PenLine className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  Health Journal
                </h2>
              </div>
              <div className="bg-card/80 rounded-xl p-5 shadow-lg backdrop-blur-sm border border-border/30">
                <JournalEntry />
              </div>
            </div>

            {/* Generate Report */}
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <BarChartIcon className="h-5 w-5 text-primary" />
                <h2 className="text-base font-semibold text-foreground">
                  Health Reports
                </h2>
              </div>
              <Link href="/report" passHref className="block">
                <div className="bg-gradient-to-r from-primary to-secondary p-4 rounded-xl shadow-lg transition-all hover:shadow-xl hover:scale-[1.02] cursor-pointer">
                  <div className="flex items-center justify-center gap-3 text-primary-foreground">
                    <BarChartIcon className="h-5 w-5" />
                    <span className="text-base font-semibold">
                      Generate Health Report
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </MobileLayout>
  );
}
