import { useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus, Library, Edit3, Trash2, X, Check, Copy, ChevronLeft, FolderPlus,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, EmptyState, Badge, Section, TextField } from "../components/UI";
import { EmptyFolderOpenIllustration } from "../components/illustrations";
import { useToast } from "../context/ToastContext";
import {
  getCollections, getCollection, createCollection, renameCollection, deleteCollection,
  countInCollection, getSnippets, addToCollection, removeFromCollection, recordCopy,
} from "../services/clipboardService";
import type { Collection, Snippet } from "../types";

export function Collections() {
  const { id }   = useParams<{ id?: string }>();
  const nav      = useNavigate();
  const { toast } = useToast();

  const [list,    setList]    = useState<Collection[]>(() => getCollections());
  const [snippets, setSnippets] = useState<Snippet[]>(() => getSnippets());
  const [newName, setNewName] = useState("");

  const current = id ? getCollection(id) : undefined;

  const reload = () => { setList(getCollections()); setSnippets(getSnippets()); };

  const onCreate = () => {
    if (!newName.trim()) { toast("Give the collection a name", "warning"); return; }
    const c = createCollection(newName);
    setNewName("");
    reload();
    toast(`Created "${c.name}"`, "success");
  };

  if (current) return (
    <CollectionDetail
      collection={current}
      allSnippets={snippets}
      onBack={() => nav("/collections")}
      onRename={(name) => { renameCollection(current.id, name); reload(); toast("Collection renamed", "success"); }}
      onDelete={() => { deleteCollection(current.id); reload(); nav("/collections"); toast("Collection deleted", "info"); }}
      onAdd={(sid) => { addToCollection(sid, current.id); reload(); }}
      onRemove={(sid) => { removeFromCollection(sid, current.id); reload(); }}
      onCopy={async (s) => {
        try { await navigator.clipboard.writeText(s.content); recordCopy(s.id); reload(); toast("Copied", "success"); }
        catch { toast("Could not copy", "error"); }
      }} />
  );

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Collections" subtitle={`${list.length} folder${list.length !== 1 ? "s" : ""}`} />
      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <Section title="New collection"
          action={<Button variant="primary" size="sm" onClick={onCreate} icon={<FolderPlus size={13} />}>Create</Button>}>
          <TextField value={newName} onChange={setNewName}
            placeholder="e.g. SSH keys, Email templates, Bookmark dump"
            label="Name" />
        </Section>

        {list.length === 0 ? (
          <EmptyState illustration={<EmptyFolderOpenIllustration />}
            title="No collections yet"
            description="Create a named folder to group related snippets. Snippets can live in multiple collections at once." />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {list.map((c) => (
              <Card key={c.id} onClick={() => nav(`/collections/${c.id}`)}>
                <div className="flex items-center gap-3 mb-3">
                  <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(139,92,246,.1)", color: "#a78bfa" }}>
                    <Library size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>{c.name}</p>
                    <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>{new Date(c.createdAt).toLocaleDateString()}</p>
                  </div>
                  <Badge variant="purple">{countInCollection(c.id)}</Badge>
                </div>
                <p className="text-xs" style={{ color: "#475569" }}>Click to view and edit</p>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Detail view ─────────────────────────────────────────────────────────────

function CollectionDetail({ collection, allSnippets, onBack, onRename, onDelete, onAdd, onRemove, onCopy }: {
  collection:  Collection;
  allSnippets: Snippet[];
  onBack:      () => void;
  onRename:    (name: string) => void;
  onDelete:    () => void;
  onAdd:       (snippetId: string) => void;
  onRemove:    (snippetId: string) => void;
  onCopy:      (s: Snippet) => void;
}) {
  const [editing, setEditing]   = useState(false);
  const [draft,   setDraft]     = useState(collection.name);
  const [confirm, setConfirm]   = useState(false);
  const [picker,  setPicker]    = useState(false);

  const inside  = useMemo(() => allSnippets.filter((s) => s.collectionIds.includes(collection.id)), [allSnippets, collection.id]);
  const outside = useMemo(() => allSnippets.filter((s) => !s.collectionIds.includes(collection.id)), [allSnippets, collection.id]);

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar
        title={editing
          ? (<input value={draft} onChange={(e) => setDraft(e.target.value)}
              onBlur={() => { onRename(draft); setEditing(false); }}
              onKeyDown={(e) => { if (e.key === "Enter") { onRename(draft); setEditing(false); } }}
              autoFocus
              className="px-2 py-1 rounded text-base outline-none"
              style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9" }} />) as any
          : collection.name}
        subtitle={`${inside.length} snippet${inside.length !== 1 ? "s" : ""}`}
        actions={
          <>
            <Button variant="secondary" size="sm" onClick={onBack} icon={<ChevronLeft size={13} />}>Back</Button>
            <Button variant="secondary" size="sm" onClick={() => setEditing(true)} icon={<Edit3 size={13} />}>Rename</Button>
            <Button variant="primary"   size="sm" onClick={() => setPicker((v) => !v)} icon={<Plus size={13} />}>
              {picker ? "Done adding" : "Add snippets"}
            </Button>
            {confirm ? (
              <Button variant="danger" size="sm" onClick={onDelete} icon={<Check size={13} />}>Confirm delete</Button>
            ) : (
              <Button variant="danger" size="sm" onClick={() => setConfirm(true)} icon={<Trash2 size={13} />}>Delete</Button>
            )}
          </>
        } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Items in collection */}
        {inside.length === 0 ? (
          <EmptyState illustration={<EmptyFolderOpenIllustration />}
            title="Nothing in this collection yet"
            description="Click Add snippets above to bring some in from your vault." />
        ) : (
          <Section title="In this collection">
            <div className="space-y-2.5">
              {inside.map((s) => (
                <Card key={s.id} style={{ padding: 0 }}>
                  <div className="flex items-center gap-3 px-4 py-3">
                    <Badge variant="purple">{s.type.toUpperCase()}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }}>
                        {s.title || s.content.slice(0, 60)}
                      </p>
                      <p className="text-xs mt-0.5 truncate font-mono" style={{ color: "#94a3b8" }}>
                        {s.content.slice(0, 100)}{s.content.length > 100 ? "…" : ""}
                      </p>
                    </div>
                    <Button variant="primary"   size="sm" onClick={() => onCopy(s)} icon={<Copy size={11} />}>Copy</Button>
                    <Button variant="secondary" size="sm" onClick={() => onRemove(s.id)} icon={<X size={11} />}>Remove</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        )}

        {picker && outside.length > 0 && (
          <Section title="Add from vault">
            <div className="space-y-2">
              {outside.map((s) => (
                <Card key={s.id} style={{ padding: 0, background: "rgba(30,37,53,0.5)" }}>
                  <div className="flex items-center gap-3 px-4 py-2.5">
                    <Badge variant="default">{s.type.toUpperCase()}</Badge>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs truncate font-mono" style={{ color: "#94a3b8" }}>
                        {s.title ? `${s.title} — ` : ""}{s.content.slice(0, 100)}{s.content.length > 100 ? "…" : ""}
                      </p>
                    </div>
                    <Button variant="primary" size="sm" onClick={() => onAdd(s.id)} icon={<Plus size={11} />}>Add</Button>
                  </div>
                </Card>
              ))}
            </div>
          </Section>
        )}
      </div>
    </div>
  );
}
