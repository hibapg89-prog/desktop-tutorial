// Brand name normalization — converts scraped social media handles/usernames
// into proper brand display names. Used at scan-time before product creation
// so the `brand` field is always clean (e.g. "YSLBEAUTY" → "YSL Beauty").

// Known brand mappings: lowercase key (no spaces, no @) → proper display name.
// Covers brands confirmed in live scan data plus common luxury beauty brands.
const BRAND_MAP = {
  // Confirmed from live data
  'yslbeauty': 'YSL Beauty',
  'ysl': 'YSL Beauty',
  'lorealparis': "L'Oréal Paris",
  'loreal': "L'Oréal Paris",
  'maybellineuk': 'Maybelline',
  'maybelline': 'Maybelline',
  'marcjacobsbeauty': 'Marc Jacobs Beauty',
  'marcjacobs': 'Marc Jacobs Beauty',
  'pradabeauty': 'Prada Beauty',
  'prada': 'Prada Beauty',
  'armanibeauty': 'Armani Beauty',
  'armani': 'Armani Beauty',
  'kiehlsuki': "Kiehl's",
  'kiehls': "Kiehl's",
  'lancome': 'Lancôme',
  'lancôme': 'Lancôme',
  'kerastase': 'Kérastase',
  'kvdveganbeauty': 'KVD Vegan Beauty',
  'kvd': 'KVD Vegan Beauty',
  // Common luxury beauty brands
  'charlottetilbury': 'Charlotte Tilbury',
  'charlottetilburybeauty': 'Charlotte Tilbury',
  'maccosmetics': 'MAC Cosmetics',
  'mac': 'MAC Cosmetics',
  'narsissist': 'NARS',
  'nars': 'NARS',
  'dior': 'Dior',
  'diorbeauty': 'Dior',
  'chanel': 'Chanel',
  'chanelbeauty': 'Chanel',
  'guccibeauty': 'Gucci Beauty',
  'gucci': 'Gucci Beauty',
  'esteelauder': 'Estée Lauder',
  'tatcha': 'Tatcha',
  'drunkelephant': 'Drunk Elephant',
  'fentybeauty': 'Fenty Beauty',
  'fenty': 'Fenty Beauty',
  'rarebeauty': 'Rare Beauty',
  'glossier': 'Glossier',
  'hourglass': 'Hourglass',
  'hourglasscosmetics': 'Hourglass',
  'anastasiabeverlyhills': 'Anastasia Beverly Hills',
  'anastasia': 'Anastasia Beverly Hills',
  'benefitcosmetics': 'Benefit Cosmetics',
  'benefit': 'Benefit Cosmetics',
  'toofaced': 'Too Faced',
  'urbandecay': 'Urban Decay',
  'clinique': 'Clinique',
  'origins': 'Origins',
  'shiseido': 'Shiseido',
  'lamer': 'La Mer',
  'augustinusbader': 'Augustinus Bader',
  'sulwhasoo': 'Sulwhasoo',
  'laneige': 'Laneige',
  'innisfree': 'Innisfree',
  'cosrx': 'COSRX',
  'theordinary': 'The Ordinary',
  'cerave': 'CeraVe',
  'cetaphil': 'Cetaphil',
  'vichy': 'Vichy',
  'larocheposay': 'La Roche-Posay',
  'bioderma': 'Bioderma',
  'avene': 'Avène',
  'uriage': 'Uriage',
  'nuxe': 'Nuxe',
  'caudalie': 'Caudalie',
  'clarins': 'Clarins',
  'sisley': 'Sisley',
  'sisleyparis': 'Sisley',
  'byredo': 'Byredo',
  'lelabo': 'Le Labo',
  'mugler': 'Mugler',
  'pacorabanne': 'Paco Rabanne',
  'burberrybeauty': 'Burberry Beauty',
  'burberry': 'Burberry',
  'tomford': 'Tom Ford',
  'tomfordbeauty': 'Tom Ford Beauty',
  'hermes': 'Hermès',
  'hermesparfums': 'Hermès',
  'bvlgari': 'Bvlgari',
  'creed': 'Creed',
  'xerjoff': 'Xerjoff',
  'diptyque': 'Diptyque',
  'maisonmargiela': 'Maison Margiela',
  'aesop': 'Aesop',
  'acquadiparma': 'Acqua di Parma',
  'penhaligons': "Penhaligon's",
  'maisonfranciskurkdjian': 'Maison Francis Kurkdjian',
  'franciskurkdjian': 'Maison Francis Kurkdjian',
  'mfk': 'Maison Francis Kurkdjian',
  'parfumsdemarly': 'Parfums de Marly',
  'initio': 'Initio',
  'fredericmalle': 'Frédéric Malle',
  'locitane': "L'Occitane",
  'rituals': 'Rituals',
  'morphe': 'Morphe',
  'morphecosmetics': 'Morphe',
  'sephora': 'Sephora',
  'ultabeauty': 'ULTA Beauty',
  'ulta': 'ULTA Beauty',
};

// Platform suffixes to strip from the end of a handle (after spacing).
// These are country codes or platform-specific suffixes, not part of the
// real brand name. "Beauty" is NOT stripped — it's part of real brand
// names like "Armani Beauty", "Marc Jacobs Beauty".
const PLATFORM_SUFFIXES = [
  'uk', 'usa', 'us', 'fr', 'de', 'it', 'ca', 'au', 'es', 'nl',
  'official', 'officialuk', 'officialus', 'officialusa',
  'parfums', 'cosmetics', 'skincare', 'makeup',
];

/**
 * Normalize a brand name from a scraped social media handle or raw text.
 * 1. Strips @ prefix
 * 2. Checks the known-brand mapping table (case/space-insensitive)
 * 3. Falls back to regex: strip trailing country/platform suffixes, insert
 *    spaces before capitals, title-case the result
 */
export function normalizeBrand(raw) {
  if (!raw) return raw;
  let s = String(raw).trim();
  if (!s) return s;

  // Strip leading @ handles
  s = s.replace(/^@+/, '');

  // Try the mapping table first (case-insensitive, no spaces)
  const mapKey = s.toLowerCase().replace(/[\s_\-]+/g, '');
  if (BRAND_MAP[mapKey]) return BRAND_MAP[mapKey];

  // Regex fallback for unknown brands
  // Insert spaces before capital letters (camelCase → words)
  let spaced = s.replace(/([a-z])([A-Z])/g, '$1 $2');
  // Insert spaces after runs of capitals before a lowercase (e.g. "YSLBeauty" → "YSL Beauty")
  spaced = spaced.replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');

  // Split into words, strip trailing platform suffixes
  let words = spaced.split(/\s+/).filter(Boolean);
  // Strip trailing platform suffixes (country codes, "official", etc.)
  while (words.length > 1) {
    const last = words[words.length - 1].toLowerCase();
    if (PLATFORM_SUFFIXES.includes(last)) {
      words.pop();
    } else {
      break;
    }
  }

  // Title-case each word, preserving all-caps acronyms (2-4 uppercase letters)
  words = words.map(w => {
    if (/^[A-Z]{2,4}$/.test(w)) return w; // keep YSL, MAC, NARS, KVD
    // Capitalize first letter, lowercase rest — but preserve accented chars
    return w.charAt(0).toUpperCase() + w.slice(1).toLowerCase();
  });

  return words.join(' ') || s;
}

/**
 * Normalize a brand name for duplicate comparison — strips @, lowercases,
 * removes spaces and punctuation so "@MaybellineUK" matches "MaybellineUK"
 * matches "Maybelline UK".
 */
export function normalizeBrandForCompare(raw) {
  if (!raw) return '';
  return String(raw)
    .replace(/^@+/, '')
    .toLowerCase()
    .replace(/[\s_\-']+|uk|usa|us|fr|de|it|ca|au|official/g, '')
    .trim();
}
