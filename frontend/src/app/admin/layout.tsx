"use client";

import React from "react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-wrapper">
      {/* normalmente aqui vai o sidebar de admin ou header */}
      {children}
    </div>
  );
}
