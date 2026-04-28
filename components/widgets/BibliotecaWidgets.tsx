import React from "react";
import { useEffect, useRef } from "react";
/* ================== TYPES ================== */

export type Widget = {
  posicion: number;
  id_widget: string;
  titulo: string;
  objetivo_widget: string;
  descripcion_campos: Record<string, string>;
  campos: Record<string, any>;
};

/* ================== EDITABLE ================== */

type EditableProps = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
};
type EditableTitleProps = {
  value: string;
  onChange: (v: string) => void;
  className?: string;
};

export const EditableTitle = ({
  value,
  onChange,
  className = "",
}: EditableTitleProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      rows={1}
      className={`bg-transparent outline-none resize-none overflow-hidden w-full leading-tight ${className}`}
    />
  );
};

export const EditableText = ({
  value,
  onChange,
  className = "",
}: EditableProps) => {
  const ref = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = "auto";
      ref.current.style.height = ref.current.scrollHeight + "px";
    }
  }, [value]);

  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={`w-full bg-transparent outline-none resize-none overflow-hidden ${className}`}
      rows={1}
    />
  );
};

/* ================== UI BASE ================== */function SectionLine({
  number,
  title,
  note,
  noteColor = "text-black",
}: {
  number: string;
  title: React.ReactNode;
  note?: string;
  noteColor?: string;
}) {



return (
    <div className="mb-4 mt-6">
      <div className="flex items-start gap-3 border-t-2 border-black pt-2 w-full">
        <span className="text-[18px] shrink-0">{number}</span>
        <div className="flex-1 min-w-0">
          {title}
        </div>
        {note && (
          <span className={`text-[11px] shrink-0 ml-2 mt-1 ${noteColor}`}>
            {note}
          </span>
        )}
      </div>
    </div>
  );
}
function SubSection({
  title,
  note,
  noteColor = "text-black",
}: {
  title: string;
  note?: string;
  noteColor?: string;
}) {
  return (
    <div className="mb-4 mt-5 flex items-center gap-2">
      <span className="text-[18px]">{title}</span>
      {note && <span className={`text-[11px] ${noteColor}`}>{note}</span>}
    </div>
  );
}

function BodyText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <div className={`text-[13px] leading-[1.2] ${className}`}>{children}</div>;
}
/* ================== W000 ================== */
export const renderW000 = (
  widget: Widget,
  onChange: (posicion: number, key: string, value: string) => void,
  highlight: (path: string) => string = () => ""  // <- highlight
) => {
  const campos = widget.campos || {};

  const baseFields = [
    { key: "SOLICITANTE", label: "Solicitante" },
    { key: "INFO_CONTACTO", label: "Información de contacto" },
    { key: "DGA", label: "DGA" },
    { key: "PATROCINADOR", label: "Patrocinador" },
    { key: "CR", label: "CR" },
    { key: "SOCIO", label: "Nombre del Socio de Negocio" },
    { key: "NOMBRE_INICIATIVA", label: "Nombre de la iniciativa" },
    { key: "TIPO_INICIATIVA", label: "Tipo de la iniciativa" },
  ];

  const extraFields = Object.keys(campos).filter(
    (k) => !baseFields.some((f) => f.key === k)
  );
const Cell = (key: string) => (
  <EditableText
    value={String(campos[key] ?? "")}
    onChange={(v) =>
      onChange(widget.posicion, key, v)
    }
  />
);
  return (
    <div className="mb-8">
      <table className="w-full border border-black text-[13px]">
        <tbody>
          {baseFields.map(({ key, label }) => (
            <tr key={key}>
              <td className="border px-2 py-1 font-bold w-[35%]">
                {label}
              </td>
              <td className="border px-2 py-1">{Cell(key)}</td>
            </tr>
          ))}

          {extraFields.map((key) => (
            <tr key={key}>
              <td className="border px-2 py-1 font-bold">
                {widget.descripcion_campos?.[key] || key}
              </td>
              <td className="border px-2 py-1">{Cell(key)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/* ================== W001 ================== */
//{
//  "posicion": 1,
//  "id_widget": "w_001",
//  "titulo": "Descripción general de la iniciativa",
//  "objetivo_widget": "Este widget documenta la visión general del proyecto en el SRS. INSTRUCCIONES PARA EL AGENTE: (1) OBLIGATORIO — revisa el valor actual de 'descripcion' dentro de 'campos'. Si está vacío, null o no existe, DEBES generarla obligatoriamente con base en la información del proyecto: incluye el problema que se desea resolver, el contexto actual del área o proceso afectado, y la justificación de por qué este proyecto es necesario. Si 'descripcion' ya tiene contenido, NO la modifiques a menos que el usuario lo solicite explícitamente. (2) OPCIONAL — solo modifica 'titulo' o 'subtitulo' dentro de 'campos' si el usuario lo solicita explícitamente. Si no los menciona, no los incluyas en 'campos' y se usarán los valores por defecto: título='Descripción general de la iniciativa y justificación', subtítulo='Descripción general de la iniciativa'.",
//  "descripcion_campos": {
//    "descripcion": "OBLIGATORIO si está vacío. Explicación completa de la iniciativa: problema a resolver, contexto actual y justificación del proyecto. Si ya tiene contenido, solo modificar si el usuario lo pide explícitamente.",
//    "titulo": "OPCIONAL. Sobrescribe el título principal de la sección. Valor por defecto: 'Descripción general de la iniciativa y justificación'.",
//    "subtitulo": "OPCIONAL. Sobrescribe el subtítulo de la sección. Valor por defecto: 'Descripción general de la iniciativa'."
//  },
//  "campos": {
//    "descripcion": ""
//  }
//}


export const renderW001 = (
  widget: Widget,
  onChange: (posicion: number, key: string, value: string) => void,
  highlight: (path: string) => string = () => ""  // <- highlight
) => {
  const campos = widget.campos || {};

  return (
    <div className="mb-8">
      <SectionLine
        number={`${widget.posicion}.`}
        title={
          <input
            value={
              campos.titulo ||
              "Descripción general de la iniciativa y justificación"
            }
            onChange={(e) =>
              onChange(widget.posicion, "titulo", e.target.value)
            }
            className="bg-transparent outline-none font-bold w-full"
          />
        }
        note="(Obligatorio)"
        noteColor="text-red-600"
      />

      <input
        value={
          campos.subtitulo ||
          "Descripción general de la iniciativa"
        }
        onChange={(e) =>
          onChange(widget.posicion, "subtitulo", e.target.value)
        }
        className="w-full font-bold text-[13px] mb-4 bg-transparent outline-none"
      />

      <BodyText className="mb-6 italic text-[#1d5da8]">
        <EditableText
          value={campos.descripcion || ""}
          onChange={(v) =>
            onChange(widget.posicion, "descripcion", v)
          }
        />
      </BodyText>

      {Object.keys(campos)
        .filter(
          (k) =>
            k !== "titulo" &&
            k !== "subtitulo" &&
            k !== "descripcion"
        )
        .map((key) => (
          <div key={key} className="mb-4">
            <div className="text-[13px] font-semibold">
              {widget.descripcion_campos[key] || key}
            </div>

            <EditableText
              value={String(campos[key] ?? "")}
              onChange={(v) =>
                onChange(widget.posicion, key, v)
              }
            />
          </div>
        ))}
    </div>
  );
};

/* ================== W002 ================== */

//  {
//    posicion: 1,
//    id_widget: "w_002",
//    titulo: "Descripción general de la iniciativa",
//
//    objetivo_widget:
//      "Este widget corresponde a la sección de visión general del SRS. Su objetivo es documentar de forma clara y estructurada la iniciativa o proyecto, proporcionando el contexto necesario para entender el problema que se busca resolver y justificar su desarrollo dentro del sistema.",
//
//    descripcion_campos: {
//
//        },
//
//    campos: {
//    "Titulo": "Objetivos de la iniciativa",
//    "Seccion_1": "Contenido de la sección 1. Aquí se puede incluir información detallada sobre el primer objetivo específico de la iniciativa, describiendo las metas concretas que se buscan alcanzar y cómo contribuyen al objetivo general del proyecto.",
//    "Seccion_1Titulo": "Seccion_1",
//    "Seccion_2": "Contenido de la sección 2. En esta parte se puede detallar el segundo objetivo específico, explicando su importancia dentro del contexto del proyecto y cómo se relaciona con los demás objetivos para lograr el éxito de la iniciativa.",
//    "Seccion_2Titulo": "Seccion_2",
//    },
//  }

export const renderW002 = (
  widget: Widget,
  onChange: (posicion: number, key: string, value: string) => void,
  highlight: (path: string) => string = () => ""  // <- highlight
) => {
  const campos = widget.campos || {};

  return (
    <div className="mb-8">
      <SectionLine
        number={`${widget.posicion}.`}
        title={
          <input
            value={campos.Titulo || "Objetivos de la iniciativa"}
            onChange={(e) =>
              onChange(widget.posicion, "Titulo", e.target.value)
            }
            className="bg-transparent outline-none font-bold w-full"
          />
        }
        note="(Obligatorio)"
        noteColor="text-red-600"
      />

      <div className="mb-5">
        <input
          value={campos.Seccion_1Titulo || "Objetivo"}
          onChange={(e) =>
            onChange(widget.posicion, "Seccion_1Titulo", e.target.value)
          }
          className="w-full font-bold text-[13px] mb-1 bg-transparent outline-none"
        />

        <BodyText className="italic text-[#1d5da8]">
          <EditableText
            value={campos.Seccion_1 || ""}
            onChange={(v) =>
              onChange(widget.posicion, "Seccion_1", v)
            }
          />
        </BodyText>
      </div>

      <div className="mb-8">
        <input
          value={campos.Seccion_2Titulo || "Alcance"}
          onChange={(e) =>
            onChange(widget.posicion, "Seccion_2Titulo", e.target.value)
          }
          className="w-full font-bold text-[13px] mb-1 bg-transparent outline-none"
        />

        <BodyText className="italic text-[#1d5da8]">
          <EditableText
            value={campos.Seccion_2 || ""}
            onChange={(v) =>
              onChange(widget.posicion, "Seccion_2", v)
            }
          />
        </BodyText>
      </div>
    </div>
  );
};

/* ================== W003 ================== */

export const renderW003 = (
  widget: Widget,
  onChange: (posicion: number, key: string, value: any) => void,
  highlight: (path: string) => string = () => ""  // <- highlight
) => {
  const filas = widget.campos?.filas || [];

  const handleRowChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const nuevasFilas = filas.map((fila: any, i: number) => {
      if (i !== index) return fila;
      return { ...fila, [field]: value };
    });

    onChange(widget.posicion, "filas", nuevasFilas);
  };

  return (
    <div className="mb-8">
      <SubSection
        title={`${widget.posicion}.1 ${widget.titulo || "Riesgos"}.`}
        note="(Obligatorio)"
        noteColor="text-red-600"
      />

      <table className="mb-8 w-full border border-black text-[13px]">
        <thead>
          <tr className="bg-[#133b73] text-white">
            <th className="border px-3 py-1">Riesgo</th>
            <th className="border px-3 py-1">Probable Pérdida</th>
            <th className="border px-3 py-1">Justificación</th>
          </tr>
        </thead>

        <tbody>
          {filas.length ? (
            filas.map((fila: any, i: number) => (
              <tr key={i}>
                <td className="border px-2 py-1">
                  <input
                    value={fila.TIPO || ""}
                    onChange={(e) =>
                      handleRowChange(i, "TIPO", e.target.value)
                    }
                    className="w-full bg-transparent outline-none"
                  />
                </td>

                <td className="border px-2 py-1">
                  <EditableText
                    value={fila.PROBABLE_PERDIDA || ""}
                    onChange={(v) =>
                      handleRowChange(i, "PROBABLE_PERDIDA", v)
                    }
                  />
                </td>

                <td className="border px-2 py-1">
                  <EditableText
                    value={fila.JUSTIFICACION || ""}
                    onChange={(v) =>
                      handleRowChange(i, "JUSTIFICACION", v)
                    }
                  />
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={3} className="border text-center py-2">
                N/A
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};