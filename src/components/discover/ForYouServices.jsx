import { useState, useEffect } from "react";
import { MapPin, Star } from "lucide-react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { getUserPreferences } from "@/lib/userPreferences";

export default function ForYouServices() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const { serviceTypes } = await getUserPreferences();
        // Strict filtering — only show venues whose type matches the user's
        // preferred service types derived from scan history.
        if (!serviceTypes.length) {
          setVenues([]);
          return;
        }
        const all = await base44.entities.VenueService.list("-rating", 20);
        const matched = all.filter((v) => serviceTypes.includes(v.type));
        setVenues(matched.slice(0, 4));
      } catch {
        setVenues([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !venues.length) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <MapPin size={14} color="#C8B06A" strokeWidth={1.5} />
          <h2 className="font-serif text-lg text-[var(--color-text-primary)] font-light">Services Near You</h2>
        </div>
        <Link to="/map" className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-text-muted)] font-light">View Map</Link>
      </div>
      <div className="flex gap-3 overflow-x-auto hide-scrollbar -mx-5 px-5 pb-1">
        {venues.map((v, i) => (
          <motion.div
            key={v.id}
            initial={{ opacity: 0, x: 12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 w-44"
          >
            <Link to="/map" className="block rounded-2xl overflow-hidden bg-[var(--color-bg-surface)] border border-[var(--color-border)]">
              <div className="h-24 bg-[var(--color-bg-elevated)] relative">
                {v.image_url && (
                  <img src={v.image_url} alt={v.name} className="w-full h-full object-cover" />
                )}
                {v.is_muse_partner && (
                  <span className="absolute top-2 left-2 text-[8px] tracking-[0.15em] uppercase bg-[#043927] text-[#FDF5E6] px-2 py-0.5 rounded-full">Muse Partner</span>
                )}
              </div>
              <div className="p-3">
                <p className="text-[9px] text-[#BC8F8F] uppercase tracking-wide font-light">{v.type}</p>
                <p className="text-sm text-[var(--color-text-primary)] font-light truncate">{v.name}</p>
                <div className="flex items-center gap-1 mt-1">
                  {v.rating && <><Star size={10} color="#C8B06A" fill="#C8B06A" /><span className="text-[10px] text-[var(--color-text-secondary)] font-light">{v.rating}</span></>}
                  {v.city && <span className="text-[10px] text-[var(--color-text-muted)] font-light ml-auto truncate">{v.city}</span>}
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
