"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
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
      toast.error(`Failed to delete note: ${error.message}`);
      // Revert optimistic update
      setNotes(originalNotes);
    } else {
      toast.success("Note deleted successfully");
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
      toast.error("Note cannot be empty");
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
      toast.error(`Failed to update note: ${error.message}`);
      // Revert optimistic update
      setNotes(originalNotes);
    } else {
      toast.success("Note updated successfully");
    }
    setEditText(""); // Clear edit text regardless of success/failure
  };

  // --- Render Logic ---
  if (!notes || notes.length === 0) {
    return (
      <div className="flex h-40 w-full flex-col items-center justify-center rounded-lg border bg-card shadow-sm">
        <div className="rounded-full bg-muted p-4">
          <Notebook className="h-8 w-8 text-primary" />
        </div>
        <p className="mt-4 text-center text-sm font-medium text-foreground">
          No notes yet
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Add notes using the quick note feature on the home page.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-foreground">Your Notes</h2>
      {notes.map((note) => (
        <Card key={note.id} className="shadow-sm">
          <CardContent className="p-4">
            {editingNoteId === note.id ? (
              // Edit Mode
              <div className="space-y-2">
                <Input
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  className="text-sm"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={handleCancelEdit}>
                    <X className="h-4 w-4 mr-1" /> Cancel
                  </Button>
                  <Button size="sm" onClick={() => handleSaveEdit(note.id)}>
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
                      className="h-7 w-7"
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
                          className="h-7 w-7 text-destructive hover:text-destructive"
                        >
                          <Trash className="h-4 w-4" />
                          <span className="sr-only">Delete Note</span>
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                          <AlertDialogDescription>
                            This action cannot be undone. This will permanently
                            delete the note.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleDelete(note.id)}
                            className="bg-destructive hover:bg-destructive/90"
                          >
                            Delete
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
