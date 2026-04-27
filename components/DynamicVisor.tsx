"use client";

import React, { useMemo, useState } from "react";
import {
  renderW000,
  renderW001,
  renderW002,
  renderW003,
  Widget,
} from "./widgets/BibliotecaWidgets";

type Props = {
  widgets: Widget[];
};

const WidgetRenderer: React.FC<Props> = ({ widgets: initialWidgets }) => {
  const [widgets, setWidgets] = useState<Widget[]>(initialWidgets);
  const [loading, setLoading] = useState(false);

  // 🔥 SOLO actualiza valores, nunca estructura
  const handleChange = (
    posicion: number,
    key: string,
    value: string
  ) => {
    setWidgets((prev) =>
      prev.map((w) => {
        if (w.posicion !== posicion) return w;

        return {
          ...w,
          campos: {
            ...w.campos,
            [key]: value, // 🔥 solo valor cambia
          },
        };
      })
    );
  };

  const sortedWidgets = useMemo(
    () => [...widgets].sort((a, b) => a.posicion - b.posicion),
    [widgets]
  );

  const handleSave = async () => {
    setLoading(true);
    try {
      const res = await fetch(
        "http://127.0.0.1:8000/widgets/modificar/5PmuVc79xxDuwTN4D0my",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(widgets),
        }
      );

      if (!res.ok) throw new Error("Error");

      alert("Guardado correctamente");
    } catch (e) {
      console.error(e);
      alert("Error al guardar");
    } finally {
      setLoading(false);
    }
  };

  const renderWidget = (widget: Widget) => {
    switch (widget.id_widget) {
      case "w_000":
        return renderW000(widget, handleChange);
      case "w_001":
        return renderW001(widget, handleChange);
      case "w_002":
        return renderW002(widget, handleChange);
      case "w_003":
        return renderW003(widget, handleChange);
      default:
        return null;
    }
  };

  return (
    <div className="max-w-[800px] mx-auto p-6 bg-gray-100">
      {/* botón guardar */}
      <div className="flex justify-end mb-4">
        <button
          onClick={handleSave}
          disabled={loading}
          className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400"
        >
          {loading ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>

      {sortedWidgets.map((widget) => (
        <div key={`${widget.id_widget}-${widget.posicion}`}>
          {renderWidget(widget)}
        </div>
      ))}
    </div>
  );
};

export default WidgetRenderer;