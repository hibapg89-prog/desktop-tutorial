import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";
import { base44 } from "@/api/base44Client";
import { formatPrice } from "@/utils/locale";

export default function CommunityDiscoveries() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const me = await base44.auth.me().catch(() => null);
        const all = await base44.entities.Product.filter({ is_profile_visible: true });
        const others = me?.id ? all.filter(p => p.created_by_id !== me.id) : all;
        setProducts(others.slice(0, 12));
      } catch {
        setProducts([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading || !products.length) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-[#BC8F8F] text-sm leading-none">✦</span>
        <h2 className="font-serif text-lg text-[var(--color-text-primary)] font-light">
          From the Community
        </h2>
      </div>

      <div className="flex gap-3 -mx-5 px-5 overflow-x-auto hide-scrollbar pb-2">
        {products.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex-shrink-0 w-36"
          >
            <Link
              to={`/product/${p.id}`}
              className="block rounded-2xl overflow-hidden border border-[var(--color-border)] bg-[var(--color-bg-surface)]"
            >
              <div className="h-32 bg-[var(--color-bg-elevated)] flex items-center justify-center">
                {p.image_url ? (
                  <img
                    src={p.image_url}
                    alt={p.name}
                    className="w-full h-full object-contain p-3"
                  />
                ) : (
                  <SwanLogo size={28} color="var(--color-text-primary)" />
                )}
              </div>
              <div className="p-2.5">
                {p.brand && (
                  <p className="text-[9px] tracking-[0.12em] uppercase text-[#BC8F8F] font-light truncate">
                    {p.brand}
                  </p>
                )}
                <p className="text-[12px] text-[var(--color-text-primary)] font-light leading-snug mt-0.5 line-clamp-2">
                  {p.name}
                </p>
                {p.price > 0 && (
                  <p className="text-[10px] text-primary-50 font-light mt-1">
                    {formatPrice(p.price)}
                  </p>
                )}
              </div>
            </Link>
          </motion.div>
        ))}
        <div className="flex-shrink-0 w-2" />
      </div>
    </div>
  );
}
