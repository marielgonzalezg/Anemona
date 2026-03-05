"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";


export default function Documentacion({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  const [tab, setTab] = useState<"ERS" | "Análisis" | "Arquitectura">("ERS");

  // ancho: normal de la vista de 3 / expandido ocupa el espacio del chat
  const wrapperClass = expanded
    ? "flex-1 h-full min-w-[520px] transition-all duration-300"
    : "w-full max-w-xs h-full transition-all duration-300";

  return (
    <section className={wrapperClass}>
      <div className="h-full rounded-3xl bg-gray-100 shadow-md p-6 flex flex-col relative">
        {/* Flecha */}
        <button
  onClick={() => {
    console.log("CLICK FLECHA");
    onToggle();
  }}
  className="absolute -left-5 top-6 z-50 bg-white shadow rounded-full p-2 hover:scale-105 transition cursor-pointer"
>
  {expanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
</button>

        {/* ===== VISTA DE 3 ===== */}
        {!expanded && (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-[#EB0029]">Documentos de Salida</h1>
              <div className="h-[2px] w-full bg-[#EB0029] mt-1"></div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="bg-white h-32 rounded-lg flex items-center justify-center shadow">
                Documento SRS
              </div>

              <div className="bg-white h-32 rounded-lg flex items-center justify-center shadow">
                Diseño de Arquitectura
              </div>
            </div>
          </>
        )}

        {/* ===== EXPANDIDO ===== */}
        {expanded && (
          <>
            {/* Barra superior: tabs + download */}
            <div className="flex items-center justify-center relative mb-5">
              <div className="bg-white rounded-full shadow px-2 py-2 flex gap-2">
                {(["ERS", "Análisis", "Arquitectura"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setTab(t)}
                    className={
                      tab === t
                        ? "px-10 py-2 rounded-full bg-[#EB0029] text-white font-semibold text-sm shadow"
                        : "px-10 py-2 rounded-full text-gray-600 font-semibold text-sm hover:bg-gray-100 transition"
                    }
                  >
                    {t}
                  </button>
                ))}
              </div>

              <button
                className="absolute right-0 bg-transparent p-2 hover:scale-110 transition"
                aria-label="Descargar"
                title="Descargar"
              >
                <Download className="text-[#EB0029]" size={22} />
              </button>
            </div>

            {/* Visor del documento */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl shadow p-6 overflow-y-auto">
              {/* “Mock” de contenido tipo hoja */}
              <div className="space-y-4">
                <div className="h-2 bg-gray-300 rounded w-3/4" />
                <div className="h-2 bg-gray-300 rounded w-2/3" />
                <div className="h-2 bg-gray-300 rounded w-4/5" />
                <div className="h-2 bg-gray-300 rounded w-1/2" />

                <div className="flex gap-6 pt-4">
                  <div className="flex-1 space-y-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-2 bg-gray-300 rounded w-full" />
                    ))}
                  </div>

                  <div className="w-56 h-36 bg-gray-200 rounded-xl flex items-center justify-center text-gray-500 text-sm">
                    Imagen
                  </div>
                </div>

                <div className="pt-6 grid grid-cols-2 gap-10">
                  <div className="space-y-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-2 bg-gray-300 rounded w-full" />
                    ))}
                  </div>
                  <div className="space-y-3">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div key={i} className="h-2 bg-gray-300 rounded w-full" />
                    ))}
                  </div>
                </div>

                {/* sello # abajo derecha como tu mock */}
                <div className="flex justify-end pt-6 text-gray-500 font-bold">#</div>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}