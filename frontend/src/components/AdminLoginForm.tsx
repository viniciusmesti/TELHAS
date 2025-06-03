// frontend/src/components/AdminLoginForm.tsx
"use client";

import React, { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";

interface AdminLoginFormProps {
  /** Chamado quando o login for validado com sucesso */
  onSuccess: () => void;
}

export function AdminLoginForm({ onSuccess }: AdminLoginFormProps) {
  const router = useRouter();
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Chama o endpoint /admin/validate no backend
      const response = await api.post("/admin/validate", { code });
      if (response.data.success) {
        // Salva o flag de admin autenticado
        localStorage.setItem("isAdmin", "true");
        // Fecha modal e redireciona para /admin
        onSuccess();
        router.push("/admin");
      } else {
        setError("Resposta inesperada do servidor.");
      }
    } catch (err: any) {
      setError("Código inválido ou erro no servidor.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Input de Código */}
      <div>
        <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-1">
          Código de Acesso
        </label>
        <input
          type="password"
          id="code"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          autoComplete="off"
          placeholder="Digite o código secreto"
          className="
            block w-full 
            border border-gray-300 rounded-lg 
            px-4 py-2 
            text-gray-900 
            focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent
            transition-colors
          "
        />
      </div>

      {/* Mensagem de erro, se houver */}
      {error && (
        <p className="text-sm text-red-600 animate-pulse">
          {error}
        </p>
      )}

      {/* Botão de Enviar */}
      <div>
        <button
          type="submit"
          disabled={loading}
          className={`
            w-full 
            ${loading ? "bg-indigo-400" : "bg-indigo-600 hover:bg-indigo-700"} 
            text-white font-semibold 
            py-2 rounded-lg 
            transition-colors disabled:opacity-50`}
        >
          {loading ? "Validando..." : "Entrar"}
        </button>
      </div>
    </form>
  );
}
