import { useState, useEffect } from "react";
import { ChevronLeft, Send, Sparkles, Bookmark, Share2, Flag, MessageCircle, Play } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";
import StarRating from "@/components/StarRating";
import BrandResponseSection from "@/components/BrandResponseSection";
import ReportModal from "@/components/ReportModal";
import { parseSegments } from "@/utils/richText";
import { computeTier } from "@/utils/trustTier";
import { createNotification } from "@/utils/notifications";

export default function CommunityPostDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewText, setReviewText] = useState("");
  const [rating, setRating] = useState(5);
  const [submitting, setSubmitting] = useState(false);
  const [user, setUser] = useState(null);
  const [authorTier, setAuthorTier] = useState(null);
  const [reporting, setReporting] = useState(false);
  const [adoredIds, setAdoredIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("muse_adored") || "[]")); }
    catch { return new Set(); }
  });
  const [collectedIds, setCollectedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("muse_collected") || "[]")); }
    catch { return new Set(); }
  });

  const load = async () => {
    const [p, rs, u] = await Promise.all([
      base44.entities.CommunityPost.get(id),
      base44.entities.Review.filter({ post_id: id }),
      base44.auth.me().catch(() => null),
    ]);
    setPost(p);
    setReviews(rs.sort((a, b) => new Date(b.created_date) - new Date(a.created_date)));
    setUser(u);
    setLoading(false);
    if (p?.created_by_id) {
      try {
        const [authorPosts, authorBadges] = await Promise.all([
          base44.entities.CommunityPost.filter({ created_by_id: p.created_by_id }),
          base44.entities.UserBadge.filter({ user_id: p.created_by_id }),
        ]);
        setAuthorTier(computeTier(
          Array.isArray(authorPosts) ? authorPosts.length : 0,
          Array.isArray(authorBadges) ? authorBadges.length : 0,
        ));
      } catch {}
    }
  };

  useEffect(() => {
    load();
  }, [id]);

  const handlePassAlong = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const url = post?.product_id
      ? `${window.location.origin}/product/${post.product_id}`
      : `${window.location.origin}/community/${post?.id || ""}`;
    const stars = post?.rating ? `${"★".repeat(Math.round(post.rating))}${"☆".repeat(5 - Math.round(post.rating))} ` : "";
    const brand = post?.brand ? `${post.brand} — ` : "";
    const name = post?.name || "";
    const shade = post?.shade ? ` · ${post.shade}` : "";
    const review = post?.review_text ? `\n\n"${post.review_text}"` : "";
    const caption = `${stars}${brand}${name}${shade}${review}\n\nFound via The Muse\n${url}`;
    if (navigator.share) {
      try { await navigator.share({ title: `${brand}${name}${shade}`, url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(caption); } catch {}
    navigate("/messages");
  };

  const toggleAdore = () => {
    if (!post) return;
    const wasAdored = adoredIds.has(id);
    setAdoredIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      try { localStorage.setItem("muse_adored", JSON.stringify([...next])); } catch {}
      return next;
    });
    const delta = wasAdored ? -1 : 1;
    setPost(prev => prev ? { ...prev, adore_count: Math.max(0, (prev.adore_count || 0) + delta) } : prev);
    base44.entities.CommunityPost.update(id, {
      adore_count: Math.max(0, (post.adore_count || 0) + delta),
    }).catch(() => {});
    if (!wasAdored && user && post.created_by_id && post.created_by_id !== user.id) {
      createNotification({
        user_id: post.created_by_id,
        type: "adore",
        title: (user.full_name || user.email || "A Muse Member") + " adored your review",
        body: (post.brand || "") + " " + (post.name || ""),
        ...(post.image_url ? { image_url: post.image_url } : {}),
        sender_id: user.id,
      });
    }
  };

  const toggleCollect = () => {
    if (!post) return;
    const wasCollected = collectedIds.has(id);
    setCollectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      try { localStorage.setItem("muse_collected", JSON.stringify([...next])); } catch {}
      return next;
    });
    const delta = wasCollected ? -1 : 1;
    setPost(prev => prev ? { ...prev, collect_count: Math.max(0, (prev.collect_count || 0) + delta) } : prev);
    base44.entities.CommunityPost.update(id, {
      collect_count: Math.max(0, (post.collect_count || 0) + delta),
    }).catch(() => {});
    if (!wasCollected && user && post.created_by_id && post.created_by_id !== user.id) {
      createNotification({
        user_id: post.created_by_id,
        type: "collect",
        title: (user.full_name || user.email || "A Muse Member") + " saved your review",
        body: (post.brand || "") + " " + (post.name || ""),
        ...(post.image_url ? { image_url: post.image_url } : {}),
        sender_id: user.id,
      });
    }
  };

  const submitReview = async () => {
    if (!reviewText.trim() || submitting) return;
    setSubmitting(true);
    try {
      const text = reviewText.trim();
      const preview = text.length > 80 ? text.slice(0, 80) + "…" : text;
      await base44.entities.Review.create({
        post_id: id,
        rating,
        review_text: text,
        author_name: user?.full_name || user?.email || "A Muse Member",
      });
      await base44.entities.CommunityPost.update(id, {
        review_count: (post.review_count || 0) + 1,
      });
      if (user && post.created_by_id && post.created_by_id !== user.id) {
        base44.entities.Notification.create({
          user_id: post.created_by_id,
          type: "whisper",
          title: (user.full_name || user.email || "A Muse Member") + " whispered on your review",
          body: "“" + preview + "”",
          ...(post.image_url ? { image_url: post.image_url } : {}),
          sender_id: user.id,
        }).catch(() => {});
      }
      setReviewText("");
      setRating(5);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
        <div className="swan-float"><SwanLogo size={40} color="var(--color-accent-gold)" /></div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center">
        <p className="font-serif text-lg text-primary-40 italic mb-3">This post is no longer available.</p>
        <button onClick={() => navigate("/community")} className="text-xs text-[#BC8F8F] underline">Back to feed</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      <div className="px-5 pt-14 pb-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="w-9 h-9 flex items-center justify-center rounded-full border border-[#043927]/20">
          <ChevronLeft size={18} color="var(--color-text-primary)" />
        </button>
        <h1 className="font-serif text-xl text-[var(--color-text-primary)] font-light">
          {{ review: "Review", swatch: "Shade Swatch", before_after: "Before & After", routine: "Routine", grwm: "GRWM" }[post.post_type] || "Review"}
        </h1>
      </div>

      <div className="px-5 pb-32">
        {/* Product + author review */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden mb-5">
          <div className="flex gap-4 p-4">
            <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0 bg-[var(--color-bg-elevated)] relative">
              {post.post_type === "before_after" ? (
                <div className="w-full h-full flex">
                  {post.image_url && <img src={post.image_url} alt="before" className="w-1/2 h-full object-cover" />}
                  {post.secondary_image_url && <img src={post.secondary_image_url} alt="after" className="w-1/2 h-full object-cover" />}
                  {!post.image_url && !post.secondary_image_url && <div className="w-full h-full flex items-center justify-center text-3xl">◑</div>}
                </div>
              ) : post.post_type === "routine" ? (
                <div className="w-full h-full flex flex-col items-center justify-center gap-1">
                  <SwanLogo size={22} color="var(--color-text-primary)" className="opacity-40" />
                  {post.routine_steps && (
                    <span className="text-[9px] text-primary-50 font-light">
                      {(() => { try { return JSON.parse(post.routine_steps).length; } catch { return ""; } })()} steps
                    </span>
                  )}
                </div>
              ) : post.post_type === "grwm" ? (
                <>
                  {post.image_url ? (
                    <img src={post.image_url} alt={post.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-[#043927]/[0.08]">
                      <Play size={28} color="var(--color-text-primary)" className="opacity-40" />
                    </div>
                  )}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-[#043927]/60 flex items-center justify-center">
                      <Play size={10} color="white" fill="white" className="ml-0.5" />
                    </div>
                  </div>
                </>
              ) : post.image_url ? (
                <img src={post.image_url} alt={post.name} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><SwanLogo size={26} color="var(--color-text-primary)" /></div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[9px] tracking-[0.15em] uppercase text-[#BC8F8F] font-light">{post.brand}</p>
              <p className="text-base text-[var(--color-text-primary)] font-light">{post.name}{post.shade ? ` · ${post.shade}` : ""}</p>
              {post.category && <p className="text-[10px] text-primary-40 font-light mt-0.5">{post.category}</p>}
              {post.post_type === "swatch" && post.skin_tone && (
                <div className="flex items-center gap-1.5 mt-0.5">
                  <div className="w-4 h-4 rounded-full border border-[var(--color-border)]" style={{ backgroundColor: post.skin_tone }} />
                  <span className="text-[10px] text-primary-50 font-light">Skin tone match</span>
                </div>
              )}
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <StarRating value={post.rating || 0} readOnly size={14} />
                <span className="text-[10px] text-primary-40 font-light">by {post.author_name || "A Muse Member"}</span>
                {authorTier && (
                  <span
                    className="text-[8px] tracking-[0.16em] uppercase font-light px-1.5 py-0.5 rounded-full"
                    style={{ color: authorTier.color, border: `1px solid ${authorTier.border}`, background: authorTier.bg }}
                  >
                    {authorTier.label}
                  </span>
                )}
              </div>
              <div className="mt-1">
                <span className={`inline-flex items-center gap-0.5 text-[8px] tracking-[0.1em] font-light px-1.5 py-0.5 rounded-full border ${
                  post.product_id
                    ? "text-[var(--color-text-primary)] border-[#043927]/18 bg-[#043927]/5"
                    : "text-[var(--color-text-primary)]/38 border-[var(--color-border)] bg-transparent"
                }`}>
                  {post.product_id ? "Certified Review" : "Community Voice"}
                </span>
              </div>
              {/* Interaction bar */}
              <div className="mt-3 flex items-center gap-4 border-t border-[var(--color-border)] pt-3">
                <button
                  onClick={toggleAdore}
                  className={`flex items-center gap-1.5 text-[12px] font-light transition-colors ${adoredIds.has(id) ? "text-[var(--color-accent-gold)]" : "text-primary-40"}`}
                >
                  <Sparkles size={14} />
                  {adoredIds.has(id) ? "Adored" : "Adore"}
                  {(post.adore_count || 0) > 0 && (
                    <span className="text-[10px] opacity-55">{post.adore_count}</span>
                  )}
                </button>
                <button
                  onClick={toggleCollect}
                  className={`flex items-center gap-1.5 text-[12px] font-light transition-colors ${collectedIds.has(id) ? "text-[var(--color-text-primary)]" : "text-primary-40"}`}
                >
                  <Bookmark size={14} fill={collectedIds.has(id) ? "var(--color-text-primary)" : "none"} />
                  {collectedIds.has(id) ? "Saved" : "Save"}
                </button>
                <div className="flex items-center gap-1.5 text-[12px] text-primary-35 font-light">
                  <MessageCircle size={14} />
                  {reviews.length}
                </div>
                <div className="flex-1" />
                <button
                  onClick={handlePassAlong}
                  className="flex items-center text-primary-35 hover:text-[var(--color-text-primary)] transition-colors"
                >
                  <Share2 size={15} />
                </button>
                <button
                  onClick={() => setReporting(true)}
                  className="flex items-center text-primary-25 hover:text-[#BC8F8F] transition-colors"
                >
                  <Flag size={14} />
                </button>
              </div>
              {post.created_by_id && post.created_by_id !== user?.id && (
                <div className="mt-2">
                  <button
                    onClick={() => navigate(`/messages/${post.created_by_id}`)}
                    className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-[#BC8F8F] font-light border border-[#BC8F8F]/40 rounded-full px-3 py-1.5 hover:bg-[#BC8F8F] hover:text-white transition-colors"
                  >
                    <Send size={10} /> Message {post.author_name?.split(" ")[0] || "author"}
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className="px-4 pb-4">
            <p className="text-sm text-[var(--color-text-primary)]/80 font-light leading-relaxed">
              {parseSegments(post.review_text).map((seg, i) =>
                seg.type === "tag"
                  ? <span key={i} onClick={() => navigate(`/community?q=${encodeURIComponent("#" + seg.value)}`)} className="text-[var(--color-accent-gold)] cursor-pointer hover:underline">#{seg.value}</span>
                  : seg.type === "mention"
                  ? <span key={i} className="text-[#BC8F8F]">@{seg.value}</span>
                  : <span key={i}>{seg.value}</span>
              )}
            </p>
            {post.tags && (() => {
              try {
                const tagList = JSON.parse(post.tags);
                if (!tagList.length) return null;
                return (
                  <div className="flex flex-wrap gap-2 mt-3">
                    {tagList.map(tag => (
                      <span
                        key={tag}
                        onClick={() => navigate(`/community?q=${encodeURIComponent("#" + tag)}`)}
                        className="text-[11px] text-[var(--color-accent-gold)] font-light cursor-pointer hover:underline"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                );
              } catch { return null; }
            })()}
            {post.product_id && (
              <Link to={`/product/${post.product_id}`} className="inline-block mt-3 text-[11px] text-[#BC8F8F] underline underline-offset-2 font-light">
                View product →
              </Link>
            )}
          </div>
        </div>

        <BrandResponseSection post={post} user={user} />

        {/* Type-specific detail sections */}
        {post.post_type === "before_after" && (post.image_url || post.secondary_image_url) && (
          <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] overflow-hidden mb-5">
            <div className="flex">
              {post.image_url && (
                <div className="flex-1 relative">
                  <img src={post.image_url} alt="before" className="w-full h-56 object-cover" />
                  <div className="absolute top-2 left-2 bg-[#043927]/60 text-white text-[9px] tracking-widest px-2 py-0.5 rounded font-light">BEFORE</div>
                </div>
              )}
              {post.secondary_image_url && (
                <div className="flex-1 relative">
                  <img src={post.secondary_image_url} alt="after" className="w-full h-56 object-cover" />
                  <div className="absolute top-2 left-2 bg-[#043927]/60 text-white text-[9px] tracking-widest px-2 py-0.5 rounded font-light">AFTER</div>
                </div>
              )}
            </div>
          </div>
        )}

        {post.post_type === "grwm" && post.video_url && (
          <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] p-4 mb-5">
            <p className="text-[10px] tracking-[0.2em] uppercase text-primary-40 font-light mb-3">Watch</p>
            <a
              href={post.video_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-3 bg-[#043927] text-[#FDF5E6] rounded-2xl px-5 py-3.5 hover:bg-[#043927]/90 transition-colors"
            >
              <Play size={18} color="white" fill="white" />
              <div>
                <p className="text-xs tracking-[0.15em] font-light">Watch on video</p>
                {post.grwm_duration && (
                  <p className="text-[10px] opacity-60 font-light">{post.grwm_duration} GRWM</p>
                )}
              </div>
            </a>
          </div>
        )}

        {post.post_type === "routine" && post.routine_steps && (() => {
          let parsedSteps = [];
          try { parsedSteps = JSON.parse(post.routine_steps); } catch {}
          if (!parsedSteps.length) return null;
          return (
            <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] p-4 mb-5">
              <p className="text-[10px] tracking-[0.2em] uppercase text-primary-40 font-light mb-3">Ritual Steps</p>
              <div className="space-y-2.5">
                {parsedSteps.map((step, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <span className="text-[10px] text-primary-30 font-light mt-0.5 w-5 text-right shrink-0">{idx + 1}.</span>
                    <div className="flex-1">
                      <p className="text-xs text-[var(--color-text-primary)] font-light">
                        {step.brand && <span className="text-[#BC8F8F]">{step.brand} </span>}
                        {step.name}
                      </p>
                      {step.note && <p className="text-[10px] text-primary-40 font-light mt-0.5">{step.note}</p>}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {/* Whispers */}
        <div className="flex items-center gap-2 mb-3">
          <MessageCircle size={14} color="var(--color-text-primary)" className="opacity-40" />
          <p className="text-xs tracking-[0.2em] uppercase text-primary-50 font-light">
            Whispers · {reviews.length}
          </p>
        </div>

        <div className="space-y-3 mb-6">
          {reviews.length === 0 ? (
            <p className="font-serif text-sm text-primary-40 italic">No whispers yet — share your thoughts below.</p>
          ) : (
            reviews.map((r) => (
              <motion.div
                key={r.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] p-3.5"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-[var(--color-text-primary)] font-light">{r.author_name || "A Muse Member"}</span>
                  <StarRating value={r.rating || 0} readOnly size={11} />
                </div>
                <p className="text-sm text-primary-70 font-light leading-relaxed">{r.review_text}</p>
                {r.created_by_id && r.created_by_id !== user?.id && (
                  <button
                    onClick={() => navigate(`/messages/${r.created_by_id}`)}
                    className="mt-2 inline-flex items-center gap-1 text-[10px] text-[#BC8F8F] font-light hover:underline"
                  >
                    <Send size={9} /> Message {r.author_name?.split(" ")[0] || "member"}
                  </button>
                )}
              </motion.div>
            ))
          )}
        </div>

        {/* Add review */}
        <div className="bg-[var(--color-bg-surface)] rounded-2xl border border-[var(--color-border)] p-4">
          <p className="text-[10px] tracking-[0.2em] uppercase text-primary-40 font-light mb-2">Add your whisper</p>
          <StarRating value={rating} onChange={setRating} size={20} />
          <textarea
            value={reviewText}
            onChange={(e) => setReviewText(e.target.value)}
            placeholder="What did you think?"
            rows={3}
            className="mt-3 w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-30 resize-none"
          />
          <button
            onClick={submitReview}
            disabled={!reviewText.trim() || submitting}
            className={`mt-3 w-full py-3 rounded-2xl text-xs tracking-[0.2em] font-light ${
              reviewText.trim() && !submitting
                ? "bg-[#043927] text-[#FDF5E6]"
                : "bg-[var(--color-border)] text-primary-40 cursor-not-allowed"
            }`}
          >
            {submitting ? "Posting…" : "POST REVIEW"}
          </button>
        </div>
      </div>
      {reporting && <ReportModal postId={post.id} onClose={() => setReporting(false)} />}
    </div>
  );
}