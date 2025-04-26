import MobileLayout from "@/components/mobile-layout"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Bell, Moon, Sparkles } from "lucide-react"

export default function SettingsPage() {
  return (
    <MobileLayout>
      <div className="p-4">
        <Card className="border-blue-200 bg-white/80 shadow-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 p-1.5">
                    <Sparkles className="h-4 w-4 text-blue-500" />
                  </div>
                  <Label htmlFor="weekly-summary" className="font-medium text-blue-700">
                    Weekly Summary ✨
                  </Label>
                </div>
                <Switch id="weekly-summary" defaultChecked className="data-[state=checked]:bg-blue-500" />
              </div>

              <Separator className="bg-blue-100" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 p-1.5">
                    <Bell className="h-4 w-4 text-blue-500" />
                  </div>
                  <Label htmlFor="notifications" className="font-medium text-blue-700">
                    Notifications 🔔
                  </Label>
                </div>
                <Switch id="notifications" defaultChecked className="data-[state=checked]:bg-blue-500" />
              </div>

              <Separator className="bg-blue-100" />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-blue-100 p-1.5">
                    <Moon className="h-4 w-4 text-blue-500" />
                  </div>
                  <Label htmlFor="dark-mode" className="font-medium text-blue-700">
                    Dark Mode 🌙
                  </Label>
                </div>
                <Switch id="dark-mode" className="data-[state=checked]:bg-blue-500" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  )
}
