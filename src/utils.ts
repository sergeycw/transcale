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