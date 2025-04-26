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
import { BarChart as BarChartIcon } from "lucide-react"; // Import BarChartIcon

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
      <div className="relative flex flex-col items-center justify-center gap-6 px-4 py-6">
        {/* Decorative elements - use theme colors, may need refinement */}
        <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-primary opacity-20 blur-3xl dark:opacity-30"></div>
        <div className="absolute bottom-20 right-0 h-24 w-24 rounded-full bg-secondary opacity-20 blur-3xl dark:opacity-30"></div>

        <div className="relative z-10 mb-2">
          <p className="text-center text-sm text-muted-foreground">
            Track your health journey 🌱
          </p>
        </div>

        <UploadButton />

        {/* Use standard card background */}
        <Card className="relative w-full overflow-hidden p-5 shadow-lg">
          {/* Decorative element inside card - use accent? */}
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-accent opacity-30"></div>
          <JournalEntry />
        </Card>

        {/* Restyled Card linking to Report Page */}
        <Link href="/report" passHref className="w-full max-w-xs">
          <Card className="w-full cursor-pointer bg-gradient-to-r from-blue-600 to-cyan-500 p-6 text-primary-foreground shadow-lg transition-transform hover:scale-105">
            <div className="flex flex-col items-center justify-center gap-2">
              <BarChartIcon className="h-8 w-8" />
              <span className="text-lg font-semibold">Generate Report</span>
            </div>
          </Card>
        </Link>
      </div>
    </MobileLayout>
  );
}
