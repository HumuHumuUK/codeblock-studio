import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { readFile as readText } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import vm from 'node:vm';
import path from 'node:path';
import { chromium } from 'playwright';
const require = createRequire(import.meta.url);
const { alignPreviewLines, formatPreview } = require('../dist/formatPreview.js');

test('align added, removed and reindented lines with their unchanged context', () => {
  const rows = alignPreviewLines('header\n  keep\nold\nend\n', 'header\n    keep\nnew\nextra\nend\n');
  assert.deepEqual(rows.map(row => [row.original?.text, row.formatted?.text]), [
    ['header', 'header'], ['  keep', '    keep'], ['old', 'new'], [undefined, 'extra'], ['end', 'end'],
  ]);
  const removed = alignPreviewLines('one\nremoved\ntwo\n', 'one\ntwo\n');
  assert.deepEqual(removed[1], { original: { text: 'removed', number: 2, newline: true }, formatted: undefined });
  assert.deepEqual(removed[2], { original: { text: 'two', number: 3, newline: true }, formatted: { text: 'two', number: 2, newline: true } });
  assert.equal(alignPreviewLines('a', 'a\n')[0].original.newline, false);
  assert.equal(alignPreviewLines('a', 'a\n')[0].formatted.newline, true);
});

test('alignment preserves every source line, including duplicates, Unicode and large changes', () => {
  let seed = 42;
  const random = () => (seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0) / 2 ** 32;
  const inputs = ['', '\n', '  same', '}', 'λ 👋', '<script>', '\tindent', 'same\r'];
  for (let run = 0; run < 150; run++) {
    const source = () => Array.from({ length: Math.floor(random() * 25) }, () => inputs[Math.floor(random() * inputs.length)]).join('\n');
    const original = source(), formatted = source();
    const rows = alignPreviewLines(original, formatted);
    for (const [side, text] of [['original', original], ['formatted', formatted]]) {
      const lines = rows.flatMap(row => row[side] ? [row[side]] : []);
      assert.equal(lines.map(line => line.text + (line.newline ? '\n' : '')).join(''), text);
      assert.deepEqual(lines.map(line => line.number), lines.map((_, i) => i + 1));
    }
  }
  const original = Array.from({ length: 15000 }, (_, i) => `old ${i}`).join('\n');
  const formatted = Array.from({ length: 16000 }, (_, i) => `new ${i}`).join('\n');
  const rows = alignPreviewLines(original, formatted);
  assert.equal(rows.length, 16000);
  assert.equal(rows.flatMap(row => row.original ? [row.original.text] : []).join('\n'), original);
  assert.equal(rows.map(row => row.formatted.text).join('\n'), formatted);
});

test('large reformatted Python keeps functions and statements aligned after line wrapping', async () => {
  const { formatCode, setFormatterAssetLoader } = require('../dist/formatCode.js');
  setFormatterAssetLoader(name => readFileSync(new URL(`../dist/${name}`, import.meta.url)));
  const original = Array.from({ length: 160 }, (_, i) => `def load_info_${i}():\n  info={}\n  for label,key in (("Company Name","company_name"),("Cluster Name","cluster_name"),("ClusterID","cluster_id")):\n    value=read_value(label)\n    if value:\n      info[key]=value.strip()\n  return info\n`).join('\n');
  const formatted = await formatCode(original, 'python');
  const rows = alignPreviewLines(original, formatted);
  const starts = rows.filter(row => row.original?.text.startsWith('def load_info_'));
  assert.equal(starts.length, 160);
  for (const row of starts) assert.equal(row.original.text, row.formatted?.text);
  const returns = rows.filter(row => row.original?.text.trim() === 'return info');
  assert.equal(returns.length, 160);
  for (const row of returns) assert.equal(row.formatted?.text.trim(), 'return info');
  assert.ok(rows.some(row => !row.original && row.formatted?.text.includes('cluster_name')));
  for (const [side, text] of [['original', original], ['formatted', formatted]]) {
    assert.equal(rows.flatMap(row => row[side] ? [row[side].text + (row[side].newline ? '\n' : '')] : []).join(''), text);
  }
});

test('thousands of added blank lines retain code anchors beyond the diff edit budget', () => {
  const lines = Array.from({ length: 6000 }, (_, i) => `value_${i}=${i}`);
  const rows = alignPreviewLines(lines.join('\n') + '\n', lines.map(line => line.replace('=', ' = ') + '\n\n').join(''));
  assert.equal(rows.filter(row => row.original).length, lines.length);
  for (const row of rows) {
    if (row.original) assert.equal(row.original.text.replace(/\s/g, ''), row.formatted?.text.replace(/\s/g, ''));
    else assert.equal(row.formatted.text, '');
  }
});

test('highlight changed characters and whitespace without interpreting code as HTML', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const original = '  value = "👋 <img src=x onerror=alert(1)>";\r\nunchanged\n';
    const formatted = '    value = "😀 <img src=x onerror=alert(1)>";\nunchanged\n';
    await page.setContent(formatPreview(original, formatted, '<script>alert(1)</script>'));
    assert.equal(await page.locator('script, img').count(), 0);
    assert.equal(await page.locator('h2').textContent(), 'Format <script>alert(1)</script>');
    assert.deepEqual(await page.locator('.cs-format-column').first().locator('.cs-diff-text').allTextContents(), original.replace(/\r/g, '␍').split('\n').slice(0, -1));
    assert.deepEqual(await page.locator('.cs-format-column').last().locator('.cs-diff-text').allTextContents(), formatted.split('\n').slice(0, -1));
    assert.equal(await page.locator('.cs-diff-line.cs-diff-original').count(), 1);
    assert.equal(await page.locator('.cs-diff-line.cs-diff-formatted').count(), 1);
    assert.equal(await page.locator('.cs-diff-line').filter({ hasText: 'unchanged' }).locator('mark').count(), 0);
    await page.setContent(formatPreview('  same\n', '    same\n', 'python'));
    assert.equal(await page.locator('.cs-diff-formatted mark').textContent(), '  ');
    assert.equal(await page.locator('.cs-diff-formatted .cs-diff-space').count(), 2);
    assert.equal(await page.locator('.cs-diff-formatted mark').evaluate(mark => mark.textContent.includes('same')), false);
    await page.setContent(formatPreview('👋', '😀', 'text'));
    assert.equal(await page.locator('.cs-diff-original mark').textContent(), '👋');
    assert.equal(await page.locator('.cs-diff-formatted mark').textContent(), '😀');
    await page.setContent(formatPreview('a\tb\nlast', 'a    b\n\nlast\n', 'text'));
    assert.equal(await page.locator('.cs-diff-tab').count(), 1);
    assert.ok(await page.locator('.cs-diff-formatted .cs-diff-space').count() >= 3);
    assert.ok(await page.locator('.cs-diff-formatted .cs-diff-eol').count() >= 2);
    assert.ok((await page.locator('.cs-diff-original .cs-diff-eol').allTextContents()).includes('∅'));
    assert.equal(await page.locator('.cs-diff-gap').count(), 1);
    await page.addStyleTag({ content: await readText('dist/formatDialog.css', 'utf8') });
    assert.deepEqual(await page.locator('.cs-diff-line:not(.cs-diff-gap)').evaluateAll(nodes => [...new Set(nodes.map(node => getComputedStyle(node).backgroundColor))]), ['rgba(0, 0, 0, 0)']);
  } finally { await browser.close(); }
});

test('both panes scroll together by wheel and keyboard, including after reopening and at narrow sizes', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1200, height: 720 } });
    const original = Array.from({ length: 120 }, (_, i) => i === 30 ? 'expand();' : `const row${i} = ${i};`).join('\n');
    const formatted = original.replace('expand();', 'expand(\n  first,\n  second,\n);').replace('const row90', ' '.repeat(300) + 'const row90');
    const html = `<div id="joplin-plugin-content">${formatPreview(original, formatted, 'javascript')}</div>`;
    await page.setContent(html);
    await page.addStyleTag({ content: await readText('dist/formatDialog.css', 'utf8') });
    await page.addScriptTag({ path: 'dist/formatDialog.js' });
    await page.addScriptTag({ path: 'dist/formatDialog.js' });
    const panes = page.locator('.cs-format-column pre');
    assert.equal(await panes.first().getAttribute('tabindex'), '0');
    const assertSynced = async () => {
      await page.waitForFunction(() => {
        const [a, b] = document.querySelectorAll('.cs-format-column pre');
        return Math.abs(a.scrollTop - b.scrollTop) < 1;
      });
    };
    const scrollWith = async (source, action) => {
      await source.evaluate(pre => {
        pre.dataset.scrollEnded = 'false';
        pre.addEventListener('scrollend', () => pre.dataset.scrollEnded = 'true', { once: true });
      });
      await action();
      await page.waitForFunction(pre => pre.dataset.scrollEnded === 'true', await source.elementHandle());
      await assertSynced();
    };
    for (const source of [panes.first(), panes.last()]) {
      await source.hover();
      await scrollWith(source, () => page.mouse.wheel(0, 420));
      await page.waitForFunction(() => [...document.querySelectorAll('.cs-format-column pre')].every(pre => pre.scrollTop > 0));
      await assertSynced();
    }
    const positions = await page.locator('.cs-diff-text').filter({ hasText: /^const row60 = 60;$/ }).evaluateAll(nodes => nodes.map(node => node.getBoundingClientRect().top));
    assert.ok(Math.abs(positions[0] - positions[1]) < 1);
    const dimensions = await panes.evaluateAll(nodes => nodes.map(pre => ({ height: pre.scrollHeight, width: pre.scrollWidth, client: pre.clientWidth })));
    assert.equal(dimensions[0].height, dimensions[1].height);
    assert.ok(dimensions[1].width > dimensions[1].client);
    assert.ok(dimensions[0].width <= dimensions[0].client);
    for (const source of [panes.first(), panes.last()]) {
      await source.focus();
      await scrollWith(source, () => page.keyboard.press('Control+End'));
      await page.waitForFunction(() => [...document.querySelectorAll('.cs-format-column pre')].every(pre => Math.abs(pre.scrollHeight - pre.clientHeight - pre.scrollTop) < 1));
      await assertSynced();
      await scrollWith(source, () => page.keyboard.press('Control+Home'));
      await page.waitForFunction(() => [...document.querySelectorAll('.cs-format-column pre')].every(pre => pre.scrollTop === 0));
    }
    await page.locator('#joplin-plugin-content').evaluate((container, content) => container.innerHTML = content, formatPreview(original, formatted, 'javascript'));
    await page.addScriptTag({ path: 'dist/formatDialog.js' });
    await page.setViewportSize({ width: 600, height: 720 });
    await panes.last().focus();
    await scrollWith(panes.last(), () => page.keyboard.press('PageDown'));
    await page.waitForFunction(() => [...document.querySelectorAll('.cs-format-column pre')].every(pre => pre.scrollTop > 0));
    await assertSynced();
    const stable = await panes.evaluateAll(nodes => nodes.map(pre => pre.scrollTop));
    await page.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.deepEqual(await panes.evaluateAll(nodes => nodes.map(pre => pre.scrollTop)), stable);
  } finally { await browser.close(); }
});

test('the real plugin keeps Copy and Apply tied to source text and packages the dialog script', async () => {
  let startup, onMessage, choice;
  const scripts = [], copies = [], applies = [];
  let html = '';
  const joplin = {
    plugins: { register: plugin => startup = plugin.onStart, installationDir: async () => path.resolve('dist') },
    require: () => ({ readFileSync }),
    views: {
      dialogs: { create: async () => 'preview', setFitToContent: async () => {}, addScript: async (_, script) => scripts.push(script),
        setButtons: async () => {}, setHtml: async (_, content) => html = content, open: async () => ({ id: choice }) },
      menuItems: { create: async () => {} },
    },
    settings: { registerSection: async () => {}, registerSettings: async () => {} },
    contentScripts: { register: async () => {}, onMessage: async (_, handler) => onMessage = handler },
    commands: { register: async () => {}, execute: async (...args) => { applies.push(args); return { ok: true }; } },
    workspace: { selectedNote: async () => ({ id: 'same-note' }) },
    clipboard: { writeText: async text => copies.push(text) },
  };
  vm.runInNewContext(await readText('dist/index.js', 'utf8'), { joplin, require, console, Buffer, TextEncoder, TextDecoder, URL, process, performance, crypto: globalThis.crypto, setTimeout, clearTimeout });
  await startup();
  assert.ok(scripts.includes('./formatDialog.js'));
  assert.ok(scripts.includes('./retro.css'));
  const message = { action: 'format', text: 'const a={x:1};\n', language: 'js', info: 'js', fenceIndex: 0 };
  choice = 'cancel';
  assert.equal((await onMessage(message)).action, 'cancelled');
  assert.match(html, /cs-diff-formatted/);
  assert.equal(copies.length + applies.length, 0);
  choice = 'copyOriginal';
  await onMessage(message);
  choice = 'copyFormatted';
  await onMessage(message);
  assert.deepEqual(copies, [message.text, 'const a = { x: 1 };\n']);
  assert.equal(applies.length, 0);
  choice = 'ok';
  const rich = await onMessage({ ...message, editor: 'rich' });
  assert.equal(rich.action, 'apply');
  assert.equal(rich.formatted, copies[1]);
  assert.doesNotMatch(rich.rowsHtml, /cs-diff/);
  assert.equal((await onMessage(message)).action, 'applied');
  assert.equal(applies[0][1].args[1], copies[1]);
  for (const [language, text] of [
    ['powershell', '$n=1\nWrite-Output $n\n'],
    ['rust', 'fn main(){println!("hello");}\n'],
    ['terraform', 'locals {\nname="example"\n}\n'],
    ['commodore-basic', '10 FOR I=1 TO 3\n20 PRINT I\n30 NEXT I\n100 END\n'],
  ]) {
    const request = { ...message, text, language, info: language };
    choice = 'copyFormatted';
    await onMessage(request);
    const formatted = copies.at(-1);
    assert.notEqual(formatted, text, language);
    choice = 'ok';
    const response = await onMessage({ ...request, editor: 'rich' });
    assert.equal(response.action, 'apply', language);
    assert.equal(response.formatted, formatted, language);
    assert.doesNotMatch(response.rowsHtml, /cs-diff/, language);
    assert.equal((await onMessage(request)).action, 'applied', language);
    assert.equal(applies.at(-1)[1].args[1], formatted, language);
  }
  const retro = { ...message, language: 'c64', info: 'c64 title="retro listing.bas" retro',
    text: '10 FOR I=1 TO 3\n20 PRINT I\n30 NEXT I\n100 END\n' };
  choice = 'copyOriginal';
  await onMessage(retro);
  assert.equal(copies.at(-1), retro.text);
  assert.match(html, /data-cs-retro="c64"/);
  choice = 'ok';
  await onMessage(retro);
  assert.equal(applies.at(-1)[1].args[0].info, retro.info);
  await onMessage({ ...retro, info: 'c64' });
  assert.doesNotMatch(html, /data-cs-retro=/);
  const toggle = await onMessage({ ...retro, action: 'retro', enabled: false });
  assert.equal(toggle.ok, true);
  assert.equal(toggle.info, 'c64 title="retro listing.bas"');
  assert.equal(applies.at(-1)[1].args[1], retro.text);
  assert.equal(applies.at(-1)[1].args[2], toggle.info);
  const bbc = { ...retro, language: 'bbc-basic', info: 'bbc-basic retro title="retro-mode=7"' };
  const modeChange = await onMessage({ ...bbc, action: 'retro', enabled: true, mode: '6-red' });
  assert.equal(modeChange.ok, true);
  assert.equal(modeChange.info, bbc.info + ' retro-mode=6-red');
  await onMessage({ ...bbc, info: modeChange.info });
  assert.match(html, /data-cs-retro-mode="6-red"/);
  for (const invalid of [{ ...retro, enabled: 'yes' }, { ...message, enabled: true }, { ...retro, enabled: true, mode: '6-red' }, { ...bbc, enabled: true, mode: '__proto__' }, { ...bbc, enabled: true, mode: '<script>' }]) {
    assert.equal((await onMessage({ ...invalid, action: 'retro' })).ok, false);
  }
  const installer = 'publish/local.lpowers.code-studio.jpl';
  const entries = execFileSync('tar', ['-tf', installer], { encoding: 'utf8' }).split('\n');
  assert.ok(entries.includes('formatDialog.js'));
  assert.equal(execFileSync('tar', ['-xOf', installer, 'formatDialog.js'], { encoding: 'utf8' }), await readText('dist/formatDialog.js', 'utf8'));
  const manifest = JSON.parse(execFileSync('tar', ['-xOf', installer, 'manifest.json'], { encoding: 'utf8' }));
  assert.equal(manifest.version, JSON.parse(await readText('package.json', 'utf8')).version);
});
