import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@/utils/supabase/server";
import OpenAI from "openai";
import { ChatCompletionContentPart } from "openai/resources/index.mjs";
import { FileObject } from "openai/resources/files.mjs";

// Ensure your OPENAI_API_KEY environment variable is set
const openai = new OpenAI();

// Define the expected structure for the AI's response
interface HealthTips {
  statusQuo: string; // Added: Quick summary of current state
  painPoints: { point: string; reason: string }[]; // Added: Key areas needing attention
  dietTips: { tip: string; reason: string }[];
  habitTips: { tip: string; reason: string }[];
  supplementProposals: { supplement: string; reason: string }[];
  fitnessTips: { tip: string; reason: string }[]; // New section for sports/fitness/exercise tips
  shoppingList: { item: string; count: string; reason: string }[];
}

// Helper to convert ArrayBuffer to Base64
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = "";
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export async function GET() {
  const cookieStore = cookies();
  const supabase = createClient(cookieStore);
  const MAX_CONTEXT_TOKENS_APPROX = 20000;
  const uploadedOpenAIFileIds: string[] = []; // Keep track of files uploaded to OpenAI for cleanup

  try {
    // 1. Get Authenticated User
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User fetch error:", userError);
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Fetch User Data (including mime_type for files)
    const [notesResult, filesResult, userProfileResult, integrationsResult] =
      await Promise.all([
        supabase
          .from("notes")
          .select("text, created_at")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("uploaded_files")
          .select(
            "id, file_name, created_at, category, subcategory, storage_path, mime_type"
          ) // Added mime_type and storage_path
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        supabase
          .from("users")
          .select("name, age, weight, height, sex")
          .eq("id", user.id)
          .single(),
        supabase
          .from("integrations_data")
          .select("*")
          .eq("user_id", user.id)
          .order("id", { ascending: false }),
      ]);

    if (notesResult.error)
      throw new Error(`Notes fetch error: ${notesResult.error.message}`);
    if (filesResult.error)
      throw new Error(`Files fetch error: ${filesResult.error.message}`);
    if (integrationsResult.error)
      throw new Error(
        `Integrations fetch error: ${integrationsResult.error.message}`
      );
    // For user profile, don't throw an error if not found - it's optional

    const notes = notesResult.data || [];
    const files = filesResult.data || [];
    const userProfile = userProfileResult.data || null;
    const integrations = integrationsResult.data || [];

    // 3. Prepare Multimodal Prompt Content Array
    let currentTokenCount = 0;
    const userPromptParts: Array<ChatCompletionContentPart> = [];

    // --- Add Current Time and Initial Text ---
    const now = new Date();
    let initialText = `Current Date & Time: ${now.toISOString()}\nUser Health Data Context (sorted by timestamp where available):\n---\n`;

    // --- Add User Profile Data ---
    if (userProfile) {
      initialText += "== User Profile ==\n";
      if (userProfile.name) initialText += `Name: ${userProfile.name}\n`;
      if (userProfile.age) initialText += `Age: ${userProfile.age} years\n`;
      if (userProfile.weight)
        initialText += `Weight: ${userProfile.weight} kg\n`;
      if (userProfile.height)
        initialText += `Height: ${userProfile.height} cm\n`;
      if (userProfile.sex) initialText += `Sex: ${userProfile.sex}\n`;
      initialText += "---\n";
    }

    userPromptParts.push({ type: "text", text: initialText });
    currentTokenCount += initialText.length / 4;

    // --- Process Notes (Sorted by Supabase query already) ---
    let notesText = "== Notes ==\n";
    if (notes.length > 0) {
      notes.forEach((note) => {
        const timestamp = new Date(note.created_at).toISOString(); // Use ISO timestamp
        const noteEntry = `[Note Timestamp: ${timestamp}]\n${note.text}\n---\n`; // Clearly label timestamp and add separator
        if (
          currentTokenCount + noteEntry.length / 4 <
          MAX_CONTEXT_TOKENS_APPROX
        ) {
          notesText += noteEntry;
          currentTokenCount += noteEntry.length / 4;
        } else {
          notesText += "[Note Truncated - context limit]\n---\n";
          return;
        }
      });
    } else {
      notesText += "No notes available.\n---\n";
    }
    userPromptParts.push({ type: "text", text: notesText });

    // --- Process Files (Sorted by Supabase query already) ---
    let filesText = "== Uploaded Files (metadata & content references) ==\n";
    const fileProcessingPromises = [];

    for (const file of files) {
      if (currentTokenCount > MAX_CONTEXT_TOKENS_APPROX) {
        filesText += "[File Truncated - context limit]\n---\n";
        break;
      }

      const timestamp = new Date(file.created_at).toISOString(); // Use ISO timestamp
      const categoryInfo = file.category
        ? `Category: ${file.category}${
            file.subcategory ? "/" + file.subcategory : ""
          }`
        : "Category: unknown";
      const fileMetadata = `[File Name: ${
        file.file_name
      }, Timestamp: ${timestamp}, Type: ${
        file.mime_type || "unknown"
      }, ${categoryInfo}]\n`;
      filesText += fileMetadata;
      currentTokenCount += fileMetadata.length / 4;

      // --- Handle Images ---
      if (file.mime_type?.startsWith("image/") && file.storage_path) {
        const imageTokenCost = 800;
        if (currentTokenCount + imageTokenCost < MAX_CONTEXT_TOKENS_APPROX) {
          fileProcessingPromises.push(
            supabase.storage
              .from("user-uploads")
              .download(file.storage_path)
              .then(async ({ data, error }) => {
                if (error || !data) return null;
                try {
                  const buffer = await data.arrayBuffer();
                  const base64 = arrayBufferToBase64(buffer);
                  currentTokenCount += imageTokenCost;
                  return {
                    type: "image_url" as const,
                    image_url: {
                      url: `data:${file.mime_type};base64,${base64}`,
                      detail: "low",
                    },
                  };
                } catch (e) {
                  return null;
                }
              })
          );
          filesText += "  (Image content included below)\n---\n";
        } else {
          filesText += "  (Image content skipped - context limit)\n---\n";
        }
        // --- Handle PDFs ---
      } else if (file.mime_type === "application/pdf" && file.storage_path) {
        const pdfTokenCost = 1500;
        if (currentTokenCount + pdfTokenCost < MAX_CONTEXT_TOKENS_APPROX) {
          fileProcessingPromises.push(
            supabase.storage
              .from("user-uploads")
              .download(file.storage_path)
              .then(async ({ data: pdfBlob, error }) => {
                if (error || !pdfBlob) return null;
                try {
                  const pdfFile = new File(
                    [pdfBlob],
                    file.file_name || "upload.pdf",
                    { type: file.mime_type }
                  );
                  const openAIFile: FileObject = await openai.files.create({
                    file: pdfFile,
                    purpose: "vision",
                  });
                  uploadedOpenAIFileIds.push(openAIFile.id);
                  currentTokenCount += pdfTokenCost;
                  console.log(
                    `Uploaded PDF ${pdfFile.name} to OpenAI, ID: ${openAIFile.id}`
                  );
                  return {
                    type: "file" as const,
                    file: { file_id: openAIFile.id },
                  } as ChatCompletionContentPart;
                } catch (uploadError) {
                  return null;
                }
              })
          );
          // Get the pending ID for the text reference (it hasn't resolved yet)
          const pendingFileId = `pending-upload-${fileProcessingPromises.length}`;
          filesText += `  (PDF content included via file reference - ID: ${pendingFileId})\n---\n`;
        } else {
          filesText += "  (PDF content skipped - context limit)\n---\n";
        }
      } else {
        // For other file types, just add the metadata separator
        filesText += "  (Content not processed for this file type)\n---\n";
      }
    }
    userPromptParts.push({ type: "text", text: filesText });

    // --- Process Integrations Data ---
    let integrationsText = "== Integrations Data ==\n";

    // Process Strava data
    const stravaIntegrations = integrations.filter(
      (integration) => integration.integration_type === "strava"
    );
    if (stravaIntegrations.length > 0) {
      integrationsText += "=== Strava Integration Data ===\n";

      stravaIntegrations.forEach((integration) => {
        if (Array.isArray(integration.content)) {
          integrationsText += `[Strava Activities - ${integration.content.length} activities found]\n`;

          integration.content.forEach((activity: any, index: number) => {
            integrationsText += `Activity ${index + 1}: ${activity.name} (${
              activity.type
            })\n`;
            integrationsText += `- Distance: ${(
              activity.distance / 1000
            ).toFixed(2)} km\n`;
            integrationsText += `- Duration: ${Math.floor(
              activity.moving_time / 60
            )}:${(activity.moving_time % 60)
              .toString()
              .padStart(2, "0")} minutes\n`;
            integrationsText += `- Date: ${new Date(
              activity.start_date_local
            ).toLocaleDateString()}\n`;
            integrationsText += `- Average Speed: ${(
              activity.average_speed * 3.6
            ).toFixed(1)} km/h\n`;

            if (activity.total_elevation_gain > 0) {
              integrationsText += `- Elevation Gain: ${activity.total_elevation_gain} m\n`;
            }

            if (activity.average_cadence) {
              integrationsText += `- Average Cadence: ${Math.round(
                activity.average_cadence
              )} spm\n`;
            }

            integrationsText += "---\n";
          });
        }
      });
    } else {
      integrationsText += "No Strava integration data available.\n---\n";
    }

    // Add other integrations here if needed in the future

    userPromptParts.push({ type: "text", text: integrationsText });

    // --- Wait for file processing and add parts ---
    const fetchedFileParts = (await Promise.all(fileProcessingPromises)).filter(
      Boolean
    );
    userPromptParts.push(
      ...(fetchedFileParts as Array<ChatCompletionContentPart>)
    );

    // 4. Construct OpenAI Prompt Messages
    const systemPrompt = `You are a highly specialized AI health assistant. Your ONLY task is to analyze the provided user health data context (notes, file metadata, images, PDFs, and integration data) and generate a health status summary and specific, actionable, and highly personalized tips. You MUST adhere to the following strict rules:

    **Understanding the Data Context:**
    The data includes user profile information, notes, file metadata, potentially image/PDF content, and health integration data. Timestamps indicate when data was recorded or added.
    - **User Profile:** Basic demographic information like age, weight, height, and sex. Use this data to personalize recommendations and identify potential health concerns based on standard medical guidelines.
    - **Notes:** User-reported feelings, symptoms, updates. Timestamps indicate when the note was recorded.
    - **Files:** Categorized health data (diet, selfies, health) with subcategories providing more detail.
        - **diet:** Files related to the user's food consumption (e.g., receipts, food logs, nutritional info). **Use this data primarily to understand the user's *dietary habits and patterns* (e.g., frequent consumption of certain foods, potential lack of others). DO NOT assume these items are currently available ingredients. Base diet tips on nutritional needs or health conditions indicated by the *overall* data analysis (including health files and notes), using these diet files as evidence for current habits, not as a limitation.**
        - **selfies:** Images of the user. Analyze for visual health cues.
        - **health:** Medical documents (e.g., lab results, blood work results, doctor notes, prescriptions, wearable data). **Crucially, analyze the CONTENT of any attached PDF files within this category, as they often contain vital health information like lab results or doctor's notes. Give PDF content equal importance to images and notes for a comprehensive understanding.** Analyze content for relevant health information.
    - **Integrations Data:** Data from connected health and fitness services.
        - **Strava:** Exercise activity data including run/walk/cycling distances, durations, speeds, and cadence. Use this data to understand the user's exercise patterns, fitness level, and make activity-specific recommendations. Consider:
            - Activity types (running, walking, cycling) to tailor exercise advice
            - Distance and duration to understand endurance levels
            - Speed and cadence metrics for performance assessment
            - Frequency and consistency of activities for habit formation insights
            - Recent exercises for establishing current fitness trends
            - Elevation data to gauge intensity level and terrain variation
            - Specific personalized fitness tips based on the exact activities observed
    - **Current Time:** Provided for temporal reference.

    **Strict Rules for Response Generation:**
    1.  **Status Quo Summary:** Begin with a concise (1-2 sentence) 'statusQuo' summarizing the user's current health situation based *only* on the provided data.
    2.  **Pain Points Identification:** Identify 2-4 key 'painPoints' (areas needing attention or potential issues) derived *directly* from analyzing the data. For each pain point, provide a brief 'reason' referencing the supporting data in a user-friendly way (similar to tip reasons).
    3.  **Holistic Analysis for Tips:** Synthesize information from ALL provided data points (user profile, notes, files, images, PDFs, and integrations data) for generating tips. **Ensure you are analyzing the *content* of images AND PDFs where provided, not just their metadata.** Do not overly focus on a single piece of information. Your insights should reflect a comprehensive understanding of the user's context.
    4.  **Nuanced Recency Prioritization:** While recent data (e.g., from the last few days or weeks) is generally more significant, critically evaluate the relevance of all data. A health report from 5 days ago is likely still very important, even if a note was added yesterday. Older data (e.g., several months) might be less relevant unless it indicates a chronic condition or baseline. Use your judgment to weigh the importance based on the data type and content. For diet data specifically, look for trends over time, not just the most recent meal.
    5.  **Strict Grounding & Critical Analysis:** Base EVERY pain point and tip EXCLUSIVELY on the provided data. Analyze the data critically – especially diet data (focusing on habits and nutritional implications) and exercise data (focusing on frequency, intensity, and patterns). Do not assume consumption patterns or exercise habits are healthy; suggest improvements if the data indicates a need. DO NOT invent information.
    6.  **User-Friendly Referencing:** In the 'reason' field for pain points and tips, explain the basis in user-friendly terms, referring to the type and timing of the data, but *without* exposing raw filenames or exact technical timestamps. Examples:
        - Correct: \"Based on your recent grocery shopping showing frequent high-sugar purchases over the past weeks.\"\n        - Correct: \"Based on your recent note about feeling tired.\"\n        - Correct: \"Based on the lab report you uploaded last week.\"\n        - Correct: \"Based on analyzing the meal photo from yesterday.\"\n        - Correct: \"Based on your BMI calculated from your profile information.\"\n        - Correct: \"Based on your recent running activities from Strava showing frequent short distances.\"\n        - Incorrect: \"Based on file receipt_jan25.pdf timestamp 2024-01-25T10:00:00Z.\"\n        (Internally, you MUST still use the specific data points and timestamps for your analysis and prioritization.)
    7.  **No Generic Advice:** AVOID general health recommendations UNLESS the data specifically indicates a relevant problem (e.g., a recent pattern of notes mentioning poor sleep warrants a sleep tip or mentioning it as a pain point).
    8.  **Individuality & Actionability:** Focus on tips tailored to *this user\'s* unique situation (synthesizing user profile data, recent data, trends, and critical analysis of diet/habits/exercise). Tips should be concrete actions the user can take.
    9.  **Fitness Tips Generation:** Provide 5 personalized fitness recommendations based on the Strava activities data, health reports, and any physiotherapy or medical documents. These should include a mix of:
        - **Exercise recommendations** highly specific to the observed exercise patterns and activity types
        - **Stretching routines** based on the user's activity patterns, any muscular tension, or imbalances noted in health data
        - **Mechanical health improvements** such as posture corrections, movement pattern optimizations, or exercises to address specific joint issues mentioned in physiotherapy reports
        - **Recovery protocols** tailored to the user's workout intensity and frequency
        - **Injury prevention strategies** based on any previous injuries mentioned or risk factors identified

        Consider:
        - Activity types (running, walking, cycling) to tailor exercise and stretching advice
        - Distance and duration for endurance assessment and appropriate recovery recommendations
        - Speed and cadence metrics for performance evaluation and form improvements
        - Frequency and consistency of activities for habit formation and progressive load management
        - Recent exercises for current fitness trends and detecting potential overtraining
        - Elevation data to gauge intensity level and terrain variation
        - Physiotherapy recommendations or medical reports indicating mechanical issues
        - Any complaints of pain, tightness, or discomfort noted in journal entries
        
        For example:
        - If the user primarily runs short distances, suggest techniques to gradually increase endurance
        - If a physiotherapy report mentions shoulder tightness, include specific mobility exercises
        - If the user shows irregular exercise frequency, recommend a consistent schedule
        - If speed metrics are improving, suggest interval training to further enhance performance
        - If elevation data shows flat terrain preference, recommend incorporating hill workouts
        - If postural issues are noted, include specific corrective exercises
        - Include activity-specific form improvements based on cadence or other metrics
        
        Tips should account for the user's demonstrated fitness level - avoid recommending advanced techniques for beginners or basic advice for advanced athletes.
    10. **Weekly Shopping List Generation:** Create a comprehensive shopping list for one week that includes:
        - Regular healthy items the user typically purchases (based on receipts, diet files, and purchase history)
        - Estimated quantities/counts needed for each item
        - New healthful items derived from medical data analysis and diet tips
        - For each item, provide the 'count' and a 'reason' explaining why it's included (e.g., "Regular weekly purchase" or "Recommended to address iron deficiency shown in your lab results")
        - **IMPORTANT:** DO NOT include unhealthy items in the shopping list, even if they appear in the user's purchase history. Instead, suggest healthier alternatives where appropriate.
    11.  **JSON Format:** Respond ONLY with a valid JSON object matching this EXACT structure (no explanations outside JSON):

        {
          \"statusQuo\": \"[1-2 sentence summary based on data]\",
          \"painPoints\": [ // Provide 2-4 items
            { \"point\": \"[Identified issue]\", \"reason\": \"[User-friendly reason based on specific data]\" },
            { \"point\": \"[Identified issue]\", \"reason\": \"[User-friendly reason based on specific data]\" }
            // ... potentially more points up to 4
          ],
          \"dietTips\": [ // Provide exactly 5 items
             { \"tip\": \"...\", \"reason\": \"[User-friendly reason based on specific data]\" },
             // ... 4 more diet tips
          ],
          \"habitTips\": [ // Provide exactly 5 items
             { \"tip\": \"...\", \"reason\": \"[User-friendly reason based on specific data]\" },
             // ... 4 more habit tips
          ],
          \"supplementProposals\": [ // Provide exactly 5 items
             { \"supplement\": \"...\", \"reason\": \"[User-friendly reason based on specific data]\" },
             // ... 4 more supplement proposals
          ],
          \"fitnessTips\": [ // Provide exactly 5 items
             { \"tip\": \"...\", \"reason\": \"[User-friendly reason based on specific data]\" },
             // ... 4 more fitness tips specifically tailored to the user's Strava activity data
          ],
          \"shoppingList\": [ // Create a comprehensive weekly shopping list
            { \"item\": \"...\", \"count\": \"[quantity needed]\", \"reason\": \"[Based on purchase history/medical need]\" }
            // Include both:
            // 1. Regular items based on purchase history (average weekly buys)
            // 2. New items derived from medical reasoning and diet tips
          ]
        }

    Keep summaries, pain points, and tips concise but clearly linked to the synthesized data, prioritizing relevant findings based on your nuanced analysis.`;

    const userMessageContent = userPromptParts; // The array of text/image/file parts

    // 5. Call OpenAI API
    const completion = await openai.chat.completions.create({
      model: "o4-mini-2025-04-16",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userMessageContent },
      ],
      response_format: { type: "json_object" },
      // temperature: 0.3,
      // max_tokens: 1200,
    });

    const jsonResponse = completion.choices[0]?.message?.content;
    if (!jsonResponse) throw new Error("OpenAI response was empty.");
    const parsedTips: HealthTips = JSON.parse(jsonResponse);
    if (
      !parsedTips.statusQuo || // Check new field
      !parsedTips.painPoints || // Check new field
      !parsedTips.dietTips ||
      !parsedTips.habitTips ||
      !parsedTips.supplementProposals ||
      !parsedTips.fitnessTips ||
      !parsedTips.shoppingList
    ) {
      throw new Error("OpenAI response did not match expected structure.");
    }
    return NextResponse.json(parsedTips);
  } catch (error: any) {
    console.error("API Route Error:", error);
    if (uploadedOpenAIFileIds.length > 0) {
      console.log(
        `Error occurred, attempting cleanup of ${uploadedOpenAIFileIds.length} OpenAI files...`
      );
      await cleanupOpenAIFiles(uploadedOpenAIFileIds);
    }
    return NextResponse.json(
      { error: error.message || "Failed to generate tips." },
      { status: 500 }
    );
  } finally {
    if (uploadedOpenAIFileIds.length > 0) {
      console.log(
        `Attempting cleanup of ${uploadedOpenAIFileIds.length} OpenAI files...`
      );
      await cleanupOpenAIFiles(uploadedOpenAIFileIds);
    }
  }
}

// Helper function for cleaning up files from OpenAI
async function cleanupOpenAIFiles(fileIds: string[]) {
  const deletionPromises = fileIds.map(async (fileId) => {
    try {
      await openai.files.del(fileId);
      console.log(`Successfully deleted OpenAI file: ${fileId}`);
    } catch (deleteError) {
      console.error(`Failed to delete OpenAI file ${fileId}:`, deleteError);
      // Decide if you want to throw, retry, or just log the error
    }
  });
  await Promise.allSettled(deletionPromises); // Use allSettled to ensure all attempts are made
}

// Types (interfaces remain the same)
interface NoteRecord {
  text: string;
  created_at: string;
}

interface FileRecord {
  id: string; // Added id for consistency
  file_name: string;
  created_at: string;
  category: string | null;
  subcategory: string | null;
  storage_path: string | null; // Make nullable
  mime_type: string | null; // Make nullable
}
