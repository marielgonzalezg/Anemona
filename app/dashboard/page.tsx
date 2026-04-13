"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation"; 
import NewProject from "@/components/NewProject";
import ProjectList from "@/components/ProjectList";
import ChatBot from "@/components/ChatBot";
import Documentacion from "@/components/Documentacion";


export default function Dashboard() {
  const [expandDocs, setExpandDocs] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"home" | "dashboard">("home");
  const searchParams = useSearchParams(); 

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/";
    }
  }, []);

  // Si viene con ?session=XYZ desde Mis Proyectos, ir directo al dashboard
  useEffect(() => {
    const sessionParam = searchParams.get("session");
    if (sessionParam) {
      setCurrentScreen("dashboard"); 
    }
  }, [searchParams]);

  return (
    <main className="flex items-stretch gap-6 p-10 w-full h-screen overflow-hidden">
      {currentScreen === "home" && (
        <NewProject onEnterDashboard={() => setCurrentScreen("dashboard")} />
      )}

      {currentScreen === "dashboard" && (
        <>
          <ProjectList />
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