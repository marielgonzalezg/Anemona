"use client";

import { useEffect, useState } from "react";
import ERSPreview from "@/components/ERSPreview";
import { LayoutGrid } from "lucide-react";

type WidgetsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function WidgetsModal({ isOpen, onClose }: WidgetsModalProps) {
  const [srsData, setSrsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    const docId =
      typeof window !== "undefined"
        ? sessionStorage.getItem("project_id") || ""
        : "";

    if (!docId) {
      console.error("No se encontró project_id en sessionStorage");
      return;
    }

    const loadSrsData = async () => {
      setLoading(true);
      try {
        const response = await fetch(
          `http://127.0.0.1:8000/firestore/bajar?doc_id=${encodeURIComponent(docId)}`,
          {
            method: "GET",
            headers: { accept: "application/json" },
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error("Error en la respuesta del servidor");

        const json = await response.json();

        if (json.ok && json.data) {
          setSrsData(json.data);
        } else {
          console.error("Respuesta sin datos válidos:", json);
        }
      } catch (error) {
        console.error("Error al cargar el documento SRS:", error);
      } finally {
        setLoading(false);
      }
    };

    loadSrsData();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    /* Backdrop con blur */
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      
      {/* Modal */}
      <div className="relative w-[1300px] h-[800px] rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col p-8">

        {/* Imágenes decorativas */}
        <img
          src="/images/RedBob.png"
          className="absolute -top-16 -right-10 w-52 pointer-events-none select-none z-0"
          alt=""
        />
        <img
          src="/images/GreyBob.png"
          className="absolute top-1/2 -right-10 -translate-y-1/2 w-36 pointer-events-none select-none z-0"
          alt=""
        />
        <img
          src="/images/banortegf.png"
          className="absolute bottom-3 left-4 w-60 pointer-events-none select-none z-0"
          alt=""
        />

        {/* Botón cerrar */}
        <button
          onClick={onClose}
          className="absolute top-4 right-5 z-10 rounded-md px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-black transition text-lg"
        >
          ✕
        </button>

        {/* Contenido principal */}
        <div className="relative z-10 flex space-x-6 h-full">

          {/* Panel izquierdo — documento */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Títulos lado izquierdo */}
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-[#EB0029]">Modifica tu plantilla</h2>
              <p className="text-sm text-gray-400 mt-0.5">Arrastra nuevas secciones o modifica</p>
              {/* Línea divisoria punteada vertical — se simula con border-l en el wrapper */}
            </div>

            <div className="flex-1 rounded-3xl bg-[#f9f9f9] overflow-auto border border-dashed border-blue-300">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  Cargando documento...
                </div>
              ) : srsData ? (
                <ERSPreview data={srsData} changedFields={new Set()} />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No se encontró el documento
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho — widgets */}
          <div className="flex flex-col w-[320px] shrink-0">
            {/* Título lado derecho */}
            <div className="mb-3 flex items-center gap-2">
              <LayoutGrid size={20} className="text-[#EB0029]" />
              <h2 className="text-2xl font-bold text-gray-800">Mis Widgets</h2>
            </div>

            <div className="flex-1 rounded-3xl bg-[#f9f9f9] p-5 flex flex-col gap-4 overflow-auto">
              <button className="w-full rounded-xl bg-white border border-gray-200 p-5 text-left hover:bg-gray-50 hover:shadow transition text-base font-medium text-gray-700 shadow-sm">
                Widget 1
              </button>
              <button className="w-full rounded-xl bg-white border border-gray-200 p-5 text-left hover:bg-gray-50 hover:shadow transition text-base font-medium text-gray-700 shadow-sm">
                Widget 2
              </button>
              <button className="w-full rounded-xl bg-white border border-gray-200 p-5 text-left hover:bg-gray-50 hover:shadow transition text-base font-medium text-gray-700 shadow-sm">
                Widget 3
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}