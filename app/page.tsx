"use client";

import { useState } from "react";
import NewProject from "@/components/NewProject";
import ProjectList from "@/components/ProjectList";
import ChatBot from "@/components/ChatBot";
import Documentacion from "@/components/Documentacion";

export default function Home() {
  const [expandDocs, setExpandDocs] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"home" | "dashboard">("home");

  return (
    <main className="flex items-stretch gap-6 p-10 w-full h-screen overflow-hidden">
      {currentScreen === "home" && (
        <NewProject onEnterDashboard={() => setCurrentScreen("dashboard")} />
      )}

      {currentScreen === "dashboard" && (
        <>
          <ProjectList onGoHome={() => setCurrentScreen("home")} />

      {!expandDocs && <ChatBot />}

      <Documentacion
        expanded={expandDocs}
        onToggle={() => setExpandDocs(!expandDocs)}
      />  


          <Documentacion
            expanded={expandDocs}
            onToggle={() => setExpandDocs(!expandDocs)}
          />
        </>
      )}
    </main>
  );
}