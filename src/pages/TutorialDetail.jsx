import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Copy, Check, Heart, Bookmark, ShoppingBag, Share2 } from "lucide-react";
import { motion } from "framer-motion";
import SwanLogo from "@/components/SwanLogo";
import { base44 } from "@/api/base44Client";

const SAMPLE_TUTORIALS = {
  "sample-1": {
    id: "sample-1",
    title: "Met Gala Glam",
    category: "Makeup",
    difficulty: "Advanced",
    duration_minutes: 30,
    image_url: "https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?w=600&q=80",
    description: "The Met Gala demands nothing less than extraordinary. This look channels high-fashion drama through a masterful balance of sculpted contour and luminous skin. Every product must earn its place on your face tonight.",
    materials: ["Luminizing primer", "Full-coverage foundation", "Translucent setting powder", "Contouring palette", "Luminous highlighter", "Dramatic false lashes", "Lash adhesive", "Black gel eyeliner", "Neutral eyeshadow palette", "Firm-hold setting spray"],
    steps: [
      "Begin with a luminizing primer applied to clean, moisturised skin. Allow to absorb for three minutes before proceeding.",
      "Apply full-coverage foundation with a damp beauty sponge, pressing into the skin rather than swiping for a flawless, seam-free result.",
      "Set the foundation with translucent powder; bake under the eyes with a thick layer for five minutes, then dust away for a porcelain finish.",
      "Sculpt the cheekbones, temples, and jaw with a cool-toned contour powder. The key is subtlety — blend until the shadow appears to live within the face.",
      "Build a deep smoky eye: warm taupe on the lid, mid-brown through the crease, black at the outer corner. Blend for a minimum of three minutes.",
      "Line the upper lash line with black gel liner, extending into a precise wing that follows the angle of your lower lid.",
      "Tightline the upper and lower waterlines with black pencil. This is where the drama truly lives.",
      "Apply false lashes as close to the natural lash line as possible. Press gently and hold for thirty seconds.",
      "Apply luminous highlighter to the tops of cheekbones, brow bone, inner eye corners, and cupid's bow.",
      "Lock everything in with setting spray from thirty centimetres away. You are ready.",
    ],
    saves_count: 342,
    is_muse_original: true,
    owned_count: 4,
  },
  "sample-2": {
    id: "sample-2",
    title: "Smokey Monica Bellucci Inspired Makeup",
    category: "Makeup",
    difficulty: "Intermediate",
    duration_minutes: 10,
    image_url: "https://images.unsplash.com/photo-1512496015851-a90fb38ba796?w=600&q=80",
    description: "The smoky eye is not a trend — it is a language. One that speaks of confidence, mystery, and knowing exactly who you are. This look draws from Monica Bellucci's cinematic allure: deep, smoldering, effortlessly dramatic.",
    materials: ["Chocolate brown pencil", "Black pencil", "Black eyeshadow", "Medium brown powder eyeshadow", "Beige eyeshadow", "Mascara", "False lashes (optional)", "Blending brush", "Precise brush"],
    steps: [
      "Apply a chocolate brown pencil over the entire eyelid to create a creamy base.",
      "Use a small brush to stretch and blend the pencil from the lash line upwards towards the crease.",
      "Use a clean fluffy brush to diffuse the edges, ensuring there are no harsh lines.",
      "Pat a small amount of black eyeshadow over the brown base on the mobile lid to set the cream product.",
      "Apply a medium brown powder shade above the black shadow in the crease to create a seamless gradient transition.",
      "Apply black eyeshadow to the lower lash line directly over the brown pencil to lock the colour in place.",
      "Use a black powder liner to create a subtle wing and connect it to the shadow on the mobile lid.",
      "Apply a beige eyeshadow under the brow bone and in the inner corner of the eye to highlight and brighten.",
      "Tightline the upper and lower waterlines using a black pencil for added intensity.",
      "Finish with mascara to the lashes; add false lashes if desired for extra drama.",
    ],
    saves_count: 1,
    is_muse_original: false,
    creator_source: "Monica Bellucci press photography, 2024",
    creator_platform: "Instagram",
    owned_count: 3,
  },
  "sample-3": {
    id: "sample-3",
    title: "Clean Girl Aesthetic",
    category: "Makeup",
    difficulty: "Beginner",
    duration_minutes: 8,
    image_url: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&q=80",
    description: "No-makeup makeup for the modern muse. Dewy, effortless, present. The clean girl look is not about the absence of effort — it is about misdirection. You spend twenty minutes to look like you spent none.",
    materials: ["Tinted moisturiser or skin tint", "Concealer", "Cream blush (peach or coral)", "Clear brow gel", "Lengthening mascara", "Lip tint or tinted balm", "Light setting powder (optional)"],
    steps: [
      "Begin with clean, moisturised skin. Let your skincare sit for five minutes before applying any makeup.",
      "Apply tinted moisturiser or skin tint with your fingers, blending outward from the centre of the face.",
      "Use a small amount of concealer under the eyes and on any areas that need evening. Blend with your ring finger.",
      "Brush cream blush onto the apples of the cheeks and blend lightly upward toward the temples.",
      "Groom the brows with clear gel, brushing them upward for a natural, fluffy effect.",
      "Apply one coat of mascara to the upper lashes only.",
      "Finish with a sheer lip tint or lip balm in a nude-peach shade.",
    ],
    saves_count: 89,
    is_muse_original: true,
    owned_count: 5,
  },
  "sample-4": {
    id: "sample-4",
    title: "Double Cleanse Method",
    category: "Skincare",
    difficulty: "Beginner",
    duration_minutes: 5,
    image_url: "https://images.unsplash.com/photo-1598440947619-2c35fc9aa908?w=600&q=80",
    description: "The Japanese ritual that changed skincare. First, an oil cleanser dissolves makeup, sunscreen, and pollution. Then, a water-based cleanser addresses the skin itself. The result: a canvas entirely clean, entirely ready.",
    materials: ["Oil cleanser or cleansing balm", "Gentle water-based cleanser", "Muslin cloth or microfibre towel"],
    steps: [
      "Warm a coin-sized amount of oil cleanser between your palms, then massage gently over dry skin in circular motions for thirty seconds.",
      "Focus on the eye area, paying careful attention to lash lines where mascara gathers.",
      "Add a small amount of water to emulsify the oil — it will turn milky. Continue massaging, then rinse thoroughly.",
      "Apply a small amount of water-based cleanser to damp skin, working into a gentle lather for thirty seconds.",
      "Rinse with cool or lukewarm water. Pat dry — never rub — with a clean muslin cloth.",
    ],
    saves_count: 211,
    is_muse_original: true,
    owned_count: 2,
  },
  "sample-5": {
    id: "sample-5",
    title: "Glass Skin Ritual",
    category: "Skincare",
    difficulty: "Intermediate",
    duration_minutes: 20,
    image_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&q=80",
    description: "Translucency achieved through layering — the Korean approach to skin that appears lit from within. This is not a quick routine. It is a ceremony. Each layer must be fully absorbed before the next begins.",
    materials: ["Oil cleanser", "Gentle water-based cleanser", "Exfoliating toner (AHA or BHA)", "Hydrating toner", "Essence", "Hyaluronic acid serum", "Sheet mask (optional)", "Light gel moisturiser", "SPF 50"],
    steps: [
      "Double cleanse thoroughly. Glass skin begins with complete cleanliness.",
      "Apply exfoliating toner with a cotton pad, swiping gently over the face. Allow to absorb for three minutes. Use at night only.",
      "Apply hydrating toner by pressing into the skin with your palms. Do this three times, allowing each layer to sink in before the next.",
      "Apply essence — a few drops pressed gently into the skin. This step is the heart of the ritual.",
      "Apply your hyaluronic acid serum, pressing it into slightly damp skin for maximum absorption.",
      "If using a sheet mask, leave on for fifteen to twenty minutes. Press remaining essence into the skin when removing.",
      "Seal with a light gel moisturiser. Press in; do not rub.",
      "In the morning, finish with SPF 50 pressed firmly into the skin.",
    ],
    saves_count: 178,
    is_muse_original: true,
    owned_count: 3,
  },
  "sample-6": {
    id: "sample-6",
    title: "Silk Hair Therapy",
    category: "Hair",
    difficulty: "Beginner",
    duration_minutes: 15,
    image_url: "https://images.unsplash.com/photo-1634449571010-02389ed0f9b0?w=600&q=80",
    description: "Hair is a crown you never take off. This ritual treats it as such. A weekly deep-treatment ceremony that restores moisture, repairs damage, and returns your hair to its most luminous state.",
    materials: ["Moisturising shampoo", "Deep conditioner or hair mask", "Wide-tooth comb", "Hair oil (argan or jojoba)", "Shower cap"],
    steps: [
      "Section dry or damp hair into four parts using clips — two front, two back.",
      "Apply the hair mask generously from mid-shaft to ends, avoiding the scalp. Work through each section with a wide-tooth comb.",
      "Gather all hair under a shower cap. Apply gentle heat with a warm towel wrapped around the cap. Leave for ten to fifteen minutes.",
      "Shampoo gently once, focusing on the scalp. Rinse thoroughly.",
      "Follow with a lightweight conditioner from mid-shaft to ends. Leave for two minutes, then rinse with cool water.",
      "While hair is still damp, apply one to two drops of hair oil to the ends to seal in moisture.",
    ],
    saves_count: 134,
    is_muse_original: true,
    owned_count: 2,
  },
  "sample-7": {
    id: "sample-7",
    title: "Morning Light Ritual",
    category: "Wellness",
    difficulty: "Beginner",
    duration_minutes: 10,
    image_url: "https://images.unsplash.com/photo-1578747763484-51b21a33e4fa?w=600&q=80",
    description: "The morning ritual is not preparation for the day — it is the first gift you give yourself. Ten minutes that set the tone for everything that follows.",
    materials: ["Jade roller or gua sha tool", "Facial mist", "Eye cream", "SPF moisturiser"],
    steps: [
      "Before reaching for your phone, take three slow breaths. The ritual begins here.",
      "Splash the face with cool water — never hot in the morning. It gently awakens the lymphatic system.",
      "Mist the face lightly with a facial mist or rose water.",
      "Gently press eye cream around the orbital bone using your ring finger — the lightest touch available to you.",
      "Roll a jade roller from neck to forehead in upward strokes, ten passes per section. Keep it cold overnight for better depuffing.",
      "Apply SPF moisturiser as the final step, pressing it firmly into the skin.",
    ],
    saves_count: 267,
    is_muse_original: true,
    owned_count: 4,
  },
  "sample-8": {
    id: "sample-8",
    title: "The Natural Arch",
    category: "Makeup",
    difficulty: "Intermediate",
    duration_minutes: 8,
    image_url: "https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=600&q=80",
    description: "Brows as architecture — framing the face with intention and restraint. The natural arch does not impose a shape; it reveals the one already there.",
    materials: ["Brow pencil (one shade lighter than hair)", "Spoolie brush", "Clear or tinted brow gel", "Small angled brush"],
    steps: [
      "Brush brows upward with a clean spoolie to see their natural shape.",
      "Using the brow pencil, draw light, hair-like strokes in sparse areas — work in the direction of hair growth.",
      "Focus on the arch: the highest point should fall above the outer edge of the iris.",
      "Define the tail subtly. Placed diagonally from nostril, the tail should end at the outer corner of the eye.",
      "Blend any drawn strokes with the spoolie. Nothing should look drawn on.",
      "Set with clear or tinted brow gel, brushing upward through the inner two-thirds and following the natural direction toward the tail.",
    ],
    saves_count: 95,
    is_muse_original: true,
    owned_count: 3,
  },
  "sample-11": {
    id: "sample-11",
    title: "French Girl Flush",
    category: "Makeup",
    difficulty: "Beginner",
    duration_minutes: 5,
    image_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&q=80",
    description: "Sun-kissed blush and barely-there lip tint. The Parisian approach to colour: enough to look effortlessly alive, not enough to look like you tried.",
    materials: ["Cream blush (peach, coral, or rose)", "Sheer lip tint or glossy balm", "Translucent powder", "Mascara"],
    steps: [
      "Apply cream blush to the apples of the cheeks with your fingers, blending upward and outward in one motion.",
      "Dust the lightest translucent powder over the top to soften the intensity.",
      "Dab the same blush lightly on the eyelids for a monochromatic flush effect.",
      "Apply sheer lip tint or glossy balm — the colour should look like a natural deepening of your own lip shade.",
      "Finish with one coat of mascara. The French girl stops at one.",
    ],
    saves_count: 312,
    is_muse_original: true,
    owned_count: 2,
  },
  "sample-12": {
    id: "sample-12",
    title: "Retinol Decoded",
    category: "Skincare",
    difficulty: "Intermediate",
    duration_minutes: 15,
    image_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=600&q=80",
    description: "The science of skin renewal, demystified. Retinol is one of the most thoroughly researched skincare ingredients that exists. This guide teaches you how to introduce it without the chaos.",
    materials: ["Retinol serum (0.025% to start)", "Rich calming moisturiser", "SPF 50+ (non-negotiable)", "Gentle cleanser"],
    steps: [
      "Begin only at night. Cleanse with a gentle, non-stripping cleanser and pat skin completely dry.",
      "Apply a pea-sized amount of retinol to the entire face — no more. Less is always more.",
      "Wait ten minutes before applying moisturiser. This 'buffering' technique reduces potential irritation.",
      "Apply a rich, calming moisturiser over the top.",
      "In the morning, apply SPF 50 without exception. Retinol increases photosensitivity.",
      "For the first two weeks: use retinol once per week only. After two weeks with no reaction, increase to twice per week.",
    ],
    saves_count: 445,
    is_muse_original: true,
    owned_count: 1,
  },
  "sample-13": {
    id: "sample-13",
    title: "Gua Sha Ceremony",
    category: "Skincare",
    difficulty: "Beginner",
    duration_minutes: 10,
    image_url: "https://images.unsplash.com/photo-1643379855889-850035817d24?w=600&q=80",
    description: "Ancient ritual, modern skin. Gua sha activates the lymphatic system, reduces puffiness, sculpts the face, and brings a natural flush of circulation — all in ten minutes.",
    materials: ["Gua sha tool (rose quartz or bian stone)", "Facial oil (2–3 drops minimum)"],
    steps: [
      "Begin with clean skin and apply facial oil generously. The tool must glide — it must never drag dry skin.",
      "Start at the neck. Using the flat edge, stroke upward and outward: three passes per section.",
      "Move to the jaw: position the curved edge under the chin and stroke out toward the ear along the jawline.",
      "Cheekbones: use long upward strokes from the corner of the mouth to the hairline.",
      "Under-eye area: use the smallest notch very gently, stroking outward from the inner corner. Apply almost no pressure here.",
      "Forehead: stroke upward from brow to hairline, then outward toward the temples.",
      "Finish by gently pressing the flat of the tool along each stroke to encourage final lymphatic drainage.",
    ],
    saves_count: 198,
    is_muse_original: true,
    owned_count: 1,
  },
  "sample-14": {
    id: "sample-14",
    title: "The Blowout Effect",
    category: "Hair",
    difficulty: "Intermediate",
    duration_minutes: 25,
    image_url: "https://images.unsplash.com/photo-1580618672591-eb180b1a973f?w=600&q=80",
    description: "Salon volume at home. The technique relies on tension, heat, and the correct direction of airflow. Once understood, this changes everything.",
    materials: ["Round brush (medium to large barrel)", "Hair dryer with concentrator nozzle", "Heat protectant", "Smoothing serum or blowout cream", "Sectioning clips"],
    steps: [
      "Apply heat protectant to damp hair throughout. Apply blowout cream or serum from mid-shaft to ends.",
      "Section hair into four parts: two front, two back. Clip all but the bottom section away.",
      "Working the bottom section: take a two-inch subsection, wrap it around the round brush, and direct airflow downward along the hair shaft from root to tip. This seals the cuticle and creates shine.",
      "Rotate the brush under the hair at the root for lift. Hold the dryer above the root for five seconds, then release.",
      "Continue section by section, working upward. Each subsection takes sixty to ninety seconds of focused drying.",
      "For top sections, direct heat at the root while lifting the brush away from the scalp.",
      "Finish with a blast of cool air to lock each section's shape before releasing.",
    ],
    saves_count: 167,
    is_muse_original: true,
    owned_count: 3,
  },
  "sample-15": {
    id: "sample-15",
    title: "Curl Definition Ritual",
    category: "Hair",
    difficulty: "Beginner",
    duration_minutes: 20,
    image_url: "https://images.unsplash.com/photo-1605980625600-88e30e6c9d38?w=600&q=80",
    description: "Celebrate your natural texture. Moisture, definition, and brilliance — this ritual honours what your hair already is.",
    materials: ["Sulphate-free cleanser", "Deep conditioner", "Leave-in conditioner", "Curl cream or defining gel", "Microfibre towel or cotton t-shirt", "Diffuser attachment"],
    steps: [
      "Wet hair thoroughly. Apply cleanser only to the scalp, massaging gently. Do not pile hair on your head.",
      "Apply deep conditioner from mid-shaft to ends. Finger-comb through each section to detangle.",
      "Leave conditioner in for five minutes, then rinse with cool water.",
      "Do not towel-dry — use a microfibre towel or cotton t-shirt to scrunch out excess water gently.",
      "While hair is dripping wet, apply leave-in conditioner, then curl cream, working section by section.",
      "Apply gel on top for definition if desired, scrunching upward. The wet, crunchy cast is normal and expected.",
      "Diffuse on low heat, cupping curls into the diffuser. Once fully dry, scrunch to release the cast.",
    ],
    saves_count: 234,
    is_muse_original: true,
    owned_count: 4,
  },
  "sample-16": {
    id: "sample-16",
    title: "The Ice Ritual",
    category: "Wellness",
    difficulty: "Beginner",
    duration_minutes: 5,
    image_url: "https://images.unsplash.com/photo-1564512480295-86e479d9b87c?w=600&q=80",
    description: "Cryotherapy for the face. The cold contracts blood vessels, reduces inflammation, tightens pores, and stimulates circulation — leaving skin visibly awake and luminous.",
    materials: ["Ice cubes or ice roller", "Clean cloth or gauze (for ice cubes)", "Facial oil or balm (optional barrier)"],
    steps: [
      "Begin with clean skin. If desired, apply a thin layer of facial oil as a barrier.",
      "Wrap ice cubes in a clean cloth — never apply bare ice directly to the skin.",
      "In gentle circular motions, apply to the forehead, cheeks, jawline, and neck. Spend no more than thirty seconds per area.",
      "Focus on any areas of puffiness — typically under the eyes, along the jawline, and at the temples.",
      "Finish with a full sweep down the neck to encourage lymphatic drainage downward.",
      "Pat skin dry and apply your morning serum immediately while pores are contracted.",
    ],
    saves_count: 389,
    is_muse_original: true,
    owned_count: 1,
  },
  "sample-17": {
    id: "sample-17",
    title: "Body Oil Ceremony",
    category: "Wellness",
    difficulty: "Beginner",
    duration_minutes: 12,
    image_url: "https://images.unsplash.com/photo-1556760544-74068565f05c?w=600&q=80",
    description: "Anoint your skin as an act of devotion. The body oil ceremony is not skincare — it is attention. Slow, deliberate contact with your own body as a form of care.",
    materials: ["Dry body oil (marula, rosehip, or jojoba)", "Warm towel (optional)"],
    steps: [
      "Apply body oil immediately after showering, while skin is still damp. The water droplets help distribute the oil and enhance absorption.",
      "Begin at the feet. Work upward using long strokes toward the heart — this supports lymphatic flow.",
      "Spend extra time on the knees, elbows, and any areas of dry skin, using circular motions.",
      "For the abdomen, use slow clockwise circles. For the chest and décolleté, use upward strokes.",
      "Do not rush. The ceremony should take at minimum eight minutes. Speed defeats the purpose.",
      "Finish with the shoulders and neck, sweeping upward and outward.",
    ],
    saves_count: 156,
    is_muse_original: true,
    owned_count: 2,
  },
};

export default function TutorialDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);
  const [adored, setAdored] = useState(false);
  const [collected, setCollected] = useState(false);
  const [passedAlong, setPassedAlong] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [copiedSteps, setCopiedSteps] = useState(false);
  const [copiedMaterials, setCopiedMaterials] = useState(false);
  const [gotLook, setGotLook] = useState(false);
  const [addingToVanity, setAddingToVanity] = useState(false);
  const [note, setNote] = useState("");
  const [noteSaved, setNoteSaved] = useState(false);
  const [checkedMaterials, setCheckedMaterials] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitting, setReviewSubmitting] = useState(false);

  useEffect(() => {
    if (SAMPLE_TUTORIALS[id]) {
      setTutorial(SAMPLE_TUTORIALS[id]);
      setLoading(false);
    } else {
      base44.entities.Tutorial.get(id)
        .then((t) => { setTutorial(t); setLoading(false); })
        .catch(() => setLoading(false));
    }
    base44.auth.me().then((u) => {
      const map = u?.tutorial_progress || {};
      setProgressMap(map);
      setCompletedSteps(Array.isArray(map[id]) ? map[id] : []);
      // Load saved note
      const notesMap = u?.tutorial_notes || {};
      setNote(notesMap[id] || "");
      // Load collected (favorites) status
      const collectedIds = Array.isArray(u?.collected_tutorials) ? u.collected_tutorials : [];
      setCollected(collectedIds.includes(id));
      // Load adored status
      const adoredIds = Array.isArray(u?.adored_tutorials) ? u.adored_tutorials : [];
      setAdored(adoredIds.includes(id));
    }).catch(() => {});
    // Load reviews
    base44.entities.Review.filter({ post_id: id })
      .then((r) => setReviews(r || []))
      .catch(() => {});
  }, [id]);

  // Save note to user profile (on blur)
  const handleNoteSave = async () => {
    if (!note) return;
    try {
      const u = await base44.auth.me();
      const notesMap = u?.tutorial_notes || {};
      if (notesMap[id] === note) return; // no change
      notesMap[id] = note;
      await base44.auth.updateMe({ tutorial_notes: notesMap });
      setNoteSaved(true);
      setTimeout(() => setNoteSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save note:", err);
    }
  };

  // Toggle collected (favorites) status — persists to user profile
  const toggleCollected = async () => {
    const newState = !collected;
    setCollected(newState);
    try {
      const u = await base44.auth.me();
      const collectedIds = Array.isArray(u?.collected_tutorials) ? u.collected_tutorials : [];
      const updated = newState
        ? [...new Set([...collectedIds, id])]
        : collectedIds.filter((tid) => tid !== id);
      await base44.auth.updateMe({ collected_tutorials: updated });
    } catch (err) {
      console.error("Failed to update favorites:", err);
      setCollected(!newState); // revert on error
    }
  };

  // Toggle adored (heart) status — persists to user profile
  const toggleAdore = async () => {
    const newState = !adored;
    setAdored(newState);
    try {
      const u = await base44.auth.me();
      const adoredIds = Array.isArray(u?.adored_tutorials) ? u.adored_tutorials : [];
      const updated = newState
        ? [...new Set([...adoredIds, id])]
        : adoredIds.filter((tid) => tid !== id);
      await base44.auth.updateMe({ adored_tutorials: updated });
    } catch (err) {
      console.error("Failed to update adored:", err);
      setAdored(!newState); // revert on error
    }
  };

  // Pass Along — native share with clipboard fallback
  const handlePassAlong = async () => {
    const shareData = {
      title: tutorial?.title || "La Muse Tutorial",
      text: tutorial?.description ? tutorial.description.slice(0, 120) + "…" : "A ritual from La Muse.",
      url: window.location.href,
    };
    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        setPassedAlong(true);
        setTimeout(() => setPassedAlong(false), 2000);
      }
    } catch {
      // user cancelled share — no-op
    }
  };

  // Submit a whisper/review
  const handleSubmitReview = async () => {
    const trimmed = reviewText.trim();
    if (!trimmed) return;
    setReviewSubmitting(true);
    try {
      const u = await base44.auth.me();
      const review = await base44.entities.Review.create({
        post_id: id,
        review_text: trimmed,
        author_name: u?.full_name || "Anonymous",
      });
      setReviews((prev) => [review, ...prev]);
      setReviewText("");
    } catch (err) {
      console.error("Failed to post whisper:", err);
    } finally {
      setReviewSubmitting(false);
    }
  };

  const handleCopySteps = () => {
    const text = tutorial.steps?.map((s, i) => `${i + 1}. ${s}`).join("\n") || "";
    navigator.clipboard.writeText(text);
    setCopiedSteps(true);
    setTimeout(() => setCopiedSteps(false), 2000);
  };

  const handleCopyMaterials = () => {
    const text = tutorial.materials?.join("\n") || "";
    navigator.clipboard.writeText(text);
    setCopiedMaterials(true);
    setTimeout(() => setCopiedMaterials(false), 2000);
  };

  const handleGetTheLook = async () => {
    if (materials.length === 0) return;
    setAddingToVanity(true);
    try {
      const categoryMap = {
        Makeup: "Makeup",
        Skincare: "Skincare",
        Hair: "Haircare",
        Wellness: "Body",
      };
      const productCategory = categoryMap[tutorial.category] || "Makeup";
      const products = materials.map((m) => ({
        name: m,
        brand: "To Source",
        category: productCategory,
        in_vanity: true,
      }));
      await base44.entities.Product.bulkCreate(products);
      setGotLook(true);
      setTimeout(() => setGotLook(false), 2500);
    } catch (err) {
      console.error(err);
    } finally {
      setAddingToVanity(false);
    }
  };

  const toggleMaterial = (m) =>
    setCheckedMaterials((prev) =>
      prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]
    );

  const toggleStep = (i) => {
    setCompletedSteps((prev) => {
      const next = prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i];
      const updatedMap = { ...progressMap, [id]: next };
      setProgressMap(updatedMap);
      base44.auth.updateMe({ tutorial_progress: updatedMap }).catch(() => {});
      return next;
    });
  };

  if (loading) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center">
      <div className="swan-float"><SwanLogo size={64} /></div>
    </div>
  );

  if (!tutorial) return (
    <div className="min-h-screen bg-[var(--color-bg)] flex items-center justify-center px-8 text-center">
      <div>
        <SwanLogo size={48} className="mx-auto mb-4" />
        <p className="font-serif text-[var(--color-text-primary)] text-lg">Tutorial not found</p>
      </div>
    </div>
  );

  const steps = Array.isArray(tutorial.steps) ? tutorial.steps : [];
  const materials = Array.isArray(tutorial.materials) ? tutorial.materials : [];

  return (
    <div className="min-h-screen bg-[var(--color-bg)]">
      {/* Full-width tutorial image */}
      <div className="relative w-full h-[420px]">
        <img
          src={tutorial.image_url}
          alt={tutorial.title}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-[var(--color-bg)]" />

        {/* Back button */}
        <button
          onClick={() => navigate(-1)}
          className="absolute top-14 left-5 w-10 h-10 rounded-full bg-[var(--color-bg)]/80 backdrop-blur-sm flex items-center justify-center shadow-sm"
        >
          <ArrowLeft size={16} color="var(--color-text-primary)" />
        </button>

        {/* Adore button */}
        <button
          onClick={toggleAdore}
          className={`absolute top-14 right-5 w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all ${
            adored ? "bg-[#C8B06A]/90" : "bg-[var(--color-bg)]/80"
          }`}
        >
          <Heart
            size={16}
            color={adored ? "white" : "var(--color-text-primary)"}
            fill={adored ? "white" : "none"}
            strokeWidth={1.5}
          />
        </button>

        {/* Adore label */}
        {adored && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="absolute top-[100px] right-5"
          >
            <span className="text-[8px] tracking-[0.22em] text-[var(--color-accent-gold)] uppercase font-light">
              Adored
            </span>
          </motion.div>
        )}
      </div>

      <div className="max-w-md mx-auto px-6 -mt-10 pb-28 space-y-8">
        {/* Editorial Header */}
        <div className="relative">
          <div className="flex items-center gap-2.5 mb-4 flex-wrap">
            <span className="px-3 py-1 bg-[#043927] text-[#FDF5E6] text-[8px] tracking-[0.24em] uppercase rounded-full font-light">
              {tutorial.category}
            </span>
            {tutorial.difficulty && (
              <span className="px-3 py-1 border border-[#C8B06A]/50 text-[var(--color-text-primary)] text-[8px] tracking-[0.24em] uppercase rounded-full font-light">
                {tutorial.difficulty}
              </span>
            )}
            {tutorial.is_muse_original && (
              <span className="px-3 py-1 bg-[#C8B06A] text-white text-[8px] tracking-[0.24em] uppercase rounded-full font-light">
                Muse Original
              </span>
            )}
            {tutorial.duration_minutes && (
              <span className="text-[10px] text-primary-45 font-light tracking-[0.1em] uppercase">
                {tutorial.duration_minutes} min
              </span>
            )}
          </div>
          <h1 className="font-serif text-[30px] text-[var(--color-text-primary)] font-light leading-[1.2] tracking-[0.02em] mb-2">
            {tutorial.title}
          </h1>
          {(tutorial.creator_source || tutorial.is_muse_original) && (
            <p className="text-[11px] text-primary-50 font-light tracking-[0.08em] italic mb-3">
              by {tutorial.creator_source || "The Muse"}{tutorial.creator_platform ? ` · ${tutorial.creator_platform}` : ""}
            </p>
          )}
          <div className="flex items-center gap-3">
            <div className="w-8 h-px bg-[#C8B06A]" />
            <p className="text-[10px] text-primary-40 font-light tracking-[0.16em] uppercase">
              {tutorial.saves_count || 0} saves
            </p>
          </div>
        </div>

        {/* Action bar */}
        <div className="space-y-3">
          <button
            onClick={() => setCompleted((v) => !v)}
            className={`w-full py-3.5 rounded-full text-[10px] tracking-[0.2em] uppercase font-light border transition-all ${
              completed
                ? "bg-[#043927] text-[#FDF5E6] border-[#043927]"
                : "border-[var(--color-border)] text-[var(--color-text-primary)]"
            }`}
          >
            {completed ? "Completed ✓" : "Mark Complete"}
          </button>

          {/* Engagement row: Collect · Pass Along */}
          <div className="flex gap-3">
            <button
              onClick={toggleCollected}
              className={`flex-1 py-3 rounded-full text-[10px] tracking-[0.2em] uppercase font-light border transition-all flex items-center justify-center gap-2 ${
                collected
                  ? "bg-[#C8B06A] text-white border-[#C8B06A]"
                  : "border-[var(--color-border)] text-[var(--color-text-primary)]"
              }`}
            >
              <Bookmark size={13} strokeWidth={1.5} fill={collected ? "white" : "none"} />
              {collected ? "Collected" : "Collect"}
            </button>

            <button
              onClick={handlePassAlong}
              className={`flex-1 py-3 rounded-full text-[10px] tracking-[0.2em] uppercase font-light border transition-all flex items-center justify-center gap-2 ${
                passedAlong
                  ? "bg-[#C8B06A] text-white border-[#C8B06A]"
                  : "border-[var(--color-border)] text-[var(--color-text-primary)]"
              }`}
            >
              <Share2 size={13} strokeWidth={1.5} />
              {passedAlong ? "Copied" : "Pass Along"}
            </button>
          </div>
        </div>

        {/* Description — editorial pull quote style */}
        <div className="border-l-2 border-[#C8B06A] pl-5 py-1">
          <p className="font-serif text-[17px] text-[var(--color-text-primary)]/75 leading-[1.6] font-light italic">
            {tutorial.description}
          </p>
        </div>

        {/* Materials */}
        {materials.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-serif text-[20px] text-[var(--color-text-primary)] font-light tracking-wide">
                Materials
              </h2>
              <button onClick={handleCopyMaterials} className="flex items-center gap-1.5">
                {copiedMaterials
                  ? <Check size={11} color="var(--color-text-primary)" />
                  : <Copy size={11} color="var(--color-text-primary)" />}
                <span className="text-[9px] text-primary-45 font-light tracking-[0.1em] uppercase">
                  {copiedMaterials ? "Copied" : "Copy"}
                </span>
              </button>
            </div>

            {/* Vanity cross-reference */}
            {tutorial.owned_count > 0 && (
              <p className="text-[10px] text-[var(--color-accent-gold)] font-light mb-5 tracking-[0.08em] italic">
                You may already own {tutorial.owned_count} of these in La Vanity
              </p>
            )}

            <div className="space-y-3">
              {materials.map((m, i) => (
                <button
                  key={i}
                  onClick={() => toggleMaterial(m)}
                  className="flex items-center gap-3 w-full text-left"
                >
                  <div
                    className={`w-4 h-4 rounded-sm border flex-shrink-0 transition-all flex items-center justify-center ${
                      checkedMaterials.includes(m)
                        ? "bg-[#043927] border-[#043927]"
                        : "border-[#C8B06A]/50"
                    }`}
                  >
                    {checkedMaterials.includes(m) && (
                      <Check size={9} color="#FDF5E6" />
                    )}
                  </div>
                  <span
                    className={`text-[14px] font-light transition-all ${
                      checkedMaterials.includes(m)
                        ? "text-primary-30 line-through"
                        : "text-[var(--color-text-primary)]/75"
                    }`}
                  >
                    {m}
                  </span>
                </button>
              ))}
            </div>

            {/* Get the Look CTA */}
            <div className="mt-6 pt-5 border-t border-[#C8B06A]/25">
              <button
                onClick={handleGetTheLook}
                disabled={addingToVanity || gotLook}
                className={`w-full py-3 rounded-full text-[9px] tracking-[0.24em] uppercase font-light border transition-all flex items-center justify-center gap-2 ${
                  gotLook
                    ? "bg-[#043927] text-[#FDF5E6] border-[#043927]"
                    : "border-[var(--color-border)] text-[var(--color-text-primary)] hover:bg-[var(--color-bg-elevated)]"
                } ${addingToVanity ? "opacity-60" : ""}`}
              >
                {addingToVanity ? (
                  <><span className="w-3 h-3 border border-[var(--color-text-primary)] border-t-transparent rounded-full animate-spin" /> Adding to La Vanity...</>
                ) : gotLook ? (
                  <><Check size={11} strokeWidth={1.5} /> Added to La Vanity</>
                ) : (
                  <><ShoppingBag size={11} strokeWidth={1.5} /> Get the Look — Add All to La Vanity</>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Steps */}
        {steps.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-serif text-[20px] text-[var(--color-text-primary)] font-light tracking-wide">
                The Ritual
              </h2>
              <button onClick={handleCopySteps} className="flex items-center gap-1.5">
                {copiedSteps
                  ? <Check size={11} color="var(--color-text-primary)" />
                  : <Copy size={11} color="var(--color-text-primary)" />}
                <span className="text-[9px] text-primary-45 font-light tracking-[0.1em] uppercase">
                  {copiedSteps ? "Copied" : "Copy"}
                </span>
              </button>
            </div>

            {/* Progress tracker */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-primary-55 font-light tracking-wide">
                  {completedSteps.length} of {steps.length} complete
                </p>
                <p className="text-[10px] text-[var(--color-accent-gold)] font-light tracking-[0.1em]">
                  {Math.round((completedSteps.length / steps.length) * 100)}%
                </p>
              </div>
              <div className="h-1 rounded-full bg-[#C8B06A]/20 overflow-hidden">
                <div
                  className="h-full rounded-full bg-[#043927] transition-all duration-500"
                  style={{ width: `${(completedSteps.length / steps.length) * 100}%` }}
                />
              </div>
              {completedSteps.length === steps.length && steps.length > 0 && (
                <p className="text-[11px] text-primary-50 font-light italic mt-3 font-serif">
                  Ritual complete — beautifully done.
                </p>
              )}
            </div>

            <div className="space-y-5">
              {steps.map((step, i) => {
                const done = completedSteps.includes(i);
                return (
                  <button
                    key={i}
                    onClick={() => toggleStep(i)}
                    className="flex gap-4 w-full text-left items-start"
                  >
                    <div
                      className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-all ${
                        done ? "bg-[#043927] border-[#043927]" : "border border-[var(--color-border)]"
                      }`}
                    >
                      {done ? (
                        <Check size={11} color="#FDF5E6" strokeWidth={2} />
                      ) : (
                        <span className="text-[10px] text-[var(--color-text-primary)] font-light">{i + 1}</span>
                      )}
                    </div>
                    <p
                      className={`text-[14px] leading-[1.7] font-light flex-1 transition-all ${
                        done ? "text-primary-35 line-through" : "text-primary-70"
                      }`}
                    >
                      {step}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Mentioned in */}
        {(tutorial.creator_source || tutorial.is_muse_original) && (
          <div>
            <h2 className="font-serif text-[20px] text-[var(--color-text-primary)] font-light tracking-wide mb-4">
              Mentioned in
            </h2>
            {tutorial.is_muse_original ? (
              <div className="flex items-center gap-3">
                <SwanLogo size={28} />
                <span className="font-serif text-[15px] text-[var(--color-text-primary)] font-light italic">
                  The Muse Original
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-3 bg-[var(--color-bg-elevated)] rounded-xl p-4">
                <div className="w-10 h-10 rounded-lg bg-[var(--color-bg-elevated)] flex items-center justify-center flex-shrink-0">
                  <span className="text-[10px] text-primary-55 font-light">
                    {tutorial.creator_platform?.[0] || "?"}
                  </span>
                </div>
                <div>
                  <p className="text-[14px] text-[var(--color-text-primary)] font-light">{tutorial.creator_source}</p>
                  <p className="text-[10px] text-primary-40 font-light tracking-wide">
                    {tutorial.creator_platform}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Add a Note */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-serif text-[20px] text-[var(--color-text-primary)] font-light tracking-wide">
              Add a Note
            </h2>
            {noteSaved && (
              <span className="text-[9px] text-[var(--color-accent-gold)] tracking-[0.1em] uppercase font-light">
                Saved ✓
              </span>
            )}
          </div>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={handleNoteSave}
            placeholder="Your private notes on this look..."
            className="w-full bg-transparent text-[14px] text-[var(--color-text-primary)]/75 font-light resize-none outline-none placeholder:text-primary-25 leading-[1.7] border-b border-[#C8B06A]/20 pb-3 focus:border-[#C8B06A]/50 transition-colors"
            rows={3}
          />
        </div>

        {/* Whispers & Reviews */}
        <div>
          <h2 className="font-serif text-[20px] text-[var(--color-text-primary)] font-light tracking-wide mb-4">
            Whispers &amp; Reviews
          </h2>
          <div className="flex items-center gap-3 border border-[#C8B06A]/40 rounded-full px-5 py-3">
            <input
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSubmitReview()}
              placeholder="Add a whisper..."
              className="flex-1 bg-transparent text-[14px] text-[var(--color-text-primary)] font-light outline-none placeholder:text-primary-25"
            />
            <button
              onClick={handleSubmitReview}
              disabled={reviewSubmitting || !reviewText.trim()}
              className="text-[var(--color-accent-gold)] text-[16px] font-light disabled:opacity-30"
            >
              →
            </button>
          </div>
          {reviews.length > 0 ? (
            <div className="mt-5 space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="border-l-2 border-[#C8B06A]/30 pl-4">
                  <p className="text-[14px] text-[var(--color-text-primary)]/80 font-light leading-[1.6] italic">
                    "{r.review_text}"
                  </p>
                  <p className="text-[10px] text-primary-40 font-light tracking-wide mt-2">
                    — {r.author_name}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <p className="font-serif text-[11px] text-primary-30 text-center mt-5 italic font-light">
              Be the first to whisper
            </p>
          )}
        </div>
      </div>
    </div>
  );
}