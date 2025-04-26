import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai"; // Import OpenAI
import {
  classifyImageWithOpenAI,
  classifyUploadedFileWithOpenAI, // Import the new function
} from "@/lib/openai-classify";
import type { ClassificationResponse } from "@/lib/openai-classify"; // Import the type

export async function POST(request: NextRequest) {
  // Instantiate OpenAI client
  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  });

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    let classificationResult: ClassificationResponse = {
      category: null,
      subcategory: null,
    };
    const fileBuffer = Buffer.from(await file.arrayBuffer());

    // --- Classify based on MIME type ---
    if (file.type.startsWith("image/")) {
      // --- Handle Images ---
      console.log(`Processing image: ${file.name}`);
      const fileBase64 = fileBuffer.toString("base64");
      const fileBase64DataUri = `data:${file.type};base64,${fileBase64}`;
      classificationResult = await classifyImageWithOpenAI(
        openai, // Pass client
        fileBase64DataUri
      );
    } else if (file.type === "application/pdf") {
      // --- Handle PDFs ---
      console.log(`Uploading PDF to OpenAI Files API: ${file.name}`);
      try {
        // 1. Upload PDF to OpenAI Files API
        // Note: The openai SDK expects `file` to be { data: Buffer, filename: string } for buffer uploads - Incorrect type
        // Pass the File object directly, as it's compatible with the expected Uploadable type
        const uploadedFile = await openai.files.create({
          file: file, // Pass the original File object from formData
          // file: { data: fileBuffer, filename: file.name },
          purpose: "user_data",
        });

        const fileId = uploadedFile.id;
        console.log(`PDF uploaded successfully, File ID: ${fileId}`);

        // 2. Classify using the obtained file_id
        classificationResult = await classifyUploadedFileWithOpenAI(
          openai, // Pass client
          fileId,
          file.name
        );
      } catch (uploadError: any) {
        console.error(
          `Failed to upload PDF ${file.name} to OpenAI:`,
          uploadError
        );
        // Keep classificationResult as nulls if upload fails
      }
    } else {
      // --- Handle Other Unsupported Types ---
      console.log(`Unsupported file type for classification: ${file.type}`);
      // classificationResult remains the default nulls
    }

    // Return the classification result
    return NextResponse.json(classificationResult);
  } catch (error: any) {
    console.error("Error in /api/classify-file route:", error);

    let status = 500;
    let message = "Failed to classify file";
    // More specific error checking can be added here if needed
    if (error.message?.includes("OpenAI API key not configured")) {
      message = "Classification service not configured.";
    } else if (error instanceof OpenAI.APIError) {
      message = `Classification service error: ${error.status} ${error.code}`;
      status = error.status || 500;
    }

    return NextResponse.json(
      { error: message, details: error.message },
      { status: status }
    );
  }
}
