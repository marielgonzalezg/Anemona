"use client";

import { useCallback, useEffect, useRef, useState, type PointerEvent } from "react";
import { RefreshCw, Loader2, Download, ZoomIn, ZoomOut, Maximize2 } from "lucide-react";

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

// ── Color palette ──────────────────────────────────────────────
const PALETTE: Record<string, { bg: string; border: string; text: string; badge: string }> = {
  frontend:             { bg: "#EFF6FF", border: "#3B82F6", text: "#1D4ED8", badge: "#DBEAFE" },
  backend:              { bg: "#F5F3FF", border: "#7C3AED", text: "#5B21B6", badge: "#EDE9FE" },
  database:             { bg: "#FFFBEB", border: "#D97706", text: "#92400E", badge: "#FEF3C7" },
  api:                  { bg: "#ECFDF5", border: "#059669", text: "#065F46", badge: "#D1FAE5" },
  service:              { bg: "#FFF1F2", border: "#E11D48", text: "#9F1239", badge: "#FFE4E6" },
  core_system:          { bg: "#F0F9FF", border: "#0284C7", text: "#0C4A6E", badge: "#E0F2FE" },
  workflow_service:     { bg: "#F0FDF4", border: "#16A34A", text: "#14532D", badge: "#DCFCE7" },
  business_module:      { bg: "#FFF7ED", border: "#EA580C", text: "#7C2D12", badge: "#FFEDD5" },
  document_service:     { bg: "#FAF5FF", border: "#9333EA", text: "#3B0764", badge: "#F3E8FF" },
  document_store:       { bg: "#FAF5FF", border: "#9333EA", text: "#3B0764", badge: "#F3E8FF" },
  ai_service:           { bg: "#FDF4FF", border: "#C026D3", text: "#701A75", badge: "#FAE8FF" },
  rules_engine:         { bg: "#F0FDF4", border: "#059669", text: "#064E3B", badge: "#DCFCE7" },
  security_integration: { bg: "#FFF1F2", border: "#DC2626", text: "#7F1D1D", badge: "#FEE2E2" },
  integration_hub:      { bg: "#EFF6FF", border: "#2563EB", text: "#1E3A5F", badge: "#DBEAFE" },
  external_system:      { bg: "#F8FAFC", border: "#64748B", text: "#334155", badge: "#F1F5F9" },
  internal_system:      { bg: "#F1F5F9", border: "#94A3B8", text: "#334155", badge: "#E2E8F0" },
  channel:              { bg: "#F8FAFC", border: "#94A3B8", text: "#334155", badge: "#E2E8F0" },
  default:              { bg: "#F8FAFC", border: "#CBD5E1", text: "#334155", badge: "#E2E8F0" },
};

function getPalette(tipo?: string) {
  if (!tipo) return PALETTE.default;
  const key = tipo.toLowerCase().replace(/[\s-]+/g, "_");
  return PALETTE[key] ?? PALETTE.default;
}

// ── Layout ─────────────────────────────────────────────────────
const NODE_W = 180;
const NODE_H = 72;
const COL_GAP = 48;
const ROW_GAP = 90;
const COLS = 4;
const PAD = 40;

function layoutNodes(nodes: Nodo[]): Nodo[] {
  const LAYER_ORDER = [
    "frontend", "channel", "api",
    "core_system", "backend", "integration_hub",
    "ai_service", "workflow_service", "service",
    "rules_engine", "business_module", "document_service", "document_store",
    "security_integration", "database",
    "external_system", "internal_system",
  ];

  const buckets: Record<string, Nodo[]> = {};
  const others: Nodo[] = [];

  nodes.forEach((n) => {
    const key = n.tipo?.toLowerCase().replace(/[\s-]+/g, "_") ?? "";
    if (LAYER_ORDER.includes(key)) {
      buckets[key] = buckets[key] ?? [];
      buckets[key].push(n);
    } else {
      others.push(n);
    }
  });

  const ordered: Nodo[] = [];
  LAYER_ORDER.forEach((k) => { if (buckets[k]) ordered.push(...buckets[k]); });
  ordered.push(...others);

  return ordered.map((n, i) => {
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    return {
      ...n,
      x: PAD + col * (NODE_W + COL_GAP),
      y: PAD + row * (NODE_H + ROW_GAP),
    };
  });
}

function canvasSize(nodes: Nodo[]) {
  const maxX = Math.max(...nodes.map((n) => (n.x ?? 0) + NODE_W)) + PAD;
  const maxY = Math.max(...nodes.map((n) => (n.y ?? 0) + NODE_H)) + PAD;
  return { w: maxX, h: maxY };
}

// ── Edge routing ───────────────────────────────────────────────
function edgePath(src: Nodo, tgt: Nodo): string {
  const x1 = (src.x ?? 0) + NODE_W / 2;
  const y1 = (src.y ?? 0) + NODE_H;
  const x2 = (tgt.x ?? 0) + NODE_W / 2;
  const y2 = tgt.y ?? 0;

  if (Math.abs(y2 - y1) < 20) {
    // Horizontal connection
    const lx1 = (src.x ?? 0) + NODE_W;
    const lx2 = tgt.x ?? 0;
    const my = (src.y ?? 0) + NODE_H / 2;
    return `M ${lx1} ${my} L ${lx2} ${my}`;
  }

  const my = (y1 + y2) / 2;
  return `M ${x1} ${y1} C ${x1} ${my}, ${x2} ${my}, ${x2} ${y2}`;
}

function edgeMidpoint(src: Nodo, tgt: Nodo): { mx: number; my: number } {
  const x1 = (src.x ?? 0) + NODE_W / 2;
  const y1 = (src.y ?? 0) + NODE_H / 2;
  const x2 = (tgt.x ?? 0) + NODE_W / 2;
  const y2 = (tgt.y ?? 0) + NODE_H / 2;
  return { mx: (x1 + x2) / 2, my: (y1 + y2) / 2 };
}

// ── Wrap text ──────────────────────────────────────────────────
function wrapLabel(label: string): [string, string] {
  const MAX = 22;
  if (label.length <= MAX) return [label, ""];
  const cut = label.lastIndexOf(" ", MAX);
  if (cut < 4) return [label.slice(0, MAX - 1) + "…", ""];
  const rest = label.slice(cut + 1);
  return [label.slice(0, cut), rest.length > MAX ? rest.slice(0, MAX - 1) + "…" : rest];
}

// ── SVG Diagram (draggable) ────────────────────────────────────
interface DiagramProps extends ArquitecturaData {
  svgRef: React.RefObject<SVGSVGElement | null>;
}

function Diagram({ nodes: rawNodes, edges, svgRef }: DiagramProps) {
  // Persists manually-dragged positions keyed by node id.
  // Never reset by polling — only cleared on explicit "Reset layout".
  const positionsRef = useRef<Record<string, { x: number; y: number }>>({});

  const buildNodes = useCallback((raw: Nodo[]): Nodo[] => {
    const laid = layoutNodes(raw);
    return laid.map((n) => {
      const saved = positionsRef.current[n.id];
      return saved ? { ...n, ...saved } : n;
    });
  }, []);

  const [nodes, setNodes] = useState<Nodo[]>(() => buildNodes(rawNodes));
  const [zoom, setZoom] = useState(1);
  const dragging = useRef<{ id: string; ox: number; oy: number } | null>(null);

  // Sync when rawNodes change (new nodes from server), but KEEP saved positions.
  const prevIdsRef = useRef<string>("");
  useEffect(() => {
    const newIds = rawNodes.map((n) => n.id).sort().join(",");
    if (newIds === prevIdsRef.current) return; // same nodes → skip reset
    prevIdsRef.current = newIds;
    setNodes(buildNodes(rawNodes));
  }, [rawNodes, buildNodes]);

  const { w, h } = canvasSize(nodes);
  const nodeMap = Object.fromEntries(nodes.map((n) => [n.id, n]));

  // ── Pointer events for drag ──
  const onPointerDown = (e: PointerEvent<SVGGElement>, id: string) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    const svgEl = svgRef.current!;
    const pt = svgEl.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svgEl.getScreenCTM()!.inverse());
    const node = nodes.find((n) => n.id === id)!;
    dragging.current = {
      id,
      ox: svgPt.x - (node.x ?? 0),
      oy: svgPt.y - (node.y ?? 0),
    };
  };

  const onPointerMove = (e: PointerEvent<SVGGElement>) => {
    if (!dragging.current) return;
    const svgEl = svgRef.current!;
    const pt = svgEl.createSVGPoint();
    pt.x = e.clientX; pt.y = e.clientY;
    const svgPt = pt.matrixTransform(svgEl.getScreenCTM()!.inverse());
    const { id, ox, oy } = dragging.current;
    const nx = Math.max(0, svgPt.x - ox);
    const ny = Math.max(0, svgPt.y - oy);
    positionsRef.current[id] = { x: nx, y: ny };
    setNodes((prev) =>
      prev.map((n) => (n.id === id ? { ...n, x: nx, y: ny } : n))
    );
  };

  const onPointerUp = (e: PointerEvent<SVGGElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    dragging.current = null;
  };

  const resetLayout = () => {
    positionsRef.current = {};
    setNodes(layoutNodes(rawNodes));
  };

  return (
    <div className="flex flex-col h-full gap-2">
      {/* Mini toolbar inside canvas */}
      <div className="flex items-center gap-1.5 px-1">
        <button
          onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          title="Zoom in"
        >
          <ZoomIn size={14} />
        </button>
        <button
          onClick={() => setZoom((z) => Math.max(0.3, z - 0.15))}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          title="Zoom out"
        >
          <ZoomOut size={14} />
        </button>
        <button
          onClick={resetLayout}
          className="p-1.5 rounded-lg hover:bg-gray-100 text-gray-500 transition-colors"
          title="Reset layout"
        >
          <Maximize2 size={14} />
        </button>
        <span className="text-[10px] text-gray-400 ml-1">
          {Math.round(zoom * 100)}% · Arrastra los nodos para reorganizar
        </span>
      </div>

      {/* SVG Canvas */}
      <div className="flex-1 overflow-auto rounded-xl border border-gray-100 bg-[#FAFAFA]"
        style={{ backgroundImage: "radial-gradient(circle, #e2e8f0 1px, transparent 1px)", backgroundSize: "24px 24px" }}
      >
        <svg
          ref={svgRef}
          width={w * zoom}
          height={h * zoom}
          viewBox={`0 0 ${w} ${h}`}
          xmlns="http://www.w3.org/2000/svg"
          style={{ display: "block", cursor: "default" }}
        >
          <defs>
            <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5"
              markerWidth="5" markerHeight="5" orient="auto-start-reverse">
              <path d="M1 2 L8 5 L1 8" fill="none" stroke="#94A3B8"
                strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </marker>
            <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
              <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#00000014" />
            </filter>
          </defs>

          {/* White background for clean SVG download */}
          <rect width={w} height={h} fill="white" />

          {/* Edges */}
          <g>
            {edges.map((e, i) => {
              const src = nodeMap[e.source];
              const tgt = nodeMap[e.target];
              if (!src || !tgt) return null;
              const d = edgePath(src, tgt);
              const { mx, my } = edgeMidpoint(src, tgt);
              return (
                <g key={i}>
                  <path d={d} fill="none" stroke="#CBD5E1" strokeWidth="1.5"
                    strokeDasharray="none" markerEnd="url(#arr)" />
                  {e.label && (
                    <g>
                      <rect
                        x={mx - (e.label.length * 3.5 + 8) / 2}
                        y={my - 9}
                        width={e.label.length * 3.5 + 8}
                        height={14}
                        rx={4}
                        fill="white"
                        stroke="#E2E8F0"
                        strokeWidth="0.5"
                      />
                      <text x={mx} y={my + 1} textAnchor="middle"
                        fontSize="8" fill="#94A3B8" fontFamily="'DM Sans', system-ui, sans-serif">
                        {e.label.length > 24 ? e.label.slice(0, 23) + "…" : e.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}
          </g>

          {/* Nodes */}
          {nodes.map((n) => {
            const pal = getPalette(n.tipo);
            const [l1, l2] = wrapLabel(n.label);
            const cx = (n.x ?? 0) + NODE_W / 2;
            const baseY = n.y ?? 0;
            const textY = baseY + (n.tipo ? 42 : NODE_H / 2 + (l2 ? -6 : 0));

            return (
              <g
                key={n.id}
                style={{ cursor: "grab" }}
                onPointerDown={(e) => onPointerDown(e, n.id)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              >
                {/* Drop shadow rect */}
                <rect
                  x={(n.x ?? 0) + 1}
                  y={(n.y ?? 0) + 3}
                  width={NODE_W}
                  height={NODE_H}
                  rx={12}
                  fill="#00000012"
                  style={{ filter: "blur(3px)" }}
                />
                {/* Main box */}
                <rect
                  x={n.x}
                  y={n.y}
                  width={NODE_W}
                  height={NODE_H}
                  rx={12}
                  fill={pal.bg}
                  stroke={pal.border}
                  strokeWidth={1.5}
                />
                {/* Type badge pill */}
                {n.tipo && (
                  <>
                    <rect
                      x={cx - (Math.min(n.tipo.length, 16) * 4 + 10) / 2}
                      y={baseY + 10}
                      width={Math.min(n.tipo.length, 16) * 4 + 10}
                      height={13}
                      rx={6}
                      fill={pal.badge}
                    />
                    <text
                      x={cx}
                      y={baseY + 18}
                      textAnchor="middle"
                      fontSize="7.5"
                      fontWeight={700}
                      fill={pal.border}
                      fontFamily="'DM Mono', monospace, system-ui"
                      style={{ letterSpacing: "0.07em", textTransform: "uppercase" }}
                    >
                      {n.tipo.length > 16 ? n.tipo.slice(0, 15) + "…" : n.tipo.toUpperCase()}
                    </text>
                  </>
                )}
                {/* Label line 1 */}
                <text
                  x={cx}
                  y={textY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize="11.5"
                  fontWeight={600}
                  fill={pal.text}
                  fontFamily="'DM Sans', system-ui, sans-serif"
                >
                  {l1}
                </text>
                {/* Label line 2 */}
                {l2 && (
                  <text
                    x={cx}
                    y={textY + 15}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fontSize="11.5"
                    fontWeight={600}
                    fill={pal.text}
                    fontFamily="'DM Sans', system-ui, sans-serif"
                  >
                    {l2}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>
    </div>
  );
}

// ── Main export ────────────────────────────────────────────────
export default function ArquitecturaDiagram() {
  const [data, setData] = useState<ArquitecturaData | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const svgRef = useRef<SVGSVGElement | null>(null);

  const getIds = () => ({
    projectId: typeof window !== "undefined" ? sessionStorage.getItem("project_id") ?? "" : "",
    sessionId: typeof window !== "undefined" ? sessionStorage.getItem("session_id") ?? "" : "",
  });

  const fetchArquitectura = useCallback(async () => {
    const { projectId } = getIds();
    if (!projectId) { setLoading(false); return; }
    try {
      const res = await fetch(
        `https://api-anemona-637376850775.northamerica-northeast1.run.app/diagramaaqr/arquitectura?doc_id=${encodeURIComponent(projectId)}`,
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
        `https://api-anemona-637376850775.northamerica-northeast1.run.app/diagramaaqr/generar-arquitectura?session_id=${encodeURIComponent(sessionId)}`,
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
    const s = new XMLSerializer();
    const str = s.serializeToString(svgRef.current);
    const blob = new Blob([str], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "arquitectura.svg";
    document.body.appendChild(a); a.click();
    document.body.removeChild(a);
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
              className="flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-xs font-semibold text-gray-600 shadow-sm transition hover:bg-gray-50 hover:border-gray-300"
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

      {/* Canvas area */}
      <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl bg-white shadow-sm border border-gray-100">
        {loading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-sm text-gray-400">
            <Loader2 size={20} className="animate-spin" />
            Cargando diagrama…
          </div>
        )}

        {!loading && error && (
          <div className="absolute inset-0 flex items-center justify-center">
            <p className="text-sm text-red-500">{error}</p>
          </div>
        )}

        {!loading && !error && isEmpty && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 text-center text-sm text-gray-400">
            <div className="w-16 h-16 rounded-2xl bg-gray-50 border-2 border-dashed border-gray-200 flex items-center justify-center">
              <RefreshCw size={20} className="text-gray-300" />
            </div>
            <p>No hay nodos todavía.</p>
            <p className="text-xs">
              Presiona <strong>Generar arquitectura</strong> para que el agente cree el diagrama.
            </p>
          </div>
        )}

        {!loading && !error && !isEmpty && (
          <div className="flex-1 overflow-hidden p-3">
            <Diagram nodes={data!.nodes} edges={data!.edges} svgRef={svgRef} />
          </div>
        )}

        {generating && (
          <div className="absolute inset-0 flex items-center justify-center rounded-xl bg-white/80 backdrop-blur-sm">
            <div className="flex flex-col items-center gap-3 text-sm text-gray-500">
              <div className="relative">
                <Loader2 size={28} className="animate-spin text-[#EB0029]" />
              </div>
              <p className="font-medium">El agente está generando la arquitectura…</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}