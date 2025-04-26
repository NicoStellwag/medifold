"use client";

import type React from "react";

import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Upload, X, FileText, FileType } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

export default function UploadButton() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [open, setOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setFiles(newFiles);

      // Generate previews for image files
      setPreviews([]);
      newFiles.forEach((file) => {
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
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const removeFile = (index: number) => {
    setFiles(files.filter((_, i) => i !== index));
    setPreviews(previews.filter((_, i) => i !== index));
  };

  const uploadFiles = () => {
    if (files.length === 0) return;

    setIsUploading(true);

    // Simulate upload
    setTimeout(() => {
      setIsUploading(false);
      setFiles([]);
      setPreviews([]);
      setOpen(false);
      setShowSuccess(true);

      // Hide success message after a delay
      setTimeout(() => setShowSuccess(false), 3000);
    }, 1500);
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

  const getFileCategory = (file: File) => {
    if (file.type.startsWith("image/")) return "photo";
    if (file.type === "application/pdf") return "health";
    return "diet";
  };

  const getCategoryBadge = (category: string) => {
    switch (category) {
      case "diet":
        return (
          <Badge
            variant="outline"
            className="border-green-200 bg-green-50 text-green-700"
          >
            🍎 Diet
          </Badge>
        );
      case "photo":
        return (
          <Badge
            variant="outline"
            className="border-blue-200 bg-blue-50 text-blue-700"
          >
            📸 Photo
          </Badge>
        );
      case "health":
        return (
          <Badge
            variant="outline"
            className="border-red-200 bg-red-50 text-red-700"
          >
            🏥 Health
          </Badge>
        );
      default:
        return null;
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

      {showSuccess && (
        <div className="fixed left-1/2 top-4 z-50 -translate-x-1/2 transform rounded-full bg-green-100 px-4 py-2 text-sm font-medium text-green-800 shadow-lg">
          🎉 Files uploaded successfully!
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="group h-32 w-32 rounded-full bg-gradient-to-r from-blue-500 to-cyan-400 p-1 shadow-lg transition-all hover:scale-105 hover:shadow-xl"
            onClick={handleUploadClick}
          >
            <div className="flex h-full w-full items-center justify-center rounded-full bg-white transition-colors group-hover:bg-blue-50">
              <Upload
                className="h-12 w-12 text-transparent transition-all group-hover:scale-110"
                style={{ stroke: "url(#uploadGradient)" }}
              />
            </div>
          </Button>
        </DialogTrigger>

        <svg width="0" height="0" style={{ position: "absolute" }}>
          <defs>
            <linearGradient
              id="uploadGradient"
              x1="0%"
              y1="0%"
              x2="100%"
              y2="100%"
            >
              <stop stopColor="#3B82F6" offset="0%" />
              <stop stopColor="#06B6D4" offset="100%" />
            </linearGradient>
          </defs>
        </svg>

        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center text-xl font-bold text-blue-600">
              Upload Files 📤
            </DialogTitle>
          </DialogHeader>

          {files.length > 0 ? (
            <div className="space-y-4">
              <div className="max-h-60 space-y-2 overflow-y-auto">
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
                        <div className="mt-1">
                          {getCategoryBadge(getFileCategory(file))}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-blue-500 hover:bg-blue-50 hover:text-blue-600"
                      onClick={() => removeFile(index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all hover:shadow-md"
                onClick={uploadFiles}
                disabled={isUploading}
              >
                {isUploading
                  ? "Uploading..."
                  : `Upload ${files.length > 1 ? files.length + " files" : ""}`}
              </Button>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10">
              <div className="rounded-full bg-blue-100 p-4">
                <Upload className="h-10 w-10 text-blue-500" />
              </div>
              <p className="mt-4 text-center text-sm font-medium text-blue-600">
                Tap to select files 📁
              </p>
              <p className="mt-2 text-center text-xs text-muted-foreground">
                We accept photos, PDFs, and text files
              </p>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
