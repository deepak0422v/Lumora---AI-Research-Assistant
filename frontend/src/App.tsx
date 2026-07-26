import { BrowserRouter, Routes, Route } from "react-router-dom";
import { useState } from "react";

import WorkspacePage from "./pages/WorkspacePage";
import ReportPage from "./pages/ReportPage";
import SettingsPage from "./pages/SettingsPage";
import SplashScreen from "./components/splash/SplashScreen";

function App() {
  const [showSplash, setShowSplash] = useState(() => {
    try {
      const hasPlayed = sessionStorage.getItem("lumora_splash_played");
      return !hasPlayed;
    } catch {
      return true;
    }
  });

  const handleSplashComplete = () => {
    setShowSplash(false);
    try {
      sessionStorage.setItem("lumora_splash_played", "true");
    } catch (e) {
      // Ignore sessionStorage exceptions
    }
  };

  return (
    <>
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<WorkspacePage />} />
          <Route path="/app" element={<WorkspacePage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;