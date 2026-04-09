"use client";

import { X, ChevronDown } from "lucide-react";
import { useState } from "react";

type Props = {
  isOpen: boolean;
  tempUserId: string;
  setTempUserId: (value: string) => void;
  loadingSession: boolean;
  onClose: () => void;
  onSubmit: () => void;
};

type FormDataType = {
  solicitante: string;
  dga: string;
  contacto: string;
  patrocinador: string;
  socio: string;
  cr: string;
  iniciativa: string;
  departamentos: string;
  tipo: string;
};

export default function FormModal({
  isOpen,
  tempUserId,
  setTempUserId,
  loadingSession,
  onClose,
  onSubmit,
}: Props) {
  const [formData, setFormData] = useState<FormDataType>({
    solicitante: tempUserId || "",
    dga: "",
    contacto: "",
    patrocinador: "",
    socio: "",
    cr: "",
    iniciativa: "",
    departamentos: "",
    tipo: "",
  });

  const fields: {
    label: string;
    key: keyof FormDataType;
    placeholder: string;
    isSelect?: boolean;
  }[] = [
    {
      label: "Solicitante",
      key: "solicitante",
      placeholder: "Juan Ramón Carranza",
    },
    {
      label: "DGA",
      key: "dga",
      placeholder: "Tecnología",
    },
    {
      label: "Información de contacto",
      key: "contacto",
      placeholder: "jorge.carranza@banorte.com",
    },
    {
      label: "Patrocinador",
      key: "patrocinador",
      placeholder: "Tecnología",
    },
    {
      label: "Nombre del socio de negocio",
      key: "socio",
      placeholder: "Interno",
    },
    {
      label: "CR",
      key: "cr",
      placeholder: "0",
    },
    {
      label: "Nombre de la iniciativa",
      key: "iniciativa",
      placeholder: "0",
    },
    {
      label: "Departamentos impactados",
      key: "departamentos",
      placeholder: "",
      isSelect: true,
    },
  ];

  const isFormValid = Object.values(formData).every(
    (value) => value.trim() !== ""
  );

  function handleChange(key: keyof FormDataType, value: string) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));

    if (key === "solicitante") {
      setTempUserId(value);
    }
  }

  function handleSubmit() {
    setTempUserId(formData.solicitante);
    onSubmit();
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[999]">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-xl px-14 py-10 overflow-hidden">
        <img
          src="/images/RedBob.png"
          className="absolute -top-70 -right-20 w-50 pointer-events-none"
          alt=""
        />
        <img
          src="/images/GreyBob.png"
          className="absolute top-1/2 -right-20 -translate-y-1/2 w-35 pointer-events-none"
          alt=""
        />
        <img
          src="/images/banortegf.png"
          className="absolute bottom-2 left-0 w-60 pointer-events-none"
          alt=""
        />

        <button
          onClick={onClose}
          className="absolute top-6 right-6 text-gray-400 hover:text-gray-600"
        >
          <X size={20} />
        </button>

        <div className="relative z-10">
          <h3 className="text-2xl font-bold mb-2" style={{ color: "#EB0029" }}>
            Formulario
          </h3>

          <p className="text-sm font-bold text-[#323E48] mb-10">
            Por favor, ingrese la siguiente información.
          </p>

          <div className="grid grid-cols-2 gap-x-12 gap-y-10">
            {fields.map((field, i) => (
              <div key={i}>
                <label className="block text-sm font-bold text-[#323E48] mb-2">
                  {field.label}
                </label>

                <div className="w-[70%]">
                  <div className="bg-gray-100 px-4 pt-3 pb-2 flex items-center justify-between">
                    <input
                      value={formData[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-[#5B6670]"
                      placeholder={field.placeholder}
                    />

                    {field.isSelect && (
                      <ChevronDown
                        size={20}
                        className="text-black ml-2 shrink-0"
                      />
                    )}
                  </div>
                  <div className="h-[1px] bg-[#5B6670] mt-[1px] w-full" />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <label className="block text-sm font-bold text-[#323E48] mb-2">
              Tipo de la iniciativa
            </label>

            <div className="w-[70%]">
              <div className="bg-gray-100 px-4 pt-3 pb-2">
                <input
                  value={formData.tipo}
                  onChange={(e) => handleChange("tipo", e.target.value)}
                  className="w-full bg-transparent outline-none text-sm text-[#5B6670]"
                  placeholder="<Prueba de Concepto, Idea, Mantenimiento, Proyecto>"
                />
              </div>
              <div className="h-[1px] bg-[#5B6670] mt-[1px] w-full" />
            </div>
          </div>

          <div className="flex justify-end gap-5 mt-9">
            <button
              onClick={onClose}
              className="px-7 py-3 rounded-xl text-white font-medium"
              style={{ backgroundColor: "#5B6670" }}
            >
              Regresar
            </button>

            <button
              onClick={handleSubmit}
              disabled={loadingSession || !isFormValid}
              className="px-7 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#EB0029" }}
            >
              {loadingSession ? "Cargando..." : "Continuar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}