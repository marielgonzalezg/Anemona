"use client";

import { useEffect, useState } from "react";
import { Home, File as FileIcon, Filter, Calendar } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Proyecto {
  folio: number;
  nombreproyecto: string;
  fechacreacion: string;
  departamento: string;
  session_id: string;
  id_firestore_document?: string;
}

export default function ProyectosDashboard() {
  
  const [idusuario, setIdUsuario] = useState<string | null>(() => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("idusuario")?.trim() || null;
});

const [nombre, setNombre] = useState<string | null>(() => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("nombre");
});

const [apellidopaterno, setapellidopaterno] = useState<string | null>(() => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("apellidopaterno");
});


  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Usuario");
  const router = useRouter();

  // Filtros
  const [filtroFolio, setFiltroFolio] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroArea, setFiltroArea] = useState("");

  const limpiarFiltros = () => {
  setFiltroFolio("");
  setFiltroNombre("");
  setFiltroFecha("");
  setFiltroArea("");
};

  const handleOpenProjectChat = (project: Proyecto) => {
  const loggedUserId = localStorage.getItem("idusuario")?.trim() || "";

  sessionStorage.setItem("chat_user_id", loggedUserId);
  sessionStorage.setItem("chat_session_id", project.session_id);

  if (project.id_firestore_document) {
    sessionStorage.setItem("project_id", project.id_firestore_document);
  } else {
    sessionStorage.removeItem("project_id");
  }

  // Pasar session_id como query param para forzar cambio de ruta
  router.push(`/dashboard?session=${project.session_id}`);
};

    const handleUserUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ idusuario: string }>;
      setUserName(customEvent.detail?.idusuario || "Usuario");
    };


  useEffect(() => {
  if (!idusuario) return;

  setLoading(true);

  const fetchProyectos = async () => {
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/usuarios/${idusuario}/proyectos`
      );

      const data = await res.json();
      console.log("DATA:", data);

      setProyectos(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  fetchProyectos();
}, [idusuario]);

  const formatDate = (isoDate: string) => {
    if (!isoDate) return "";
    const d = new Date(isoDate);
    return d.toLocaleDateString("es-MX", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const proyectosFiltrados = proyectos.filter((p) => {
    const folioStr = String(p.folio).toLowerCase();
    return (
      (!filtroFolio || folioStr.includes(filtroFolio.toLowerCase())) &&
      (!filtroNombre || p.nombreproyecto.toLowerCase().includes(filtroNombre.toLowerCase())) &&
      (!filtroArea || p.departamento?.toLowerCase().includes(filtroArea.toLowerCase())) &&
      (!filtroFecha || p.fechacreacion?.startsWith(filtroFecha))
    );
  });


  return (
    <div className="flex h-screen w-full bg-gray-100">

      {/* ── SIDEBAR ── */}
      <aside className="flex h-full w-90 flex-shrink-0 flex-col bg-white px-5 py-6 shadow-sm">
       

        {/* Header */}
        <div>
          <div className="flex items-center justify-between pt-5">
            <h1 className="text-2xl font-bold text-[#EB0029]">Mis Proyectos</h1>
            <Home
            size={30}
            onClick={() => window.location.href = "/dashboard"} 
            className="text-gray-500 hover:text-[#EB0029] hover:bg-gray-100 p-1 rounded cursor-pointer transition"
          />
          </div>
          <div className="mt-1 h-[2px] w-full bg-[#EB0029]" />
        </div>

        {/* PERFIL */}
      <div className="flex flex-col items-center my-6 pt-10">
        <div className="w-28 h-28 rounded-full bg-gray-100 shadow-md flex items-center justify-center overflow-hidden mb-3">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            <circle cx="50" cy="50" r="50" fill="#e8e8e8" />
            <ellipse cx="50" cy="85" rx="28" ry="20" fill="#2c3e6b" />
            <rect x="43" y="65" width="14" height="15" rx="2" fill="white" />
            <polygon points="50,67 47,72 50,85 53,72" fill="#EB0029" />
            <ellipse cx="50" cy="40" rx="18" ry="20" fill="#f5c9a0" />
            <ellipse cx="50" cy="24" rx="18" ry="10" fill="#2c3e6b" />
            <rect x="32" y="24" width="36" height="8" fill="#2c3e6b" />
          </svg>
        </div>
          <p className="text-xl font-bold text-gray-700 pb-5">
          {`${nombre?.split("_")[0] || ""} ${apellidopaterno || ""}`}
        </p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 py-5">
          <Filter size={14} />
          Filtrar
        </div>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs text-gray-500">Folio</label>
            <input
              type="text"
              placeholder="3254673026"
              value={filtroFolio}
              onChange={(e) => setFiltroFolio(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#EB0029]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Nombre de Proyecto</label>
            <input
              type="text"
              placeholder="ProyectoIA"
              value={filtroNombre}
              onChange={(e) => setFiltroNombre(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#EB0029]"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Fecha</label>
            <div className="relative">
              <input
                type="date"
                value={filtroFecha}
                onChange={(e) => setFiltroFecha(e.target.value)}
                className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#EB0029]"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-gray-500">Área</label>
            <input
              type="text"
              placeholder="TI"
              value={filtroArea}
              onChange={(e) => setFiltroArea(e.target.value)}
              className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm outline-none focus:border-[#EB0029]"
            />
          </div>
        </div>

        <button
        onClick={limpiarFiltros}
        className="bg-[#EB0029] text-white font-semibold text-xs px-3 py-2 rounded-md hover:bg-red-700 transition mt-10"
      >
        Limpiar
      </button>

        {/* Logo */}
        <div className="mt-auto flex justify-center pt-4">
          <img src="/images/banortelogo.png" alt="Banorte" className="h-12" />
        </div>
      </aside>

      {/* ── MAIN GRID ── */}
      <main className="flex flex-1 flex-col overflow-hidden p-6">
        {loading ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            Cargando proyectos...
          </div>
        ) : proyectosFiltrados.length === 0 ? (
          <div className="flex h-full items-center justify-center text-sm text-gray-400">
            No se encontraron proyectos con los filtros aplicados.
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-4 overflow-y-auto pr-1">
            {proyectosFiltrados.map((proyecto) => (
              <div
                key={proyecto.folio}
                onClick={() => handleOpenProjectChat(proyecto)}
                className="group cursor-pointer rounded-xl bg-white p-4 shadow-sm transition hover:shadow-md hover:ring-1 hover:ring-[#EB0029]/40"
              >
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-[#EB0029]">
                    <FileIcon size={14} strokeWidth={2.5} className="text-white" />
                  </div>
                  <span className="truncate text-sm font-semibold text-[#EB0029]">
                    {proyecto.folio}
                  </span>
                </div>

                <p className="truncate text-sm font-medium text-gray-800">
                  {proyecto.nombreproyecto}
                </p>

                <p className="mt-1 text-xs text-gray-500">{proyecto.departamento}</p>

                <p className="mt-2 text-[11px] text-gray-400">
                  {formatDate(proyecto.fechacreacion)}
                </p>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}