import type { Metadata } from "next"
import MobileLayout from "@/components/mobile-layout"
import UploadButton from "@/components/upload-button"
import JournalEntry from "@/components/journal-entry"
import { Card } from "@/components/ui/card"

export const metadata: Metadata = {
  title: "Medifold - Health Document Management",
  description: "Upload and manage your health documents in one place",
}

export default function Home() {
  return (
    <MobileLayout>
      <div className="relative flex flex-col items-center justify-center gap-6 px-4 py-6">
        {/* Decorative elements */}
        <div className="absolute left-0 top-0 h-32 w-32 rounded-full bg-blue-200 opacity-50 blur-3xl"></div>
        <div className="absolute bottom-20 right-0 h-24 w-24 rounded-full bg-cyan-200 opacity-50 blur-3xl"></div>

        <div className="relative z-10 mb-2">
          <p className="text-center text-sm text-muted-foreground">Track your health journey 🌱</p>
        </div>

        <UploadButton />

        <Card className="relative w-full overflow-hidden border-none bg-gradient-to-br from-white to-blue-50 p-5 shadow-lg">
          <div className="absolute -right-4 -top-4 h-16 w-16 rounded-full bg-yellow-200 opacity-30"></div>
          <JournalEntry />
        </Card>

        <div className="mt-4 text-center text-sm font-medium text-blue-600">
          Weekly insights delivered with ✨ magic ✨
        </div>
      </div>
    </MobileLayout>
  )
}
