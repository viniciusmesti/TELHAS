// frontend/src/components/AdminLoginModal.tsx
"use client";

import React from "react";
import { X } from "lucide-react";
import { AdminLoginForm } from "./AdminLoginForm";

interface AdminLoginModalProps {
  open: boolean;
  onClose: () => void;
}

export function AdminLoginModal({ open, onClose }: AdminLoginModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Overlay escurecido + blur */}
      <div
        onClick={onClose}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
      />

      {/* Container do Modal */}
      <div className="relative z-10 w-full max-w-md mx-4">
        {/* Card branco com sombra e cantos arredondados */}
        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Header do Modal */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-800">
              Login Administrador
            </h2>
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Fechar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Corpo do Modal: formulário */}
          <div className="px-6 py-6">
            <AdminLoginForm onSuccess={onClose} />
          </div>
        </div>
      </div>
    </div>
  );
}
