import React from "react";

/**
 * Skeleton — animated shimmer placeholders for list / card loading states.
 * The shimmer keyframe lives in index.css (.skeleton-shimmer).
 */

export function SkeletonText({ width = "100%", height = 12 }: { width?: string | number; height?: number }) {
  return (
    <div className="skeleton-shimmer rounded"
      style={{ width, height, background: "#1e2535" }} />
  );
}

export function SkeletonRow() {
  return (
    <div className="flex items-center gap-4 px-5 py-3.5 rounded-lg"
      style={{ background: "#161b27", border: "1px solid #2d3748" }}>
      <div className="skeleton-shimmer rounded-lg flex-shrink-0"
        style={{ width: 32, height: 32, background: "#1e2535" }} />
      <div className="flex-1 space-y-2">
        <SkeletonText width="60%" />
        <SkeletonText width="40%" height={10} />
      </div>
      <SkeletonText width={60} height={10} />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-xl p-5" style={{ background: "#161b27", border: "1px solid #2d3748" }}>
      <div className="flex items-start justify-between gap-3 mb-4">
        <div className="space-y-2 flex-1">
          <SkeletonText width="50%" height={10} />
          <SkeletonText width="30%" height={20} />
        </div>
        <div className="skeleton-shimmer rounded-lg flex-shrink-0"
          style={{ width: 32, height: 32, background: "#1e2535" }} />
      </div>
      <SkeletonText width="85%" />
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  );
}
