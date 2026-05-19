"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import LoginScreen from "@/components/LogIn";
import { API_URL } from "@/services/api";

export default function Page() {
  const router = useRouter();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const verificarToken = async () => {
      const token = localStorage.getItem("token");

      if (!token) {
        setChecking(false);
        return;
      }

      try {
        const res = await fetch(`${API_URL}/auth/verify-token`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          router.replace("/dashboard");
          return;
        }

        localStorage.removeItem("token");
        setChecking(false);
      } catch {
        localStorage.removeItem("token");
        setChecking(false);
      }
    };

    verificarToken();
  }, [router]);

  if (checking) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-gray-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-[#EB0029] border-t-transparent" />
          <p className="text-sm text-gray-500">Verificando sesión...</p>
        </div>
      </div>
    );
  }

  return <LoginScreen />;
}