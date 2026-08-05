// Badge families and the 20 Distinctions of Le Sanctuaire

export const BADGE_FAMILIES = [
  {
    key: "foundations",
    label: "Foundations",
    subtitle: "Where every journey begins",
    shape: "oval",
    earnedBg: "#FAF6EF",
    unearnedBg: "#0B3C26",
    earnedIcon: "#C8B06A",
    unearnedIcon: "#3D6B4F",
    earnedBorder: "#C8B06A",
    unearnedBorder: "#1D5438",
  },
  {
    key: "self_connection",
    label: "Self-Connection",
    subtitle: "The art of knowing yourself",
    shape: "circle",
    earnedBg: "#FAF6EF",
    unearnedBg: "#0B3C26",
    earnedIcon: "#C8B06A",
    unearnedIcon: "#3D6B4F",
    earnedBorder: "#C8B06A",
    unearnedBorder: "#1D5438",
  },
  {
    key: "rituals",
    label: "Rituals",
    subtitle: "Devotion made visible",
    shape: "shield",
    earnedBg: "#0B3C26",
    unearnedBg: "#0B3C26",
    earnedIcon: "#C8B06A",
    unearnedIcon: "#3D6B4F",
    earnedBorder: "#C8B06A",
    unearnedBorder: "#1D5438",
  },
  {
    key: "experience",
    label: "Experience",
    subtitle: "Discovery, journey, exploration",
    shape: "hexagon",
    earnedBg: "#0B3C26",
    unearnedBg: "#0B3C26",
    earnedIcon: "#C8B06A",
    unearnedIcon: "#3D6B4F",
    earnedBorder: "#C8B06A",
    unearnedBorder: "#1D5438",
  },
  {
    key: "influence",
    label: "Influence",
    subtitle: "Excellence that moves others",
    shape: "medallion",
    earnedBg: "#0B3C26",
    unearnedBg: "#0B3C26",
    earnedIcon: "#C8B06A",
    unearnedIcon: "#3D6B4F",
    earnedBorder: "#C8B06A",
    unearnedBorder: "#1D5438",
  },
];

export const BADGES = [
  // ── FOUNDATIONS (oval) ──────────────────────────────────────────────────
  {
    key: "day_one",
    family: "foundations",
    label: "Day One",
    subtitle: "Welcome to your sanctuary",
    howToEarn: "Awarded upon joining LuxeBeauty",
    earn: () => true,
    icon: "butterfly",
    progress: null,
  },
  {
    key: "first_bloom",
    family: "foundations",
    label: "First Bloom",
    subtitle: "Your first post in the community",
    howToEarn: "Share your first post in Le Cercle",
    earn: (d) => d.postCount >= 1,
    icon: "lotus",
    progress: (d) => ({ current: d.postCount, target: 1, label: "post" }),
  },
  {
    key: "first_drop",
    family: "foundations",
    label: "First Drop",
    subtitle: "Your first product review",
    howToEarn: "Write your first product review",
    earn: (d) => d.reviewCount >= 1,
    icon: "drop",
    progress: (d) => ({ current: d.reviewCount, target: 1, label: "review" }),
  },
  {
    key: "the_awakening",
    family: "foundations",
    label: "The Awakening",
    subtitle: "Your beauty story begins",
    howToEarn: "Complete your profile",
    earn: (d) => d.profileComplete,
    icon: "sunrise",
    progress: null,
  },

  // ── SELF-CONNECTION (circle) ─────────────────────────────────────────────
  {
    key: "self_love",
    family: "self_connection",
    label: "Self Love",
    subtitle: "Devoted to your ritual",
    howToEarn: "Share 5 posts about your beauty rituals",
    earn: (d) => d.postCount >= 5,
    icon: "mirror",
    progress: (d) => ({ current: d.postCount, target: 5, label: "posts" }),
  },
  {
    key: "inner_radiance",
    family: "self_connection",
    label: "Inner Radiance",
    subtitle: "Your light inspires others",
    howToEarn: "Reach 10 community posts",
    earn: (d) => d.postCount >= 10,
    icon: "sunburst",
    progress: (d) => ({ current: d.postCount, target: 10, label: "posts" }),
  },
  {
    key: "shade_whisperer",
    family: "self_connection",
    label: "Shade Whisperer",
    subtitle: "A connoisseur of colour",
    howToEarn: "Share 5 shade swatch posts",
    earn: (d) => d.swatchCount >= 5,
    icon: "chalice",
    progress: (d) => ({ current: d.swatchCount, target: 5, label: "swatch posts" }),
  },
  {
    key: "natural_path",
    family: "self_connection",
    label: "Natural Path",
    subtitle: "In harmony with nature",
    howToEarn: "Share 10 skincare or clean beauty reviews",
    earn: (d) => d.reviewCount >= 10,
    icon: "botanical",
    progress: (d) => ({ current: d.reviewCount, target: 10, label: "reviews" }),
  },

  // ── RITUALS (shield) ─────────────────────────────────────────────────────
  {
    key: "first_ritual",
    family: "rituals",
    label: "First Ritual",
    subtitle: "Your routine, revealed",
    howToEarn: "Share your first routine post",
    earn: (d) => d.routineCount >= 1,
    icon: "olive",
    progress: (d) => ({ current: d.routineCount, target: 1, label: "routine post" }),
  },
  {
    key: "consistency_club",
    family: "rituals",
    label: "Consistency Club",
    subtitle: "Devotion in every post",
    howToEarn: "Reach 25 community posts",
    earn: (d) => d.postCount >= 25,
    icon: "sprout",
    progress: (d) => ({ current: d.postCount, target: 25, label: "posts" }),
  },
  {
    key: "sacred_flame",
    family: "rituals",
    label: "Sacred Flame",
    subtitle: "A passion that burns bright",
    howToEarn: "Reach 50 community posts",
    earn: (d) => d.postCount >= 50,
    icon: "flame",
    progress: (d) => ({ current: d.postCount, target: 50, label: "posts" }),
  },
  {
    key: "holy_grail_guardian",
    family: "rituals",
    label: "Holy Grail Guardian",
    subtitle: "Keeper of the sacred find",
    howToEarn: "A product you reviewed gains 5 community reviews",
    earn: (d) => d.postCount >= 8,
    icon: "ring",
    progress: (d) => ({ current: d.postCount, target: 8, label: "posts" }),
  },

  // ── EXPERIENCE (hexagon) ─────────────────────────────────────────────────
  {
    key: "beauty_explorer",
    family: "experience",
    label: "Beauty Explorer",
    subtitle: "Ahead of the curve",
    howToEarn: "Be among the first to review a new product",
    earn: (d) => d.reviewCount >= 3,
    icon: "branch",
    progress: (d) => ({ current: d.reviewCount, target: 3, label: "reviews" }),
  },
  {
    key: "care_traveler",
    family: "experience",
    label: "Care Traveler",
    subtitle: "Crossing beauty circles with curiosity",
    howToEarn: "Share reviews across 5 different product categories",
    earn: (d) => d.reviewCount >= 5,
    icon: "leaf",
    progress: (d) => ({ current: d.reviewCount, target: 5, label: "reviews" }),
  },
  {
    key: "journey_journal",
    family: "experience",
    label: "Journey Journal",
    subtitle: "Your beauty story, beautifully told",
    howToEarn: "Share 3 Before & After posts or 5 GRWM posts",
    earn: (d) => d.beforeAfterCount >= 3 || d.grwmCount >= 5,
    icon: "star",
    progress: (d) => {
      const ba = d.beforeAfterCount / 3;
      const gw = d.grwmCount / 5;
      return ba >= gw
        ? { current: d.beforeAfterCount, target: 3, label: "Before & After posts" }
        : { current: d.grwmCount, target: 5, label: "GRWM posts" };
    },
  },
  {
    key: "circle_spark",
    family: "experience",
    label: "Circle Spark",
    subtitle: "A presence felt across every circle",
    howToEarn: "Reach 20 community posts",
    earn: (d) => d.postCount >= 20,
    icon: "lightning",
    progress: (d) => ({ current: d.postCount, target: 20, label: "posts" }),
  },

  // ── INFLUENCE (medallion) ────────────────────────────────────────────────
  {
    key: "most_adored",
    family: "influence",
    label: "Most Adored",
    subtitle: "Loved by many",
    howToEarn: "Receive 100 Adore reactions across your posts",
    earn: (d) => d.totalAdores >= 100,
    icon: "crown",
    progress: null,
  },
  {
    key: "eternal_bloom",
    family: "influence",
    label: "Eternal Bloom",
    subtitle: "A legacy of beauty shared",
    howToEarn: "Reach 100 community posts",
    earn: (d) => d.postCount >= 100,
    icon: "crown_ornate",
    progress: (d) => ({ current: d.postCount, target: 100, label: "posts" }),
  },
  {
    key: "la_reference",
    family: "influence",
    label: "La Référence",
    subtitle: "A standard of excellence",
    howToEarn: "Earn 16 of the 20 distinctions",
    earn: (d) => d.earnedCount >= 16,
    icon: "fleur",
    progress: (d) => ({ current: d.earnedCount, target: 16, label: "distinctions" }),
  },
  {
    key: "la_muse",
    family: "influence",
    label: "La Muse",
    subtitle: "The Muse herself",
    howToEarn: "Earn all other distinctions",
    earn: (d) => d.earnedCount >= 19,
    icon: "medallion",
    progress: (d) => ({ current: d.earnedCount, target: 19, label: "distinctions" }),
  },
];

export const BADGE_MAP = Object.fromEntries(BADGES.map((b) => [b.key, b]));
export const FAMILY_MAP = Object.fromEntries(BADGE_FAMILIES.map((f) => [f.key, f]));

export function computeEarned(posts = [], existingKeys = new Set()) {
  const data = {
    postCount: posts.length,
    reviewCount: posts.filter((p) => !p.post_type || p.post_type === "review").length,
    swatchCount: posts.filter((p) => p.post_type === "swatch").length,
    beforeAfterCount: posts.filter((p) => p.post_type === "before_after").length,
    routineCount: posts.filter((p) => p.post_type === "routine").length,
    grwmCount: posts.filter((p) => p.post_type === "grwm").length,
    profileComplete: true,
    totalAdores: 0,
    earnedCount: existingKeys.size,
  };

  const newlyEarned = [];
  BADGES.forEach((badge) => {
    if (!existingKeys.has(badge.key) && badge.earn(data)) {
      newlyEarned.push(badge.key);
      data.earnedCount += 1;
    }
  });

  return newlyEarned;
}

// Returns the single closest-to-earning unearned badge, or null if none is
// within 20% of its threshold. Used to drive the feed progress nudge.
export function computeNudge(posts = [], earnedKeys = new Set()) {
  const data = {
    postCount: posts.length,
    reviewCount: posts.filter((p) => !p.post_type || p.post_type === "review").length,
    swatchCount: posts.filter((p) => p.post_type === "swatch").length,
    beforeAfterCount: posts.filter((p) => p.post_type === "before_after").length,
    routineCount: posts.filter((p) => p.post_type === "routine").length,
    grwmCount: posts.filter((p) => p.post_type === "grwm").length,
    totalAdores: 0,
    earnedCount: earnedKeys.size,
  };

  let best = null;
  let bestPct = 0;

  BADGES.forEach((badge) => {
    if (earnedKeys.has(badge.key)) return;
    if (!badge.progress) return;
    const prog = badge.progress(data);
    if (!prog) return;
    const pct = prog.target > 0 ? prog.current / prog.target : 0;
    if (pct >= 1) return;
    if (pct < 0.2) return;
    if (pct > bestPct) {
      bestPct = pct;
      best = { badge, current: prog.current, target: prog.target, label: prog.label, pct };
    }
  });

  return best;
}
