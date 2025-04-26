import type { Metadata } from "next";
import MobileLayout from "@/components/mobile-layout";
import UploadButton from "@/components/upload-button";
import JournalEntry from "@/components/journal-entry";
import { Card } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Medifold - Health Document Management",
  description: "Upload and manage your health documents in one place",
};

export default function Home() {
  return (
    <MobileLayout>
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

        {/* Use primary text color */}
        <div className="mt-4 text-center text-sm font-medium text-primary">
          Weekly insights delivered with ✨ magic ✨
        </div>
      </div>
    </MobileLayout>
  );
}
