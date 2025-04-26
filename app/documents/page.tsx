import type React from "react";
import MobileLayout from "@/components/mobile-layout";
import { FileText, Search, Apple, Camera, Notebook, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";
import type { User } from "@supabase/supabase-js";
import NotesList from "@/components/notes-list";
import {
  TopLevelCategory,
  DietSubcategory,
  HealthSubcategory,
  // type ImageCategory, // No longer needed here if only using TopLevel/Sub cats
} from "@/lib/image-categories"; // Import category types
import Link from "next/link"; // Import Link for file links
import { revalidatePath } from "next/cache";
import { Button } from "@/components/ui/button"; // Import Button for styling
import FileList from "@/components/file-list";

// Define a type for the fetched file data (adjust fields as needed)
type UploadedFile = {
  id: string;
  file_name: string;
  storage_path: string;
  category: string | null;
  subcategory: string | null;
  created_at: string;
  signedUrl?: string | null; // Add field for the signed URL
};

// Define a type for grouped files
type GroupedFiles = {
  diet: { [key in DietSubcategory]?: UploadedFile[] };
  selfies: UploadedFile[];
  health: { [key in HealthSubcategory]?: UploadedFile[] };
};

export default async function DocumentsPage() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  let notes: any[] = [];
  let uploadedFiles: UploadedFile[] = []; // Use the updated type

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

    const { data: filesData, error: filesError } = await supabase
      .from("uploaded_files")
      .select("id, file_name, storage_path, category, subcategory, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (filesError) {
      console.error("Error fetching uploaded files:", filesError);
    } else {
      uploadedFiles = (filesData as UploadedFile[]) || [];

      // Generate signed URLs for each file
      const signedUrlPromises = uploadedFiles.map(async (file) => {
        const { data: signedUrlData, error: signedUrlError } =
          await supabase.storage
            .from("user-uploads")
            .createSignedUrl(file.storage_path, 60); // 60 seconds expiration

        if (signedUrlError) {
          console.error(
            `Error generating signed URL for ${file.storage_path}:`,
            signedUrlError
          );
          return { ...file, signedUrl: null }; // Add null URL on error
        }
        return { ...file, signedUrl: signedUrlData.signedUrl }; // Add the signed URL
      });
      uploadedFiles = await Promise.all(signedUrlPromises);
    }
  }

  // Group uploadedFiles by category/subcategory
  const groupedFiles: GroupedFiles = {
    diet: {},
    selfies: [],
    health: {},
  };
  const allFiles: UploadedFile[] = []; // Keep track of all files for the 'all' tab

  // Get enum values for easier checking
  const dietSubcategoryValues = Object.values(DietSubcategory);
  const healthSubcategoryValues = Object.values(HealthSubcategory);

  uploadedFiles.forEach((file) => {
    allFiles.push(file); // Add to all files list
    switch (file.category) {
      case TopLevelCategory.Diet:
        // Check if the subcategory string value exists in the enum's values
        if (
          file.subcategory &&
          dietSubcategoryValues.includes(file.subcategory as DietSubcategory)
        ) {
          const subcat = file.subcategory as DietSubcategory;
          if (!groupedFiles.diet[subcat]) {
            groupedFiles.diet[subcat] = [];
          }
          // Explicitly push after ensuring array exists
          groupedFiles.diet[subcat].push(file);
        } else if (file.subcategory) {
          console.warn(
            `Unknown/unhandled Diet subcategory: ${file.subcategory} for file ${file.id}`
          );
          // Decide if you want to put these in a default 'other' diet category
        }
        break;
      case TopLevelCategory.Selfies:
        groupedFiles.selfies.push(file);
        break;
      case TopLevelCategory.Health:
        // Check if the subcategory string value exists in the enum's values
        if (
          file.subcategory &&
          healthSubcategoryValues.includes(
            file.subcategory as HealthSubcategory
          )
        ) {
          const subcat = file.subcategory as HealthSubcategory;
          if (!groupedFiles.health[subcat]) {
            groupedFiles.health[subcat] = [];
          }
          // Explicitly push after ensuring array exists
          groupedFiles.health[subcat].push(file);
        } else if (file.subcategory) {
          console.warn(
            `Unknown/unhandled Health subcategory: ${file.subcategory} for file ${file.id}`
          );
          // Decide if you want to put these in a default 'other' health category
        }
        break;
      default:
        // Handle files explicitly marked with 'other' category or uncategorized
        console.warn(
          `Uncategorized file: ${file.id}, Category: ${file.category}`
        );
        break;
    }
  });

  // Helper function to check if a category group is empty
  const isDietEmpty = Object.values(groupedFiles.diet).every(
    (arr) => !arr || arr.length === 0
  );
  const isHealthEmpty = Object.values(groupedFiles.health).every(
    (arr) => !arr || arr.length === 0
  );

  // --- Server Action for Deleting Files ---
  async function deleteFileAction(formData: FormData) {
    "use server";

    const fileId = formData.get("fileId") as string;
    const storagePath = formData.get("storagePath") as string;

    if (!fileId || !storagePath) {
      console.error("Missing fileId or storagePath for deletion.");
      // Optionally return an error status or message
      return;
    }

    // Re-create client within the server action scope
    const cookieStore = cookies();
    const supabase = createClient(cookieStore);
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      console.error("User not authenticated for delete action.");
      return;
    }

    try {
      // 1. Delete from storage
      const { error: storageError } = await supabase.storage
        .from("user-uploads")
        .remove([storagePath]); // remove expects an array of paths

      if (storageError) {
        console.error(
          `Storage deletion error for ${storagePath}:`,
          storageError
        );
        // Don't proceed if storage deletion fails, as the DB record points to it
        throw new Error(
          `Failed to delete file from storage: ${storageError.message}`
        );
      }

      // 2. Delete from database
      const { error: dbError } = await supabase
        .from("uploaded_files")
        .delete()
        .eq("id", fileId)
        .eq("user_id", user.id); // Ensure user owns the file

      if (dbError) {
        console.error(`Database deletion error for ${fileId}:`, dbError);
        // If DB delete fails after storage delete, we have an orphaned file reference.
        // Might need more robust error handling/logging here.
        throw new Error(
          `Failed to delete file record from database: ${dbError.message}`
        );
      }

      console.log(`Successfully deleted file: ${fileId}, path: ${storagePath}`);
      revalidatePath("/documents"); // Revalidate the page to show updated list
    } catch (error) {
      console.error("Error during file deletion process:", error);
      // Optionally return an error state to the client
    }
  }
  // --- End Server Action ---

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
              <span className="inline sm:hidden">📝</span>
            </TabsTrigger>
            <TabsTrigger value="diet" className="flex items-center gap-1">
              <span className="hidden sm:inline">Diet</span>
              <span className="inline sm:hidden">🍎</span>
            </TabsTrigger>
            <TabsTrigger value="selfies" className="flex items-center gap-1">
              <span className="hidden sm:inline">Selfies</span>
              <span className="inline sm:hidden">📸</span>
            </TabsTrigger>
            <TabsTrigger value="health" className="flex items-center gap-1">
              <span className="hidden sm:inline">Health</span>
              <span className="inline sm:hidden">🏥</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            {allFiles.length === 0 && notes.length === 0 ? (
              <EmptyState
                icon={<FileText className="h-8 w-8 text-blue-500" />}
                title="No documents or notes yet"
                description="Upload something or add a note to get started"
              />
            ) : (
              <div className="space-y-4">
                {notes.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold">Notes</h3>
                    <NotesList notes={notes} />
                  </>
                )}
                {allFiles.length > 0 && (
                  <>
                    <h3 className="text-lg font-semibold mt-4">
                      Uploaded Files
                    </h3>
                    <FileList
                      files={allFiles}
                      onDeleteFile={deleteFileAction}
                    />
                  </>
                )}
              </div>
            )}
          </TabsContent>

          <TabsContent value="notes" className="mt-4">
            {notes.length === 0 ? (
              <EmptyState
                icon={<Notebook className="h-8 w-8 text-yellow-500" />}
                title="No notes yet"
                description="Add notes for quick thoughts or reminders"
              />
            ) : (
              <NotesList notes={notes} />
            )}
          </TabsContent>

          <TabsContent value="diet" className="mt-4">
            {isDietEmpty ? (
              <EmptyState
                icon={<Apple className="h-8 w-8 text-green-500" />}
                title="No diet documents"
                description="Track your nutrition by uploading receipts or food images"
              />
            ) : (
              <Card>
                <CardContent className="p-4 space-y-4">
                  {groupedFiles.diet[DietSubcategory.Receipts] &&
                    groupedFiles.diet[DietSubcategory.Receipts]!.length > 0 && (
                      <div>
                        <h3 className="font-medium text-foreground mb-2">
                          Receipts
                        </h3>
                        <FileList
                          files={groupedFiles.diet[DietSubcategory.Receipts]!}
                          onDeleteFile={deleteFileAction}
                        />
                      </div>
                    )}
                  {groupedFiles.diet[DietSubcategory.FoodImages] &&
                    groupedFiles.diet[DietSubcategory.FoodImages]!.length >
                      0 && (
                      <div>
                        <h3 className="font-medium text-foreground mb-2">
                          Food Images
                        </h3>
                        <FileList
                          files={groupedFiles.diet[DietSubcategory.FoodImages]!}
                          onDeleteFile={deleteFileAction}
                        />
                      </div>
                    )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="selfies" className="mt-4">
            {groupedFiles.selfies.length === 0 ? (
              <EmptyState
                icon={<Camera className="h-8 w-8 text-blue-500" />}
                title="No selfies uploaded"
                description="Track changes with regular photo uploads"
              />
            ) : (
              <Card>
                <CardContent className="p-4">
                  <h3 className="font-medium text-foreground mb-2">Selfies</h3>
                  <FileList
                    files={groupedFiles.selfies}
                    onDeleteFile={deleteFileAction}
                  />
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="health" className="mt-4">
            {isHealthEmpty ? (
              <EmptyState
                icon={<FileText className="h-8 w-8 text-red-500" />}
                title="No health documents"
                description="Keep track of your medical records"
              />
            ) : (
              <Card>
                <CardContent className="p-4 space-y-4">
                  {Object.entries(groupedFiles.health)
                    .filter(([_, files]) => files && files.length > 0) // Filter out empty subcategories
                    .map(([subcat, files]) => (
                      <div key={subcat}>
                        {/* Simple title case for subcategory name */}
                        <h3 className="font-medium text-foreground mb-2">
                          {subcat
                            .replace(/_/g, " ")
                            .replace(/\b\w/g, (l) => l.toUpperCase())}
                        </h3>
                        <FileList
                          files={files!}
                          onDeleteFile={deleteFileAction}
                        />
                      </div>
                    ))}
                </CardContent>
              </Card>
            )}
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
