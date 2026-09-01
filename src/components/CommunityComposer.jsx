import { useState, useEffect, useRef } from "react";
import {
  X, Plus, Trash2, ChevronLeft,
  Star, Palette, Layers, ClipboardList, Video, Zap,
  Search, Globe, Users, Smile,
} from "lucide-react";
import { base44 } from "@/api/base44Client";
import { extractTags } from "@/utils/richText";
import SwanLogo from "@/components/SwanLogo";
import StarRating from "@/components/StarRating";

const POST_TYPES = [
  { key: "review",       label: "Product Review", Icon: Star,          desc: "Rate & review a product from your vanity" },
  { key: "swatch",       label: "Shade Swatch",   Icon: Palette,       desc: "Photo · shade name · skin tone" },
  { key: "before_after", label: "Before & After",  Icon: Layers,        desc: "Show your transformation" },
  { key: "routine",      label: "Routine Share",   Icon: ClipboardList, desc: "Your step-by-step ritual" },
  { key: "grwm",         label: "GRWM",            Icon: Video,         desc: "Share your get-ready moment" },
  { key: "thought",      label: "Quick Take",      Icon: Zap,           desc: "A beauty thought, tip, or confession" },
];

const MONK_TONES = [
  "#F8EDDF", "#F3E3CE", "#EECDB5", "#E0B591",
  "#C99A6E", "#AD7D4B", "#87592D", "#63401A",
  "#432B0E", "#2B1A08",
];

const BEAUTY_CIRCLES = [
  { key: "skin_rituals", label: "Skin Rituals",    glyph: "✦", color: "#C8A96E" },
  { key: "bold_colour",  label: "Bold Colour",     glyph: "◆", color: "#BC4A6A" },
  { key: "clean_beauty", label: "Clean Beauty",    glyph: "◉", color: "#3D7A5A" },
  { key: "vintage_glam", label: "Vintage Glamour", glyph: "◈", color: "#7A4E7A" },
  { key: "natural_glow", label: "Natural Glow",    glyph: "◇", color: "#C47B3A" },
  { key: "minimalist",   label: "Minimalist",      glyph: "○", color: "#043927" },
];

const BEAUTY_EMOJIS = [
  "💄","💅","💋","✨","🌹","🌸","🫦","💆","🛁","🪞",
  "🧴","💐","🫶","❤️","🔥","💯","😍","🥰","✅","🌟",
  "💫","🎀","🌺","💗","🥹","👑","🤌","💎","🦋","🩷",
];

const TENOR_KEY = "LIVDSRZULELA";

const INPUT_CLS =
  "w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl px-3 py-2 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-primary)]/30";
const LABEL_CLS =
  "text-[10px] tracking-[0.15em] uppercase text-[var(--color-text-primary)]/40 font-light mb-1.5";

// ─── emoji panel ────────────────────────────────────────────────────────────
function EmojiPanel({ onSelect }) {
  return (
    <div className="flex flex-wrap gap-1 p-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl mt-1.5">
      {BEAUTY_EMOJIS.map(e => (
        <button
          key={e}
          type="button"
          onClick={() => onSelect(e)}
          className="text-base leading-none p-0.5 hover:scale-110 transition-transform"
        >
          {e}
        </button>
      ))}
    </div>
  );
}

// ─── gif picker panel ────────────────────────────────────────────────────────
function GifPickerPanel({ results, loading, onSelect }) {
  return (
    <div className="border border-[var(--color-border)] rounded-2xl mt-1 overflow-hidden bg-[var(--color-bg-elevated)]">
      {loading ? (
        <div className="flex justify-center py-5">
          <div className="animate-spin w-5 h-5 rounded-full border-2 border-[#C8B06A] border-t-transparent" />
        </div>
      ) : results.length > 0 ? (
        <div className="grid grid-cols-3 gap-1 p-1.5 max-h-44 overflow-y-auto">
          {results.map((gif, i) => (
            <button
              key={i}
              type="button"
              onClick={() => onSelect(gif)}
              className="aspect-square rounded-lg overflow-hidden bg-[var(--color-bg)] border border-[var(--color-border)]"
            >
              <img src={gif.tinygif} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      ) : (
        <p className="text-[10px] text-center text-[var(--color-text-primary)]/30 font-light py-5 italic">
          No GIFs found
        </p>
      )}
    </div>
  );
}

// ─── media toolbar (emoji + gif toggles + gif search input) ─────────────────
function MediaToolbar({ showEmoji, showGif, onEmojiToggle, onGifToggle, gifSearch, onGifSearch }) {
  return (
    <div className="mt-1.5">
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onEmojiToggle}
          className={`flex items-center gap-1 text-[9px] tracking-[0.12em] uppercase font-light px-2.5 py-1 rounded-full border transition-all ${
            showEmoji
              ? "bg-[#C8B06A]/15 border-[#C8B06A]/50 text-[var(--color-text-primary)]"
              : "border-[var(--color-border)] text-[var(--color-text-primary)]/35 hover:border-[#C8B06A]/30"
          }`}
        >
          <Smile size={10} strokeWidth={1.5} /> Emoji
        </button>
        <button
          type="button"
          onClick={onGifToggle}
          className={`flex items-center gap-1 text-[9px] tracking-[0.12em] uppercase font-light px-2.5 py-1 rounded-full border transition-all ${
            showGif
              ? "bg-[#C8B06A]/15 border-[#C8B06A]/50 text-[var(--color-text-primary)]"
              : "border-[var(--color-border)] text-[var(--color-text-primary)]/35 hover:border-[#C8B06A]/30"
          }`}
        >
          GIF
        </button>
      </div>
      {showGif && (
        <div className="relative mt-1.5">
          <Search size={11} className="absolute left-2.5 top-1/2 -translate-y-1/2 opacity-30 pointer-events-none" color="var(--color-text-primary)" />
          <input
            value={gifSearch}
            onChange={e => onGifSearch(e.target.value)}
            placeholder="Search GIFs…"
            className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl pl-7 pr-3 py-1.5 text-xs text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-primary)]/30"
          />
        </div>
      )}
    </div>
  );
}

// ─── shared photo upload ────────────────────────────────────────────────────
function PhotoUpload({ value, onChange, label = "Upload photo", compact = false }) {
  const inputRef = useRef(null);
  const handleFile = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => onChange(ev.target.result);
    reader.readAsDataURL(file);
  };
  return (
    <div
      onClick={() => inputRef.current?.click()}
      className={`cursor-pointer border-2 border-dashed border-[var(--color-border)] rounded-2xl flex items-center justify-center overflow-hidden bg-[var(--color-bg-elevated)]/60 ${compact ? "h-28" : "h-40"}`}
    >
      {value ? (
        <img src={value} alt="upload" className="w-full h-full object-cover rounded-2xl" />
      ) : (
        <div className="flex flex-col items-center gap-1 select-none">
          <Plus size={20} color="var(--color-text-primary)" strokeWidth={1} />
          <span className="text-[9px] tracking-[0.15em] uppercase text-[var(--color-text-primary)]/40 font-light">{label}</span>
        </div>
      )}
      <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />
    </div>
  );
}

// ─── shared product card (vanity + catalog) ─────────────────────────────────
function ProductCard({ p, selected, setSelected }) {
  return (
    <button
      onClick={() => setSelected(p)}
      className={`rounded-xl overflow-hidden border text-left transition-all ${
        selected?.id === p.id
          ? "border-[#C8B06A] ring-2 ring-[#C8B06A]/40"
          : "border-[var(--color-border)] hover:border-[#C8B06A]/50"
      }`}
    >
      <div className="aspect-square bg-[var(--color-bg-elevated)]">
        {p.image_url ? (
          <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <SwanLogo size={16} color="var(--color-text-primary)" />
          </div>
        )}
      </div>
      <p className="text-[8px] uppercase tracking-wide text-[var(--color-text-primary)]/40 px-1.5 pt-1 truncate font-light">{p.brand}</p>
      <p className="text-[10px] text-[var(--color-text-primary)] px-1.5 pb-1.5 truncate font-light">{p.name}</p>
    </button>
  );
}

// ─── char-counted textarea ───────────────────────────────────────────────────
function TextArea({ value, onChange, placeholder, rows = 3, max = 400 }) {
  return (
    <div className="relative">
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        maxLength={max}
        className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-2xl p-3 pb-6 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-primary)]/30 resize-none"
      />
      <span className="absolute bottom-2.5 right-3 text-[9px] text-[var(--color-text-primary)]/25 font-light pointer-events-none">
        {value.length}/{max}
      </span>
    </div>
  );
}

// ─── main composer ──────────────────────────────────────────────────────────
export default function CommunityComposer({ onClose, onPosted, prefillProduct }) {
  const [step, setStep]             = useState("pick");
  const [postType, setPostType]     = useState(null);
  const [vanity, setVanity]         = useState([]);
  const [loadingVanity, setLoadingVanity] = useState(false);
  const [user, setUser]             = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [visibility, setVisibility] = useState("public");
  const [selectedCircle, setSelectedCircle] = useState(null);

  // ── Product Review
  const [reviewSource, setReviewSource]       = useState("vanity");
  const [catalogSearch, setCatalogSearch]     = useState("");
  const [catalogResults, setCatalogResults]   = useState([]);
  const [searchingCatalog, setSearchingCatalog] = useState(false);
  const [selected, setSelected]   = useState(null);
  const [rating, setRating]       = useState(5);
  const [reviewText, setReviewText] = useState("");

  // ── Shade Swatch
  const [swatchPhoto, setSwatchPhoto]     = useState("");
  const [swatchBrand, setSwatchBrand]     = useState("");
  const [swatchName, setSwatchName]       = useState("");
  const [shadeName, setShadeName]         = useState("");
  const [skinTone, setSkinTone]           = useState("");
  const [swatchCaption, setSwatchCaption] = useState("");

  // ── Before & After
  const [beforePhoto, setBeforePhoto] = useState("");
  const [afterPhoto, setAfterPhoto]   = useState("");
  const [baTitle, setBaTitle]         = useState("");
  const [baCaption, setBaCaption]     = useState("");

  // ── Routine Share
  const [routineTitle, setRoutineTitle] = useState("");
  const [routineDesc, setRoutineDesc]   = useState("");
  const [steps, setSteps]               = useState([{ brand: "", name: "", note: "" }]);

  // ── Quick Take
  const [thoughtText, setThoughtText]   = useState("");

  // ── GRWM
  const [grwmTitle, setGrwmTitle]       = useState("");
  const [videoUrl, setVideoUrl]         = useState("");
  const [grwmDuration, setGrwmDuration] = useState("60s");
  const [grwmDesc, setGrwmDesc]         = useState("");

  // ── Emoji / GIF / Video
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showGifPicker, setShowGifPicker]     = useState(false);
  const [gifSearch, setGifSearch]             = useState("beauty");
  const [gifResults, setGifResults]           = useState([]);
  const [gifLoading, setGifLoading]           = useState(false);
  const [attachedGif, setAttachedGif]         = useState(null);
  const [videoSource, setVideoSource]         = useState("url"); // "url" | "upload"
  const [videoFileData, setVideoFileData]     = useState(null);
  const [videoDuration, setVideoDuration]     = useState("");
  const [videoError, setVideoError]           = useState("");
  const videoInputRef = useRef(null);

  useEffect(() => {
    base44.auth.me().catch(() => null).then(setUser);
  }, []);

  // prefill from ScanResults → auto-select product in review
  useEffect(() => {
    if (prefillProduct) {
      setPostType("review");
      setStep("form");
      setSelected(prefillProduct);
      loadVanity();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // catalog search with debounce
  useEffect(() => {
    if (reviewSource !== "catalog" || catalogSearch.trim().length < 2) {
      setCatalogResults([]);
      return;
    }
    setSearchingCatalog(true);
    const t = setTimeout(() => {
      base44.entities.Product.filter({ name: { $contains: catalogSearch.trim() } })
        .then(setCatalogResults)
        .catch(() => setCatalogResults([]))
        .finally(() => setSearchingCatalog(false));
    }, 380);
    return () => { clearTimeout(t); setSearchingCatalog(false); };
  }, [catalogSearch, reviewSource]);

  // GIF search with debounce
  useEffect(() => {
    if (!showGifPicker) return;
    setGifLoading(true);
    const q = gifSearch.trim() || "beauty makeup";
    const t = setTimeout(() => {
      fetch(`https://g.tenor.com/v2/search?q=${encodeURIComponent(q)}&key=${TENOR_KEY}&limit=12`)
        .then(r => r.json())
        .then(data => {
          setGifResults(
            (data.results || [])
              .map(r => ({
                url: r.media_formats?.gif?.url,
                tinygif: r.media_formats?.tinygif?.url,
              }))
              .filter(g => g.url && g.tinygif)
          );
        })
        .catch(() => setGifResults([]))
        .finally(() => setGifLoading(false));
    }, 400);
    return () => clearTimeout(t);
  }, [gifSearch, showGifPicker]);

  const loadVanity = () => {
    if (vanity.length > 0) return;
    setLoadingVanity(true);
    base44.entities.Product.filter({ in_vanity: true })
      .then(setVanity)
      .finally(() => setLoadingVanity(false));
  };

  const pickType = (key) => {
    setPostType(key);
    setStep("form");
    if (key === "review") loadVanity();
    setShowEmojiPicker(false);
    setShowGifPicker(false);
    setAttachedGif(null);
  };

  const addStep    = () => setSteps((s) => [...s, { brand: "", name: "", note: "" }]);
  const removeStep = (i) => setSteps((s) => s.filter((_, idx) => idx !== i));
  const updateStep = (i, field, val) =>
    setSteps((s) => s.map((st, idx) => (idx === i ? { ...st, [field]: val } : st)));

  // insert emoji into the active post type's main text field
  const insertEmoji = (emoji) => {
    const setters = {
      review:       setReviewText,
      swatch:       setSwatchCaption,
      before_after: setBaCaption,
      routine:      setRoutineDesc,
      grwm:         setGrwmDesc,
      thought:      setThoughtText,
    };
    const setter = setters[postType];
    if (setter) setter(prev => prev + emoji);
  };

  const handleGifSelect = (gif) => {
    setAttachedGif(gif.url);
    setShowGifPicker(false);
  };

  const handleVideoUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setVideoError("");
    setVideoFileData(null);
    const objectUrl = URL.createObjectURL(file);
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.onloadedmetadata = () => {
      URL.revokeObjectURL(objectUrl);
      if (videoEl.duration > 30) {
        setVideoError("Please upload a video under 30 seconds. For longer videos, use a URL instead.");
        return;
      }
      if (file.size > 20 * 1024 * 1024) {
        setVideoError("File too large (max 20 MB). Please compress it or use a URL for longer videos.");
        return;
      }
      setVideoDuration(Math.round(videoEl.duration) + "s");
      const reader = new FileReader();
      reader.onload = ev => setVideoFileData(ev.target.result);
      reader.readAsDataURL(file);
    };
    videoEl.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setVideoError("Could not read video. Try another file or use a URL.");
    };
    videoEl.src = objectUrl;
  };

  const toggleEmoji = () => {
    setShowEmojiPicker(p => !p);
    setShowGifPicker(false);
  };
  const toggleGif = () => {
    setShowGifPicker(p => !p);
    setShowEmojiPicker(false);
  };

  const canPost = (() => {
    if (submitting) return false;
    if (postType === "review")       return !!selected && reviewText.trim().length > 0;
    if (postType === "swatch")       return !!swatchPhoto && shadeName.trim().length > 0;
    if (postType === "before_after") return !!beforePhoto && !!afterPhoto && baTitle.trim().length > 0;
    if (postType === "routine")      return routineTitle.trim().length > 0 && steps.some((s) => s.name.trim());
    if (postType === "grwm")
      return grwmTitle.trim().length > 0 && (videoSource === "url" ? videoUrl.trim().length > 0 : !!videoFileData);
    if (postType === "thought") return thoughtText.trim().length > 0;
    return false;
  })();

  const authorName = user?.full_name || user?.email || "A Muse Member";

  const submit = async () => {
    if (!canPost) return;
    setSubmitting(true);
    try {
      const base = {
        post_type: postType,
        review_count: 0,
        rating: null,
        author_name: authorName,
        visibility,
        ...(selectedCircle ? { circle: selectedCircle } : {}),
        ...(attachedGif ? { gif_url: attachedGif } : {}),
      };

      if (postType === "review") {
        await base44.entities.CommunityPost.create({
          ...base,
          product_id: selected.id || "",
          brand: selected.brand,
          name: selected.name,
          shade: selected.shade || "",
          category: selected.category || "",
          image_url: selected.image_url || "",
          price: selected.price ?? null,
          currency: selected.currency || "USD",
          review_text: reviewText.trim(),
          rating,
          tags: JSON.stringify(extractTags(reviewText)),
        });
      } else if (postType === "swatch") {
        await base44.entities.CommunityPost.create({
          ...base,
          image_url: swatchPhoto,
          brand: swatchBrand.trim(),
          name: swatchName.trim() || "Shade Swatch",
          shade: shadeName.trim(),
          skin_tone: skinTone,
          review_text: swatchCaption.trim() || shadeName.trim(),
          tags: JSON.stringify(extractTags([swatchCaption, shadeName].join(" "))),
        });
      } else if (postType === "before_after") {
        await base44.entities.CommunityPost.create({
          ...base,
          name: baTitle.trim(),
          image_url: beforePhoto,
          secondary_image_url: afterPhoto,
          review_text: baCaption.trim() || baTitle.trim(),
          tags: JSON.stringify(extractTags([baCaption, baTitle].join(" "))),
        });
      } else if (postType === "routine") {
        await base44.entities.CommunityPost.create({
          ...base,
          name: routineTitle.trim(),
          review_text: routineDesc.trim() || routineTitle.trim(),
          routine_steps: JSON.stringify(steps.filter((s) => s.name.trim())),
          tags: JSON.stringify(extractTags([routineDesc, routineTitle, ...steps.map((s) => s.note)].join(" "))),
        });
      } else if (postType === "grwm") {
        const resolvedVideoUrl = videoSource === "upload" ? videoFileData : videoUrl.trim();
        const resolvedDuration = videoSource === "upload" ? (videoDuration || grwmDuration) : grwmDuration;
        await base44.entities.CommunityPost.create({
          ...base,
          name: grwmTitle.trim(),
          video_url: resolvedVideoUrl,
          grwm_duration: resolvedDuration,
          review_text: grwmDesc.trim() || grwmTitle.trim(),
          tags: JSON.stringify(extractTags(grwmDesc)),
        });
      } else if (postType === "thought") {
        await base44.entities.CommunityPost.create({
          ...base,
          name: thoughtText.trim().slice(0, 60) || "Quick Take",
          review_text: thoughtText.trim(),
          tags: JSON.stringify(extractTags(thoughtText)),
        });
      }

      onPosted && onPosted();
      onClose && onClose();
    } finally {
      setSubmitting(false);
    }
  };

  const currentType = POST_TYPES.find((t) => t.key === postType);
  const TypeIcon = currentType?.Icon;

  // shared media toolbar props
  const mediaToolbarProps = {
    showEmoji: showEmojiPicker,
    showGif: showGifPicker,
    onEmojiToggle: toggleEmoji,
    onGifToggle: toggleGif,
    gifSearch,
    onGifSearch: setGifSearch,
  };

  // ─────────────────────────────────────────────────────────────────────────
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-[#043927]/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full sm:max-w-md max-h-[90vh] overflow-y-auto bg-[var(--color-bg)] rounded-t-3xl sm:rounded-3xl px-5 pt-5 pb-28 sm:pb-5"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── header ── */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            {step === "form" && (
              <button
                onClick={() => setStep("pick")}
                className="w-7 h-7 flex items-center justify-center rounded-full border border-[#C8B06A]/60 mr-0.5 shrink-0"
              >
                <ChevronLeft size={13} color="var(--color-text-primary)" />
              </button>
            )}
            {step === "form" && TypeIcon && (
              <div className="w-7 h-7 flex items-center justify-center rounded-full bg-[#C8B06A]/15 shrink-0">
                <TypeIcon size={14} color="var(--color-text-primary)" strokeWidth={1.5} />
              </div>
            )}
            <h2 className="font-serif text-xl text-[var(--color-text-primary)] font-light">
              {step === "pick" ? "New Musing" : currentType?.label}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-[#043927]/10 shrink-0"
          >
            <X size={14} color="var(--color-text-primary)" />
          </button>
        </div>

        {/* thin gold rule */}
        <div className="h-px bg-gradient-to-r from-transparent via-[#C8B06A]/40 to-transparent mb-5" />

        {/* ══ STEP 1: type picker ══ */}
        {step === "pick" && (
          <div className="flex flex-col gap-2">
            <p className="text-[10px] tracking-[0.2em] uppercase text-[var(--color-text-primary)]/40 font-light mb-1">
              Choose a musing type
            </p>
            {POST_TYPES.map((t) => (
              <button
                key={t.key}
                onClick={() => pickType(t.key)}
                className="flex items-center gap-3.5 w-full text-left px-4 py-3.5 rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] hover:border-[#C8B06A] hover:bg-[var(--color-bg-elevated)] transition-all group"
              >
                <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-elevated)] group-hover:bg-[#C8B06A]/20 flex items-center justify-center shrink-0 transition-colors">
                  <t.Icon size={17} color="var(--color-text-primary)" strokeWidth={1.5} />
                </div>
                <div>
                  <p className="text-sm text-[var(--color-text-primary)] font-light leading-tight">{t.label}</p>
                  <p className="text-[10px] text-[var(--color-text-primary)]/40 font-light tracking-wide mt-0.5">{t.desc}</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* ══ STEP 2: type-specific forms ══ */}
        {step === "form" && (
          <>
            {/* ─── Product Review ─── */}
            {postType === "review" && (
              <>
                {/* vanity / catalog tab toggle */}
                <div className="flex mb-4 border border-[var(--color-border)] rounded-xl overflow-hidden">
                  {[
                    { key: "vanity",  label: "My Vanity" },
                    { key: "catalog", label: "Search Catalog" },
                  ].map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => { setReviewSource(tab.key); setSelected(null); setCatalogSearch(""); }}
                      className={`flex-1 py-2 text-[10px] tracking-[0.15em] uppercase font-light transition-all ${
                        reviewSource === tab.key
                          ? "bg-[#043927] text-[#FDF5E6]"
                          : "bg-transparent text-[var(--color-text-primary)]/50 hover:bg-[var(--color-bg-elevated)]"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>

                {reviewSource === "vanity" ? (
                  <>
                    <p className={LABEL_CLS}>Choose from your vanity</p>
                    {loadingVanity ? (
                      <div className="flex justify-center py-8">
                        <div className="animate-spin w-6 h-6 rounded-full border-2 border-[#C8B06A] border-t-transparent" />
                      </div>
                    ) : vanity.length === 0 ? (
                      <p className="text-sm text-[var(--color-text-primary)]/50 font-light italic py-6 text-center">
                        Your vanity is empty — scan a product first.
                      </p>
                    ) : (
                      <div className="grid grid-cols-3 gap-2 mb-5 max-h-52 overflow-y-auto">
                        {vanity.map((p) => (
                          <ProductCard key={p.id} p={p} selected={selected} setSelected={setSelected} />
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="relative mb-3">
                      <Search size={13} color="var(--color-text-primary)" className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40 pointer-events-none" />
                      <input
                        value={catalogSearch}
                        onChange={(e) => setCatalogSearch(e.target.value)}
                        placeholder="Search by name or brand…"
                        className="w-full bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-xl pl-8 pr-3 py-2 text-sm text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-primary)]/30"
                        autoFocus
                      />
                    </div>
                    {searchingCatalog ? (
                      <div className="flex justify-center py-6">
                        <div className="animate-spin w-5 h-5 rounded-full border-2 border-[#C8B06A] border-t-transparent" />
                      </div>
                    ) : catalogResults.length > 0 ? (
                      <div className="grid grid-cols-3 gap-2 mb-5 max-h-52 overflow-y-auto">
                        {catalogResults.map((p) => (
                          <ProductCard key={p.id} p={p} selected={selected} setSelected={setSelected} />
                        ))}
                      </div>
                    ) : catalogSearch.trim().length >= 2 ? (
                      <p className="text-sm text-[var(--color-text-primary)]/40 font-light italic py-4 text-center">No results found.</p>
                    ) : (
                      <p className="text-[10px] text-[var(--color-text-primary)]/30 font-light italic py-5 text-center tracking-wide">
                        Type at least 2 characters to search
                      </p>
                    )}
                  </>
                )}

                <div className="mb-4">
                  <p className={LABEL_CLS}>Rating</p>
                  <StarRating value={rating} onChange={setRating} size={22} />
                </div>

                <TextArea
                  value={reviewText}
                  onChange={setReviewText}
                  placeholder="Texture, wear, shade, longevity — share your honest take…"
                  rows={4}
                  max={600}
                />
                <MediaToolbar {...mediaToolbarProps} />
                {showEmojiPicker && <EmojiPanel onSelect={insertEmoji} />}
                {showGifPicker && <GifPickerPanel results={gifResults} loading={gifLoading} onSelect={handleGifSelect} />}
                {attachedGif && (
                  <div className="relative mt-2 rounded-2xl overflow-hidden h-32">
                    <img src={attachedGif} alt="GIF" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => setAttachedGif(null)}
                      className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center"
                    >
                      <X size={11} color="white" />
                    </button>
                  </div>
                )}
              </>
            )}

            {/* ─── Shade Swatch ─── */}
            {postType === "swatch" && (
              <>
                <PhotoUpload value={swatchPhoto} onChange={setSwatchPhoto} label="Upload swatch photo" />
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <p className={LABEL_CLS}>Brand</p>
                    <input
                      value={swatchBrand}
                      onChange={(e) => setSwatchBrand(e.target.value)}
                      placeholder="Charlotte Tilbury"
                      className={INPUT_CLS}
                    />
                  </div>
                  <div>
                    <p className={LABEL_CLS}>Product name</p>
                    <input
                      value={swatchName}
                      onChange={(e) => setSwatchName(e.target.value)}
                      placeholder="Pillow Talk Lip"
                      className={INPUT_CLS}
                    />
                  </div>
                </div>
                <div className="mt-3">
                  <p className={LABEL_CLS}>Shade name</p>
                  <input
                    value={shadeName}
                    onChange={(e) => setShadeName(e.target.value)}
                    placeholder="e.g. Pillow Talk Medium"
                    className={INPUT_CLS}
                  />
                </div>
                <div className="mt-4">
                  <p className="text-[10px] tracking-[0.15em] uppercase text-[var(--color-text-primary)]/40 font-light mb-2">
                    Your skin tone <span className="normal-case">(Monk Scale)</span>
                  </p>
                  <div className="flex gap-2 flex-wrap">
                    {MONK_TONES.map((hex) => (
                      <button
                        key={hex}
                        onClick={() => setSkinTone(hex)}
                        style={{ backgroundColor: hex }}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${skinTone === hex ? "border-[#043927] scale-110" : "border-transparent"}`}
                      />
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <TextArea
                    value={swatchCaption}
                    onChange={setSwatchCaption}
                    placeholder="How does it wear? Any tips for this shade?"
                    rows={3}
                  />
                  <MediaToolbar {...mediaToolbarProps} />
                  {showEmojiPicker && <EmojiPanel onSelect={insertEmoji} />}
                  {showGifPicker && <GifPickerPanel results={gifResults} loading={gifLoading} onSelect={handleGifSelect} />}
                  {attachedGif && (
                    <div className="relative mt-2 rounded-2xl overflow-hidden h-28">
                      <img src={attachedGif} alt="GIF" className="w-full h-full object-cover" />
                      <button type="button" onClick={() => setAttachedGif(null)} className="absolute top-1.5 right-1.5 w-6 h-6 rounded-full bg-black/50 flex items-center justify-center">
                        <X size={11} color="white" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ─── Before & After ─── */}
            {postType === "before_after" && (
              <>
                <div>
                  <p className={LABEL_CLS}>Title</p>
                  <input
                    value={baTitle}
                    onChange={(e) => setBaTitle(e.target.value)}
                    placeholder="e.g. Foundation before & after"
                    className={INPUT_CLS}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div>
                    <p className={`${LABEL_CLS} text-center`}>Before</p>
                    <PhotoUpload value={beforePhoto} onChange={setBeforePhoto} label="Before" compact />
                  </div>
                  <div>
                    <p className={`${LABEL_CLS} text-center`}>After</p>
                    <PhotoUpload value={afterPhoto} onChange={setAfterPhoto} label="After" compact />
                  </div>
                </div>
                <div className="mt-4">
                  <TextArea
                    value={baCaption}
                    onChange={setBaCaption}
                    placeholder="What changed? Which products made the difference?"
                    rows={3}
                  />
                  <MediaToolbar {...mediaToolbarProps} />
                  {showEmojiPicker && <EmojiPanel onSelect={insertEmoji} />}
                  {showGifPicker && <GifPickerPanel results={gifResults} loading={gifLoading} onSelect={handleGifSelect} />}
                </div>
              </>
            )}

            {/* ─── Routine Share ─── */}
            {postType === "routine" && (
              <>
                <div className="mb-4">
                  <p className={LABEL_CLS}>Routine title</p>
                  <input
                    value={routineTitle}
                    onChange={(e) => setRoutineTitle(e.target.value)}
                    placeholder="e.g. My dewy AM ritual"
                    className={INPUT_CLS}
                  />
                </div>
                <p className={LABEL_CLS}>Steps</p>
                <div className="flex flex-col gap-2 mb-3 max-h-52 overflow-y-auto">
                  {steps.map((st, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-2.5 text-[10px] font-light text-[var(--color-text-primary)]/40 w-4 shrink-0 text-right">{i + 1}.</span>
                      <div className="flex-1 grid grid-cols-2 gap-1.5">
                        <input
                          value={st.brand}
                          onChange={(e) => updateStep(i, "brand", e.target.value)}
                          placeholder="Brand"
                          className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-primary)]/30"
                        />
                        <input
                          value={st.name}
                          onChange={(e) => updateStep(i, "name", e.target.value)}
                          placeholder="Product name"
                          className="bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-primary)]/30"
                        />
                        <input
                          value={st.note}
                          onChange={(e) => updateStep(i, "note", e.target.value)}
                          placeholder="Note (optional)"
                          className="col-span-2 bg-[var(--color-bg-elevated)] border border-[var(--color-border)] rounded-lg px-2.5 py-1.5 text-xs text-[var(--color-text-primary)] font-light outline-none placeholder:text-[var(--color-text-primary)]/30"
                        />
                      </div>
                      {steps.length > 1 && (
                        <button onClick={() => removeStep(i)} className="mt-2 shrink-0">
                          <Trash2 size={13} color="#BC8F8F" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  onClick={addStep}
                  className="flex items-center gap-1.5 text-[10px] tracking-[0.15em] uppercase text-[var(--color-text-primary)]/50 font-light hover:text-[var(--color-text-primary)] transition-colors mb-4"
                >
                  <Plus size={12} /> Add step
                </button>
                <TextArea
                  value={routineDesc}
                  onChange={setRoutineDesc}
                  placeholder="Any tips or context about this routine?"
                  rows={3}
                />
                <MediaToolbar {...mediaToolbarProps} />
                {showEmojiPicker && <EmojiPanel onSelect={insertEmoji} />}
                {showGifPicker && <GifPickerPanel results={gifResults} loading={gifLoading} onSelect={handleGifSelect} />}
              </>
            )}

            {/* ─── GRWM ─── */}
            {postType === "grwm" && (
              <>
                <div className="mb-4">
                  <p className={LABEL_CLS}>Title</p>
                  <input
                    value={grwmTitle}
                    onChange={(e) => setGrwmTitle(e.target.value)}
                    placeholder="e.g. Everyday dewy skin GRWM"
                    className={INPUT_CLS}
                  />
                </div>

                {/* Video source toggle */}
                <div className="mb-4">
                  <p className={LABEL_CLS}>Video</p>
                  <div className="flex border border-[var(--color-border)] rounded-xl overflow-hidden mb-3">
                    {[
                      { key: "url",    label: "Link (YouTube / TikTok)" },
                      { key: "upload", label: "Upload (max 30s)" },
                    ].map(tab => (
                      <button
                        key={tab.key}
                        onClick={() => { setVideoSource(tab.key); setVideoError(""); setVideoFileData(null); setVideoUrl(""); }}
                        className={`flex-1 py-2 text-[10px] tracking-[0.12em] uppercase font-light transition-all ${
                          videoSource === tab.key
                            ? "bg-[#043927] text-[#FDF5E6]"
                            : "bg-transparent text-[var(--color-text-primary)]/50 hover:bg-[var(--color-bg-elevated)]"
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {videoSource === "url" ? (
                    <input
                      value={videoUrl}
                      onChange={(e) => setVideoUrl(e.target.value)}
                      placeholder="youtube.com/watch?v=… or tiktok.com/…"
                      className={INPUT_CLS}
                    />
                  ) : (
                    <>
                      <div
                        onClick={() => videoInputRef.current?.click()}
                        className="cursor-pointer border-2 border-dashed border-[var(--color-border)] rounded-2xl flex items-center justify-center h-28 bg-[var(--color-bg-elevated)]/60"
                      >
                        {videoFileData ? (
                          <div className="flex flex-col items-center gap-1">
                            <Video size={20} color="#C8B06A" strokeWidth={1.5} />
                            <span className="text-[9px] tracking-wide text-[#C8B06A] font-light">{videoDuration} — tap to replace</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-1 select-none">
                            <Video size={20} color="var(--color-text-primary)" strokeWidth={1} className="opacity-40" />
                            <span className="text-[9px] tracking-[0.15em] uppercase text-[var(--color-text-primary)]/40 font-light">Upload video (max 30s)</span>
                          </div>
                        )}
                      </div>
                      <input ref={videoInputRef} type="file" accept="video/*" className="hidden" onChange={handleVideoUpload} />
                      {videoError && (
                        <p className="text-[10px] text-[#BC8F8F] font-light mt-1.5 leading-snug">{videoError}</p>
                      )}
                    </>
                  )}
                </div>

                {videoSource === "url" && (
                  <div className="mb-4">
                    <p className={LABEL_CLS}>Duration</p>
                    <div className="flex gap-2">
                      {["60s", "4min"].map((d) => (
                        <button
                          key={d}
                          onClick={() => setGrwmDuration(d)}
                          className={`px-4 py-1.5 rounded-full text-xs font-light tracking-wide border transition-all ${
                            grwmDuration === d
                              ? "bg-[#043927] text-[#FDF5E6] border-[#043927]"
                              : "bg-transparent text-[var(--color-text-primary)]/60 border-[var(--color-border)]"
                          }`}
                        >
                          {d}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                <TextArea
                  value={grwmDesc}
                  onChange={setGrwmDesc}
                  placeholder="What products are featured? Any tips?"
                  rows={3}
                />
                <MediaToolbar {...mediaToolbarProps} />
                {showEmojiPicker && <EmojiPanel onSelect={insertEmoji} />}
                {showGifPicker && <GifPickerPanel results={gifResults} loading={gifLoading} onSelect={handleGifSelect} />}
              </>
            )}

            {/* ─── Quick Take ─── */}
            {postType === "thought" && (
              <>
                <div className="mb-1">
                  <div className="flex justify-between items-center mb-1.5">
                    <p className={LABEL_CLS}>Your beauty thought</p>
                    <span className="text-[9px] text-[var(--color-text-primary)]/30 font-light">
                      {thoughtText.length}/280
                    </span>
                  </div>
                  <textarea
                    className={INPUT_CLS + " resize-none"}
                    value={thoughtText}
                    onChange={e => setThoughtText(e.target.value.slice(0, 280))}
                    placeholder="Share a tip, confession, or beauty hot take..."
                    rows={5}
                  />
                  <MediaToolbar {...mediaToolbarProps} />
                  {showEmojiPicker && <EmojiPanel onSelect={insertEmoji} />}
                  {showGifPicker && <GifPickerPanel results={gifResults} loading={gifLoading} onSelect={handleGifSelect} />}
                  {attachedGif && (
                    <div className="relative mt-2 rounded-2xl overflow-hidden h-32">
                      <img src={attachedGif} alt="GIF" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setAttachedGif(null)}
                        className="absolute top-1 right-1 bg-black/50 rounded-full p-0.5"
                      >
                        <X size={10} color="white" />
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}

            {/* ── visibility toggle ── */}
            <div className="mt-5 flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                {visibility === "public"
                  ? <Globe size={12} color="var(--color-text-primary)" strokeWidth={1.5} className="opacity-40" />
                  : <Users size={12} color="var(--color-text-primary)" strokeWidth={1.5} className="opacity-40" />
                }
                <span className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-text-primary)]/40 font-light">Visibility</span>
              </div>
              <div className="flex border border-[var(--color-border)] rounded-full overflow-hidden">
                {[
                  { key: "public", label: "Public" },
                  { key: "circle", label: "Circle" },
                ].map((v) => (
                  <button
                    key={v.key}
                    onClick={() => setVisibility(v.key)}
                    className={`px-3.5 py-1 text-[9px] tracking-[0.15em] uppercase font-light transition-all ${
                      visibility === v.key
                        ? "bg-[#043927] text-[#FDF5E6]"
                        : "bg-transparent text-[var(--color-text-primary)]/50 hover:bg-[var(--color-bg-elevated)]"
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── Beauty Circle picker ── */}
            <div className="mt-4">
              <p className="text-[9px] tracking-[0.2em] uppercase text-[var(--color-text-primary)]/40 font-light mb-2">
                Share to a Beauty Circle
                <span className="normal-case text-[var(--color-text-primary)]/25 tracking-normal"> (optional)</span>
              </p>
              <div className="flex gap-1.5 flex-wrap">
                {BEAUTY_CIRCLES.map(c => (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setSelectedCircle(selectedCircle === c.key ? null : c.key)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-[10px] font-light tracking-wide border transition-all ${
                      selectedCircle === c.key
                        ? "text-white border-transparent"
                        : "bg-transparent text-[var(--color-text-primary)]/50 border-[var(--color-border)] hover:border-[#C8B06A]/40"
                    }`}
                    style={selectedCircle === c.key ? { background: c.color } : {}}
                  >
                    <span className="text-[10px]">{c.glyph}</span> {c.label}
                  </button>
                ))}
              </div>
            </div>

            {/* ── submit ── */}
            <button
              onClick={submit}
              disabled={!canPost}
              className="mt-4 w-full py-3 rounded-2xl text-xs tracking-[0.2em] font-light transition-all"
              style={
                canPost
                  ? {
                      background: "linear-gradient(135deg, #C8B06A 0%, #E5D4A0 50%, #C8B06A 100%)",
                      color: "#043927",
                    }
                  : { background: "#E5E4E2", color: "rgba(4,57,39,0.4)", cursor: "not-allowed" }
              }
            >
              {submitting ? "Sharing…" : "SHARE MUSING"}
            </button>
          </>
        )}
      </div>
    </div>
  );
}
