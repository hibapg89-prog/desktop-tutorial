"use client";

import Link from "next/link";
import { SwanLogo } from "@/components/LandingScreen";

export default function NotFound() {
  return (
    <div className="satin-bg min-h-screen flex flex-col items-center justify-center px-8 text-center">
      <div className="opacity-20 mb-6">
        <SwanLogo size={52} />
      </div>
      <p className="font-sans text-[8px] tracking-[0.35em] uppercase text-[#C8B06A] mb-4">
        404
      </p>
      <h1 className="font-serif text-3xl font-normal text-[#1C1C1C] mb-3 leading-tight">
        Page introuvable
      </h1>
      <p className="font-cormorant italic text-[15px] text-[#8A8070] mb-2 leading-relaxed">
        "Cette page s'est évaporée<br />comme un parfum de printemps."
      </p>
      <div className="divider-gold w-16 mx-auto my-6" />
      <Link
        href="/"
        className="px-8 py-3.5 rounded-full font-sans text-[10px] tracking-[0.2em] uppercase cursor-pointer press-scale transition-all inline-block"
        style={{ border: "1.5px solid #0B3C26", color: "#0B3C26" }}>
        Retourner à LuxeBeauty ✦
      </Link>
    </div>
  );
}
