/**
 * illustrations.tsx
 * Inline SVG illustrations used in Onboarding and EmptyState. All shapes
 * are tinted from `accent` so each app keeps its own visual identity.
 */

const ACC      = "#8b5cf6";
const ACC_SOFT = "#a78bfa";
const ACC_DEEP = "#7c3aed";

export function ScanDocIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-scan-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor={ACC} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      <rect x="40" y="22" width="120" height="156" rx="10" fill="#ffffff" />
      <rect x="40" y="22" width="120" height="156" rx="10" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x="56" y="46" width="64" height="6" rx="2" fill="#cbd5e1" />
      <rect x="56" y="62" width="88" height="4" rx="2" fill="#e2e8f0" />
      <rect x="56" y="74" width="78" height="4" rx="2" fill="#e2e8f0" />
      <rect x="56" y="86" width="84" height="4" rx="2" fill="#e2e8f0" />
      <rect x="56" y="98" width="62" height="4" rx="2" fill="#e2e8f0" />
      <rect x="56" y="118" width="88" height="4" rx="2" fill="#e2e8f0" />
      <rect x="56" y="130" width="70" height="4" rx="2" fill="#e2e8f0" />
      <rect x="34" y="104" width="132" height="14" rx="7" fill="url(#ill-scan-grad)" opacity="0.85" />
      <rect x="34" y="104" width="132" height="14" rx="7" stroke={ACC} strokeOpacity="0.5" />
    </svg>
  );
}

export function ShieldDocIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-shield-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={ACC_SOFT} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      <rect x="44" y="36" width="100" height="124" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x="58" y="58" width="64" height="4" rx="2" fill="#e2e8f0" />
      <rect x="58" y="70" width="58" height="4" rx="2" fill="#e2e8f0" />
      <rect x="58" y="82" width="40" height="4" rx="2" fill="#e2e8f0" />
      <path d="M100 86 L150 100 L150 132 Q150 158 100 174 Q50 158 50 132 L50 100 Z"
        fill="url(#ill-shield-grad)" />
      <path d="M86 130 L96 140 L116 120" stroke="#ffffff" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ExportIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-export-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor={ACC} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      <rect x="42" y="30" width="96" height="120" rx="8" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      <rect x="56" y="50" width="64" height="4" rx="2" fill="#e2e8f0" />
      <rect x="56" y="62" width="58" height="4" rx="2" fill="#e2e8f0" />
      <rect x="56" y="74" width="48" height="4" rx="2" fill="#e2e8f0" />
      <g transform="translate(118,108)">
        <circle r="32" fill="url(#ill-export-grad)" />
        <path d="M0 -14 L0 14 M-10 4 L0 14 L10 4" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </g>
      <rect x="70" y="156" width="20" height="6" rx="3" fill={ACC} opacity="0.4" />
      <rect x="96" y="156" width="14" height="6" rx="3" fill={ACC} opacity="0.25" />
    </svg>
  );
}

export function EmptyHistoryIllustration({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <circle cx="100" cy="100" r="64" fill={`rgba(139,92,246,0.08)`} />
      <circle cx="100" cy="100" r="48" stroke={ACC} strokeWidth="3" strokeDasharray="6 6" opacity="0.6" />
      <path d="M100 70 L100 100 L122 112" stroke={ACC} strokeWidth="5" strokeLinecap="round" />
      <circle cx="100" cy="100" r="6" fill={ACC_DEEP} />
    </svg>
  );
}

export function EmptySearchIllustration({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <circle cx="86" cy="90" r="34" stroke={ACC} strokeWidth="4" fill="rgba(139,92,246,0.06)" />
      <rect x="115" y="118" width="32" height="6" rx="3" fill={ACC_DEEP} transform="rotate(45 115 118)" />
      <circle cx="78" cy="84" r="3" fill={ACC} />
      <circle cx="92" cy="92" r="3" fill={ACC} />
      <path d="M76 100 Q86 108 96 100" stroke={ACC_DEEP} strokeWidth="2.5" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function EmptyFolderIllustration({ size = 140 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <path d="M40 64 Q40 56 48 56 L82 56 L94 70 L152 70 Q160 70 160 78 L160 144 Q160 152 152 152 L48 152 Q40 152 40 144 Z"
        fill="rgba(139,92,246,0.08)" stroke={ACC} strokeWidth="2.5" />
      <rect x="58" y="92" width="84" height="6" rx="3" fill={ACC} opacity="0.35" />
      <rect x="58" y="106" width="60" height="6" rx="3" fill={ACC} opacity="0.25" />
    </svg>
  );
}
