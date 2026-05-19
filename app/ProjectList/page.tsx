"use client";

import { Suspense } from "react";
import ProjectList from "@/components/ProjectList";

export default function Page() {
  return (
    <Suspense fallback={<div>Cargando proyectos...</div>}>
      <ProjectList />
    </Suspense>
  );
}