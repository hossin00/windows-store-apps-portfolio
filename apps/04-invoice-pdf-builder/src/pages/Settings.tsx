import { useState } from "react";
import { Moon, Sun, Monitor, Trash2, RotateCcw } from "lucide-react";
import { Topbar } from "../components/Topbar";
import { Button, Card, ToggleRow, TextField, SelectField, Divider, ACCENT } from "../components/UI";
import { useApp } from "../context/AppContext";
import { clearAllLocalData, getStorageSizeKB } from "../services/localStorageService";
import { useToast } from "../context/ToastContext";
import type { Theme, Currency } from "../types";

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
      <Topbar title="Settings" subtitle="App preferences and default business profile" />
      <div className="flex-1 overflow-y-auto p-6 max-w-2xl space-y-5">

        <SettingsCard title="Appearance">
          <div className="flex flex-col gap-2">
            <label className="text-xs font-medium" style={{ color: "#94a3b8" }}>Theme</label>
            <div className="flex gap-2">
              {([["dark","Dark",Moon],["light","Light",Sun],["system","System",Monitor]] as [Theme, string, typeof Moon][]).map(([v, l, Icon]) => (
                <button key={v} onClick={() => updateSettings({ theme: v })}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-lg border text-sm font-medium transition-all cursor-pointer"
                  style={{ background: settings.theme === v ? "rgba(245,158,11,.12)" : "#1e2535",
                    borderColor: settings.theme === v ? ACCENT : "#2d3748",
                    color: settings.theme === v ? "#fbbf24" : "#94a3b8" }}>
                  <Icon size={15} />{l}
                </button>
              ))}
            </div>
          </div>
        </SettingsCard>

        <SettingsCard title="Defaults for new invoices">
          <SelectField label="Default currency"
            value={settings.defaultCurrency}
            onChange={(v) => updateSettings({ defaultCurrency: v as Currency })}
            options={[
              { value: "USD", label: "USD — US Dollar" },
              { value: "EUR", label: "EUR — Euro" },
              { value: "GBP", label: "GBP — British Pound" },
              { value: "MAD", label: "MAD — Moroccan Dirham" },
            ]} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Default tax rate" type="number" min={0} max={100} step={0.01}
              value={String(settings.defaultTaxRate)}
              onChange={(v) => updateSettings({ defaultTaxRate: Math.max(0, Math.min(100, parseFloat(v) || 0)) })}
              suffix="%" />
            <TextField label="Invoice number prefix"
              value={settings.invoicePrefix}
              onChange={(v) => updateSettings({ invoicePrefix: v })}
              placeholder="INV-" />
          </div>
          <TextField label="Next invoice sequence number" type="number" min={1} step={1}
            value={String(settings.nextInvoiceSeq)}
            onChange={(v) => updateSettings({ nextInvoiceSeq: Math.max(1, parseInt(v) || 1) })} />
        </SettingsCard>

        <SettingsCard title="Default business profile">
          <p className="text-xs" style={{ color: "#64748b" }}>
            Used as the From section on every new invoice. You can edit the business info per-invoice in the editor.
          </p>
          <Divider />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Business name" value={settings.business.name}
              onChange={(v) => updateSettings({ business: { ...settings.business, name: v } })} />
            <TextField label="Logo (emoji)" value={settings.business.logoEmoji}
              onChange={(v) => updateSettings({ business: { ...settings.business, logoEmoji: v.slice(0, 4) } })} />
          </div>
          <TextField label="Address" multiline rows={2}
            value={settings.business.address}
            onChange={(v) => updateSettings({ business: { ...settings.business, address: v } })} />
          <TextField label="Email" type="email"
            value={settings.business.email}
            onChange={(v) => updateSettings({ business: { ...settings.business, email: v } })} />
        </SettingsCard>

        <SettingsCard title="History & Privacy">
          <ToggleRow label="Save invoice history locally"
            description="Keep a local record of every invoice draft you save. You can clear this any time."
            checked={settings.saveHistory} onChange={(v) => updateSettings({ saveHistory: v })} />
          <Divider />
          <ToggleRow label="Privacy mode"
            description="When enabled, invoice history is not saved and any in-memory state is cleared between sessions."
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
            Removes saved invoices, settings, and stats stored locally. Exported PDFs you have downloaded are unaffected.
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
