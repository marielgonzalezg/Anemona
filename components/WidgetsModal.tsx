"use client";

// ─── Relaciones con otros archivos ───────────────────────────────────────────
// - Importa de DynamicVisor.tsx: USABLE_HEIGHT, BlockDef (antes venían de ERSPreview)
// - Importa de BibliotecaWidgets.tsx: renderWXXX y tipo Widget
// - Lee widgetlist.json para saber qué widgets hay disponibles
// - Recibe widgets[] como prop desde Documentacion.tsx
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect, useRef, useState } from "react";
import WidgetRenderer from "./DynamicVisor";
import { LayoutGrid } from "lucide-react";
import widgetList from "./widgetlist.json";
import { BlockDef, USABLE_HEIGHT } from "./DynamicVisor";
import {
  renderW000,
  renderW001,
  renderW002,
  renderW003,
  Widget,
} from "./widgets/BibliotecaWidgets";

type WidgetsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  widgets: Widget[];
};

export default function WidgetsModal({ isOpen, onClose, widgets }: WidgetsModalProps) {
  const [mergedBlocks, setMergedBlocks] = useState<BlockDef[]>([]);
  const [pages, setPages] = useState<BlockDef[][]>([]);
  const [measured, setMeasured] = useState(false);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [draggingWidget, setDraggingWidget] = useState<(typeof widgetList)[number] | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<number | null>(null);

  /* ── Inicializar mergedBlocks desde widgets prop ──
     Usa renderWXXX directamente en lugar de WidgetRenderer completo
     para que los bloques sean simples nodos sin paginación propia */
  useEffect(() => {
    if (!isOpen || widgets.length === 0) return;

    const noop = () => {};
    const blocks: BlockDef[] = widgets.map((w) => {
      let node: React.ReactNode = null;
      switch (w.id_widget) {
        case "w_000": node = renderW000(w, noop); break;
        case "w_001": node = renderW001(w, noop); break;
        case "w_002": node = renderW002(w, noop); break;
        case "w_003": node = renderW003(w, noop); break;
      }
      return { id: `${w.id_widget}-${w.posicion}`, node };
    });

    setMergedBlocks(blocks);
  }, [isOpen, widgets]);

  /* ── Resetear paginación cuando mergedBlocks cambia (nuevo widget insertado) ── */
  useEffect(() => {
    if (mergedBlocks.length === 0) return;
    setMeasured(false);
    setPages([]);
    measureRefs.current = [];
  }, [mergedBlocks]);

  /* ── Algoritmo de paginación greedy ── */
  useEffect(() => {
    if (measured || mergedBlocks.length === 0) return;

    const raf = requestAnimationFrame(() => {
      requestAnimationFrame(() => {
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
    });

    return () => cancelAnimationFrame(raf);
  }, [measured, mergedBlocks]);

  /* ── Drag & Drop handlers ── */
  function handleDragStart(widget: (typeof widgetList)[number]) {
    setDraggingWidget(widget);
  }

  function handleDragEnd() {
    setDraggingWidget(null);
    setActiveDropZone(null);
  }

  // Inserta el widget como un nuevo BlockDef en la posición exacta del drop
  function handleDrop(insertAtIndex: number) {
    if (!draggingWidget) return;

    const noop = () => {};
    let node: React.ReactNode = null;
    const w = draggingWidget as unknown as Widget;
    switch (w.id_widget) {
      case "w_000": node = renderW000(w, noop); break;
      case "w_001": node = renderW001(w, noop); break;
      case "w_002": node = renderW002(w, noop); break;
      case "w_003": node = renderW003(w, noop); break;
    }

    const widgetBlock: BlockDef = {
      id: `widget_drop_${draggingWidget.id_widget}_${Date.now()}`,
      node: (
        <div className="relative border border-blue-200 rounded-lg px-4 py-3 mb-2 bg-blue-50/30">
          <span className="absolute top-1 right-2 text-[10px] bg-blue-100 text-blue-500 rounded px-2 py-[1px] font-medium">
            Widget añadido
          </span>
          {node}
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

        {/* Imágenes decorativas del branding */}
        <img src="/images/RedBob.png" className="absolute -top-16 -right-10 w-52 pointer-events-none select-none z-0" alt="" />
        <img src="/images/GreyBob.png" className="absolute top-1/2 -right-10 -translate-y-1/2 w-36 pointer-events-none select-none z-0" alt="" />
        <img src="/images/banortegf.png" className="absolute bottom-3 left-4 w-60 pointer-events-none select-none z-0" alt="" />

        <button onClick={onClose} className="absolute top-4 right-5 z-10 rounded-md px-2 py-1 text-gray-400 hover:bg-gray-100 hover:text-black transition text-lg">✕</button>

        <div className="relative z-10 flex space-x-6 h-full">

          {/* ── Panel izquierdo: documento con drop zones ── */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-[#EB0029]">Modifica tu plantilla</h2>
              <p className="text-sm text-gray-400 mt-0.5">Arrastra secciones al documento</p>
            </div>

            <div className="flex-1 rounded-3xl bg-[#f9f9f9] overflow-auto border border-dashed border-blue-300">
              <div className="w-full bg-[#ececec] py-8 px-4">

                {/* ── Fase 1: Spinner + render invisible para medir ── */}
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
                      style={{
                        position: "absolute",
                        top: 0,
                        left: "-9999px",
                        visibility: "hidden",
                        pointerEvents: "none",
                        width: "716px",
                        zIndex: -1,
                      }}
                    >
                      {mergedBlocks.map((block, i) => (
                        <div key={block.id} ref={(el) => { measureRefs.current[i] = el; }}>
                          {block.node}
                        </div>
                      ))}
                    </div>
                  </>
                )}

                {/* ── Fase 2: Render paginado con drop zones ── */}
                {measured && pages.map((pageBlocks, pageIndex) => {
                  const pageStartIndex = pages
                    .slice(0, pageIndex)
                    .reduce((acc, pg) => acc + pg.length, 0);

                  return (
                    <div
                      key={pageIndex}
                      className="mx-auto mb-8 w-[816px] border border-gray-300 bg-white shadow-md"
                      style={{ overflow: "hidden" }}
                    >
                      {/* Header */}
                      <div className="h-[110px] border-b border-[#b9a89f]">
                        <div className="flex items-center justify-between px-12 py-7">
                          <div className="text-[22px] font-semibold leading-none text-[#7c7c7c]">
                            <span>Formato Estándar | </span>
                            <span className="font-normal">Levantamiento de Requerimiento</span>
                          </div>
                          <img src="/images/rayaNegra.png" alt="" className="h-[45px] object-cover" />
                        </div>
                      </div>

                      {/* Contenido */}
                      <div style={{ padding: "24px 51px 24px 47px" }}>
                        {/* Párrafo introductorio solo en página 1 */}
                        {pageIndex === 0 && (
                          <p className="mb-8 text-[13px] leading-[1.2]">
                            Este cuestionario tiene como propósito conocer cuáles son los beneficios,
                            costos y riesgos relacionados con cada iniciativa que ingresa al
                            portafolio de proyectos y mantenimientos tecnológicos de Áreas de
                            Soporte. Esta información será de utilidad para ponderar el portafolio
                            en su conjunto y priorizar la atención de los requerimientos de acuerdo
                            a su beneficio económico, alineación estratégica y conveniencia de su
                            realización.
                          </p>
                        )}

                        {pageBlocks.map((block, blockIndexInPage) => {
                          const globalIndex = pageStartIndex + blockIndexInPage;
                          return (
                            <div key={block.id}>
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

                        {/* Drop zone al final de la última página */}
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
                      </div>

                      {/* Footer */}
                      <div className="flex h-[90px] items-center px-6">
                        <img src="/images/banortegf.png" alt="" className="h-[65px] object-contain" />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── Panel derecho: lista de widgets arrastrables ── */}
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
                  onDragStart={() => handleDragStart(widget)}
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
                  <ScaledWidgetPreview widget={widget as unknown as Widget} />
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
   DropZone — zona de soltar entre bloques
   Solo visible cuando isDragging es true
───────────────────────────────────────── */
function DropZone({
  isActive,
  isDragging,
  onDragOver,
  onDragLeave,
  onDrop,
  index,
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
   ScaledWidgetPreview — previsualización escalada del widget
   Renderiza el widget a 816px y lo escala a 0.34
───────────────────────────────────────── */
const SCALE = 0.34;
const DOC_WIDTH = 816;

function ScaledWidgetPreview({ widget }: { widget: Widget }) {
  const innerRef = useRef<HTMLDivElement>(null);
  const [innerHeight, setInnerHeight] = useState(180);

  useEffect(() => {
    if (innerRef.current) setInnerHeight(innerRef.current.scrollHeight);
  }, []);

  const noop = () => {};
  let node: React.ReactNode = null;
  switch (widget.id_widget) {
    case "w_000": node = renderW000(widget, noop); break;
    case "w_001": node = renderW001(widget, noop); break;
    case "w_002": node = renderW002(widget, noop); break;
    case "w_003": node = renderW003(widget, noop); break;
  }

  return (
    <div style={{ width: "100%", height: `${innerHeight * SCALE}px`, overflow: "hidden", position: "relative" }}>
      <div style={{ width: `${DOC_WIDTH}px`, transform: `scale(${SCALE})`, transformOrigin: "top left", position: "absolute", top: 0, left: 0 }}>
        <div
          ref={innerRef}
          className="text-black text-[13px] leading-[1.28] bg-white"
          style={{ paddingTop: "16px", paddingBottom: "16px", paddingLeft: "47px", paddingRight: "51px" }}
        >
          {node}
        </div>
      </div>
    </div>
  );
}