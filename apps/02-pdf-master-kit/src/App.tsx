import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Splash } from "./components/Splash";
import { Onboarding, shouldShowOnboarding } from "./components/Onboarding";
import { PageTransition } from "./components/PageTransition";
import { Dashboard }  from "./pages/Dashboard";
import { Merge }      from "./pages/Merge";
import { Split }      from "./pages/Split";
import { Compress }   from "./pages/Compress";
import { Rotate }     from "./pages/Rotate";
import { Reorder }    from "./pages/Reorder";
import { Extract }    from "./pages/Extract";
import { History }    from "./pages/History";
import { Settings }   from "./pages/Settings";
import { Privacy, About, Help } from "./pages/StaticPages";

export default function App() {
  const [splash, setSplash]         = useState(true);
  const [onboarding, setOnboarding] = useState(() => shouldShowOnboarding());

  if (splash) return <Splash onDone={() => setSplash(false)} />;

  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#0f1117" }}>
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <PageTransition>
          <Routes>
            <Route path="/"         element={<Dashboard />} />
            <Route path="/merge"    element={<Merge />} />
            <Route path="/split"    element={<Split />} />
            <Route path="/compress" element={<Compress />} />
            <Route path="/rotate"   element={<Rotate />} />
            <Route path="/reorder"  element={<Reorder />} />
            <Route path="/extract"  element={<Extract />} />
            <Route path="/history"  element={<History />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/privacy"  element={<Privacy />} />
            <Route path="/about"    element={<About />} />
            <Route path="/help"     element={<Help />} />
            <Route path="*"         element={<Navigate to="/" replace />} />
          </Routes>
        </PageTransition>
      </main>
      {onboarding && <Onboarding onClose={() => setOnboarding(false)} />}
    </div>
  );
}
