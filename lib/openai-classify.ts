// lib/openai-classify.ts
import OpenAI from "openai";
import {
  getCategoryDescriptions,
  TopLevelCategory,
  DietSubcategory,
  HealthSubcategory,
} from "@/lib/image-categories";
// import type { RequestData } from "openai/uploads"; // Removed unused import

// Define expected JSON structure from OpenAI (can be shared or redefined)
export interface ClassificationResponse {
  category: TopLevelCategory | string | null; // Allow null for failed/unknown
  subcategory: DietSubcategory | HealthSubcategory | string | null;
}

// OpenAI client is now instantiated in the API route and passed here
// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

// Function to validate the classification result
function validateClassification(
  classification: any
): classification is ClassificationResponse {
  if (!classification) return false;

  const { category, subcategory } = classification;

  // Allow null category/subcategory for cases where classification isn't possible
  if (category === null) return true; // Consider null category valid if sub is also null? Or require both null? Let's allow null category.

  if (!Object.values(TopLevelCategory).includes(category as TopLevelCategory)) {
    console.warn(`Invalid top-level category received: ${category}`);
    return false; // Invalid top-level category string
  }

  if (category === TopLevelCategory.Diet) {
    return (
      subcategory !== null &&
      Object.values(DietSubcategory).includes(subcategory as DietSubcategory)
    );
  } else if (category === TopLevelCategory.Health) {
    return (
      subcategory !== null &&
      Object.values(HealthSubcategory).includes(
        subcategory as HealthSubcategory
      )
    );
  } else if (category === TopLevelCategory.Selfies) {
    return subcategory === null;
  }
  // Should not be reached if top-level check passed
  return false;
}

// Base prompt generation logic
function getBasePrompt(fileName: string): string {
  const categoryDescriptions = getCategoryDescriptions();
  return `Analyze the provided file (${fileName}) and classify it using ONLY the following categories and subcategories:

${categoryDescriptions}

Based *solely* on the visual content and/or text content, determine the most appropriate category and subcategory.

Respond ONLY with a valid JSON object containing the 'category' and 'subcategory' keys. Use the exact string values provided in the list.
- For category '${
    TopLevelCategory.Diet
  }', choose one subcategory from [${Object.values(DietSubcategory).join(", ")}]
- For category '${
    TopLevelCategory.Health
  }', choose one subcategory from [${Object.values(HealthSubcategory).join(
    ", "
  )}]
- For category '${TopLevelCategory.Selfies}', the subcategory MUST be null.

Example valid JSON response: {"category": "diet", "subcategory": "receipts"}
Example valid JSON response: {"category": "health", "subcategory": "patient_records"}
Example valid JSON response: {"category": "selfies", "subcategory": null}

If the file content does not clearly fit into any of these categories, respond with: {"category": null, "subcategory": null}

Ensure the output is ONLY a valid JSON object.`;
}

// Handles image classification using base64 data URI
export async function classifyImageWithOpenAI(
  openai: OpenAI, // Pass client instance
  fileBase64DataUri: string
): Promise<ClassificationResponse> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not configured");
    throw new Error("OpenAI API key not configured");
  }
  if (!fileBase64DataUri) {
    throw new Error("Missing image data URI for classification");
  }

  // Extract a simple name for the prompt if possible, otherwise use placeholder
  const fileName = fileBase64DataUri.substring(0, 30) + "...";
  const promptText = getBasePrompt(fileName);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            {
              type: "image_url",
              image_url: { url: fileBase64DataUri, detail: "low" },
            },
          ],
        },
      ],
      max_tokens: 150,
      temperature: 0.1,
    });

    const messageContent = response.choices[0]?.message?.content;

    if (!messageContent) {
      console.warn(
        `OpenAI did not return response content for image: ${fileName}`
      );
      return { category: null, subcategory: null };
    }

    let classification: any;
    try {
      classification = JSON.parse(messageContent);
    } catch (parseError) {
      console.error(
        `Failed to parse OpenAI JSON response for image: ${fileName}`,
        messageContent,
        parseError
      );
      return { category: null, subcategory: null };
    }

    if (!validateClassification(classification)) {
      console.warn(
        `Invalid classification structure received for image: ${fileName}`,
        classification
      );
      return { category: null, subcategory: null };
    }

    return classification;
  } catch (error: any) {
    console.error(`Error during OpenAI image classification API call:`, error);
    return { category: null, subcategory: null };
  }
}

// Handles file classification using a file_id from a previous upload
export async function classifyUploadedFileWithOpenAI(
  openai: OpenAI, // Pass client instance
  fileId: string,
  fileName: string
): Promise<ClassificationResponse> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not configured");
    throw new Error("OpenAI API key not configured");
  }
  if (!fileId) {
    throw new Error("Missing file ID for classification");
  }

  const promptText = getBasePrompt(fileName);

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      response_format: { type: "json_object" },
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: promptText },
            // Reference the uploaded file using the nested structure
            {
              type: "file", // Use type "file"
              file: { file_id: fileId }, // Nest file_id within a file object
            },
            // { type: "file_id", file_id: fileId }, // This structure caused type errors
          ],
        },
      ],
      max_tokens: 150,
      temperature: 0.1,
    });

    const messageContent = response.choices[0]?.message?.content;

    if (!messageContent) {
      console.warn(
        `OpenAI did not return response content for file ID: ${fileId}`
      );
      return { category: null, subcategory: null };
    }

    let classification: any;
    try {
      classification = JSON.parse(messageContent);
    } catch (parseError) {
      console.error(
        `Failed to parse OpenAI JSON response for file ID: ${fileId}`,
        messageContent,
        parseError
      );
      return { category: null, subcategory: null };
    }

    if (!validateClassification(classification)) {
      console.warn(
        `Invalid classification structure received for file ID: ${fileId}`,
        classification
      );
      return { category: null, subcategory: null };
    }

    return classification;
  } catch (error: any) {
    console.error(
      `Error during OpenAI file classification API call for file ID ${fileId}:`,
      error
    );
    return { category: null, subcategory: null };
  }
}
