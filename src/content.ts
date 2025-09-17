// conversion constants
const MI_TO_KM = 1.60934;
const MPH_TO_KMH = 1.60934;
const IN_TO_CM = 2.54;
const FT_TO_M = 0.3048;
const FLOZ_TO_ML = 29.5735;
const OZ_TO_G = 28.3495;

// number formatting by locale
const nf = new Intl.NumberFormat(navigator.language || 'en-US', {
  maximumFractionDigits: 2,
});
const nf1 = new Intl.NumberFormat(navigator.language || 'en-US', {
  maximumFractionDigits: 1,
});

// basic regexes (support ranges 8-10, approximation ~, fractions, °F)
const RE_MILE =
  /\b(~?\s*)?(\d+(?:[.,]\d+)?)(\s*[-–—]\s*(\d+(?:[.,]\d+)?))?\s*(mi|mile|miles)\b/g;
const RE_MPH =
  /\b(~?\s*)?(\d+(?:[.,]\d+)?)(\s*[-–—]\s*(\d+(?:[.,]\d+)?))?\s*(mph)\b/g;
const RE_FT =
  /\b(~?\s*)?(\d+(?:[.,]\d+)?)(\s*[-–—]\s*(\d+(?:[.,]\d+)?))?\s*(ft|feet)\b/g;
const RE_IN = /(\d+(?:[.,]\d+)?)\s*(?:in|″|")\b/g; // simplified; word "in" as preposition is not touched - needs numeric context
const RE_FLOZ =
  /\b(~?\s*)?(\d+(?:[.,]\d+)?)(\s*[-–—]\s*(\d+(?:[.,]\d+)?))?\s*(fl\.?\s*oz\.?|fluid\s+ounce|fluid\s+ounces)\b/g;
const RE_OZ =
  /\b(~?\s*)?(\d+(?:[.,]\d+)?)(\s*[-–—]\s*(\d+(?:[.,]\d+)?))?\s*(oz\.?|ounce|ounces)(?!\s*\.)/g; // avoid fl.oz
const RE_FAH = /\b(-?\d+(?:[.,]\d+)?)\s*°\s*F\b/g;

// skip "dangerous" containers
function shouldSkip(node: Node): boolean {
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

function toNumber(x: string | number): number | null {
  // replace comma with dot for parsing (EU → JS float)
  const s = String(x).replace(',', '.');
  const v = parseFloat(s);
  return Number.isFinite(v) ? v : null;
}

function rangeFormat(from: number, to: number, unitFmt: string): string {
  return `${nf.format(from)}–${nf.format(to)} ${unitFmt}`;
}

function convertInText(str: string): string {
  let out = str;

  // reset global regex indices for safety
  RE_MILE.lastIndex = 0;
  RE_MPH.lastIndex = 0;
  RE_FT.lastIndex = 0;
  RE_IN.lastIndex = 0;
  RE_FLOZ.lastIndex = 0;
  RE_OZ.lastIndex = 0;
  RE_FAH.lastIndex = 0;

  // mi → km
  out = out.replace(RE_MILE, (m, approx, a, dash, b) => {
    const v1 = toNumber(a);
    if (v1 == null) return m;
    if (b != null) {
      const v2 = toNumber(b);
      if (v2 == null) return m;
      const k1 = v1 * MI_TO_KM,
        k2 = v2 * MI_TO_KM;
      return `${m} (${rangeFormat(k1, k2, 'km')})`;
    } else {
      const km = v1 * MI_TO_KM;
      return `${m} (${nf.format(km)} km)`;
    }
  });

  // mph → km/h
  out = out.replace(RE_MPH, (m, approx, a, dash, b) => {
    const v1 = toNumber(a);
    if (v1 == null) return m;
    if (b != null) {
      const v2 = toNumber(b);
      if (v2 == null) return m;
      const k1 = v1 * MPH_TO_KMH,
        k2 = v2 * MPH_TO_KMH;
      return `${m} (${rangeFormat(k1, k2, 'km/h')})`;
    } else {
      const kmh = v1 * MPH_TO_KMH;
      return `${m} (${nf.format(kmh)} km/h)`;
    }
  });

  // ft → m
  out = out.replace(RE_FT, (m, approx, a, dash, b) => {
    const v1 = toNumber(a);
    if (v1 == null) return m;
    if (b != null) {
      const v2 = toNumber(b);
      if (v2 == null) return m;
      const k1 = v1 * FT_TO_M,
        k2 = v2 * FT_TO_M;
      return `${m} (${rangeFormat(k1, k2, 'm')})`;
    } else {
      const meters = v1 * FT_TO_M;
      return `${m} (${nf.format(meters)} m)`;
    }
  });

  // in → cm (simplified)
  out = out.replace(RE_IN, (m, a) => {
    const v = toNumber(a);
    if (v == null) return m;
    const cm = v * IN_TO_CM;
    return `${m} (${nf.format(cm)} cm)`;
    // improvement: recognize 5' 7" and convert directly to cm/m
  });

  // fl oz → ml
  out = out.replace(RE_FLOZ, (m, approx, a, dash, b) => {
    const v1 = toNumber(a);
    if (v1 == null) return m;
    if (b != null) {
      const v2 = toNumber(b);
      if (v2 == null) return m;
      const ml1 = v1 * FLOZ_TO_ML,
        ml2 = v2 * FLOZ_TO_ML;
      return `${m} (${rangeFormat(ml1, ml2, 'ml')})`;
    } else {
      const ml = v1 * FLOZ_TO_ML;
      return `${m} (${nf.format(ml)} ml)`;
    }
  });

  // oz → g (for weight)
  out = out.replace(RE_OZ, (m, approx, a, dash, b) => {
    const v1 = toNumber(a);
    if (v1 == null) return m;
    if (b != null) {
      const v2 = toNumber(b);
      if (v2 == null) return m;
      const g1 = v1 * OZ_TO_G,
        g2 = v2 * OZ_TO_G;
      return `${m} (${rangeFormat(g1, g2, 'g')})`;
    } else {
      const g = v1 * OZ_TO_G;
      return `${m} (${nf.format(g)} g)`;
    }
  });

  // °F → °C
  out = out.replace(RE_FAH, (m, f) => {
    const v = toNumber(f);
    if (v == null) return m;
    const c = ((v - 32) * 5) / 9;
    return `${m} (${nf1.format(c)} °C)`;
  });

  return out;
}

const processed = new WeakSet<Node>();

function walkAndAnnotate(root: Element): void {
  const tw = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node: Node): number {
      if (processed.has(node)) return NodeFilter.FILTER_REJECT;
      if (!node.nodeValue || node.nodeValue.length < 3)
        return NodeFilter.FILTER_REJECT;
      if (shouldSkip(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    },
  });

  const toChange: Array<[Text, string]> = [];
  while (tw.nextNode()) {
    const n = tw.currentNode as Text;
    const before = n.nodeValue || '';
    const after = convertInText(before);
    if (after !== before) toChange.push([n, after]);
  }

  for (const [n, text] of toChange) {
    const span = document.createElement('span');
    span.className = 'uconv';
    span.textContent = text;
    n.parentNode?.replaceChild(span, n);
    processed.add(span.firstChild || span); // mark to avoid reprocessing
  }
}

// initialization and observation
function initExtension(): void {
  if (document.body) {
    walkAndAnnotate(document.body);
    startObserver();
  } else {
    // wait for DOM loading
    document.addEventListener('DOMContentLoaded', () => {
      walkAndAnnotate(document.body);
      startObserver();
    });
  }
}

function startObserver(): void {
  const mo = new MutationObserver((list: MutationRecord[]) => {
    let scheduled = false;
    for (const m of list) {
      if (m.type === 'childList') {
        scheduled = true;
      } else if (m.type === 'characterData') {
        scheduled = true;
      }
    }
    if (!scheduled) return;
    // debounced
    clearTimeout((mo as any)._t);
    (mo as any)._t = setTimeout(() => {
      if (document.body) {
        walkAndAnnotate(document.body);
      }
    }, 150);
  });

  mo.observe(document.body, {
    childList: true,
    characterData: true,
    subtree: true,
  });
}

initExtension();
