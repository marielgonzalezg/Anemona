"use client";

import { X, ChevronDown } from "lucide-react";
import { useEffect, useRef, useState } from "react";

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
  departamentos: string[]
  tipo: string;
};

type Departamento = {
  iddepartamento: number;
  nombre: string;
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
    departamentos: [],
    tipo: "",
  });

  const [departamentos, setDepartamentos] = useState<Departamento[]>([]);
  const [loadingDepartamentos, setLoadingDepartamentos] = useState(false);
  const [openDep, setOpenDep] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [submittingProject, setSubmittingProject] = useState(false); // <- nuevo estado para controlar el envío del proyecto

  function toggleDepartamento(id: string) { // función para agregar o quitar departamentos del array
  setFormData((prev) => {
    const yaExiste = prev.departamentos.includes(id);

    return {
      ...prev,
      departamentos: yaExiste
        ? prev.departamentos.filter((depId) => depId !== id)
        : [...prev.departamentos, id],
    };
  });
}

  useEffect(() => {
    async function fetchDepartamentos() {
      try {
        setLoadingDepartamentos(true);

        const res = await fetch("http://127.0.0.1:8000/departamentos");

        if (!res.ok) {
          throw new Error("No se pudieron cargar los departamentos");
        }

        const data = await res.json();
        setDepartamentos(data);
      } catch (error) {
        console.error("Error cargando departamentos:", error);
      } finally {
        setLoadingDepartamentos(false);
      }
    }

    if (isOpen) {
      fetchDepartamentos();
    }
  }, [isOpen]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setOpenDep(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const fields: {
    label: string;
    key: keyof FormDataType;
    placeholder: string;
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
    ];

  const isFormValid =
  formData.solicitante.trim() !== "" &&
  formData.dga.trim() !== "" &&
  formData.contacto.trim() !== "" &&
  formData.patrocinador.trim() !== "" &&
  formData.socio.trim() !== "" &&
  formData.cr.trim() !== "" &&
  formData.iniciativa.trim() !== "" &&
  formData.departamentos.length > 0 &&
  formData.tipo.trim() !== "";

  function handleChange(key: keyof FormDataType, value: string) {
    setFormData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit() {
    try {
      setSubmittingProject(true);

      const payload = {
        formulario: {
          solicitante: formData.solicitante || null,
          dga: formData.dga || null,
          info_contacto: formData.contacto || null,
          patrocinador: formData.patrocinador || null,
          nombre_socio_negocio: formData.socio || null,
          cr: formData.cr || null,
          nombre_iniciativa: formData.iniciativa || null,
          departamentos_impactados: formData.departamentos,
          tipo_iniciativa: formData.tipo || null,
          usuario_nombre: null,
          usuario_id: formData.solicitante.trim() || tempUserId || null,
        },
        plantilla: {
          DATOS_GENERALES: {
            SOLICITANTE: null,
            INFO_CONTACTO: null,
            DGA: null,
            PATROCINADOR: null,
            CR: null,
            SOCIO: null,
            NOMBRE_INICIATIVA: null,
            TIPO_INICIATIVA: null,
          },
          DESCRIPCION_INICIATIVA: null,
          OBJETIVOS_ALCANCE: {
            OBJETIVO: null,
            ALCANCE: null,
          },
          AREAS_IMPACTADAS: [],
          TABLA_FR: {
            AREA_PARTICIPANTE: null,
            RESPONSABLE: null,
          },
          REQUERIMIENTO_REGULATORIO: {
            AUTORIDAD: null,
            FECHA_EMISION: null,
            FECHA_RECEPCION: null,
            FECHA_ENTRADA_VIGOR: null,
            MONTO_SANCION: null,
            SISTEMAS_APLICATIVOS: [],
          },
          REQUERIMIENTO_NO_REGULATORIO: {
            ES_URGENTE: null,
            FECHA_LIMITE: null,
          },
          REQUERIMIENTO_PERIODICO: {
            PERIODICIDAD: null,
            FECHAS_ENTREGA: [],
          },
          BENEFICIOS: {
            OTROS_BENEFICIOS: null,
          },
          PARTICIPACION_OTRAS_AREAS: null,
          RIESGOS: [
            {
              TIPO: "Credito",
              PROBABLE_PERDIDA: null,
              JUSTIFICACION: null,
            },
            {
              TIPO: "Liquidez",
              PROBABLE_PERDIDA: null,
              JUSTIFICACION: null,
            },
            {
              TIPO: "Mercado",
              PROBABLE_PERDIDA: null,
              JUSTIFICACION: null,
            },
            {
              TIPO: "Operativo",
              PROBABLE_PERDIDA: null,
              JUSTIFICACION: null,
            },
            {
              TIPO: "Reputacional",
              PROBABLE_PERDIDA: null,
              JUSTIFICACION: null,
            },
          ],
          EXCLUSIONES: null,
          SUPUESTOS: null,
          RESTRICCIONES: null,
          ANEXOS: [],
        },
      };

      console.log("📦 PAYLOAD QUE SE ENVÍA:");
      console.log(JSON.stringify(payload, null, 2));

      const res = await fetch("http://127.0.0.1:8000/firestore/new_project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });


      console.log("📡 STATUS:", res.status);

      const data = await res.json();

      console.log("✅ RESPONSE DEL BACKEND:");
      console.log(data);

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "No se pudo crear el proyecto.");
      }
      
      console.log("Proyecto creado:", data);

      sessionStorage.setItem(
        "chat_user_id",
        data.user_id ?? payload.formulario.usuario_id ?? ""
      );
      sessionStorage.setItem(
        "chat_session_id",
        data.session_id ?? ""
      );
      sessionStorage.setItem(
        "project_id",
        data.project_id ?? ""
      );

      setTempUserId(payload.formulario.usuario_id ?? "");

      onSubmit();
    } catch (error) {
      console.error(error);
      alert(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al crear el proyecto."
      );
    } finally {
      setSubmittingProject(false);
    }
  }
  function getDepartamentosSeleccionados() {
    if (formData.departamentos.length === 0) return "";

    return departamentos
      .filter((d) => formData.departamentos.includes(String(d.iddepartamento)))
      .map((d) => d.nombre)
      .join(", ");
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
                  <div className="bg-gray-100 px-4 pt-3 pb-2">
                    <input
                      value={formData[field.key]}
                      onChange={(e) => handleChange(field.key, e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-[#5B6670] placeholder:text-[#b5bcc2]"
                      placeholder={field.placeholder}
                    />
                  </div>
                  <div className="h-[1px] bg-[#5B6670] mt-[1px] w-full" />
                </div>
              </div>
            ))}

            <div>
              <label className="block text-sm font-bold text-[#323E48] mb-2">
                Departamentos impactados
              </label>

              <div className="w-[70%] relative" ref={dropdownRef}>
                <div className="bg-gray-100 px-4 pt-3 pb-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-[#5B6670] min-h-[24px] flex items-center">
                      {getDepartamentosSeleccionados() ||
                        (loadingDepartamentos ? "Cargando departamentos..." : "")}
                    </span>

                    <button
                      type="button"
                      onClick={() => setOpenDep((prev) => !prev)}
                      className="ml-3 shrink-0 text-[#5B6670] hover:text-black"
                    >
                      <ChevronDown
                        size={22}
                        className={`transition-transform duration-200 ${openDep ? "rotate-180" : ""
                          }`}
                      />
                    </button>
                  </div>
                </div>

                <div className="h-[1px] bg-[#5B6670] mt-[1px] w-full" />

                {openDep && (
                  <div className="absolute left-0 top-[calc(100%+8px)] w-full bg-gray-100 rounded-md py-3 shadow-md max-h-40 overflow-y-auto z-50">
                    {departamentos.length === 0 && !loadingDepartamentos ? (
                      <div className="px-4 py-2 text-sm text-[#5B6670]">
                        No hay departamentos disponibles
                      </div>
                    ) : (
                      departamentos.map((dep) => {
                        const depId = String(dep.iddepartamento);
                        const selected = formData.departamentos.includes(depId);

                        return (
                          <button
                            type="button"
                            key={dep.iddepartamento}
                            onClick={() => toggleDepartamento(depId)}
                            className={`w-full text-left px-4 py-[7px] text-sm transition flex items-center justify-between ${selected
                                ? "bg-gray-200 text-[#323E48] font-semibold"
                                : "text-[#5B6670] hover:bg-gray-200"
                              }`}
                          >
                            <span>{dep.nombre}</span>
                            {selected && <span>✓</span>}
                          </button>
                        );
                      })
                    )}
                  </div>
                )}
              </div>
            </div>
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
                  className="w-full bg-transparent outline-none text-sm text-[#5B6670] placeholder:text-[#b5bcc2]"
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
              disabled={loadingSession || submittingProject || !isFormValid} // <- deshabilitar el botón si se está cargando la sesión, si se está enviando el proyecto o si el formulario no es válido
              className="px-7 py-3 rounded-xl text-white font-semibold hover:opacity-90 transition disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ backgroundColor: "#EB0029" }}
            >

              {submittingProject ? "Creando proyecto..." : "Continuar"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}


{/* COMO AGREGAR MODAL

  ya al final, antes de cerrar el section y agregar arriba el import:
  import FormModal from "@/components/FormModal";

 <FormModal
  isOpen={showLoginModal}
  tempUserId={tempUserId}
  setTempUserId={setTempUserId}
  loadingSession={loadingSession}
  onClose={() => setShowLoginModal(false)}
  onSubmit={createSession}
/>
    </section>

    */}