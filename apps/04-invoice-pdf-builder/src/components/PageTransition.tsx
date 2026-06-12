import { useLocation } from "react-router-dom";

/**
 * PageTransition
 * Re-keyed on pathname so React unmounts/mounts children when the route changes,
 * triggering the .animate-fade-in CSS animation (150 ms ease). Pure CSS, no
 * external animation library required.
 */
export function PageTransition({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  return (
    <div key={pathname} className="page-fade h-full">
      {children}
    </div>
  );
}
