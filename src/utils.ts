// skip "dangerous" containers
export function shouldSkip(node: Node): boolean {
  if (!node || !node.parentElement) return true;
  const el = node.parentElement;
  const tag = el.tagName;
  if (
    ['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'KBD', 'SAMP'].includes(tag)
  )
    return true;
  if (el.isContentEditable) return true;
  if (el.closest('input, textarea, select, button')) return true;
  return false;
}

// Unicode fraction mapping
const fractions: Record<string, number> = {
  '¼': 0.25,
  '½': 0.5,
  '¾': 0.75,
  '⅐': 0.1428,
  '⅑': 0.111,
  '⅒': 0.1,
  '⅓': 0.333,
  '⅔': 0.667,
  '⅕': 0.2,
  '⅖': 0.4,
  '⅗': 0.6,
  '⅘': 0.8,
  '⅙': 0.167,
  '⅚': 0.8333,
  '⅛': 0.125,
  '⅜': 0.375,
  '⅝': 0.625,
  '⅞': 0.875,
};

export function parseFraction(frac: string): number {
  if (fractions[frac] !== undefined) {
    return fractions[frac];
  }

  // Handle numeric fractions like "1/2" or "3/4"
  if (/^\d+\/\d+$/.test(frac)) {
    const [num, den] = frac.split('/').map(Number);
    if (den !== 0) {
      return num / den;
    }
  }

  return 0;
}

export function toNumber(x: string | number): number | null {
  // replace comma with dot for parsing (EU → JS float)
  let s = String(x).replace(',', '.');

  // Handle mixed numbers with fractions (e.g., "1 ½" or "2¾")
  const mixedMatch = s.match(
    /^(\d+(?:\.\d+)?)\s*([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+\/\d+)$/
  );
  if (mixedMatch) {
    const wholeNumber = parseFloat(mixedMatch[1]);
    const fractionPart = parseFraction(mixedMatch[2]);
    return wholeNumber + fractionPart;
  }

  // Handle pure fractions
  const fractionMatch = s.match(/^([¼½¾⅐⅑⅒⅓⅔⅕⅖⅗⅘⅙⅚⅛⅜⅝⅞]|\d+\/\d+)$/);
  if (fractionMatch) {
    return parseFraction(fractionMatch[1]);
  }

  const v = parseFloat(s);
  return Number.isFinite(v) ? v : null;
}

export function hasExistingConversion(text: string, match: string): boolean {
  // check if the match already has a conversion in parentheses after it
  const matchIndex = text.indexOf(match);
  if (matchIndex === -1) return false;

  const afterMatch = text.substring(matchIndex + match.length).trim();
  // look for pattern like " (123 km)" or " (123.45 km/h)" etc.
  return /^\s*\([^)]*(?:km|m|cm|ml|g|°C)\)/.test(afterMatch);
}
