"use client";

import MobileLayout from "@/components/mobile-layout";
import { Card, CardContent } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Bell, Moon, Sparkles } from "lucide-react";
import { useTheme } from "next-themes";

export default function SettingsPage() {
  const { theme, setTheme } = useTheme();

  return (
    <MobileLayout>
      <div className="p-4">
        <Card className="shadow-md">
          <CardContent className="pt-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-accent p-1.5">
                    <Sparkles className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <Label
                    htmlFor="weekly-summary"
                    className="font-medium text-foreground"
                  >
                    Weekly Summary ✨
                  </Label>
                </div>
                <Switch id="weekly-summary" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-accent p-1.5">
                    <Bell className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <Label
                    htmlFor="notifications"
                    className="font-medium text-foreground"
                  >
                    Notifications 🔔
                  </Label>
                </div>
                <Switch id="notifications" defaultChecked />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-accent p-1.5">
                    <Moon className="h-4 w-4 text-accent-foreground" />
                  </div>
                  <Label
                    htmlFor="dark-mode"
                    className="font-medium text-foreground"
                  >
                    Dark Mode 🌙
                  </Label>
                </div>
                <Switch
                  id="dark-mode"
                  checked={theme === "dark"}
                  onCheckedChange={(checked) => {
                    setTheme(checked ? "dark" : "light");
                  }}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </MobileLayout>
  );
}
