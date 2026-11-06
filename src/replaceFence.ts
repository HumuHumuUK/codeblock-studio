import MarkdownIt from 'markdown-it';
import { FormatTarget, safeFence } from './formatLanguages';

const md = new MarkdownIt();
// Work against the editor's current document, never an earlier saved snapshot.
export function replaceFence(body: string, target: FormatTarget, formatted: string, info = target.info): { from: number; to: number; insert: string } {
  const fences = md.parse(body, {}).filter(t => t.type === 'fence');
  const token = fences[target.fenceIndex];
  if (!token?.map || token.content !== target.text || token.info !== target.info) {
    throw new Error('This code block has changed. Try its toolbar control again.');
  }
  const lines = body.match(/[^\n]*\n|[^\n]+$/g) || [];
  const [start, end] = token.map;
  const opening = lines[start].replace(/\r?\n$/, '');
  const fenceAt = opening.indexOf(token.markup);
  if (fenceAt < 0) throw new Error('Could not locate the code fence.');
  const from = lines.slice(0, start).join('').length;
  if (formatted === target.text) {
    // A display choice changes only the opening line, preserving every source byte.
    const to = from + opening.length;
    const insert = opening.slice(0, fenceAt) + token.markup + info;
    const check = md.parse(body.slice(0, from) + insert + body.slice(to), {}).filter(t => t.type === 'fence')[target.fenceIndex];
    if (!check || check.content !== target.text || check.info !== info) throw new Error('Could not preserve this code block.');
    return { from, to, insert };
  }
  const closing = lines[end - 1].replace(/\r?\n$/, '');
  const marker = token.markup[0];
  const closeMatch = closing.match(marker === '`' ? /^(.*?)`{3,}([ \t]*)$/ : /^(.*?)~{3,}([ \t]*)$/);
  if (end - start < 2 || !closeMatch) throw new Error('Close the code block with backticks before applying formatting.');
  let prefix = closeMatch[1];
  const oldContent = token.content.split('\n');
  for (let i = 0; i < oldContent.length && start + 1 + i < end - 1; i++) {
    const contentLine = oldContent[i];
    const raw = lines[start + 1 + i].replace(/\r?\n$/, '');
    if (contentLine && raw.endsWith(contentLine)) {
      prefix = raw.slice(0, raw.length - contentLine.length);
      break;
    }
  }
  const markup = safeFence(token.markup, formatted);
  const eol = lines[start].endsWith('\r\n') ? '\r\n' : '\n';
  const content = formatted.replace(/\n$/, '').split('\n').map(line => prefix + line).join(eol);
  const insert = opening.slice(0, fenceAt) + markup + info + eol
    + (formatted ? content + eol : '') + closeMatch[1] + markup + closeMatch[2]
    + (lines[end - 1].endsWith('\n') ? eol : '');
  const to = lines.slice(0, end).join('').length;
  const check = md.parse(body.slice(0, from) + insert + body.slice(to), {}).filter(t => t.type === 'fence')[target.fenceIndex];
  if (!check || check.content !== formatted || check.info !== info) {
    throw new Error('This block uses indentation that could not be preserved. Use Copy formatted instead.');
  }
  return { from, to, insert };
}
