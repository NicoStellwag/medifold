// lib/openai-classify.ts
import OpenAI from "openai";
import {
  getCategoryDescriptions,
  TopLevelCategory,
  DietSubcategory,
  HealthSubcategory,
} from "@/lib/image-categories";

// Define expected JSON structure from OpenAI (can be shared or redefined)
interface ClassificationResponse {
  category: TopLevelCategory;
  subcategory: DietSubcategory | HealthSubcategory | string | null;
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY, // Ensure API key is available here
});

export async function classifyImageWithOpenAI(
  imageBase64: string
): Promise<ClassificationResponse> {
  if (!process.env.OPENAI_API_KEY) {
    console.error("OpenAI API key not configured");
    throw new Error("OpenAI API key not configured");
  }

  if (!imageBase64) {
    throw new Error("Missing image data for classification");
  }

  const categoryDescriptions = getCategoryDescriptions();
  const promptText = `Classify the image using ONLY the following categories and subcategories:

${categoryDescriptions}

Respond ONLY with a valid JSON object containing the 'category' and 'subcategory' keys. Use the exact string values provided in the list.
- For category '${
    TopLevelCategory.Diet
  }', choose one subcategory from [${Object.values(DietSubcategory).join(
    ", "
  )}].
- For category '${
    TopLevelCategory.Health
  }', choose one subcategory from [${Object.values(HealthSubcategory).join(
    ", "
  )}].
- For category '${TopLevelCategory.Selfies}', the subcategory MUST be null.

Example valid JSON response: {"category": "diet", "subcategory": "receipts"}
Example valid JSON response: {"category": "selfies", "subcategory": null}

Ensure the output is ONLY a valid JSON object matching this structure and the rules specified.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4o-2024-11-20",
      response_format: { type: "json_object" }, // Enforce JSON mode
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: promptText,
            },
            {
              type: "image_url",
              image_url: {
                url: imageBase64,
                detail: "low",
              },
            },
          ],
        },
      ],
      max_tokens: 150, // Slightly increase tokens just in case for JSON structure
      temperature: 0.1, // Can potentially lower temperature more with JSON mode
    });

    const messageContent = response.choices[0]?.message?.content;

    if (!messageContent) {
      throw new Error("OpenAI did not return valid response content.");
    }

    let classification: ClassificationResponse;
    try {
      // Directly parse the content, no regex needed with JSON mode
      classification = JSON.parse(messageContent);
    } catch (parseError) {
      console.error(
        "Failed to parse OpenAI JSON response (even in JSON mode):",
        messageContent,
        parseError
      );
      // Although unlikely in JSON mode, retain catch block for safety
      throw new Error(
        "Failed to parse classification JSON from OpenAI response."
      );
    }

    if (
      !classification ||
      !classification.category ||
      !Object.values(TopLevelCategory).includes(classification.category)
    ) {
      console.error(
        "Invalid classification structure received:",
        classification
      );
      throw new Error("Received invalid classification structure from OpenAI.");
    }

    // --- Enhanced Validation using Enums ---
    let isValid = false;
    if (classification && classification.category) {
      const { category, subcategory } = classification;

      if (!Object.values(TopLevelCategory).includes(category)) {
        // Invalid top-level category
      } else if (category === TopLevelCategory.Diet) {
        isValid =
          subcategory !== null &&
          Object.values(DietSubcategory).includes(
            subcategory as DietSubcategory
          );
      } else if (category === TopLevelCategory.Health) {
        isValid =
          subcategory !== null &&
          Object.values(HealthSubcategory).includes(
            subcategory as HealthSubcategory
          );
      } else if (category === TopLevelCategory.Selfies) {
        isValid = subcategory === null;
      } else {
        // Handle potential future categories or errors
        // Currently, this branch shouldn't be hit if TopLevelCategory check passed
      }
    }

    if (!isValid) {
      console.error(
        "Invalid/Incomplete classification structure received:",
        classification
      );
      throw new Error(
        "Received invalid or incomplete classification structure from OpenAI."
      );
    }
    // --- End Enhanced Validation ---

    return classification;
  } catch (error: any) {
    console.error("Error during OpenAI API call:", error);
    // Re-throw the error to be caught by the caller (API route)
    throw new Error(`OpenAI classification failed: ${error.message}`);
  }
}
