import hljs from 'highlight.js';
import type MarkdownIt from 'markdown-it';
import { formatParser } from './formatLanguages';

interface Options { settingValue?: (key: string) => unknown }
interface Context { pluginId?: string; contentScriptId?: string }
const specialLanguages = new Set(['mermaid', 'math', 'katex', 'abc', 'plantuml', 'drawio', 'graphviz', 'dot', 'nomnoml', 'markmap']);
const detectLanguages = ['javascript', 'typescript', 'python', 'bash', 'json', 'css', 'xml', 'yaml', 'sql', 'cpp', 'csharp', 'powershell', 'rust', 'go', 'java', 'php', 'ruby', 'ini', 'diff', 'dockerfile'];
const labels: Record<string, string> = {
  js: 'JavaScript', javascript: 'JavaScript', jsx: 'JSX', ts: 'TypeScript', typescript: 'TypeScript', tsx: 'TSX',
  py: 'Python', python: 'Python', sh: 'Shell', shell: 'Shell', bash: 'Bash', zsh: 'Shell',
  html: 'HTML', xml: 'XML', css: 'CSS', scss: 'SCSS', json: 'JSON', jsonc: 'JSON',
  yaml: 'YAML', yml: 'YAML', sql: 'SQL', cpp: 'C++', c: 'C', cs: 'C#', csharp: 'C#',
  md: 'Markdown', markdown: 'Markdown', powershell: 'PowerShell', ps1: 'PowerShell',
  text: 'Plain text', txt: 'Plain text', plaintext: 'Plain text', '': 'Plain text',
  go: 'Go', golang: 'Go', java: 'Java', cc: 'C++', cxx: 'C++', 'c++': 'C++', 'c#': 'C#',
  objc: 'Objective-C', objectivec: 'Objective-C', 'objective-c': 'Objective-C',
  proto: 'Protobuf', protobuf: 'Protobuf', toml: 'TOML', php: 'PHP', graphql: 'GraphQL', gql: 'GraphQL',
  postgresql: 'PostgreSQL', postgres: 'PostgreSQL', pgsql: 'PostgreSQL', mysql: 'MySQL', mariadb: 'MariaDB',
  sqlite: 'SQLite', tsql: 'T-SQL', transactsql: 'T-SQL', bigquery: 'BigQuery',
  vue: 'Vue', angular: 'Angular', shellscript: 'Shell', svg: 'SVG', xhtml: 'XHTML', less: 'Less',
};
const aliases: Record<string, string> = {
  zsh: 'bash', jsonc: 'json', json5: 'json', tsx: 'typescript', ps1: 'powershell',
  shellscript: 'bash', cc: 'cpp', cxx: 'cpp', 'c++': 'cpp', 'c#': 'csharp',
  objectivec: 'objectivec', 'objective-c': 'objectivec', gql: 'graphql', proto: 'protobuf',
  postgresql: 'sql', postgres: 'sql', pgsql: 'sql', mysql: 'sql', mariadb: 'sql',
  sqlite: 'sql', tsql: 'sql', transactsql: 'sql', bigquery: 'sql', vue: 'xml', angular: 'xml', svg: 'xml', xhtml: 'xml',
};

export function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

// Keep multi-line tokens (comments, strings, etc.) balanced inside each visual row.
export function splitHighlightedLines(html: string): string[] {
  const active: string[] = [];
  const lines: string[] = [];
  let line = '';
  for (const part of html.split(/(<span\b[^>]*>|<\/span>|\n)/g)) {
    if (part === '\n') {
      lines.push(line + '</span>'.repeat(active.length));
      line = active.join('');
    } else {
      line += part;
      if (part.startsWith('<span')) active.push(part);
      else if (part === '</span>') active.pop();
    }
  }
  lines.push(line + '</span>'.repeat(active.length));
  return lines;
}

export function highlightCode(code: string, language: string, detect: boolean): { html: string; language: string; detected: boolean } {
  const mapped = aliases[language] || language;
  if (['text', 'txt', 'plaintext', 'none', 'nohighlight'].includes(mapped)) {
    return { html: escapeHtml(code), language: 'text', detected: false };
  }
  try {
    if (mapped && hljs.getLanguage(mapped)) {
      return { html: hljs.highlight(code, { language: mapped, ignoreIllegals: true }).value, language, detected: false };
    }
    if (!mapped && detect && code.length <= 50000) {
      const result = hljs.highlightAuto(code, detectLanguages);
      if (result.language && result.relevance >= 3) {
        return { html: result.value, language: result.language, detected: true };
      }
    }
  } catch { /* Unknown or unsupported syntax stays readable plain text. */ }
  return { html: escapeHtml(code), language, detected: false };
}

const copyIcon = '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><rect x="7" y="6" width="9" height="11" rx="2"/><path d="M12 6V4a1 1 0 0 0-1-1H5a2 2 0 0 0-2 2v8a1 1 0 0 0 1 1h3"/></svg>';
const wrapIcon = '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="M3 5h14M3 10h11a3 3 0 0 1 0 6h-3m2-2-2 2 2 2M3 15h4"/></svg>';
const formatIcon = '<svg viewBox="0 0 20 20" width="14" height="14" aria-hidden="true"><path d="m6 5-4 5 4 5m8-10 4 5-4 5M11.5 3l-3 14"/></svg>';

export default function codeStudio(context: Context) {
  return {
    plugin: (md: MarkdownIt, pluginOptions: Options = {}) => {
      const originalFence = md.renderer.rules.fence!;
      const originalInline = md.renderer.rules.code_inline!;
      const setting = <T>(key: string, fallback: T): T => {
        try { const value = pluginOptions.settingValue?.(key); return value === undefined || value === null ? fallback : value as T; }
        catch { return fallback; }
      };
      md.renderer.rules.code_inline = (tokens, idx, options, env, self) => {
        const result = originalInline(tokens, idx, options, env, self);
        return setting('inlineStyle', true) ? result.replace('<code', '<code class="cs-inline"') : result;
      };
      md.renderer.rules.fence = (tokens, idx, options, env, self) => {
        const token = tokens[idx];
        const language = token.info.trim().split(/\s+/)[0].toLowerCase();
        if (specialLanguages.has(language)) return originalFence(tokens, idx, options, env, self);
        // Remove only Markdown's final line separator for display, never for copying.
        const visibleCode = token.content.replace(/\n$/, '');
        const highlighted = highlightCode(visibleCode, language, setting('autoDetect', true));
        const rows = splitHighlightedLines(highlighted.html);
        const filename = token.info.match(/\btitle=(?:"([^"]*)"|'([^']*)')/);
        const title = filename ? filename[1] ?? filename[2] : '';
        const displayLanguage = labels[highlighted.language] || highlighted.language || 'Plain text';
        const fontSize = Math.min(24, Math.max(10, Number(setting('fontSize', 14)) || 14));
        const wrap = setting('wrapLines', false);
        const numbered = setting('lineNumbers', true);
        const sourceOpen = `${token.markup}${token.info}\n`;
        const fenceIndex = tokens.slice(0, idx).filter(t => t.type === 'fence').length;
        const formatButton = formatParser(language) ? `<button type="button" class="cs-button cs-format-button" data-cs-action="format" aria-label="Format code" title="Preview code formatting">${formatIcon}<span>Format</span></button>` : '';
        // No user code or filename enters an event handler. The hidden source is
        // also Joplin's documented round-trip metadata for the Rich Text editor.
        return `<div class="joplin-editable cs-card${wrap ? ' cs-wrap' : ''}${numbered ? '' : ' cs-no-numbers'}" data-cs-id="${escapeHtml(context.contentScriptId || 'codeStudioRenderer')}" data-cs-language="${escapeHtml(language)}" data-cs-info="${escapeHtml(token.info)}" data-cs-fence-index="${fenceIndex}" style="--cs-font-size:${fontSize}px;--cs-gutter:${Math.max(2, String(rows.length).length)}ch">
<pre class="joplin-source" data-joplin-language="${escapeHtml(language)}" data-joplin-source-open="${escapeHtml(sourceOpen)}" data-joplin-source-close="${escapeHtml(token.markup)}">${escapeHtml(token.content)}</pre>
<div class="cs-toolbar" contenteditable="false"><div class="cs-caption"><span class="cs-language"${highlighted.detected ? ' title="Detected language — specify one in the code fence for accuracy"' : ''}>${escapeHtml(displayLanguage)}${highlighted.detected ? '<span class="cs-auto">auto</span>' : ''}</span>${title ? `<span class="cs-filename">${escapeHtml(title)}</span>` : ''}</div><div class="cs-actions">${formatButton}<button type="button" class="cs-button cs-wrap-button" data-cs-action="wrap" aria-label="Wrap long lines" aria-pressed="${wrap}" title="Wrap long lines">${wrapIcon}<span>Wrap</span></button><button type="button" class="cs-button cs-copy-button" data-cs-action="copy" aria-label="Copy code" title="Copy code without line numbers">${copyIcon}<span>Copy</span></button></div>
<span class="cs-status" role="status" aria-live="polite"></span></div>
<pre class="cs-code" tabindex="0" aria-label="${escapeHtml(displayLanguage)} code"><code>${rows.map((row, i) => `<span class="cs-line" data-line="${i + 1}"><span class="cs-line-text">${row}</span></span>`).join('\n')}</code></pre>
</div>\n`;
      };
    },
    assets: () => [
      { name: 'code-studio.css' }, { name: 'viewer.js' },
      { name: 'jetbrains-mono.woff2', mime: 'font/woff2' },
    ],
  };
}
