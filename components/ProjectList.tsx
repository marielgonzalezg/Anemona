"use client";

import { useEffect, useState } from "react";
import { Home, File as FileIcon } from "lucide-react";

export default function ProjectList() {

  const projects = [
    { id: 1, code: "SV-3254320326", title: "Proyecto 1", date: "23/03/2026" },
    { id: 2, code: "SV-3254320325", title: "Proyecto 2", date: "21/03/2026" },
    { id: 3, code: "SV-3254320324", title: "Proyecto 3", date: "19/03/2026" },
    { id: 4, code: "SV-3254320320", title: "Proyecto 4", date: "17/03/2026" },
    { id: 5, code: "SV-3254320323", title: "Proyecto 4", date: "17/03/2026" },
    { id: 6, code: "SV-3254320321", title: "Proyecto 4", date: "17/03/2026" },
    { id: 7, code: "SV-3254320328", title: "Proyecto 4", date: "17/03/2026" },
    { id: 8, code: "SV-3254320520", title: "Proyecto 4", date: "17/03/2026" },
    { id: 9, code: "SV-3254320423", title: "Proyecto 4", date: "17/03/2026" },
    { id: 10, code: "SV-3254340323", title: "Proyecto 4", date: "17/03/2026" },
  ];

  const [selectedId, setSelectedId] = useState<number | null>(1);
  const [userName, setUserName] = useState<string>("Usuario");

  useEffect(() => {
  const loadUser = () => {
    const savedUser = sessionStorage.getItem("chat_user_id");
    setUserName(savedUser || "Usuario");
  };

  const handleUserUpdate = (event: Event) => {
    const customEvent = event as CustomEvent<{ userId: string }>;
    setUserName(customEvent.detail?.userId || "Usuario");
  };

  loadUser();
  window.addEventListener("chat-user-updated", handleUserUpdate);

  return () => {
    window.removeEventListener("chat-user-updated", handleUserUpdate);
  };
}, []);

  return (
    <div className="w-full max-w-xs h-full flex flex-col relative">

      {/* HEADER */}
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-[#EB0029]">Mis Proyectos</h1>
          <Home
            size={30}
            className="text-gray-500 hover:text-[#EB0029] hover:bg-gray-100 p-1 rounded cursor-pointer transition"
          />
        </div>
        <div className="h-[2px] w-full bg-[#EB0029] mt-1"></div>
      </div>

      {/* PERFIL */}
      <div className="flex flex-col items-center my-6">
        <div className="w-28 h-28 rounded-full bg-gray-100 shadow-md flex items-center justify-center overflow-hidden mb-3">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#e8e8e8" />
            <ellipse cx="50" cy="85" rx="28" ry="20" fill="#2c3e6b" />
            <rect x="43" y="65" width="14" height="15" rx="2" fill="white" />
            <polygon points="50,67 47,72 50,85 53,72" fill="#EB0029" />
            <ellipse cx="50" cy="40" rx="18" ry="20" fill="#f5c9a0" />
            <ellipse cx="50" cy="24" rx="18" ry="10" fill="#2c3e6b" />
            <rect x="32" y="24" width="36" height="8" fill="#2c3e6b" />
          </svg>
        </div>

        <p className="text-xl font-bold text-gray-700">
  {userName.split("_")[0]}
</p>
      </div>

      {/* LISTA CON SCROLL */}
<div className="flex-1 overflow-y-auto flex flex-col gap-3 pr-1 scrollbar-thin scrollbar-thumb-gray-300">
  {projects.map((project) => {
    const isSelected = selectedId === project.id;

    return (
      <div
        key={project.id}
        onClick={() => setSelectedId(project.id)}
        className={`flex items-center gap-3 px-3 py-3 rounded-lg cursor-pointer transition
        ${isSelected ? "bg-gray-300 shadow-inner" : "hover:bg-gray-200"}
        `}
      >
        <div className="w-8 h-8 bg-[#EB0029] rounded-md flex items-center justify-center text-white flex-shrink-0">
          <FileIcon size={14} strokeWidth={2.5} />
        </div>

        <div className="flex-1">
          <div className="flex items-center">
            <span className="text-[#EB0029] text-sm font-semibold">
              {project.code}
            </span>
            <span className="ml-auto text-[10px] text-gray-500">
              {project.date}
            </span>
          </div>

          <div className="text-xs text-gray-600 mt-1">
            {project.title}
          </div>
        </div>
      </div>
    );
  })}
</div>

{/* BOTON FIJO */}
<div className="flex justify-center py-7">
  <button className="bg-[#EB0029] text-white font-semibold text-sm px-8 py-3 rounded-lg hover:bg-red-700 transition">
    Ver Todos
  </button>
</div>

      {/* LOGO */}
      <div className="mt-auto pt-1 left-0 w-full flex justify-center">
        <img
          src="/images/banortelogo.png"
          alt="Logo"
          className="h-15"
        />
      </div>

    </div>
  );
}