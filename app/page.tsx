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
import {
  BarChart as BarChartIcon,
  Upload,
  PenLine,
  ShieldCheck,
} from "lucide-react"; // Import ShieldCheck icon
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
  title: "Medifold - Secure Health Document Management",
  description: "Securely upload and manage your health documents in one place",
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
        {/* Professional card container */}
        <Card className="relative w-full max-w-lg mx-auto overflow-hidden shadow-md border border-slate-200 dark:border-slate-800 backdrop-blur-sm">
          <div className="p-6 space-y-6">
            {/* Header */}
            <div className="text-center space-y-2">
              <h1 className="text-2xl font-bold text-foreground">Medifold</h1>
              <p className="text-muted-foreground text-sm">
                Personalized health tips and recommendations
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
              <div className="bg-background rounded-lg p-4 shadow-sm border border-slate-200 dark:border-slate-800">
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
                <div className="bg-primary hover:bg-primary/90 p-4 rounded-lg shadow-sm transition-all border border-primary/20">
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
