// Approximate fixed conversion rates from USD — good enough for display, no live API needed
const CURRENCY_MAP = {
  "it":    { code: "EUR", symbol: "€",   rate: 0.92   },
  "fr":    { code: "EUR", symbol: "€",   rate: 0.92   },
  "de":    { code: "EUR", symbol: "€",   rate: 0.92   },
  "es":    { code: "EUR", symbol: "€",   rate: 0.92   },
  "pt":    { code: "EUR", symbol: "€",   rate: 0.92   },
  "nl":    { code: "EUR", symbol: "€",   rate: 0.92   },
  "el":    { code: "EUR", symbol: "€",   rate: 0.92   },
  "fi":    { code: "EUR", symbol: "€",   rate: 0.92   },
  "en-gb": { code: "GBP", symbol: "£",   rate: 0.79   },
  "en-au": { code: "AUD", symbol: "A$",  rate: 1.53   },
  "en-ca": { code: "CAD", symbol: "C$",  rate: 1.36   },
  "en-nz": { code: "NZD", symbol: "NZ$", rate: 1.64   },
  "en-sg": { code: "SGD", symbol: "S$",  rate: 1.34   },
  "en-hk": { code: "HKD", symbol: "HK$", rate: 7.82  },
  "en-in": { code: "INR", symbol: "₹",   rate: 83.5   },
  "en-za": { code: "ZAR", symbol: "R",   rate: 18.7   },
  "ja":    { code: "JPY", symbol: "¥",   rate: 149    },
  "zh":    { code: "CNY", symbol: "¥",   rate: 7.24   },
  "ko":    { code: "KRW", symbol: "₩",   rate: 1340   },
  "ar":    { code: "AED", symbol: "د.إ", rate: 3.67   },
  "hi":    { code: "INR", symbol: "₹",   rate: 83.5   },
  "ru":    { code: "RUB", symbol: "₽",   rate: 88     },
  "tr":    { code: "TRY", symbol: "₺",   rate: 32     },
  "sv":    { code: "SEK", symbol: "kr",  rate: 10.4   },
  "nb":    { code: "NOK", symbol: "kr",  rate: 10.7   },
  "da":    { code: "DKK", symbol: "kr",  rate: 6.9    },
  "pl":    { code: "PLN", symbol: "zł",  rate: 3.97   },
  "cs":    { code: "CZK", symbol: "Kč",  rate: 23.2   },
  "hu":    { code: "HUF", symbol: "Ft",  rate: 358    },
  "ro":    { code: "RON", symbol: "lei", rate: 4.58   },
  "he":    { code: "ILS", symbol: "₪",   rate: 3.71   },
  "th":    { code: "THB", symbol: "฿",   rate: 35     },
  "vi":    { code: "VND", symbol: "₫",   rate: 24500  },
  "id":    { code: "IDR", symbol: "Rp",  rate: 15700  },
  "ms":    { code: "MYR", symbol: "RM",  rate: 4.71   },
  "fil":   { code: "PHP", symbol: "₱",   rate: 56     },
  "bn":    { code: "BDT", symbol: "৳",   rate: 110    },
  "uk":    { code: "UAH", symbol: "₴",   rate: 39.5   },
  "en":    { code: "USD", symbol: "$",   rate: 1      }, // fallback
};

const LANGUAGE_NAMES = {
  it: "Italian",   fr: "French",    de: "German",   es: "Spanish",
  pt: "Portuguese",nl: "Dutch",     sv: "Swedish",  nb: "Norwegian",
  da: "Danish",    pl: "Polish",    cs: "Czech",    hu: "Hungarian",
  ro: "Romanian",  ru: "Russian",   uk: "Ukrainian",tr: "Turkish",
  ar: "Arabic",    he: "Hebrew",    hi: "Hindi",    ja: "Japanese",
  zh: "Chinese",   ko: "Korean",    th: "Thai",     vi: "Vietnamese",
  id: "Indonesian",ms: "Malay",     fil: "Filipino",bn: "Bengali",
  el: "Greek",     fi: "Finnish",
};

let _locale = null;

export function getLocale() {
  if (_locale) return _locale;

  const raw  = (navigator.language || "en").toLowerCase();
  const full = raw;                      // e.g. "en-gb", "it-it"
  const prefix = raw.split("-")[0];      // e.g. "en", "it"

  const currency = CURRENCY_MAP[full] || CURRENCY_MAP[prefix] || CURRENCY_MAP["en"];
  const languageName = LANGUAGE_NAMES[prefix] || null;

  _locale = {
    lang: prefix,
    fullLang: full,
    languageName,
    isEnglish: prefix === "en",
    ...currency,
  };
  return _locale;
}

// Returns formatted price string in the user's local currency, or null if amount ≤ 0
export function formatPrice(usdAmount) {
  if (!usdAmount || usdAmount <= 0) return null;
  const { symbol, rate, code } = getLocale();
  const converted = usdAmount * rate;
  const noDecimals = ["JPY", "KRW", "VND", "IDR", "HUF", "BDT"];
  return noDecimals.includes(code)
    ? `${symbol}${Math.round(converted).toLocaleString()}`
    : `${symbol}${converted.toFixed(2)}`;
}

export function getUserLanguageName() {
  return getLocale().languageName;
}

export function isNonEnglish() {
  return !getLocale().isEnglish;
}
