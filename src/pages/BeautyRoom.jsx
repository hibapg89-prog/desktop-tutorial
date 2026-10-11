import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Plus, Heart, MessageCircle, Bookmark, Send } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { base44 } from "@/api/base44Client";
import { Image } from "@/components/ui/image";
import { useToast } from "@/components/ui/use-toast";

const BEAUTY_ROOMS = [
  { key: "skin_rituals", label: "Skin Rituals",    glyph: "✦", color: "#C8A96E" },
  { key: "bold_colour",  label: "Bold Colour",     glyph: "◆", color: "#BC4A6A" },
  { key: "clean_beauty", label: "Clean Beauty",    glyph: "◉", color: "#3D7A5A" },
  { key: "vintage_glam", label: "Vintage Glamour", glyph: "◈", color: "#7A4E7A" },
  { key: "natural_glow", label: "Natural Glow",    glyph: "◇", color: "#C47B3A" },
  { key: "minimalist",   label: "Minimalist",      glyph: "○", color: "#043927" },
];

const ROOM_ARCHETYPES = {
  skin_rituals: { archetype: "The Alchemist",  tagline: "Ritual as transformation",  prompt: "What ritual have you been devoted to lately?" },
  bold_colour:  { archetype: "The Icon",       tagline: "Beauty as signature",        prompt: "Which shade is your signature right now?" },
  clean_beauty: { archetype: "The Purist",     tagline: "Clarity above all",          prompt: "What does your cleanest, most essential routine look like?" },
  vintage_glam: { archetype: "The Archivist",  tagline: "Beauty through time",        prompt: "What beauty secret deserves to be remembered?" },
  natural_glow: { archetype: "The Oracle",     tagline: "Intuition, illuminated",     prompt: "What has your skin been telling you lately?" },
  minimalist:   { archetype: "The Engineer",   tagline: "Precision is elegance",      prompt: "Which single product carries the whole routine?" },
};

function timeAgo(dateStr) {
  if (!dateStr) return "";
  const diff = Date.now() - new Date(dateStr).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export default function BeautyRoom() {
  const { key } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const room = BEAUTY_ROOMS.find(r => r.key === key);
  const arch = ROOM_ARCHETYPES[key];

  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [composeText, setComposeText] = useState("");
  const [composeImg, setComposeImg] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [likedIds, setLikedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("muse_liked_posts") || "[]")); }
    catch { return new Set(); }
  });
  const [savedIds, setSavedIds] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("muse_saved_posts") || "[]")); }
    catch { return new Set(); }
  });
  const [joinedRooms, setJoinedRooms] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem("muse_beauty_rooms") || "[]")); }
    catch { return new Set(); }
  });

  const textareaRef = useRef(null);

  useEffect(() => {
    if (!key) return;
    setLoading(true);
    base44.entities.CommunityPost.list("-created_date", 50)
      .then(all => setPosts(all.filter(p => p.circle === key)))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [key]);

  const isJoined = joinedRooms.has(key);

  function toggleJoin() {
    const next = new Set(joinedRooms);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setJoinedRooms(next);
    localStorage.setItem("muse_beauty_rooms", JSON.stringify([...next]));
    try { base44.auth.updateMe({ beauty_rooms: [...next] }); } catch {}
    toast({ description: next.has(key) ? `Joined ${arch?.archetype}` : `Left ${arch?.archetype}` });
  }

  async function handlePost() {
    if (!composeText.trim()) return;
    setSubmitting(true);
    try {
      let me = {};
      try { me = await base44.auth.me(); } catch {}
      const newPost = await base44.entities.CommunityPost.create({
        content: composeText.trim(),
        circle: key,
        image_url: composeImg.trim() || undefined,
        author_name: me?.full_name || me?.email || "Member",
        author_avatar: me?.profile_image || undefined,
        likes_count: 0,
        comments_count: 0,
        created_date: new Date().toISOString(),
      });
      setPosts(prev => [newPost, ...prev]);
      setComposeText("");
      setComposeImg("");
      toast({ description: "Post shared in the room" });
    } catch {
      toast({ description: "Could not post. Try again.", variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  }

  function toggleLike(id) {
    const next = new Set(likedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setLikedIds(next);
    localStorage.setItem("muse_liked_posts", JSON.stringify([...next]));
    setPosts(prev => prev.map(p => p.id === id
      ? { ...p, likes_count: (p.likes_count || 0) + (next.has(id) ? 1 : -1) }
      : p
    ));
  }

  function toggleSave(id) {
    const next = new Set(savedIds);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSavedIds(next);
    localStorage.setItem("muse_saved_posts", JSON.stringify([...next]));
  }

  if (!room || !arch) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FFF9E8" }}>
        <p className="text-sm text-[#4A5A4E]">Room not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24 overflow-x-hidden" style={{ background: "linear-gradient(180deg, #FFF9E8 0%, #EFE9DC 100%)" }}>
      {/* Header */}
      <div className="sticky top-0 z-30 px-5 pt-4 pb-3" style={{ background: "rgba(255,249,232,0.92)", backdropFilter: "blur(10px)", borderBottom: "1px solid rgba(200,176,106,0.18)" }}>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-8 h-8 rounded-full" style={{ background: "rgba(200,176,106,0.12)" }}>
            <ArrowLeft size={15} color="#2D3A30" strokeWidth={1.5} />
          </button>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-[0.875rem]" style={{ color: room.color }}>{room.glyph}</span>
              <h1 className="text-[0.9375rem] font-light tracking-wide truncate" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#1C2E24" }}>
                {arch.archetype}
              </h1>
            </div>
            <p className="text-[0.5625rem] tracking-[0.2em] uppercase text-[#6A7A6E] font-light mt-0.5">{room.label}</p>
          </div>
          <button
            onClick={toggleJoin}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[0.5625rem] tracking-[0.18em] uppercase font-light transition-all"
            style={isJoined
              ? { background: "rgba(200,176,106,0.15)", color: "#8A7530", border: "1px solid rgba(200,176,106,0.4)" }
              : { background: "rgba(4,57,39,0.08)", color: "#043927", border: "1px solid rgba(4,57,39,0.18)" }
            }
          >
            {isJoined ? <>✦ Member</> : <><Plus size={8} strokeWidth={1.5} />Join</>}
          </button>
        </div>
      </div>

      {/* Archetype banner */}
      <div className="mx-5 mt-4 px-5 py-4 rounded-2xl relative overflow-hidden" style={{ background: `linear-gradient(135deg, ${room.color}14 0%, ${room.color}08 100%)`, border: `1px solid ${room.color}30` }}>
        <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[3rem] opacity-[0.07]" style={{ color: room.color }}>
          {room.glyph}
        </div>
        <p className="text-[0.5625rem] tracking-[0.25em] uppercase font-light mb-1.5" style={{ color: room.color }}>
          {arch.tagline}
        </p>
        <p className="text-[0.875rem] font-light italic leading-snug" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif", color: "#2D3A30", maxWidth: "85%" }}>
          {arch.prompt}
        </p>
      </div>

      {/* Compose area */}
      <div className="mx-5 mt-4 rounded-2xl p-4" style={{ background: "rgba(255,249,232,0.8)", border: "1px solid rgba(200,176,106,0.22)" }}>
        <textarea
          ref={textareaRef}
          value={composeText}
          onChange={e => setComposeText(e.target.value)}
          placeholder={arch.prompt}
          rows={3}
          className="w-full resize-none bg-transparent text-[0.8125rem] font-light text-[#2D3A30] placeholder:text-[#9A8E76] outline-none leading-relaxed"
          style={{ fontFamily: "inherit" }}
        />
        <div className="flex items-center justify-between mt-2 pt-2" style={{ borderTop: "1px solid rgba(200,176,106,0.18)" }}>
          <input
            value={composeImg}
            onChange={e => setComposeImg(e.target.value)}
            placeholder="Image URL (optional)"
            className="flex-1 text-[0.6875rem] font-light text-[#4A5A4E] placeholder:text-[#B0A88E] bg-transparent outline-none mr-3"
          />
          <button
            onClick={handlePost}
            disabled={submitting || !composeText.trim()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[0.5625rem] tracking-[0.18em] uppercase font-light transition-all disabled:opacity-40"
            style={{ background: "#043927", color: "#EFE9DC" }}
          >
            <Send size={9} strokeWidth={1.5} />
            Post
          </button>
        </div>
      </div>

      {/* Posts feed */}
      <div className="mt-4 px-5 flex flex-col gap-4">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-5 h-5 border-2 border-[#C8B06A] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-[1.25rem] mb-2" style={{ color: room.color, opacity: 0.4 }}>{room.glyph}</p>
            <p className="text-[0.8125rem] font-light italic text-[#6A7A6E]" style={{ fontFamily: "'Cormorant Garamond', Georgia, serif" }}>
              Be the first to share in this room.
            </p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {posts.map((post, i) => {
              const liked = likedIds.has(post.id);
              const saved = savedIds.has(post.id);
              return (
                <motion.div
                  key={post.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.28, delay: i * 0.04 }}
                  className="rounded-2xl overflow-hidden"
                  style={{ background: "#FFFDF5", border: "1px solid rgba(200,176,106,0.2)", boxShadow: "0 2px 12px rgba(4,57,39,0.04)" }}
                >
                  {/* Post image */}
                  {post.image_url && (
                    <div className="w-full aspect-[4/3] overflow-hidden">
                      <Image src={post.image_url} alt="" className="w-full h-full object-cover" />
                    </div>
                  )}
                  <div className="p-4">
                    {/* Author row */}
                    <div className="flex items-center gap-2.5 mb-3">
                      <div className="w-7 h-7 rounded-full overflow-hidden flex-shrink-0" style={{ background: "rgba(200,176,106,0.18)" }}>
                        {post.author_avatar
                          ? <Image src={post.author_avatar} alt="" className="w-full h-full object-cover" />
                          : <div className="w-full h-full flex items-center justify-center text-[0.6875rem] font-light text-[#8A7530]">
                              {(post.author_name || "M")[0].toUpperCase()}
                            </div>
                        }
                      </div>
                      <div>
                        <p className="text-[0.75rem] font-light text-[#2D3A30] leading-none">{post.author_name || "Member"}</p>
                        <p className="text-[0.5625rem] font-light text-[#9A8E76] mt-0.5">{timeAgo(post.created_date)}</p>
                      </div>
                      <span className="ml-auto text-[0.6875rem]" style={{ color: room.color, opacity: 0.6 }}>{room.glyph}</span>
                    </div>
                    {/* Content */}
                    <p className="text-[0.8125rem] font-light text-[#2D3A30] leading-relaxed whitespace-pre-wrap">{post.content}</p>
                    {/* Actions */}
                    <div className="flex items-center gap-4 mt-3 pt-3" style={{ borderTop: "1px solid rgba(200,176,106,0.15)" }}>
                      <button onClick={() => toggleLike(post.id)} className="flex items-center gap-1 transition-colors">
                        <Heart size={13} strokeWidth={1.5} fill={liked ? "#BC4A6A" : "none"} color={liked ? "#BC4A6A" : "#9A8E76"} />
                        {(post.likes_count || 0) > 0 && <span className="text-[0.5625rem] font-light text-[#9A8E76]">{post.likes_count}</span>}
                      </button>
                      <button className="flex items-center gap-1">
                        <MessageCircle size={13} strokeWidth={1.5} color="#9A8E76" />
                        {(post.comments_count || 0) > 0 && <span className="text-[0.5625rem] font-light text-[#9A8E76]">{post.comments_count}</span>}
                      </button>
                      <button onClick={() => toggleSave(post.id)} className="ml-auto flex items-center">
                        <Bookmark size={13} strokeWidth={1.5} fill={saved ? "#C8B06A" : "none"} color={saved ? "#C8B06A" : "#9A8E76"} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
}
