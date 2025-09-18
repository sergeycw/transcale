import { shouldSkip } from './utils';
import { convertInText } from './converters';

const processed = new WeakSet<Node>();

export function walkAndAnnotate(root: Element): void {
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

export function startObserver(): void {
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
