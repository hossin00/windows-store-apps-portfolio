import { useEffect, useState } from "react";
import { ScanLine } from "lucide-react";

const ACC      = "#10b981";
const ACC_DEEP = "#059669";

/**
 * Splash — shown for ~2 seconds on app start. Renders the app logo, name, and
 * a subtle progress bar that fills smoothly. Calls `onDone` after the fade-out
 * completes so the host can swap to the main UI without a frame gap.
 */
export function Splash({ onDone }: { onDone: () => void }) {
  const [fading, setFading] = useState(false);
  useEffect(() => {
    const t1 = setTimeout(() => setFading(true), 1700);
    const t2 = setTimeout(() => onDone(), 2000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [onDone]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center"
      style={{
        background: "#0f1117",
        transition: "opacity 280ms ease",
        opacity: fading ? 0 : 1,
        pointerEvents: fading ? "none" : "auto",
      }}>
      <div className="splash-logo rounded-2xl flex items-center justify-center mb-5"
        style={{ width: 72, height: 72, background: `linear-gradient(135deg,${ACC},${ACC_DEEP})`, boxShadow: `0 16px 48px rgba(16,185,129,.35)` }}>
        <ScanLine size={36} color="#ffffff" strokeWidth={2} />
      </div>
      <p className="text-xl font-semibold tracking-tight" style={{ color: "#f1f5f9" }}>QR Barcode Studio</p>
      <p className="text-xs mt-1.5 mb-7" style={{ color: "#64748b" }}>QR + 1D barcodes, locally</p>
      <div className="rounded-full overflow-hidden" style={{ width: 220, height: 3, background: "#1e2535" }}>
        <div className="splash-bar h-full" style={{ background: `linear-gradient(90deg, ${ACC}, ${ACC_DEEP})` }} />
      </div>
    </div>
  );
}
