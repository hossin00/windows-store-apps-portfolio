import { useCallback, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  Upload, Files, Trash2, CheckCircle2, Square, RotateCcw, Play, Save,
  Image as ImageIcon, FileText as FileIcon, Sparkles,
  HardDrive,
} from "lucide-react";
import { Topbar } from "../components/Topbar";
import {
  Button, Card, EmptyState, Badge, Segmented, ACCENT,
} from "../components/UI";
import { EmptyFolderSearchIllustration, AllCleanIllustration } from "../components/illustrations";
import { useToast } from "../context/ToastContext";
import { useApp } from "../context/AppContext";
import { useScan } from "../context/ScanContext";
import {
  toScanFile, applyFilters, groupFiles, autoSelect, clearSelections,
  toggleFile, applyDeletion, totalWastedSpace, selectedSize, duplicateCount,
  formatBytes,
} from "../services/duplicateService";
import type { ScanFile, CompareMode, AutoKeepMode } from "../types";

export function Scanner() {
  const nav      = useNavigate();
  const { toast } = useToast();
  const { settings, updateSettings } = useApp();
  const scan     = useScan();

  const [busy,   setBusy]   = useState(false);
  const [label,  setLabel]  = useState("");

  // Re-group whenever files or compareMode change.
  const computedGroups = useMemo(() => {
    const filtered = applyFilters(scan.files, settings);
    return groupFiles(filtered, scan.compareMode ?? settings.compareMode);
  }, [scan.files, scan.compareMode, settings]);

  // Keep ScanContext.groups in sync with computedGroups whenever the inputs change,
  // preserving selection state by id.
  useEffect(() => {
    const prevById = new Map<string, boolean>();
    for (const g of scan.groups) for (const f of g.files) prevById.set(f.id, f.selected);
    const next = computedGroups.map((g) => ({
      ...g,
      files: g.files.map((f) => ({ ...f, selected: prevById.get(f.id) ?? f.selected })),
    }));
    scan.setGroups(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedGroups]);

  const onDrop = useCallback((accepted: File[]) => {
    if (accepted.length === 0) return;
    const next = accepted.map(toScanFile);
    scan.setFiles([...scan.files, ...next]);
    if (!scan.compareMode) scan.setCompareMode(settings.compareMode);
    toast(`Added ${next.length} file${next.length !== 1 ? "s" : ""}`, "success");
  }, [scan, settings.compareMode, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop, multiple: true, // Accept any type
  });

  const setMode = (m: CompareMode) => { scan.setCompareMode(m); updateSettings({ compareMode: m }); };
  const wasted   = totalWastedSpace(scan.groups);
  const willFree = selectedSize(scan.groups);
  const dupes    = duplicateCount(scan.groups);

  const doAutoSelect = (m: AutoKeepMode) => {
    scan.setGroups(autoSelect(scan.groups, m));
    toast(`Auto-selected — keep ${m}`, "success");
  };

  const onApply = () => {
    if (willFree === 0) { toast("Select duplicates to remove first", "warning"); return; }
    setBusy(true);
    try {
      const result = applyDeletion({
        files:       scan.files,
        groups:      scan.groups,
        compareMode: scan.compareMode ?? settings.compareMode,
        label:       label.trim() || `Scan of ${scan.files.length} files`,
      });
      toast(`Plan saved · would free ${formatBytes(result.recoveredSpace)} (${result.filesRemoved} file${result.filesRemoved !== 1 ? "s" : ""})`, "success");
      setLabel("");
      nav("/results");
    } catch (e: any) {
      toast(`Could not apply: ${e.message ?? "unknown"}`, "error");
    } finally {
      setBusy(false);
    }
  };

  const onReset = () => {
    scan.reset();
    setLabel("");
    toast("Scanner cleared", "info");
  };

  // ── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Scanner" subtitle={`${scan.files.length} file${scan.files.length !== 1 ? "s" : ""} ingested · ${dupes} duplicate${dupes !== 1 ? "s" : ""} found`}
        actions={
          <>
            {scan.files.length > 0 && (
              <Button variant="secondary" size="sm" onClick={onReset} icon={<RotateCcw size={13} />}>Reset</Button>
            )}
            {willFree > 0 && (
              <Button variant="primary" size="sm" onClick={onApply} loading={busy} icon={<Play size={13} />}>
                Save scan plan
              </Button>
            )}
          </>
        } />

      <div className="flex-1 overflow-y-auto p-6 space-y-5">

        {/* Dropzone */}
        <div {...getRootProps()}
          className="rounded-xl border-2 border-dashed cursor-pointer transition-all duration-150 flex flex-col items-center justify-center gap-3 py-10 px-6 text-center btn-press"
          style={{
            borderColor: isDragActive ? ACCENT : "#2d3748",
            background:  isDragActive ? "rgba(239,68,68,0.06)" : "rgba(22,27,39,.5)",
          }}>
          <input {...getInputProps()} />
          <div className="rounded-xl p-3"
            style={{ background: isDragActive ? "rgba(239,68,68,.15)" : "rgba(239,68,68,.08)", color: isDragActive ? "#f87171" : ACCENT }}>
            <Upload size={24} strokeWidth={1.8} />
          </div>
          <div>
            <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
              {isDragActive ? "Drop files here" : "Drop files or click to browse"}
            </p>
            <p className="text-xs mt-1" style={{ color: "#64748b" }}>
              Any type · select many files at once · the browser cannot read whole folders, so use the file picker to multi-select
            </p>
          </div>
        </div>

        {/* Compare-mode picker */}
        {scan.files.length > 0 && (
          <Card>
            <div className="flex items-center justify-between flex-wrap gap-3">
              <div>
                <p className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Compare mode</p>
                <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
                  Group dropped files by this rule. Hash = name + size fingerprint.
                </p>
              </div>
              <Segmented<CompareMode> value={scan.compareMode ?? settings.compareMode}
                onChange={(v) => setMode(v)}
                options={[
                  { value: "hash", label: "Hash (name + size)" },
                  { value: "name", label: "Name only" },
                  { value: "size", label: "Size only" },
                ]} />
            </div>
          </Card>
        )}

        {/* Summary strip + auto-select */}
        {scan.files.length > 0 && (
          <div className="grid grid-cols-4 gap-3">
            <Pill icon={<Files size={14} />}     label="Ingested" value={`${scan.files.length}`} />
            <Pill icon={<Sparkles size={14} />}  label="Groups"   value={`${scan.groups.length}`} />
            <Pill icon={<HardDrive size={14} />} label="Reclaimable" value={formatBytes(wasted)} accent />
            <Pill icon={<CheckCircle2 size={14}/>} label="Will free"  value={formatBytes(willFree)} highlight />
          </div>
        )}
        {scan.files.length > 0 && scan.groups.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs" style={{ color: "#64748b" }}>Auto-select:</span>
            <Button variant="secondary" size="sm" onClick={() => doAutoSelect("newest")}>Keep newest</Button>
            <Button variant="secondary" size="sm" onClick={() => doAutoSelect("oldest")}>Keep oldest</Button>
            <Button variant="secondary" size="sm" onClick={() => doAutoSelect("first")}>Keep first</Button>
            <Button variant="ghost" size="sm" onClick={() => scan.setGroups(clearSelections(scan.groups))}
              icon={<Square size={12} />} style={{ color: "#94a3b8" }}>
              Clear selection
            </Button>
            <div className="flex-1" />
            <input value={label} onChange={(e) => setLabel(e.target.value)}
              placeholder="Optional label for this scan"
              className="rounded-md px-3 py-1.5 text-xs outline-none"
              style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9", width: 240 }} />
          </div>
        )}

        {/* Groups */}
        {scan.files.length === 0 ? (
          <EmptyState illustration={<EmptyFolderSearchIllustration />}
            title="Drop files to scan"
            description="Drag and drop files into the box above, or click to use the picker. Duplicate File Finder will group exact matches by name + size." />
        ) : scan.groups.length === 0 ? (
          <EmptyState illustration={<AllCleanIllustration />}
            title="No duplicates — you're clean"
            description={`All ${scan.files.length} file${scan.files.length !== 1 ? "s" : ""} are unique under the "${scan.compareMode ?? settings.compareMode}" rule. Try a different mode to be sure.`} />
        ) : (
          <div className="space-y-4">
            {scan.groups.map((g) => {
              const reclaim = g.files.reduce((s, f) => s + f.size, 0) - Math.max(...g.files.map((f) => f.size));
              const selectedInGroup = g.files.filter((f) => f.selected).length;
              return (
                <Card key={g.id} style={{ padding: 0, overflow: "hidden" }}>
                  <div className="flex items-center gap-3 px-5 py-3 border-b" style={{ borderColor: "#2d3748" }}>
                    <Badge variant="red">{g.kind.toUpperCase()}</Badge>
                    <span className="text-sm font-medium" style={{ color: "#f1f5f9" }}>
                      {g.files.length} matches
                    </span>
                    <span className="text-xs font-mono truncate flex-1" style={{ color: "#64748b" }} title={g.key}>
                      {g.key}
                    </span>
                    <span className="text-xs" style={{ color: "#f87171" }}>
                      reclaim up to {formatBytes(reclaim)}
                    </span>
                    {selectedInGroup > 0 && (
                      <span className="text-xs" style={{ color: "#22c55e" }}>
                        {selectedInGroup} selected
                      </span>
                    )}
                  </div>
                  <div className="grid grid-cols-3 gap-3 p-4">
                    {g.files.map((f) => (
                      <FileTile key={f.id} file={f}
                        onToggle={() => scan.setGroups(toggleFile(scan.groups, g.id, f.id))} />
                    ))}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── File tile (image preview / icon + metadata) ─────────────────────────────

function FileTile({ file, onToggle }: { file: ScanFile; onToggle: () => void }) {
  const isImg = !!file.previewUrl;
  return (
    <button onClick={onToggle}
      className="text-left rounded-lg p-3 border transition-all duration-150 btn-press"
      style={{
        background:  file.selected ? "rgba(239,68,68,.12)" : "rgba(30,37,53,.6)",
        borderColor: file.selected ? "#ef4444" : "#2d3748",
        cursor: "pointer",
      }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="rounded flex items-center justify-center flex-shrink-0"
          style={{ width: 48, height: 48, background: isImg ? "#1e2535" : "rgba(239,68,68,0.08)", border: "1px solid #2d3748", overflow: "hidden" }}>
          {isImg ? (
            <img src={file.previewUrl} alt={file.name}
              style={{ maxWidth: "100%", maxHeight: "100%", display: "block" }} />
          ) : (
            <FileIcon size={20} color="#f87171" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium truncate" style={{ color: "#f1f5f9" }} title={file.name}>{file.name}</p>
          <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>
            {formatBytes(file.size)} · {new Date(file.lastModified).toLocaleDateString()}
          </p>
        </div>
      </div>
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono truncate" style={{ color: "#475569" }}>{file.type || "binary"}</span>
        <span className="text-xs font-semibold" style={{ color: file.selected ? "#f87171" : "#475569" }}>
          {file.selected ? "WILL REMOVE" : "KEEP"}
        </span>
      </div>
    </button>
  );
}

// ─── Pill ────────────────────────────────────────────────────────────────────

function Pill({ icon, label, value, accent, highlight }: {
  icon: React.ReactNode; label: string; value: string; accent?: boolean; highlight?: boolean;
}) {
  const color = highlight ? "#22c55e" : accent ? ACCENT : "#f1f5f9";
  return (
    <Card>
      <div className="flex items-center gap-3">
        <div className="rounded-md p-2 flex-shrink-0"
          style={{ background: highlight ? "rgba(34,197,94,0.1)" : "rgba(239,68,68,0.1)", color: highlight ? "#22c55e" : ACCENT }}>
          {icon}
        </div>
        <div>
          <p className="text-xs" style={{ color: "#64748b" }}>{label}</p>
          <p className="text-base font-bold" style={{ color }}>{value}</p>
        </div>
      </div>
    </Card>
  );
}
