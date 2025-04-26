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
  DialogClose,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";
import { createClient } from "@/utils/supabase/client";
import { v4 as uuidv4 } from "uuid";
import {
  TopLevelCategory,
  DietSubcategory,
  HealthSubcategory,
} from "@/lib/image-categories";
import { cn } from "@/lib/utils";

// Helper function to generate natural language success messages
function generateSuccessMessage(result: {
  file_name: string;
  category: TopLevelCategory | string | null;
  subcategory: DietSubcategory | HealthSubcategory | string | null;
}): string {
  const { category, subcategory } = result;
  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

  if (!category) {
    return `Added ${result.file_name} (Uncategorized).`;
  }

  switch (category) {
    case TopLevelCategory.Diet:
      const dietSub = subcategory as DietSubcategory | null;
      return `Added ${
        dietSub === DietSubcategory.Receipts
          ? "a receipt"
          : dietSub === DietSubcategory.FoodImages
          ? "a food image"
          : "a diet file"
      } to ${capitalize(category)}.`;

    case TopLevelCategory.Selfies:
      return `Added a selfie to ${capitalize(category)}.`;

    case TopLevelCategory.Health:
      const healthSub = subcategory as HealthSubcategory | null;
      let healthFileType = "a health document";
      if (healthSub === HealthSubcategory.PatientRecords)
        healthFileType = "a patient record";
      else if (healthSub === HealthSubcategory.DiagnosticReports)
        healthFileType = "a diagnostic report";
      else if (healthSub === HealthSubcategory.Prescriptions)
        healthFileType = "a prescription";
      else if (healthSub === HealthSubcategory.SurgicalDocuments)
        healthFileType = "a surgical document";
      return `Added ${healthFileType} to ${capitalize(category)}.`;

    default:
      const catDisplay = capitalize(category);
      return `Added a file to ${catDisplay}.`;
  }
}

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

  // Helper function to convert File to base64
  const fileToBase64 = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });

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

      // --- Format Success Toast Description ---
      const successMessages = uploadResults.map(generateSuccessMessage);
      const descriptionText = successMessages.join("\n");

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
    if (file.type.startsWith("image/") && previews[index]) {
      return (
        <div className="relative h-10 w-10 overflow-hidden rounded">
          <Image
            src={previews[index] || "/placeholder.svg"}
            alt={file.name}
            fill
            className="object-cover"
          />
        </div>
      );
    }

    if (file.type === "application/pdf")
      return <FileText className="h-5 w-5" />;
    return <FileType className="h-5 w-5" />;
  };

  const getCategoryBadge = (
    category: string | null,
    subcategory: string | null
  ) => {
    switch (category) {
      case TopLevelCategory.Diet:
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700"
          >
            🍎 Diet {subcategory ? `(${subcategory})` : ""}
          </Badge>
        );
      case TopLevelCategory.Selfies:
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700"
          >
            📸 Selfies
          </Badge>
        );
      case TopLevelCategory.Health:
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-red-700"
          >
            🏥 Health {subcategory ? `(${subcategory})` : ""}
          </Badge>
        );
      default:
        return <Badge variant="secondary">{category || "Unknown"}</Badge>;
    }
  };

  return (
    <>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        multiple
        accept=".jpg,.jpeg,.png,.pdf,.txt"
      />

      <Dialog open={open} onOpenChange={onDialogChange}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="group h-32 w-32 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 p-1 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            onClick={handleTriggerClick}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-card transition-colors group-hover:bg-muted">
              <Upload className="h-12 w-12 text-foreground transition-all group-hover:scale-110" />
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent
          className="sm:max-w-md"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onInteractOutside={(e) => {
            if (isUploading) {
              e.preventDefault();
            }
          }}
          onEscapeKeyDown={(e) => {
            if (isUploading) {
              e.preventDefault();
            }
          }}
        >
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-blue-600">
              Upload Files 📤
            </DialogTitle>
            <DialogDescription className="text-center text-sm text-muted-foreground">
              Drag & drop files below or click the area to browse
            </DialogDescription>
          </DialogHeader>

          {files.length === 0 ? (
            <div
              className={cn(
                "mt-4 flex h-40 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 p-6 text-center transition-colors hover:border-primary/50",
                isDragging ? "border-primary bg-primary/10" : "bg-muted/20"
              )}
              onClick={handleUploadClick}
            >
              <Upload className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm font-medium text-foreground">
                Drop files here
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or click to browse
              </p>
            </div>
          ) : (
            <div className="mt-4 space-y-4">
              {isUploading ? (
                <div className="flex flex-col items-center justify-center space-y-4 p-4">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
                  <p className="text-sm font-medium text-muted-foreground">
                    Uploading {files.length} file{files.length !== 1 ? "s" : ""}
                    ...
                  </p>
                </div>
              ) : (
                <>
                  <div className="max-h-60 space-y-2 overflow-y-auto border p-2 rounded-md">
                    {files.map((file, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between rounded-md border border-blue-100 bg-white p-2 shadow-sm"
                      >
                        <div className="flex items-center gap-2">
                          <div className="flex h-10 w-10 items-center justify-center rounded bg-blue-50">
                            {getFileIcon(file, index)}
                          </div>
                          <div className="overflow-hidden">
                            <p className="truncate text-sm font-medium">
                              {file.name}
                            </p>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                          onClick={() => removeFile(index)}
                          disabled={isUploading}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <Button
                    className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all hover:shadow-md"
                    onClick={uploadFiles}
                    disabled={!userId || files.length === 0 || isUploading}
                  >
                    {isUploading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Uploading...
                      </>
                    ) : (
                      `Upload ${
                        files.length > 1 ? `${files.length} files` : `1 file`
                      }`
                    )}
                  </Button>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
