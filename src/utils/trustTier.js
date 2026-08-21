export const TIER_CONFIG = {
  seeker: {
    key:    "seeker",
    label:  "The Seeker",
    color:  "#8A9E8A",
    border: "rgba(138,158,138,0.32)",
    bg:     "rgba(138,158,138,0.07)",
  },
  muse: {
    key:    "muse",
    label:  "The Muse",
    color:  "#C8B06A",
    border: "rgba(200,176,106,0.32)",
    bg:     "rgba(200,176,106,0.08)",
  },
  patron: {
    key:    "patron",
    label:  "The Patron",
    color:  "#043927",
    border: "rgba(4,57,39,0.28)",
    bg:     "rgba(4,57,39,0.07)",
  },
};

/**
 * Derives a trust tier from a member's activity.
 *   Patron : 7+ posts AND 5+ badges
 *   Muse   : 3+ posts OR  3+ badges
 *   Seeker : everyone else
 */
export function computeTier(postCount = 0, badgeCount = 0) {
  if (postCount >= 7 && badgeCount >= 5) return TIER_CONFIG.patron;
  if (postCount >= 3 || badgeCount >= 3)  return TIER_CONFIG.muse;
  return TIER_CONFIG.seeker;
}