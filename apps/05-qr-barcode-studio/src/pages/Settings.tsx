import { useState } from "react";
import { Moon, Sun, Monitor, Trash2, RotateCcw } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, ToggleRow, TextField, SelectField, ColorField, Divider, ACCENT } from "../components/UI";
import { useApp } from "../context/AppContext";
import { clearAllLocalData, getStorageSizeKB } from "../services/localStorageService";
import { useToast } from "../context/ToastContext";
import type { Theme, ExportFormat } from "../types";

export function Settings() {
  const { settings, updateSettings } = useApp();
  const { toast } = useToast();
  const [storageKB,    setStorageKB]    = useState(getStorageSizeKB);
  const [confirmClear, setConfirmClear] = useState(false);

  const handleClearData = () => {
    if (!confirmClear) { setConfirmClear(true); return; }
    clearAllLocalData(); toast("All local data cleared", "info");
    setConfirmClear(false); window.location.reload();
  };

  return (
    <div className="flex flex-col h-full" style={{ background: "#0f1117" }}>
      <Topbar title="Settings" subtitle="App preferences and local data" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        <SettingsCard title="Appearance">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Theme</label>
            <div className="flex gap-2">
              {([["dark","Dark",Moon],["light","Light",Sun],["system","System",Monitor]] as [Theme, string, typeof Moon][]).map(([v, l, Icon]) => (
                <button key={v} onClick={() => updateSettings({ theme: v })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer"
                  style={{
                    background: settings.theme === v ? "rgba(16,185,129,.12)" : "#1e2535",
                    borderColor: settings.theme === v ? ACCENT : "#2d3748",
                    color: settings.theme === v ? "#34d399" : "#94a3b8",
                  }}>
                  <Icon size={15} />{l}
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Defaults for new codes">
          <SelectField label="Default export format"
            value={settings.defaultExportFormat}
            onChange={(v) => updateSettings({ defaultExportFormat: v as ExportFormat })}
            options={[
              { value: "png", label: "PNG — raster image" },
              { value: "svg", label: "SVG — vector image" },
            ]} />
          <TextField label="Default QR size" type="number" min={128} max={1024} step={32}
            value={String(settings.defaultQrSize)}
            onChange={(v) => updateSettings({ defaultQrSize: Math.max(128, Math.min(1024, parseInt(v) || 128)) })}
            suffix="px" />
          <Divider />
          <div className="grid grid-cols-2 gap-3">
            <ColorField label="Default foreground" value={settings.defaultFg}
              onChange={(v) => updateSettings({ defaultFg: v })} />
            <ColorField label="Default background" value={settings.defaultBg}
              onChange={(v) => updateSettings({ defaultBg: v })} />
          </div>
        </SettingsCard>

        <SettingsCard title="History & Privacy">
          <ToggleRow label="Save history locally"
            description="Keep a local record of every code you save. You can clear this any time."
            checked={settings.saveHistory} onChange={(v) => updateSettings({ saveHistory: v })} />
          <Divider />
          <ToggleRow label="Privacy mode"
            description="When enabled, history is not saved and in-memory state is cleared between sessions."
            checked={settings.privacyMode} onChange={(v) => updateSettings({ privacyMode: v })} />
        </SettingsCard>

        <SettingsCard title="Local Data">
          <div className="flex items-center justify-between gap-4 mb-4">
            <div>
              <p className="text-sm font-medium" style={{ color: "#f1f5f9" }}>Storage used</p>
              <p className="text-xs mt-0.5" style={{ color: "#64748b" }}>Approx. {storageKB} KB in browser localStorage</p>
            </div>
            <span className="text-sm font-semibold" style={{ color: ACCENT }}>{storageKB} KB</span>
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
            Removes saved codes, settings, and stats. PNG / SVG files you have already downloaded are unaffected.
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
