import { useState } from "react";
import { ArrowLeft, Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";

const TIERS = [
  {
    id: "seeker",
    name: "The Seeker",
    price: "Free",
    subtitle: "Begin your journey",
    color: "#E5E4E2",
    textColor: "#043927",
    cta: "Begin",
    features: [
      "Product identification (10/day)",
      "My Vanity (up to 50 products)",
      "Browse editorial tutorials",
      "Community reviews access",
      "No ads. Ever.",
    ]
  },
  {
    id: "muse",
    name: "The Muse",
    price: "$9.99",
    period: "/month",
    subtitle: "Your personal beauty curator",
    color: "#043927",
    textColor: "#FDF5E6",
    featured: true,
    cta: "Become",
    features: [
      "Unlimited product identification",
      "Unlimited Vanity",
      "The Muse Concierge (AI assistant)",
      "The Local Curator — unlimited",
      "Services map & booking",
      "Exclusive editorial content",
      "Beauty Circle access",
      "Browser extension (full)",
    ]
  },
  {
    id: "patron",
    name: "The Patron",
    price: "$29.99",
    period: "/month",
    subtitle: "White-glove beauty curation",
    color: "#C8B06A",
    textColor: "#043927",
    cta: "Ascend",
    features: [
      "Everything in The Muse",
      "Unlimited Muse Concierge",
      "Gold map pins (VIP venues)",
      "Priority booking",
      "Hidden Gems mode",
      "The Muse Box (monthly)",
      "Patron badge",
      "Early access to new features",
    ]
  }
];

export default function Membership() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState("muse");

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <div className="px-5 pt-14 pb-6 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center">
          <ArrowLeft size={16} color="var(--color-text-primary)" />
        </button>
        <div>
          <h1 className="font-serif text-2xl text-[var(--color-text-primary)] font-light">Membership Concierge</h1>
          <p className="text-xs text-[var(--color-text-primary)]/40 font-light">Choose your path</p>
        </div>
      </div>

      {/* Swan hero */}
      <div className="flex flex-col items-center px-8 text-center mb-8">
        <motion.div
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 3, repeat: Infinity }}
          className="mb-4 relative"
        >
          <div className="absolute top-0 left-0 w-[100px] h-[100px] rounded-full opacity-20"
            style={{ background: "radial-gradient(circle, #C8B06A 0%, transparent 70%)" }} />
          <SwanLogo size={72} color="var(--color-text-primary)" />
        </motion.div>
        <h2 className="font-serif text-xl text-[var(--color-text-primary)] font-light mb-2">Your personal curator is preparing fresh inspirations.</h2>
        <p className="text-xs text-[#BC8F8F] font-light italic">Please allow us a moment to tailor your exclusive selections.</p>
      </div>

      {/* Tier cards */}
      <div className="px-5 space-y-4 pb-24">
        {TIERS.map((tier, i) => (
          <motion.div
            key={tier.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => setSelected(tier.id)}
            className={`rounded-2xl overflow-hidden cursor-pointer transition-all ${
              selected === tier.id ? 'ring-2 ring-[var(--color-accent-gold)] shadow-xl' : 'shadow-sm'
            }`}
            style={{ backgroundColor: tier.color }}
          >
            <div className="px-5 py-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  {tier.featured && (
                    <span className="px-2 py-0.5 bg-[var(--color-accent-gold)] text-[var(--color-text-primary)] text-[8px] tracking-[0.2em] uppercase rounded-full font-medium mb-2 inline-block">
                      Most Popular
                    </span>
                  )}
                  <h3 className="font-serif text-xl font-light" style={{ color: tier.textColor }}>{tier.name}</h3>
                  <p className="text-xs font-light mt-0.5 opacity-60" style={{ color: tier.textColor }}>{tier.subtitle}</p>
                </div>
                <div className="text-right">
                  <p className="font-serif text-2xl font-light" style={{ color: tier.textColor }}>{tier.price}</p>
                  {tier.period && <p className="text-xs font-light opacity-50" style={{ color: tier.textColor }}>{tier.period}</p>}
                </div>
              </div>

              <div className="w-full h-px mb-3 opacity-20" style={{ backgroundColor: tier.textColor }} />

              <div className="space-y-2">
                {tier.features.map((f, j) => (
                  <div key={j} className="flex items-start gap-2">
                    <Check size={12} color={tier.textColor} strokeWidth={2} className="mt-0.5 flex-shrink-0 opacity-80" />
                    <span className="text-xs font-light leading-relaxed" style={{ color: tier.textColor, opacity: 0.8 }}>{f}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        ))}

        {/* Special offers */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl p-5 border border-[var(--color-border)]">
          <p className="text-xs tracking-[0.2em] text-[var(--color-text-primary)]/50 uppercase font-light mb-3">Special Access</p>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-primary)] font-light">Student Discount</p>
                <p className="text-[10px] text-[var(--color-text-primary)]/40 font-light">50% off any paid tier</p>
              </div>
              <span className="text-xs text-[#BC8F8F] font-light">Apply →</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-primary)] font-light">Makeup Artist</p>
                <p className="text-[10px] text-[var(--color-text-primary)]/40 font-light">Professional rate available</p>
              </div>
              <span className="text-xs text-[#BC8F8F] font-light">Apply →</span>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-text-primary)] font-light">Gift a Membership</p>
                <p className="text-[10px] text-[var(--color-text-primary)]/40 font-light">For the beauty lover in your life</p>
              </div>
              <span className="text-xs text-[#BC8F8F] font-light">Gift →</span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="space-y-3">
          <button className="w-full py-4 bg-[#043927] text-[#FDF5E6] text-xs tracking-[0.3em] uppercase rounded-2xl font-light">
            {TIERS.find(t => t.id === selected)?.cta || "Begin"}
          </button>
          <p className="text-center text-[10px] text-[var(--color-text-primary)]/40 font-light italic">
            Payments launching soon
          </p>
        </div>
      </div>
    </div>
  );
}