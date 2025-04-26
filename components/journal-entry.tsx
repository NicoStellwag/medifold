"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { PenLine, Sparkles } from "lucide-react"

export default function JournalEntry() {
  const [note, setNote] = useState("")
  const [isSaving, setIsSaving] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [showConfetti, setShowConfetti] = useState(false)

  const handleSave = () => {
    if (!note.trim()) return

    setIsSaving(true)

    // Simulate saving
    setTimeout(() => {
      setIsSaving(false)
      setNote("")
      setIsExpanded(false)
      setShowConfetti(true)

      // Hide confetti after animation
      setTimeout(() => setShowConfetti(false), 2000)
    }, 1000)
  }

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
          className="flex w-full justify-start gap-2 border-blue-200 bg-white py-6 shadow-sm transition-all hover:border-blue-300 hover:shadow-md"
          onClick={() => setIsExpanded(true)}
        >
          <PenLine className="h-5 w-5 text-blue-500" />
          <span className="font-medium text-blue-700">Add a quick note ✏️</span>
        </Button>
      ) : (
        <>
          <Textarea
            placeholder="How are you feeling today? 😊"
            className="min-h-[100px] resize-none border-blue-200 bg-white/80 shadow-sm focus-visible:ring-blue-400"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 border-blue-200" onClick={() => setIsExpanded(false)}>
              Cancel
            </Button>
            <Button
              className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-400 transition-all hover:shadow-md"
              onClick={handleSave}
              disabled={!note.trim() || isSaving}
            >
              {isSaving ? "Saving..." : "Save 💾"}
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
