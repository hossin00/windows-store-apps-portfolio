/**
 * illustrations.tsx
 * Inline SVG illustrations used in Onboarding and EmptyState. Tinted with the
 * app's sky-blue accent for a coherent identity.
 */

const ACC      = "#0ea5e9";
const ACC_SOFT = "#38bdf8";
const ACC_DEEP = "#0369a1";

// ─── Onboarding 1 — product card with price tag ──────────────────────────────
export function ProductCardIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-prod-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor={ACC} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      <rect x="36" y="36" width="120" height="128" rx="12" fill="#ffffff" stroke="#cbd5e1" strokeWidth="1.5" />
      {/* image placeholder */}
      <rect x="50" y="50" width="92" height="58" rx="6" fill="rgba(14,165,233,0.10)" stroke={ACC} strokeWidth="1.2" />
      <path d="M62 96 L78 80 L92 90 L106 76 L130 100" stroke={ACC} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="74" cy="68" r="4.5" fill={ACC_SOFT} />
      {/* title + lines */}
      <rect x="50" y="116" width="64" height="6" rx="3" fill="#0f172a" opacity="0.75" />
      <rect x="50" y="128" width="84" height="3" rx="1.5" fill="#cbd5e1" />
      <rect x="50" y="136" width="56" height="3" rx="1.5" fill="#cbd5e1" />
      {/* price tag */}
      <g transform="translate(118,142) rotate(-15)">
        <path d="M0 0 L36 0 L48 14 L36 28 L0 28 Z" fill="url(#ill-prod-grad)" />
        <circle cx="40" cy="14" r="3" fill="#ffffff" />
        <text x="6" y="19" fill="#ffffff" fontSize="10" fontFamily="Inter, system-ui" fontWeight="700">$29</text>
      </g>
    </svg>
  );
}

// ─── Onboarding 2 — multiple platform windows ────────────────────────────────
export function PlatformsIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-plat-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={ACC_SOFT} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      {/* Back window */}
      <g transform="translate(24,28)">
        <rect width="100" height="74" rx="8" fill="#ffffff" stroke="#cbd5e1" />
        <rect x="0" y="0" width="100" height="14" rx="8" fill="url(#ill-plat-grad)" />
        <circle cx="10" cy="7" r="2.5" fill="#ffffff" opacity="0.7" />
        <circle cx="18" cy="7" r="2.5" fill="#ffffff" opacity="0.5" />
        <circle cx="26" cy="7" r="2.5" fill="#ffffff" opacity="0.3" />
        <rect x="10" y="24" width="30" height="40" rx="4" fill="rgba(14,165,233,0.10)" />
        <rect x="46" y="26" width="44" height="4" rx="2" fill="#0f172a" opacity="0.8" />
        <rect x="46" y="36" width="38" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="46" y="44" width="40" height="3" rx="1.5" fill="#cbd5e1" />
      </g>
      {/* Middle window */}
      <g transform="translate(56,68)">
        <rect width="100" height="74" rx="8" fill="#ffffff" stroke="#cbd5e1" />
        <rect x="0" y="0" width="100" height="14" rx="8" fill="url(#ill-plat-grad)" />
        <rect x="10" y="24" width="30" height="40" rx="4" fill="rgba(14,165,233,0.10)" />
        <rect x="46" y="26" width="44" height="4" rx="2" fill="#0f172a" opacity="0.8" />
        <rect x="46" y="36" width="38" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="46" y="44" width="40" height="3" rx="1.5" fill="#cbd5e1" />
      </g>
      {/* Front window */}
      <g transform="translate(82,108)">
        <rect width="100" height="74" rx="8" fill="#ffffff" stroke="#cbd5e1" />
        <rect x="0" y="0" width="100" height="14" rx="8" fill="url(#ill-plat-grad)" />
        <rect x="10" y="24" width="30" height="40" rx="4" fill="rgba(14,165,233,0.10)" />
        <rect x="46" y="26" width="44" height="4" rx="2" fill="#0f172a" opacity="0.8" />
        <rect x="46" y="36" width="38" height="3" rx="1.5" fill="#cbd5e1" />
        <rect x="46" y="44" width="40" height="3" rx="1.5" fill="#cbd5e1" />
      </g>
    </svg>
  );
}

// ─── Onboarding 3 — export arrows to multiple destinations ───────────────────
export function PublishEverywhereIllustration({ size = 180 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-pub-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%"  stopColor={ACC} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      {/* source card */}
      <rect x="68" y="72" width="64" height="56" rx="8" fill="url(#ill-pub-grad)" />
      <rect x="74" y="80" width="30" height="20" rx="4" fill="#ffffff" opacity="0.85" />
      <rect x="74" y="106" width="48" height="3" rx="1.5" fill="#ffffff" opacity="0.7" />
      <rect x="74" y="114" width="36" height="3" rx="1.5" fill="#ffffff" opacity="0.5" />
      {/* destination boxes */}
      <rect x="18" y="22" width="40" height="26" rx="4" fill="#ffffff" stroke="#cbd5e1" />
      <rect x="142" y="22" width="40" height="26" rx="4" fill="#ffffff" stroke="#cbd5e1" />
      <rect x="18" y="148" width="40" height="26" rx="4" fill="#ffffff" stroke="#cbd5e1" />
      <rect x="142" y="148" width="40" height="26" rx="4" fill="#ffffff" stroke="#cbd5e1" />
      {/* arrows */}
      <path d="M70 78 L52 48" stroke={ACC} strokeWidth="3" strokeLinecap="round" />
      <path d="M52 48 L48 52 M52 48 L48 44" stroke={ACC} strokeWidth="3" strokeLinecap="round" />
      <path d="M130 78 L148 48" stroke={ACC} strokeWidth="3" strokeLinecap="round" />
      <path d="M148 48 L152 52 M148 48 L152 44" stroke={ACC} strokeWidth="3" strokeLinecap="round" />
      <path d="M70 122 L52 148" stroke={ACC} strokeWidth="3" strokeLinecap="round" />
      <path d="M52 148 L48 144 M52 148 L48 152" stroke={ACC} strokeWidth="3" strokeLinecap="round" />
      <path d="M130 122 L148 148" stroke={ACC} strokeWidth="3" strokeLinecap="round" />
      <path d="M148 148 L152 144 M148 148 L152 152" stroke={ACC} strokeWidth="3" strokeLinecap="round" />
    </svg>
  );
}

// ─── Empty state — no listings yet (shopping bag + plus) ─────────────────────
export function EmptyListingsIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <path d="M52 60 L60 162 Q60 172 70 172 L130 172 Q140 172 140 162 L148 60 Z"
        fill="rgba(14,165,233,0.05)" stroke={ACC} strokeWidth="2.5" strokeDasharray="4 4" />
      <path d="M76 60 Q76 38 100 38 Q124 38 124 60" stroke={ACC} strokeWidth="3" fill="none" />
      <circle cx="100" cy="118" r="22" fill={ACC} />
      <path d="M100 106 L100 130 M88 118 L112 118" stroke="#ffffff" strokeWidth="4" strokeLinecap="round" />
    </svg>
  );
}

// ─── Empty state — no templates (bookmark) ───────────────────────────────────
export function EmptyTemplatesIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <defs>
        <linearGradient id="ill-bm-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"  stopColor={ACC_SOFT} />
          <stop offset="100%" stopColor={ACC_DEEP} />
        </linearGradient>
      </defs>
      <path d="M60 28 Q60 22 66 22 L134 22 Q140 22 140 28 L140 168 L100 144 L60 168 Z"
        fill="url(#ill-bm-grad)" />
      <rect x="72" y="46" width="56" height="4" rx="2" fill="#ffffff" opacity="0.7" />
      <rect x="72" y="58" width="40" height="3" rx="1.5" fill="#ffffff" opacity="0.5" />
      <rect x="72" y="68" width="48" height="3" rx="1.5" fill="#ffffff" opacity="0.5" />
    </svg>
  );
}

// ─── Empty state — no bulk results (table + arrow) ───────────────────────────
export function EmptyBulkIllustration({ size = 160 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 200 200" fill="none">
      <rect x="32" y="48" width="136" height="104" rx="8" fill="#ffffff" stroke="#cbd5e1" />
      {/* table rows */}
      <rect x="32" y="48" width="136" height="20" rx="4" fill={ACC} opacity="0.85" />
      <rect x="40" y="55" width="30" height="4" rx="2" fill="#ffffff" />
      <rect x="78" y="55" width="30" height="4" rx="2" fill="#ffffff" />
      <rect x="116" y="55" width="40" height="4" rx="2" fill="#ffffff" />
      {[78, 100, 122].map((y) => (
        <g key={y}>
          <rect x="40" y={y - 4} width="22" height="3" rx="1.5" fill="#cbd5e1" />
          <rect x="76" y={y - 4} width="32" height="3" rx="1.5" fill="#cbd5e1" />
          <rect x="116" y={y - 4} width="36" height="3" rx="1.5" fill="#cbd5e1" />
        </g>
      ))}
      {/* arrow */}
      <g transform="translate(150,130)">
        <circle r="20" fill={ACC} />
        <path d="M-2 -8 L8 0 L-2 8 L-2 2 L-10 2 L-10 -2 L-2 -2 Z" fill="#ffffff" />
      </g>
    </svg>
  );
}
