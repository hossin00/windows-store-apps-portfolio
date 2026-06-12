import { useState } from "react";
import { X, ArrowRight, ArrowLeft } from "lucide-react";
import { ScanDocIllustration, ShieldDocIllustration, ExportIllustration } from "./illustrations";

const ACC      = "#10b981";
const ACC_DEEP = "#059669";

interface Slide { title: string; description: string; render: () => React.ReactNode; }

const SLIDES: Slide[] = [
  {
    title:       "QR Codes for Everything",
    description: "Encode URLs, plain text, Wi-Fi credentials, vCards, and email links. Real-time preview while you type.",
    render: () => <ScanDocIllustration />,
  },
  {
    title:       "Five Barcode Formats",
    description: "Code 128, EAN-13, EAN-8, UPC-A, Code 39 — with per-format validation so you only ever produce scannable barcodes.",
    render: () => <ShieldDocIllustration />,
  },
  {
    title:       "Export Anywhere, Locally",
    description: "Download PNG or SVG. Batch mode turns a list of URLs into a folder of QR codes. Nothing is uploaded; everything runs in your browser.",
    render: () => <ExportIllustration />,
  },
];

const KEY = "qrbar_onboarding_done";

export function shouldShowOnboarding(): boolean {
  try { return localStorage.getItem(KEY) !== "1"; } catch { return false; }
}

export function markOnboardingDone(): void {
  try { localStorage.setItem(KEY, "1"); } catch {}
}

export function Onboarding({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0);
  const slide = SLIDES[i];
  const last  = i === SLIDES.length - 1;

  const finish = () => { markOnboardingDone(); onClose(); };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in"
      style={{ background: "rgba(15,17,23,0.92)", backdropFilter: "blur(12px)" }}>
      <button onClick={finish}
        className="absolute top-5 right-6 flex items-center gap-1 text-sm cursor-pointer transition-colors"
        style={{ color: "#64748b" }}
        onMouseEnter={(e) => (e.currentTarget.style.color = "#f1f5f9")}
        onMouseLeave={(e) => (e.currentTarget.style.color = "#64748b")}>
        Skip <X size={14} />
      </button>

      <div className="rounded-2xl shadow-2xl flex flex-col"
        style={{ width: 520, background: "#161b27", border: "1px solid #2d3748", overflow: "hidden" }}>
        <div className="flex flex-col items-center pt-10 pb-6 px-10"
          style={{ background: "linear-gradient(180deg, rgba(16,185,129,0.06), transparent)" }}>
          <div key={i} className="animate-fade-in mb-6">{slide.render()}</div>
          <h2 className="text-2xl font-bold tracking-tight text-center" style={{ color: "#f1f5f9" }}>
            {slide.title}
          </h2>
          <p className="text-sm text-center leading-relaxed mt-3 max-w-sm" style={{ color: "#94a3b8" }}>
            {slide.description}
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 py-4" style={{ borderTop: "1px solid #2d3748" }}>
          {SLIDES.map((_, j) => (
            <button key={j} onClick={() => setI(j)}
              className="rounded-full transition-all duration-200 cursor-pointer"
              style={{
                width:   i === j ? 22 : 8,
                height:  8,
                background: i === j ? ACC : "#2d3748",
              }} />
          ))}
        </div>

        <div className="flex items-center gap-2 px-6 py-4" style={{ borderTop: "1px solid #2d3748", background: "rgba(30,37,53,0.4)" }}>
          <button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-md text-sm cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
            style={{ background: "#1e2535", color: "#94a3b8", border: "1px solid #2d3748" }}>
            <ArrowLeft size={14} /> Back
          </button>
          <div className="flex-1" />
          {last ? (
            <button onClick={finish}
              className="inline-flex items-center gap-1.5 px-5 py-2 rounded-md text-sm font-medium cursor-pointer transition-all"
              style={{ background: ACC, color: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACC_DEEP)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACC)}>
              Get started <ArrowRight size={14} />
            </button>
          ) : (
            <button onClick={() => setI((v) => Math.min(SLIDES.length - 1, v + 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-sm font-medium cursor-pointer transition-all"
              style={{ background: ACC, color: "#fff" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = ACC_DEEP)}
              onMouseLeave={(e) => (e.currentTarget.style.background = ACC)}>
              Next <ArrowRight size={14} />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
