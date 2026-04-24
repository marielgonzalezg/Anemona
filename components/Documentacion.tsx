"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle,
  X,
} from "lucide-react";
import ERSPreview from "@/components/ERSPreview";
import ArquitecturaDiagram from "@/components/ArquitecturaDiagram";
import type { ERSData } from "@/types/  ers";

const DOC_NAMES: Record<"ERS" | "Análisis" | "Arquitectura", string> = {
  ERS: "Documento ERS",
  Análisis: "Documento de Análisis",
  Arquitectura: "Diseño de Arquitectura",
};

function DownloadPopup({ docName, onClose }: { docName: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 flex min-w-[300px] max-w-sm animate-in zoom-in fade-in flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl duration-200">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 transition hover:text-gray-600">
          <X size={18} />
        </button>
        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle className="text-green-500" size={36} />
        </div>
        <div className="text-center">
          <h2 className="mb-1 text-lg font-bold text-gray-800">¡Descarga exitosa!</h2>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{docName}</span> se ha descargado correctamente.
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
  const [ersData, setErsData] = useState<ERSData | null>(null);
  const [loadingERS, setLoadingERS] = useState(true);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  // Ref para acceder al SVG del diagrama de arquitectura y descargarlo
  const arqSvgRef = useRef<SVGSVGElement>(null);

  const getActiveProjectId = () => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("project_id") || "";
  };

  const detectChanges = (oldData: any, newData: any) => {
    const changed = new Set<string>();
    const compare = (obj1: any, obj2: any, path = "") => {
      if (Array.isArray(obj2)) {
        obj2.forEach((item, index) => {
          const newPath = path ? `${path}.${index}` : `${index}`;
          if (typeof item === "object" && item !== null) compare(obj1?.[index], item, newPath);
          else if (obj1?.[index] !== item) changed.add(newPath);
        });
        return;
      }
      for (const key in obj2) {
        const newPath = path ? `${path}.${key}` : key;
        if (typeof obj2[key] === "object" && obj2[key] !== null) compare(obj1?.[key], obj2[key], newPath);
        else if (obj1?.[key] !== obj2[key]) changed.add(newPath);
      }
    };
    compare(oldData, newData);
    return changed;
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const fetchERS = async () => {
      try {
        const docId = getActiveProjectId();
        if (!docId) { setErsData(null); return; }
        const response = await fetch(
          `http://127.0.0.1:8000/firestore/bajar?doc_id=${encodeURIComponent(docId)}`,
          { method: "GET", headers: { accept: "application/json" }, cache: "no-store" }
        );
        if (!response.ok) throw new Error("No se pudo obtener el ERS");
        const json = await response.json();
        if (isMounted && json.ok && json.data) {
          setErsData((prev) => {
            if (!prev) return json.data;
            const changes = detectChanges(prev, json.data);
            if (changes.size > 0) {
              setChangedFields(changes);
              if (timeoutId) clearTimeout(timeoutId);
              timeoutId = setTimeout(() => { if (isMounted) setChangedFields(new Set()); }, 5000);
              return json.data;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error cargando ERS:", error);
      } finally {
        if (isMounted) setLoadingERS(false);
      }
    };

    fetchERS();
    window.addEventListener("ers-refresh", fetchERS);
    window.addEventListener("chat-session-changed", fetchERS);
    return () => {
      isMounted = false;
      window.removeEventListener("ers-refresh", fetchERS);
      window.removeEventListener("chat-session-changed", fetchERS);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const handleDownload = () => {
    if (tab === "Arquitectura") {
      // Buscar el SVG del diagrama en el DOM
      const svgEl = document.querySelector("#arq-svg-container svg") as SVGSVGElement | null;
      if (!svgEl) return;
      const serializer = new XMLSerializer();
      const svgStr = serializer.serializeToString(svgEl);
      const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "arquitectura.svg";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      setShowPopup(true);
    }
    // Para ERS y Análisis puedes añadir lógica de descarga aquí
  };

  const wrapperClass = expanded
    ? "flex-1 h-full min-w-[520px] transition-all duration-300"
    : "w-full max-w-xs h-full transition-all duration-300";

  return (
    <>
      {showPopup && (
        <DownloadPopup docName={DOC_NAMES[tab]} onClose={() => setShowPopup(false)} />
      )}

      <section className={wrapperClass}>
        <div className="relative flex h-full flex-col rounded-3xl bg-gray-100 p-6 shadow-md">
          <button
            onClick={onToggle}
            className="absolute -left-5 top-6 z-50 cursor-pointer rounded-full bg-white p-2 shadow transition hover:scale-105"
          >
            {expanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {/* Vista colapsada */}
          {!expanded && (
            <div className="flex h-full flex-col gap-3">
              <div className="shrink-0">
                <h1 className="text-xl font-bold text-[#EB0029]">Documentos de Salida</h1>
                <div className="mt-1 h-[2px] w-full bg-[#EB0029]" />
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                {(["ERS", "Análisis", "Arquitectura"] as const).map((t) => (
                  <div key={t} className="flex shrink-0 flex-col gap-1">
                    <span className="px-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                      {DOC_NAMES[t]}
                    </span>
                    <div className="relative h-72 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md">
                      <div
                        className="pointer-events-none h-full w-full overflow-hidden"
                        style={{ transform: "scale(0.33)", transformOrigin: "top left", width: "303%", height: "303%" }}
                      >
                        {t === "Arquitectura" ? (
                          <ArquitecturaDiagram />
                        ) : loadingERS ? (
                          <div className="flex h-full items-center justify-center text-sm text-gray-500">Cargando ERS...</div>
                        ) : (
                          <ERSPreview data={ersData} changedFields={changedFields} />
                        )}
                      </div>
                      <button
                        onClick={() => { setTab(t); onToggle(); }}
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

          {/* Vista expandida */}
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
                {tab === "Arquitectura" ? (
                  <div id="arq-svg-container" className="h-full w-full overflow-auto p-4">
                    <ArquitecturaDiagram />
                  </div>
                ) : (
                  <div className="h-full w-full overflow-y-auto overscroll-contain bg-[#e9e9e9]">
                    {loadingERS ? (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        Cargando documento...
                      </div>
                    ) : (
                      <ERSPreview data={ersData} changedFields={changedFields} />
                    )}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}