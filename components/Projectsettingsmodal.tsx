"use client";

import { X, Check, UserPlus, UserMinus, FolderEdit } from "lucide-react";
import { useState } from "react";

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
}

export default function ProjectSettingsModal({
  isOpen,
  onClose,
  projectName = "",
}: ProjectSettingsModalProps) {
  const [newName, setNewName] = useState(projectName);
  const [addEmail, setAddEmail] = useState("");
  const [removeEmail, setRemoveEmail] = useState("");

  // TODO: conectar estos handlers a sus endpoints cuando estén listos
  const handleRename = () => {
    if (!newName.trim()) return;
    console.log("Renombrar proyecto a:", newName.trim());
    // await fetch(`/api/projects/${id}`, { method: "PATCH", body: ... })
  };

  const handleAddCollaborator = () => {
    if (!addEmail.trim()) return;
    console.log("Agregar colaborador:", addEmail.trim());
    // await fetch(`/api/projects/${id}/collaborators`, { method: "POST", body: ... })
    setAddEmail("");
  };

  const handleRemoveCollaborator = () => {
    if (!removeEmail.trim()) return;
    console.log("Eliminar colaborador:", removeEmail.trim());
    // await fetch(`/api/projects/${id}/collaborators/${removeEmail}`, { method: "DELETE" })
    setRemoveEmail("");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative mx-4 w-full max-w-md animate-in zoom-in fade-in rounded-2xl bg-white shadow-2xl duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4">
          <h2 className="text-lg font-bold text-gray-800">Configuración del Proyecto</h2>
          <button
            onClick={onClose}
            className="text-gray-400 transition hover:text-gray-600"
          >
            <X size={18} />
          </button>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-100 mx-6" />

        <div className="px-6 py-5 flex flex-col gap-6">

          {/* ── Sección: Nombre del proyecto ── */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <FolderEdit size={15} className="text-[#EB0029]" />
              Nombre del proyecto
            </label>
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRename(); }}
                placeholder="Nombre del proyecto"
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#EB0029] focus:ring-2 focus:ring-[#EB0029]/20"
              />
              <button
                onClick={handleRename}
                disabled={!newName.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EB0029] text-white transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Confirmar nombre"
              >
                <Check size={16} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gray-100" />

          {/* ── Sección: Agregar colaborador ── */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <UserPlus size={15} className="text-[#EB0029]" />
              Agregar Colaborador
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={addEmail}
                onChange={(e) => setAddEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleAddCollaborator(); }}
                placeholder="correo@ejemplo.com"
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#EB0029] focus:ring-2 focus:ring-[#EB0029]/20"
              />
              <button
                onClick={handleAddCollaborator}
                disabled={!addEmail.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EB0029] text-white transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Confirmar agregar"
              >
                <Check size={16} />
              </button>
            </div>
          </div>

          {/* ── Sección: Eliminar colaborador ── */}
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
              <UserMinus size={15} className="text-[#EB0029]" />
              Eliminar Colaborador
            </label>
            <div className="flex items-center gap-2">
              <input
                type="email"
                value={removeEmail}
                onChange={(e) => setRemoveEmail(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") handleRemoveCollaborator(); }}
                placeholder="correo@ejemplo.com"
                className="flex-1 rounded-lg border border-gray-200 bg-gray-50 px-4 py-2.5 text-sm text-gray-800 outline-none transition focus:border-[#EB0029] focus:ring-2 focus:ring-[#EB0029]/20"
              />
              <button
                onClick={handleRemoveCollaborator}
                disabled={!removeEmail.trim()}
                className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-[#EB0029] text-white transition hover:bg-red-700 disabled:opacity-40 disabled:cursor-not-allowed"
                aria-label="Confirmar eliminar"
              >
                <Check size={16} />
              </button>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex justify-end px-6 pb-6">
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-100 px-6 py-2.5 text-sm font-semibold text-gray-600 transition hover:bg-gray-200"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}