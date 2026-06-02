"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import {
  Archive,
  ArchiveRestore,
  Bold,
  Code2,
  Heading1,
  Italic,
  List,
  Plus,
  Quote,
  RotateCcw,
  Search,
  Sparkles,
  Tag,
  Underline,
  Trash2,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import {
  collectTags,
  formatNoteDate,
  getNoteExcerpt,
  stripHtml,
} from "@/features/learning-journal/learning-journal-utils";
import {
  loadLearningNotes,
  saveLearningNotes,
} from "@/features/learning-journal/learning-journal-storage";
import { useAuth } from "@/features/auth/auth-context";
import {
  type LearningFilter,
  type LearningNote,
} from "@/features/learning-journal/learning-journal-types";

type JournalFormValues = {
  title: string;
  tags?: string;
};

const journalSchema = z.object({
  title: z.string().min(2, "Give the note a short title."),
  tags: z.string().optional().default(""),
});

// Animation configurations
const staggerContainer = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.2 }
  }
};

const staggerItem = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] } }
};

export function LearningJournalClient() {
  const { user } = useAuth();
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [notes, setNotes] = useState<LearningNote[]>([]);
  const [filter, setFilter] = useState<LearningFilter>("all");
  const [search, setSearch] = useState("");
  const [selectedTag, setSelectedTag] = useState<string>("all");
  const [editingId, setEditingId] = useState<string | null>(null);

  const form = useForm<JournalFormValues>({
    resolver: zodResolver(journalSchema),
    defaultValues: {
      title: "",
      tags: "",
    },
  });

  useEffect(() => {
    async function init() {
      if (!user) return;
      const stored = await loadLearningNotes(user.uid);
      setNotes(stored);
      setHydrated(true);
    }
    init();
  }, [user]);

  const activeNotes = notes.filter((note) => !note.archived);
  const archivedNotes = notes.filter((note) => note.archived);
  const tagOptions = useMemo(() => collectTags(notes), [notes]);

  const filteredNotes = useMemo(() => {
    const normalized = search.trim().toLowerCase();
    return notes
      .filter((note) => (filter === "active" ? !note.archived : filter === "archived" ? note.archived : true))
      .filter((note) => (selectedTag === "all" ? true : note.tags.includes(selectedTag)))
      .filter((note) => {
        if (!normalized) return true;
        return [
          note.title,
          stripHtml(note.contentHtml),
          note.tags.join(" "),
        ].some((value) => value.toLowerCase().includes(normalized));
      })
      .sort((left, right) => new Date(right.updatedAt).getTime() - new Date(left.updatedAt).getTime());
  }, [filter, notes, search, selectedTag]);

  if (!hydrated) {
    return (
      <div className="space-y-6">
        <div className="h-10 w-48 bg-surface animate-pulse rounded" />
        <div className="h-[300px] w-full bg-surface animate-pulse rounded-xl border border-border" />
      </div>
    );
  }

  function applyEditorCommand(command: string, value?: string) {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncEditor();
  }

  function syncEditor() {
    return editorRef.current?.innerHTML ?? "";
  }

  function resetEditor() {
    editorRef.current?.focus();
    document.execCommand("removeFormat");
    document.execCommand("unlink");
    editorRef.current!.innerHTML = "";
    syncEditor();
  }

  function createOrUpdateNote(values: JournalFormValues) {
    const contentHtml = editorRef.current?.innerHTML.trim() ?? "";

    if (!stripHtml(contentHtml)) {
      toast.error("Add some journal content before saving.");
      return;
    }

    const tags = values.tags ? values.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [];
    const timestamp = new Date().toISOString();

    if (editingId) {
      const nextNotes = notes.map((note) =>
        note.id === editingId
          ? { ...note, title: values.title, tags, contentHtml, updatedAt: timestamp }
          : note,
      );
      setNotes(nextNotes);
      if (user) saveLearningNotes(user.uid, nextNotes);
      toast.success("Note updated.");
    } else {
      const note: LearningNote = {
        id: crypto.randomUUID(),
        title: values.title,
        contentHtml,
        tags,
        archived: false,
        createdAt: timestamp,
        updatedAt: timestamp,
      };
      const nextNotes = [note, ...notes];
      setNotes(nextNotes);
      if (user) saveLearningNotes(user.uid, nextNotes);
      toast.success("Note saved.");
    }

    setEditingId(null);
    form.reset({ title: "", tags: "" });
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
  }

  function editNote(note: LearningNote) {
    setEditingId(note.id);
    form.reset({ title: note.title, tags: note.tags.join(", ") });
    if (editorRef.current) {
      editorRef.current.innerHTML = note.contentHtml;
    }
  }

  function toggleArchive(id: string) {
    const nextNotes = notes.map((note) =>
      note.id === id ? { ...note, archived: !note.archived, updatedAt: new Date().toISOString() } : note,
    );
    setNotes(nextNotes);
    if (user) saveLearningNotes(user.uid, nextNotes);
  }

  function deleteNote(id: string) {
    const nextNotes = notes.filter((note) => note.id !== id);
    setNotes(nextNotes);
    if (user) saveLearningNotes(user.uid, nextNotes);
    toast.success("Note removed.");
  }

  function clearWorkspace() {
    setNotes([]);
    if (user) saveLearningNotes(user.uid, []);
    setSearch("");
    setFilter("all");
    setSelectedTag("all");
    setEditingId(null);
    form.reset({ title: "", tags: "" });
    if (editorRef.current) {
      editorRef.current.innerHTML = "";
    }
    toast.message("Journal cleared.");
  }

  return (
    <div className="flex flex-col gap-12 pb-16">
      
      {/* ════════════ HEADER ════════════ */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="flex flex-col md:flex-row md:items-end justify-between gap-6"
      >
        <div>
          <h1 className="text-[28px] font-medium tracking-tight text-text-primary">
            Learning Journal
          </h1>
          <p className="mt-1 text-[15px] text-text-secondary">
            Capture and index your daily learnings.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[13px] font-medium text-text-secondary">{filteredNotes.length} notes</span>
          <span className="text-text-tertiary">|</span>
          <button 
            onClick={clearWorkspace} 
            className="flex items-center gap-2 text-[13px] font-medium text-text-secondary hover:text-text-primary transition-colors"
          >
            <RotateCcw className="h-4 w-4" /> Reset
          </button>
        </div>
      </motion.div>

      <motion.div variants={staggerContainer} initial="hidden" animate="show" className="flex flex-col gap-10">
        
        {/* ════════════ TYPOGRAPHIC STATS ════════════ */}
        <motion.section variants={staggerItem} className="grid grid-cols-2 md:grid-cols-4 gap-8 py-6 border-y border-border">
          <div className="flex flex-col">
            <span className="text-[11px] text-accent uppercase tracking-widest font-medium mb-1">Active</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{activeNotes.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-text-secondary uppercase tracking-widest font-medium mb-1">Archived</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{archivedNotes.length}</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[11px] text-text-secondary uppercase tracking-widest font-medium mb-1">Unique Tags</span>
            <span className="text-[28px] text-text-primary font-medium tracking-tight">{tagOptions.length}</span>
          </div>
        </motion.section>

        {/* ════════════ TWO COLUMN LAYOUT ════════════ */}
        <div className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-8">
          
          {/* LEFT: Editor */}
          <motion.div variants={staggerItem} className="flex flex-col gap-8">
            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-[14px] font-medium text-text-primary">
                  {editingId ? "Edit Note" : "New Note"}
                </h2>
                {editingId && <span className="text-[11px] uppercase tracking-wider text-accent border border-accent/20 bg-accent/10 px-2 py-0.5 rounded">Editing Mode</span>}
              </div>

              <form className="space-y-4" onSubmit={form.handleSubmit(createOrUpdateNote)}>
                <div className="space-y-2">
                  <input type="text" {...form.register("title")} className="w-full bg-transparent border-b border-border text-[20px] font-medium text-text-primary py-2 outline-none focus:border-accent transition-colors placeholder:text-text-tertiary" placeholder="Note Title..." />
                </div>

                <div className="rounded-lg border border-border bg-background focus-within:border-accent focus-within:ring-1 focus-within:ring-accent overflow-hidden transition-all">
                  <div className="flex flex-wrap items-center gap-1 p-2 border-b border-border bg-surface-raised">
                    <ToolbarButton icon={Bold} onClick={() => applyEditorCommand("bold")} />
                    <ToolbarButton icon={Italic} onClick={() => applyEditorCommand("italic")} />
                    <ToolbarButton icon={Underline} onClick={() => applyEditorCommand("underline")} />
                    <div className="w-px h-4 bg-border mx-1" />
                    <ToolbarButton icon={Heading1} onClick={() => applyEditorCommand("formatBlock", "h1")} />
                    <ToolbarButton icon={List} onClick={() => applyEditorCommand("insertUnorderedList")} />
                    <ToolbarButton icon={Quote} onClick={() => applyEditorCommand("formatBlock", "blockquote")} />
                    <ToolbarButton icon={Code2} onClick={() => applyEditorCommand("formatBlock", "pre")} />
                  </div>
                  <div
                    ref={editorRef}
                    className="min-h-[240px] p-4 text-[13px] leading-relaxed text-text-primary outline-none"
                    contentEditable
                    suppressContentEditableWarning
                    onInput={() => syncEditor()}
                    onBlur={() => syncEditor()}
                    onKeyUp={() => syncEditor()}
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-4 pt-2">
                  <div className="flex-1">
                    <input type="text" {...form.register("tags")} className="w-full h-9 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all" placeholder="Tags (comma separated)" />
                  </div>
                  <div className="flex gap-2">
                    <button type="button" onClick={() => resetEditor()} className="h-9 px-4 bg-surface-raised border border-border text-text-primary rounded-md text-[13px] font-medium hover:border-border-hover transition-colors">
                      Clear
                    </button>
                    <button type="submit" className="h-9 px-5 bg-accent text-background rounded-md text-[13px] font-semibold hover:opacity-90 transition-opacity flex items-center gap-2">
                      <Sparkles className="h-3.5 w-3.5" /> Save
                    </button>
                  </div>
                </div>
              </form>
            </section>
          </motion.div>

          {/* RIGHT: Feed */}
          <motion.div variants={staggerItem} className="flex flex-col gap-8">
            <section className="rounded-xl border border-border bg-surface p-6 shadow-card hover:border-border-hover transition-all duration-200">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-[14px] font-medium text-text-primary">Library</h2>
                
                <div className="flex gap-4 text-[12px] font-medium text-text-tertiary">
                  <button onClick={() => setFilter("all")} className={`transition-colors pb-1 ${filter === "all" ? "text-text-primary border-b border-accent" : "hover:text-text-primary"}`}>All</button>
                  <button onClick={() => setFilter("active")} className={`transition-colors pb-1 ${filter === "active" ? "text-text-primary border-b border-accent" : "hover:text-text-primary"}`}>Active</button>
                  <button onClick={() => setFilter("archived")} className={`transition-colors pb-1 ${filter === "archived" ? "text-text-primary border-b border-accent" : "hover:text-text-primary"}`}>Archived</button>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 mb-6 border-b border-border pb-6">
                <div className="relative flex-1">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-tertiary" />
                  <input
                    type="text"
                    className="w-full h-9 bg-background border border-border rounded-md pl-9 pr-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 placeholder:text-text-tertiary transition-all"
                    placeholder="Search notes..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                  />
                </div>
                <select
                  className="h-9 w-full sm:w-32 bg-background border border-border rounded-md px-3 text-[13px] text-text-primary focus:outline focus:outline-2 focus:outline-accent outline-offset-0 transition-all"
                  value={selectedTag}
                  onChange={(event) => setSelectedTag(event.target.value)}
                >
                  <option value="all">All Tags</option>
                  {tagOptions.map((tag) => <option key={tag} value={tag}>{tag}</option>)}
                </select>
              </div>

              <div className="flex flex-col">
                <AnimatePresence initial={false}>
                  {filteredNotes.length ? (
                    filteredNotes.map((note) => (
                      <motion.div
                        key={note.id}
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="group flex flex-col py-5 border-b border-border last:border-0"
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex flex-col min-w-0 pr-4">
                            <span className="text-[14px] font-medium text-text-primary line-clamp-1">{note.title}</span>
                            <span className="text-[11px] text-text-tertiary mt-1">{formatNoteDate(note.updatedAt)}</span>
                            <p className="mt-3 text-[12px] leading-relaxed text-text-secondary line-clamp-2">
                              {getNoteExcerpt(note)}
                            </p>
                            {note.tags.length > 0 && (
                              <div className="flex flex-wrap gap-2 mt-3">
                                {note.tags.map((tag) => (
                                  <span key={tag} className="text-[10px] uppercase tracking-wider text-accent border border-accent/20 bg-accent/5 px-1.5 py-0.5 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex flex-col gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button onClick={() => editNote(note)} className="text-[11px] font-medium text-text-secondary hover:text-text-primary">
                              Edit
                            </button>
                            <button onClick={() => toggleArchive(note.id)} className="text-[11px] font-medium text-text-secondary hover:text-text-primary">
                              {note.archived ? "Unarchive" : "Archive"}
                            </button>
                            <button onClick={() => deleteNote(note.id)} className="text-[11px] font-medium text-text-secondary hover:text-destructive">
                              Delete
                            </button>
                          </div>
                        </div>
                      </motion.div>
                    ))
                  ) : (
                    <div className="py-12 text-center text-[13px] text-text-tertiary">No notes found.</div>
                  )}
                </AnimatePresence>
              </div>
            </section>
          </motion.div>
        </div>
      </motion.div>
    </div>
  );
}

function ToolbarButton({
  icon: Icon,
  onClick,
}: {
  icon: LucideIcon;
  onClick: () => void;
}) {
  return (
    <button type="button" onClick={onClick} className="h-7 w-7 flex items-center justify-center rounded text-text-secondary hover:text-text-primary hover:bg-background transition-colors">
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}
