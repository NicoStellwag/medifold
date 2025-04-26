"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, FileText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

// Assuming UploadedFile type is defined in app/documents/page.tsx or a shared types file
// If it's in page.tsx, we need to adjust the import path or move the type
// For now, let's assume it will be imported correctly or defined elsewhere.
// We might need to adjust this based on where UploadedFile is actually defined.
type UploadedFile = {
  id: string;
  file_name: string;
  storage_path: string;
  category: string | null;
  subcategory: string | null;
  created_at: string;
  signedUrl?: string | null; // Ensure this matches the definition in page.tsx
};

// FileList component Props
interface FileListProps {
  files: UploadedFile[];
  onDeleteFile: (formData: FormData) => void; // Keep the prop for the server action
}

// FileList component - Now a Client Component
export default function FileList({ files, onDeleteFile }: FileListProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
      {files.map((file) => (
        <div key={file.id} className="flex flex-col">
          <Link
            href={file.signedUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="block flex-grow"
          >
            <Card className="overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
              <CardContent className="p-0 flex-grow flex flex-col">
                <div className="aspect-square bg-muted flex items-center justify-center relative">
                  {/* Image/Icon display */}
                  {file.signedUrl &&
                  (file.file_name.endsWith(".png") ||
                    file.file_name.endsWith(".jpg") ||
                    file.file_name.endsWith(".jpeg") ||
                    file.file_name.endsWith(".webp")) ? (
                    <Image
                      src={file.signedUrl}
                      alt={file.file_name}
                      fill // Use fill for aspect ratio consistency
                      className="object-cover"
                      onError={(e) => {
                        console.error(
                          `Failed to load image: ${file.signedUrl}`
                        );
                        // Replace with icon on error maybe?
                        // Cast target to HTMLImageElement to access style
                        const target = e.target as HTMLImageElement;
                        target.style.display = "none"; // Hide broken image
                        // TODO: Show placeholder icon instead by adding another element absolutely positioned
                      }}
                    />
                  ) : (
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>

          <div className="p-2 border-t border-x border-b rounded-b-md flex justify-between items-center bg-card">
            <p className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(file.created_at), {
                addSuffix: true,
              })}
            </p>

            <form action={onDeleteFile} className="flex items-center">
              <input type="hidden" name="fileId" value={file.id} />
              <input
                type="hidden"
                name="storagePath"
                value={file.storage_path}
              />
              <Button
                type="submit"
                variant="ghost"
                size="icon"
                className="h-7 w-7 text-destructive hover:text-destructive"
                title={`Delete ${file.file_name}`}
              >
                <Trash className="h-4 w-4" />
                <span className="sr-only">Delete {file.file_name}</span>
              </Button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}
