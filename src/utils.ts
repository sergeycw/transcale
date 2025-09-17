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
  if (el.closest('input, textarea, select, button, a')) return true;
  return false;
}

export function toNumber(x: string | number): number | null {
  // replace comma with dot for parsing (EU → JS float)
  const s = String(x).replace(',', '.');
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
