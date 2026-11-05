import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import MarkdownIt from 'markdown-it';
const require = createRequire(import.meta.url);
const { default: renderer, splitHighlightedLines } = require('../dist/renderer.js');

function render(body, settings = {}) {
  const md = new MarkdownIt();
  renderer({ pluginId: 'local.lpowers.code-studio', contentScriptId: 'codeStudioRenderer' }).plugin(md, { settingValue: k => settings[k] });
  return md.render(body);
}

test('line numbers count actual code lines and preserve the original source', () => {
  const body = '```python\nprint("hello")\n\n  # indent\n```';
  const html = render(body);
  assert.equal((html.match(/class="cs-line"/g) || []).length, 3);
  assert.match(html, /class="joplin-source"/);
  assert.match(html, /data-joplin-source-open="```python\n"/);
  assert.match(html, /data-joplin-source-close="```"/);
  assert.match(html, /hljs-string/);
  assert.match(html, /data-cs-id="codeStudioRenderer"/);
});

test('multiline comments retain balanced spans on every line', () => {
  const rows = splitHighlightedLines('<span class="hljs-comment">/* first\nsecond */</span>\nlast');
  assert.deepEqual(rows, [
    '<span class="hljs-comment">/* first</span>',
    '<span class="hljs-comment">second */</span>', 'last',
  ]);
});

test('unknown language and malicious-looking code stay escaped', () => {
  const html = render('```unknown title="<img src=x onerror=alert(1)>"\n<script>alert("x")</script>\n```');
  assert.ok(!html.includes('<script>'));
  assert.ok(!html.includes('<img'));
  assert.match(html, /&lt;script&gt;/);
  assert.match(html, /&lt;img/);
  assert.ok(!html.includes('onclick='));
});

test('empty blocks, longer fences, whitespace and Unicode are retained', () => {
  assert.equal((render('```\n```').match(/class="cs-line"/g) || []).length, 1);
  const html = render('````text\n```\n\tλ 👋 <>&\n\n````');
  assert.match(html, /data-joplin-source-close="````"/);
  assert.match(html, /\tλ 👋 &lt;&gt;&amp;\n\n<\/pre>/);
  assert.equal((html.match(/class="cs-line"/g) || []).length, 3);
});

test('settings apply and malformed font size cannot inject HTML', () => {
  const html = render('```js\nconst a = 1;\n```', { lineNumbers: false, wrapLines: true, fontSize: '\" onmouseover=alert(1)', inlineStyle: false });
  assert.match(html, /cs-wrap cs-no-numbers/);
  assert.match(html, /--cs-font-size:14px/);
  assert.ok(!html.includes('onmouseover'));
  assert.equal(render('`short`', { inlineStyle: false }).trim(), '<p><code>short</code></p>');
});

test('diagram fences remain under Joplin and other plugins control', () => {
  const html = render('```mermaid\ngraph TD; A-->B;\n```');
  assert.ok(!html.includes('cs-card'));
  assert.match(html, /language-mermaid/);
});

test('explicit text never receives guessed highlighting', () => {
  const html = render('```text\nconst value = "plain";\n```');
  assert.ok(!html.includes('hljs-keyword'));
  assert.match(html, /Plain text/);
});

test('Format is offered only for explicit supported languages with a precise block reference', () => {
  const html = render('```fish\necho hello\n```\n\n```js title="sample.js"\nconst a=1;\n```');
  assert.equal((html.match(/data-cs-action="format"/g) || []).length, 1);
  assert.match(html, /data-cs-fence-index="1"/);
  assert.match(html, /data-cs-info="js title=&quot;sample.js&quot;"/);
  assert.ok(!render('```\nconst a = 1;\n```').includes('data-cs-action="format"'));
});
