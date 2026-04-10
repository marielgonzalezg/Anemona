"use client";

import { LayoutGrid, SendHorizonal, Bot, User, X } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import WidgetsModal from "@/components/WidgetsModal";
import FormModal from "./FormModal";

type Msg = {
  id: number;
  role: "user" | "bot";
  text: string;
};

export default function ChatBot() {
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, role: "bot", text: "Hola 👋 Soy tu asistente. ¿En qué te puedo ayudar?" },
  ]);

  const [userId, setUserId] = useState("");
  const [sessionId, setSessionId] = useState("");

  const [showLoginModal, setShowLoginModal] = useState(false);
  const [tempUserId, setTempUserId] = useState("");

  const [loadingSession, setLoadingSession] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState(false);

  const endRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [localChatReady, setLocalChatReady] = useState(false);

  const CHAT_MESSAGES_KEY = "agent-chat-messages";
  const CHAT_INPUT_KEY = "agent-chat-input";

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const savedMessages = localStorage.getItem(CHAT_MESSAGES_KEY);
    const savedInput = localStorage.getItem(CHAT_INPUT_KEY);

    if (savedMessages) {
      try {
        setMessages(JSON.parse(savedMessages));
      } catch (error) {
        console.error("No se pudo cargar el chat guardado:", error);
      }
    }

    if (savedInput) {
      setInput(savedInput);
    }

    setLocalChatReady(true);
  }, []);

  useEffect(() => {
    if (!localChatReady) return;
    localStorage.setItem(CHAT_MESSAGES_KEY, JSON.stringify(messages));
  }, [messages, localChatReady]);

  useEffect(() => {
    if (userId && sessionId && !showLoginModal) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [userId, sessionId, showLoginModal]);

  useEffect(() => {
    if (!localChatReady) return;
    localStorage.setItem(CHAT_INPUT_KEY, input);
  }, [input, localChatReady]);

  useEffect(() => {
    if (!loadingMessage && userId && sessionId && !showLoginModal) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 0);
    }
  }, [loadingMessage, userId, sessionId, showLoginModal]);

  useEffect(() => {
    const savedUserId = sessionStorage.getItem("chat_user_id");
    const savedSessionId = sessionStorage.getItem("chat_session_id");

    if (savedUserId && savedSessionId) {
      setUserId(savedUserId);
      setSessionId(savedSessionId);
      setTempUserId(savedUserId);
    } else {
      setShowLoginModal(true);
    }
  }, []);

  function handleProjectCreated() {
  const savedUserId = sessionStorage.getItem("chat_user_id");
  const savedSessionId = sessionStorage.getItem("chat_session_id");

  console.log("🟡 session_id:", sessionStorage.getItem("chat_session_id"));
  console.log("🟡 user_id:", sessionStorage.getItem("chat_user_id"));

  if (savedUserId && savedSessionId) {
    setUserId(savedUserId);
    setSessionId(savedSessionId);
    setTempUserId(savedUserId);
  }

  setShowLoginModal(false);

  setMessages((prev) => [
    ...prev,
    {
      id: Date.now(),
      role: "bot",
      text: "Proyecto y sesión creados correctamente. Ya puedes comenzar a chatear.",
    },
  ]);
}

  async function createSession() {
    const cleanUserId = tempUserId.trim();
    if (!cleanUserId) return;

    try {
      setLoadingSession(true);

      const res = await fetch("http://127.0.0.1:8000/agent/sessions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          user_id: cleanUserId,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => null);
        throw new Error(errorData?.detail || "No se pudo crear la sesión.");
      }

      const data = await res.json();

      setUserId(data.user_id);
      setSessionId(data.session_id);

      sessionStorage.setItem("chat_user_id", data.user_id);
      sessionStorage.setItem("chat_session_id", data.session_id);

      window.dispatchEvent(
        new CustomEvent("chat-user-updated", {
          detail: { userId: data.user_id },
        })
      );

      setShowLoginModal(false);

      setMessages((prev) => [
        ...prev,
        {
          id: Date.now(),
          role: "bot",
          text: `Sesión iniciada para ${data.user_id}. Ya puedes comenzar a chatear.`,
        },
      ]);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : "Error al crear la sesión");
    } finally {
      setLoadingSession(false);
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || !userId || !sessionId || loadingMessage) return;

    const userMsg: Msg = {
      id: Date.now(),
      role: "user",
      text,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setTimeout(() => {
      inputRef.current?.focus();
    });
    setLoadingMessage(true);

    const requestBody = {
      user_id: String(userId),
      session_id: String(sessionId),
      message: text,
    };

    console.log("📤 BODY REAL DE /agent/query:");
    console.log(JSON.stringify(requestBody, null, 2));

    try {
      const res = await fetch("http://127.0.0.1:8000/agent/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      if (!res.ok) {
  const errorData = await res.json().catch(() => null);

  console.log("❌ ERROR COMPLETO DE /agent/query:");
  console.log(errorData);

  const readableDetail =
    typeof errorData?.detail === "string"
      ? errorData.detail
      : JSON.stringify(errorData?.detail ?? errorData, null, 2);

  throw new Error(readableDetail || "Error al enviar el mensaje.");
}

      const data = await res.json();

      const botText =
        data.content ||
        data.response ||
        data.answer ||
        data.message ||
        data.bot_response ||
        "No recibí respuesta del bot.";

      const botMsg: Msg = {
        id: Date.now() + 1,
        role: "bot",
        text: botText,
      };
      
      console.log("📥 Response:", data);

      setMessages((prev) => [...prev, botMsg]);
      window.dispatchEvent(new CustomEvent("ers-refresh"));

    } catch (error) {
      console.error(error);

      const errorMsg: Msg = {
        id: Date.now() + 1,
        role: "bot",
        text:
          error instanceof Error
            ? `Ocurrió un error: ${error.message}`
            : "Ocurrió un error al consultar el bot.",
      };

      setMessages((prev) => [...prev, errorMsg]);
      window.dispatchEvent(new CustomEvent("ers-refresh"));
    } finally {
      setLoadingMessage(false);
    }
  }

  function resetSession() {
    sessionStorage.removeItem("chat_user_id");
    sessionStorage.removeItem("chat_session_id");

    localStorage.removeItem(CHAT_MESSAGES_KEY);
    localStorage.removeItem(CHAT_INPUT_KEY);

    setUserId("");
    setSessionId("");
    setTempUserId("");
    setShowLoginModal(true);

    setMessages([
      { id: 1, role: "bot", text: "Hola 👋 Soy tu asistente. ¿En qué te puedo ayudar?" },
    ]);
    setInput("");

    window.dispatchEvent(
      new CustomEvent("chat-user-updated", {
        detail: { userId: "" },
      })
    );
  }

  return (
    <section className="flex-1 min-w-[420px] min-h-0 relative">
      <div className="h-full rounded-3xl bg-gray-100 shadow-md p-6 flex flex-col">
        {/* header */}
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-extrabold text-gray-600 tracking-wide">
            {sessionId || "Sin sesión"}
          </h2>
          {userId && (
            <div className="mt-2 flex items-center justify-center gap-3">
              <p className="text-sm text-gray-500">
                Usuario: <span className="font-semibold">{userId}</span>
              </p>
              <button
                onClick={resetSession}
                className="text-xs px-3 py-1 rounded-full bg-white shadow hover:bg-gray-200 transition"
              >
                Cambiar usuario
              </button>
            </div>
          )}
        </div>

        {/* mensajes */}
        <div className="flex-1 min-h-0 overflow-y-auto pr-2 flex flex-col gap-6">
          {messages.map((m) => (
            <div
              key={m.id}
              className={
                m.role === "bot"
                  ? "flex items-start gap-3"
                  : "flex items-start gap-3 justify-end"
              }
            >
              {m.role === "bot" && (
                <div className="h-10 w-10 rounded-full bg-white shadow flex items-center justify-center">
                  <Bot size={18} className="text-[#EB0029]" />
                </div>
              )}

              <div className="max-w-[70%] rounded-2xl bg-white px-5 py-4 shadow relative">
                <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">
                  {m.text}
                </p>

                {m.role === "bot" && (
                  <div className="absolute left-0 bottom-0 h-[6px] w-full bg-[#EB0029] rounded-b-2xl" />
                )}
              </div>

              {m.role === "user" && (
                <div className="h-10 w-10 rounded-full bg-white shadow flex items-center justify-center">
                  <User size={18} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}

          {loadingMessage && (
            <div className="flex items-start gap-3">
              <div className="h-10 w-10 rounded-full bg-white shadow flex items-center justify-center">
                <Bot size={18} className="text-[#EB0029]" />
              </div>
              <div className="max-w-[70%] rounded-2xl bg-white px-5 py-4 shadow relative">
                <p className="text-sm text-gray-500">Escribiendo...</p>
                <div className="absolute left-0 bottom-0 h-[6px] w-full bg-[#EB0029] rounded-b-2xl" />
              </div>
            </div>
          )}

          <div ref={endRef} />
        </div>

        {/* input + widgets */}
        <div className="mt-5 flex items-center gap-3 relative">
          <div className="relative flex-1">
            <input
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder={
                userId && sessionId
                  ? "Escribe tu pregunta..."
                  : "Primero inicia sesión"
              }
              disabled={!userId || !sessionId}
              className="w-full rounded-2xl bg-white px-5 pr-14 py-4 text-sm shadow outline-none focus:ring-2 focus:ring-[#EB0029]/30 disabled:bg-gray-200 disabled:cursor-not-allowed"
            />

            <button
              onClick={send}
              disabled={!userId || !sessionId || loadingMessage}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Enviar"
            >
              <SendHorizonal className="text-black" size={18} />
            </button>
          </div>
    
        </div>
      </div>

      <FormModal
  isOpen={showLoginModal}
  tempUserId={tempUserId}
  setTempUserId={setTempUserId}
  loadingSession={loadingSession}
  onClose={() => setShowLoginModal(false)}
  onSubmit={handleProjectCreated}
/>
    </section>
  );
}