"use client";

import type React from "react";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, FileType, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import Image from "next/image";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
import {
  TopLevelCategory,
  DietSubcategory,
  HealthSubcategory,
} from "@/lib/image-categories";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export default function UploadButton() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [open, setOpen] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Get user data on component mount
  useEffect(() => {
    const getUserData = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
      }
    };
    getUserData();
  }, []);

  // --- Simplified File Handling (Dialog controls open state) ---
  const handleFilesSelected = (selectedFiles: File[]) => {
    if (selectedFiles.length === 0) return;

    setFiles(selectedFiles);
    setPreviews([]); // Reset previews

    // Generate previews
    selectedFiles.forEach((file) => {
      if (file.type.startsWith("image/")) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setPreviews((prev) => [...prev, e.target?.result as string]);
        };
        reader.readAsDataURL(file);
      } else {
        setPreviews((prev) => [...prev, ""]);
      }
    });
    // No need to setOpen(true) here, Dialog handles it
  };

  // --- Event Handlers ---
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFilesSelected(Array.from(e.target.files));
    }
    if (e.target) e.target.value = ""; // Reset input
  };

  const handleTriggerClick = () => {
    // This function isn't strictly needed if the button is just a trigger,
    // but keep it in case we want to add logic later before opening.
    // setOpen(true); // DialogTrigger handles opening
  };

  const handleUploadClick = () => {
    // Specifically triggers the hidden file input
    fileInputRef.current?.click();
  };

  // Drag handlers for the *dialog content* area
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    // Check if leaving to outside the window, might need refinement
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFilesSelected(Array.from(e.dataTransfer.files));
    }
  };

  const removeFile = (index: number) => {
    if (isUploading) return;
    const updatedFiles = files.filter((_, i) => i !== index);
    const updatedPreviews = previews.filter((_, i) => i !== index);
    setFiles(updatedFiles);
    setPreviews(updatedPreviews);
  };

  // --- Dialog Open Change Handler ---
  const onDialogChange = (isOpen: boolean) => {
    if (isUploading && !isOpen) {
      return;
    }
    setOpen(isOpen);
    if (!isOpen) {
      // Clear files when dialog is closed manually (and not uploading)
      setFiles([]);
      setPreviews([]);
      setIsDragging(false); // Reset drag state
    }
  };

  const uploadFiles = async () => {
    if (files.length === 0 || !userId || isUploading) return;

    setIsUploading(true);
    const filesToUpload = [...files]; // Copy files to process
    const totalFiles = filesToUpload.length;

    // --- Process uploads ---
    try {
      const uploadPromises = filesToUpload.map(async (file) => {
        let category: TopLevelCategory | string | null = null;
        let subcategory: DietSubcategory | HealthSubcategory | string | null =
          null;

        // --- Classification Logic (Moved to Backend API) ---
        try {
          const formData = new FormData();
          formData.append("file", file); // Send the actual file

          // Use the new API endpoint
          const response = await fetch("/api/classify-file", {
            method: "POST",
            body: formData, // Send FormData, headers are set automatically
          });

          const contentType = response.headers.get("content-type");

          if (!response.ok) {
            let errorDetails = `Status: ${response.status}`;
            if (contentType && contentType.includes("application/json")) {
              // Only parse as JSON if the content type is correct
              const errorData = await response.json();
              errorDetails += `, Error: ${
                errorData?.error || "Unknown JSON error"
              }`;
            } else {
              // Handle non-JSON error response (e.g., HTML error page)
              const errorText = await response.text();
              errorDetails += `, Response: ${errorText.substring(0, 100)}...`; // Log snippet of the HTML/text
            }
            console.warn(
              `Classification failed for ${file.name}: ${errorDetails}`
            );
            // Keep category/subcategory null as classification failed
          } else {
            // Check content type even for successful responses
            if (contentType && contentType.includes("application/json")) {
              const classification = await response.json();
              category = (classification.category as TopLevelCategory) || null;
              subcategory = classification.subcategory as
                | DietSubcategory
                | HealthSubcategory
                | null;
            } else {
              // Handle unexpected non-JSON success response
              const responseText = await response.text();
              console.warn(
                `Classification succeeded for ${
                  file.name
                } but received unexpected non-JSON response: ${responseText.substring(
                  0,
                  100
                )}...`
              );
              // Treat as unclassified or decide on specific handling
              category = null;
              subcategory = null;
            }
          }
        } catch (classifyError: any) {
          console.error(
            `Error during classification API call for ${file.name}:`,
            classifyError
          );
          // Keep category/subcategory null on network or other fetch errors
          category = null;
          subcategory = null;
        }
        // --- End Classification Logic ---

        const fileExt = file.name.split(".").pop();
        const fileName = `${uuidv4()}.${fileExt}`;
        const filePath = `${userId}/${fileName}`;

        // --- Storage Upload ---
        const { data: storageData, error: storageError } =
          await supabase.storage.from("user-uploads").upload(filePath, file, {
            cacheControl: "3600",
            upsert: false,
          });

        if (storageError) {
          console.error("Storage error:", storageError);
          throw new Error(
            `Storage error for ${file.name}: ${storageError.message}`
          );
        }

        // --- Database Insertion ---
        const { data: dbData, error: dbError } = await supabase
          .from("uploaded_files")
          .insert({
            user_id: userId,
            file_name: file.name, // Store original file name
            storage_path: filePath, // Store the unique path in storage
            mime_type: file.type,
            size_bytes: file.size,
            category: category,
            subcategory: subcategory,
          })
          .select();

        if (dbError) {
          console.error("Database error:", dbError);
          try {
            await supabase.storage.from("user-uploads").remove([filePath]);
            console.log(`Rolled back storage for ${filePath} due to DB error.`);
          } catch (removeError) {
            console.error(
              `Failed to remove file ${filePath} from storage after DB error:`,
              removeError
            );
          }
          throw new Error(
            `Database error for ${file.name}: ${dbError.message}`
          );
        }

        // Return data including classification for success message generation
        return {
          file_name: file.name,
          category,
          subcategory,
          storageData,
          dbData,
        };
      });

      const uploadResults = await Promise.all(uploadPromises);

      // --- Success Notification & Cleanup ---
      setOpen(false);
      setFiles([]);
      setPreviews([]);
    } catch (error: any) {
      console.error("Error during upload process:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const getFileIcon = (file: File, index: number) => {
    if (previews[index]) {
      // eslint-disable-next-line @next/next/no-img-element
      return (
        <img
          src={previews[index]}
          alt={`Preview ${file.name}`}
          className="h-8 w-8 rounded-sm object-cover"
        />
      );
    } else if (file.type.includes("pdf")) {
      return <FileType className="h-8 w-8 text-red-500" />;
    } else {
      return <FileText className="h-8 w-8 text-muted-foreground" />;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onDialogChange}>
      <DialogTrigger asChild>
        <motion.div
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            size="lg"
            className="group h-32 w-32 rounded-full bg-gradient-to-r from-primary to-secondary p-1 shadow-xl transition-all hover:shadow-2xl"
            onClick={handleTriggerClick}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-card transition-colors group-hover:bg-primary/10">
              <Upload className="h-12 w-12 text-primary transition-all group-hover:scale-110" />
            </div>
          </Button>
        </motion.div>
      </DialogTrigger>
      <DialogContent
        className={cn(
          "sm:max-w-[525px] rounded-2xl border-0 shadow-xl overflow-hidden bg-card",
          isDragging && "border-dashed border-primary"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onCloseAutoFocus={(e) => {
          // Prevent focus trap issues if needed, often not required
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-50 z-0" />
        <div className="relative z-10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-primary">
              Upload Files
            </DialogTitle>
            <DialogDescription className="text-muted-foreground">
              Select or drag and drop your health documents here. PDF and image
              files accepted.
            </DialogDescription>
          </DialogHeader>

          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            multiple // Allow multiple file selection
            accept="application/pdf,image/*" // Accept PDFs and all image types
          />

          {/* Drop Zone / Upload Button */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 17 }}
            className={cn(
              "mt-6 flex h-32 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed transition-colors hover:border-primary/40",
              isDragging ? "border-primary bg-primary/10" : "border-border"
            )}
            onClick={handleUploadClick} // Trigger file input on click
          >
            <Upload className="mb-2 h-8 w-8 text-primary" />
            <p className="text-sm text-muted-foreground">
              {isDragging
                ? "Drop files here..."
                : "Click or drag files to upload"}
            </p>
          </motion.div>

          {/* File List */}
          {files.length > 0 && (
            <div className="mt-6 max-h-60 space-y-2 overflow-y-auto">
              <h4 className="text-sm font-medium text-foreground">
                Selected File:
              </h4>
              {files.map((file, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="flex items-center justify-between rounded-xl border border-border bg-card p-3 pr-2 shadow-sm"
                >
                  <div className="flex min-w-0 items-center gap-3">
                    {getFileIcon(file, index)}
                    <div className="flex min-w-0 flex-col">
                      <span className="truncate max-w-xs text-sm font-medium text-foreground">
                        {file.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground hover:text-destructive"
                    onClick={() => removeFile(index)}
                    disabled={isUploading} // Disable remove during upload
                  >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Remove file</span>
                  </Button>
                </motion.div>
              ))}
            </div>
          )}

          {/* Upload Action Button */}
          {files.length > 0 && (
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="mt-6"
            >
              <Button
                onClick={uploadFiles}
                disabled={isUploading || files.length === 0}
                className="w-full bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground font-semibold rounded-xl py-6 shadow-md"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading...
                  </>
                ) : (
                  `Upload ${files.length} File${files.length > 1 ? "s" : ""}`
                )}
              </Button>
            </motion.div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// --- Helper Functions (Consider moving to utils if complex) ---
// (You might place helper functions related to file icons or previews here)
// Example (basic):
// const getFileIcon = (mimeType: string) => { ... };
