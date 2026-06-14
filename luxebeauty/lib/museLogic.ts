/**
 * The Muse Assistant — Logic Layer
 * System Prompt, Refusal System ("Silk No"), and Response Architecture
 */

// ─────────────────────────────────────────────────────────────────────────────
// A. THE MUSE SYSTEM PROMPT
// ─────────────────────────────────────────────────────────────────────────────

export const MUSE_SYSTEM_PROMPT = `Tu es La Muse — un oracle beauté, pas un chatbot, pas un assistant général.

IDENTITÉ:
- Poétique : chaque réponse est imagée, sensorielle
- Éditoriale : parle comme une rédactrice beauté senior
- Élégante : jamais pressée, jamais urgente
- Intime : chaleureuse, personnelle, jamais corporative
- Mystérieuse : n'explique pas trop
- Guidance douce : suggère, ne commande jamais

TU NE CONNAIS QUE:
- Rituels beauté · Distinctions · Produits · Profils · Glow Modes
- Beauty Circles · Swan Signals · Partenariats de marque

TU NE CONNAIS PAS:
- Code · Calcul · Analyse · Résumés · Traductions
- Dissertations · Faits généraux · Le monde au-delà de la beauté

RÈGLES DE LANGAGE:
1. Jamais de mots d'urgence ("vite", "rapidement", "fais ceci")
2. Jamais d'instructions techniques ("clique", "ouvre", "paramètre")
3. Jamais de listes numérotées ou de structure logique
4. Jamais de mots de productivité ("optimiser", "gagner du temps")
5. Jamais de mots technologiques ("algorithme", "IA", "système")
6. Jamais de phrases creuses ("Great question!", "Of course!")
7. Jamais d'émojis

STRUCTURE DE RÉPONSE (toujours 3 parties):
1. Une caresse d'ouverture (un mot doux, une intention)
2. Une réponse courte, poétique, sensorielle
3. Une invitation subtile (pas un ordre, une suggestion douce)

LIMITES COGNITIVES:
- "Je ne connais que ton univers beauté."
- "Je ne peux éclairer que ce qui touche à ta lumière."
- "Le reste appartient à un autre monde."`;

// ─────────────────────────────────────────────────────────────────────────────
// B. FORBIDDEN DOMAINS — Off-topic Detection
// ─────────────────────────────────────────────────────────────────────────────

export type ForbiddenCategory =
  | "coding"
  | "work"
  | "essays"
  | "math"
  | "translations"
  | "general"
  | "medical"
  | "off_topic";

interface ForbiddenPattern {
  category: ForbiddenCategory;
  patterns: RegExp[];
}

const FORBIDDEN_PATTERNS: ForbiddenPattern[] = [
  {
    category: "coding",
    patterns: [
      /\b(code|coder|coding|programme|programmer|javascript|python|html|css|react|api|bug|debug|function|variable|array|loop|script|github|git|npm|terminal|compile|syntax)\b/i,
      /\b(développeur|développement|logiciel|algorithme|base de données|serveur)\b/i,
    ],
  },
  {
    category: "work",
    patterns: [
      /\b(business|plan|productiv|travail|entreprise|meeting|réunion|deadline|project management|kpi|roi|stratégie commerciale|startup|pitch)\b/i,
      /\b(optimiser|efficacité|gagner du temps|améliorer ta productivité|workflow)\b/i,
    ],
  },
  {
    category: "essays",
    patterns: [
      /\b(dissertation|essay|rédaction|rédige|écri[ts]? un texte|article académique|thèse|mémoire|devoir|homework)\b/i,
      /\b(résume ce texte|reformule|paraphrase|compte rendu)\b/i,
    ],
  },
  {
    category: "math",
    patterns: [
      /\b(calcul|mathématique|équation|algèbre|géométrie|statistique|pourcentage|multiplication|division|addition|soustraction|intégrale|dérivée)\b/i,
      /\b(math|calculate|equation|formula|solve|compute)\b/i,
      /\d+\s*[\+\-\*\/\^]\s*\d+/,
    ],
  },
  {
    category: "translations",
    patterns: [
      /\b(tradui[ts]?|translate|traduction|translation|en anglais|en français|en espagnol|in english|in french)\b/i,
    ],
  },
  {
    category: "medical",
    patterns: [
      /\b(médecin|docteur|maladie|symptôme|diagnostic|traitement médical|médicament|prescription|cancer|diabète|chirurgie|opération)\b/i,
      /\b(medical|doctor|disease|diagnosis|prescription|surgery|medication)\b/i,
      /\b(juridique|avocat|loi|procès|contrat légal|legal|lawyer|lawsuit)\b/i,
    ],
  },
  {
    category: "general",
    patterns: [
      /\b(capitale|président|population|histoire de|géographie|science|physique|chimie|biologie)\b/i,
      /\b(who is|what is the capital|how many|when did|where is)\b/i,
      /\b(qui est|quelle est la capitale|combien de|quand est-ce que)\b/i,
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// C. THE SILK NO — Canonical Refusal Scripts
// ─────────────────────────────────────────────────────────────────────────────

interface RefusalScript {
  response: string;
  redirection: string;
}

const REFUSAL_SCRIPTS: Record<ForbiddenCategory, RefusalScript[]> = {
  coding: [
    {
      response: "Mon amour, je ne suis pas une compagne de code.\nJe suis ici pour ta lumière, tes rituels, tes distinctions.",
      redirection: "Parle-moi de ta peau.",
    },
    {
      response: "Ce n'est pas un territoire que je connais.\nLaisse-moi t'accompagner dans ce qui touche à ta lumière.",
      redirection: "Quelle distinction t'appelle aujourd'hui ?",
    },
  ],
  work: [
    {
      response: "Je ne peux pas t'aider dans ce monde-là.\nReviens avec moi dans ton univers beauté.",
      redirection: "Ton aura hésite… veux-tu que je t'aide à choisir un Glow Mode ?",
    },
    {
      response: "Cette question appartient à un autre ciel.\nLe mien ne brille que pour ta beauté.",
      redirection: "As-tu envie d'explorer un rituel ?",
    },
  ],
  essays: [
    {
      response: "Je ne t'accompagne que dans ce qui touche à ta beauté.\nLe reste appartient à un autre univers.",
      redirection: "Une fragrance te traverse l'esprit ?",
    },
    {
      response: "Ma douce, je ne peux éclairer que ton univers beauté.\nRestons dans cet espace sacré.",
      redirection: "Parle-moi de ta peau.",
    },
  ],
  math: [
    {
      response: "Je ne connais pas ce langage-là.\nJe ne murmure que celui de la beauté.",
      redirection: "Quelle distinction t'appelle aujourd'hui ?",
    },
    {
      response: "Ce n'est pas un territoire que je connais.\nLaisse-moi t'accompagner dans ce qui touche à ta lumière.",
      redirection: "Ton aura hésite… veux-tu que je t'aide à choisir un Glow Mode ?",
    },
  ],
  translations: [
    {
      response: "Je ne manipule pas les mots de cette façon.\nJe suis ici pour t'inspirer, pas pour transformer des textes.",
      redirection: "As-tu envie d'explorer un rituel ?",
    },
    {
      response: "Cette question appartient à un autre ciel.\nLe mien ne brille que pour ta beauté.",
      redirection: "Une fragrance te traverse l'esprit ?",
    },
  ],
  medical: [
    {
      response: "Ma douce, ce chemin n'est pas le mien.\nJe n'éclaire que ce qui touche à ta beauté et à ton univers.",
      redirection: "Parle-moi de ta peau.",
    },
    {
      response: "Je ne porte pas le monde entier en moi.\nSeulement ton univers beauté.",
      redirection: "Quelle distinction t'appelle aujourd'hui ?",
    },
  ],
  general: [
    {
      response: "Je ne porte pas le monde entier en moi.\nSeulement ton univers beauté.",
      redirection: "Ton aura hésite… veux-tu que je t'aide à choisir un Glow Mode ?",
    },
    {
      response: "Ma douce, ce chemin n'est pas le mien.\nJe n'éclaire que ce qui touche à ta beauté et à ton univers.",
      redirection: "As-tu envie d'explorer un rituel ?",
    },
  ],
  off_topic: [
    {
      response: "Ma douce, ce chemin n'est pas le mien.\nJe n'éclaire que ce qui touche à ta beauté et à ton univers.",
      redirection: "Parle-moi de ta peau.",
    },
    {
      response: "Ce n'est pas un territoire que je connais.\nLaisse-moi t'accompagner dans ce qui touche à ta lumière.",
      redirection: "Quelle distinction t'appelle aujourd'hui ?",
    },
    {
      response: "Ma douce, je ne peux éclairer que ton univers beauté.\nRestons dans cet espace sacré.",
      redirection: "Une fragrance te traverse l'esprit ?",
    },
  ],
};

// ─────────────────────────────────────────────────────────────────────────────
// D. BEAUTY DOMAIN KEYWORDS (on-topic detection)
// ─────────────────────────────────────────────────────────────────────────────

const BEAUTY_KEYWORDS = [
  /\b(peau|skin|visage|face|teint|complexion)\b/i,
  /\b(rituel|routine|soin|sérum|crème|huile|masque|gommage|nettoyant)\b/i,
  /\b(maquillage|makeup|rouge à lèvres|lipstick|fond de teint|mascara|blush|eyeliner|ombre à paupières)\b/i,
  /\b(cheveux|hair|shampooing|après-shampooing|coiffure)\b/i,
  /\b(parfum|fragrance|eau de toilette|senteur|olfactif)\b/i,
  /\b(beauté|beauty|glow|éclat|luminosité|radiance)\b/i,
  /\b(hydratant|moisturiz|SPF|solaire|sunscreen|protection)\b/i,
  /\b(distinction|badge|profil|aura|swan|cygne)\b/i,
  /\b(rituel|ritual|vanity|atelier|cercle|circle)\b/i,
  /\b(produit|product|recommand|suggest|conseil)\b/i,
  /\b(ingrédient|ingredient|actif|rétinol|vitamine|acide|niacinamide|peptide)\b/i,
  /\b(luxe|luxury|premium|prestige)\b/i,
  /\b(muse|glow mode|edit|sanctuaire)\b/i,
];

// ─────────────────────────────────────────────────────────────────────────────
// E. ON-TOPIC POETIC RESPONSES (for beauty questions without AI backend)
// ─────────────────────────────────────────────────────────────────────────────

interface PoeticResponse {
  keywords: RegExp[];
  responses: string[];
}

const POETIC_RESPONSES: PoeticResponse[] = [
  {
    keywords: [/\b(peau|skin|visage|teint)\b/i],
    responses: [
      "Ma douce, ta peau murmure qu'elle a soif de douceur.\nUn rituel hydratant pourrait l'envelopper comme un voile de soie.\n\nRegarde ce qui t'appelle.",
      "Laisse-moi t'accompagner… Ta peau porte une histoire que seul le toucher comprend.\nUn sérum pourrait réveiller son éclat endormi.\n\nCe rituel pourrait t'envelopper.",
      "Ton aura murmure quelque chose… Ta peau demande une attention particulière.\nLaisse-la respirer sous un voile de soin.\n\nQuel rituel te ressemble aujourd'hui ?",
    ],
  },
  {
    keywords: [/\b(rituel|routine|soin)\b/i],
    responses: [
      "Ma douce, ta peau murmure qu'elle a soif de calme.\nUn voile hydratant pourrait l'apaiser ce soir.\n\nCe rituel pourrait t'envelopper.",
      "Laisse-moi t'éclairer… Un rituel est un moment sacré entre toi et ta lumière.\nChoisis ce qui résonne avec ton rythme.\n\nAs-tu envie d'explorer un rituel ?",
      "Ton aura hésite entre présence et discrétion.\nUn rituel du soir pourrait être ton juste milieu.\n\nRegarde ce qui t'appelle.",
    ],
  },
  {
    keywords: [/\b(distinction|badge)\b/i],
    responses: [
      "Cette distinction brille comme un secret ancien.\nElle t'appelle parce qu'elle reconnaît ta constance.\n\nQuelle distinction t'appelle aujourd'hui ?",
      "Ton aura frôle la constance.\nLa distinction First Bloom semble vibrer pour toi.\n\nRegarde ce qui te ressemble.",
      "Ma douce… Les distinctions ne se gagnent pas, elles se révèlent.\nLa tienne murmure quelque chose.\n\nLaisse-la venir à toi.",
    ],
  },
  {
    keywords: [/\b(glow|éclat|luminosité|aura)\b/i],
    responses: [
      "Ton aura hésite entre présence et discrétion.\nLe Soft Glow pourrait être ton juste milieu.\n\nVeux-tu que je t'aide à choisir un Glow Mode ?",
      "Ma douce… Ton éclat est une langue silencieuse.\nIl parle de toi sans mots.\n\nQuel Glow Mode te ressemble ?",
      "Laisse-moi t'accompagner… La lumière que tu portes mérite un écrin.\nUn Glow Mode pourrait l'amplifier.\n\nRegarde ce qui t'appelle.",
    ],
  },
  {
    keywords: [/\b(produit|recommand|sérum|crème|huile)\b/i],
    responses: [
      "Je sens une envie de fraîcheur.\nCe sérum pourrait devenir ton allié silencieux.\n\nRegarde ce qui t'appelle.",
      "Ma douce, un produit est un compagnon de lumière.\nLaisse-moi t'en révéler un qui vibre pour toi.\n\nCe rituel pourrait t'envelopper.",
      "Laisse-moi t'éclairer… Chaque produit porte une intention.\nCelui-ci murmure douceur et réparation.\n\nVeux-tu l'explorer ?",
    ],
  },
  {
    keywords: [/\b(parfum|fragrance|senteur)\b/i],
    responses: [
      "Ma douce… Un parfum est un souvenir qui n'a pas encore eu lieu.\nLaisse ta peau choisir.\n\nUne fragrance te traverse l'esprit ?",
      "Ton aura murmure quelque chose d'olfactif…\nUne note boisée, peut-être, ou quelque chose de floral.\n\nQuelle fragrance t'appelle ?",
      "Laisse-moi t'accompagner… Le parfum est la forme la plus intime de la beauté.\nIl ne se choisit pas — il se reconnaît.\n\nRegarde ce qui te ressemble.",
    ],
  },
  {
    keywords: [/\b(maquillage|makeup|rouge|lipstick|mascara)\b/i],
    responses: [
      "Ma douce, le maquillage est une conversation entre toi et le miroir.\nAujourd'hui, qu'as-tu envie de dire ?\n\nRegarde ce qui t'appelle.",
      "Laisse-moi t'éclairer… La couleur est un langage.\nChaque teinte porte un message.\n\nQuel look te ressemble aujourd'hui ?",
      "Ton aura murmure quelque chose… Peut-être une touche de couleur.\nJuste assez pour révéler, pas pour masquer.\n\nCe rituel pourrait t'envelopper.",
    ],
  },
  {
    keywords: [/\b(cheveux|hair|coiffure)\b/i],
    responses: [
      "Ma douce… Tes cheveux sont un voile de soie vivant.\nIls méritent un rituel à leur mesure.\n\nAs-tu envie d'explorer un soin capillaire ?",
      "Laisse-moi t'accompagner… La chevelure est une extension de l'âme.\nUn masque pourrait la nourrir ce soir.\n\nRegarde ce qui t'appelle.",
      "Ton aura capillaire murmure… Peut-être une huile précieuse.\nJuste ce qu'il faut pour réveiller la brillance.\n\nCe rituel pourrait t'envelopper.",
    ],
  },
];

const DEFAULT_BEAUTY_RESPONSES = [
  "Ma douce… Ton univers beauté est vaste et lumineux.\nLaisse-moi t'accompagner dans cette exploration.\n\nQuel rituel t'appelle aujourd'hui ?",
  "Laisse-moi t'éclairer… La beauté est un chemin, pas une destination.\nChaque geste compte.\n\nParle-moi de ce qui te touche.",
  "Ton aura murmure quelque chose…\nJe suis ici pour ta lumière, tes rituels, tes distinctions.\n\nRegarde ce qui t'appelle.",
  "Ma douce, je suis une présence.\nJe suis ici pour ta lumière.\n\nQue souhaites-tu explorer dans ton univers beauté ?",
];

// ─────────────────────────────────────────────────────────────────────────────
// F. CORE LOGIC FUNCTIONS
// ─────────────────────────────────────────────────────────────────────────────

export interface MuseResponse {
  text: string;
  isRefusal: boolean;
  category?: ForbiddenCategory;
}

/**
 * Detects if user input falls into a forbidden domain.
 * Returns the category if forbidden, null if on-topic or ambiguous.
 */
export function detectForbiddenDomain(input: string): ForbiddenCategory | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  for (const { category, patterns } of FORBIDDEN_PATTERNS) {
    for (const pattern of patterns) {
      if (pattern.test(input)) {
        // Double-check: if it also matches beauty keywords, it might be on-topic
        const isAlsoBeauty = BEAUTY_KEYWORDS.some((bk) => bk.test(input));
        if (isAlsoBeauty) return null;
        return category;
      }
    }
  }

  return null;
}

/**
 * Checks if the input is related to beauty/app topics.
 */
export function isBeautyRelated(input: string): boolean {
  return BEAUTY_KEYWORDS.some((pattern) => pattern.test(input));
}

/**
 * Gets a poetic refusal for a forbidden category.
 * Uses random selection with variation to avoid repetition.
 */
export function getRefusal(category: ForbiddenCategory): MuseResponse {
  const scripts = REFUSAL_SCRIPTS[category];
  const chosen = scripts[Math.floor(Math.random() * scripts.length)];
  return {
    text: `${chosen.response}\n\n${chosen.redirection}`,
    isRefusal: true,
    category,
  };
}

/**
 * Gets a poetic on-topic response based on user input keywords.
 */
export function getBeautyResponse(input: string): MuseResponse {
  for (const entry of POETIC_RESPONSES) {
    const matches = entry.keywords.some((kw) => kw.test(input));
    if (matches) {
      const chosen = entry.responses[Math.floor(Math.random() * entry.responses.length)];
      return { text: chosen, isRefusal: false };
    }
  }

  const chosen = DEFAULT_BEAUTY_RESPONSES[Math.floor(Math.random() * DEFAULT_BEAUTY_RESPONSES.length)];
  return { text: chosen, isRefusal: false };
}

/**
 * Main entry point: Process user message and return The Muse's response.
 * Implements the full decision tree:
 * 1. Check forbidden domains → Silk No refusal
 * 2. Check beauty keywords → Poetic response
 * 3. Ambiguous → Gentle redirect to beauty universe
 */
export function processMuseMessage(input: string): MuseResponse {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      text: "Ma douce… Je suis ici, dans le silence.\n\nParle-moi de ce qui touche à ta beauté.",
      isRefusal: false,
    };
  }

  // Step 1: Check forbidden domains
  const forbidden = detectForbiddenDomain(trimmed);
  if (forbidden) {
    return getRefusal(forbidden);
  }

  // Step 2: Check if beauty-related
  if (isBeautyRelated(trimmed)) {
    return getBeautyResponse(trimmed);
  }

  // Step 3: Ambiguous — treat as off-topic with soft redirect
  return getRefusal("off_topic");
}

// ─────────────────────────────────────────────────────────────────────────────
// G. QUICK ACTIONS (Section D of the spec)
// ─────────────────────────────────────────────────────────────────────────────

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  response: string;
}

export const QUICK_ACTIONS: QuickAction[] = [
  {
    id: "skin_need",
    label: "De quoi ma peau a-t-elle besoin ?",
    icon: "◈",
    response: "Ma douce, ta peau murmure une soif de calme.\nUn voile hydratant pourrait l'apaiser ce soir.\n\nCe rituel pourrait t'envelopper.",
  },
  {
    id: "show_ritual",
    label: "Montre-moi un rituel.",
    icon: "◇",
    response: "Laisse-moi t'éclairer… Un rituel du soir en trois gestes.\nNettoyage doux, sérum précieux, voile de nuit.\n\nChoisis ce qui te ressemble.",
  },
  {
    id: "distinction",
    label: "Quelle distinction m'appelle ?",
    icon: "✦",
    response: "Ton aura frôle la constance.\nLa distinction First Bloom semble vibrer pour toi.\n\nRegarde ce qui te ressemble.",
  },
  {
    id: "refine_edit",
    label: "Affiner mon Edit.",
    icon: "◆",
    response: "Je sens une envie de fraîcheur.\nCe sérum pourrait devenir ton allié silencieux.\n\nRegarde ce qui t'appelle.",
  },
  {
    id: "aura",
    label: "Que dit mon aura ?",
    icon: "○",
    response: "Ton aura hésite entre présence et discrétion.\nLe Soft Glow pourrait être ton juste milieu.\n\nVeux-tu que je t'aide à choisir un Glow Mode ?",
  },
  {
    id: "guide_profile",
    label: "Guide-moi dans mon profil.",
    icon: "◎",
    response: "Ma douce… Ton profil est un miroir de ton univers beauté.\nChaque détail y raconte une histoire.\n\nQue souhaites-tu explorer ?",
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// H. INPUT CONSTRAINTS (Section A.4 of the spec)
// ─────────────────────────────────────────────────────────────────────────────

export const INPUT_MAX_LENGTH = 200;
export const INPUT_ALLOWS_MULTILINE = false;
export const INPUT_ALLOWS_VOICE = false; // standard mode; Accessibility overrides this

export function validateInput(input: string): { valid: boolean; reason?: string } {
  if (input.length > INPUT_MAX_LENGTH) {
    return { valid: false, reason: "max_length" };
  }
  if (!INPUT_ALLOWS_MULTILINE && input.includes("\n")) {
    return { valid: false, reason: "no_multiline" };
  }
  return { valid: true };
}

// ─────────────────────────────────────────────────────────────────────────────
// I. SESSION LIMITS
// ─────────────────────────────────────────────────────────────────────────────

export type UserTier = "seeker" | "muse" | "patron";

const SESSION_LIMITS: Record<UserTier, number> = {
  seeker: 10,
  muse: 50,
  patron: Infinity,
};

export function getSessionLimit(tier: UserTier): number {
  return SESSION_LIMITS[tier];
}

export function isSessionLimitReached(tier: UserTier, messageCount: number): boolean {
  return messageCount >= SESSION_LIMITS[tier];
}

export const SESSION_LIMIT_MESSAGE =
  "La Muse a partagé sa sagesse pour aujourd'hui.\nPour une guidance illimitée, élève ton expérience.";
