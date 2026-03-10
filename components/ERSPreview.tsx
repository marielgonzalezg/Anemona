"use client";

import type { ERSData } from "@/types/  ers";

const showValue = (value: unknown, fallback = "N/A") => {
  if (value === null || value === undefined || value === "") return fallback;
  if (Array.isArray(value)) return value.length ? value.join(", ") : fallback;
  return String(value);
};

export default function ERSPreview({ data }: { data: ERSData | null }) {
  if (!data) {
    return <div className="p-8">Cargando documento...</div>;
  }

  return (
    <div className="w-full bg-[#ececec] py-8 px-4">
      {/* PAGE 1 */}
      <Page>
        <p className="mb-8 text-[13px] leading-[1.2]">
          Este cuestionario tiene como propósito conocer cuáles son los beneficios,
          costos y riesgos relacionados con cada iniciativa que ingresa al
          portafolio de proyectos y mantenimientos tecnológicos de Áreas de
          Soporte. Esta información será de utilidad para ponderar el portafolio
          en su conjunto y priorizar la atención de los requerimientos de acuerdo
          a su beneficio económico, alineación estratégica y conveniencia de su
          realización.
        </p>

        <table className="mb-1 w-full border-collapse border border-black text-[13px]">
          <tbody>
            <DocRow label="Solicitante" value={data.DATOS_GENERALES.SOLICITANTE} />
            <DocRow
              label="Información de contacto"
              value={data.DATOS_GENERALES.INFO_CONTACTO}
            />
            <DocRow label="DGA" value={data.DATOS_GENERALES.DGA} />
            <DocRow
              label="Patrocinador"
              value={data.DATOS_GENERALES.PATROCINADOR}
            />
            <DocRow label="CR" value={data.DATOS_GENERALES.CR} />
            <DocRow
              label="Nombre del Socio de Negocio"
              value={data.DATOS_GENERALES.SOCIO}
            />
            <DocRow
              label="Nombre de la iniciativa"
              value={data.DATOS_GENERALES.NOMBRE_INICIATIVA}
            />
            <DocRow
              label="Tipo de la iniciativa"
              value={data.DATOS_GENERALES.TIPO_INICIATIVA}
            />
          </tbody>
        </table>

        <div className="mb-8 text-[11px] italic leading-[1.15]">
          <p>*Obligatorio Caso de Negocio (Business Case).</p>
          <p>**Obligatorio Caso de Negocio (Business Case) únicamente con costos.</p>
        </div>

        <SectionLine
          number="1."
          title="Descripción general de la iniciativa y justificación."
          note="(Obligatorio)"
          noteColor="text-red-600"
        />

        <div className="mb-5 font-bold text-[13px]">
          Descripción General de la Iniciativa
        </div>

        <BodyText className="mb-8 italic text-[#1d5da8]">
          {showValue(data.DESCRIPCION_INICIATIVA, "")}
        </BodyText>

        <SectionLine
          number="2."
          title="Objetivos de la iniciativa."
          note="(Obligatorio)"
          noteColor="text-red-600"
        />

        <div className="mb-1 font-bold italic text-[#1d5da8] text-[13px]">
          Objetivo
        </div>
        <BodyText className="mb-6 italic text-[#1d5da8]">
          {showValue(data.OBJETIVOS_ALCANCE.OBJETIVO, "")}
        </BodyText>

        <div className="mb-1 font-bold italic text-[#1d5da8] text-[13px]">
          Alcance
        </div>
        <BodyText className="mb-8 italic text-[#1d5da8]">
          {showValue(data.OBJETIVOS_ALCANCE.ALCANCE, "")}
        </BodyText>
      </Page>

      {/* PAGE 2 */}
      <Page>
        <SectionLine
          number="3."
          title="Áreas Impactadas"
          note="(Únicamente si aplica)"
          noteColor="text-green-600"
        />

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
            {data.AREAS_IMPACTADAS?.length ? (
              data.AREAS_IMPACTADAS.map((item, i) => (
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

        <SectionLine
          number="4."
          title="Requerimientos de Negocio."
          note="(Obligatorio)"
          noteColor="text-red-600"
        />

        <table className="mb-8 w-full border-collapse border border-black text-[13px]">
          <tbody>
            <tr>
              <td
                colSpan={4}
                className="border border-black bg-[#d9d9d9] px-3 py-2 font-bold"
              >
                tablaFR
              </td>
            </tr>

            <tr>
              <td className="border border-black px-3 py-2">Área participante</td>
              <td className="border border-black px-3 py-2 font-bold italic text-[#1d5da8]">
                {showValue(data.TABLA_FR.AREA_PARTICIPANTE)}
              </td>
              <td className="border border-black px-3 py-2">Responsable</td>
              <td className="border border-black px-3 py-2 font-bold italic text-[#1d5da8]">
                {showValue(data.TABLA_FR.RESPONSABLE)}
              </td>
            </tr>

            <tr>
              <td
                colSpan={4}
                className="border border-black bg-[#d9d9d9] px-3 py-2 font-bold"
              >
                En caso de ser un requerimiento <span className="italic">Regulatorio.</span>
              </td>
            </tr>

            <TableInfoRow
              label="Autoridad que solicita la regulación o cambio."
              value={showValue(data.REQUERIMIENTO_REGULATORIO.AUTORIDAD, "Por definir")}
            />
            <TableInfoRow
              label="Fecha de emisión de la regulación por parte de la Autoridad."
              value={showValue(data.REQUERIMIENTO_REGULATORIO.FECHA_EMISION, "NA")}
            />
            <TableInfoRow
              label="Fecha de recepción de la regulación por parte de GFNorte."
              value={showValue(data.REQUERIMIENTO_REGULATORIO.FECHA_RECEPCION, "NA")}
            />
            <TableInfoRow
              label="Fecha de entrada en vigor de la regulación."
              value={showValue(
                data.REQUERIMIENTO_REGULATORIO.FECHA_ENTRADA_VIGOR,
                "NA"
              )}
            />
            <TableInfoRow
              label="Monto posible de la sanción (Multa)."
              value={showValue(data.REQUERIMIENTO_REGULATORIO.MONTO_SANCION, "0")}
            />
            <TableInfoRow
              label="Aplicativos (sistemas) que se ven impactados"
              value={showValue(
                data.REQUERIMIENTO_REGULATORIO.SISTEMAS_APLICATIVOS,
                "N/A"
              )}
            />

            <tr>
              <td
                colSpan={4}
                className="border border-black bg-[#d9d9d9] px-3 py-2 font-bold"
              >
                En caso de <span className="italic">no</span> ser requerimiento{" "}
                <span className="italic">Regulatorio.</span>
              </td>
            </tr>

            <tr>
              <td colSpan={2} className="border border-black px-3 py-2">
                Es urgente:{" "}
                <span className="font-bold">
                  {data.REQUERIMIENTO_NO_REGULATORIO.ES_URGENTE ? "Sí" : "No"}
                </span>
              </td>
              <td colSpan={2} className="border border-black px-3 py-2">
                Fecha límite de la urgencia:{" "}
                <span className="font-bold">
                  {showValue(data.REQUERIMIENTO_NO_REGULATORIO.FECHA_LIMITE)}
                </span>
              </td>
            </tr>

            <tr>
              <td
                colSpan={4}
                className="border border-black bg-[#d9d9d9] px-3 py-2 font-bold"
              >
                En caso de ser un requerimiento <span className="italic">Periódico</span>
              </td>
            </tr>

            <tr>
              <td className="border border-black px-3 py-2">Periodicidad</td>
              <td colSpan={3} className="border border-black px-3 py-2 font-bold">
                {showValue(data.REQUERIMIENTO_PERIODICO.PERIODICIDAD, "Por definir")}
              </td>
            </tr>

            <tr>
              <td className="border border-black px-3 py-2">
                Fechas requeridas de entrega
              </td>
              <td colSpan={3} className="border border-black px-3 py-2 font-bold">
                {showValue(data.REQUERIMIENTO_PERIODICO.FECHAS_ENTREGA)}
              </td>
            </tr>
          </tbody>
        </table>
      </Page>

      {/* PAGE 3 */}
      <Page>
        <SectionLine number="5." title="Beneficios." />
        <SubSection title="5.1 Otros Beneficios." />
        <EmptyBlock>{showValue(data.BENEFICIOS.OTROS_BENEFICIOS, "")}</EmptyBlock>

        <SectionLine number="6." title="Participación de otras áreas." />
        <EmptyBlock>{showValue(data.PARTICIPACION_OTRAS_AREAS, "")}</EmptyBlock>

        <SubSection
          title="6.1 Riesgos."
          note="(Obligatorio)"
          noteColor="text-red-600"
        />

        <table className="mb-8 w-full border-collapse border border-black text-[13px]">
          <thead>
            <tr className="bg-[#133b73] text-white">
              <th className="border border-black px-3 py-1 text-center font-bold">
                Riesgo
              </th>
              <th className="border border-black px-3 py-1 text-center font-bold">
                Probable Pérdida
              </th>
              <th className="border border-black px-3 py-1 text-center font-bold">
                Justificación
              </th>
            </tr>
          </thead>
          <tbody>
            {data.RIESGOS?.length ? (
              data.RIESGOS.map((riesgo, i) => (
                <tr key={i}>
                  <td className="border border-black px-3 py-2">
                    {showValue(riesgo.TIPO)}
                  </td>
                  <td className="border border-black px-3 py-2">
                    {showValue(riesgo.PROBABLE_PERDIDA)}
                  </td>
                  <td className="border border-black px-3 py-2">
                    {showValue(riesgo.JUSTIFICACION)}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td className="border border-black px-3 py-2" colSpan={3}>
                  N/A
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <SectionLine
          number="7."
          title="Exclusiones."
          note="(Únicamente si aplica)"
          noteColor="text-sky-500"
        />
        <EmptyBlock>{showValue(data.EXCLUSIONES, "")}</EmptyBlock>

        <SectionLine
          number="8."
          title="Supuestos."
          note="(Únicamente si aplica)"
          noteColor="text-sky-500"
        />
        <EmptyBlock>{showValue(data.SUPUESTOS, "")}</EmptyBlock>

        <SectionLine
          number="9."
          title="Restricciones."
          note="(Únicamente si aplica)"
          noteColor="text-sky-500"
        />
        <EmptyBlock>{showValue(data.RESTRICCIONES, "")}</EmptyBlock>

        <SectionLine
          number="10."
          title="Anexos."
          note="(Opcional)"
          noteColor="text-green-600"
        />
        <EmptyBlock>{showValue(data.ANEXOS, "")}</EmptyBlock>
      </Page>
    </div>
  );
}

function Page({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto mb-8 h-[1056px] w-[816px] overflow-hidden border border-gray-300 bg-white shadow-md">
      <HeaderBand />

      <div
        className="text-black text-[13px] leading-[1.28]"
        style={{
          height: "856px",
          paddingTop: "24px",
          paddingBottom: "24px",
          paddingLeft: "47px",
          paddingRight: "51px",
          boxSizing: "border-box",
          overflow: "hidden",
        }}
      >
        {children}
      </div>

      <FooterBand />
    </div>
  );
}

function HeaderBand() {
  return (
    <div className="h-[110px] border-b border-[#b9a89f]">
      <div className="flex items-center justify-between px-12 py-7">
        <div className="text-[22px] font-semibold leading-none text-[#7c7c7c]">
          <span>Formato Estándar | </span>
          <span className="font-normal">Levantamiento de Requerimiento</span>
        </div>

        <img
          src="/images/rayaNegra.png"
          alt="Encabezado"
          className="h-[45px] object-cover"
        />
      </div>
    </div>
  );
}

function FooterBand() {
  return (
    <div className="flex h-[90px] items-center px-6">
      <img
        src="/images/banortegf.png"
        alt="Footer Banorte"
        className="h-[65px] object-contain"
      />
    </div>
  );
}

function DocRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <tr>
      <td className="w-[220px] border border-black px-2 py-[2px]">{label}</td>
      <td className="border border-black px-2 py-[2px] italic text-[#1d5da8]">
        {value}
      </td>
    </tr>
  );
}

function TableInfoRow({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <tr>
      <td colSpan={2} className="border border-black px-3 py-2">
        {label}
      </td>
      <td
        colSpan={2}
        className="border border-black px-3 py-2 italic text-[#1d5da8]"
      >
        {value}
      </td>
    </tr>
  );
}

function SectionLine({
  number,
  title,
  note,
  noteColor = "text-black",
}: {
  number: string;
  title: string;
  note?: string;
  noteColor?: string;
}) {
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

function EmptyBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="mb-8 min-h-[70px] border-b-2 border-black text-[13px]">
      {children}
    </div>
  );
}