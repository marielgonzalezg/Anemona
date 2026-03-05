"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download } from "lucide-react";

// 👇 Reemplaza estas URLs con las tuyas reales
const GOOGLE_DOCS_EMBED_URL =
  "https://docs.google.com/document/d/e/2PACX-1vQvz8HDXl68ZXL4cFdI2rMCN0gXou9zODhEGBZI_YAtfkPkRHDZnFJkn1WX9q6vjQ/pub";
const DRAWIO_EMBED_URL =
  "https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=diagramaarq.drawio&dark=auto#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1K0pWBSO4_RdxmUlAippvNTiQZfnkcoSJ%26export%3Ddownload";
  const GOOGLE_DOCS_DOWNLOAD_URL =
  "https://docs.google.com/document/d/TU_DOC_ID/export?format=docx";

export default function Documentacion({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  const [tab, setTab] = useState<"ERS" | "Análisis" | "Arquitectura">("ERS");

  const wrapperClass = expanded
    ? "flex-1 h-full min-w-[520px] transition-all duration-300"
    : "w-full max-w-xs h-full transition-all duration-300";

  const activeUrl =
    tab === "Arquitectura" ? DRAWIO_EMBED_URL : GOOGLE_DOCS_EMBED_URL;

  return (
    <section className={wrapperClass}>
      <div className="h-full rounded-3xl bg-gray-100 shadow-md p-6 flex flex-col relative">

        {/* Flecha toggle */}
        <button
          onClick={onToggle}
          className="absolute -left-5 top-6 z-50 bg-white shadow rounded-full p-2 hover:scale-105 transition cursor-pointer"
        >
          {expanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>

        {/* ===== VISTA COLAPSADA ===== */}
        {!expanded && (
          <>
            <div className="mb-4">
              <h1 className="text-2xl font-bold text-[#EB0029]">Documentos de Salida</h1>
              <div className="h-[2px] w-full bg-[#EB0029] mt-1" />
            </div>

            <div className="flex flex-col gap-4">
              {/* Miniatura Google Docs - SRS */}
              <div className="bg-white h-40 rounded-lg shadow overflow-hidden relative">
                <iframe
                  src={GOOGLE_DOCS_EMBED_URL}
                  className="w-full h-full pointer-events-none"
                  title="Documento SRS"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white/80 text-center text-sm font-semibold text-gray-700 py-1">
                  Documento SRS
                </div>
              </div>

              {/* Miniatura Draw.io - Arquitectura */}
              <div className="bg-white h-40 rounded-lg shadow overflow-hidden relative">
                <iframe
                  src={DRAWIO_EMBED_URL}
                  className="w-full h-full pointer-events-none"
                  title="Diseño de Arquitectura"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-white/80 text-center text-sm font-semibold text-gray-700 py-1">
                  Diseño de Arquitectura
                </div>
              </div>
            </div>
          </>
        )}

        {/* ===== VISTA EXPANDIDA ===== */}
        {expanded && (
          <>
            {/* Tabs + Descargar */}
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

              <a
                href={activeUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="absolute right-0 bg-transparent p-2 hover:scale-110 transition flex items-center gap-2"
                title="Abrir en nueva pestaña"
              >
                <Download className="text-[#EB0029]" size={22} />
                <span className="text-[#EB0029] font-medium">Descargar</span>
              </a>
            </div>

            {/* Visor iframe */}
            <div className="flex-1 min-h-0 bg-white rounded-2xl shadow overflow-hidden">
              <iframe
                key={tab}
                src={activeUrl}
                className="w-full h-full border-0"
                title={tab}
                allow="fullscreen"
              />
            </div>
          </>
        )}
      </div>
    </section>
  );
}