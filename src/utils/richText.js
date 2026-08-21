// Parse text into segments: plain text, #hashtags, @mentions
export function parseSegments(text) {
  if (!text) return [];
  return text
    .split(/(#\w+|@\w+)/g)
    .filter(Boolean)
    .map((part) => {
      if (/^#\w+/.test(part)) return { type: "tag",     value: part.slice(1), raw: part };
      if (/^@\w+/.test(part)) return { type: "mention", value: part.slice(1), raw: part };
      return { type: "text", value: part, raw: part };
    });
}

// Extract unique lowercase tag values from any text string
export function extractTags(text = "") {
  const matches = text.match(/#(\w+)/g) || [];
  return [...new Set(matches.map((t) => t.slice(1).toLowerCase()))];
}