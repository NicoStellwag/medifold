import { NextRequest, NextResponse } from "next/server";
import { classifyImageWithOpenAI } from "@/lib/openai-classify"; // Import the new function

export async function POST(request: NextRequest) {
  try {
    const { imageBase64 } = await request.json();

    // Call the extracted function
    const classification = await classifyImageWithOpenAI(imageBase64);

    // Return the successful classification
    return NextResponse.json(classification);
  } catch (error: any) {
    // Log the specific error from the classification function or request parsing
    console.error("Error in /api/classify-image route:", error);

    // Determine appropriate status code based on error type if needed
    let status = 500;
    if (error.message === "Missing image data for classification") {
      status = 400;
    } else if (error.message === "OpenAI API key not configured") {
      status = 500; // Internal server error
    }

    // Return a generic error response
    return NextResponse.json(
      { error: "Failed to classify image", details: error.message },
      { status: status } // Use determined status
    );
  }
}
