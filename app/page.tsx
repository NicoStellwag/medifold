import type { Metadata } from "next";
import MobileLayout from "@/components/mobile-layout";
import UploadButton from "@/components/upload-button";
import JournalEntry from "@/components/journal-entry";
import { Card, CardContent } from "@/components/ui/card";
import { createClient } from "@/utils/supabase/server"; // Import Supabase server client
import { cookies } from "next/headers"; // Import cookies
import type { User } from "@supabase/supabase-js"; // Import User type
import { redirect } from "next/navigation"; // Import redirect
import Link from "next/link"; // Add Link import
import {
  BarChart as BarChartIcon,
  Upload,
  PenLine,
} from "lucide-react"; // Import ShieldCheck icon

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
  title: "Medifold",
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

  // Define consistent blue colors
  const primaryBlue = "#0596D5";
  const secondaryBlue = "#1A8FE0";

  // Show the main app content if logged in, passing the user object
  return (
    <MobileLayout user={user}>
      {" "}
      {/* Pass user as prop */}
      <div className="relative flex flex-col items-center justify-center py-8">
        <Card className="relative w-full max-w-lg mx-auto overflow-hidden shadow-lg border border-slate-200/70 dark:border-slate-800/70 backdrop-blur-sm rounded-xl">
          <CardContent className="p-0">
            {/* Header */}
            <div className="text-center px-6 pt-8 pb-6 border-b border-slate-100 dark:border-slate-800/60">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-[#0596D5] to-[#1A8FE0] bg-clip-text text-transparent mb-2">Medifold</h1>
              <p className="text-muted-foreground text-sm">
                Personalized health tips and recommendations
              </p>
            </div>

            <div className="p-6 space-y-8">
              {/* Upload section */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#0596D5]/10 dark:bg-[#0596D5]/20">
                    <Upload className="h-4 w-4 text-[#0596D5]" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">
                    Upload Documents
                  </h2>
                </div>
                <div className="flex justify-center">
                  <UploadButton primaryColor={primaryBlue} secondaryColor={secondaryBlue} />
                </div>
              </div>

              {/* Journal Entry */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#0596D5]/10 dark:bg-[#0596D5]/20">
                    <PenLine className="h-4 w-4 text-[#0596D5]" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">
                    Health Journal
                  </h2>
                </div>
                <div className="bg-background/70 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-slate-200/60 dark:border-slate-800/60">
                  <JournalEntry />
                </div>
              </div>

              {/* Generate Report */}
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-[#0596D5]/10 dark:bg-[#0596D5]/20">
                    <BarChartIcon className="h-4 w-4 text-[#0596D5]" />
                  </div>
                  <h2 className="text-base font-semibold text-foreground">
                    Health Reports
                  </h2>
                </div>
                <Link href="/report" passHref className="block">
                  <div 
                    className="px-6 py-3.5 rounded-xl shadow-sm border border-[#0596D5]/10 hover:shadow-md transition-all max-w-xs mx-auto text-white"
                    style={{
                      background: "linear-gradient(to right, #0596D5, #1A8FE0)",
                    }}
                  >
                    <div className="flex items-center justify-center gap-2.5">
                      <BarChartIcon className="h-4.5 w-4.5" />
                      <span className="text-sm font-semibold">
                        Generate Health Report
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
