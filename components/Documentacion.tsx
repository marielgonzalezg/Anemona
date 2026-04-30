"use client";

import { useEffect, useRef, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Download,
  CheckCircle,
  X,
  Mail,
} from "lucide-react";
import ERSPreview from "@/components/ERSPreview";
import type { ERSData } from "@/types/  ers";

const DRAWIO_EMBED_URL =
  "https://viewer.diagrams.net/?tags=%7B%7D&lightbox=1&highlight=0000ff&edit=_blank&layers=1&nav=1&title=diagramaarq.drawio&dark=auto#Uhttps%3A%2F%2Fdrive.google.com%2Fuc%3Fid%3D1K0pWBSO4_RdxmUlAippvNTiQZfnkcoSJ%26export%3Ddownload";

const DOC_NAMES: Record<"ERS" | "Análisis" | "Arquitectura", string> = {
  ERS: "Documento ERS",
  Análisis: "Documento de Análisis",
  Arquitectura: "Diseño de Arquitectura",
};

function DownloadPopup({ docName, onClose }: { docName: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 flex min-w-[300px] max-w-sm animate-in zoom-in fade-in flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl duration-200">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 transition hover:text-gray-600">
          <X size={18} />
        </button>
        <div className="rounded-full bg-green-100 p-4">
          <CheckCircle className="text-green-500" size={36} />
        </div>
        <div className="text-center">
          <h2 className="mb-1 text-lg font-bold text-gray-800">¡Descarga exitosa!</h2>
          <p className="text-sm text-gray-500">
            <span className="font-semibold text-gray-700">{docName}</span> se ha descargado correctamente.
          </p>
        </div>
        <button onClick={onClose} className="mt-2 rounded-full bg-[#EB0029] px-8 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#c8001f]">
          Aceptar
        </button>
      </div>
    </div>
  );
}

function EmailPopup({ onClose }: { onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      <div className="relative mx-4 flex min-w-[300px] max-w-sm animate-in zoom-in fade-in flex-col items-center gap-4 rounded-2xl bg-white p-8 shadow-2xl duration-200">
        <button onClick={onClose} className="absolute top-3 right-3 text-gray-400 transition hover:text-gray-600">
          <X size={18} />
        </button>
        <div className="rounded-full bg-green-100 p-4">
          <Mail className="text-green-500" size={36} />
        </div>
        <div className="text-center">
          <h2 className="mb-1 text-lg font-bold text-gray-800">¡Correo enviado!</h2>
          <p className="text-sm text-gray-500">El documento SRS fue enviado a tu correo registrado.</p>
        </div>
        <button onClick={onClose} className="mt-2 rounded-full bg-[#EB0029] px-8 py-2 text-sm font-semibold text-white shadow transition hover:bg-[#c8001f]">
          Aceptar
        </button>
      </div>
    </div>
  );
}

export default function Documentacion({ expanded, onToggle }: { expanded: boolean; onToggle: () => void }) {
  const [tab, setTab] = useState<"ERS" | "Análisis" | "Arquitectura">("ERS");
  const [showPopup, setShowPopup] = useState(false);
  const [showEmailPopup, setShowEmailPopup] = useState(false);
  const [sendingEmail, setSendingEmail] = useState(false);
  const [ersData, setErsData] = useState<ERSData | null>(null);
  const [loadingERS, setLoadingERS] = useState(true);
  const [changedFields, setChangedFields] = useState<Set<string>>(new Set());

  // ← Ref que apunta al contenedor del ERSPreview para capturarlo
  const ersContainerRef = useRef<HTMLDivElement>(null);

  const getActiveProjectId = () => {
    if (typeof window === "undefined") return "";
    return sessionStorage.getItem("project_id") || "";
  };

  const detectChanges = (oldData: any, newData: any) => {
    const changed = new Set<string>();
    const compare = (obj1: any, obj2: any, path = "") => {
      if (Array.isArray(obj2)) {
        obj2.forEach((item, index) => {
          const newPath = path ? `${path}.${index}` : `${index}`;
          if (typeof item === "object" && item !== null) compare(obj1?.[index], item, newPath);
          else if (obj1?.[index] !== item) changed.add(newPath);
        });
        return;
      }
      for (const key in obj2) {
        const newPath = path ? `${path}.${key}` : key;
        if (typeof obj2[key] === "object" && obj2[key] !== null) compare(obj1?.[key], obj2[key], newPath);
        else if (obj1?.[key] !== obj2[key]) changed.add(newPath);
      }
    };
    compare(oldData, newData);
    return changed;
  };

  const fetchERS = async (
    isMounted = true,
    timeoutRef?: { current: ReturnType<typeof setTimeout> | null }
  ) => {
    try {
      const docId = getActiveProjectId();
      if (!docId) { setErsData(null); return; }
      const response = await fetch(
        `http://127.0.0.1:8000/firestore/bajar?doc_id=${encodeURIComponent(docId)}`,
        { method: "GET", headers: { accept: "application/json" }, cache: "no-store" }
      );
      if (!response.ok) throw new Error("No se pudo obtener el ERS");
      const json = await response.json();
      if (isMounted && json.ok && json.data) {
        setErsData((prev) => {
          if (!prev) return json.data;
          const changes = detectChanges(prev, json.data);
          if (changes.size > 0) {
            setChangedFields(changes);
            if (timeoutRef?.current) clearTimeout(timeoutRef.current);
            timeoutRef && (timeoutRef.current = setTimeout(() => setChangedFields(new Set()), 5000));
            return json.data;
          }
          return prev;
        });
      }
    } catch (error) {
      console.error("Error cargando ERS:", error);
    } finally {
      if (isMounted) setLoadingERS(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    const detectChanges = (oldData: any, newData: any) => {
      const changed = new Set<string>();
      const compare = (obj1: any, obj2: any, path = "") => {
        if (Array.isArray(obj2)) {
          obj2.forEach((item, index) => {
            const newPath = path ? `${path}.${index}` : `${index}`;
            if (typeof item === "object" && item !== null) compare(obj1?.[index], item, newPath);
            else if (obj1?.[index] !== item) changed.add(newPath);
          });
          return;
        }
        for (const key in obj2) {
          const newPath = path ? `${path}.${key}` : key;
          if (typeof obj2[key] === "object" && obj2[key] !== null) compare(obj1?.[key], obj2[key], newPath);
          else if (obj1?.[key] !== obj2[key]) changed.add(newPath);
        }
      };
      compare(oldData, newData);
      return changed;
    };

    const fetchERS = async () => {
      try {
        const docId = getActiveProjectId();
        if (!docId) { setErsData(null); return; }
        const response = await fetch(
          `http://127.0.0.1:8000/firestore/bajar?doc_id=${encodeURIComponent(docId)}`,
          { method: "GET", headers: { accept: "application/json" }, cache: "no-store" }
        );
        if (!response.ok) throw new Error("No se pudo obtener el ERS");
        const json = await response.json();
        if (isMounted && json.ok && json.data) {
          setErsData((prev) => {
            if (!prev) return json.data;
            const changes = detectChanges(prev, json.data);
            if (changes.size > 0) {
              setChangedFields(changes);
              if (timeoutId) clearTimeout(timeoutId);
              timeoutId = setTimeout(() => { if (isMounted) setChangedFields(new Set()); }, 5000);
              return json.data;
            }
            return prev;
          });
        }
      } catch (error) {
        console.error("Error cargando ERS:", error);
      } finally {
        if (isMounted) setLoadingERS(false);
      }
    };

    const handleRefresh = () => { fetchERS(); };
    fetchERS();
    window.addEventListener("ers-refresh", handleRefresh);
    window.addEventListener("chat-session-changed", handleRefresh);
    return () => {
      isMounted = false;
      window.removeEventListener("ers-refresh", handleRefresh);
      window.removeEventListener("chat-session-changed", handleRefresh);
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, []);

  const wrapperClass = expanded
    ? "flex-1 h-full min-w-[520px] transition-all duration-300"
    : "w-full max-w-xs h-full transition-all duration-300";

  const activeUrl = DRAWIO_EMBED_URL;

  const handleDownload = async () => {
    try {
      const downloadUrl = DRAWIO_EMBED_URL;
      const response = await fetch(downloadUrl);
      const blob = await response.blob();
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = tab === "Arquitectura" ? "arquitectura.drawio" : `${DOC_NAMES[tab].replace(/ /g, "_")}.docx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error("Error al descargar:", error);
    } finally {
      setShowPopup(true);
    }
  };

  // ── Captura el ERSPreview y lo convierte a PDF en base64 ─────────────────
  const captureERSasPdfBase64 = async (): Promise<string> => {
    // Importamos dinámicamente para no aumentar el bundle inicial
    const html2canvas = (await import("html2canvas")).default;
    const { jsPDF } = await import("jspdf");

    const container = ersContainerRef.current;
    if (!container) throw new Error("No se encontró el contenedor ERS");

    // Captura todo el contenido aunque esté scrolleado
    const canvas = await (html2canvas as any)(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: "#ffffff",
      logging: false,
    } as any);

    const imgData = canvas.toDataURL("image/jpeg", 0.92);
    const imgWidth = 210; // A4 en mm
    const pageHeight = 297;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    const pdf = new jsPDF("p", "mm", "a4");
    let heightLeft = imgHeight;
    let position = 0;

    // Si el contenido es más largo que una página, agrega páginas automáticamente
    pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, "JPEG", 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    // Devuelve solo el base64 sin el prefijo "data:application/pdf;base64,"
    return pdf.output("datauristring").split(",")[1];
  };;;

  // ── Envía el correo con el PDF adjunto ───────────────────────────────────
  const handleSendEmail = async () => {
    const docId = getActiveProjectId();
    if (!docId) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    setSendingEmail(true);
    try {
      // 1. Captura el ERSPreview como PDF en base64
      const pdfBase64 = await captureERSasPdfBase64();

      // 2. Manda al backend el doc_id + el PDF
      const res = await fetch("http://127.0.0.1:8000/email/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          doc_id: docId,
          pdf_base64: pdfBase64,  // ← nuevo campo
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.detail || "Error al enviar correo");
      }

      setShowEmailPopup(true);
    } catch (err) {
      console.error("Error enviando correo:", err);
    } finally {
      setSendingEmail(false);
    }
  };

  return (
    <>
      {showPopup && <DownloadPopup docName={DOC_NAMES[tab]} onClose={() => setShowPopup(false)} />}
      {showEmailPopup && <EmailPopup onClose={() => setShowEmailPopup(false)} />}

      <section className={wrapperClass}>
        <div className="relative flex h-full flex-col rounded-3xl bg-gray-100 p-6 shadow-md">
          <button
            onClick={onToggle}
            className="absolute -left-5 top-6 z-50 cursor-pointer rounded-full bg-white p-2 shadow transition hover:scale-105"
          >
            {expanded ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          </button>

          {!expanded && (
            <div className="flex h-full flex-col gap-3">
              <div className="shrink-0">
                <h1 className="text-xl font-bold text-[#EB0029]">Documentos de Salida</h1>
                <div className="mt-1 h-[2px] w-full bg-[#EB0029]" />
              </div>
              <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto pr-1">
                {(["ERS", "Análisis", "Arquitectura"] as const).map((t) => (
                  <div key={t} className="flex shrink-0 flex-col gap-1">
                    <span className="px-1 text-xs font-bold uppercase tracking-wider text-gray-500">
                      {DOC_NAMES[t]}
                    </span>
                    <div className="relative h-72 overflow-hidden rounded-xl border border-gray-100 bg-white shadow-md">
                      {t === "ERS" || t === "Análisis" ? (
                        <div
                          className="pointer-events-none h-full w-full overflow-hidden"
                          style={{ transform: "scale(0.33)", transformOrigin: "top left", width: "303%", height: "303%" }}
                        >
                          {loadingERS ? (
                            <div className="flex h-full items-center justify-center text-sm text-gray-500">Cargando ERS...</div>
                          ) : (
                            <ERSPreview data={ersData} changedFields={changedFields} />
                          )}
                        </div>
                      ) : (
                        <iframe
                          src={DRAWIO_EMBED_URL}
                          className="border-0"
                          title={DOC_NAMES[t]}
                          style={{ pointerEvents: "none", width: "170%", height: "170%", transform: "scale(0.588)", transformOrigin: "top left" }}
                        />
                      )}
                      <button
                        onClick={() => { setTab(t); onToggle(); }}
                        className="group absolute inset-0 h-full w-full bg-transparent transition hover:bg-[#EB0029]/5"
                        title="Expandir para ver completo"
                      >
                        <span className="absolute bottom-2 right-2 rounded-full bg-[#EB0029] px-2 py-0.5 text-[10px] font-semibold text-white opacity-0 transition group-hover:opacity-100">
                          Ver completo
                        </span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {expanded && (
            <>
              <div className="relative mb-5 flex items-center justify-center">
                <div className="flex gap-2 rounded-full bg-white px-2 py-2 shadow">
                  {(["ERS", "Análisis", "Arquitectura"] as const).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTab(t)}
                      className={
                        tab === t
                          ? "rounded-full bg-[#EB0029] px-10 py-2 text-sm font-semibold text-white shadow"
                          : "rounded-full px-10 py-2 text-sm font-semibold text-gray-600 transition hover:bg-gray-100"
                      }
                    >
                      {t}
                    </button>
                  ))}
                </div>

                <div className="absolute right-0 flex items-center gap-3">
                  {tab === "ERS" && (
                    <button
                      onClick={handleSendEmail}
                      disabled={sendingEmail}
                      className="flex cursor-pointer items-center gap-2 bg-transparent p-2 transition hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Enviar SRS por correo"
                    >
                      {sendingEmail ? (
                        <>
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-[#EB0029] border-t-transparent" />
                          <span className="text-sm font-medium text-[#EB0029]">Enviando...</span>
                        </>
                      ) : (
                        <>
                          <Mail className="text-[#EB0029]" size={22} />
                          <span className="font-medium text-[#EB0029]">Enviar</span>
                        </>
                      )}
                    </button>
                  )}
                  <button
                    onClick={handleDownload}
                    className="flex cursor-pointer items-center gap-2 bg-transparent p-2 transition hover:scale-110"
                    title="Descargar documento"
                  >
                    <Download className="text-[#EB0029]" size={22} />
                    <span className="font-medium text-[#EB0029]">Descargar</span>
                  </button>
                </div>
              </div>

              <div className="flex min-h-0 flex-1 overflow-hidden rounded-2xl bg-white shadow">
                {tab === "ERS" || tab === "Análisis" ? (
                  // ← ref aquí para que html2canvas sepa qué capturar
                  <div
                    ref={ersContainerRef}
                    className="h-full w-full overflow-y-auto overscroll-contain bg-[#e9e9e9]"
                  >
                    {loadingERS ? (
                      <div className="flex h-full items-center justify-center text-sm text-gray-500">
                        Cargando documento...
                      </div>
                    ) : (
                      <ERSPreview data={ersData} changedFields={changedFields} />
                    )}
                  </div>
                ) : (
                  <iframe key={tab} src={activeUrl} className="h-full w-full border-0" title={tab} allow="fullscreen" />
                )}
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}