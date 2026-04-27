"use client";

import { useEffect, useRef, useState } from "react";
import ERSPreview from "@/components/ERSPreview";
import WidgetRenderer from "@/components/WidgetRenderer";
import { LayoutGrid } from "lucide-react";
import widgetList from "./widgetlist.json";

type Widget = (typeof widgetList)[number];

type DroppedWidget = {
  widget: Widget;
  insertAfterIndex: number; // -1 = antes de todo, 0..N = después de la sección N
};

type WidgetsModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

// Secciones del documento original — usadas para calcular posiciones de drop
const DOCUMENT_SECTIONS = [
  "datos_generales",
  "descripcion_iniciativa",
  "objetivos_alcance",
  "areas_impactadas",
  "requerimientos_negocio",
  "beneficios",
  "participacion_otras_areas",
  "riesgos",
  "exclusiones",
  "supuestos",
  "restricciones",
  "anexos",
];

export default function WidgetsModal({ isOpen, onClose }: WidgetsModalProps) {
  const [srsData, setSrsData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [droppedWidgets, setDroppedWidgets] = useState<DroppedWidget[]>([]);
  const [draggingWidget, setDraggingWidget] = useState<Widget | null>(null);
  const [activeDropZone, setActiveDropZone] = useState<number | null>(null);
  const documentRef = useRef<HTMLDivElement>(null);

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

  // Loguear JSON resultante cada vez que cambian los widgets insertados
  useEffect(() => {
    if (!srsData || droppedWidgets.length === 0) return;

    const widgetsInsertados = droppedWidgets.map((dw) => ({
      insertAfterSection: DOCUMENT_SECTIONS[dw.insertAfterIndex] ?? "inicio",
      widget: {
        id_widget: dw.widget.id_widget,
        titulo: dw.widget.titulo,
        campos: dw.widget.campos,
      },
    }));

    console.log("📄 JSON PLANTILLA + WIDGETS INSERTADOS:");
    console.log(
      JSON.stringify(
        {
          plantilla_original: srsData,
          widgets_insertados: widgetsInsertados,
        },
        null,
        2
      )
    );
  }, [droppedWidgets, srsData]);

  function handleDragStart(widget: Widget) {
    setDraggingWidget(widget);
  }

  function handleDragEnd() {
    setDraggingWidget(null);
    setActiveDropZone(null);
  }

  function handleDropZoneDragOver(e: React.DragEvent, index: number) {
    e.preventDefault();
    setActiveDropZone(index);
  }

  function handleDropZoneDragLeave() {
    setActiveDropZone(null);
  }

  function handleDrop(e: React.DragEvent, insertAfterIndex: number) {
    e.preventDefault();
    if (!draggingWidget) return;

    setDroppedWidgets((prev) => [
      ...prev,
      { widget: draggingWidget, insertAfterIndex },
    ]);

    setDraggingWidget(null);
    setActiveDropZone(null);
  }

  if (!isOpen) return null;

  // Construir lista de secciones con drop zones intercaladas
  // Drop zone index: -1 = antes de todo (top), 0..N = después de sección N
  const totalDropZones = DOCUMENT_SECTIONS.length + 1;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm bg-black/30">
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

          {/* Panel izquierdo — documento con drop zones */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="mb-3">
              <h2 className="text-2xl font-bold text-[#EB0029]">Modifica tu plantilla</h2>
              <p className="text-sm text-gray-400 mt-0.5">Arrastra nuevas secciones o modifica</p>
            </div>

            <div
              ref={documentRef}
              className="flex-1 rounded-3xl bg-[#f9f9f9] overflow-auto border border-dashed border-blue-300"
            >
              {loading ? (
                <div className="flex h-full items-center justify-center text-sm text-gray-500">
                  Cargando documento...
                </div>
              ) : srsData ? (
                <div className="w-full bg-[#ececec] py-8 px-4">

                  {/* Drop zone ANTES del documento */}
                  <DropZone
                    index={-1}
                    isActive={activeDropZone === -1}
                    isDragging={!!draggingWidget}
                    onDragOver={(e) => handleDropZoneDragOver(e, -1)}
                    onDragLeave={handleDropZoneDragLeave}
                    onDrop={(e) => handleDrop(e, -1)}
                  />

                  {/* Widgets insertados antes del documento (insertAfterIndex === -1) */}
                  {droppedWidgets
                    .filter((dw) => dw.insertAfterIndex === -1)
                    .map((dw, i) => (
                      <InsertedWidgetBlock key={`top-${i}`} dw={dw} />
                    ))}

                  {/* Documento original */}
                  <ERSPreview data={srsData} changedFields={new Set()} />

                  {/* Drop zones entre/después de secciones del documento */}
                  {DOCUMENT_SECTIONS.map((section, idx) => (
                    <div key={section}>
                      <DropZone
                        index={idx}
                        isActive={activeDropZone === idx}
                        isDragging={!!draggingWidget}
                        onDragOver={(e) => handleDropZoneDragOver(e, idx)}
                        onDragLeave={handleDropZoneDragLeave}
                        onDrop={(e) => handleDrop(e, idx)}
                      />

                      {/* Widgets insertados después de esta sección */}
                      {droppedWidgets
                        .filter((dw) => dw.insertAfterIndex === idx)
                        .map((dw, i) => (
                          <InsertedWidgetBlock key={`${section}-${i}`} dw={dw} />
                        ))}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-gray-400">
                  No se encontró el documento
                </div>
              )}
            </div>
          </div>

          {/* Panel derecho — widgets draggables */}
          <div className="flex flex-col w-[320px] shrink-0">
            <div className="mb-3 flex items-center gap-2">
              <LayoutGrid size={20} className="text-[#EB0029]" />
              <h2 className="text-2xl font-bold text-gray-800">Mis Widgets</h2>
            </div>

            <div className="flex-1 rounded-3xl bg-[#f9f9f9] p-5 flex flex-col gap-4 overflow-auto">
              {widgetList.map((widget) => (
                <div
                  key={widget.id_widget}
                  draggable
                  onDragStart={() => handleDragStart(widget as Widget)}
                  onDragEnd={handleDragEnd}
                  className={`w-full rounded-xl bg-white border border-gray-200 p-5 text-left text-base font-medium text-gray-700 shadow-sm cursor-grab active:cursor-grabbing select-none transition
                    ${draggingWidget?.id_widget === widget.id_widget
                      ? "opacity-50 scale-95 border-blue-300"
                      : "hover:bg-gray-50 hover:shadow"
                    }`}
                >
                  <div className="flex items-center gap-2">
                    {/* Ícono de drag */}
                    <span className="text-gray-300 text-lg">⠿</span>
                    <span>{widget.titulo}</span>
                  </div>
                  <p className="mt-1 text-xs text-gray-400 font-normal">
                    {widget.objetivo_widget}
                  </p>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

/* ─── Drop Zone ─── */
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
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (e: React.DragEvent) => void;
}) {
  return (
    <div
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      className={`mx-auto w-[816px] transition-all duration-150 flex items-center justify-center rounded-lg
        ${isDragging
          ? isActive
            ? "h-16 my-2 border-2 border-blue-400 bg-blue-50"
            : "h-6 my-1 border border-dashed border-blue-200 bg-blue-50/30"
          : "h-0 my-0 overflow-hidden border-0"
        }`}
    >
      {isActive && (
        <span className="text-xs font-medium text-blue-400">
          Suelta aquí para insertar
        </span>
      )}
    </div>
  );
}

/* ─── Bloque de widget insertado ─── */
function InsertedWidgetBlock({ dw }: { dw: DroppedWidget }) {
  return (
    <div className="mx-auto w-[816px] border border-blue-200 bg-white shadow-sm rounded-lg mb-2 px-[47px] py-4 relative">
      {/* Badge */}
      <span className="absolute top-2 right-3 text-[10px] bg-blue-100 text-blue-500 rounded px-2 py-[2px] font-medium">
        Widget añadido
      </span>
      <WidgetRenderer widget={dw.widget as any} />
    </div>
  );
}