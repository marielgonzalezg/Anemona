"use client";

import { useState } from "react";
import { useRouter } from "next/router";
import NewProject from "@/components/NewProject";
import ProjectList from "@/components/ProjectList";
import ChatBot from "@/components/ChatBot";
import Documentacion from "@/components/Documentacion";
import LoginScreen from "@/components/LogIn";

export default function Home() {
  return <LoginScreen />;
}