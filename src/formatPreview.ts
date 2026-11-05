import { diffArrays, diffChars } from 'diff';
import { escapeHtml } from './renderer';

interface PreviewLine { text: string; number: number; newline: boolean }
interface PreviewRow { original?: PreviewLine; formatted?: PreviewLine }

export function alignPreviewLines(original: string, formatted: string): PreviewRow[] {
  const lines = (text: string): PreviewLine[] => (text.match(/[^\n]*\n|[^\n]+$/g) || []).map((line, i) => ({
    text: line.replace(/\n$/, ''), number: i + 1, newline: line.endsWith('\n'),
  }));
  const before = lines(original), after = lines(formatted);
  // Whitespace is ignored only for alignment; the raw text determines every highlight.
  const a = before.map(line => line.text.replace(/\s/g, '')), b = after.map(line => line.text.replace(/\s/g, ''));
  let start = 0, endA = a.length, endB = b.length;
  while (start < endA && start < endB && a[start] === b[start]) start++;
  while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) { endA--; endB--; }
  const rows: PreviewRow[] = [];
  let i = 0, j = 0;
  const append = (countA: number, countB: number) => {
    for (let n = 0; n < Math.max(countA, countB); n++) {
      rows.push({ original: n < countA ? before[i + n] : undefined, formatted: n < countB ? after[j + n] : undefined });
    }
    i += countA; j += countB;
  };
  append(start, start);
  const uniqueIndices = (keys: string[], end: number) => {
    const indices = new Map<string, number>();
    for (let n = start; n < end; n++) indices.set(keys[n], indices.has(keys[n]) ? -1 : n);
    return indices;
  };
  const uniqueAfter = uniqueIndices(b, endB);
  const anchors: [number, number][] = [];
  let lastAfter = start - 1;
  for (const [key, position] of uniqueIndices(a, endA)) {
    const other = uniqueAfter.get(key);
    if (position >= start && other !== undefined && other > lastAfter) {
      anchors.push([position, other]); lastAfter = other;
    }
  }
  anchors.push([endA, endB]);
  const deadline = Date.now() + 200;
  for (const [nextA, nextB] of anchors) {
    const remaining = deadline - Date.now();
    const changes = remaining > 0 ? diffArrays(a.slice(i, nextA), b.slice(j, nextB), { timeout: remaining, maxEditLength: 4000 }) : undefined;
    if (changes) {
      let removed = 0, added = 0;
      for (const change of changes) {
        if (change.removed) removed += change.count;
        else if (change.added) added += change.count;
        else {
          append(removed, added); removed = 0; added = 0;
          append(change.count, change.count);
        }
      }
      append(removed, added);
    } else {
      // shortcut: dissimilar regions with no unique anchors use positional pairs after the diff budget expires.
      append(nextA - i, nextB - j);
    }
    if (nextA < endA) append(1, 1);
  }
  append(a.length - endA, b.length - endB);
  return rows;
}

function previewText(text: string, changed: boolean): string {
  const escaped = escapeHtml(text).replace(/\r/g, '␍');
  if (!changed) return escaped;
  return `<mark>${escaped.replace(/[ \t]/g, character => character === ' '
    ? '<span class="cs-diff-space" data-glyph="·" title="Space"> </span>'
    : '<span class="cs-diff-tab" data-glyph="→" title="Tab">\t</span>')}</mark>`;
}

export function formatPreview(original: string, formatted: string, language: string): string {
  const rows = alignPreviewLines(original, formatted);
  const panes: Record<'original' | 'formatted', string[]> = { original: [], formatted: [] };
  const deadline = Date.now() + 200;
  for (const row of rows) {
    const before = row.original?.text ?? '', after = row.formatted?.text ?? '';
    const changed = before !== after || row.original?.newline !== row.formatted?.newline;
    const remaining = deadline - Date.now();
    const changes = before !== after && remaining > 0
      ? diffChars(before, after, { timeout: Math.min(20, remaining), maxEditLength: 2000 }) : undefined;
    for (const side of ['original', 'formatted'] as const) {
      const line = row[side], other = row[side === 'original' ? 'formatted' : 'original'];
      if (!line) {
        panes[side].push('<span class="cs-diff-line cs-diff-gap" aria-hidden="true"></span>');
        continue;
      }
      const text = changes ? changes.filter(change => side === 'original' ? !change.added : !change.removed)
        .map(change => previewText(change.value, change.added || change.removed)).join('')
        : previewText(line.text, before !== after);
      const marker = changed ? (side === 'original' ? '−' : '+') : ' ';
      const breakChanged = !other || line.newline !== other.newline;
      const end = changed && breakChanged ? `<span class="cs-diff-eol" title="${line.newline ? 'Line break' : 'No final line break'}" aria-label="${line.newline ? 'Line break' : 'No final line break'}">${line.newline ? '↵' : '∅'}</span>` : '';
      panes[side].push(`<span class="cs-diff-line${changed ? ` cs-diff-${side}` : ''}" data-line="${line.number}"><span class="cs-diff-marker" aria-hidden="${!changed}">${marker}</span><span class="cs-diff-text">${text}</span>${end}</span>`);
    }
  }
  const last = rows[rows.length - 1];
  const gutter = String(Math.max(last?.original?.number ?? 0, last?.formatted?.number ?? 0, 1)).length;
  return `<section class="cs-format-preview" style="--cs-diff-gutter:${Math.max(2, gutter)}ch">
    <h2>Format ${escapeHtml(language)}</h2>
    <p>Review the changes. Apply updates this code block; Copy leaves the note unchanged. You can undo an applied change in the editor.</p>
    <p class="cs-diff-legend">Scroll either pane to move both. Highlights show edited text; <span>· space</span> <span>→ tab</span> <span>↵ line break</span> <span>∅ no final line break</span>. Hatched gaps align matching code.${original.includes('\r') || formatted.includes('\r') ? ' ␍ marks a carriage return.' : ''}</p>
    <div class="cs-format-columns"><section class="cs-format-column"><h3>Original</h3><pre tabindex="0" aria-label="Original code"><code>${panes.original.join('')}</code></pre></section>
    <section class="cs-format-column"><h3>Formatted</h3><pre tabindex="0" aria-label="Formatted code"><code>${panes.formatted.join('')}</code></pre></section></div></section>`;
}
