"use client";

import { useState } from "react";

interface Props { onBack: () => void; }

const TABS = ["Makeup", "Skincare", "Hair", "Wellness"];

const ARTICLES = [
  {
    id: "1", tab: "Makeup",
    title: "Get the Look: Met Gala Glam",
    category: "Red Carpet",
    gradient: "linear-gradient(145deg, #2A1A2E, #5A2A4A, #8A3A6A)",
    accent: "#C4968A",
  },
  {
    id: "2", tab: "Makeup",
    title: "Mastering the Smoky Eye",
    category: "Tutorial",
    gradient: "linear-gradient(145deg, #1A1A2E, #3A2A5A, #6A4A8A)",
    accent: "#8A70A8",
  },
  {
    id: "3", tab: "Makeup",
    title: "Nude Lip Perfection",
    category: "How-To",
    gradient: "linear-gradient(145deg, #3A1A1A, #6A3A3A, #C4968A)",
    accent: "#C4968A",
  },
  {
    id: "4", tab: "Makeup",
    title: "Glass Skin in 5 Steps",
    category: "Trend",
    gradient: "linear-gradient(145deg, #1A2A2A, #2A5A4A, #3A8A6A)",
    accent: "#1A5C3A",
  },
  {
    id: "5", tab: "Skincare",
    title: "Skincare Secrets of Paris",
    category: "Feature",
    gradient: "linear-gradient(145deg, #1A2A1A, #2A5A2A, #4A8A4A)",
    accent: "#1A5C3A",
  },
  {
    id: "6", tab: "Skincare",
    title: "The Retinol Revolution",
    category: "Science",
    gradient: "linear-gradient(145deg, #2A1A1A, #5A2A2A, #8A5A3A)",
    accent: "#C8B06A",
  },
  {
    id: "7", tab: "Hair",
    title: "French Girl Hair",
    category: "Style",
    gradient: "linear-gradient(145deg, #2A2A1A, #5A5A2A, #8A7A4A)",
    accent: "#C8B06A",
  },
  {
    id: "8", tab: "Hair",
    title: "Scalp Care Essentials",
    category: "Wellness",
    gradient: "linear-gradient(145deg, #1A1A2A, #2A3A5A, #4A5A8A)",
    accent: "#5A7A9A",
  },
  {
    id: "9", tab: "Wellness",
    title: "Inner Glow Rituals",
    category: "Lifestyle",
    gradient: "linear-gradient(145deg, #2A1A2A, #4A2A4A, #8A5A7A)",
    accent: "#8A5A78",
  },
  {
    id: "10", tab: "Wellness",
    title: "Beauty Sleep Science",
    category: "Science",
    gradient: "linear-gradient(145deg, #1A1A3A, #2A2A6A, #4A4A9A)",
    accent: "#5A70A8",
  },
];

export default function EditorialScreen({ onBack }: Props) {
  const [activeTab, setActiveTab] = useState("Makeup");

  const filtered = ARTICLES.filter(a => a.tab === activeTab);

  return (
    <div className="satin-bg min-h-screen flex flex-col overflow-hidden">

      {/* Header */}
      <div className="px-6 pt-10 pb-3 flex items-center justify-between flex-shrink-0">
        <button onClick={onBack}
          className="font-sans text-[9px] tracking-[0.22em] uppercase text-[#0B3C26] opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
          ← Back
        </button>
        <div className="text-center">
          <p className="font-sans text-[8px] tracking-[0.3em] uppercase text-[#C8B06A] mb-0.5">Curated</p>
          <h2 className="font-serif text-xl font-normal text-[#1C1C1C]">Editorial</h2>
        </div>
        <div className="w-12" />
      </div>

      {/* Tab bar */}
      <div className="px-4 mb-4 flex-shrink-0">
        <div className="flex gap-0 bg-transparent">
          {TABS.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2.5 font-sans text-[9px] tracking-[0.15em] uppercase transition-all duration-200 cursor-pointer relative`}
              style={{ color: activeTab === tab ? "#0B3C26" : "rgba(11,60,38,0.4)" }}>
              {tab}
              {activeTab === tab && (
                <div className="absolute bottom-0 left-2 right-2 h-[2px] rounded-full"
                  style={{ background: "#0B3C26" }} />
              )}
            </button>
          ))}
        </div>
        <div className="divider-gold mt-0" />
      </div>

      {/* Article grid */}
      <div className="flex-1 overflow-y-auto px-4 pb-8">
        <div className="grid grid-cols-2 gap-3">
          {filtered.map((article) => (
            <button
              key={article.id}
              className="card-pearl rounded-2xl overflow-hidden text-left cursor-pointer group transition-all duration-200"
            >
              {/* Editorial photo placeholder */}
              <div className="relative h-36 overflow-hidden">
                <div className="absolute inset-0" style={{ background: article.gradient }} />

                {/* Model face silhouette */}
                <div className="absolute inset-0 flex items-center justify-center opacity-30">
                  <ModelFaceSVG />
                </div>

                {/* Gradient overlay */}
                <div className="absolute inset-0"
                  style={{ background: "linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.5) 100%)" }} />

                {/* Category tag */}
                <div className="absolute top-2.5 left-2.5">
                  <span className="font-sans text-[7px] tracking-[0.2em] uppercase px-2 py-1 rounded-full"
                    style={{ background: `${article.accent}CC`, color: "white" }}>
                    {article.category}
                  </span>
                </div>
              </div>

              {/* Article info */}
              <div className="p-3">
                <h3 className="font-serif text-sm font-normal text-[#1C1C1C] leading-tight mb-1 group-hover:text-[#0B3C26] transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ background: article.accent }} />
                  <span className="font-sans text-[8px] text-[#8A8070] tracking-wide">{article.category}</span>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Featured divider */}
        <div className="my-6">
          <div className="flex items-center gap-3">
            <div className="divider-gold flex-1" />
            <p className="font-sans text-[8px] tracking-[0.25em] uppercase text-[#C8B06A]">Editor&apos;s Choice</p>
            <div className="divider-gold flex-1" />
          </div>
        </div>

        {/* Featured wide card */}
        <div className="card-pearl rounded-2xl overflow-hidden cursor-pointer group mb-4">
          <div className="relative h-44 overflow-hidden">
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(135deg, #0B3C26, #1A5C3A, #2D7A52)" }} />
            <div className="absolute inset-0 flex items-center justify-center opacity-15">
              <LargeModelSVG />
            </div>
            <div className="absolute inset-0"
              style={{ background: "linear-gradient(180deg, transparent 30%, rgba(0,0,0,0.6) 100%)" }} />
            <div className="absolute bottom-4 left-4 right-4">
              <span className="font-sans text-[7px] tracking-[0.2em] uppercase text-[#C8B06A]">
                ✦ This Season&apos;s Must-Haves
              </span>
              <h3 className="font-serif text-xl font-normal text-white leading-tight mt-1">
                The Complete Beauty Edit
              </h3>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ModelFaceSVG() {
  return (
    <svg width="60" height="90" viewBox="0 0 60 90" fill="none">
      {/* Face */}
      <ellipse cx="30" cy="38" rx="20" ry="26" fill="rgba(255,255,255,0.6)" />
      {/* Hair */}
      <path d="M10 28 Q10 8 30 6 Q50 8 50 28" fill="rgba(255,255,255,0.4)" />
      <path d="M8 32 Q6 20 16 14" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round" fill="none" />
      <path d="M52 32 Q54 20 44 14" stroke="rgba(255,255,255,0.3)" strokeWidth="4" strokeLinecap="round" fill="none" />
      {/* Eyes */}
      <ellipse cx="22" cy="36" rx="4" ry="2" fill="rgba(255,255,255,0.5)" />
      <ellipse cx="38" cy="36" rx="4" ry="2" fill="rgba(255,255,255,0.5)" />
      {/* Lips */}
      <path d="M22 52 Q30 57 38 52" stroke="rgba(255,255,255,0.5)" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* Neck */}
      <rect x="24" y="62" width="12" height="18" rx="4" fill="rgba(255,255,255,0.4)" />
    </svg>
  );
}

function LargeModelSVG() {
  return (
    <svg width="200" height="300" viewBox="0 0 200 300" fill="none">
      <ellipse cx="100" cy="100" rx="55" ry="70" fill="rgba(255,255,255,0.5)" />
      <path d="M45 80 Q45 30 100 24 Q155 30 155 80" fill="rgba(255,255,255,0.3)" />
      <ellipse cx="80" cy="98" rx="10" ry="6" fill="rgba(255,255,255,0.4)" />
      <ellipse cx="120" cy="98" rx="10" ry="6" fill="rgba(255,255,255,0.4)" />
      <path d="M75 130 Q100 145 125 130" stroke="rgba(255,255,255,0.5)" strokeWidth="3" fill="none" strokeLinecap="round" />
      <rect x="82" y="165" width="36" height="60" rx="14" fill="rgba(255,255,255,0.3)" />
    </svg>
  );
}
