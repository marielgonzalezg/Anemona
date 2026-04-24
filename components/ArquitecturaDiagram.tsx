"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RefreshCw, Loader2, Download } from "lucide-react";

interface Nodo {
  id: string;
  label: string;
  tipo?: string;
  x?: number;
  y?: number;
}

interface Arista {
  source: string;
  target: string;
  label?: string;
}

interface ArquitecturaData {
  nodes: Nodo[];
  edges: Arista[];
}

const COLORS: Record<string, string> = {
  frontend:        "#DBEAFE",
  backend:         "#EDE9FE",
  database:        "#FEF3C7",
  api:             "#D1FAE5",
  service:         "#FCE7F3",
  core_system:     "#E0F2FE",
  workflow_service:"#F0FDF4",
  business_module: "#FFF7ED",
  document_service:"#F5F3FF",
  ai_service:      "#FDF4FF",
  rules_engine:    "#ECFDF5",
  security_integration: "#FEF2F2",
  integration_hub: "#EFF6FF",
  external_system: "#F8FAFC",
  internal_system: "#F1F5F9",
  default:         "#F8FAFC",
};

const BORDER_COLORS: Record<string, string> = {
  frontend:        "#93C5FD",
  backend:         "#C4B5FD",
  database:        "#FCD34D",
  api:             "#6EE7B7",
  service:         "#F9A8D4",
  core_system:     "#7DD3FC",
  workflow_service:"#86EFAC",
  business_module: "#FCA5A5",
  document_service:"#DDD6FE",
  ai_service:      "#E879F9",
  rules_engine:    "#34D399",
  security_integration: "#FCA5A5",
  integration_hub: "#93C5FD",
  external_system: "#94A3B8",
  internal_system: "#CBD5E1",
  default:         "#CBD5E1",
};

const TEXT_COLORS: Record<string, string> = {
  frontend:        "#1E40AF",
  backend:         "#4C1D95",
  database:        "#78350F",
  api:             "#064E3B",
  service:         "#831843",
  core_system:     "#0C4A6E",
  workflow_service:"#14532D",
  business_module: "#7C2D12",
  document_service:"#3B0764",
  ai_service:      "#581C87",
  rules_engine:    "#064E3B",
  security_integration: "#7F1D1D",
  integration_hub: "#1E3A5F",
  external_system: "#334155",
  internal_system: "#334155",
  default:         "#334155",
};

function getColor(tipo?: string, map = COLORS) {
  if (!tipo) return map.default;
  const key = tipo.toLowerCase().replace(/\s+/g, "_");
  return map[key] ?? map.default;
}

// Nodos más anchos y altos para que el texto quepa sin truncar
const NODE_W = 170;
const NODE_H = 64;
const GAP_X = 24;
const GAP_Y = 100;
const MAX_PER_ROW = 4;
const CANVAS_W = MAX_PER_ROW * NODE_W + (MAX_PER_ROW - 1) * GAP_X + 40; // 740

function layoutNodes(nodes: Nodo[]): Nodo[] {
  const layerOrder = ["frontend", "api", "backend", "service", "database"];
  const layers: Record<string, Nodo[]> = {};
  layerOrder.forEach((k) => (layers[k] = []));
  const unknownNodes: Nodo[] = [];

  nodes.forEach((n) => {
    const key = n.tipo?.toLowerCase().replace(/\s+/g, "_") ?? "";
    if (layerOrder.includes(key)) layers[key].push(n);
    else unknownNodes.push(n);
  });

  const result: Nodo[] = [];
  let currentRow = 0;

  const placeLayer = (layer: Nodo[]) => {
    if (layer.length === 0) return;
    for (let i = 0; i < layer.length; i += MAX_PER_ROW) {
      const rowNodes = layer.slice(i, i + MAX_PER_ROW);
      const totalW = rowNodes.length * NODE_W + (rowNodes.length - 1) * GAP_X;
      const startX = (CANVAS_W - totalW) / 2;
      rowNodes.forEach((node, colIndex) => {
        result.push({
          ...node,
          x: startX + colIndex * (NODE_W + GAP_X),
          y: 30 + currentRow * (NODE_H + GAP_Y),
        });
      });
      currentRow++;
    }
  };

  layerOrder.forEach((k) => placeLayer(layers[k]));
  placeLayer(unknownNodes);

  return result;
}

// Trunca en múltiples líneas si el label es largo
function splitLabel(label: string, maxChars = 20): [string, string] {
  if (label.length <= maxChars) return [label, ""];
  const mid = label.lastIndexOf(" ", maxChars);
  if (mid < 6) return [label.slice(0, maxChars - 1) + "…", ""];
  return [label.slice(0, mid), label.slice(mid + 1).length > maxChars ? label.slice(mid + 1, mid + maxChars) + "…" : label.slice(mid + 1)];
}

function buildPath(
  src: Nodo, tgt: Nodo, i: number
): { d: string; mx: number; my: number } {
  const x1 = (src.x ?? 0) + NODE_W / 2;
  const y1 = (src.y ?? 0) + NODE_H;
  const x2 = (tgt.x ?? 0) + NODE_W / 2;
  const y2 = (tgt.y ?? 0);

  // Lane offset: separa líneas paralelas desplazando el segmento horizontal
  const laneOffset = ((i % 9) - 4) * 12;

  const goingUp = y2 < (src.y ?? 0);

  if (goingUp) {
    // Ruta por el lado derecho, fuera del canvas
    const exitX = CANVAS_W + 20 + (i % 5) * 18;
    const srcMidY = (src.y ?? 0) + NODE_H / 2;
    const tgtMidY = (tgt.y ?? 0) + NODE_H / 2;
    return {
      d: `M ${x1} ${(src.y ?? 0) + NODE_H / 2} L ${exitX} ${srcMidY} L ${exitX} ${tgtMidY} L ${x2} ${tgtMidY}`,
      mx: exitX + 6,
      my: (srcMidY + tgtMidY) / 2,
    };
  }

  // Ruta ortogonal hacia abajo con quiebre en midY + laneOffset
  const midY = y1 + (y2 - y1) / 2;
  const bendX = x1 + laneOffset;
  const destX = x2 + laneOffset;

  return {
    d: `M ${x1} ${y1} L ${x1} ${midY} L ${destX} ${midY} L ${destX} ${y2} L ${x2} ${y2}`,
    mx: (x1 + x2) / 2 + laneOffset / 2,
    my: midY - 8,
  };
}

interface ArquitecturaSVGProps extends ArquitecturaData {
  svgRef?: React.RefObject<SVGSVGElement>;
}

function ArquitecturaSVG({ nodes, edges, svgRef }: ArquitecturaSVGProps) {
  const laid = layoutNodes(nodes);
  const nodeMap = Object.fromEntries(laid.map((n) => [n.id, n]));
  const maxY = Math.max(...laid.map((n) => (n.y ?? 0) + NODE_H)) + 40;

  const renderedEdges = edges.map((e, i) => {
    const src = nodeMap[e.source];
    const tgt = nodeMap[e.target];
    if (!src || !tgt) return null;
    const { d, mx, my } = buildPath(src, tgt, i);
    return { d, label: e.label, mx, my, key: i };
  });

  return (
    <svg
      ref={svgRef}
      width="100%"
      viewBox={`0 0 ${CANVAS_W} ${maxY}`}
      style={{ display: "block" }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <marker
          id="arq-arrow"
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="6"
          markerHeight="6"
          orient="auto-start-reverse"
        >
          <path
            d="M2 1L8 5L2 9"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </marker>
      </defs>

      {/* Fondo blanco para descarga limpia */}
      <rect width={CANVAS_W} height={maxY} fill="white" />

      {/* Aristas primero (detrás de los nodos) */}
      {renderedEdges.map((e) => {
        if (!e) return null;
        const labelW = e.label ? Math.min(e.label.length, 22) * 5.5 + 10 : 0;
        return (
          <g key={e.key}>
            <path
              d={e.d}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth="1.5"
              markerEnd="url(#arq-arrow)"
            />
            {e.label && (
              <>
                <rect
                  x={e.mx - labelW / 2}
                  y={e.my - 11}
                  width={labelW}
                  height={13}
                  rx={3}
                  fill="white"
                  stroke="#E2E8F0"
                  strokeWidth="0.5"
                />
                <text
                  x={e.mx}
                  y={e.my}
                  textAnchor="middle"
                  fontSize="9"
                  fill="#94A3B8"
                  fontFamily="system-ui, sans-serif"
                >
                  {e.label.length > 22 ? e.label.slice(0, 21) + "…" : e.label}
                </text>
              </>
            )}
          </g>
        );
      })}

      {/* Nodos encima */}
      {laid.map((n) => {
        const [line1, line2] = splitLabel(n.label, 20);
        const hasTipo = !!n.tipo;
        const textY1 = hasTipo
          ? (n.y ?? 0) + (line2 ? 34 : 40)
          : (n.y ?? 0) + (line2 ? 26 : NODE_H / 2);
        const textY2 = textY1 + 15;

        return (
          <g key={n.id}>
            {/* Sombra sutil */}
            <rect
              x={(n.x ?? 0) + 2}
              y={(n.y ?? 0) + 3}
              width={NODE_W}
              height={NODE_H}
              rx={10}
              fill="#00000010"
            />
            {/* Cuerpo */}
            <rect
              x={n.x}
              y={n.y}
              width={NODE_W}
              height={NODE_H}
              rx={10}
              fill={getColor(n.tipo, COLORS)}
              stroke={getColor(n.tipo, BORDER_COLORS)}
              strokeWidth={1}
            />
            {/* Badge de tipo */}
            {hasTipo && (
              <text
                x={(n.x ?? 0) + NODE_W / 2}
                y={(n.y ?? 0) + 15}
                textAnchor="middle"
                fontSize="8"
                fill={getColor(n.tipo, TEXT_COLORS)}
                fontWeight={600}
                fontFamily="system-ui, sans-serif"
                style={{ textTransform: "uppercase", letterSpacing: "0.08em" }}
              >
                {n.tipo!.length > 18 ? n.tipo!.slice(0, 17) + "…" : n.tipo}
              </text>
            )}
            {/* Label línea 1 */}
            <text
              x={(n.x ?? 0) + NODE_W / 2}
              y={textY1}
              textAnchor="middle"
              dominantBaseline="central"
              fontSize="12"
              fontWeight={600}
              fill={getColor(n.tipo, TEXT_COLORS)}
              fontFamily="system-ui, sans-serif"
            >
              {line1}
            </text>
            {/* Label línea 2 si existe */}
            {line2 && (
              <text
                x={(n.x ?? 0) + NODE_W / 2}
                y={textY2}
                textAnchor="middle"
                dominantBaseline="central"
                fontSize="12"
                fontWeight={600}
                fill={getColor(n.tipo, TEXT_COLORS)}
                fontFamily="system-ui, sans-serif"
              >
                {line2}
              </text>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export default function ArquitecturaDiagram() {
  const [data, setData] = useState<ArquitecturaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const getIds = () => ({
    projectId: typeof window !== "undefined" ? sessionStorage.getItem("project_id") ?? "" : "",
    sessionId: typeof window !== "undefined" ? sessionStorage.getItem("session_id") ?? "" : "",
  });

  const fetchArquitectura = useCallback(async () => {
    const { projectId } = getIds();
    if (!projectId) { setLoading(false); return; }
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/firestore/arquitectura?doc_id=${encodeURIComponent(projectId)}`,
        { cache: "no-store" }
      );
      if (!res.ok) throw new Error("Error al cargar arquitectura");
      const json = await res.json();
      if (json.ok) {
        setData({
          nodes: (json.nodes ?? []).map((n: any) => ({ id: n.id, label: n.label, tipo: n.type })),
          edges: (json.edges ?? []).map((e: any) => ({ source: e.from, target: e.to, label: e.label })),
        });
        setError(null);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchArquitectura();
    pollRef.current = setInterval(fetchArquitectura, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchArquitectura]);

  const handleGenerar = async () => {
    const { sessionId } = getIds();
    if (!sessionId) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch(
        `http://127.0.0.1:8000/firestore/generar-arquitectura?session_id=${encodeURIComponent(sessionId)}`,
        { method: "POST" }
      );
      if (!res.ok) throw new Error("Error al generar arquitectura");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setGenerating(false);
    }
  };

  const handleDownload = () => {
    if (!svgRef.current) return;
    const serializer = new XMLSerializer();
    const svgStr = serializer.serializeToString(svgRef.current);
    const blob = new Blob([svgStr], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "arquitectura.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const isEmpty = !data || (data.nodes.length === 0 && data.edges.length === 0);

  return (
    <div className="flex h-full flex-col gap-3">
      {/* Toolbar */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-400">
          Diagrama de arquitectura
        </span>
        <div className="flex items-center gap-2">
          {!isEmpty && (
            <button
              onClick={handleDownload}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50"
            >
              <Download size={11} />
              SVG
            </button>
          )}
          <button
            onClick={handleGenerar}
            disabled={generating}
            className="flex items-center gap-1.5 rounded-full bg-[#EB0029] px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-[#c8001f] disabled:opacity-60"
          >
            {generating ? <Loader2 size={12} className="animate-spin" /> : <RefreshCw size={12} />}
            {generating ? "Generando…" : "Generar arquitectura"}
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative flex min-h-0 flex-1 items-center justify-center overflow-auto rounded-xl bg-white shadow-inner">
        {loading && (
          <div className="flex flex-col items-center gap-2 text-sm text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            Cargando diagrama…
          </div>
        )}

        {!loading && error && <p className="text-sm text-red-500">{error}</p>}

        {!loading && !error && isEmpty && (
          <div className="flex flex-col items-center gap-3 text-center text-sm text-gray-400">
            <p>No hay nodos todavía.</p>
            <p className="text-xs">
              Presiona <strong>Generar arquitectura</strong> para que el agente cree el diagrama.
            </p>
          </div>
        )}

        {!loading && !error && !isEmpty && (
          <div className="w-full h-full p-4 overflow-auto">
            <ArquitecturaSVG nodes={data!.nodes} edges={data!.edges} />
          </div>
        )}

        {generating && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/70 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-2 text-sm text-gray-500">
              <Loader2 size={24} className="animate-spin text-[#EB0029]" />
              El agente está generando la arquitectura…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}