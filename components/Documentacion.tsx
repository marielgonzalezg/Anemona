"use client";

// ─── Relaciones con otros archivos ───────────────────────────────────────────
// - Usa DynamicVisor.tsx (WidgetRenderer) para mostrar el documento
// - Usa WidgetsModal.tsx para el modal de widgets arrastrables
// - Lee sessionStorage["project_id"] para saber qué doc cargar de Firestore
// - Detecta cambios del chat y los pasa como changedFields a WidgetRenderer
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle,
  X,
} from "lucide-react";
import WidgetRenderer from "./DynamicVisor";
import WidgetsModal from "./WidgetsModal";
import { Widget } from "./widgets/BibliotecaWidgets";

const DRAWIO_EMBED_URL =
  "https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=diagramaarq.drawio&dark=auto#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1K0pWBSO4_RdxmUlAippvNTiQZfnkcoSJ%26export%3Ddownload";

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
        <button onClick={onClose} className="mt-2 rounded-full bg-[#EB0029] px-8 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#c8001f]">
          Aceptar
        </button>
      </div>
    </div>
  );
}

export default function Documentacion({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const [tab, setTab] = useState<"ERS" | "Análisis" | "Arquitectura">("ERS");
  const [showPopup, setShowPopup] = useState(false);
  const [loadingERS, setLoadingERS] = useState(true);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);

  // Ref para guardar el último snapshot raw de Firestore.
  // Usamos ref (no state) porque fetchERS vive en un closure del useEffect
  // y no puede ver los valores actualizados de state — pero sí puede ver refs.
  const prevRawDataRef = useRef<any>(null);

  // Lee el project_id del sessionStorage.
  // Se actualiza cuando el usuario hace click en un proyecto de ProjectList,
  // porque ChatBot.tsx setea sessionStorage["project_id"] antes de disparar
  // el evento "chat-session-changed".
  const getActiveProjectId = () => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("project_id") || "";
  };

  // Convierte el objeto de Firestore al array de Widget[] que consume DynamicVisor.
  // Firestore devuelve: { posiciones: ["w_000", "w_001", ...], w_000: { titulo, campos, ... }, ... }
  // Esta función usa "posiciones" para ordenar y construir el array.
  const mapDataToWidgets = (data: any): Widget[] => {
    const posiciones: string[] = data.posiciones ?? [];
    return posiciones.map((widgetId, index) => {
      const w = data[widgetId] ?? {};
      return {
        posicion: index,
        id_widget: widgetId,
        titulo: w.titulo ?? widgetId,
        objetivo_widget: w.objetivo_widget ?? "",
        descripcion_campos: w.descripcion_campos ?? {},
        campos: w.campos ?? {},
      };
    });
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Compara recursivamente dos snapshots del documento de Firestore.
    // Devuelve un Set con los paths de los campos que cambiaron,
    // ej: "w_000.campos.SOLICITANTE", "w_001.campos.DESCRIPCION_INICIATIVA"
    // Estos paths se pasan a DynamicVisor como changedFields para resaltar en amarillo.
    const detectChanges = (oldData: any, newData: any) => {
      const changed = new Set<string>();

      const compare = (obj1: any, obj2: any, path = "") => {
        if (Array.isArray(obj2)) {
          obj2.forEach((item, index) => {
            const newPath = path ? `${path}.${index}` : `${index}`;
            if (typeof item === "object" && item !== null) {
              compare(obj1?.[index], item, newPath);
            } else if (obj1?.[index] !== item) {
              changed.add(newPath);
            }
          });
          return;
        }
        for (const key in obj2) {
          const newPath = path ? `${path}.${key}` : key;
          if (typeof obj2[key] === "object" && obj2[key] !== null) {
            compare(obj1?.[key], obj2[key], newPath);
          } else if (obj1?.[key] !== obj2[key]) {
            changed.add(newPath);
          }
        }
      };

      compare(oldData, newData);
      return changed;
    };

    // Descarga el documento de Firestore usando el project_id activo.
    // Se llama:
    //   1. Al montar el componente (carga inicial)
    //   2. Cuando el chat recibe respuesta del bot → evento "ers-refresh"
    //   3. Cuando el usuario cambia de proyecto → evento "chat-session-changed"
    const fetchERS = async () => {
      try {
        const docId = getActiveProjectId();
        console.log("🔵 fetchERS corriendo con docId:", docId);
        if (!docId) return;

        const response = await fetch(
          `https://api-anemona-637376850775.northamerica-northeast1.run.app/firestore/bajar?doc_id=${encodeURIComponent(docId)}`,
          {
            method: "GET",
            headers: { accept: "application/json" },
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error("No se pudo obtener el ERS");

        const json = await response.json();
        console.log("🟢 json.data →", json.data);

        if (isMounted && json.ok && json.data) {
          // Compara el nuevo snapshot con el anterior para detectar qué cambió.
          // Si hay cambios, los resalta en amarillo durante 5 segundos.
          const changes = prevRawDataRef.current
            ? detectChanges(prevRawDataRef.current, json.data)
            : new Set<string>();

          if (changes.size > 0) {
            console.log("🟡 changedFields:", [...changes]);
            setChangedFields(changes);
            if (timeoutId) clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
              if (isMounted) setChangedFields(new Set());
            }, 5000);
          }

          // Guarda el snapshot actual para la próxima comparación.
          prevRawDataRef.current = json.data;

          // Convierte y actualiza los widgets en pantalla.
          setWidgets(mapDataToWidgets(json.data));

        }
      } catch (error) {
        console.error("Error cargando ERS:", error);
      } finally {
        if (isMounted) setLoadingERS(false);
      }
    };

    // El setTimeout de 100ms en chat-session-changed es necesario porque
    // ChatBot.tsx setea sessionStorage["project_id"] y luego dispara el evento
    // casi simultáneamente — el delay garantiza que sessionStorage ya tiene
    // el nuevo project_id cuando fetchERS lo lee.
    const handleRefresh = () => setTimeout(() => fetchERS(), 100);

    fetchERS(); // carga inicial

    window.addEventListener("ers-refresh", handleRefresh);
    window.addEventListener("chat-session-changed", handleRefresh);



    return () => {
      isMounted = false;
      window.removeEventListener("ers-refresh", handleRefresh);
      window.removeEventListener("chat-session-changed", handleRefresh);

      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  useEffect(() => {
  const handleOpenWidgets = () => setIsWidgetsOpen(true);
  window.addEventListener("open-widgets-modal", handleOpenWidgets);
  return () => {
    window.removeEventListener("open-widgets-modal", handleOpenWidgets);
  };
}, []);

  const wrapperClass = expanded
    ? "flex-1 h-full min-w-[520px] transition-all duration-300"
    : "w-full max-w-xs h-full transition-all duration-300";

  const handleDownload = async () => {
    try {
      const response = await fetch(DRAWIO_EMBED_URL);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = tab === "Arquitectura"
        ? "arquitectura.drawio"
        : `${DOC_NAMES[tab].replace(/ /g, "_")}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error al descargar:", error);
    } finally {
      setShowPopup(true);
    }
  };

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

          {/* ── Vista colapsada: miniaturas de los 3 documentos ── */}
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
                      {t === "ERS" || t === "Análisis" ? (
                        <div
                          className="pointer-events-none h-full w-full overflow-hidden"
                          style={{ transform: "scale(0.33)", transformOrigin: "top left", width: "303%", height: "303%" }}
                        >
                          {loadingERS ? (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500">
                              Cargando ERS...
                            </div>
                          ) : (
                            // Pasa changedFields para que DynamicVisor resalte los campos modificados
                            <WidgetRenderer widgets={widgets} changedFields={changedFields} />
                          )}
                        </div>
                      ) : (
                        <iframe
                          src={DRAWIO_EMBED_URL}
                          className="border-0"
                          title={DOC_NAMES[t]}
                          style={{ pointerEvents: "none", width: "170%", height: "170%", transform: "scale(0.588)", transformOrigin: "top left" }}
                        />
                      )}

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

          {/* ── Vista expandida: documento completo con tabs ── */}
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
                {tab === "ERS" || tab === "Análisis" ? (
                  <div className="h-full w-full overflow-y-auto overscroll-contain bg-[#e9e9e9]">
                    {loadingERS ? (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        Cargando documento...
                      </div>
                    ) : (
                      <WidgetRenderer widgets={widgets} changedFields={changedFields} />
                    )}
                  </div>
                ) : (
                  <iframe
                    key={tab}
                    src={DRAWIO_EMBED_URL}
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

      {/* WidgetsModal recibe los widgets actuales para mostrar el doc en el modal */}
      <WidgetsModal
        isOpen={isWidgetsOpen}
        onClose={() => setIsWidgetsOpen(false)}
        widgets={widgets}
      />
    </>
  );
}