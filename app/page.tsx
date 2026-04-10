"use client";

import { useState } from "react";
import ProjectList from "@/components/ProjectList";
import ChatBot from "@/components/ChatBot";
import Documentacion from "@/components/Documentacion";

export default function Home() {

  const [expandDocs, setExpandDocs] = useState(false);

  return (
    <main className="flex items-stretch gap-6 p-10 w-full h-screen overflow-hidden">
      
      <ProjectList />

      {!expandDocs && <ChatBot />}

      <Documentacion
        expanded={expandDocs}
        onToggle={() => setExpandDocs(!expandDocs)}
      />  

    </main>

    
  );
}