import { useState, useEffect, useRef } from "react";
import { Search, MapPin, Star, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";
import { base44 } from "@/api/base44Client";

const SERVICE_TYPES = ["All", "Spa", "Salon", "Hairdresser", "Beauty Clinic", "Nail Bar", "Wellness"];

const SAMPLE_VENUES = [
  {
    id: "v1", name: "The Rosedale Retreat", type: "Spa", city: "New York", country: "US",
    established_year: "1920", rating: 4.9, price_tier: "€€€", is_muse_partner: true,
    image_url: "https://images.unsplash.com/photo-1540555700478-4be289fbecef?w=600&q=80",
    description: "A sanctuary of refinement since 1920. Nestled in the heart of New York, offering bespoke treatments curated for the modern Muse.",
    services: ["Deep tissue massage", "Facial", "Body wrap", "Aromatherapy"],
  },
  {
    id: "v2", name: "Maison de Beauté", type: "Salon", city: "Paris", country: "FR",
    established_year: "1935", rating: 4.8, price_tier: "€€€", is_muse_partner: true,
    image_url: "https://images.unsplash.com/photo-1522337660859-02fbefca4702?w=600&q=80",
    description: "Where Parisian elegance meets precision. The art of beauty, elevated to ceremony.",
    services: ["Colour treatment", "Cut & style", "Keratin", "Scalp treatment"],
  },
  {
    id: "v3", name: "Atelier Lumière", type: "Beauty Clinic", city: "London", country: "GB",
    established_year: "2005", rating: 4.7, price_tier: "€€€", is_muse_partner: false,
    image_url: "https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?w=600&q=80",
    description: "Where science meets luxury. Evidence-based skin treatments in an environment of complete tranquility.",
    services: ["HydraFacial", "LED therapy", "Chemical peel", "Microneedling"],
  },
  {
    id: "v4", name: "Le Nail Sanctum", type: "Nail Bar", city: "Milan", country: "IT",
    rating: 4.6, price_tier: "€€", is_muse_partner: true,
    image_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=600&q=80",
    description: "The finest nail artistry in Milan. Each appointment is a meditation on detail.",
    services: ["Gel manicure", "Nail art", "Pedicure", "Press-on design"],
  },
  {
    id: "v5", name: "The Wellness Atelier", type: "Wellness", city: "Tokyo", country: "JP",
    rating: 4.9, price_tier: "€€", is_muse_partner: true,
    image_url: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=600&q=80",
    description: "Rooted in Japanese wellness philosophy — where stillness becomes beauty.",
    services: ["Shiatsu", "Sound bath", "Facial acupuncture", "Gua sha ritual"],
  },
  {
    id: "v6", name: "Studio Noir", type: "Hairdresser", city: "Berlin", country: "DE",
    rating: 4.5, price_tier: "€€", is_muse_partner: false,
    image_url: "https://images.unsplash.com/photo-1633681926022-84c23e8cb2d6?w=600&q=80",
    description: "Berlin's most editorial hair studio. Specialising in lived-in colour and architectural cuts.",
    services: ["Balayage", "Cut & style", "Colour correction", "Scalp care"],
  },
];

// Country flag emoji helper
const FLAG = { US: "🇺🇸", FR: "🇫🇷", GB: "🇬🇧", IT: "🇮🇹", JP: "🇯🇵", DE: "🇩🇪" };

function CompassRose() {
  return (
    <svg viewBox="0 0 44 44" width="40" height="40" fill="none">
      <circle cx="22" cy="22" r="20" stroke="#C8B06A" strokeWidth="0.6" opacity="0.25" />
      <circle cx="22" cy="22" r="12" stroke="#C8B06A" strokeWidth="0.4" opacity="0.18" />
      <line x1="22" y1="2" x2="22" y2="42" stroke="#C8B06A" strokeWidth="0.5" opacity="0.2" />
      <line x1="2" y1="22" x2="42" y2="22" stroke="#C8B06A" strokeWidth="0.5" opacity="0.2" />
      <line x1="7.5" y1="7.5" x2="36.5" y2="36.5" stroke="#C8B06A" strokeWidth="0.3" opacity="0.12" />
      <line x1="36.5" y1="7.5" x2="7.5" y2="36.5" stroke="#C8B06A" strokeWidth="0.3" opacity="0.12" />
      {/* N arrow (full gold) */}
      <polygon points="22,4 23.6,19 22,21.5 20.4,19" fill="#C8B06A" opacity="0.75" />
      {/* S arrow */}
      <polygon points="22,40 23.6,25 22,22.5 20.4,25" fill="#C8B06A" opacity="0.25" />
      {/* E arrow */}
      <polygon points="40,22 25,23.6 22.5,22 25,20.4" fill="#C8B06A" opacity="0.25" />
      {/* W arrow */}
      <polygon points="4,22 19,23.6 21.5,22 19,20.4" fill="#C8B06A" opacity="0.25" />
      <circle cx="22" cy="22" r="2.5" fill="#C8B06A" opacity="0.55" />
      <text x="22" y="1.2" textAnchor="middle" fontSize="3.5" fill="#C8B06A" opacity="0.6" fontFamily="Georgia, serif">N</text>
    </svg>
  );
}

export default function ServicesMap() {
  const [activeType, setActiveType] = useState("All");
  const [activeCity, setActiveCity] = useState("All");
  const [selectedVenue, setSelectedVenue] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [dbVenues, setDbVenues] = useState([]);
  const cityRefs = useRef({});

  useEffect(() => {
    base44.entities.VenueService.list().then(setDbVenues).catch(() => {});
  }, []);

  const allVenues = [...SAMPLE_VENUES, ...dbVenues];

  const uniqueCities = ["All", ...Array.from(new Set(allVenues.map((v) => v.city).filter(Boolean)))];

  const filtered = allVenues.filter(
    (v) =>
      (activeType === "All" || v.type === activeType) &&
      (activeCity === "All" || v.city === activeCity) &&
      (searchQuery === "" ||
        v.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (v.city && v.city.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  // Group by city
  const grouped = filtered.reduce((acc, v) => {
    const city = v.city || "Other";
    if (!acc[city]) acc[city] = [];
    acc[city].push(v);
    return acc;
  }, {});

  const venueCountForCity = (city) =>
    allVenues.filter(
      (v) =>
        (activeType === "All" || v.type === activeType) &&
        (city === "All" || v.city === city)
    ).length;

  const handleCitySelect = (city) => {
    setActiveCity(city);
    if (city !== "All") {
      setTimeout(() => {
        cityRefs.current[city]?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 50);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Header banner with live venue count */}
      <div className="px-5 pt-14 pb-4">
        <div className="relative rounded-2xl overflow-hidden">
          <img
            src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/407bdacec_IMG_4518.jpeg"
            alt="The Muse — Cartography of Refinement"
            className="w-full h-auto block"
            draggable={false}
          />
          <div className="absolute top-3 right-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F5F1E9]/85 backdrop-blur-sm border border-[#B8A882]/50">
            <CompassRose />
            <span className="text-xs font-light text-[#2D362E]">{allVenues.length}</span>
          </div>
        </div>
      </div>

      {/* City selector */}
      <div className="px-5 mb-4 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2 pb-0.5">
          {uniqueCities.map((city) => {
            const count = venueCountForCity(city);
            const isActive = activeCity === city;
            return (
              <button
                key={city}
                onClick={() => handleCitySelect(city)}
                className={`flex-shrink-0 flex flex-col items-center px-3.5 py-2 rounded-xl transition-all ${
                  isActive
                    ? "bg-[#043927] text-[#FDF5E6]"
                    : "bg-[var(--color-bg-surface)] border border-[var(--color-border)] text-[var(--color-text-primary)]"
                }`}
              >
                <span className="text-[10px] tracking-[0.15em] uppercase font-light leading-none">
                  {city}
                </span>
                {city !== "All" && (
                  <span
                    className={`text-[8px] font-light mt-1 leading-none ${
                      isActive ? "text-[#C8B06A]" : "text-primary-30"
                    }`}
                  >
                    {count} {count === 1 ? "venue" : "venues"}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Search */}
      <div className="px-5 mb-4">
        <div className="flex items-center gap-3 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl px-4 py-3">
          <Search size={14} color="var(--color-text-primary)" strokeWidth={1.5} className="flex-shrink-0 opacity-60" />
          <input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search city or venue…"
            className="flex-1 bg-transparent text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-30"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="text-primary-30 hover:text-primary-60 transition-colors"
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Type filter */}
      <div className="px-5 mb-6 overflow-x-auto hide-scrollbar">
        <div className="flex gap-2">
          {SERVICE_TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setActiveType(type)}
              className={`flex-shrink-0 px-4 py-1.5 rounded-full text-[10px] tracking-[0.15em] uppercase font-light border transition-all ${
                activeType === type
                  ? "bg-[#043927] text-[#FDF5E6] border-[#043927]"
                  : "bg-transparent text-primary-55 border-[var(--color-border)]"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
      </div>

      {/* City-grouped venue list */}
      <div className="px-5 pb-28 space-y-10">
        {Object.entries(grouped).map(([city, venues]) => {
          const countryCode = venues[0]?.country;
          const flag = FLAG[countryCode] || "📍";
          return (
            <div
              key={city}
              ref={(el) => { cityRefs.current[city] = el; }}
            >
              {/* City header */}
              <div className="flex items-center gap-3 mb-4">
                <span className="text-base leading-none">{flag}</span>
                <h2 className="font-serif text-lg text-[var(--color-text-primary)] font-light">{city}</h2>
                <div className="flex-1 h-px bg-gradient-to-r from-[#C8B06A]/20 to-transparent" />
                <span className="text-[9px] text-primary-30 font-light tracking-wide uppercase">
                  {venues.length} {venues.length === 1 ? "venue" : "venues"}
                </span>
              </div>

              <div className="space-y-4">
                {venues.map((venue, i) => (
                  <VenueCard
                    key={venue.id}
                    venue={venue}
                    index={i}
                    expanded={selectedVenue?.id === venue.id}
                    onToggle={() =>
                      setSelectedVenue(selectedVenue?.id === venue.id ? null : venue)
                    }
                  />
                ))}
              </div>
            </div>
          );
        })}

        {Object.keys(grouped).length === 0 && (
          <div className="text-center py-20">
            <div className="opacity-20 flex justify-center mb-4">
              <SwanLogo size={40} color="var(--color-text-primary)" />
            </div>
            <p className="font-serif text-primary-30 text-lg font-light">
              No venues found
            </p>
            <p className="text-[11px] text-primary-25 font-light mt-1">
              Try a different city or service type
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function VenueCard({ venue, index, expanded, onToggle }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: Math.min(index * 0.07, 0.35), ease: "easeOut" }}
    >
      <div
        className="bg-[var(--color-bg-surface)] rounded-2xl overflow-hidden border border-[var(--color-border)] shadow-sm cursor-pointer active:scale-[0.99] transition-transform"
        onClick={onToggle}
      >
        {/* Hero photo */}
        <div className="relative h-52">
          <img
            src={venue.image_url}
            alt={venue.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />

          {/* Top badges */}
          <div className="absolute top-3 left-3 flex gap-1.5">
            {venue.is_muse_partner && (
              <span className="px-2.5 py-1 bg-[#C8B06A] text-white text-[8px] tracking-[0.15em] uppercase rounded-full font-light">
                Muse Partner
              </span>
            )}
            <span className="px-2.5 py-1 bg-[var(--color-bg)]/90 text-[var(--color-text-primary)] text-[8px] tracking-[0.15em] uppercase rounded-full font-light">
              {venue.type}
            </span>
          </div>

          {/* Price tier */}
          <div className="absolute top-3 right-3">
            <span className="text-[11px] text-white/75 font-light">{venue.price_tier}</span>
          </div>

          {/* Bottom info */}
          <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
            <h3 className="font-serif text-white text-[18px] font-light leading-snug">
              {venue.name}
            </h3>
            {venue.established_year && (
              <p className="text-[9px] text-white/45 font-light tracking-wide mt-0.5">
                Est. {venue.established_year}
              </p>
            )}
          </div>
        </div>

        {/* Info strip */}
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <MapPin size={10} color="#BC8F8F" strokeWidth={1.5} />
            <span className="text-[11px] text-primary-50 font-light">
              {venue.city}, {venue.country}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Star size={11} color="#C8B06A" fill="#C8B06A" />
            <span className="text-[11px] text-[var(--color-text-primary)] font-light">{venue.rating}</span>
          </div>
        </div>

        {/* Expandable details */}
        <AnimatePresence>
          {expanded && (
            <motion.div
              key="details"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-5 space-y-4 border-t border-[var(--color-border)]">
                <p className="text-[12px] text-primary-60 leading-relaxed font-light italic pt-4 font-serif">
                  {venue.description}
                </p>
                {venue.services && (
                  <div className="flex flex-wrap gap-1.5">
                    {venue.services.map((s) => (
                      <span
                        key={s}
                        className="px-2.5 py-1 bg-[var(--color-bg-elevated)] text-[var(--color-text-primary)]/65 text-[9px] rounded-full font-light tracking-wide"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                )}
                <button className="w-full py-3.5 bg-[#043927] text-[#FDF5E6] text-[10px] tracking-[0.22em] uppercase rounded-2xl font-light">
                  Book via The Muse Concierge
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}