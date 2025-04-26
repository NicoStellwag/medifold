"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDistanceToNow } from "date-fns";
import { Notebook, Trash, Pencil, Save, X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";
import { motion } from "framer-motion";

interface Note {
  id: number;
  text: string;
  created_at: string; // Assuming string from Supabase
  user_id: string;
}

interface NotesListProps {
  notes: Note[];
}

export default function NotesList({ notes: initialNotes }: NotesListProps) {
  const supabase = createClient();
  const [notes, setNotes] = useState<Note[]>(initialNotes);
  const [editingNoteId, setEditingNoteId] = useState<number | null>(null);
  const [editText, setEditText] = useState<string>("");

  // Update local state if initialNotes prop changes
  useEffect(() => {
    setNotes(initialNotes);
  }, [initialNotes]);

  // --- Delete Handlers ---
  const handleDelete = async (noteId: number) => {
    const originalNotes = [...notes];
    // Optimistic update
    setNotes(notes.filter((note) => note.id !== noteId));

    const { error } = await supabase
      .from("notes")
      .delete()
      .match({ id: noteId });

    if (error) {
      console.error(`Failed to delete note: ${error.message}`);
      // Revert optimistic update
      setNotes(originalNotes);
    } else {
      console.log("Note deleted successfully");
    }
  };

  // --- Edit Handlers ---
  const handleEditClick = (note: Note) => {
    setEditingNoteId(note.id);
    setEditText(note.text);
  };

  const handleCancelEdit = () => {
    setEditingNoteId(null);
    setEditText("");
  };

  const handleSaveEdit = async (noteId: number) => {
    if (!editText.trim()) {
      console.error("Note cannot be empty");
      return;
    }

    const originalNotes = [...notes];
    const noteIndex = notes.findIndex((note) => note.id === noteId);
    if (noteIndex === -1) return; // Should not happen

    // Optimistic update
    const updatedNotes = [...notes];
    updatedNotes[noteIndex] = { ...updatedNotes[noteIndex], text: editText };
    setNotes(updatedNotes);
    setEditingNoteId(null); // Exit editing mode immediately

    const { error } = await supabase
      .from("notes")
      .update({ text: editText })
      .match({ id: noteId });

    if (error) {
      console.error(`Failed to update note: ${error.message}`);
      // Revert optimistic update
      setNotes(originalNotes);
    } else {
      console.log("Note updated successfully");
    }
    setEditText(""); // Clear edit text regardless of success/failure
  };

  // Animation variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  // --- Render Logic ---
  if (!notes || notes.length === 0) {
    return (
      <Card className="flex h-40 w-full flex-col items-center justify-center rounded-xl overflow-hidden border-0 shadow-md">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-50" />
        <div className="relative z-10 flex flex-col items-center">
          <div className="rounded-full bg-gradient-to-r from-primary/20 to-secondary/20 p-4">
            <Notebook className="h-8 w-8 text-primary" />
          </div>
          <p className="mt-4 text-center text-sm font-medium text-primary">
            No notes yet
          </p>
          <p className="text-center text-xs text-muted-foreground">
            Add notes using the quick note feature on the home page.
          </p>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <motion.div
        className="space-y-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {notes.map((note) => (
          <motion.div key={note.id} variants={item}>
            <Card className="shadow-md overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 opacity-50" />
              <CardContent className="p-4 relative z-10">
                {editingNoteId === note.id ? (
                  // Edit Mode
                  <div className="space-y-2">
                    <Input
                      value={editText}
                      onChange={(e) => setEditText(e.target.value)}
                      className="text-sm rounded-lg border-border focus-visible:ring-primary"
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleCancelEdit}
                        className="text-muted-foreground hover:text-foreground hover:bg-primary/10"
                      >
                        <X className="h-4 w-4 mr-1" /> Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleSaveEdit(note.id)}
                        className="bg-gradient-to-r from-primary to-secondary hover:from-primary/90 hover:to-secondary/90 text-primary-foreground"
                      >
                        <Save className="h-4 w-4 mr-1" /> Save
                      </Button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <div>
                    <p className="text-sm text-foreground mb-2 whitespace-pre-wrap">
                      {note.text}
                    </p>
                    <div className="flex justify-between items-center">
                      <p className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(note.created_at), {
                          addSuffix: true,
                        })}
                      </p>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 text-primary hover:bg-primary/10"
                          onClick={() => handleEditClick(note)}
                        >
                          <Pencil className="h-4 w-4" />
                          <span className="sr-only">Edit Note</span>
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-destructive hover:bg-destructive/10"
                            >
                              <Trash className="h-4 w-4" />
                              <span className="sr-only">Delete Note</span>
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent className="bg-card rounded-xl border-0 shadow-xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-br from-destructive/5 to-destructive/10 opacity-50" />
                            <div className="relative z-10">
                              <AlertDialogHeader>
                                <AlertDialogTitle className="text-destructive">
                                  Are you sure?
                                </AlertDialogTitle>
                                <AlertDialogDescription className="text-muted-foreground">
                                  This action cannot be undone. This will
                                  permanently delete the note.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel className="rounded-lg border-border text-foreground hover:bg-destructive/10">
                                  Cancel
                                </AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDelete(note.id)}
                                  className="rounded-lg bg-destructive hover:bg-destructive/90 text-destructive-foreground"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </div>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
