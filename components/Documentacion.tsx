"use client";

import { useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle,
  X,
} from "lucide-react";
import ERSPreview from "@/components/ERSPreview";

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
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        onClick={onClose}
      />

      <div className="relative mx-4 flex min-w-[300px] max-w-sm animate-in zoom-in fade-in flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl duration-200">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-400 transition hover:text-gray-600"
        >
          <X size={18} />
        </button>

        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle className="text-green-500" size={36} />
        </div>

        <div className="text-center">
          <h2 className="mb-1 text-lg font-bold text-gray-800">
            ¡Descarga exitosa!
          </h2>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{docName}</span> se
            ha descargado correctamente.
          </p>
        </div>

        <button
          onClick={onClose}
          className="mt-2 rounded-full bg-[#EB0029] px-8 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#c8001f]"
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
        <div className="relative flex h-full flex-col rounded-3xl bg-gray-100 p-6 shadow-md">
          <button
            onClick={onToggle}
            className="absolute -left-5 top-6 z-50 cursor-pointer rounded-full bg-white p-2 shadow transition hover:scale-105"
          >
            {expanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {!expanded && (
            <div className="flex h-full flex-col gap-3">
              <div className="shrink-0">
                <h1 className="text-xl font-bold text-[#EB0029]">
                  Documentos de Salida
                </h1>
                <div className="mt-1 h-[2px] w-full bg-[#EB0029]" />
              </div>

              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                {(["ERS", "Análisis", "Arquitectura"] as const).map((t) => (
                  <div key={t} className="flex shrink-0 flex-col gap-1">
                    <span className="px-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                      {DOC_NAMES[t]}
                    </span>

                    <div className="relative h-72 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md">
                      {t === "ERS" ? (
                        <div
                          className="pointer-events-none h-full w-full overflow-hidden"
                          style={{
                            transform: "scale(0.33)",
                            transformOrigin: "top left",
                            width: "303%",
                            height: "303%",
                          }}
                        >
                          <ERSPreview />
                        </div>
                      ) : (
                        <iframe
                          src={
                            t === "Arquitectura"
                              ? DRAWIO_EMBED_URL
                              : GOOGLE_DOCS_EMBED_URL
                          }
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
                      )}

                      <button
                        onClick={() => {
                          setTab(t);
                          onToggle();
                        }}
                        className="group absolute inset-0 h-full w-full bg-transparent transition hover:bg-[#EB0029]/5"
                        title="Expandir para ver completo"
                      >
                        <span className="absolute bottom-2 right-2 rounded-full bg-[#EB0029] px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                          Ver completo
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expanded && (
            <>
              <div className="relative mb-5 flex items-center justify-center">
                <div className="flex gap-2 rounded-full bg-white px-2 py-2 shadow">
                  {(["ERS", "Análisis", "Arquitectura"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={
                        tab === t
                          ? "rounded-full bg-[#EB0029] px-10 py-2 text-sm font-semibold text-white shadow"
                          : "rounded-full px-10 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <button
                  onClick={handleDownload}
                  className="absolute right-0 flex cursor-pointer items-center gap-2 bg-transparent p-2 transition hover:scale-110"
                  title="Descargar documento"
                >
                  <Download className="text-[#EB0029]" size={22} />
                  <span className="font-medium text-[#EB0029]">Descargar</span>
                </button>
              </div>

              <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl bg-white shadow">
                {tab === "ERS" ? (
                  <div className="h-full w-full overflow-y-auto overscroll-contain bg-[#e9e9e9]">
                    <ERSPreview />
                  </div>
                ) : (
                  <iframe
                    key={tab}
                    src={activeUrl}
                    className="h-full w-full border-0"
                    title={tab}
                    allow="fullscreen"
                  />
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}