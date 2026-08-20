import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Camera, Image as ImageIcon, Link as LinkIcon, Mic, CheckCircle2, XCircle, ChevronRight, ArrowLeft, History } from "lucide-react";
import { base44 } from "@/api/base44Client";
import { motion } from "framer-motion";

const METHOD_ICON = {
  camera:  Camera,
  gallery: ImageIcon,
  link:    LinkIcon,
  voice:   Mic,
};

const METHOD_LABEL = {
  camera:  "Camera",
  gallery: "Gallery",
  link:    "Link",
  voice:   "Voice",
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const min = Math.floor(diff / 60000);
  if (min < 1) return "just now";
  if (min < 60) return `${min}m ago`;
  const hr = Math.floor(min / 60);
  if (hr < 24) return `${hr}h ago`;
  const day = Math.floor(hr / 24);
  if (day < 7) return `${day}d ago`;
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function fullTimestamp(iso) {
  if (!iso) return "";
  return new Date(iso).toLocaleString(undefined, {
    month: "short", day: "numeric", hour: "2-digit", minute: "2-digit",
  });
}

export default function ScanHistory() {
  const navigate = useNavigate();
  const [logs, setLogs]   = useState(null);
  const [loading, setLoading] = useState(true);

  const loadLogs = useCallback(async () => {
    try {
      const data = await base44.entities.ScanLog.list("-created_date", 200);
      setLogs(data || []);
    } catch {
      setLogs([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadLogs(); }, [loadLogs]);

  // Realtime: refresh when a new scan is logged while viewing
  useEffect(() => {
    const unsub = base44.entities.ScanLog.subscribe(() => loadLogs());
    return unsub;
  }, [loadLogs]);

  const total   = logs?.length || 0;
  const failed  = logs?.filter(l => l.status === "failed").length || 0;
  const success = total - failed;

  return (
    <main className="min-h-screen bg-[var(--color-bg)]">
      {/* Header */}
      <header className="px-5 pt-14 pb-4 flex items-center gap-3">
        <button
          onClick={() => navigate(-1)}
          aria-label="Back"
          className="w-9 h-9 rounded-full border border-[var(--color-border)] flex items-center justify-center flex-shrink-0"
        >
          <ArrowLeft size={16} color="var(--color-text-primary)" />
        </button>
        <div className="flex-1">
          <p className="text-[0.5625rem] tracking-[0.3em] uppercase text-gold-70 font-light">The Muse</p>
          <h1 className="font-serif text-2xl text-[var(--color-text-primary)] font-light tracking-wide">Scan History</h1>
        </div>
        <History size={18} color="var(--color-text-primary)" className="opacity-30" />
      </header>

      {/* Summary chips */}
      <div className="px-5 mb-5 flex gap-2">
        <div className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl py-3 px-4">
          <p className="font-serif text-xl text-[var(--color-text-primary)] font-light leading-none">{total}</p>
          <p className="text-[0.5625rem] tracking-[0.15em] uppercase text-primary-45 font-light mt-1">Total</p>
        </div>
        <div className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl py-3 px-4">
          <p className="font-serif text-xl text-[#3A8A6A] font-light leading-none">{success}</p>
          <p className="text-[0.5625rem] tracking-[0.15em] uppercase text-primary-45 font-light mt-1">Identified</p>
        </div>
        <div className="flex-1 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl py-3 px-4">
          <p className="font-serif text-xl text-[#BC6B6B] font-light leading-none">{failed}</p>
          <p className="text-[0.5625rem] tracking-[0.15em] uppercase text-primary-45 font-light mt-1">Failed</p>
        </div>
      </div>

      {/* List */}
      <div className="px-5 pb-16">
        {loading && (
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="h-16 rounded-2xl bg-[var(--color-bg-surface)] border border-[var(--color-border)] animate-pulse" />
            ))}
          </div>
        )}

        {!loading && total === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-14 h-14 rounded-full bg-[var(--color-bg-surface)] border border-[var(--color-border)] flex items-center justify-center mb-4">
              <History size={22} color="var(--color-text-muted)" />
            </div>
            <p className="font-serif text-lg text-[var(--color-text-primary)] font-light">No scans yet</p>
            <p className="text-xs text-primary-40 font-light italic mt-1 max-w-[220px]">
              Every product you scan will appear here, so you can review your history and spot any missed attempts.
            </p>
          </div>
        )}

        {!loading && total > 0 && (
          <div className="space-y-2">
            {logs.map((log, i) => {
              const isFailed = log.status === "failed";
              const Icon = METHOD_ICON[log.scan_method] || Camera;
              return (
                <motion.div
                  key={log.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(i * 0.02, 0.3) }}
                >
                  {isFailed ? (
                    // Failed attempt — non-interactive, warm-tinted
                    <div
                      className="flex items-center gap-3 rounded-2xl p-3.5"
                      style={{
                        background: "rgba(188, 107, 107, 0.06)",
                        border: "1px solid rgba(188, 107, 107, 0.22)",
                      }}
                    >
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: "rgba(188, 107, 107, 0.12)" }}
                      >
                        <Icon size={16} color="#BC6B6B" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <XCircle size={12} color="#BC6B6B" />
                          <span className="text-[0.5625rem] tracking-[0.15em] uppercase text-[#BC6B6B] font-light">
                            {METHOD_LABEL[log.scan_method] || "Scan"} · Failed
                          </span>
                        </div>
                        <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light truncate mt-0.5">
                          {log.error_reason || "The Muse couldn't identify a product"}
                        </p>
                        <p className="text-[0.625rem] text-primary-35 font-light mt-0.5">{fullTimestamp(log.created_date)}</p>
                      </div>
                    </div>
                  ) : (
                    // Successful scan — links to the product
                    <Link
                      to={log.product_id ? `/product/${log.product_id}` : "#"}
                      className="flex items-center gap-3 bg-[var(--color-bg-surface)] border border-[var(--color-border)] rounded-2xl p-3.5 hover:border-[#C8B06A]/40 transition-colors"
                    >
                      <div className="w-10 h-10 rounded-full bg-[var(--color-bg-elevated)] flex items-center justify-center flex-shrink-0">
                        <Icon size={16} color="var(--color-text-primary)" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <CheckCircle2 size={12} color="#3A8A6A" />
                          <span className="text-[0.5625rem] tracking-[0.15em] uppercase text-primary-45 font-light">
                            {METHOD_LABEL[log.scan_method] || "Scan"}
                            {log.product_count > 1 ? ` · ${log.product_count} found` : ""}
                          </span>
                        </div>
                        <p className="text-[0.75rem] text-[var(--color-text-primary)] font-light truncate mt-0.5">
                          {log.brand ? `${log.brand} — ${log.name || "Product"}` : (log.name || "Product identified")}
                        </p>
                        <p className="text-[0.625rem] text-primary-35 font-light mt-0.5">
                          {fullTimestamp(log.created_date)} · {timeAgo(log.created_date)}
                        </p>
                      </div>
                      <ChevronRight size={16} color="var(--color-text-primary)" className="opacity-20 flex-shrink-0" />
                    </Link>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}