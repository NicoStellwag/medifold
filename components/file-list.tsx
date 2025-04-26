"use client";

import type React from "react";
import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash, FileText, Loader2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { motion } from "framer-motion";

// Configure pdfjs worker
// Make sure the worker is available at this path
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

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
  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <motion.div
      className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4"
      variants={container}
      initial="hidden"
      animate="show"
    >
      {files.map((file) => (
        <motion.div key={file.id} className="flex flex-col" variants={item}>
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
                  ) : file.signedUrl && file.file_name.endsWith(".pdf") ? (
                    // PDF Preview
                    <div className="w-full h-full flex items-center justify-center overflow-hidden">
                      <Document
                        file={file.signedUrl}
                        loading={
                          <div className="flex items-center justify-center w-full h-full">
                            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                          </div>
                        }
                        error={
                          <div className="flex flex-col items-center justify-center w-full h-full text-destructive text-center p-2">
                            <FileText className="w-8 h-8 mb-1" />
                            <span className="text-xs">Error loading PDF</span>
                          </div>
                        }
                        onLoadError={(error) =>
                          console.error(
                            `Error loading PDF ${file.file_name}:`,
                            error
                          )
                        }
                      >
                        {/* Render only the first page, scale to fit width */}
                        <Page
                          pageNumber={1}
                          width={150} // Adjust width as needed for preview size
                          renderAnnotationLayer={false} // Disable annotations for preview
                          renderTextLayer={false} // Disable text selection for preview
                          className="flex items-center justify-center" // Center the page content
                        />
                      </Document>
                    </div>
                  ) : (
                    <FileText className="w-10 h-10 text-muted-foreground" />
                  )}
                </div>
              </CardContent>
            </Card>
          </Link>

          <div className="p-2 border-t border-x border-b border-border rounded-b-md flex justify-between items-center bg-card">
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
        </motion.div>
      ))}
    </motion.div>
  );
}
