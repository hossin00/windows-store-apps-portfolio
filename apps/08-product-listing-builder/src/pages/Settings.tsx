import { useState } from "react";
import { Moon, Sun, Monitor, Trash2, RotateCcw } from "lucide-react";
import { Topbar } from "../components/Topbar";
import {
  Button, Card, ToggleRow, TextField, SelectField, Divider, ACCENT,
} from "../components/UI";
import { useApp } from "../context/AppContext";
import {
  clearAllLocalData, getStorageSizeKB,
  CURRENCY_OPTIONS, CONDITION_OPTIONS, PLATFORM_OPTIONS,
} from "../services/listingService";
import { useToast } from "../context/ToastContext";
import type { Theme, Currency, Condition, Platform } from "../types";

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
      <Topbar title="Settings" subtitle="App preferences and listing defaults" />
      <div className="flex-1 overflow-y-auto p-6 max-w-xl space-y-5">

        <SettingsCard title="Appearance">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Theme</label>
            <div className="flex gap-2">
              {([["dark","Dark",Moon],["light","Light",Sun],["system","System",Monitor]] as [Theme, string, typeof Moon][]).map(([v, l, Icon]) => (
                <button key={v} onClick={() => updateSettings({ theme: v })}
                  className="btn-press flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium cursor-pointer"
                  style={{
                    background: settings.theme === v ? "rgba(14,165,233,.12)" : "#1e2535",
                    borderColor: settings.theme === v ? ACCENT : "#2d3748",
                    color: settings.theme === v ? "#38bdf8" : "#94a3b8",
                  }}>
                  <Icon size={15} />{l}
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Defaults for new listings">
          <div className="grid grid-cols-2 gap-3">
            <SelectField label="Default currency"
              value={settings.defaultCurrency}
              onChange={(v) => updateSettings({ defaultCurrency: v as Currency })}
              options={CURRENCY_OPTIONS.map((c) => ({ value: c.value, label: c.label }))} />
            <SelectField label="Default condition"
              value={settings.defaultCondition}
              onChange={(v) => updateSettings({ defaultCondition: v as Condition })}
              options={CONDITION_OPTIONS} />
          </div>
          <SelectField label="Default platform"
            value={settings.defaultPlatform}
            onChange={(v) => updateSettings({ defaultPlatform: v as Platform })}
            options={PLATFORM_OPTIONS.map((p) => ({ value: p.value, label: p.label }))} />
          <Divider />
          <TextField label="Business name (pre-fills every listing)"
            value={settings.businessName}
            onChange={(v) => updateSettings({ businessName: v })}
            placeholder="Acme Studio" />
        </SettingsCard>

        <SettingsCard title="History & Privacy">
          <ToggleRow label="Save listings locally"
            description="Keep saved listings between sessions in browser localStorage."
            checked={settings.saveHistory} onChange={(v) => updateSettings({ saveHistory: v })} />
          <Divider />
          <ToggleRow label="Privacy mode"
            description="Reserved for future cloud sync features. When enabled, no scan or remote feature will ever auto-run."
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
            Removes saved listings, templates, and settings. TXT / JSON exports already downloaded are unaffected.
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
