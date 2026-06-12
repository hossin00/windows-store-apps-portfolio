import { useState } from "react";
import { Moon, Sun, Monitor, Trash2, RotateCcw } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, ToggleRow, SelectField, Divider, ACCENT } from "../components/UI";
import { useApp } from "../context/AppContext";
import { clearAllLocalData, getStorageSizeKB } from "../services/clipboardService";
import { useToast } from "../context/ToastContext";
import type { Theme, MaxItemsOption } from "../types";

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
      <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-5">

        <SettingsCard title="Appearance">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Theme</label>
            <div className="flex gap-2">
              {([["dark","Dark",Moon],["light","Light",Sun],["system","System",Monitor]] as [Theme, string, typeof Moon][]).map(([v, l, Icon]) => (
                <button key={v} onClick={() => updateSettings({ theme: v })}
                  className="btn-press flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer"
                  style={{
                    background: settings.theme === v ? "rgba(139,92,246,.12)" : "#1e2535",
                    borderColor: settings.theme === v ? ACCENT : "#2d3748",
                    color: settings.theme === v ? "#a78bfa" : "#94a3b8",
                  }}>
                  <Icon size={15} />{l}
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Vault">
          <SelectField label="Maximum stored snippets"
            value={settings.maxItems}
            onChange={(v) => updateSettings({ maxItems: v as MaxItemsOption })}
            options={[
              { value: "100",       label: "100 — light usage" },
              { value: "500",       label: "500 — default" },
              { value: "1000",      label: "1,000 — heavy" },
              { value: "unlimited", label: "Unlimited" },
            ]} />
          <p className="text-xs mt-1" style={{ color: "#475569" }}>
            When the limit is reached, the oldest snippets fall off as new ones are added.
          </p>
          <Divider />
          <ToggleRow label="Auto-detect content types"
            description="Tag pasted text as URL, email, code, phone, or plain text. Turn off if you'd rather everything stay plain."
            checked={settings.autoDetectTypes} onChange={(v) => updateSettings({ autoDetectTypes: v })} />
        </SettingsCard>

        <SettingsCard title="History & Privacy">
          <ToggleRow label="Save history"
            description="Keep saved snippets between sessions. Turning this off in the future won't delete existing snippets, only stop new ones from persisting."
            checked={settings.saveHistory} onChange={(v) => updateSettings({ saveHistory: v })} />
          <Divider />
          <ToggleRow label="Privacy mode"
            description="Reserved for future auto-capture features. When enabled, the app will never silently capture clipboard contents — Add is always manual."
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
            Removes saved snippets, collections, and settings. Exports you have already downloaded are unaffected.
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
