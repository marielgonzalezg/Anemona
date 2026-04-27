"use client";

// ─── Relaciones con otros archivos ───────────────────────────────────────────
// - Usado en: Documentacion.tsx (vista normal sin drop zones)
// - Usado en: WidgetsModal.tsx  (consume buildBlocks, Page, USABLE_HEIGHT)
// - Tipos de datos: @/types/ers (ERSData)
// ─────────────────────────────────────────────────────────────────────────────

import type { ERSData } from "@/types/  ers";
import { useEffect, useMemo, useRef, useState } from "react";

/* ─────────────────────────────────────────
   Helpers
───────────────────────────────────────── */
const showValue = (value: unknown, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
  return String(value);
};

/* ─────────────────────────────────────────
   Constantes de layout — exportadas para WidgetsModal
   816px = ancho de hoja
   110px header + 90px footer = 200px fijos
   856px = área de contenido entre header y footer
   808px = área útil (856 - 24 paddingTop - 24 paddingBottom)
───────────────────────────────────────── */
const PAGE_CONTENT_HEIGHT = 856;
const PAGE_PADDING_V = 48;
export const USABLE_HEIGHT = PAGE_CONTENT_HEIGHT - PAGE_PADDING_V; // 808px

/* ─────────────────────────────────────────
   Tipo de bloque — exportado para WidgetsModal
───────────────────────────────────────── */
export type BlockDef = {
  id: string;
  node: React.ReactNode;
};

/* ─────────────────────────────────────────
   buildBlocks — construye la lista ordenada de bloques del documento
   Exportado para que WidgetsModal pueda consumirlo directamente
   y mezclar bloques con widgets insertados por el usuario
───────────────────────────────────────── */
export function buildBlocks(
  data: ERSData,
  highlight: (path: string) => string
): BlockDef[] {
  return [
    {
      id: "intro",
      node: (
        <p className="mb-8 text-[13px] leading-[1.2]">
          Este cuestionario tiene como propósito conocer cuáles son los beneficios,
          costos y riesgos relacionados con cada iniciativa que ingresa al
          portafolio de proyectos y mantenimientos tecnológicos de Áreas de
          Soporte. Esta información será de utilidad para ponderar el portafolio
          en su conjunto y priorizar la atención de los requerimientos de acuerdo
          a su beneficio económico, alineación estratégica y conveniencia de su
          realización.
        </p>
      ),
    },
    {
      id: "datos_generales",
      node: (
        <>
          <table className="mb-1 w-full border-collapse border border-black text-[13px]">
            <tbody>
              <DocRow label="Solicitante" value={data.DATOS_GENERALES.SOLICITANTE} valueClassName={highlight("DATOS_GENERALES.SOLICITANTE")} />
              <DocRow label="Información de contacto" value={data.DATOS_GENERALES.INFO_CONTACTO} valueClassName={highlight("DATOS_GENERALES.INFO_CONTACTO")} />
              <DocRow label="DGA" value={data.DATOS_GENERALES.DGA} valueClassName={highlight("DATOS_GENERALES.DGA")} />
              <DocRow label="Patrocinador" value={data.DATOS_GENERALES.PATROCINADOR} valueClassName={highlight("DATOS_GENERALES.PATROCINADOR")} />
              <DocRow label="CR" value={data.DATOS_GENERALES.CR} valueClassName={highlight("DATOS_GENERALES.CR")} />
              <DocRow label="Nombre del Socio de Negocio" value={data.DATOS_GENERALES.SOCIO} valueClassName={highlight("DATOS_GENERALES.SOCIO")} />
              <DocRow label="Nombre de la iniciativa" value={data.DATOS_GENERALES.NOMBRE_INICIATIVA} valueClassName={highlight("DATOS_GENERALES.NOMBRE_INICIATIVA")} />
              <DocRow label="Tipo de la iniciativa" value={data.DATOS_GENERALES.TIPO_INICIATIVA} valueClassName={highlight("DATOS_GENERALES.TIPO_INICIATIVA")} />
            </tbody>
          </table>
          <div className="mb-8 text-[11px] italic leading-[1.15]">
            <p>*Obligatorio Caso de Negocio (Business Case).</p>
            <p>**Obligatorio Caso de Negocio (Business Case) únicamente con costos.</p>
          </div>
        </>
      ),
    },
    {
      id: "seccion_1",
      node: <SectionLine number="1." title="Descripción general de la iniciativa y justificación." note="(Obligatorio)" noteColor="text-red-600" />,
    },
    {
      id: "descripcion_label",
      node: <div className="mb-5 font-bold text-[13px]">Descripción General de la Iniciativa</div>,
    },
    {
      id: "descripcion",
      node: (
        <BodyText className={`mb-8 italic text-[#1d5da8] ${highlight("DESCRIPCION_INICIATIVA")}`}>
          {showValue(data.DESCRIPCION_INICIATIVA, "")}
        </BodyText>
      ),
    },
    {
      id: "seccion_2",
      node: <SectionLine number="2." title="Objetivos de la iniciativa." note="(Obligatorio)" noteColor="text-red-600" />,
    },
    {
      id: "objetivo",
      node: (
        <>
          <div className="mb-1 font-bold italic text-[#1d5da8] text-[13px]">Objetivo</div>
          <BodyText className={`mb-6 italic text-[#1d5da8] ${highlight("OBJETIVOS_ALCANCE.OBJETIVO")}`}>
            {showValue(data.OBJETIVOS_ALCANCE.OBJETIVO, "")}
          </BodyText>
        </>
      ),
    },
    {
      id: "alcance",
      node: (
        <>
          <div className="mb-1 font-bold italic text-[#1d5da8] text-[13px]">Alcance</div>
          <BodyText className={`mb-8 italic text-[#1d5da8] ${highlight("OBJETIVOS_ALCANCE.ALCANCE")}`}>
            {showValue(data.OBJETIVOS_ALCANCE.ALCANCE, "")}
          </BodyText>
        </>
      ),
    },
    {
      id: "seccion_3",
      node: <SectionLine number="3." title="Áreas Impactadas" note="(Únicamente si aplica)" noteColor="text-green-600" />,
    },
    {
      id: "areas_impactadas",
      node: (
        <table className="mb-8 w-full border-collapse border border-black text-[13px]">
          <thead>
            <tr className="bg-[#133b73] text-white">
              <th className="border border-black px-3 py-1 text-center font-bold">Área de Negocio</th>
              <th className="border border-black px-3 py-1 text-center font-bold">Procesos impactados y descripción del impacto</th>
            </tr>
          </thead>
          <tbody>
            {data.AREAS_IMPACTADAS?.length ? (
              data.AREAS_IMPACTADAS.map((item, i) => (
                <tr key={i}>
                  <td className="border border-black px-3 py-2 align-top">{showValue(item.AREA_NEGOCIO)}</td>
                  <td className="border border-black px-3 py-2 align-top">{showValue(item.PROCESO_IMPACTO)}</td>
                </tr>
              ))
            ) : (
              <tr><td className="border border-black px-3 py-2" colSpan={2}>N/A</td></tr>
            )}
          </tbody>
        </table>
      ),
    },
    {
      id: "seccion_4",
      node: <SectionLine number="4." title="Requerimientos de Negocio." note="(Obligatorio)" noteColor="text-red-600" />,
    },
    {
      id: "tabla_fr",
      node: (
        <table className="mb-8 w-full border-collapse border border-black text-[13px]">
          <tbody>
            <tr>
              <td colSpan={4} className="border border-black bg-[#d9d9d9] px-3 py-2 font-bold">tablaFR</td>
            </tr>
            <tr>
              <td className="border border-black px-3 py-2">Área participante</td>
              <td className="border border-black px-3 py-2 font-bold italic text-[#1d5da8]">{showValue(data.TABLA_FR.AREA_PARTICIPANTE)}</td>
              <td className="border border-black px-3 py-2">Responsable</td>
              <td className="border border-black px-3 py-2 font-bold italic text-[#1d5da8]">{showValue(data.TABLA_FR.RESPONSABLE)}</td>
            </tr>
            <tr>
              <td colSpan={4} className="border border-black bg-[#d9d9d9] px-3 py-2 font-bold">
                En caso de ser un requerimiento <span className="italic">Regulatorio.</span>
              </td>
            </tr>
            <TableInfoRow label="Autoridad que solicita la regulación o cambio." value={showValue(data.REQUERIMIENTO_REGULATORIO.AUTORIDAD, "Por definir")} valueClassName={highlight("REQUERIMIENTO_REGULATORIO.AUTORIDAD")} />
            <TableInfoRow label="Fecha de emisión de la regulación por parte de la Autoridad." value={showValue(data.REQUERIMIENTO_REGULATORIO.FECHA_EMISION, "NA")} valueClassName={highlight("REQUERIMIENTO_REGULATORIO.AUTORIDAD")} />
            <TableInfoRow label="Fecha de recepción de la regulación por parte de GFNorte." value={showValue(data.REQUERIMIENTO_REGULATORIO.FECHA_RECEPCION, "NA")} valueClassName={highlight("REQUERIMIENTO_REGULATORIO.AUTORIDAD")} />
            <TableInfoRow label="Fecha de entrada en vigor de la regulación." value={showValue(data.REQUERIMIENTO_REGULATORIO.FECHA_ENTRADA_VIGOR, "NA")} valueClassName={highlight("REQUERIMIENTO_REGULATORIO.AUTORIDAD")} />
            <TableInfoRow label="Monto posible de la sanción (Multa)." value={showValue(data.REQUERIMIENTO_REGULATORIO.MONTO_SANCION, "0")} valueClassName={highlight("REQUERIMIENTO_REGULATORIO.AUTORIDAD")} />
            <TableInfoRow label="Aplicativos (sistemas) que se ven impactados" value={showValue(data.REQUERIMIENTO_REGULATORIO.SISTEMAS_APLICATIVOS, "N/A")} valueClassName={highlight("REQUERIMIENTO_REGULATORIO.AUTORIDAD")} />
            <tr>
              <td colSpan={4} className="border border-black bg-[#d9d9d9] px-3 py-2 font-bold">
                En caso de <span className="italic">no</span> ser requerimiento <span className="italic">Regulatorio.</span>
              </td>
            </tr>
            <tr>
              <td colSpan={2} className="border border-black px-3 py-2">
                Es urgente: <span className="font-bold">{data.REQUERIMIENTO_NO_REGULATORIO.ES_URGENTE ? "Sí" : "No"}</span>
              </td>
              <td colSpan={2} className="border border-black px-3 py-2">
                Fecha límite de la urgencia: <span className="font-bold">{showValue(data.REQUERIMIENTO_NO_REGULATORIO.FECHA_LIMITE)}</span>
              </td>
            </tr>
            <tr>
              <td colSpan={4} className="border border-black bg-[#d9d9d9] px-3 py-2 font-bold">
                En caso de ser un requerimiento <span className="italic">Periódico</span>
              </td>
            </tr>
            <tr>
              <td className="border border-black px-3 py-2">Periodicidad</td>
              <td colSpan={3} className="border border-black px-3 py-2 font-bold">{showValue(data.REQUERIMIENTO_PERIODICO.PERIODICIDAD, "Por definir")}</td>
            </tr>
            <tr>
              <td className="border border-black px-3 py-2">Fechas requeridas de entrega</td>
              <td colSpan={3} className="border border-black px-3 py-2 font-bold">{showValue(data.REQUERIMIENTO_PERIODICO.FECHAS_ENTREGA)}</td>
            </tr>
          </tbody>
        </table>
      ),
    },
    { id: "seccion_5", node: <SectionLine number="5." title="Beneficios." /> },
    {
      id: "beneficios",
      node: (
        <>
          <SubSection title="5.1 Otros Beneficios." />
          <EmptyBlock>{showValue(data.BENEFICIOS.OTROS_BENEFICIOS, "")}</EmptyBlock>
        </>
      ),
    },
    { id: "seccion_6", node: <SectionLine number="6." title="Participación de otras áreas." /> },
    { id: "participacion", node: <EmptyBlock>{showValue(data.PARTICIPACION_OTRAS_AREAS, "")}</EmptyBlock> },
    { id: "seccion_6_1", node: <SubSection title="6.1 Riesgos." note="(Obligatorio)" noteColor="text-red-600" /> },
    {
      id: "riesgos",
      node: (
        <table className="mb-8 w-full border-collapse border border-black text-[13px]">
          <thead>
            <tr className="bg-[#133b73] text-white">
              <th className="border border-black px-3 py-1 text-center font-bold">Riesgo</th>
              <th className="border border-black px-3 py-1 text-center font-bold">Probable Pérdida</th>
              <th className="border border-black px-3 py-1 text-center font-bold">Justificación</th>
            </tr>
          </thead>
          <tbody>
            {data.RIESGOS?.length ? (
              data.RIESGOS.map((riesgo, i) => (
                <tr key={i}>
                  <td className="border border-black px-3 py-2">{showValue(riesgo.TIPO)}</td>
                  <td className="border border-black px-3 py-2">{showValue(riesgo.PROBABLE_PERDIDA)}</td>
                  <td className="border border-black px-3 py-2">{showValue(riesgo.JUSTIFICACION)}</td>
                </tr>
              ))
            ) : (
              <tr><td className="border border-black px-3 py-2" colSpan={3}>N/A</td></tr>
            )}
          </tbody>
        </table>
      ),
    },
    { id: "seccion_7", node: <SectionLine number="7." title="Exclusiones." note="(Únicamente si aplica)" noteColor="text-sky-500" /> },
    { id: "exclusiones", node: <EmptyBlock>{showValue(data.EXCLUSIONES, "")}</EmptyBlock> },
    { id: "seccion_8", node: <SectionLine number="8." title="Supuestos." note="(Únicamente si aplica)" noteColor="text-sky-500" /> },
    { id: "supuestos", node: <EmptyBlock>{showValue(data.SUPUESTOS, "")}</EmptyBlock> },
    { id: "seccion_9", node: <SectionLine number="9." title="Restricciones." note="(Únicamente si aplica)" noteColor="text-sky-500" /> },
    { id: "restricciones", node: <EmptyBlock>{showValue(data.RESTRICCIONES, "")}</EmptyBlock> },
    { id: "seccion_10", node: <SectionLine number="10." title="Anexos." note="(Opcional)" noteColor="text-green-600" /> },
    { id: "anexos", node: <EmptyBlock>{showValue(data.ANEXOS, "")}</EmptyBlock> },
  ];
}

/* ─────────────────────────────────────────
   ERSPreview — componente default
   Usado en Documentacion.tsx para mostrar el doc sin interacción
───────────────────────────────────────── */
export default function ERSPreview({
  data,
  changedFields,
}: {
  data: ERSData | null;
  changedFields?: Set<string>;
}) {
  const [pages, setPages] = useState<BlockDef[][]>([]);
  const [measured, setMeasured] = useState(false);
  const measureRefs = useRef<(HTMLDivElement | null)[]>([]);

  // highlight: resalta campos modificados por el chat (usado en Documentacion.tsx)
  const highlight = (path: string) =>
    changedFields?.has(path) ? "bg-yellow-200 transition-all duration-700" : "";

  // useMemo evita que buildBlocks recree el array en cada render,
  // lo que causaba el loop infinito en el useEffect de paginación
  const blocks = useMemo(
    () => (data ? buildBlocks(data, highlight) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data, changedFields]
  );

  // Resetear paginación cuando cambia el contenido del documento
  useEffect(() => {
    setMeasured(false);
    setPages([]);
  }, [blocks]);

  // Algoritmo de paginación greedy:
  // Acumula bloques en una página hasta superar USABLE_HEIGHT, luego abre una nueva
  useEffect(() => {
    if (measured || blocks.length === 0) return;

    const raf = requestAnimationFrame(() => {
      const heights = measureRefs.current.map((el) => el?.offsetHeight ?? 0);

      const result: BlockDef[][] = [];
      let currentPage: BlockDef[] = [];
      let currentHeight = 0;

      blocks.forEach((block, i) => {
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
  }, [blocks, measured]);

  if (!data) return <div className="p-8">Cargando documento...</div>;

  // Fase 1: render invisible para medir + spinner
  if (!measured) {
    return (
      <div className="w-full bg-[#ececec] py-8 px-4">
        <div className="flex items-center justify-center py-16 text-sm text-gray-400">
          <svg className="mr-2 h-5 w-5 animate-spin text-[#EB0029]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
          </svg>
          Calculando paginación...
        </div>
        {/* Render fuera de pantalla para medir alturas reales de cada bloque */}
        <div
          aria-hidden="true"
          style={{ position: "absolute", top: 0, left: "-9999px", visibility: "hidden", pointerEvents: "none", width: "716px", zIndex: -1 }}
        >
          {blocks.map((block, i) => (
            <div key={block.id} ref={(el) => { measureRefs.current[i] = el; }}>
              {block.node}
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Fase 2: render paginado final
  return (
    <div className="w-full bg-[#ececec] py-8 px-4">
      {pages.map((pageBlocks, pageIndex) => (
        <Page key={pageIndex}>
          {pageBlocks.map((block) => (
            <div key={block.id}>{block.node}</div>
          ))}
        </Page>
      ))}
    </div>
  );
}

/* ─────────────────────────────────────────
   Page — hoja con header y footer
   Exportado para que WidgetsModal lo use también
   Sin scroll interno: la página crece con su contenido
───────────────────────────────────────── */
export function Page({ children }: { children: React.ReactNode }) {
  // Hoja carta en pantalla: 816px ancho × 1056px alto (proporción 1:1.294)
  // Header 110px + contenido 856px + footer 90px = 1056px total
  return (
    <div
      className="mx-auto mb-8 w-[816px] border border-gray-300 bg-white shadow-md"
      style={{ height: "1056px", overflow: "hidden" }}
    >
      <HeaderBand />
      {/* overflow: hidden — lo que no cabe en 808px útiles no se muestra.
          El algoritmo de paginación garantiza que el contenido siempre quepa */}
      <div
        className="text-black text-[13px] leading-[1.28]"
        style={{
          height: "856px",
          overflow: "hidden",
          paddingTop: "24px",
          paddingBottom: "24px",
          paddingLeft: "47px",
          paddingRight: "51px",
          boxSizing: "border-box",
        }}
      >
        {children}
      </div>
      <FooterBand />
    </div>
  );
}

/* ─────────────────────────────────────────
   Sub-componentes visuales
   Todos exportados para ser reutilizados en WidgetRenderer.tsx
───────────────────────────────────────── */
export function HeaderBand() {
  return (
    <div className="h-[110px] border-b border-[#b9a89f]">
      <div className="flex items-center justify-between px-12 py-7">
        <div className="text-[22px] font-semibold leading-none text-[#7c7c7c]">
          <span>Formato Estándar | </span>
          <span className="font-normal">Levantamiento de Requerimiento</span>
        </div>
        <img src="/images/rayaNegra.png" alt="Encabezado" className="h-[45px] object-cover" />
      </div>
    </div>
  );
}

export function FooterBand() {
  return (
    <div className="flex h-[90px] items-center px-6">
      <img src="/images/banortegf.png" alt="Footer Banorte" className="h-[65px] object-contain" />
    </div>
  );
}

export function DocRow({ label, value, valueClassName = "" }: { label: string; value: React.ReactNode; valueClassName?: string }) {
  return (
    <tr>
      <td className="w-[220px] border border-black px-2 py-[2px]">{label}</td>
      <td className={`border border-black px-2 py-[2px] italic text-[#1d5da8] ${valueClassName}`}>{value}</td>
    </tr>
  );
}

export function TableInfoRow({ label, value, valueClassName = "" }: { label: string; value: React.ReactNode; valueClassName?: string }) {
  return (
    <tr>
      <td colSpan={2} className="border border-black px-3 py-2">{label}</td>
      <td colSpan={2} className={`border border-black px-3 py-2 italic text-[#1d5da8] ${valueClassName}`}>{value}</td>
    </tr>
  );
}

export function SectionLine({ number, title, note, noteColor = "text-black" }: { number: string; title: string; note?: string; noteColor?: string }) {
  return (
    <div className="mb-4 mt-6">
      <div className="flex items-center gap-3 border-t-2 border-black pt-2">
        <span className="text-[18px]">{number}</span>
        <span className="text-[18px]">{title}</span>
        {note && <span className={`text-[11px] ${noteColor}`}>{note}</span>}
      </div>
    </div>
  );
}

export function SubSection({ title, note, noteColor = "text-black" }: { title: string; note?: string; noteColor?: string }) {
  return (
    <div className="mb-4 mt-5 flex items-center gap-2">
      <span className="text-[18px]">{title}</span>
      {note && <span className={`text-[11px] ${noteColor}`}>{note}</span>}
    </div>
  );
}

export function BodyText({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`text-[13px] leading-[1.2] ${className}`}>{children}</div>;
}

export function EmptyBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 min-h-[70px] border-b-2 border-black text-[13px]">{children}</div>
  );
}