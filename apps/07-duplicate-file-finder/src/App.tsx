import { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Splash } from "./components/Splash";
import { Onboarding, shouldShowOnboarding } from "./components/Onboarding";
import { PageTransition } from "./components/PageTransition";
import { Dashboard }     from "./pages/Dashboard";
import { Scanner }       from "./pages/Scanner";
import { Results }       from "./pages/Results";
import { History }       from "./pages/History";
import { Settings }      from "./pages/Settings";
import { Privacy, About, Help } from "./pages/StaticPages";
import { ScanProvider }  from "./context/ScanContext";

export default function App() {
  const [splash, setSplash]         = useState(true);
  const [onboarding, setOnboarding] = useState(() => shouldShowOnboarding());

  if (splash) return <Splash onDone={() => setSplash(false)} />;

  return (
    <ScanProvider>
      <div style={{
      width: '100%',
      height: '100vh',
      display: 'flex',
      overflow: 'hidden',
      background: '#0f1117',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0
    }}>
        <Sidebar />
        <main style={{
        flex: 1,
        height: '100%',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        minWidth: 0
      }}>
          <PageTransition>
            <Routes>
              <Route path="/"          element={<Dashboard />} />
              <Route path="/scanner"   element={<Scanner />} />
              <Route path="/results"   element={<Results />} />
              <Route path="/history"   element={<History />} />
              <Route path="/settings"  element={<Settings />} />
              <Route path="/privacy"   element={<Privacy />} />
              <Route path="/about"     element={<About />} />
              <Route path="/help"      element={<Help />} />
              <Route path="*"          element={<Navigate to="/" replace />} />
            </Routes>
          </PageTransition>
        </main>
        {onboarding && <Onboarding onClose={() => setOnboarding(false)} />}
      </div>
    </ScanProvider>
  );
}
