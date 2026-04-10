"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import NewProject from "@/components/NewProject";
import ProjectList from "@/components/ProjectList";
import ChatBot from "@/components/ChatBot";
import Documentacion from "@/components/Documentacion";
import router from "next/router";

export default function Dashboard() {
  const [expandDocs, setExpandDocs] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"home" | "dashboard">("home");

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
    }
  }, []);

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
        </>
      )}
    </main>
  );
}