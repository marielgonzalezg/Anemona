"use client";

import ProyectosDashboard from "@/components/proyectos-dashboard";
import { useEffect, useState } from "react";

export default function Page() {
  const [expandDocs, setExpandDocs] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<"home" | "dashboard">("home");
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      window.location.href = "/";
    } else {
      setChecking(false); 
    }
  }, []);

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EB0029] border-t-transparent" />
          <p className="text-sm text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }
  return <ProyectosDashboard />;
}