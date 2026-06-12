import { useMemo, useState } from "react";
import {
  Plus, Pin, PinOff, Star, StarOff, Copy, Trash2, ChevronDown, ChevronUp,
  LayoutList, LayoutGrid, Edit3, X, Tag as TagIcon,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import {
  Button, Card, EmptyState, Badge, Chip, TextField, Section,
} from "../components/UI";
import { EmptyVaultIllustration } from "../components/illustrations";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import {
  addSnippet, getSnippets, updateSnippet, deleteSnippet,
  togglePin, toggleFavorite, recordCopy, addTag, removeTag,
  detectContentType,
} from "../services/clipboardService";
import type { Snippet, ContentType, ViewMode } from "../types";

const TYPE_COLOR: Record<ContentType, "violet" | "blue" | "green" | "amber" | "red" | "default"> = {
  url:   "blue",
  email: "amber",
  code:  "violet",
  phone: "green",
  text:  "default",
};

const TYPE_LABEL: Record<ContentType, string> = {
  url: "URL", email: "EMAIL", code: "CODE", phone: "PHONE", text: "TEXT",
};

export function Vault() {
  const { toast }    = useToast();
  const { settings, updateSettings } = useApp();
  const [items,      setItems]      = useState<Snippet[]>(() => getSnippets());
  const [view,       setView]       = useState<ViewMode>(settings.defaultView);
  const [addText,    setAddText]    = useState("");
  const [addTitle,   setAddTitle]   = useState("");
  const [expanded,   setExpanded]   = useState<string | null>(null);

  const reload = () => setItems(getSnippets());

  const sorted = useMemo(() =>
    items.slice().sort((a, b) => {
      if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
      return b.createdAt.localeCompare(a.createdAt);
    }), [items]);

  const detectedType = useMemo(() => detectContentType(addText), [addText]);
  const charCount    = addText.length;
  const wordCount    = addText.trim() ? addText.trim().split(/\s+/).length : 0;

  const onAdd = () => {
    if (!addText.trim()) { toast("Type something to save", "warning"); return; }
    addSnippet({ content: addText, title: addTitle });
    setAddText(""); setAddTitle("");
    reload();
    toast("Snippet saved", "success");
  };

  const onCopy = async (s: Snippet) => {
    try {
      await navigator.clipboard.writeText(s.content);
      recordCopy(s.id);
      reload();
      toast("Copied to clipboard", "success");
    } catch { toast("Could not copy", "error"); }
  };

  const onDelete = (id: string) => {
    deleteSnippet(id); reload(); toast("Snippet deleted", "info");
  };

  const onTitleEdit = (id: string, title: string) => {
    updateSnippet(id, { title });
    reload();
  };

  const onAddTag = (id: string, tag: string) => {
    addTag(id, tag); reload();
  };

  const onRemoveTag = (id: string, tag: string) => {
    removeTag(id, tag); reload();
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Vault" subtitle={`${items.length} snippet${items.length !== 1 ? "s" : ""}`}
        actions={
          <div className="flex items-center gap-1.5">
            <Button variant={view === "list" ? "primary" : "secondary"} size="sm"
              onClick={() => { setView("list"); updateSettings({ defaultView: "list" }); }}
              icon={<LayoutList size={13} />}>List</Button>
            <Button variant={view === "grid" ? "primary" : "secondary"} size="sm"
              onClick={() => { setView("grid"); updateSettings({ defaultView: "grid" }); }}
              icon={<LayoutGrid size={13} />}>Grid</Button>
          </div>
        } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Add snippet form */}
        <Section title="Add snippet"
          action={
            <span className="text-xs" style={{ color: "#64748b" }}>
              {charCount} char{charCount !== 1 ? "s" : ""} · {wordCount} word{wordCount !== 1 ? "s" : ""}
              {addText.trim() && (
                <> · auto-detected: <Badge variant="purple">{TYPE_LABEL[detectedType]}</Badge></>
              )}
            </span>
          }>
          <TextField label="Title (optional)" value={addTitle} onChange={setAddTitle}
            placeholder="e.g. SSH key for staging" />
          <TextField label="Content" multiline rows={4} mono value={addText} onChange={setAddText}
            placeholder="Paste a URL, email, code snippet, phone number, or anything else…" />
          <div className="flex items-center gap-2">
            <Button variant="primary" size="md" onClick={onAdd} icon={<Plus size={14} />}>Add to vault</Button>
            {(addText || addTitle) && (
              <Button variant="ghost" size="md" onClick={() => { setAddText(""); setAddTitle(""); }} icon={<X size={14} />}>
                Clear
              </Button>
            )}
          </div>
        </Section>

        {/* Snippet list */}
        {sorted.length === 0 ? (
          <EmptyState illustration={<EmptyVaultIllustration />}
            title="Your vault is empty"
            description="Add your first snippet above. The type is auto-detected — URLs, emails, code, phone numbers — and tagged for one-click reuse." />
        ) : view === "list" ? (
          <div className="space-y-2.5">
            {sorted.map((s) => (
              <SnippetRow key={s.id} snippet={s}
                expanded={expanded === s.id}
                onToggle={() => setExpanded(expanded === s.id ? null : s.id)}
                onCopy={() => onCopy(s)}
                onPin={() => { togglePin(s.id); reload(); }}
                onFav={() => { toggleFavorite(s.id); reload(); }}
                onDelete={() => onDelete(s.id)}
                onTitleEdit={(t) => onTitleEdit(s.id, t)}
                onAddTag={(t) => onAddTag(s.id, t)}
                onRemoveTag={(t) => onRemoveTag(s.id, t)} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3">
            {sorted.map((s) => (
              <SnippetCardCompact key={s.id} snippet={s}
                onCopy={() => onCopy(s)}
                onPin={() => { togglePin(s.id); reload(); }}
                onFav={() => { toggleFavorite(s.id); reload(); }}
                onDelete={() => onDelete(s.id)}
                onClick={() => { setView("list"); setExpanded(s.id); }} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Row (list view) ─────────────────────────────────────────────────────────

function SnippetRow({ snippet, expanded, onToggle, onCopy, onPin, onFav, onDelete, onTitleEdit, onAddTag, onRemoveTag }: {
  snippet: Snippet; expanded: boolean;
  onToggle: () => void;
  onCopy: () => void; onPin: () => void; onFav: () => void; onDelete: () => void;
  onTitleEdit: (title: string) => void;
  onAddTag: (tag: string) => void; onRemoveTag: (tag: string) => void;
}) {
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft]     = useState(snippet.title);
  const [newTag, setNewTag]             = useState("");
  const preview = snippet.content.length > 140 ? snippet.content.slice(0, 140) + "…" : snippet.content;

  const charCount = snippet.content.length;
  const wordCount = snippet.content.trim() ? snippet.content.trim().split(/\s+/).length : 0;

  const submitTag = () => {
    if (!newTag.trim()) return;
    onAddTag(newTag);
    setNewTag("");
  };

  return (
    <Card style={{ padding: 0, overflow: "hidden" }}>
      <div className="px-5 py-3.5 cursor-pointer" onClick={onToggle}>
        <div className="flex items-center gap-3 mb-1">
          {snippet.pinned && <Pin size={12} style={{ color: "#a78bfa", flexShrink: 0 }} />}
          {snippet.favorite && <Star size={12} style={{ color: "#fbbf24", flexShrink: 0 }} fill="#fbbf24" />}
          <Badge variant={TYPE_COLOR[snippet.type] === "violet" ? "purple" : TYPE_COLOR[snippet.type] === "default" ? "default" : TYPE_COLOR[snippet.type] as any}>
            {TYPE_LABEL[snippet.type]}
          </Badge>
          {editingTitle ? (
            <input value={titleDraft}
              onChange={(e) => setTitleDraft(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              onBlur={() => { onTitleEdit(titleDraft); setEditingTitle(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { onTitleEdit(titleDraft); setEditingTitle(false); } }}
              autoFocus
              className="flex-1 px-2 py-0.5 rounded text-sm outline-none"
              style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9" }} />
          ) : (
            <p className="text-sm font-medium flex-1 truncate"
              style={{ color: snippet.title ? "#f1f5f9" : "#64748b" }}
              onClick={(e) => { e.stopPropagation(); setEditingTitle(true); }}
              title="Click to edit title">
              {snippet.title || "(no title — click to add)"}
            </p>
          )}
          {expanded ? <ChevronUp size={15} style={{ color: "#475569" }} /> : <ChevronDown size={15} style={{ color: "#475569" }} />}
        </div>
        {!expanded && (
          <p className="text-xs mt-1 truncate font-mono" style={{ color: "#94a3b8" }}>{preview}</p>
        )}
      </div>

      {expanded && (
        <div style={{ borderTop: "1px solid #2d3748" }}>
          <pre className="px-5 py-3 text-xs overflow-auto max-h-72"
            style={{ background: "rgba(30,37,53,.4)", color: "#e2e8f0", fontFamily: "JetBrains Mono, monospace", whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
            {snippet.content}
          </pre>
          <div className="px-5 py-2 text-xs flex items-center gap-4" style={{ color: "#64748b" }}>
            <span>{charCount} char{charCount !== 1 ? "s" : ""}</span>
            <span>{wordCount} word{wordCount !== 1 ? "s" : ""}</span>
            <span>Copied {snippet.copyCount}×</span>
          </div>

          {/* Tags */}
          <div className="px-5 py-3 flex items-center flex-wrap gap-1.5" style={{ borderTop: "1px solid #2d3748" }}>
            <TagIcon size={12} style={{ color: "#64748b" }} />
            {snippet.tags.map((t) => (
              <Chip key={t} color="violet" onRemove={() => onRemoveTag(t)}>{t}</Chip>
            ))}
            <input value={newTag}
              onChange={(e) => setNewTag(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") submitTag(); }}
              onBlur={submitTag}
              placeholder="add tag"
              className="px-2 py-0.5 rounded text-xs outline-none"
              style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#cbd5e1", width: 100 }} />
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 px-5 py-3" style={{ borderTop: "1px solid #2d3748", background: "rgba(30,37,53,0.4)" }}>
            <Button variant="primary"   size="sm" onClick={onCopy} icon={<Copy size={12} />}>Copy</Button>
            <Button variant="secondary" size="sm" onClick={onPin}
              icon={snippet.pinned ? <PinOff size={12} /> : <Pin size={12} />}>
              {snippet.pinned ? "Unpin" : "Pin"}
            </Button>
            <Button variant="secondary" size="sm" onClick={onFav}
              icon={snippet.favorite ? <StarOff size={12} /> : <Star size={12} />}>
              {snippet.favorite ? "Unfavorite" : "Favorite"}
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setEditingTitle(true)} icon={<Edit3 size={12} />}>
              Rename
            </Button>
            <div className="flex-1" />
            <Button variant="danger" size="sm" onClick={onDelete} icon={<Trash2 size={12} />}>Delete</Button>
          </div>
        </div>
      )}
    </Card>
  );
}

// ─── Grid card (compact) ─────────────────────────────────────────────────────

function SnippetCardCompact({ snippet, onCopy, onPin, onFav, onDelete, onClick }: {
  snippet: Snippet;
  onCopy: () => void; onPin: () => void; onFav: () => void; onDelete: () => void;
  onClick: () => void;
}) {
  const preview = snippet.content.length > 80 ? snippet.content.slice(0, 80) + "…" : snippet.content;
  return (
    <Card onClick={onClick}>
      <div className="flex items-center gap-2 mb-2">
        {snippet.pinned && <Pin size={11} style={{ color: "#a78bfa" }} />}
        {snippet.favorite && <Star size={11} style={{ color: "#fbbf24" }} fill="#fbbf24" />}
        <Badge variant={TYPE_COLOR[snippet.type] === "violet" ? "purple" : TYPE_COLOR[snippet.type] === "default" ? "default" : TYPE_COLOR[snippet.type] as any}>
          {TYPE_LABEL[snippet.type]}
        </Badge>
        <span className="text-xs ml-auto" style={{ color: "#475569" }}>{snippet.copyCount}×</span>
      </div>
      <p className="text-sm font-medium mb-1.5 truncate"
        style={{ color: snippet.title ? "#f1f5f9" : "#64748b" }}>
        {snippet.title || "(untitled)"}
      </p>
      <p className="text-xs font-mono mb-3 line-clamp-2" style={{ color: "#94a3b8", maxHeight: 32, overflow: "hidden" }}>
        {preview}
      </p>
      <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
        <Button variant="primary"   size="sm" onClick={onCopy} icon={<Copy size={11} />}>Copy</Button>
        <Button variant="secondary" size="sm" onClick={onPin}  icon={snippet.pinned  ? <PinOff size={11} /> : <Pin size={11} />} />
        <Button variant="secondary" size="sm" onClick={onFav}  icon={snippet.favorite ? <StarOff size={11} /> : <Star size={11} />} />
        <div className="flex-1" />
        <Button variant="danger"    size="sm" onClick={onDelete} icon={<Trash2 size={11} />} />
      </div>
    </Card>
  );
}
