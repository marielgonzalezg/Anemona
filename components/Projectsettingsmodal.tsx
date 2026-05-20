"use client";

import { X, Check, UserPlus, UserMinus, FolderEdit } from "lucide-react";
import { useState, useEffect } from "react";
import { API_URL } from "@/services/api";

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectName?: string;
  folio: number;
  onRename?: (newName: string) => void;
}


export default function ProjectSettingsModal({
  isOpen,
  onClose,
  projectName = "",
  folio,
  onRename
}: ProjectSettingsModalProps) {
  const [newName, setNewName] = useState(projectName);
  useEffect(() => {
    setNewName(projectName);
  }, [projectName]);
  const [addEmail, setAddEmail] = useState("");
  const [removeEmail, setRemoveEmail] = useState("");
    console.log("folio prop recibido:", folio);
    const [showSuccess, setShowSuccess] = useState(false);

  // TODO: conectar estos handlers a sus endpoints cuando estén listos
  
  const handleRename = async () => {
  if (!newName.trim()) return;
  if (folio === null || folio === undefined) {
    console.error("folio es undefined, no se puede renombrar el proyecto");
    return;
  }

  try {
    const response = await fetch(
      `${API_URL}/colaboracion/${folio}/renombrar-proyecto`,
      {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombreproyecto: newName.trim() }),
      }
    );

    const contentType = response.headers.get("content-type");
    if (!contentType?.includes("application/json")) {
      throw new Error(`Respuesta inesperada del servidor (status ${response.status})`);
    }

    const data = await response.json();
    if (!response.ok) throw new Error(data.detail || "Error al renombrar proyecto");

    console.log("Proyecto renombrado:", data);
    sessionStorage.setItem("project_name", newName.trim()); 
    onRename?.(newName.trim());                             
    setShowSuccess(true);
  } catch (error) {
    console.error(error);
  }
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
      {showSuccess && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={() => setShowSuccess(false)} />
          <div className="relative mx-4 flex min-w-[300px] max-w-sm animate-in zoom-in fade-in flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl duration-200">
            <button onClick={() => setShowSuccess(false)} className="absolute top-3 right-3 text-gray-400 transition hover:text-gray-600">
              <X size={18} />
            </button>

            <img src="/images/OpExitosa.png" alt="Operación exitosa" className="w-24 h-24 object-contain" />

            <div className="text-center">
              <h2 className="mb-1 text-lg font-bold text-gray-800">¡Nombre actualizado!</h2>
              <p className="text-sm text-gray-500">
                El proyecto ahora se llama <span className="font-semibold text-gray-700">{newName}</span>.
              </p>
            </div>
            <button
              onClick={() => setShowSuccess(false)}
              className="bg-[#EB0029] text-white font-semibold text-sm px-8 py-3 rounded-lg hover:bg-red-700 transition"
            >
              Aceptar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}