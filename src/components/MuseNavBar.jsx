import { Home, Search, ShoppingBag, User, Users } from "lucide-react";
import { Link, useLocation } from "react-router-dom";

export default function MuseNavBar() {
  const location = useLocation();
  const path = location.pathname;

  const isActive = (p) => path === p;

  const items = [
    { to: "/home",     label: "L'Atelier",  icon: Home },
    { to: "/discover", label: "For You",   icon: Search },
    { to: "/vanity",   label: "Vanity",   icon: ShoppingBag },
    { to: "/community", label: "Community",  icon: Users },
    { to: "/profile",  label: "La Muse",     icon: User },
  ];

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 z-50 px-4"
      style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 0.5rem)" }}
    >
      <div
        className="max-w-lg mx-auto rounded-[1.75rem] flex items-end justify-around px-3 pt-2.5 pb-2.5"
        style={{
          background: "rgba(253, 245, 230, 0.82)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          border: "1px solid rgba(200, 176, 106, 0.2)",
          boxShadow: "0 -2px 24px rgba(200, 176, 106, 0.08), 0 8px 32px rgba(4, 57, 39, 0.06)",
        }}
      >
        {items.map(({ to, label, icon: Icon }) => {
          const active = isActive(to);
          return (
            <Link
              key={to}
              to={to}
              aria-current={active ? "page" : undefined}
              className="flex flex-col items-center gap-1 pt-1 pb-0.5 relative"
            >
              {/* Active hairline accent */}
              {active && (
                <span
                  className="absolute top-0 w-6 h-px rounded-full"
                  style={{ background: "linear-gradient(to right, transparent, #C8B06A, transparent)" }}
                />
              )}
              <Icon
                size={19}
                strokeWidth={active ? 1.6 : 1.3}
                color={active ? "var(--color-text-primary)" : "var(--color-text-muted)"}
              />
              <span
                className={
                  active
                    ? "text-[0.5625rem] tracking-[0.15em] uppercase text-[var(--color-text-primary)]"
                    : "text-[0.5625rem] tracking-[0.15em] uppercase font-light text-[var(--color-text-muted)]"
                }
                style={active ? { fontFamily: "'Cormorant Garamond', Georgia, serif", fontWeight: 500, letterSpacing: "0.08em" } : {}}
              >
                {label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
