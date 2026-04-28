"use client";

import { useState } from "react";
import ProjectList from "@/components/ProjectList";
import WidgetsModal from "@/components/WidgetsModal";
import FormModal from "@/components/FormModal";
import RecentProjectList from "@/components/RecentProjects";
import { useRouter } from "next/navigation";


interface Proyecto {
    folio: number;
    nombreproyecto: string;
    fechacreacion: string;
    departamento: string;
    session_id: string;
    id_firestore_document?: string;
}

type NewProjectProps = {
  onEnterDashboard: () => void;
};

type ProyectoCreado = {
  session_id: string;
  user_id?: string;
  project_id?: string;
};

export default function NewProject({ onEnterDashboard }: NewProjectProps) {
  const [showWidgets, setShowWidgets] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [tempUserId, setTempUserId] = useState("");
  const [loadingSession, setLoadingSession] = useState(false);

  const handleCreateNew = () => {
    setShowFormModal(true);
  };

  const handleProjectCreated = () => {
    const savedUserId = sessionStorage.getItem("chat_user_id");
    const savedSessionId = sessionStorage.getItem("chat_session_id");
    const savedProjectId = sessionStorage.getItem("project_id");

    console.log("Proyecto creado desde FormModal");
    console.log("chat_user_id:", savedUserId);
    console.log("chat_session_id:", savedSessionId);
    console.log("project_id:", savedProjectId);

    setShowFormModal(false);

    // Navega si quedaron guardados los datos
    if (savedUserId && savedSessionId) {
      onEnterDashboard();
    } else {
      alert("No se pudo recuperar la sesión del proyecto creado.");
    }
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

      </section>

      <FormModal
        isOpen={showFormModal}
        tempUserId={tempUserId}
        setTempUserId={setTempUserId}
        loadingSession={loadingSession}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleProjectCreated}
      />
    </>
  );
}