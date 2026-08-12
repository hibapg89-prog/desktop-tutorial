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
    { to: "/community", label: "Le Cercle",  icon: Users },
    { to: "/profile",  label: "La Muse",     icon: User },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-[var(--color-bg)] border-t border-[var(--color-border)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <div className="max-w-lg mx-auto flex items-end justify-around px-4 pt-2 pb-3">
        {items.map(({ to, label, icon: Icon }) => (
          <Link key={to} to={to} aria-current={isActive(to) ? "page" : undefined} className="flex flex-col items-center gap-0.5 pb-1">
            <Icon size={20} strokeWidth={1.5} color={isActive(to) ? 'var(--color-text-primary)' : 'var(--color-text-muted)'} />
            <span className={`text-[10px] tracking-widest uppercase font-light ${isActive(to) ? 'text-[var(--color-text-primary)]' : 'text-[var(--color-text-muted)]'}`}>{label}</span>
          </Link>
        ))}
      </div>
    </nav>
  );
}
