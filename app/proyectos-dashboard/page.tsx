"use client";

import ProyectosDashboard from "@/components/proyectos-dashboard";
import { useEffect, useState } from "react";

export default function Page() {
  useEffect(() => {
      const token = localStorage.getItem("token");
  
      if (!token) {
        window.location.href = "/";
      }
    }, []);
  return <ProyectosDashboard />;
}