import { useState, useEffect, useRef } from "react";
import { ChevronLeft, Send, Heart, Bookmark, Share2, Flag, MessageCircle, Play, Smile, Image, X, Trash2, Edit3 } from "lucide-react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import SwanLogo from "@/components/SwanLogo";
import StarRating from "@/components/StarRating";
import BrandResponseSection from "@/components/BrandResponseSection";
import ReportModal from "@/components/ReportModal";
import { parseSegments } from "@/utils/richText";
import { computeTier } from "@/utils/trustTier";
import { createNotification } from "@/utils/notifications";

const BEAUTY_EMOJIS = [
  "💄","💅","💋","✨","🌹","🌸","🫦","💆","🛁","🪞",
  "🧴","💐","🫶","❤️","🔥","💯","😍","🥰","✅","🌟",
  "💫","🎀","🌺","💗","🥹","👑","🤌","💎","🦋","🩷",
];
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

  // Edit / delete state — post
  const [editingPost, setEditingPost] = useState(false);
  const [editText, setEditText] = useState("");
  const [editRating, setEditRating] = useState(5);
  const [deletingPost, setDeletingPost] = useState(false);
  // Edit / delete state — whispers
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [editReviewText, setEditReviewText] = useState("");
  const [deletingReviewId, setDeletingReviewId] = useState(null);

  // Whisper media state
  const [attachedPhoto, setAttachedPhoto] = useState(null);
  const [attachedGif, setAttachedGif]     = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker]     = useState(false);
  const [gifSearch, setGifSearch]             = useState("beauty");
  const [gifResults, setGifResults]           = useState([]);
  const [gifLoading, setGifLoading]           = useState(false);
  const photoInputRef = useRef(null);

  const [adoredIds, setAdoredIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("muse_adored") || "[]")); }
    catch { return new Set(); }
  });
  const [collectedIds, setCollectedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("muse_collected") || "[]")); }
    catch { return new Set(); }
  });

  // Fetch GIFs when GIF picker is open — proxied via server-side searchGifs function
  useEffect(() => {
    if (!showGifPicker) return;
    const t = setTimeout(async () => {
      setGifLoading(true);
      try {
        const res = await base44.functions.invoke("searchGifs", { q: gifSearch || "beauty", limit: 12 });
        setGifResults(
          (Array.isArray(res?.gifs) ? res.gifs : []).map(g => ({
            id: g.id,
            url: g.url || "",
            preview: g.tinygif || g.url || "",
          })).filter(g => g.url)
        );
      } catch {
        setGifResults([]);
      } finally {
        setGifLoading(false);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [showGifPicker, gifSearch]);

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
        title: (user.full_name || user.email || "A Muse Member") + " adored your musing",
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
        title: (user.full_name || user.email || "A Muse Member") + " saved your musing",
        body: (post.brand || "") + " " + (post.name || ""),
        ...(post.image_url ? { image_url: post.image_url } : {}),
        sender_id: user.id,
      });
    }
  };

  const handlePhotoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 10 * 1024 * 1024) return; // 10MB limit
    const reader = new FileReader();
    reader.onload = (ev) => {
      setAttachedPhoto(ev.target.result);
      setAttachedGif(null);
    };
    reader.readAsDataURL(file);
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
        ...(attachedPhoto ? { image_url: attachedPhoto } : {}),
        ...(attachedGif   ? { gif_url:   attachedGif  } : {}),
      });
      await base44.entities.CommunityPost.update(id, {
        review_count: (post.review_count || 0) + 1,
      });
      if (user && post.created_by_id && post.created_by_id !== user.id) {
        base44.entities.Notification.create({
          user_id: post.created_by_id,
          type: "whisper",
          title: (user.full_name || user.email || "A Muse Member") + " whispered on your musing",
          body: "“" + preview + "”",
          ...(post.image_url ? { image_url: post.image_url } : {}),
          sender_id: user.id,
        }).catch(() => {});
      }
      setReviewText("");
      setRating(5);
      setAttachedPhoto(null);
      setAttachedGif(null);
      setShowEmojiPicker(false);
      setShowGifPicker(false);
      await load();
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeletePost = async () => {
    try {
      await base44.entities.CommunityPost.delete(id);
      navigate("/community");
    } catch {}
  };

  const handleSavePost = async () => {
    if (!editText.trim()) return;
    try {
      await base44.entities.CommunityPost.update(id, { review_text: editText, rating: editRating });
      setPost(prev => prev ? { ...prev, review_text: editText, rating: editRating } : prev);
      setEditingPost(false);
    } catch {}
  };

  const handleDeleteReview = async (reviewId) => {
    try {
      await base44.entities.Review.delete(reviewId);
      setReviews(prev => prev.filter(r => r.id !== reviewId));
      setPost(prev => prev ? { ...prev, review_count: Math.max(0, (prev.review_count || 0) - 1) } : prev);
      await base44.entities.CommunityPost.update(id, { review_count: Math.max(0, (post.review_count || 0) - 1) });
      setDeletingReviewId(null);
    } catch {}
  };

  const handleSaveReview = async (reviewId) => {
    if (!editReviewText.trim()) return;
    try {
      await base44.entities.Review.update(reviewId, { review_text: editReviewText });
      setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, review_text: editReviewText } : r));
      setEditingReviewId(null);
    } catch {}
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
        <p className="font-serif text-lg text-primary-40 italic mb-3">This musing is no longer available.</p>
        <button onClick={() => navigate("/community")} className="text-xs text-[#BC8F8F] underline">Back to feed</button>
      </div>
    );
  }

  const isVideoBase64 = post.video_url && post.video_url.startsWith("data:video");

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
        {/* Product + author musing */}
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
                  <Heart size={14} fill={adoredIds.has(id) ? "currentColor" : "none"} />
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
              {post.created_by_id && post.created_by_id === user?.id && (
                <div className="mt-2 flex items-center gap-3">
                  {!editingPost && !deletingPost && (
                    <>
                      <button
                        onClick={() => { setEditText(post.review_text || ""); setEditRating(post.rating || 5); setEditingPost(true); }}
                        className="inline-flex items-center gap-1 text-[10px] text-primary-40 hover:text-[var(--color-text-primary)] transition-colors"
                      >
                        <Edit3 size={11} /> Edit
                      </button>
                      <button
                        onClick={() => setDeletingPost(true)}
                        className="inline-flex items-center gap-1 text-[10px] text-primary-30 hover:text-[#BC8F8F] transition-colors"
                      >
                        <Trash2 size={11} /> Delete
                      </button>
                    </>
                  )}
                  {deletingPost && (
                    <div className="flex items-center gap-2 text-[10px]">
                      <span className="text-primary-50 font-light">Remove this muse?</span>
                      <button onClick={handleDeletePost} className="text-[#BC8F8F] underline font-light">Yes</button>
                      <button onClick={() => setDeletingPost(false)} className="text-primary-40 underline font-light">No</button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="px-4 pb-4">
            {editingPost ? (
              <div className="space-y-2">
                <StarRating value={editRating} onChange={setEditRating} size={16} />
                <textarea
                  value={editText}
                  onChange={e => setEditText(e.target.value)}
                  rows={4}
                  className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-3 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-30 resize-none"
                />
                <div className="flex gap-2">
                  <button onClick={handleSavePost} className="text-[11px] bg-[#043927] text-white rounded-full px-4 py-1.5 font-light">Save</button>
                  <button onClick={() => setEditingPost(false)} className="text-[11px] text-primary-40 font-light underline">Cancel</button>
                </div>
              </div>
            ) : (
            <>
            <p className="text-sm text-[var(--color-text-primary)]/80 font-light leading-relaxed">
              {parseSegments(post.review_text).map((seg, i) =>
                seg.type === "tag"
                  ? <span key={i} onClick={() => navigate(`/community?q=${encodeURIComponent("#" + seg.value)}`)} className="text-[var(--color-accent-gold)] cursor-pointer hover:underline">#{seg.value}</span>
                  : seg.type === "mention"
                  ? <span key={i} className="text-[#BC8F8F]">@{seg.value}</span>
                  : <span key={i}>{seg.value}</span>
              )}
            </p>
            {/* Post GIF if attached */}
            {post.gif_url && (
              <div className="mt-3 rounded-xl overflow-hidden border border-[var(--color-border)] max-w-xs">
                <img src={post.gif_url} alt="gif" className="w-full object-cover" />
              </div>
            )}
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
            </>
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
            {isVideoBase64 ? (
              <video
                src={post.video_url}
                controls
                playsInline
                className="w-full rounded-xl max-h-72 bg-black"
              />
            ) : (
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
            )}
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
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-xs text-[var(--color-text-primary)] font-light">{r.author_name || "A Muse Member"}</span>
                    {r.verified_purchase && (
                      <>
                        <style>{`
                          @property --vp-a { syntax: "<angle>"; initial-value: 0deg; inherits: false; }
                          @keyframes vp-spin { to { --vp-a: 360deg; } }
                          .verified-badge-glow { animation: vp-spin 2.4s linear infinite; background: conic-gradient(from var(--vp-a), #C8B06A, #FFF9E8 20%, #C8B06A 40%, #0B3C26 60%, #C8B06A 80%, #FFF9E8, #C8B06A); padding: 1px; border-radius: 999px; }
                          .verified-badge-inner { background: var(--color-bg-card, #1a1a1a); border-radius: 999px; padding: 1px 6px; }
                        `}</style>
                        <span className="verified-badge-glow">
                          <span className="verified-badge-inner inline-flex items-center gap-0.5 text-[0.5rem] tracking-[0.08em] font-light" style={{ color: "#C8B06A" }}>
                            ✦ Verified Purchase
                          </span>
                        </span>
                      </>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <StarRating value={r.rating || 0} readOnly size={11} />
                    {r.created_by_id && r.created_by_id === user?.id && editingReviewId !== r.id && deletingReviewId !== r.id && (
                      <>
                        <button
                          onClick={() => { setEditReviewText(r.review_text || ""); setEditingReviewId(r.id); }}
                          className="text-primary-30 hover:text-[var(--color-text-primary)] transition-colors"
                        >
                          <Edit3 size={11} />
                        </button>
                        <button
                          onClick={() => setDeletingReviewId(r.id)}
                          className="text-primary-25 hover:text-[#BC8F8F] transition-colors"
                        >
                          <Trash2 size={11} />
                        </button>
                      </>
                    )}
                  </div>
                </div>
                {deletingReviewId === r.id && (
                  <div className="flex items-center gap-2 text-[10px] mb-1.5">
                    <span className="text-primary-50 font-light">Remove this whisper?</span>
                    <button onClick={() => handleDeleteReview(r.id)} className="text-[#BC8F8F] underline font-light">Yes</button>
                    <button onClick={() => setDeletingReviewId(null)} className="text-primary-40 underline font-light">No</button>
                  </div>
                )}
                {editingReviewId === r.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editReviewText}
                      onChange={e => setEditReviewText(e.target.value)}
                      rows={3}
                      className="w-full bg-[var(--color-bg)] border border-[var(--color-border)] rounded-xl p-2.5 text-sm text-[var(--color-text-primary)] font-light outline-none resize-none"
                    />
                    <div className="flex gap-2">
                      <button onClick={() => handleSaveReview(r.id)} className="text-[11px] bg-[#043927] text-white rounded-full px-4 py-1 font-light">Save</button>
                      <button onClick={() => setEditingReviewId(null)} className="text-[11px] text-primary-40 font-light underline">Cancel</button>
                    </div>
                  </div>
                ) : (
                <p className="text-sm text-primary-70 font-light leading-relaxed">{r.review_text}</p>
                )}
                {/* Whisper photo attachment */}
                {r.image_url && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-[var(--color-border)] max-w-xs">
                    <img src={r.image_url} alt="attachment" className="w-full object-cover" />
                  </div>
                )}
                {/* Whisper GIF attachment */}
                {r.gif_url && (
                  <div className="mt-2 rounded-xl overflow-hidden border border-[var(--color-border)] max-w-xs">
                    <img src={r.gif_url} alt="gif" className="w-full object-cover" />
                  </div>
                )}
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

        {/* Add whisper */}
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

          {/* Media toolbar */}
          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={() => { setShowEmojiPicker(p => !p); setShowGifPicker(false); }}
              className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all ${showEmojiPicker ? "bg-[#C8B06A] border-[#C8B06A]" : "border-[var(--color-border)]"}`}
            >
              <Smile size={14} color={showEmojiPicker ? "white" : "var(--color-text-muted)"} />
            </button>
            <button
              type="button"
              onClick={() => { setShowGifPicker(p => !p); setShowEmojiPicker(false); }}
              className={`flex items-center justify-center px-2.5 h-8 rounded-full border text-[10px] font-light tracking-wide transition-all ${showGifPicker ? "bg-[#C8B06A] border-[#C8B06A] text-white" : "border-[var(--color-border)] text-[var(--color-text-muted)]"}`}
            >
              GIF
            </button>
            <button
              type="button"
              onClick={() => photoInputRef.current?.click()}
              className="flex items-center justify-center w-8 h-8 rounded-full border border-[var(--color-border)] transition-all hover:border-[#C8B06A]"
            >
              <Image size={14} color="var(--color-text-muted)" />
            </button>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handlePhotoUpload}
            />
          </div>

          {/* Emoji panel */}
          <AnimatePresence>
            {showEmojiPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2"
              >
                <div className="flex flex-wrap gap-1.5 p-2.5 bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)]">
                  {BEAUTY_EMOJIS.map(em => (
                    <button
                      key={em}
                      type="button"
                      onClick={() => setReviewText(prev => prev + em)}
                      className="text-lg w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[var(--color-bg-elevated)] transition-colors"
                    >
                      {em}
                    </button>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* GIF picker */}
          <AnimatePresence>
            {showGifPicker && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden mt-2"
              >
                <div className="bg-[var(--color-bg)] rounded-xl border border-[var(--color-border)] p-2.5">
                  <input
                    value={gifSearch}
                    onChange={e => setGifSearch(e.target.value)}
                    placeholder="Search GIFs…"
                    className="w-full text-xs bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-3 py-1.5 outline-none text-[var(--color-text-primary)] font-light placeholder:text-primary-30 mb-2"
                  />
                  {gifLoading ? (
                    <div className="text-center py-4">
                      <div className="text-[10px] text-primary-40 font-light animate-pulse">Finding GIFs…</div>
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 gap-1.5 max-h-40 overflow-y-auto">
                      {gifResults.map(gif => (
                        <button
                          key={gif.id}
                          type="button"
                          onClick={() => { setAttachedGif(gif.url); setAttachedPhoto(null); setShowGifPicker(false); }}
                          className="aspect-square rounded-lg overflow-hidden border border-[var(--color-border)] hover:border-[#C8B06A] transition-colors"
                        >
                          <img src={gif.preview} alt="gif" className="w-full h-full object-cover" />
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attached photo preview */}
          {attachedPhoto && (
            <div className="mt-2 relative w-fit">
              <img src={attachedPhoto} alt="attachment" className="h-24 rounded-xl border border-[var(--color-border)] object-cover" />
              <button
                type="button"
                onClick={() => setAttachedPhoto(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#BC8F8F] rounded-full flex items-center justify-center"
              >
                <X size={10} color="white" />
              </button>
            </div>
          )}

          {/* Attached GIF preview */}
          {attachedGif && (
            <div className="mt-2 relative w-fit">
              <img src={attachedGif} alt="gif" className="h-24 rounded-xl border border-[var(--color-border)] object-cover" />
              <button
                type="button"
                onClick={() => setAttachedGif(null)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-[#BC8F8F] rounded-full flex items-center justify-center"
              >
                <X size={10} color="white" />
              </button>
            </div>
          )}

          <button
            onClick={submitReview}
            disabled={!reviewText.trim() || submitting}
            className={`mt-3 w-full py-3 rounded-2xl text-xs tracking-[0.2em] font-light ${
              reviewText.trim() && !submitting
                ? "bg-[#043927] text-[#FDF5E6]"
                : "bg-[var(--color-border)] text-primary-40 cursor-not-allowed"
            }`}
          >
            {submitting ? "Sharing…" : "WHISPER"}
          </button>
        </div>
      </div>
      {reporting && <ReportModal postId={post.id} onClose={() => setReporting(false)} />}
    </div>
  );
}
