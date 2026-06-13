import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  BookMarked, Plus, Trash2, Edit3, Sparkles,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import {
  Button, Card, Badge, EmptyState, TextField, Section,
} from "../components/UI";
import { EmptyTemplatesIllustration } from "../components/illustrations";
import {
  getTemplates, deleteTemplate, listingFromTemplate, saveListing,
  emptyListing, saveTemplate,
} from "../services/listingService";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import type { Template } from "../types";

export function Templates() {
  const nav      = useNavigate();
  const { toast } = useToast();
  const { settings } = useApp();
  const [items, setItems] = useState<Template[]>([]);
  const [draftName, setDraftName] = useState("");

  const reload = () => setItems(getTemplates());
  useEffect(reload, []);

  const useTemplate = (tpl: Template) => {
    const listing = listingFromTemplate(tpl);
    saveListing(listing);
    nav(`/editor/${listing.id}`);
    toast(`Loaded "${tpl.name}"`, "success");
  };

  const saveCurrentAsTemplate = () => {
    if (!draftName.trim()) { toast("Give your template a name", "warning"); return; }
    const base = emptyListing(settings);
    const tpl = saveTemplate(draftName, base);
    setDraftName("");
    reload();
    toast(`Saved template "${tpl.name}"`, "success");
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Templates"
        subtitle={`${items.length} template${items.length !== 1 ? "s" : ""} (built-in + your own)`} />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        <Section title="Save an empty template"
          action={<Button variant="primary" size="sm" onClick={saveCurrentAsTemplate} icon={<Plus size={13} />}>Save</Button>}>
          <p className="text-xs" style={{ color: "#64748b" }}>
            Quickly stash a blank starter under a name you can re-load from this page. To save the listing
            you're editing as a template, use the Save button in the editor's top bar after you've named
            and configured it (the template is created from the current editor state).
          </p>
          <TextField value={draftName} onChange={setDraftName}
            placeholder="e.g. Bookshop standard listing" />
        </Section>

        {items.length === 0 ? (
          <EmptyState illustration={<EmptyTemplatesIllustration />}
            title="No templates yet"
            description="Templates make it easy to start from a known-good listing shape. We ship three built-ins below; save your own to add to this list." />
        ) : (
          <div className="grid grid-cols-3 gap-3">
            {items.map((t) => (
              <Card key={t.id} style={{ padding: 0, overflow: "hidden" }}>
                <div className="px-4 py-3 border-b flex items-center gap-2"
                  style={{ borderColor: "#2d3748" }}>
                  <BookMarked size={14} style={{ color: "#0ea5e9" }} />
                  <p className="text-sm font-medium flex-1 truncate" style={{ color: "#f1f5f9" }}>{t.name}</p>
                  {t.builtIn ? <Badge variant="purple">BUILT-IN</Badge> : <Badge variant="green">YOURS</Badge>}
                </div>
                <div className="p-4 space-y-2 text-xs" style={{ color: "#94a3b8" }}>
                  <div className="flex items-center justify-between">
                    <span>Category</span>
                    <span style={{ color: "#cbd5e1" }}>{t.product.category}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Price</span>
                    <span style={{ color: "#cbd5e1" }}>{t.product.price.toFixed(2)} {t.product.currency}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Features</span>
                    <span style={{ color: "#cbd5e1" }}>{t.product.features.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Tags</span>
                    <span style={{ color: "#cbd5e1" }}>{t.product.tags.length}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 px-4 py-3"
                  style={{ borderTop: "1px solid #2d3748", background: "rgba(30,37,53,0.4)" }}>
                  <Button variant="primary" size="sm" onClick={() => useTemplate(t)} icon={<Sparkles size={11} />}>
                    Use template
                  </Button>
                  <div className="flex-1" />
                  {!t.builtIn && (
                    <Button variant="danger" size="sm"
                      onClick={() => { deleteTemplate(t.id); reload(); toast("Template deleted", "info"); }}
                      icon={<Trash2 size={11} />} />
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
