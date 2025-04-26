import type React from "react";
import MobileLayout from "@/components/mobile-layout";
import { FileText, Search, Apple, Camera, Notebook } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import NotesList from "@/components/notes-list";

export default async function DocumentsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  let notes: any[] = [];
  if (user) {
    const { data: notesData, error: notesError } = await supabase
      .from("notes")
      .select("id, text, created_at, user_id")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (notesError) {
      console.error("Error fetching notes:", notesError);
    } else {
      notes = notesData || [];
    }
  }

  return (
    <MobileLayout user={user}>
      <div className="flex flex-col items-center justify-center gap-4 p-4">
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search documents..."
            className="pl-10 shadow-sm"
          />
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList className="grid w-full grid-cols-5 bg-muted">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="notes" className="flex items-center gap-1">
              <span className="hidden sm:inline">Notes</span>
              <span className="inline sm:hidden">
                <Notebook size={16} />
              </span>
            </TabsTrigger>
            <TabsTrigger value="diet" className="flex items-center gap-1">
              <span className="hidden sm:inline">Diet</span>
              <span className="inline sm:hidden">🍎</span>
            </TabsTrigger>
            <TabsTrigger value="photo" className="flex items-center gap-1">
              <span className="hidden sm:inline">Photo</span>
              <span className="inline sm:hidden">📸</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1">
              <span className="hidden sm:inline">Health</span>
              <span className="inline sm:hidden">🏥</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <EmptyState
              icon={<FileText className="h-8 w-8 text-blue-500" />}
              title="No documents yet"
              description="Upload something to get started"
            />
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            <NotesList notes={notes} />
          </TabsContent>

          <TabsContent value="diet" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Diet Documents 🍎
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Upload receipts for food tracking
                      </p>
                    </div>
                    <Badge variant="outline">Diet</Badge>
                  </div>

                  <EmptyState
                    icon={<Apple className="h-8 w-8 text-green-500" />}
                    title="No diet documents"
                    description="Track your nutrition by uploading receipts"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="photo" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Photo Documents 📸
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Upload selfies, skin photos
                      </p>
                    </div>
                    <Badge variant="outline">Photo</Badge>
                  </div>

                  <EmptyState
                    icon={<Camera className="h-8 w-8 text-blue-500" />}
                    title="No photos uploaded"
                    description="Track changes with regular photo uploads"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="mt-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex flex-col gap-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-medium text-foreground">
                        Health Documents 🏥
                      </h3>
                      <p className="text-xs text-muted-foreground">
                        Blood images, medical reports, text docs
                      </p>
                    </div>
                    <Badge variant="outline">Health</Badge>
                  </div>

                  <EmptyState
                    icon={<FileText className="h-8 w-8 text-red-500" />}
                    title="No health documents"
                    description="Keep track of your medical records"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MobileLayout>
  );
}

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function EmptyState({ icon, title, description }: EmptyStateProps) {
  return (
    <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border bg-card shadow-sm">
      <div className="rounded-full bg-muted p-4">{icon}</div>
      <p className="mt-4 text-center text-sm font-medium text-foreground">
        {title}
      </p>
      <p className="text-center text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
