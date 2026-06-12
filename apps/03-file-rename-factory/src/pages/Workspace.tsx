import { useMemo, useState } from "react";
import { v4 as uuidv4 } from "uuid";
import {
  Wand2, Trash2, X, Plus, ArrowUp, ArrowDown, Play, Download,
  Type, Hash, Calendar, Search, Regex, CaseSensitive, Eraser, Scissors,
  CheckCircle2, AlertTriangle, FileWarning, FilePenLine, RotateCcw,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, EmptyState, Badge, Switch } from "../components/UI";
import { FileDropZone } from "../components/FileDropZone";
import { useToast } from "../context/ToastContext";
import {
  buildPreview, applyRenamePlan, summarizeRule, defaultRule,
  rowsToCsv, downloadCsv,
} from "../services/renameService";
import { addSession, getHistory, updateSession } from "../services/localStorageService";
import { incrementStat } from "../services/localStorageService";
import type {
  InputFile, RenameRule, RuleKind, CaseMode, Position, DateFormat,
} from "../types";

const RULE_TYPES: { kind: RuleKind; label: string; icon: typeof Type }[] = [
  { kind: "prefix",        label: "Prefix",         icon: Type },
  { kind: "suffix",        label: "Suffix",         icon: Type },
  { kind: "numbering",     label: "Numbering",      icon: Hash },
  { kind: "date",          label: "Date",           icon: Calendar },
  { kind: "replace",       label: "Find & replace", icon: Search },
  { kind: "regex",         label: "Regex",          icon: Regex },
  { kind: "case",          label: "Case",           icon: CaseSensitive },
  { kind: "removeSpecial", label: "Remove special", icon: Eraser },
  { kind: "trim",          label: "Trim",           icon: Scissors },
];

export function Workspace() {
  const { toast } = useToast();
  const [files, setFiles] = useState<InputFile[]>([]);
  const [rules, setRules] = useState<RenameRule[]>([
    defaultRule("prefix",    uuidv4()),
    defaultRule("numbering", uuidv4()),
  ]);
  const [showAddMenu, setShowAddMenu] = useState(false);

  const preview = useMemo(() => buildPreview(files, rules), [files, rules]);
  const summary = useMemo(() => applyRenamePlan(preview), [preview]);

  const onFiles = (accepted: File[]) => {
    const next: InputFile[] = accepted.map((f) => ({
      id: uuidv4(), name: f.name, size: f.size, type: f.type, file: f,
    }));
    setFiles((p) => [...p, ...next]);
    toast(`Added ${next.length} file${next.length !== 1 ? "s" : ""}`, "success");
  };
  const removeFile = (id: string) => setFiles((p) => p.filter((f) => f.id !== id));
  const clearFiles = () => setFiles([]);

  const addRule = (kind: RuleKind) => {
    setRules((p) => [...p, defaultRule(kind, uuidv4())]);
    setShowAddMenu(false);
  };
  const updateRule = (id: string, patch: Partial<RenameRule>) =>
    setRules((p) => p.map((r) => r.id === id ? ({ ...r, ...patch } as RenameRule) : r));
  const removeRule = (id: string) => setRules((p) => p.filter((r) => r.id !== id));
  const moveRule = (id: string, dir: -1 | 1) => setRules((p) => {
    const idx = p.findIndex((r) => r.id === id);
    if (idx < 0) return p;
    const ni = idx + dir;
    if (ni < 0 || ni >= p.length) return p;
    const copy = p.slice();
    [copy[idx], copy[ni]] = [copy[ni], copy[idx]];
    return copy;
  });

  const apply = () => {
    if (files.length === 0) { toast("Add files first", "warning"); return; }
    if (rules.every((r) => !r.enabled)) { toast("Enable at least one rule", "warning"); return; }
    if (!summary.ok) { toast(summary.message, "error"); return; }

    const session = {
      id:        uuidv4(),
      createdAt: new Date().toISOString(),
      fileCount: files.length,
      ruleCount: rules.filter((r) => r.enabled).length,
      rules:     rules.filter((r) => r.enabled).map((r) => ({ kind: r.kind, summary: summarizeRule(r) })),
      samples:   preview.slice(0, 5).map((p) => ({ from: p.originalName, to: p.newName })),
      applied:   true,
      undone:    false,
    };
    addSession(session);
    incrementStat("rulesUsed", session.ruleCount);
    toast(`Plan saved · ${summary.renamed} rename(s) ready for Tauri FS API`, "success");
  };

  const undoLast = () => {
    const last = getHistory().find((h) => h.applied && !h.undone);
    if (!last) { toast("No session to undo", "warning"); return; }
    updateSession(last.id, { undone: true });
    toast("Last session marked undone — original names would be restored via Tauri FS API", "info");
  };

  const exportPlan = () => {
    if (preview.length === 0) { toast("Add files first", "warning"); return; }
    const csv = rowsToCsv(preview);
    downloadCsv(csv, `rename-plan-${Date.now()}.csv`);
    toast("Plan exported as CSV", "success");
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Workspace" subtitle="Build a rename plan and preview before applying"
        actions={
          <>
            {files.length > 0 && (
              <Button variant="secondary" size="sm" onClick={clearFiles} icon={<Trash2 size={13} />}>
                Clear files
              </Button>
            )}
            <Button variant="secondary" size="sm" onClick={undoLast} icon={<RotateCcw size={13} />}>
              Undo last
            </Button>
            <Button variant="secondary" size="sm" onClick={exportPlan} icon={<Download size={13} />}>
              Export plan
            </Button>
            <Button variant="primary" size="sm" onClick={apply} icon={<Play size={13} />}>
              Apply rename
            </Button>
          </>
        }
      />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Files block */}
        {files.length === 0 ? (
          <FileDropZone onFilesAccepted={onFiles} hint="any extension accepted" />
        ) : (
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#2d3748" }}>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Files</p>
                <Badge variant="blue">{files.length}</Badge>
              </div>
              <button onClick={() => document.getElementById("files-pick")?.click()}
                className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "#f97316" }}>
                <Plus size={13} /> Add more
              </button>
              <input id="files-pick" type="file" multiple style={{ display: "none" }}
                onChange={(e) => e.target.files && onFiles(Array.from(e.target.files))} />
            </div>
            <div className="max-h-48 overflow-y-auto">
              {files.map((f, i) => (
                <div key={f.id} className="flex items-center gap-3 px-5 py-2 text-xs"
                  style={{ borderBottom: i < files.length - 1 ? "1px solid #2d3748" : undefined, color: "#94a3b8" }}>
                  <span className="font-mono w-8 flex-shrink-0" style={{ color: "#475569" }}>
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex-1 truncate">{f.name}</span>
                  <span className="flex-shrink-0" style={{ color: "#475569" }}>{(f.size / 1024).toFixed(1)} KB</span>
                  <button onClick={() => removeFile(f.id)}
                    className="flex-shrink-0 cursor-pointer" style={{ color: "#475569" }}>
                    <X size={13} />
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Rules block */}
        <div className="grid grid-cols-2 gap-5">
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#2d3748" }}>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Rules</p>
                <Badge variant="purple">{rules.length}</Badge>
              </div>
              <div className="relative">
                <button onClick={() => setShowAddMenu((s) => !s)}
                  className="flex items-center gap-1.5 text-xs cursor-pointer" style={{ color: "#f97316" }}>
                  <Plus size={13} /> Add rule
                </button>
                {showAddMenu && (
                  <div className="absolute right-0 top-7 z-10 rounded-lg shadow-xl py-1 animate-fade-in"
                    style={{ background: "#1e2535", border: "1px solid #2d3748", minWidth: 180 }}>
                    {RULE_TYPES.map(({ kind, label, icon: Icon }) => (
                      <button key={kind} onClick={() => addRule(kind)}
                        className="w-full flex items-center gap-2 px-3 py-2 text-xs text-left cursor-pointer hover:bg-slate-700/30"
                        style={{ color: "#cbd5e1" }}>
                        <Icon size={13} style={{ color: "#f97316" }} />
                        {label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="p-4 space-y-3">
              {rules.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: "#64748b" }}>
                  No rules — add one above to build your rename plan.
                </p>
              ) : rules.map((rule, idx) => (
                <RuleCard
                  key={rule.id}
                  rule={rule}
                  index={idx}
                  total={rules.length}
                  onChange={(patch) => updateRule(rule.id, patch)}
                  onRemove={() => removeRule(rule.id)}
                  onMove={(d) => moveRule(rule.id, d)}
                />
              ))}
            </div>
          </Card>

          {/* Preview block */}
          <Card style={{ padding: 0, overflow: "hidden" }}>
            <div className="flex items-center justify-between px-5 py-3 border-b" style={{ borderColor: "#2d3748" }}>
              <div className="flex items-center gap-3">
                <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Preview</p>
                <Badge variant="green">{summary.renamed}</Badge>
                {summary.skipped > 0 && <Badge variant="default">{summary.skipped} unchanged</Badge>}
                {summary.collisions > 0 && <Badge variant="amber">{summary.collisions} collision</Badge>}
                {summary.errors > 0 && <Badge variant="red">{summary.errors} error</Badge>}
              </div>
            </div>
            {preview.length === 0 ? (
              <EmptyState icon={Wand2} title="Preview will appear here"
                description="Add files and at least one rule to see the live original → new name table." />
            ) : (
              <div className="max-h-[420px] overflow-y-auto">
                <table className="w-full text-xs">
                  <thead style={{ background: "rgba(30,37,53,.5)" }}>
                    <tr>
                      <th className="text-left px-4 py-2 font-medium" style={{ color: "#94a3b8" }}>Original</th>
                      <th className="text-left px-4 py-2 font-medium" style={{ color: "#94a3b8" }}>→ New</th>
                      <th className="text-left px-2 py-2 font-medium" style={{ color: "#94a3b8" }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {preview.map((row, i) => (
                      <tr key={row.id}
                        style={{ borderBottom: i < preview.length - 1 ? "1px solid #2d3748" : undefined }}>
                        <td className="px-4 py-2 truncate max-w-[200px]" style={{ color: "#94a3b8" }}>{row.originalName}</td>
                        <td className="px-4 py-2 truncate max-w-[220px] font-mono"
                          style={{
                            color: row.error ? "#ef4444" :
                                   row.collision ? "#f59e0b" :
                                   row.unchanged ? "#64748b" : "#22c55e",
                          }}>
                          {row.newName}
                        </td>
                        <td className="px-2 py-2" style={{ color: "#475569" }}>
                          {row.error ? (
                            <span title={row.error} style={{ color: "#ef4444" }}>
                              <AlertTriangle size={13} />
                            </span>
                          ) : row.collision ? (
                            <span title="Name collides with another row" style={{ color: "#f59e0b" }}>
                              <FileWarning size={13} />
                            </span>
                          ) : row.unchanged ? (
                            <span title="No rule changed this name" style={{ color: "#64748b" }}>—</span>
                          ) : (
                            <span title="Will rename" style={{ color: "#22c55e" }}>
                              <CheckCircle2 size={13} />
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="px-5 py-3 text-xs" style={{ borderTop: "1px solid #2d3748", color: "#64748b" }}>
              {summary.message}
            </div>
          </Card>
        </div>

        {/* Tauri info card */}
        <Card style={{ background: "rgba(249,115,22,.04)", borderColor: "rgba(249,115,22,.18)" }}>
          <div className="flex items-start gap-3">
            <div className="rounded-lg p-2 flex-shrink-0" style={{ background: "rgba(249,115,22,.1)", color: "#f97316" }}>
              <FilePenLine size={16} strokeWidth={1.8} />
            </div>
            <div>
              <p className="text-sm font-semibold mb-1" style={{ color: "#f1f5f9" }}>Ready for Tauri FS API</p>
              <p className="text-xs leading-relaxed" style={{ color: "#94a3b8" }}>
                Disk renames run through the bundled Tauri build. The browser preview generates a real, complete
                plan — Apply records the session in local history, and a single Rust command (<span style={{ color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace" }}>std::fs::rename</span>)
                wires the plan to the disk in the desktop build. See <span style={{ color: "#cbd5e1", fontFamily: "JetBrains Mono, monospace" }}>src/services/renameService.ts</span> for the integration recipe.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

// ─── RuleCard ─────────────────────────────────────────────────────────────────

function RuleCard({ rule, index, total, onChange, onRemove, onMove }: {
  rule: RenameRule; index: number; total: number;
  onChange: (patch: Partial<RenameRule>) => void;
  onRemove: () => void;
  onMove: (d: -1 | 1) => void;
}) {
  const meta = RULE_TYPES.find((r) => r.kind === rule.kind)!;
  const Icon = meta.icon;
  return (
    <div className="rounded-lg p-3" style={{ background: "rgba(30,37,53,.5)", border: "1px solid #2d3748" }}>
      <div className="flex items-center gap-2 mb-3">
        <span style={{ color: rule.enabled ? "#f97316" : "#475569" }}>
          <Icon size={14} />
        </span>
        <span className="text-sm font-medium flex-1" style={{ color: rule.enabled ? "#f1f5f9" : "#64748b" }}>
          {meta.label}
        </span>
        <Switch checked={rule.enabled} onChange={(v) => onChange({ enabled: v })} />
        <button onClick={() => onMove(-1)} disabled={index === 0}
          className="rounded-md cursor-pointer disabled:opacity-30 flex items-center justify-center"
          style={{ width: 24, height: 24, color: "#94a3b8", border: "1px solid #2d3748" }}>
          <ArrowUp size={11} />
        </button>
        <button onClick={() => onMove(1)} disabled={index === total - 1}
          className="rounded-md cursor-pointer disabled:opacity-30 flex items-center justify-center"
          style={{ width: 24, height: 24, color: "#94a3b8", border: "1px solid #2d3748" }}>
          <ArrowDown size={11} />
        </button>
        <button onClick={onRemove}
          className="rounded-md cursor-pointer flex items-center justify-center"
          style={{ width: 24, height: 24, color: "#ef4444", border: "1px solid rgba(239,68,68,.25)" }}>
          <X size={11} />
        </button>
      </div>
      <RuleBody rule={rule} onChange={onChange} />
    </div>
  );
}

function RuleBody({ rule, onChange }: { rule: RenameRule; onChange: (patch: Partial<RenameRule>) => void; }) {
  switch (rule.kind) {
    case "prefix":
    case "suffix":
      return (
        <Field label={rule.kind === "prefix" ? "Text to add at the start" : "Text to add at the end"}>
          <Input value={rule.text} onChange={(v) => onChange({ text: v })}
            placeholder={rule.kind === "prefix" ? "report-" : "-final"} />
        </Field>
      );
    case "numbering":
      return (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Position"><PositionPicker value={rule.position} onChange={(v) => onChange({ position: v })} /></Field>
          <Field label="Separator"><Input value={rule.separator} onChange={(v) => onChange({ separator: v })} placeholder="-" /></Field>
          <Field label="Start at"><Input type="number" value={String(rule.startAt)} onChange={(v) => onChange({ startAt: parseInt(v) || 0 })} /></Field>
          <Field label="Digits"><Input type="number" value={String(rule.digits)} onChange={(v) => onChange({ digits: Math.max(1, parseInt(v) || 1) })} /></Field>
        </div>
      );
    case "date":
      return (
        <div className="grid grid-cols-2 gap-2">
          <Field label="Position"><PositionPicker value={rule.position} onChange={(v) => onChange({ position: v })} /></Field>
          <Field label="Separator"><Input value={rule.separator} onChange={(v) => onChange({ separator: v })} placeholder="_" /></Field>
          <Field label="Format" full>
            <Select value={rule.format} onChange={(v) => onChange({ format: v as DateFormat })}
              options={[
                { value: "YYYY-MM-DD", label: "YYYY-MM-DD" },
                { value: "YYYYMMDD",   label: "YYYYMMDD" },
                { value: "YYYY_MM_DD", label: "YYYY_MM_DD" },
                { value: "DD-MM-YYYY", label: "DD-MM-YYYY" },
              ]} />
          </Field>
        </div>
      );
    case "replace":
      return (
        <div className="space-y-2">
          <Field label="Find"><Input value={rule.find} onChange={(v) => onChange({ find: v })} placeholder="IMG_" /></Field>
          <Field label="Replace with"><Input value={rule.replaceWith} onChange={(v) => onChange({ replaceWith: v })} placeholder="photo-" /></Field>
          <CheckboxRow label="Case sensitive" checked={rule.caseSensitive} onChange={(v) => onChange({ caseSensitive: v })} />
        </div>
      );
    case "regex":
      return (
        <div className="space-y-2">
          <Field label="Pattern"><Input value={rule.pattern} onChange={(v) => onChange({ pattern: v })} mono placeholder="\d{4}" /></Field>
          <Field label="Replace with"><Input value={rule.replaceWith} onChange={(v) => onChange({ replaceWith: v })} mono placeholder="$&" /></Field>
          <Field label="Flags"><Input value={rule.flags} onChange={(v) => onChange({ flags: v })} mono placeholder="g" /></Field>
        </div>
      );
    case "case":
      return (
        <Field label="Mode">
          <Select value={rule.mode} onChange={(v) => onChange({ mode: v as CaseMode })}
            options={[
              { value: "upper",    label: "UPPERCASE" },
              { value: "lower",    label: "lowercase" },
              { value: "title",    label: "Title Case" },
              { value: "sentence", label: "Sentence case" },
            ]} />
        </Field>
      );
    case "removeSpecial":
      return (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: "#64748b" }}>
            Strips characters that are not letters, numbers, spaces, or underscores.
          </p>
          <CheckboxRow label="Keep dots" checked={rule.keepDots} onChange={(v) => onChange({ keepDots: v })} />
          <CheckboxRow label="Keep dashes" checked={rule.keepDashes} onChange={(v) => onChange({ keepDashes: v })} />
        </div>
      );
    case "trim":
      return (
        <div className="space-y-2">
          <p className="text-xs" style={{ color: "#64748b" }}>Removes leading and trailing whitespace.</p>
          <CheckboxRow label="Collapse inner whitespace to single spaces" checked={rule.collapseSpaces} onChange={(v) => onChange({ collapseSpaces: v })} />
        </div>
      );
  }
}

function Field({ label, children, full }: { label: string; children: React.ReactNode; full?: boolean }) {
  return (
    <div className={full ? "col-span-2" : ""}>
      <label className="text-xs font-medium block mb-1" style={{ color: "#94a3b8" }}>{label}</label>
      {children}
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text", mono }: {
  value: string; onChange: (v: string) => void; placeholder?: string; type?: string; mono?: boolean;
}) {
  return (
    <input type={type} value={value} placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      className="w-full rounded-md px-2.5 py-1.5 text-xs outline-none"
      style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9",
        fontFamily: mono ? "JetBrains Mono, monospace" : undefined }} />
  );
}

function Select<T extends string>({ value, onChange, options }: {
  value: T; onChange: (v: T) => void; options: { value: T; label: string }[];
}) {
  return (
    <select value={value} onChange={(e) => onChange(e.target.value as T)}
      className="w-full rounded-md px-2.5 py-1.5 text-xs outline-none cursor-pointer"
      style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9" }}>
      {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
    </select>
  );
}

function PositionPicker({ value, onChange }: { value: Position; onChange: (v: Position) => void }) {
  return (
    <div className="flex gap-1">
      {(["prefix","suffix"] as Position[]).map((p) => (
        <button key={p} onClick={() => onChange(p)}
          className="flex-1 px-2 py-1.5 rounded-md border text-xs font-medium cursor-pointer"
          style={{
            background:  value === p ? "rgba(249,115,22,.12)" : "#1e2535",
            borderColor: value === p ? "#f97316" : "#2d3748",
            color:       value === p ? "#fb923c" : "#94a3b8",
          }}>{p}</button>
      ))}
    </div>
  );
}

function CheckboxRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="flex items-center gap-2 cursor-pointer">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)}
        className="cursor-pointer" />
      <span className="text-xs" style={{ color: "#94a3b8" }}>{label}</span>
    </label>
  );
}

