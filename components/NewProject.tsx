"use client";

import { useState } from "react";
import ProjectList from "@/components/ProjectList";
import WidgetsModal from "@/components/WidgetsModal";

type NewProjectProps = {
  onEnterDashboard: () => void;
};

export default function NewProject({ onEnterDashboard }: NewProjectProps) {
  const [showWidgets, setShowWidgets] = useState(false);

  const handleCreateNew = () => {
    onEnterDashboard();
  };

  return (
    <>
      <ProjectList />

      <section className="flex-1 h-full rounded-3xl bg-gray-100 shadow-md p-6 relative overflow-hidden">
        <img
          src="/images/FondoCrearProyecto.png"
          alt="Fondo geométrico"
          className="absolute inset-0 w-full h-full object-cover opacity-80"
        />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center">
          <button
            onClick={handleCreateNew}
            className="bg-[#EB0029] text-white font-bold text-3xl px-14 py-4 rounded-full shadow-md hover:bg-red-700 transition"
          >
            Crear nuevo
          </button>

          <h2 className="mt-8 text-white text-4xl font-bold drop-shadow-md">
            Comenzar un nuevo proyecto
          </h2>
        </div>

        <WidgetsModal
          isOpen={showWidgets}
          onClose={() => setShowWidgets(false)}
        />
      </section>
    </>
  );
}