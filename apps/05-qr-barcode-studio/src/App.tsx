import { Routes, Route, Navigate } from "react-router-dom";
import { Sidebar } from "./components/Sidebar";
import { Dashboard }       from "./pages/Dashboard";
import { QrGenerator }     from "./pages/QrGenerator";
import { BarcodeGenerator } from "./pages/BarcodeGenerator";
import { Batch }           from "./pages/Batch";
import { History }         from "./pages/History";
import { Settings }        from "./pages/Settings";
import { Privacy, About, Help } from "./pages/StaticPages";

export default function App() {
  return (
    <div className="flex h-screen w-screen overflow-hidden" style={{ background: "#0f1117" }}>
      <Sidebar />
      <main className="flex-1 overflow-hidden">
        <Routes>
          <Route path="/"            element={<Dashboard />} />
          <Route path="/qr"          element={<QrGenerator />} />
          <Route path="/qr/:id"      element={<QrGenerator />} />
          <Route path="/barcode"     element={<BarcodeGenerator />} />
          <Route path="/barcode/:id" element={<BarcodeGenerator />} />
          <Route path="/batch"       element={<Batch />} />
          <Route path="/history"     element={<History />} />
          <Route path="/settings"    element={<Settings />} />
          <Route path="/privacy"     element={<Privacy />} />
          <Route path="/about"       element={<About />} />
          <Route path="/help"        element={<Help />} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </div>
  );
}
