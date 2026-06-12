import { useMemo } from "react";

const ACC      = "#8b5cf6";
const ACC_DEEP = "#7c3aed";

/**
 * ActivityChart — small SVG bar chart of last-7-days activity. Each input is
 * an ISO timestamp; the chart buckets them by local date.
 */
export function ActivityChart({ timestamps, label = "Last 7 days" }: { timestamps: string[]; label?: string }) {
  const data = useMemo(() => bucketLast7Days(timestamps), [timestamps]);
  const max  = Math.max(1, ...data.map((d) => d.count));
  const W    = 320;
  const H    = 80;
  const BW   = 30;
  const GAP  = (W - BW * 7) / 6;

  return (
    <div>
      <div className="flex items-baseline justify-between mb-2">
        <p className="text-xs font-semibold tracking-wide" style={{ color: "#94a3b8" }}>{label.toUpperCase()}</p>
        <p className="text-xs" style={{ color: "#475569" }}>{data.reduce((s, d) => s + d.count, 0)} total</p>
      </div>
      <svg width="100%" viewBox={`0 0 ${W} ${H + 22}`} preserveAspectRatio="none">
        <defs>
          <linearGradient id="ac-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%"  stopColor={ACC} />
            <stop offset="100%" stopColor={ACC_DEEP} />
          </linearGradient>
        </defs>
        {data.map((d, i) => {
          const x  = i * (BW + GAP);
          const h  = Math.max(2, (d.count / max) * H);
          const y  = H - h;
          return (
            <g key={i}>
              <rect x={x} y={0} width={BW} height={H} rx={4} fill="#1e2535" />
              <rect x={x} y={y} width={BW} height={h} rx={4}
                fill={d.count > 0 ? "url(#ac-grad)" : "transparent"} />
              <text x={x + BW / 2} y={H + 14} fontSize="9" textAnchor="middle" fill="#64748b" fontFamily="Inter, system-ui">
                {d.label}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function bucketLast7Days(timestamps: string[]): { label: string; count: number; iso: string }[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: { label: string; count: number; iso: string }[] = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    days.push({ label: d.toLocaleDateString("en-US", { weekday: "short" }).slice(0, 2), count: 0, iso: d.toISOString().slice(0, 10) });
  }
  for (const ts of timestamps) {
    const day = ts.slice(0, 10);
    const target = days.find((d) => d.iso === day);
    if (target) target.count += 1;
  }
  return days;
}
