import React from "react";
import SwanLogo from "@/components/SwanLogo";

export default function AuthLayout({ title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: "#FDF5E6" }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center mb-4">
            <SwanLogo size={48} color="#C8B06A" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight" style={{ color: "#0B3C26", fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 600 }}>{title}</h1>
          {subtitle && <p className="mt-2 text-sm" style={{ color: "#6b5c4a" }}>{subtitle}</p>}
        </div>
        <div className="rounded-2xl p-8" style={{ background: "#EFE9DC", border: "1px solid #d9cfc0" }}>
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm mt-6" style={{ color: "#6b5c4a" }}>{footer}</p>
        )}
      </div>
    </div>
  );
}
