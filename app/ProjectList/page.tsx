"use client";

import ProjectList from "@/components/ProjectList";
import { useEffect, useState } from "react";

export default function Page() {
    useEffect(() => {
          const token = localStorage.getItem("token");
      
          if (!token) {
            window.location.href = "/dashboard";
          }
        }, []);
  return <ProjectList />;
}