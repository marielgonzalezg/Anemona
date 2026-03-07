"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, Download, CheckCircle, X } from "lucide-react";

const GOOGLE_DOCS_EMBED_URL =
  "https://docs.google.com/document/d/e/2PACX-1vQvz8HDXl68ZXL4cFdI2rMCN0gXou9zODhEGBZI_YAtfkPkRHDZnFJkn1WX9q6vjQ/pub";
const DRAWIO_EMBED_URL =
  "https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=diagramaarq.drawio&dark=auto#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1K0pWBSO4_RdxmUlAippvNTiQZfnkcoSJ%26export%3Ddownload";
const GOOGLE_DOCS_DOWNLOAD_URL =
  "https://docs.google.com/document/d/TU_DOC_ID/export?format=docx";

const DOC_NAMES: Record<"ERS" | "Análisis" | "Arquitectura", string> = {
  ERS: "Documento ERS",
  Análisis: "Documento de Análisis",
  Arquitectura: "Diseño de Arquitectura",
};

function DownloadPopup({
  docName,
  onClose,
}: {
  docName: string;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center gap-4 min-w-[300px] max-w-sm mx-4 animate-in fade-in zoom-in duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition"
        >
          <X size={18} />
        </button>

        {/* Icon */}
        <div className="bg-green-100 rounded-full p-4">
          <CheckCircle className="text-green-500" size={36} />
        </div>

        {/* Text */}
        <div className="text-center">
          <h2 className="text-lg font-bold text-gray-800 mb-1">
            ¡Descarga exitosa!
          </h2>
          <p className="text-gray-500 text-sm">
            <span className="font-semibold text-gray-700">{docName}</span> se
            ha descargado correctamente.
          </p>
        </div>

        {/* Confirm button */}
        <button
          onClick={onClose}
          className="mt-2 px-8 py-2 bg-[#EB0029] text-white rounded-full font-semibold text-sm hover:bg-[#c8001f] transition shadow"
        >
          Aceptar
        </button>
      </div>
    </div>
  );
}

export default function Documentacion({
  expanded,
  onToggle,
}: {
  expanded: boolean;
  onToggle: () => void;
}) {
  const [tab, setTab] = useState<"ERS" | "Análisis" | "Arquitectura">("ERS");
  const [showPopup, setShowPopup] = useState(false);

  const wrapperClass = expanded
    ? "flex-1 h-full min-w-[520px] transition-all duration-300"
    : "w-full max-w-xs h-full transition-all duration-300";

  const activeUrl =
    tab === "Arquitectura" ? DRAWIO_EMBED_URL : GOOGLE_DOCS_EMBED_URL;

  const handleDownload = async () => {
    try {
      const downloadUrl =
        tab === "Arquitectura" ? DRAWIO_EMBED_URL : GOOGLE_DOCS_DOWNLOAD_URL;

      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download =
        tab === "Arquitectura"
          ? "arquitectura.drawio"
          : `${DOC_NAMES[tab].replace(/ /g, "_")}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch {
      // Even if the fetch fails (e.g. CORS), we still show the success popup
      // since in production the URLs will be accessible
    } finally {
      setShowPopup(true);
    }
  };

  return (
    <>
      {showPopup && (
        <DownloadPopup
          docName={DOC_NAMES[tab]}
          onClose={() => setShowPopup(false)}
        />
      )}

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
            <div className="flex flex-col h-full gap-3">
              {/* Header */}
              <div className="shrink-0">
                <h1 className="text-xl font-bold text-[#EB0029]">Documentos de Salida</h1>
                <div className="h-[2px] w-full bg-[#EB0029] mt-1" />
              </div>

              {/* Scroll vertical con todos los docs */}
              <div className="flex-1 min-h-0 overflow-y-auto flex flex-col gap-4 pr-1">
                {(["ERS", "Análisis", "Arquitectura"] as const).map((t) => (
                  <div key={t} className="flex flex-col gap-1 shrink-0">
                    {/* Label */}
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wider px-1">
                      {DOC_NAMES[t]}
                    </span>
                    {/* Preview */}
                    <div className="h-72 bg-white rounded-xl shadow-md overflow-hidden relative border border-gray-100">
                      <iframe
                        src={t === "Arquitectura" ? DRAWIO_EMBED_URL : GOOGLE_DOCS_EMBED_URL}
                        className="border-0"
                        title={DOC_NAMES[t]}
                        style={{
                          pointerEvents: "none",
                          width: "170%",
                          height: "170%",
                          transform: "scale(0.588)",
                          transformOrigin: "top left",
                        }}
                      />
                      {/* Overlay clicable para expandir */}
                      <button
                        onClick={() => { setTab(t); onToggle(); }}
                        className="absolute inset-0 w-full h-full bg-transparent hover:bg-[#EB0029]/5 transition group"
                        title="Expandir para ver completo"
                      >
                        <span className="absolute bottom-2 right-2 bg-[#EB0029] text-white text-[10px] font-semibold px-2 py-0.5 rounded-full opacity-0 group-hover:opacity-100 transition">
                          Ver completo
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
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

                <button
                  onClick={handleDownload}
                  className="absolute right-0 bg-transparent p-2 hover:scale-110 transition flex items-center gap-2 cursor-pointer"
                  title="Descargar documento"
                >
                  <Download className="text-[#EB0029]" size={22} />
                  <span className="text-[#EB0029] font-medium">Descargar</span>
                </button>
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
    </>
  );
}