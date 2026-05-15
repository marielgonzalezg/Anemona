"use client";

import { useEffect, useState } from "react";
import WidgetRenderer from "../../components/DynamicVisor";
import { Widget } from "../../components/widgets/BibliotecaWidgets";

const API_BASE =
  "https://api-anemona-637376850775.northamerica-northeast1.run.app";

export default function PdfDocumentPage() {
  const [widgets, setWidgets] = useState<Widget[]>([]);
  const [loading, setLoading] = useState(true);

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
    const fetchDocumento = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const docId = params.get("doc_id");

        if (!docId) throw new Error("No se recibió doc_id");

        const response = await fetch(
          `${API_BASE}/firestore/bajar?doc_id=${encodeURIComponent(docId)}`,
          {
            method: "GET",
            headers: { accept: "application/json" },
            cache: "no-store",
          }
        );

        if (!response.ok) throw new Error("No se pudo obtener el documento");

        const json = await response.json();

        if (json.ok && json.data) {
          setWidgets(mapDataToWidgets(json.data));
        }
      } catch (error) {
        console.error("Error cargando documento para PDF:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDocumento();
  }, []);

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-white text-sm text-gray-500">
        Cargando documento...
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white">
      <style>{`
        @page {
          size: 816px 1076px;
          margin: 0;
        }

        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: white !important;
        }

        @media print {
          .pdf-root {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }

          [data-pdf-page] {
            width: 816px !important;
            height: 1056px !important;
            margin: 0 !important;
            box-shadow: none !important;
            border: none !important;
            page-break-after: always;
            break-after: page;
          }

          [data-pdf-page]:last-child {
            page-break-after: auto;
            break-after: auto;
          }

          .print\\:hidden {
            display: none !important;
          }
        }
      `}</style>

      <div className="pdf-root bg-white p-0 m-0">
        <WidgetRenderer widgets={widgets} changedFields={new Set()} />
      </div>
    </main>
  );
}