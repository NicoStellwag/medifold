import type React from "react"
import { Home, FileText, Settings } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ThemeProvider } from "@/components/theme-provider"
import Link from "next/link"

interface MobileLayoutProps {
  children: React.ReactNode
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="light">
      <div className="flex min-h-screen flex-col bg-gradient-to-b from-white to-blue-50">
        <header className="border-b border-blue-100 bg-white/80 px-4 py-3 backdrop-blur-sm">
          <div className="flex items-center justify-center">
            <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-xl font-bold text-transparent">
              Medifold
            </span>
          </div>
        </header>

        <main className="flex-1">{children}</main>

        <nav className="fixed bottom-0 left-0 right-0 border-t border-blue-100 bg-white/80 backdrop-blur-sm">
          <div className="grid grid-cols-3 items-center">
            <Button variant="ghost" className="flex h-16 flex-col items-center justify-center rounded-none" asChild>
              <Link href="/">
                <Home className="h-5 w-5 text-blue-600" />
                <span className="mt-1 text-xs font-medium text-blue-600">Home</span>
              </Link>
            </Button>
            <Button variant="ghost" className="flex h-16 flex-col items-center justify-center rounded-none" asChild>
              <Link href="/documents">
                <FileText className="h-5 w-5 text-blue-600" />
                <span className="mt-1 text-xs font-medium text-blue-600">Docs</span>
              </Link>
            </Button>
            <Button variant="ghost" className="flex h-16 flex-col items-center justify-center rounded-none" asChild>
              <Link href="/settings">
                <Settings className="h-5 w-5 text-blue-600" />
                <span className="mt-1 text-xs font-medium text-blue-600">Settings</span>
              </Link>
            </Button>
          </div>
        </nav>

        {/* Add padding at the bottom to account for the fixed nav */}
        <div className="h-16" />
      </div>
    </ThemeProvider>
  )
}
