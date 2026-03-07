"use client";

import { LayoutGrid } from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { SendHorizonal, Bot, User } from "lucide-react";
import WidgetsModal from "@/components/WidgetsModal";

type Msg = {
  id: number;
  role: "user" | "bot";
  text: string;
};

export default function ChatBot() {
  const [isWidgetsOpen, setIsWidgetsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Msg[]>([
    { id: 1, role: "bot", text: "Hola 👋 (Under Development)" },
  ]);

  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  function send() {
    const text = input.trim();
    if (!text) return;

    const userMsg: Msg = { id: Date.now(), role: "user", text };
    const botMsg: Msg = {
      id: Date.now() + 1,
      role: "bot",
      text: "Under Development",
    };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
  }

  return (
    <section className="flex-1 min-w-[420px] min-h-0">
      <div className="h-full rounded-3xl bg-gray-100 shadow-md p-6 flex flex-col">

        {/* header */}
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-extrabold text-gray-600 tracking-wide">
            SV-3254320326
          </h2>
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
              {/* icono bot */}
              {m.role === "bot" && (
                <div className="h-10 w-10 rounded-full bg-white shadow flex items-center justify-center">
                  <Bot size={18} className="text-[#EB0029]" />
                </div>
              )}

              {/* burbuja */}
              <div className="max-w-[70%] rounded-2xl bg-white px-5 py-4 shadow relative">
                <p className="text-sm text-gray-600 leading-relaxed">
                  {m.text}
                </p>

                {m.role === "bot" && (
                  <div className="absolute left-0 bottom-0 h-[6px] w-full bg-[#EB0029] rounded-b-2xl" />
                )}
              </div>

              {/* icono user */}
              {m.role === "user" && (
                <div className="h-10 w-10 rounded-full bg-white shadow flex items-center justify-center">
                  <User size={18} className="text-gray-600" />
                </div>
              )}
            </div>
          ))}
          <div ref={endRef} />
        </div>

        {/* input + widgets */}
        <div className="mt-5 flex items-center gap-3 relative">

          {/* input container */}
          <div className="relative flex-1">

            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") send();
              }}
              placeholder="Escribe tu pregunta..."
              className="w-full rounded-2xl bg-white px-5 pr-14 py-4 text-sm shadow outline-none focus:ring-2 focus:ring-[#EB0029]/30"
            />

            {/* botón enviar dentro del input */}
            <button
              onClick={send}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
              aria-label="Enviar"
            >
              <SendHorizonal className="text-black" size={18} />
            </button>

          </div>

          {/* botón widgets afuera */}
          <div className="relative">
  <button
    onClick={() => setIsWidgetsOpen(!isWidgetsOpen)}
    className="h-[50px] px-6 bg-[#EB0029] text-white font-semibold rounded-2xl shadow hover:bg-red-700 transition flex items-center gap-2"
  >
    <LayoutGrid size={18} />
    Widgets
  </button>

  <WidgetsModal
    isOpen={isWidgetsOpen}
    onClose={() => setIsWidgetsOpen(false)}
  />
</div>

        </div>
      </div>

    </section>
  );
}