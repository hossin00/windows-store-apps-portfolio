/**
 * illustrations.tsx
 * Inline SVG illustrations used in Onboarding and EmptyState. Tinted with the
 * app's violet accent for a coherent identity.
 */

const ACC      = "#8b5cf6";
const ACC_SOFT = "#a78bfa";
const ACC_DEEP = "#7c3aed";

// ─── Onboarding — slide 1: clipboard with stacked items ──────────────────────
export function ClipboardStackIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-clip-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor={ACC} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      <rect x="42" y="32" width="116" height="140" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x="80" y="22" width="40" height="20" rx="5" fill="url(#ill-clip-grad)" />
      <rect x="86" y="28" width="28" height="6" rx="2" fill="#ffffff" opacity="0.85" />
      <rect x="58" y="60" width="84" height="22" rx="5" fill="rgba(139,92,246,0.10)" stroke={ACC} strokeWidth="1.2" />
      <rect x="64" y="68" width="48" height="3" rx="1.5" fill={ACC} opacity="0.55" />
      <rect x="64" y="74" width="32" height="3" rx="1.5" fill={ACC} opacity="0.3" />
      <rect x="58" y="92" width="84" height="22" rx="5" fill="rgba(139,92,246,0.05)" stroke={ACC} strokeWidth="1" strokeOpacity="0.6" />
      <rect x="64" y="100" width="58" height="3" rx="1.5" fill="#94a3b8" />
      <rect x="64" y="106" width="40" height="3" rx="1.5" fill="#cbd5e1" />
      <rect x="58" y="124" width="84" height="22" rx="5" fill="rgba(139,92,246,0.05)" stroke={ACC} strokeWidth="1" strokeOpacity="0.6" />
      <rect x="64" y="132" width="62" height="3" rx="1.5" fill="#94a3b8" />
      <rect x="64" y="138" width="34" height="3" rx="1.5" fill="#cbd5e1" />
    </svg>
  );
}

// ─── Onboarding — slide 2: folder with labeled tabs ──────────────────────────
export function FolderTabsIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-folder-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor={ACC_SOFT} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      <rect x="44" y="50" width="32" height="14" rx="3" fill={ACC} opacity="0.85" />
      <rect x="82" y="50" width="42" height="14" rx="3" fill={ACC_SOFT} opacity="0.6" />
      <rect x="130" y="50" width="28" height="14" rx="3" fill={ACC} opacity="0.4" />
      <path d="M40 70 Q40 62 48 62 L80 62 L92 76 L152 76 Q160 76 160 84 L160 150 Q160 158 152 158 L48 158 Q40 158 40 150 Z"
        fill="url(#ill-folder-grad)" />
      <path d="M40 70 Q40 62 48 62 L80 62 L92 76 L152 76 Q160 76 160 84 L160 150 Q160 158 152 158 L48 158 Q40 158 40 150 Z"
        stroke="#ffffff" strokeOpacity="0.25" strokeWidth="1.5" />
      <rect x="56" y="92" width="88" height="4" rx="2" fill="#ffffff" opacity="0.7" />
      <rect x="56" y="104" width="68" height="4" rx="2" fill="#ffffff" opacity="0.5" />
      <rect x="56" y="116" width="76" height="4" rx="2" fill="#ffffff" opacity="0.4" />
      <rect x="56" y="128" width="52" height="4" rx="2" fill="#ffffff" opacity="0.3" />
    </svg>
  );
}

// ─── Onboarding — slide 3: lock + shield (privacy) ───────────────────────────
export function LockShieldIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={ACC_SOFT} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      <path d="M100 28 L160 50 L160 110 Q160 152 100 180 Q40 152 40 110 L40 50 Z"
        fill="url(#ill-shield-grad)" />
      <path d="M100 28 L160 50 L160 110 Q160 152 100 180 Q40 152 40 110 L40 50 Z"
        stroke="#ffffff" strokeOpacity="0.2" strokeWidth="2" />
      <rect x="76" y="100" width="48" height="40" rx="6" fill="#ffffff" />
      <path d="M86 100 L86 86 Q86 74 100 74 Q114 74 114 86 L114 100" stroke="#ffffff" strokeWidth="6" fill="none" strokeLinecap="round" />
      <circle cx="100" cy="116" r="5" fill={ACC_DEEP} />
      <rect x="98" y="116" width="4" height="12" rx="1.5" fill={ACC_DEEP} />
    </svg>
  );
}

// ─── Empty state — vault is empty (clipboard + plus) ─────────────────────────
export function EmptyVaultIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <rect x="48" y="36" width="104" height="136" rx="12" fill="rgba(139,92,246,0.05)" stroke={ACC} strokeWidth="2" strokeDasharray="6 6" />
      <rect x="84" y="26" width="32" height="18" rx="4" fill={ACC} opacity="0.85" />
      <rect x="68" y="74" width="64" height="4" rx="2" fill="#94a3b8" opacity="0.4" />
      <rect x="68" y="86" width="48" height="4" rx="2" fill="#94a3b8" opacity="0.3" />
      <circle cx="100" cy="128" r="22" fill={ACC} />
      <path d="M100 116 L100 140 M88 128 L112 128" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// ─── Empty state — no search results (magnifier) ─────────────────────────────
export function EmptySearchIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <circle cx="86" cy="90" r="38" stroke={ACC} strokeWidth="5" fill="rgba(139,92,246,0.06)" />
      <line x1="116" y1="120" x2="148" y2="152" stroke={ACC_DEEP} strokeWidth="7" strokeLinecap="round" />
      <path d="M70 96 Q86 110 102 96" stroke={ACC_DEEP} strokeWidth="3" strokeLinecap="round" fill="none" />
      <circle cx="76" cy="80" r="3" fill={ACC_DEEP} />
      <circle cx="96" cy="80" r="3" fill={ACC_DEEP} />
    </svg>
  );
}

// ─── Empty state — open folder (collection empty) ────────────────────────────
export function EmptyFolderOpenIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <path d="M40 70 Q40 62 48 62 L80 62 L92 76 L152 76 Q160 76 160 84 L160 150 Q160 158 152 158 L48 158 Q40 158 40 150 Z"
        fill="rgba(139,92,246,0.08)" stroke={ACC} strokeWidth="2" />
      <path d="M50 96 L150 96 L142 152 L58 152 Z" fill="rgba(139,92,246,0.18)" stroke={ACC} strokeWidth="1.5" />
      <rect x="78" y="116" width="44" height="3" rx="1.5" fill={ACC} opacity="0.4" />
      <rect x="86" y="124" width="28" height="3" rx="1.5" fill={ACC} opacity="0.3" />
    </svg>
  );
}
