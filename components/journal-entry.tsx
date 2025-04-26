"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { PenLine, Sparkles } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

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
        <motion.div
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          <Sparkles className="h-12 w-12 animate-bounce text-yellow-400 dark:text-yellow-300" />
        </motion.div>
      )}

      {!isExpanded ? (
        <motion.div
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          transition={{ type: "spring", stiffness: 400, damping: 17 }}
        >
          <Button
            variant="outline"
            className="flex w-full justify-start gap-2 rounded-xl border border-border bg-card py-6 shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
            onClick={() => setIsExpanded(true)}
          >
            <div className="rounded-full bg-gradient-to-r from-primary to-secondary p-2 text-primary-foreground">
              <PenLine className="h-4 w-4" />
            </div>
            <span className="font-medium text-primary">
              Add a quick note ✏️
            </span>
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          className="space-y-3"
        >
          <Textarea
            placeholder="How are you feeling today? 😊"
            className="min-h-[100px] resize-none rounded-xl border-border bg-card shadow-sm focus-visible:ring-primary"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 rounded-xl border-border text-primary hover:bg-primary/10 hover:text-primary"
              onClick={() => setIsExpanded(false)}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-xl bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground transition-all hover:shadow-md"
              onClick={handleSave}
              disabled={!note.trim() || isSaving}
            >
              {isSaving ? "Saving..." : "Save 💾"}
            </Button>
          </div>
          {saveError && <p className="text-sm text-destructive">{saveError}</p>}
        </motion.div>
      )}
    </div>
  );
}
