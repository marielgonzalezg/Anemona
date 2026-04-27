"use client";

import { useEffect, useRef, useState } from "react";
import {
  buildBlocks,
  Page,
  USABLE_HEIGHT,
  type BlockDef,
} from "@/components/ERSPreview";
import WidgetRenderer from "@/components/WidgetRenderer";
import { LayoutGrid } from "lucide-react";
import widgetList from "./widgetlist.json";

type Widget = (typeof widgetList)[number];

type WidgetsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

/* ─────────────────────────────────────────
   WidgetsModal
───────────────────────────────────────── */
export default function WidgetsModal({ isOpen, onClose }: WidgetsModalProps) {
  const [srsData, setSrsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  // Lista ordenada de bloques — mezcla de bloques del doc y widgets insertados
  const [mergedBlocks, setMergedBlocks] = useState<BlockDef[]>([]);
  const [pages, setPages] = useState<BlockDef[][]>([]);
  const [measured, setMeasured] = useState(false);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);

  const [draggingWidget, setDraggingWidget] = useState<Widget | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<number | null>(null);

  /* ── Cargar doc desde Firestore ── */
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

    const load = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `http://127.0.0.1:8000/firestore/bajar?doc_id=${encodeURIComponent(docId)}`,
          { method: "GET", headers: { accept: "application/json" }, cache: "no-store" }
        );
        if (!res.ok) throw new Error("Error en la respuesta del servidor");
        const json = await res.json();
        if (json.ok && json.data) {
          setSrsData(json.data);
        }
      } catch (e) {
        console.error("Error cargando SRS:", e);
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [isOpen]);

  /* ── Inicializar mergedBlocks cuando llega srsData ── */
  useEffect(() => {
    if (!srsData) return;
    const blocks = buildBlocks(srsData, () => "");
    setMergedBlocks(blocks);
    setMeasured(false);
    setPages([]);
  }, [srsData]);

  /* ── Re-paginar cuando cambian los bloques ── */
  useEffect(() => {
    if (mergedBlocks.length === 0) return;
    setMeasured(false);
    setPages([]);
  }, [mergedBlocks]);

  /* ── Algoritmo de paginación ── */
  useEffect(() => {
    if (measured || mergedBlocks.length === 0) return;

    const raf = requestAnimationFrame(() => {
      const heights = measureRefs.current.map((el) => el?.offsetHeight ?? 0);

      const result: BlockDef[][] = [];
      let currentPage: BlockDef[] = [];
      let currentHeight = 0;

      mergedBlocks.forEach((block, i) => {
        const h = heights[i];
        if (currentHeight + h > USABLE_HEIGHT && currentPage.length > 0) {
          result.push(currentPage);
          currentPage = [block];
          currentHeight = h;
        } else {
          currentPage.push(block);
          currentHeight += h;
        }
      });

      if (currentPage.length > 0) result.push(currentPage);

      setPages(result);
      setMeasured(true);
    });

    return () => cancelAnimationFrame(raf);
  }, [measured, mergedBlocks]);

  /* ── Log en consola del JSON resultante ── */
  useEffect(() => {
    if (!measured || !srsData) return;

    const orden = mergedBlocks.map((b) => ({
      id: b.id,
      tipo: b.id.startsWith("widget_") ? "widget" : "bloque_original",
    }));

    console.log("📄 DOCUMENTO CON WIDGETS INSERTADOS:");
    console.log(JSON.stringify({ plantilla_original: srsData, orden_bloques: orden }, null, 2));
  }, [measured, mergedBlocks, srsData]);

  /* ── Drag handlers ── */
  function handleDragStart(widget: Widget) {
    setDraggingWidget(widget);
  }

  function handleDragEnd() {
    setDraggingWidget(null);
    setActiveDropZone(null);
  }

  function handleDrop(insertAtIndex: number) {
    if (!draggingWidget) return;

    const widgetBlock: BlockDef = {
      id: `widget_${draggingWidget.id_widget}_${Date.now()}`,
      node: (
        <div className="relative border border-blue-200 rounded-lg px-4 py-3 mb-2 bg-blue-50/30">
          <span className="absolute top-1 right-2 text-[10px] bg-blue-100 text-blue-500 rounded px-2 py-[1px] font-medium">
            Widget añadido
          </span>
          <WidgetRenderer widget={draggingWidget as any} />
        </div>
      ),
    };

    setMergedBlocks((prev) => {
      const next = [...prev];
      next.splice(insertAtIndex, 0, widgetBlock);
      return next;
    });

    setDraggingWidget(null);
    setActiveDropZone(null);
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
      <div className="relative w-[1300px] h-[800px] rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden flex flex-col p-8">

        {/* Decorativas */}
        <img src="/images/RedBob.png" className="absolute -top-16 -right-10 w-52 pointer-events-none select-none z-0" alt="" />
        <img src="/images/GreyBob.png" className="absolute top-1/2 -right-10 -translate-y-1/2 w-36 pointer-events-none select-none z-0" alt="" />
        <img src="/images/banortegf.png" className="absolute bottom-3 left-4 w-60 pointer-events-none select-none z-0" alt="" />

        <button onClick={onClose} className="absolute top-4 right-5 z-10 rounded-md px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-black transition text-lg">✕</button>

        <div className="relative z-10 flex space-x-6 h-full">

          {/* Panel izquierdo — documento */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-[#EB0029]">Modifica tu plantilla</h2>
              <p className="text-sm text-gray-400 mt-0.5">Arrastra secciones al documento</p>
            </div>

            <div className="flex-1 rounded-3xl bg-[#f9f9f9] overflow-auto border border-dashed border-blue-300">
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">Cargando documento...</div>
              ) : !srsData ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">No se encontró el documento</div>
              ) : (
                <div className="w-full bg-[#ececec] py-8 px-4">

                  {/* Fase 1: render invisible para medir */}
                  {!measured && (
                    <>
                      <div className="flex items-center justify-center py-16 text-sm text-gray-400">
                        <svg className="mr-2 h-5 w-5 animate-spin text-[#EB0029]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Calculando paginación...
                      </div>
                      <div
                        aria-hidden="true"
                        style={{ position: "absolute", top: 0, left: "-9999px", visibility: "hidden", pointerEvents: "none", width: "716px", zIndex: -1 }}
                      >
                        {mergedBlocks.map((block, i) => (
                          <div key={block.id} ref={(el) => { measureRefs.current[i] = el; }}>
                            {block.node}
                          </div>
                        ))}
                      </div>
                    </>
                  )}

                  {/* Fase 2: render paginado con drop zones entre cada bloque */}
                  {measured && (
                    <>
                      {pages.map((pageBlocks, pageIndex) => {
                        // Calcular el índice global del primer bloque de esta página
                        const pageStartIndex = pages
                          .slice(0, pageIndex)
                          .reduce((acc, pg) => acc + pg.length, 0);

                        return (
                          <Page key={pageIndex}>
                            {pageBlocks.map((block, blockIndexInPage) => {
                              const globalIndex = pageStartIndex + blockIndexInPage;
                              return (
                                <div key={block.id}>
                                  {/* Drop zone ANTES de este bloque */}
                                  <DropZone
                                    index={globalIndex}
                                    isActive={activeDropZone === globalIndex}
                                    isDragging={!!draggingWidget}
                                    onDragOver={() => setActiveDropZone(globalIndex)}
                                    onDragLeave={() => setActiveDropZone(null)}
                                    onDrop={() => handleDrop(globalIndex)}
                                  />
                                  {block.node}
                                </div>
                              );
                            })}

                            {/* Drop zone al FINAL de la última página */}
                            {pageIndex === pages.length - 1 && (() => {
                              const lastIndex = mergedBlocks.length;
                              return (
                                <DropZone
                                  index={lastIndex}
                                  isActive={activeDropZone === lastIndex}
                                  isDragging={!!draggingWidget}
                                  onDragOver={() => setActiveDropZone(lastIndex)}
                                  onDragLeave={() => setActiveDropZone(null)}
                                  onDrop={() => handleDrop(lastIndex)}
                                />
                              );
                            })()}
                          </Page>
                        );
                      })}
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho — widgets */}
          <div className="flex flex-col w-[320px] shrink-0">
            <div className="mb-3 flex items-center gap-2">
              <LayoutGrid size={20} className="text-[#EB0029]" />
              <h2 className="text-2xl font-bold text-gray-800">Mis Widgets</h2>
            </div>

            <div className="flex-1 rounded-3xl bg-[#f9f9f9] p-4 flex flex-col gap-4 overflow-auto">
              {widgetList.map((widget) => (
                <div
                  key={widget.id_widget}
                  draggable
                  onDragStart={() => handleDragStart(widget as Widget)}
                  onDragEnd={handleDragEnd}
                  className={`w-full rounded-xl bg-white border shadow-sm cursor-grab active:cursor-grabbing select-none transition overflow-hidden
                    ${draggingWidget?.id_widget === widget.id_widget
                      ? "opacity-50 scale-95 border-blue-300"
                      : "border-gray-200 hover:shadow-md hover:border-blue-200"
                    }`}
                >
                  <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-100 bg-gray-50">
                    <span className="text-gray-300 text-base select-none">⠿</span>
                    <span className="text-sm font-semibold text-gray-700">{widget.titulo}</span>
                  </div>
                  <ScaledWidgetPreview widget={widget as Widget} />
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────────────
   Drop Zone
───────────────────────────────────────── */
function DropZone({
  index,
  isActive,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
}: {
  index: number;
  isActive: boolean;
  isDragging: boolean;
  onDragOver: () => void;
  onDragLeave: () => void;
  onDrop: () => void;
}) {
  return (
    <div
      onDragOver={(e) => { e.preventDefault(); onDragOver(); }}
      onDragLeave={onDragLeave}
      onDrop={(e) => { e.preventDefault(); onDrop(); }}
      className={`w-full transition-all duration-150 flex items-center justify-center rounded-lg
        ${isDragging
          ? isActive
            ? "h-12 my-1 border-2 border-blue-400 bg-blue-50"
            : "h-3 my-[2px] border border-dashed border-blue-200 bg-blue-50/20"
          : "h-0 overflow-hidden border-0"
        }`}
    >
      {isActive && (
        <span className="text-xs font-medium text-blue-400">Suelta aquí</span>
      )}
    </div>
  );
}

/* ─────────────────────────────────────────
   Previsualización escalada del widget
───────────────────────────────────────── */
const SCALE = 0.34;
const DOC_WIDTH = 816;

function ScaledWidgetPreview({ widget }: { widget: Widget }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [innerHeight, setInnerHeight] = useState(180);

  useEffect(() => {
    if (innerRef.current) setInnerHeight(innerRef.current.scrollHeight);
  }, []);

  return (
    <div style={{ width: "100%", height: `${innerHeight * SCALE}px`, overflow: "hidden", position: "relative" }}>
      <div style={{ width: `${DOC_WIDTH}px`, transform: `scale(${SCALE})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        <div
          ref={innerRef}
          className="text-black text-[13px] leading-[1.28] bg-white"
          style={{ paddingTop: "16px", paddingBottom: "16px", paddingLeft: "47px", paddingRight: "51px" }}
        >
          <WidgetRenderer widget={widget} />
        </div>
      </div>
    </div>
  );
}