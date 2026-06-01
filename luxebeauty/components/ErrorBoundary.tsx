"use client";

import React from "react";
import { SwanLogo } from "./LandingScreen";

interface State { hasError: boolean; }

export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  reset() {
    this.setState({ hasError: false });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="satin-bg min-h-screen flex flex-col items-center justify-center px-8 text-center">
          <div className="opacity-25 mb-6">
            <SwanLogo size={48} />
          </div>
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-3">
            La Muse se repose ✦
          </p>
          <h1 className="font-serif text-2xl font-normal text-[#1C1C1C] mb-3 leading-tight">
            Un instant de silence
          </h1>
          <p className="font-sans text-[11px] font-light text-[#8A8070] leading-relaxed mb-8 max-w-xs">
            Une erreur inattendue s'est glissée dans votre expérience. Tout sera rétabli dans un instant.
          </p>
          <button
            onClick={() => { this.reset(); window.location.reload(); }}
            className="px-8 py-3.5 rounded-full font-sans text-[10px] tracking-[0.2em] uppercase cursor-pointer press-scale transition-all"
            style={{ border: "1.5px solid #0B3C26", color: "#0B3C26" }}>
            Recommencer ✦
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
