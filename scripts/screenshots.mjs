import assert from 'node:assert/strict';
import { readFile, mkdir } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import MarkdownIt from 'markdown-it';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const renderer = require('../dist/renderer.js').default;
const { formatPreview } = require('../dist/formatPreview.js');
const { formatCode, setFormatterAssetLoader } = require('../dist/formatCode.js');
setFormatterAssetLoader(name => readFileSync(`dist/${name}`));
const font = (await readFile('dist/jetbrains-mono.woff2')).toString('base64');
const fontCss = `@font-face { font-family: "Code Block Studio Mono"; src: url(data:font/woff2;base64,${font}) format("woff2"); font-weight:400; }`;
const cardCss = await readFile('dist/code-studio.css', 'utf8');
const md = new MarkdownIt();
renderer({ contentScriptId: 'codeStudioRenderer' }).plugin(md);
await mkdir('docs/images', { recursive: true });
const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, deviceScaleFactor: 1 });
  // A publication screenshot must not need a remote font or any other network resource.
  await page.route('**/*', route => route.abort());
  const setContent = async (html, css) => {
    await page.setContent(`<!doctype html><meta charset="utf-8">${html}`);
    await page.addStyleTag({ content: css + fontCss });
    await page.evaluate(() => document.fonts.ready);
  };
  const examples = '```python title="summary.py"\ndef summarise(items):\n    total = sum(items)\n    return {"count": len(items), "total": total}\n\nprint(summarise([10, 20, 30]))\n```\n\n'
    + '```sql title="recent-notes.sql"\nSELECT title, updated_time\nFROM notes\nWHERE is_conflict = 0\nORDER BY updated_time DESC\nLIMIT 10;\n```\n\n'
    + '```bash title="hello.sh"\n# Indentation and quotes are preserved when copying.\nprintf \'%s\\n\' "Hello from Code Block Studio"\n```';
  const noteCss = 'body { margin:0; padding:20px 28px; background:#f5f6f8; } .cs-card { margin:14px 0; }';
  await setContent(`<main>${md.render(examples)}</main>`, noteCss + cardCss);
  assert.equal(await page.getByRole('button', { name: 'Format code' }).count(), 3);
  assert.equal(await page.locator('.joplin-source').first().textContent(), 'def summarise(items):\n    total = sum(items)\n    return {"count": len(items), "total": total}\n\nprint(summarise([10, 20, 30]))\n');
  await page.locator('main').screenshot({ path: 'docs/images/code-cards.png' });

  const original = '# Build a compact report\ndef make_report(name,items):\n  total=sum(items)\n  result={"name":name,"total":total,"items":items}\n  return result\n\n# Keep the output readable\nfor name in ["Ada","Joplin"]:\n  report=make_report(name,[10,20,30])\n  print(report)\n\n' + Array.from({ length: 30 }, (_, i) => `value_${i}=${i}`).join('\n') + '\n';
  const formatted = await formatCode(original, 'python');
  const dialogCss = await readFile('dist/formatDialog.css', 'utf8');
  await page.setViewportSize({ width: 1280, height: 760 });
  await setContent(`<div id="joplin-plugin-content">${formatPreview(original, formatted, 'python')}</div>`, ':root { --joplin-color:#e4e9f1; --joplin-font-family:system-ui; } body { background:#20242d; }' + dialogCss);
  await page.addScriptTag({ path: 'dist/formatDialog.js' });
  assert.ok(await page.locator('.cs-diff-space').count() > 0);
  assert.ok(await page.locator('.cs-diff-gap').count() > 0);
  await page.screenshot({ path: 'docs/images/format-comparison.png' });

  const longCode = 'const message = "Code Block Studio keeps long code lines readable in your notes, while preserving the original indentation, source text and line numbers when you copy the code.";\nconsole.log(message);\n';
  await page.setViewportSize({ width: 1000, height: 500 });
  await setContent(md.render('```javascript title="long-line.js"\n' + longCode + '```'), noteCss + cardCss);
  await page.addScriptTag({ path: 'dist/viewer.js' });
  await page.getByRole('button', { name: 'Wrap long lines' }).click();
  assert.equal(await page.getByRole('button', { name: 'Wrap long lines' }).getAttribute('aria-pressed'), 'true');
  assert.equal(await page.locator('.joplin-source').textContent(), longCode);
  assert.equal(await page.locator('.cs-line').count(), 2);
  assert.ok(await page.locator('.cs-code').evaluate(code => code.scrollWidth <= code.clientWidth + 1));
  await page.locator('.cs-card').screenshot({ path: 'docs/images/wrapped-code.png' });

  const svg = await readFile('assets/icon.svg', 'utf8');
  for (const size of [48, 128]) {
    await page.setViewportSize({ width: size, height: size });
    await page.setContent(`<style>html,body{margin:0;background:transparent}svg{display:block;width:100vw;height:100vh}</style>${svg}`);
    await page.screenshot({ path: `assets/icon-${size}.png`, omitBackground: true });
  }
  console.log('Created three component screenshots and 48/128px icons from local plugin assets.');
} finally { await browser.close(); }
