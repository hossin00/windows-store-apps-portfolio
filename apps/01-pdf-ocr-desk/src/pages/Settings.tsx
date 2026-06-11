import { useState } from "react";
import { Moon, Sun, Monitor, Trash2, RotateCcw } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, Divider, ToggleRow } from "../components/UI";
import { useApp } from "../context/AppContext";
import { clearAllLocalData, getStorageSizeKB } from "../services/localStorageService";
import { useToast } from "../context/ToastContext";
import type { Theme, ExportFormat } from "../types";

export function Settings() {
  const { settings, updateSettings } = useApp();
  const { toast } = useToast();
  const [storageKB,     setStorageKB]     = useState(getStorageSizeKB);
  const [confirmClear,  setConfirmClear]  = useState(false);

  const handleClearData = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearAllLocalData(); toast("All local data cleared", "info");
    setConfirmClear(false); window.location.reload();
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Settings" subtitle="App preferences and local data" />
      <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-5">

        <SettingsCard title="Appearance">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Theme</label>
            <div className="flex gap-2">
              {([["dark","Dark",Moon],["light","Light",Sun],["system","System",Monitor]] as [Theme, string, typeof Moon][]).map(([v, l, Icon]) => (
                <button key={v} onClick={() => updateSettings({ theme: v })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer"
                  style={{ background: settings.theme === v ? "rgba(59,130,246,.12)" : "#1e2535",
                    borderColor: settings.theme === v ? "#3b82f6" : "#2d3748",
                    color: settings.theme === v ? "#60a5fa" : "#94a3b8" }}>
                  <Icon size={15} />{l}
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="OCR">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>OCR Language</label>
            <select value={settings.ocrLanguage} onChange={(e) => updateSettings({ ocrLanguage: e.target.value })}
              className="rounded-md px-3 py-2 text-sm outline-none"
              style={{ background: "#1e2535", border: "1px solid #2d3748", color: "#f1f5f9", maxWidth: 240 }}>
              <option value="eng">English</option>
              <option value="fra">French</option>
              <option value="deu">German</option>
              <option value="spa">Spanish</option>
              <option value="ita">Italian</option>
              <option value="por">Portuguese</option>
              <option value="ara">Arabic</option>
              <option value="chi_sim">Chinese (Simplified)</option>
              <option value="jpn">Japanese</option>
            </select>
            <p className="text-xs mt-1" style={{ color: "#475569" }}>
              Language selection applies when a full OCR engine is connected.
            </p>
          </div>
        </SettingsCard>

        <SettingsCard title="History & Export">
          <ToggleRow label="Save OCR history locally"
            description="Keep a local record of extracted text. You can clear this at any time."
            checked={settings.saveHistory} onChange={(v) => updateSettings({ saveHistory: v })} />
          <Divider />
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Default export format</label>
            <div className="flex gap-2">
              {(["txt","md","json"] as ExportFormat[]).map((fmt) => (
                <button key={fmt} onClick={() => updateSettings({ defaultExportFormat: fmt })}
                  className="px-4 py-2 rounded-lg border text-sm font-medium uppercase transition-all cursor-pointer"
                  style={{ background: settings.defaultExportFormat === fmt ? "rgba(59,130,246,.12)" : "#1e2535",
                    borderColor: settings.defaultExportFormat === fmt ? "#3b82f6" : "#2d3748",
                    color: settings.defaultExportFormat === fmt ? "#60a5fa" : "#94a3b8" }}>
                  {fmt}
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Privacy">
          <ToggleRow label="Privacy mode"
            description="When enabled, OCR history is not saved and results are cleared after the workspace is closed."
            checked={settings.privacyMode} onChange={(v) => updateSettings({ privacyMode: v })} />
        </SettingsCard>

        <SettingsCard title="Local Data">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>Storage used</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Approx. {storageKB} KB in browser localStorage</p>
            </div>
            <span className="text-sm font-semibold" style={{ color: "#3b82f6" }}>{storageKB} KB</span>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="danger" size="sm" onClick={handleClearData} icon={<Trash2 size={13} />}>
              {confirmClear ? "Confirm — clear all data" : "Clear all local data"}
            </Button>
            {confirmClear && (
              <Button variant="ghost" size="sm" onClick={() => setConfirmClear(false)} icon={<RotateCcw size={13} />}>Cancel</Button>
            )}
          </div>
          <p className="text-xs mt-2" style={{ color: "#475569" }}>
            Removes all OCR history, settings, and export records stored locally in this browser.
          </p>
        </SettingsCard>
      </div>
    </div>
  );
}

function SettingsCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card>
      <p className="text-sm font-semibold mb-4" style={{ color: "#f1f5f9" }}>{title}</p>
      <div className="space-y-4">{children}</div>
    </Card>
  );
}
