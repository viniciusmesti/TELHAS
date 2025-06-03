"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    const isAdmin = localStorage.getItem("isAdmin");
    if (isAdmin !== "true") {
      // Se não estiver logado como admin, apenas volta para a rota raiz:
      router.replace("/");
    }
  }, [router]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Painel de Administrador</h1>
      <p className="mt-4">
        Aqui estarão as funcionalidades protegidas para o administrador.
      </p>
    </div>
  );
}
