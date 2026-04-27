"use client";

type Widget = {
  posicion: number;
  id_widget: string;
  titulo: string;
  objetivo_widget: string;
  descripcion_campos: Record<string, string>;
  campos: Record<string, unknown>;
};

const showValue = (value: unknown, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
  return String(value);
};

export default function WidgetRenderer({ widget }: { widget: Widget }) {
  switch (widget.id_widget) {
    case "widget_1":
      return <Widget1 campos={widget.campos} />;
    case "widget_2":
      return <Widget2 campos={widget.campos} />;
    case "widget_3":
      return <Widget3 campos={widget.campos} />;
    default:
      return (
        <div className="text-[13px] italic text-gray-400">
          Widget no reconocido: {widget.id_widget}
        </div>
      );
  }
}

/* ─── Widget 1: Descripción de la Iniciativa ─── */
function Widget1({ campos }: { campos: Record<string, unknown> }) {
  return (
    <div>
      <div className="mb-4 mt-6">
        <div className="flex items-center gap-3 border-t-2 border-black pt-2">
          <span className="text-[18px]">Descripción general de la iniciativa y justificación.</span>
          <span className="text-[11px] text-red-600">(Obligatorio)</span>
        </div>
      </div>
      <div className="mb-5 font-bold text-[13px]">
        Descripción General de la Iniciativa
      </div>
      <div className="mb-8 text-[13px] leading-[1.2] italic text-[#1d5da8]">
        {showValue(campos.DESCRIPCION_INICIATIVA, "")}
      </div>
    </div>
  );
}

/* ─── Widget 2: Objetivos y Alcance ─── */
function Widget2({ campos }: { campos: Record<string, unknown> }) {
  return (
    <div>
      <div className="mb-4 mt-6">
        <div className="flex items-center gap-3 border-t-2 border-black pt-2">
          <span className="text-[18px]">Objetivos de la iniciativa.</span>
          <span className="text-[11px] text-red-600">(Obligatorio)</span>
        </div>
      </div>
      <div className="mb-1 font-bold italic text-[#1d5da8] text-[13px]">Objetivo</div>
      <div className="mb-6 text-[13px] leading-[1.2] italic text-[#1d5da8]">
        {showValue(campos.OBJETIVOS_ALCANCE, "")}
      </div>
      <div className="mb-1 font-bold italic text-[#1d5da8] text-[13px]">Alcance</div>
      <div className="mb-8 text-[13px] leading-[1.2] italic text-[#1d5da8]">
        {/* Alcance vacío por defecto, el widget solo trae OBJETIVOS_ALCANCE */}
      </div>
    </div>
  );
}

/* ─── Widget 3: Áreas Impactadas ─── */
type AreaImpactada = {
  AREA_NEGOCIO: string;
  PROCESO_IMPACTO: string | null;
};

function Widget3({ campos }: { campos: Record<string, unknown> }) {
  const areas = (campos.AREAS_IMPACTADAS as AreaImpactada[]) ?? [];

  return (
    <div>
      <div className="mb-4 mt-6">
        <div className="flex items-center gap-3 border-t-2 border-black pt-2">
          <span className="text-[18px]">Áreas Impactadas</span>
          <span className="text-[11px] text-green-600">(Únicamente si aplica)</span>
        </div>
      </div>
      <table className="mb-8 w-full border-collapse border border-black text-[13px]">
        <thead>
          <tr className="bg-[#133b73] text-white">
            <th className="border border-black px-3 py-1 text-center font-bold">
              Área de Negocio
            </th>
            <th className="border border-black px-3 py-1 text-center font-bold">
              Procesos impactados y descripción del impacto
            </th>
          </tr>
        </thead>
        <tbody>
          {areas.length ? (
            areas.map((item, i) => (
              <tr key={i}>
                <td className="border border-black px-3 py-2 align-top">
                  {showValue(item.AREA_NEGOCIO)}
                </td>
                <td className="border border-black px-3 py-2 align-top">
                  {showValue(item.PROCESO_IMPACTO)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td className="border border-black px-3 py-2" colSpan={2}>
                N/A
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}