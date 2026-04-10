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
}

export default function ProyectosDashboard() {
  const userId = sessionStorage.getItem("chat_user_id");
  const [proyectos, setProyectos] = useState<Proyecto[]>([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState<string>("Usuario");

  // Filtros
  const [filtroFolio, setFiltroFolio] = useState("");
  const [filtroNombre, setFiltroNombre] = useState("");
  const [filtroFecha, setFiltroFecha] = useState("");
  const [filtroArea, setFiltroArea] = useState("");

  useEffect(() => {
    const loadUser = () => {
      const savedUser = sessionStorage.getItem("chat_user_id");
      setUserName(savedUser || "Usuario");
    };

    const handleUserUpdate = (event: Event) => {
      const customEvent = event as CustomEvent<{ userId: string }>;
      setUserName(customEvent.detail?.userId || "Usuario");
    };

    loadUser();
    window.addEventListener("chat-user-updated", handleUserUpdate);
    return () => window.removeEventListener("chat-user-updated", handleUserUpdate);
  }, []);

  useEffect(() => {
    const fetchProyectos = async () => {
      try {
        const res = await fetch(
        `http://127.0.0.1:8000/usuarios/${userId}/proyectos`,
        {
          headers: { accept: "application/json" },
          cache: "no-store",
        }
      );

        if (!res.ok) throw new Error("Error al obtener proyectos");

        const data = await res.json();
        setProyectos(data);
      } catch (error) {
        console.error("Error cargando proyectos:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProyectos();
  }, []);

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
      <aside className="flex h-full w-72 flex-shrink-0 flex-col gap-4 bg-white px-5 py-6 shadow-sm">

        {/* Header */}
        <div>
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-[#EB0029]">Mis Proyectos</h1>
            <Home
              size={28}
              className="cursor-pointer rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-[#EB0029]"
            />
          </div>
          <div className="mt-1 h-[2px] w-full bg-[#EB0029]" />
        </div>

        {/* Avatar */}
        <div className="flex flex-col items-center py-2">
          <div className="mb-2 flex h-24 w-24 items-center justify-center overflow-hidden rounded-full bg-gray-100 shadow">
            <svg viewBox="0 0 100 100" className="h-full w-full">
              <circle cx="50" cy="50" r="50" fill="#e8e8e8" />
              <ellipse cx="50" cy="85" rx="28" ry="20" fill="#2c3e6b" />
              <rect x="43" y="65" width="14" height="15" rx="2" fill="white" />
              <polygon points="50,67 47,72 50,85 53,72" fill="#EB0029" />
              <ellipse cx="50" cy="40" rx="18" ry="20" fill="#f5c9a0" />
              <ellipse cx="50" cy="24" rx="18" ry="10" fill="#2c3e6b" />
              <rect x="32" y="24" width="36" height="8" fill="#2c3e6b" />
            </svg>
          </div>
          <p className="text-lg font-bold text-gray-700">{userName.split("_")[0]}</p>
        </div>

        {/* Filtros */}
        <div className="flex items-center gap-2 text-sm font-semibold text-gray-500">
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