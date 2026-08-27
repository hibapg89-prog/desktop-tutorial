import { useState, useRef, useEffect } from "react";
import { X, Camera, Image as ImageIcon, Link as LinkIcon, Mic, Sparkles, History } from "lucide-react";

// Vanity mirror icon — matches the gold oval-mirror illustration
const MirrorIcon = ({ size = 24, color = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* Oval frame */}
    <ellipse cx="12" cy="9.5" rx="6.4" ry="7.4" stroke={color} strokeWidth="1.35"/>
    {/* Decorative diamonds on frame */}
    <path d="M12 1.4 L12.9 2.4 L12 3.4 L11.1 2.4Z" fill={color}/>
    <path d="M12 15.6 L12.9 16.6 L12 17.6 L11.1 16.6Z" fill={color}/>
    <path d="M5.2 9.5 L6.0 8.7 L6.8 9.5 L6.0 10.3Z" fill={color}/>
    <path d="M17.2 9.5 L18.0 8.7 L18.8 9.5 L18.0 10.3Z" fill={color}/>
    {/* Stand post */}
    <line x1="12" y1="16.8" x2="12" y2="20.2" stroke={color} strokeWidth="1.35" strokeLinecap="round"/>
    {/* Base arc */}
    <path d="M8.8 20.2 Q12 22.8 15.2 20.2" stroke={color} strokeWidth="1.35" strokeLinecap="round" fill="none"/>
    {/* Sparkle star — upper right */}
    <path d="M17.2 3.2 L17.55 4.3 L18.7 4.65 L17.55 5.0 L17.2 6.1 L16.85 5.0 L15.7 4.65 L16.85 4.3Z" fill={color}/>
    {/* Reflection lines inside glass */}
    <line x1="9.0" y1="12.2" x2="10.6" y2="8.2" stroke={color} strokeWidth="0.9" strokeLinecap="round" strokeOpacity="0.55"/>
    <line x1="10.2" y1="13.8" x2="11.3" y2="11.0" stroke={color} strokeWidth="0.7" strokeLinecap="round" strokeOpacity="0.38"/>
  </svg>
);
import { motion, AnimatePresence } from "framer-motion";
import SwanLogo from "./SwanLogo";
import { base44 } from "@/api/base44Client";
import { useNavigate } from "react-router-dom";
import { CATEGORY_SUBCATEGORIES } from "@/lib/subcategoryMap";
import MuseAssistant from "./MuseAssistant";
import TryOnMirror from "./TryOnMirror";
import StudioComingSoon from "./StudioComingSoon";
import GalleryPicker from "./GalleryPicker";

const CATEGORY_LIST = Object.keys(CATEGORY_SUBCATEGORIES);
const SUBCATEGORY_GUIDE = CATEGORY_LIST
  .map(cat => `${cat} (${CATEGORY_SUBCATEGORIES[cat].join(", ")})`)
  .join("; ");

const SOCIAL_DOMAINS = [
  "instagram.com", "tiktok.com", "youtube.com", "youtu.be",
  "pinterest.com", "pinterest.fr", "twitter.com", "x.com",
  "facebook.com", "fb.com", "snapchat.com", "threads.net",
];

const normalizeSubcategory = (category, subcategory) => {
  if (!subcategory) return null;
  const valid = CATEGORY_SUBCATEGORIES[category] || [];
  const s = String(subcategory).trim();
  const exact = valid.find(v => v === s);
  if (exact) return exact;
  const ci = valid.find(v => v.toLowerCase() === s.toLowerCase());
  return ci || null;
};

const inputMethods = [
  { id: "history", label: "History", icon: History   },
  { id: "camera",  label: "Camera",  icon: Camera    },
  { id: "gallery", label: "Gallery", icon: ImageIcon  },
  { id: "link",    label: "Link",    icon: LinkIcon   },
  { id: "audio",   label: "Voice",   icon: Mic        },
  { id: "mirror",  label: "Studio",  icon: MirrorIcon },
];

// Fan arc positions for the 6 tiles, anchored at (190, 240)
const tilePositions = [
  { x: -140, y:   20 },   // history (far left, below)
  { x:  -98, y:  -80 },   // camera
  { x:  -38, y: -122 },   // gallery
  { x:   38, y: -122 },   // link    (top)
  { x:   98, y:  -80 },   // audio
  { x:  140, y:   20 },   // mirror  (far right, below)
];

export default function ScanHub({ onClose }) {
  const [activeMode,  setActiveMode]  = useState(null);
  const [linkInput,   setLinkInput]   = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress,    setProgress]    = useState(0);
  const [heard,       setHeard]       = useState("");
  const [voiceInput,  setVoiceInput]  = useState("");
  const [isListening, setIsListening] = useState(false);
  const [scanError,   setScanError]   = useState(null);
  const [previewFile,  setPreviewFile] = useState(null);
  const [previewUrl,   setPreviewUrl]  = useState(null);
  const [showMuse,     setShowMuse]   = useState(false);
  const [duplicateProduct, setDuplicateProduct] = useState(null);
  const [pendingSave,      setPendingSave]      = useState(null);
  const [loadingHint,      setLoadingHint]      = useState(null);

  const fileInputRef    = useRef(null);
  const cameraInputRef  = useRef(null);
  const recognitionRef  = useRef(null);
  const heardRef        = useRef("");
  const navigate        = useNavigate();

  // Check once if browser supports SpeechRecognition
  const hasSpeech = !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  // Auto-start listening when audio mode opens; stop when it closes
  useEffect(() => {
    if (activeMode === "audio" && hasSpeech) {
      startListening();
    }
    return () => stopListening();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeMode]);

  const startListening = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    stopListening(); // clear any previous instance
    const recognition = new SR();
    recognitionRef.current = recognition;
    recognition.lang = "en-US";
    recognition.continuous = false;
    recognition.interimResults = true;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript)
        .join("");
      heardRef.current = transcript;
      setHeard(transcript);
    };

    recognition.onend = () => {
      setIsListening(false);
      const finalText = heardRef.current.trim();
      if (finalText) {
        analyzeProduct({ type: "voice", text: finalText });
      }
    };

    recognition.onerror = () => setIsListening(false);

    try { recognition.start(); } catch {}
  };

  const stopListening = () => {
    try { recognitionRef.current?.stop(); } catch {}
    recognitionRef.current = null;
    setIsListening(false);
  };

  // Fire-and-forget: call the backend function that fetches a verified product
  // image URL (validated via real HTTP fetch) and stores it as image_url,
  // replacing any user-uploaded scan photo with a proper product stock photo.
  const enrichProductImage = (productId, brand, name, shade) => {
    if (!productId || !brand) return;
    (async () => {
      try {
        await base44.functions.invoke('fetchProductImage', {
          product_id: productId, brand, name, shade,
        });
      } catch {}
    })();
  };

  const checkForDuplicate = async (brand, name) => {
    try {
      const existing = await base44.entities.Product.list();
      const norm = s => (s || "").toLowerCase().trim().replace(/\s+/g, " ");
      const b = norm(brand), n = norm(name);
      return existing.find(p => norm(p.brand) === b && norm(p.name) === n) || null;
    } catch {
      return null;
    }
  };

  const logScan = async ({ scan_method, status, product_id = null, brand = null, name = null, shade = null, product_count = 0 }) => {
    try {
      await base44.entities.ScanLog.create({ scan_method, status, product_id, brand, name, shade, product_count });
    } catch {}
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = "";
    const url = URL.createObjectURL(file);
    setPreviewFile(file);
    setPreviewUrl(url);
    setActiveMode("preview");
    // Auto-analyse after a brief iridescent flourish
    setTimeout(() => {
      URL.revokeObjectURL(url);
      setPreviewFile(null);
      setPreviewUrl(null);
      analyzeProduct({ type: "image", file });
    }, 1200);
  };

  const SOCIAL_EXTRACTABLE = ["instagram.com", "tiktok.com"];

  const analyzeSocialLink = async (url) => {
    setScanError(null);
    setActiveMode("loading");
    setIsAnalyzing(true);
    setLoadingHint("Scanning post for beauty products...");
    let p = 0;
    // Slower animation — Level 3 video analysis can take up to a minute
    const interval = setInterval(() => {
      p += Math.random() * 5;
      if (p > 88) p = 88;
      setProgress(Math.floor(p));
    }, 800);

    const CATEGORY_LIST = ['Makeup', 'Skincare', 'Haircare', 'Fragrance', 'Body Care', 'Nail', 'Tools & Accessories'];

    const finishWithProducts = async (products, category, thumbnailUrl) => {
      clearInterval(interval);
      if (!products.length) return false;
      setProgress(100);
      const createdProducts = await Promise.all(
        products.map(p =>
          base44.entities.Product.create({
            brand: p.brand,
            name: p.product_name,
            category: category || "Makeup",
            subcategory: normalizeSubcategory(category || "Makeup", p.subcategory),
            source_url: url,
            scan_method: "social_link",
          })
        )
      );
      // Fire-and-forget: fetch real product images (replaces TikTok video frame)
      createdProducts.forEach((prod, i) => {
        enrichProductImage(prod.id, products[i].brand, products[i].product_name, null);
      });
      logScan({
        scan_method: "social_link",
        status: "success",
        product_id: createdProducts[0]?.id,
        brand: products[0]?.brand,
        name: products[0]?.product_name,
        product_count: createdProducts.length,
      });
      setIsAnalyzing(false); setLoadingHint(null);
      if (createdProducts.length === 1) {
        setTimeout(() => { onClose(); navigate(`/product/${createdProducts[0].id}`); }, 500);
      } else {
        setTimeout(() => {
          onClose();
          navigate("/scan-results", {
            state: {
              products: createdProducts.map((prod, i) => ({
                id: prod.id,
                brand: products[i].brand,
                name: products[i].product_name,
                category,
              })),
            }
          });
        }, 500);
      }
      return true;
    };

    try {
      // ── PRIMARY: Direct TikTok oEmbed API call from the browser ────
      // Free, public, no API key, no rate limits, ~1s response.
      let caption = null;
      let thumbnailUrl = null;

      // Try direct oEmbed — TikTok sends permissive CORS headers on this endpoint
      setLoadingHint("Reading the post...");
      try {
        const oembedUrl = `https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`;
        const res = await fetch(oembedUrl, { redirect: 'follow' });
        if (res.ok) {
          const data = await res.json();
          if (data && data.title) {
            caption = data.title;
            thumbnailUrl = data.thumbnail_url || null;
          }
        }
      } catch (err) {
        console.error('[oEmbed direct error]:', err);
      }

      // FALLBACK 1: CORS proxy if the direct call was blocked
      if (!caption) {
        setLoadingHint("Connecting to the post...");
        try {
          const proxyUrl = `https://corsproxy.io/?url=${encodeURIComponent(`https://www.tiktok.com/oembed?url=${encodeURIComponent(url)}`)}}`;
          const res = await fetch(proxyUrl);
          if (res.ok) {
            const data = await res.json();
            if (data && data.title) {
              caption = data.title;
              thumbnailUrl = data.thumbnail_url || null;
            }
          }
        } catch (err) {
          console.error('[oEmbed proxy error]:', err);
        }
      }

      // FALLBACK 2: Backend function (last resort — handles Apify/page-scrape)
      if (!caption) {
        setLoadingHint("Scanning post for beauty products...");
        try {
          const res = await base44.functions.invoke('extractSocialContent', { url });
          if (res?.success && res.caption) {
            caption = res.caption;
            thumbnailUrl = res.thumbnailUrl || null;
          }
        } catch (err) {
          console.error('[Backend fallback error]:', err);
        }
      }

      if (caption) {
        setLoadingHint("Reading the beauty edit...");
        const data = await base44.integrations.Core.InvokeLLM({
          prompt: `You are a luxury beauty product identification expert analyzing a social media post. Extract all beauty products explicitly mentioned.

Post content:
"${caption}"

For EACH beauty product explicitly mentioned, extract:
- brand: exact brand name as written in the post
- product_name: exact product name as written in the post
- subcategory: the product type (e.g. Foundation, Concealer, Mascara, Lipstick, Blush, Bronzer, Eyeshadow Palette, Eyeliner, Sunscreen, Powder, Fragrance, Lip Liner, Highlighter)

Also output:
- category: the dominant category from: ${CATEGORY_LIST.join(', ')}

CRITICAL: Only extract products EXPLICITLY named in the post. Do NOT invent or infer products that aren't mentioned. If no beauty products are mentioned, return an empty products_identified array.`,
          model: 'gemini_3_flash',
          response_json_schema: {
            type: 'object',
            properties: {
              category: { type: 'string' },
              products_identified: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    brand:        { type: 'string' },
                    product_name: { type: 'string' },
                    subcategory:  { type: 'string' },
                  },
                },
              },
            },
          },
        });
        const products = data?.products_identified || [];
        if (products.length > 0) {
          await finishWithProducts(products, data.category, thumbnailUrl);
          return;
        }
      }

      // ── PATH 2: Gemini web search fallback ────────────────────────
      setLoadingHint("Searching the web for this post...");
      const webData = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a luxury beauty product identification expert. A user shared this social media link: "${url}"

Search the web for the content of this post (TikTok or Instagram). Look for the post caption, description, or any page that discusses the products featured in this post.

For EACH beauty product explicitly mentioned in the post, extract:
- brand: exact brand name
- product_name: exact product name
- subcategory: the product type (e.g. Foundation, Concealer, Mascara, Lipstick, Blush, Bronzer, Eyeshadow Palette, Eyeliner, Sunscreen, Powder, Fragrance, Lip Liner, Highlighter)

Also output:
- category: the dominant category from: ${CATEGORY_LIST.join(', ')}

CRITICAL: Only extract products EXPLICITLY named in the post. Do NOT invent products. If you cannot find the post content or no beauty products are mentioned, return an empty products_identified array.`,
        model: 'gemini_3_flash',
        add_context_from_internet: true,
        response_json_schema: {
          type: 'object',
          properties: {
            category: { type: 'string' },
            products_identified: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  brand:        { type: 'string' },
                  product_name: { type: 'string' },
                  subcategory:  { type: 'string' },
                },
              },
            },
          },
        },
      });
      const webProducts = webData?.products_identified || [];
      if (webProducts.length > 0) {
        await finishWithProducts(webProducts, webData.category, null);
        return;
      }

      // ── Both paths failed ──────────────────────────────────────────
      clearInterval(interval);
      setProgress(0); setIsAnalyzing(false); setLoadingHint(null);
      setScanError("The Muse couldn't extract beauty content from this post. Try a post that features specific product names.");
      setActiveMode("error");
      logScan({ scan_method: "social_link", status: "failed", error_reason: "oEmbed, backend, and web search all failed" });
    } catch (error) {
      clearInterval(interval);
      console.error('[Pipeline Error]:', error);
      setScanError("Something went wrong. Please try again.");
      setActiveMode("error");
      setIsAnalyzing(false);
      setProgress(0);
      setLoadingHint(null);
      logScan({ scan_method: "social_link", status: "failed", error_reason: error?.message || String(error) });
    }
  };

  const handleLinkSubmit = async () => {
    const trimmed = linkInput.trim();
    if (!trimmed) return;
    try {
      const hostname = new URL(trimmed).hostname.replace(/^www\./, "");
      if (SOCIAL_EXTRACTABLE.some(d => hostname === d || hostname.endsWith("." + d))) {
        await analyzeSocialLink(trimmed);
        return;
      }
    } catch {}
    const isSocial = (() => {
      try {
        const hostname = new URL(trimmed).hostname.replace(/^www\./, "");
        return SOCIAL_DOMAINS.some(d => hostname === d || hostname.endsWith("." + d));
      } catch { return false; }
    })();
    await analyzeProduct({ type: "url", url: trimmed, isSocial });
  };

  const handleSaveAnyway = async () => {
    if (!pendingSave) return;
    const { entityData, enrichBrand, enrichName, enrichShade } = pendingSave;
    setDuplicateProduct(null);
    setPendingSave(null);
    setActiveMode("loading");
    setIsAnalyzing(true);
    let p = 0;
    const iv = setInterval(() => { p += 25; if (p > 90) p = 90; setProgress(Math.floor(p)); }, 300);
    try {
      const prod = await base44.entities.Product.create(entityData);
      enrichProductImage(prod.id, enrichBrand, enrichName, enrichShade);
      logScan({ scan_method: entityData.scan_method || "image", status: "success", product_id: prod.id, brand: enrichBrand, name: enrichName, shade: enrichShade, product_count: 1 });
      clearInterval(iv);
      setProgress(100);
      setTimeout(() => { onClose(); navigate(`/product/${prod.id}`); }, 500);
    } catch {
      clearInterval(iv);
      setScanError("Something went wrong. Please try again.");
      setActiveMode("error");
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  const analyzeProduct = async ({ type, file, url, text, imageUrl, isSocial }) => {
    setScanError(null);
    setActiveMode("loading");
    setIsAnalyzing(true);
    let p = 0;
    const interval = setInterval(() => {
      p += Math.random() * 15;
      if (p > 90) p = 90;
      setProgress(Math.floor(p));
    }, 400);

    try {
      let prompt = "";
      let file_urls = undefined;
      let useImageAnalysis = type === "image";

      if (type === "image") {
        if (file) {
          const uploadRes = await base44.integrations.Core.UploadFile({ file });
          file_urls = [uploadRes.file_url];
        } else if (imageUrl) {
          file_urls = [imageUrl];
        }
        prompt = `You are a luxury beauty product identification expert with exceptional attention to label detail. Analyze this image carefully and identify ALL visible beauty products — there may be one, two, or more.\n\nCRITICAL ACCURACY RULES:\n- Read the EXACT product name as printed on the packaging — do NOT paraphrase, simplify, or translate it. If the label says "3D Hydra Brillant à Lèvres", use that exact text for the name field.\n- Read the EXACT shade name and number as printed — include the shade number if visible (e.g. "51 Frozen Light Blue", NOT just "Light Blue"). If no shade is printed, return null.\n- Read the EXACT brand name as it appears on the product.\n- Do NOT summarize or generalize. Transcribe visible text verbatim.\n\nReturn a JSON object with a "products" array. For EACH identifiable beauty product include: identified (boolean — true ONLY if clearly a real beauty product), brand (string — exact as on packaging), name (string — exact as on packaging), shade (string or null — exact shade name+number as on packaging), category (one of: ${CATEGORY_LIST.join(", ")}), subcategory (from: ${SUBCATEGORY_GUIDE}), price_usd (number estimate), description (2-3 editorial sentences), muse_shimmer (short editorial tagline), where_to_buy (list of 3 retailers), ingredients_summary (brief), safety_score (1-10). Return an empty products array if no beauty products are visible.`;
      } else if (type === "url") {
        if (isSocial) {
          // Attempt server-side OG image fetch — runs during the loading animation
          try {
            const ogResult = await base44.functions.invoke('fetchSocialOGImage', { url });
            if (ogResult?.image_url) {
              file_urls = [ogResult.image_url];
              useImageAnalysis = true;
            }
          } catch {}
          if (useImageAnalysis) {
            prompt = `You are a luxury beauty product identification expert with exceptional attention to label detail. This image is from a social media post — it may feature one or more beauty products being used or reviewed.\n\nCRITICAL ACCURACY RULES:\n- Read the EXACT product name as printed on the packaging — do NOT paraphrase or generalize.\n- Read the EXACT shade name and number as printed. If no shade is visible, return null.\n- Read the EXACT brand name as it appears on the product.\n\nReturn a JSON object with a "products" array. For EACH identifiable beauty product include: identified (boolean — true ONLY if clearly a real beauty product), brand (string), name (string), shade (string or null), category (one of: ${CATEGORY_LIST.join(", ")}), subcategory (from: ${SUBCATEGORY_GUIDE}), price_usd (number estimate), description (2-3 editorial sentences), muse_shimmer (short editorial tagline), where_to_buy (list of 3 retailers), ingredients_summary (brief), safety_score (1-10). Return an empty products array if no beauty products are visible.`;
          } else {
            prompt = `You are a luxury beauty product identification expert. A user has shared this social media post link: "${url}". This may be an Instagram, TikTok, YouTube, Pinterest or similar post featuring beauty products. Based on any available context in the URL itself (username, post tags, or product names in the URL path), try to identify the beauty product being shown. If you cannot identify a specific real beauty product from the URL alone, set identified to false — do not fabricate details. Return a JSON object with: identified (boolean), brand (string), name (string), shade (string or null), category (one of: ${CATEGORY_LIST.join(", ")}), subcategory (choose the single most fitting subcategory from this guide: ${SUBCATEGORY_GUIDE}), price_usd (number estimate), description (2-3 editorial sentences), muse_shimmer (short editorial tagline), where_to_buy (list of 3 retailers), ingredients_summary (brief), safety_score (1-10).`;
          }
        } else {
          prompt = `You are a luxury beauty product identification expert. Analyze this URL/product link and identify the beauty product: "${url}". Return a JSON object with: identified (boolean), brand (string), name (string), shade (string or null), category (one of: ${CATEGORY_LIST.join(", ")}), subcategory (choose the single most fitting subcategory from this guide: ${SUBCATEGORY_GUIDE}), price_usd (number estimate), description (2-3 editorial sentences), muse_shimmer (short editorial tagline), where_to_buy (list of 3 retailers), ingredients_summary (brief), safety_score (1-10). If you cannot clearly identify the product from the URL text alone (brand name, product name in the URL path), set identified to false — do not fabricate details.`;
        }
      } else if (type === "voice") {
        prompt = `You are a luxury beauty product identification expert. The user said: "${text}". Identify this beauty product. Return a JSON object with: identified (boolean), brand (string), name (string), shade (string or null), category (one of: ${CATEGORY_LIST.join(", ")}), subcategory (choose the single most fitting subcategory from this guide: ${SUBCATEGORY_GUIDE}), price_usd (number estimate), description (2-3 editorial sentences), muse_shimmer (short editorial tagline), where_to_buy (list of 3 retailers), ingredients_summary (brief), safety_score (1-10).`;
      }

      const BAD_BRANDS = [
        "not identified", "unknown", "n/a", "none", "unidentified",
        "unclear", "not available", "not specified", "not determined", "undefined",
      ];
      const computeSafeShade = (shade) => {
        if (!shade) return null;
        const s = String(shade).trim();
        return ["null", "none", "n/a", "na", "", "no shade", "not applicable"].includes(s.toLowerCase()) ? null : s;
      };

// TODO: InvokeLLM below uses Anthropic (no API key) — migrate to a backend function using Gemini
      if (useImageAnalysis) {
        const imgResult = await base44.integrations.Core.InvokeLLM({
          prompt,
          file_urls,
          response_json_schema: {
            type: "object",
            properties: {
              products: {
                type: "array",
                items: {
                  type: "object",
                  properties: {
                    identified:          { type: "boolean" },
                    brand:               { type: "string"  },
                    name:                { type: "string"  },
                    shade:               { type: "string"  },
                    category:            { type: "string"  },
                    subcategory:         { type: "string"  },
                    price_usd:           { type: "number"  },
                    description:         { type: "string"  },
                    muse_shimmer:        { type: "string"  },
                    where_to_buy:        { type: "array", items: { type: "string" } },
                    ingredients_summary: { type: "string"  },
                    safety_score:        { type: "number"  },
                  }
                }
              }
            }
          }
        });
        clearInterval(interval);
        const validProducts = (imgResult.products || []).filter(p => {
          const bl = (p.brand || "").trim().toLowerCase();
          return p.identified !== false && p.brand && !BAD_BRANDS.includes(bl) && !bl.startsWith("not ");
        });
        if (validProducts.length === 0) {
          setProgress(0); setIsAnalyzing(false);
          logScan({ scan_method: type, status: "failed", product_count: 0 });
          setScanError("The Muse couldn't identify a beauty product here. Try a clearer photo showing the product label or packaging.");
          setActiveMode("error");
          return;
        }
        setProgress(100);
        if (validProducts.length === 1) {
          const p = validProducts[0];
          const entityData = {
            brand: p.brand, name: p.name, shade: computeSafeShade(p.shade),
            category: p.category || "Makeup", subcategory: normalizeSubcategory(p.category, p.subcategory),
            price: p.price_usd || 0, currency: "USD", description: p.description,
            muse_shimmer: p.muse_shimmer, where_to_buy: JSON.stringify(p.where_to_buy || []),
            ingredients: p.ingredients_summary, scan_method: type, image_url: file_urls?.[0] || null,
          };
          const dup = await checkForDuplicate(p.brand, p.name);
          if (dup) {
            setIsAnalyzing(false);
            setDuplicateProduct(dup);
            setPendingSave({ entityData, enrichBrand: p.brand, enrichName: p.name, enrichShade: p.shade });
            setActiveMode("duplicate");
            return;
          }
          const prod = await base44.entities.Product.create(entityData);
          enrichProductImage(prod.id, p.brand, p.name, p.shade);
          logScan({ scan_method: type, status: "success", product_id: prod.id, brand: p.brand, name: p.name, shade: p.shade, product_count: 1 });
          setTimeout(() => { onClose(); navigate(`/product/${prod.id}`); }, 500);
        } else {
          const createdProducts = await Promise.all(
            validProducts.map(p =>
              base44.entities.Product.create({
                brand: p.brand, name: p.name, shade: computeSafeShade(p.shade),
                category: p.category || "Makeup", subcategory: normalizeSubcategory(p.category, p.subcategory),
                price: p.price_usd || 0, currency: "USD", description: p.description,
                muse_shimmer: p.muse_shimmer, where_to_buy: JSON.stringify(p.where_to_buy || []),
                ingredients: p.ingredients_summary, scan_method: type, image_url: file_urls?.[0] || null,
              })
            )
          );
          createdProducts.forEach((prod, i) => {
            enrichProductImage(prod.id, validProducts[i].brand, validProducts[i].name, validProducts[i].shade);
          });
          logScan({ scan_method: type, status: "success", product_count: createdProducts.length });
          setIsAnalyzing(false);
          setProgress(100);
          setTimeout(() => {
            onClose();
            navigate("/scan-results", {
              state: {
                products: createdProducts.map((prod, i) => ({
                  id: prod.id,
                  brand: validProducts[i].brand,
                  name: validProducts[i].name,
                  shade: validProducts[i].shade,
                  category: validProducts[i].category,
                })),
                scanImageUrl: file_urls?.[0] || null,
              }
            });
          }, 500);
        }
      } else {
        // TODO: InvokeLLM below uses Anthropic (no API key) — migrate to a backend function using Gemini
        const result = await base44.integrations.Core.InvokeLLM({
          prompt,
          file_urls,
          response_json_schema: {
            type: "object",
            properties: {
              identified:          { type: "boolean" },
              brand:               { type: "string"  },
              name:                { type: "string"  },
              shade:               { type: "string"  },
              category:            { type: "string"  },
              subcategory:         { type: "string"  },
              price_usd:           { type: "number"  },
              description:         { type: "string"  },
              muse_shimmer:        { type: "string"  },
              where_to_buy:        { type: "array", items: { type: "string" } },
              ingredients_summary: { type: "string"  },
              safety_score:        { type: "number"  },
            }
          }
        });
        clearInterval(interval);
        const brandLower = (result.brand || "").trim().toLowerCase();
        const isBadBrand = !result.brand || BAD_BRANDS.includes(brandLower) || brandLower.startsWith("not ");
        if (result.identified === false || isBadBrand) {
          setProgress(0); setIsAnalyzing(false);
          logScan({ scan_method: type, status: "failed", product_count: 0 });
          setScanError(isSocial
            ? "The Muse couldn't identify a product from this post — try saving the image and using Gallery instead for best results."
            : "The Muse couldn't identify a beauty product here. Try a clearer photo showing the product label or packaging."
          );
          setActiveMode("error");
          return;
        }
        setProgress(100);
        const entityData = {
          brand: result.brand, name: result.name, shade: computeSafeShade(result.shade),
          category: result.category || "Makeup", subcategory: normalizeSubcategory(result.category, result.subcategory),
          price: result.price_usd || 0, currency: "USD", description: result.description,
          muse_shimmer: result.muse_shimmer, where_to_buy: JSON.stringify(result.where_to_buy || []),
          ingredients: result.ingredients_summary, source_url: url || null,
          scan_method: type, image_url: file_urls?.[0] || null,
        };
        const dup = await checkForDuplicate(result.brand, result.name);
        if (dup) {
          setIsAnalyzing(false);
          setDuplicateProduct(dup);
          setPendingSave({ entityData, enrichBrand: result.brand, enrichName: result.name, enrichShade: result.shade });
          setActiveMode("duplicate");
          return;
        }
        const prod = await base44.entities.Product.create(entityData);
        enrichProductImage(prod.id, result.brand, result.name, result.shade);
        logScan({ scan_method: type, status: "success", product_id: prod.id, brand: result.brand, name: result.name, shade: result.shade, product_count: 1 });
        setTimeout(() => { onClose(); navigate(`/product/${prod.id}`); }, 500);
      }
    } catch (error) {
      clearInterval(interval);
      console.error('[Pipeline Error]:', error);
      logScan({ scan_method: type, status: "failed", product_count: 0, error_reason: error?.message || String(error) });
      setScanError("Something went wrong. Please try again.");
      setActiveMode("error");
      setIsAnalyzing(false);
      setProgress(0);
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
        style={{
          background: "#F7F2EE",
        }}
        onClick={(e) => e.target === e.currentTarget && onClose()}
      >
        {/* Close */}
        <button onClick={onClose} className="absolute top-5 right-5 w-9 h-9 flex items-center justify-center rounded-full border border-[#1A3A30]/30 z-20">
          <X size={16} color="#1A3A30" />
        </button>

        {/* ===== LOADING ===== */}
        {activeMode === "loading" && (
          <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden" style={{ background: "#F5F2ED" }}>
            {/* Silk background — generated satin texture */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: "url('https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/b59b6d7ea_generated_image.png')",
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center px-8">
              {/* Swan emblem */}
              <div className="swan-float mb-4">
                <img
                  src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/87fc5ab0f_IMG_4373.png"
                  alt="The Muse"
                  className="w-32 h-32 object-contain"
                  style={{ background: "transparent", filter: "drop-shadow(0 2px 10px rgba(14,59,46,0.18))" }}
                />
              </div>
              {/* THE MUSE heading */}
              <h2
                className="text-[#1A3C34] uppercase mb-8"
                style={{ fontSize: "15px", letterSpacing: "0.42em", fontWeight: 600, paddingLeft: "0.42em", fontFamily: "'Cormorant Garamond', Georgia, serif" }}
              >
                The Muse
              </h2>
              {/* Status message */}
              <p className="font-serif text-base text-[#1A3C34] text-center mb-1" style={{ fontWeight: 400 }}>
                The Muse is identifying
              </p>
              <p className="font-serif text-sm text-[#1A3C34] text-center mb-10 italic" style={{ fontWeight: 300 }}>
                your beauty treasures...
              </p>

              {/* Pill progress bar with moon phases */}
              <div className="flex items-center gap-3 w-full max-w-[300px]">
                <div
                  className="flex-1 rounded-full flex items-center justify-center"
                  style={{
                    border: "1px solid rgba(26,60,52,0.2)",
                    background: "rgba(255,252,245,0.55)",
                    padding: "5px 8px",
                    gap: "4px",
                    backdropFilter: "blur(4px)",
                  }}
                >
                  {Array.from({ length: 10 }).map((_, i) => {
                    const phaseValue = i / 9;
                    const isActive = i < Math.ceil(progress * 10 / 100);
                    const clipId = `mp-${i}`;
                    const dark = "#0A3528";
                    const light = "#F5EDE4";
                    const inactive = "#E0D5C8";
                    return (
                      <svg key={i} width="18" height="18" viewBox="0 0 20 20" className="flex-shrink-0">
                        <defs>
                          <clipPath id={clipId}>
                            <circle cx="10" cy="10" r="7" />
                          </clipPath>
                        </defs>
                        {isActive ? (
                          <>
                            <circle cx="10" cy="10" r="7" fill={dark} />
                            <g clipPath={`url(#${clipId})`}>
                              <rect x="10" y="2" width="9" height="16" fill={light} />
                              {phaseValue <= 0.5 ? (
                                <ellipse cx="10" cy="10" rx={7 * (1 - 2 * phaseValue)} ry="7" fill={dark} />
                              ) : (
                                <ellipse cx="10" cy="10" rx={7 * (2 * phaseValue - 1)} ry="7" fill={light} />
                              )}
                            </g>
                          </>
                        ) : (
                          <circle cx="10" cy="10" r="7" fill={inactive} />
                        )}
                      </svg>
                    );
                  })}
                </div>
                <span
                  className="font-serif flex-shrink-0"
                  style={{ fontSize: "13px", color: "#0A3528", letterSpacing: "0.05em", fontWeight: 500 }}
                >
                  {progress}%
                </span>
              </div>
              {loadingHint && (
                <p className="font-serif text-xs text-[#1A3C34]/45 italic mt-5 text-center max-w-[260px] leading-relaxed">
                  {loadingHint}
                </p>
              )}
            </div>
          </div>
        )}

        {/* ===== ERROR ===== */}
        {activeMode === "error" && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center px-8 text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
              style={{ background: "#EADCCF" }}
            >
              <span style={{ fontSize: 26, lineHeight: 1, color: "#1B2E2A" }}>✦</span>
            </div>
            <h3 className="font-serif text-xl text-[#1B2E2A] mb-2">The Muse couldn't identify this</h3>
            <p className="text-sm text-[#4A443E] italic mb-8 max-w-[260px] leading-relaxed">{scanError}</p>
            <button
              onClick={() => { setActiveMode(null); setScanError(null); setIsAnalyzing(false); heardRef.current = ""; setHeard(""); }}
              className="px-8 py-3 bg-[#1E3D35] text-white text-xs tracking-[0.25em] uppercase rounded-full font-light"
            >
              Try Again
            </button>
          </motion.div>
        )}

        {/* ===== DUPLICATE ===== */}
        {activeMode === "duplicate" && duplicateProduct && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center px-8 text-center"
          >
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center mb-6"
              style={{ background: "#EFE9DC" }}
            >
              <span style={{ fontSize: 26, lineHeight: 1, color: "#1B2E2A" }}>✦</span>
            </div>
            <h3 className="font-serif text-xl text-[#1B2E2A] mb-2">Already in your collection</h3>
            <p className="font-serif text-base text-[#4A443E] italic mb-1">{duplicateProduct.brand}</p>
            <p className="text-sm text-[#4A443E] mb-1">{duplicateProduct.name}</p>
            {duplicateProduct.shade && (
              <p className="text-xs text-[#8B7355] italic mb-8">{duplicateProduct.shade}</p>
            )}
            {!duplicateProduct.shade && <div className="mb-8" />}
            <div className="flex flex-col gap-3 w-full max-w-[240px]">
              <button
                onClick={() => { onClose(); navigate(`/product/${duplicateProduct.id}`); }}
                className="w-full py-3.5 bg-[#1A3A30] text-[#FDF7EF] text-xs tracking-[0.25em] uppercase rounded-full font-light"
              >
                View in Collection
              </button>
              <button
                onClick={handleSaveAnyway}
                className="w-full py-3 border border-[#1A3A30]/30 text-[#1A3A30] text-xs tracking-[0.25em] uppercase rounded-full font-light"
              >
                Save Anyway
              </button>
              <button
                onClick={() => { setDuplicateProduct(null); setPendingSave(null); setActiveMode(null); }}
                className="mt-1 text-xs text-[#1A3A30]/40 underline"
              >
                Back
              </button>
            </div>
          </motion.div>
        )}

        {/* ===== GALLERY PREVIEW (iridescent flourish, auto-analyses) ===== */}
        {activeMode === "preview" && previewUrl && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center"
          >
            <div className="iridescent-frame rounded-[18px]">
              <div className="w-52 h-52 rounded-[16px] overflow-hidden">
                <img src={previewUrl} alt="Selected" className="w-full h-full object-cover" />
              </div>
            </div>
            <p className="font-serif text-sm text-[#1A3A30]/60 italic mt-6">The Muse is preparing...</p>
          </motion.div>
        )}

        {/* ===== LINK INPUT ===== */}
        {activeMode === "link" && !isAnalyzing && (
          <div className="flex flex-col items-center px-8 w-full max-w-sm">
            <h3 className="font-serif text-2xl text-[#1A3A30] text-center mb-1">Paste a social link</h3>
            <p className="text-sm text-[#8B7355] text-center mb-8 italic">Instagram, TikTok, Pinterest, YouTube &amp; more</p>
            <div className="w-full border border-[#1A3A30]/25 rounded-2xl px-4 py-3 flex items-center gap-3 bg-white/60 mb-4">
              <LinkIcon size={18} color="#1A3A30" />
              <input
                autoFocus
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                placeholder="Paste a social media link..."
                className="flex-1 bg-transparent text-sm text-[#1A3A30] outline-none placeholder:text-[#1A3A30]/30 font-light"
                onKeyDown={(e) => e.key === "Enter" && handleLinkSubmit()}
              />
            </div>
            <p className="text-[11px] text-[#1A3A30]/40 font-light mb-8 text-center italic leading-relaxed">
              Works best with public posts featuring beauty products<br/>
              <span className="not-italic">Also works with Sephora, brand websites and more</span>
            </p>
            <button
              onClick={handleLinkSubmit}
              className="w-full py-3.5 bg-[#1A3A30] text-[#FDF7EF] text-xs tracking-[0.25em] uppercase rounded-full font-light"
            >
              Analyse with The Muse
            </button>
            <button onClick={() => setActiveMode(null)} className="mt-4 text-xs text-[#1A3A30]/40 underline">Back</button>
          </div>
        )}

        {/* ===== VOICE INPUT ===== */}
        {activeMode === "audio" && !isAnalyzing && (
          <div className="flex flex-col items-center justify-center w-full h-full relative">
            <div className="absolute top-6 right-6" style={{ transform: "rotate(8deg)" }}>
              <SwanLogo size={34} />
            </div>

            {/* Soundwave SVG backdrop */}
            <div className="relative flex items-center justify-center mb-10">
              <svg width="280" height="120" viewBox="0 0 280 120" className="absolute" style={{ left: "50%", top: "50%", transform: "translate(-50%,-50%)" }}>
                {[
                  { d: "M0 60 Q 35 20, 70 60 T 140 60 T 210 60 T 280 60", c: "#1A3A30", o: isListening ? 0.28 : 0.12 },
                  { d: "M0 60 Q 35 95, 70 60 T 140 60 T 210 60 T 280 60", c: "#C5A070", o: isListening ? 0.38 : 0.18 },
                  { d: "M0 60 Q 35 30, 70 60 T 140 60 T 210 60 T 280 60", c: "#1A3A30", o: isListening ? 0.18 : 0.08 },
                  { d: "M0 60 Q 35 80, 70 60 T 140 60 T 210 60 T 280 60", c: "#C5A070", o: isListening ? 0.30 : 0.14 },
                ].map((w, i) => (
                  <motion.path
                    key={i}
                    d={w.d}
                    fill="none"
                    stroke={w.c}
                    strokeWidth={2.5}
                    strokeLinecap="round"
                    style={{ opacity: w.o }}
                    animate={{ pathLength: isListening ? [0.5, 1, 0.5] : [0.3, 0.5, 0.3] }}
                    transition={{ duration: (3 + i * 0.4) / (isListening ? 1.5 : 1), repeat: Infinity, ease: "easeInOut" }}
                  />
                ))}
              </svg>

              {/* Mic orb — tap to start/stop */}
              <motion.button
                animate={{ scale: isListening ? [1, 1.06, 1] : 1 }}
                transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut" }}
                onClick={isListening ? stopListening : startListening}
                className="relative w-24 h-24 rounded-full flex items-center justify-center z-10"
                style={{
                  background: isListening
                    ? "radial-gradient(circle at 35% 30%, #4A705A 0%, #2A5045 70%, #1A3A35 100%)"
                    : "radial-gradient(circle at 35% 30%, #2A5045 0%, #1A3A35 70%, #122A26 100%)",
                  border: `2px solid ${isListening ? "#E8D4A0" : "#C5A070"}`,
                  boxShadow: isListening
                    ? "0 0 0 8px rgba(197,160,112,0.20), 0 0 0 16px rgba(197,160,112,0.08), 0 8px 30px rgba(26,58,48,0.35)"
                    : "0 0 0 6px rgba(197,160,112,0.12), 0 8px 30px rgba(26,58,48,0.25)"
                }}
              >
                <Mic size={38} strokeWidth={1.6} color={isListening ? "#FDF7EF" : "#FDF7EF"} />
                {isListening && (
                  <motion.div
                    className="absolute inset-0 rounded-full border-2 border-[#C5A070]"
                    animate={{ scale: [1, 1.35, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                )}
              </motion.button>
            </div>

            {/* Status text */}
            <h3 className="font-serif text-2xl text-[#8B7355] mb-1" style={{ letterSpacing: "0.02em" }}>
              {isListening ? "Listening..." : "Voice Search"}
            </h3>
            <p className="text-sm text-[#8B7355]/70 italic mb-4">
              {isListening ? "Say the product name" : hasSpeech ? "Tap the orb to speak" : "Type the product below"}
            </p>

            {/* Live transcript */}
            {heard && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm text-[#1A3A30] font-light italic mb-4 max-w-xs text-center px-4"
              >
                "{heard}"
              </motion.p>
            )}

            {/* Fallback text input when speech not supported */}
            {!hasSpeech && (
              <div className="w-full max-w-xs px-6 mb-4">
                <div className="w-full border border-[#1A3A30]/25 rounded-2xl px-4 py-3 flex items-center gap-3 bg-white/60">
                  <Mic size={16} color="#1A3A30" />
                  <input
                    autoFocus
                    value={voiceInput}
                    onChange={e => setVoiceInput(e.target.value)}
                    placeholder="e.g. Charlotte Tilbury Pillow Talk..."
                    className="flex-1 bg-transparent text-sm text-[#1A3A30] outline-none placeholder:text-[#1A3A30]/30 font-light"
                    onKeyDown={e => {
                      if (e.key === "Enter" && voiceInput.trim()) {
                        analyzeProduct({ type: "voice", text: voiceInput.trim() });
                      }
                    }}
                  />
                </div>
              </div>
            )}

            <div className="flex flex-col items-center gap-3 w-full max-w-xs px-8">
              {!hasSpeech && (
                <button
                  onClick={() => {
                    if (voiceInput.trim()) analyzeProduct({ type: "voice", text: voiceInput.trim() });
                  }}
                  className="w-full py-3.5 bg-[#1A3A30] text-[#FDF7EF] text-xs tracking-[0.25em] uppercase rounded-full font-light"
                >
                  Analyse with The Muse
                </button>
              )}
              <button onClick={() => { stopListening(); setHeard(""); heardRef.current = ""; setActiveMode(null); }} className="text-xs text-[#1A3A30]/40 underline">
                Back
              </button>
            </div>
          </div>
        )}

        {/* ===== MIRROR — VIRTUAL TRY-ON (coming soon) ===== */}
        {activeMode === "mirror" && (
          <StudioComingSoon onClose={() => setActiveMode(null)} />
        )}

        {/* ===== DEFAULT — RADIAL FAN MENU ===== */}
        {!activeMode && (
          <div className="relative w-[380px] h-[440px] mx-auto max-w-full">
            {/* Fan tiles */}
            {inputMethods.map(({ id, label, icon: Icon }, i) => {
              const pos = tilePositions[i];
              return (
                <motion.button
                  key={id}
                  initial={{ opacity: 0, scale: 0.5, x: 0, y: 0 }}
                  animate={{ opacity: 1, scale: 1, x: pos.x, y: pos.y }}
                  transition={{ delay: 0.08 * i, type: "spring", stiffness: 220, damping: 18 }}
                  onClick={() => {
                    if      (id === "history") { onClose(); navigate("/scan-history"); }
                    else if (id === "camera")  cameraInputRef.current?.click();
                    else if (id === "gallery") fileInputRef.current?.click();
                    else if (id === "link")    setActiveMode("link");
                    else if (id === "audio")   { heardRef.current = ""; setHeard(""); setActiveMode("audio"); }
                    else if (id === "mirror")  setActiveMode("mirror");
                  }}
                  className="absolute flex flex-col items-center gap-2.5"
                  style={{ left: "190px", top: "240px", marginLeft: "-32px", marginTop: "-32px" }}
                >
                  <div
                    className="w-16 h-16 rounded-[20px] flex items-center justify-center"
                    style={{
                      background: "#EFE9DC",
                      border: "1px solid #0B3C26",
                      boxShadow: "0 4px 14px rgba(11,60,38,0.10)"
                    }}
                  >
                    {typeof Icon === "string" ? (
                      <span style={{ fontSize: 24, lineHeight: 1 }}>{Icon}</span>
                    ) : (
                      <Icon size={24} strokeWidth={1.5} color="#0B3C26" />
                    )}
                  </div>
                  <span className="font-serif text-[10px] tracking-[0.14em] uppercase text-[#0B3C26] font-medium whitespace-nowrap">{label}</span>
                </motion.button>
              );
            })}

            {/* Central swan button — uploaded asset */}
            <motion.button
              initial={{ opacity: 0, scale: 0.6 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.45, type: "spring", stiffness: 200, damping: 16 }}
              onClick={() => setShowMuse(true)}
              className="absolute rounded-full cursor-pointer overflow-hidden"
              style={{
                left: "190px",
                top: "240px",
                width: "140px",
                height: "140px",
                marginLeft: "-70px",
                marginTop: "-70px",
                boxShadow: "0 8px 24px rgba(11,60,38,0.18)"
              }}
            >
              <img
                src="https://media.base44.com/images/public/6a57507f2558691b9c2c4bcf/26306bad9_IMG_4464.png"
                alt="The Muse"
                className="w-full h-full object-cover"
              />
            </motion.button>
          </div>
        )}

        {/* Tiny faint star - bottom-right corner */}
        {!activeMode && (
          <div className="absolute bottom-6 right-7 pointer-events-none" style={{ opacity: 0.25 }}>
            <Sparkles size={14} color="#1D221D" strokeWidth={1} />
          </div>
        )}

        {/* Hidden file inputs */}
        <input ref={fileInputRef}   type="file" accept="image/*"                  className="hidden" onChange={handleFileUpload} />
        <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" className="hidden" onChange={handleFileUpload} />

        {/* The Muse assistant — opened via central swan */}
        {showMuse && (
          <MuseAssistant
            onClose={() => setShowMuse(false)}
            onOpenScan={() => { setShowMuse(false); cameraInputRef.current?.click(); }}
          />
        )}
      </motion.div>
    </AnimatePresence>
  );
}
