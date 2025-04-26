"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

export default function JournalEntry() {
  const supabase = createClient();
  const [note, setNote] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!note.trim()) return;

    setIsSaving(true);
    setSaveError(null);

    try {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError) {
        throw new Error(`Authentication error: ${userError.message}`);
      }
      if (!user) {
        throw new Error("User not logged in");
      }

      const { error: insertError } = await supabase
        .from("notes")
        .insert([{ text: note, user_id: user.id }]);

      if (insertError) {
        throw new Error(`Failed to save note: ${insertError.message}`);
      }

      setNote("");
      setIsExpanded(false);
      setShowConfetti(true);
      setTimeout(() => setShowConfetti(false), 2000);
    } catch (error: any) {
      console.error("Error saving note:", error);
      setSaveError(error.message || "An unexpected error occurred.");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="relative space-y-3">
      {showConfetti && (
        <div className="absolute inset-0 flex items-center justify-center">
          <Sparkles className="h-8 w-8 animate-bounce text-yellow-400" />
        </div>
      )}

      {!isExpanded ? (
        <Button
          variant="outline"
          className="flex w-full justify-start gap-2 bg-card py-6 shadow-sm transition-all hover:border-border/80 hover:shadow-md"
          onClick={() => setIsExpanded(true)}
        >
          <PenLine className="h-5 w-5 text-primary" />
          <span className="font-medium text-primary">Add a quick note ✏️</span>
        </Button>
      ) : (
        <>
          <Textarea
            placeholder="How are you feeling today? 😊"
            className="min-h-[100px] resize-none shadow-sm"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 transition-all hover:shadow-md"
              onClick={handleSave}
              disabled={!note.trim() || isSaving}
            >
              {isSaving ? "Saving..." : "Save 💾"}
            </Button>
          </div>
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        </>
      )}
    </div>
  );
}
