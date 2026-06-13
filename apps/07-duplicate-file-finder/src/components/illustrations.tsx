/**
 * illustrations.tsx
 * Inline SVG illustrations used in Onboarding and EmptyState. Tinted with the
 * app's red accent for a coherent identity.
 */

const ACC      = "#ef4444";
const ACC_SOFT = "#f87171";
const ACC_DEEP = "#b91c1c";

// ─── Onboarding — slide 1: two identical file stacks ─────────────────────────
export function TwinFilesIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-file-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor={ACC} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      {/* Left stack */}
      <g transform="translate(28,40)">
        <rect x="6" y="6" width="60" height="80" rx="6" fill="#1e2535" stroke="#475569" />
        <rect x="0" y="0" width="60" height="80" rx="6" fill="#ffffff" stroke="#cbd5e1" />
        <rect x="8" y="14" width="34" height="3" rx="1.5" fill="#94a3b8" />
        <rect x="8" y="22" width="44" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="8" y="30" width="40" height="3" rx="1.5" fill="#cbd5e1" />
      </g>
      {/* Right stack */}
      <g transform="translate(106,40)">
        <rect x="6" y="6" width="60" height="80" rx="6" fill="#1e2535" stroke="#475569" />
        <rect x="0" y="0" width="60" height="80" rx="6" fill="#ffffff" stroke="#cbd5e1" />
        <rect x="8" y="14" width="34" height="3" rx="1.5" fill="#94a3b8" />
        <rect x="8" y="22" width="44" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="8" y="30" width="40" height="3" rx="1.5" fill="#cbd5e1" />
      </g>
      {/* Equal sign bridging them */}
      <g>
        <rect x="92" y="76" width="16" height="3.5" rx="1.5" fill="url(#ill-file-grad)" />
        <rect x="92" y="86" width="16" height="3.5" rx="1.5" fill="url(#ill-file-grad)" />
      </g>
      {/* Warning marker */}
      <circle cx="100" cy="156" r="14" fill={ACC} />
      <rect x="98" y="146" width="4" height="10" rx="2" fill="#ffffff" />
      <circle cx="100" cy="161" r="1.8" fill="#ffffff" />
    </svg>
  );
}

// ─── Onboarding — slide 2: checklist with files ──────────────────────────────
export function ReviewListIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-list-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={ACC} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      <rect x="32" y="30" width="136" height="140" rx="10" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      {[0, 1, 2, 3].map((i) => (
        <g key={i} transform={`translate(48,${52 + i * 26})`}>
          {/* checkbox */}
          <rect x="0" y="0" width="14" height="14" rx="3"
            fill={i < 2 ? "url(#ill-list-grad)" : "#ffffff"}
            stroke={i < 2 ? "url(#ill-list-grad)" : "#cbd5e1"} strokeWidth="1.5" />
          {i < 2 && (
            <path d="M3 7 L6 10 L11 4" stroke="#ffffff" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
          )}
          {/* file row */}
          <rect x="24" y="2" width="80" height="4" rx="2" fill="#0f172a" opacity="0.7" />
          <rect x="24" y="9" width="60" height="3" rx="1.5" fill="#cbd5e1" />
        </g>
      ))}
    </svg>
  );
}

// ─── Onboarding — slide 3: disk/storage with freed space ─────────────────────
export function DiskFreeIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-disk-grad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%"  stopColor={ACC_SOFT} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      {/* Outer ring */}
      <circle cx="100" cy="100" r="62" fill="none" stroke="#1e2535" strokeWidth="14" />
      {/* Used arc */}
      <circle cx="100" cy="100" r="62" fill="none" stroke="url(#ill-disk-grad)" strokeWidth="14"
        strokeDasharray="195 800" strokeLinecap="round" transform="rotate(-90 100 100)" />
      {/* Center hub */}
      <circle cx="100" cy="100" r="30" fill="#ffffff" stroke="#cbd5e1" />
      <circle cx="100" cy="100" r="8" fill={ACC_DEEP} />
      {/* Freed badge */}
      <g transform="translate(132,142)">
        <circle r="18" fill={ACC} />
        <path d="M-7 1 L-2 6 L7 -3" stroke="#ffffff" strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </svg>
  );
}

// ─── Empty state — folder with magnifier (no files yet) ──────────────────────
export function EmptyFolderSearchIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <path d="M30 60 Q30 52 38 52 L72 52 L84 66 L150 66 Q158 66 158 74 L158 144 Q158 152 150 152 L38 152 Q30 152 30 144 Z"
        fill="rgba(239,68,68,0.08)" stroke={ACC} strokeWidth="2" />
      <circle cx="120" cy="118" r="22" stroke={ACC} strokeWidth="4" fill="#ffffff" />
      <line x1="136" y1="134" x2="156" y2="154" stroke={ACC_DEEP} strokeWidth="5" strokeLinecap="round" />
      <circle cx="116" cy="115" r="2.5" fill={ACC_DEEP} />
      <circle cx="124" cy="115" r="2.5" fill={ACC_DEEP} />
    </svg>
  );
}

// ─── Empty state — all clean (checkmark shield) ──────────────────────────────
export function AllCleanIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-clean-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor="#34d399" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
      </defs>
      <path d="M100 28 L160 50 L160 110 Q160 152 100 180 Q40 152 40 110 L40 50 Z"
        fill="url(#ill-clean-grad)" />
      <path d="M70 100 L92 122 L132 80" stroke="#ffffff" strokeWidth="9" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Empty state — empty history (clock + folder) ────────────────────────────
export function EmptyHistoryIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <path d="M30 70 Q30 62 38 62 L72 62 L84 76 L150 76 Q158 76 158 84 L158 152 Q158 160 150 160 L38 160 Q30 160 30 152 Z"
        fill="rgba(239,68,68,0.05)" stroke={ACC} strokeWidth="1.5" />
      <circle cx="140" cy="50" r="22" fill="#ffffff" stroke={ACC} strokeWidth="3" />
      <path d="M140 38 L140 50 L150 56" stroke={ACC_DEEP} strokeWidth="3.5" strokeLinecap="round" />
    </svg>
  );
}
