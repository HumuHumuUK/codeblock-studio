import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import MarkdownIt from 'markdown-it';
import { chromium } from 'playwright';
const require = createRequire(import.meta.url);
const renderer = require('../dist/renderer.js').default;

test('format feedback stays in the sticky toolbar on long blocks in both editor views', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const md = new MarkdownIt();
    renderer({ contentScriptId: 'codeStudioRenderer' }).plugin(md);
    const source = Array.from({ length: 180 }, (_, i) => `const value${i} = ${i};\n`).join('');
    for (const richText of [false, true]) {
      for (const width of [960, 360]) {
        const page = await browser.newPage({ viewport: { width, height: 720 } });
        await page.setContent('<p style="height:400px">Before the code</p>' + md.render('```js title="already-formatted-example.js"\n' + source + '```'));
        await page.addStyleTag({ content: await readFile('dist/code-studio.css', 'utf8') });
        await page.evaluate(richText => {
          window.nextReply = { ok: true, action: 'unchanged' };
          window.webviewApi = { postMessage: async () => window.nextReply };
          if (richText) window.tinymce = { activeEditor: { getDoc: () => document, on() {} } };
          window.scrollTo(0, 1800);
        }, richText);
        await page.addScriptTag({ path: 'dist/viewer.js' });
        const format = page.getByRole('button', { name: 'Format code' });
        const status = page.getByRole('status');
        for (const reply of [
          { ok: true, action: 'unchanged' },
          { ok: false, error: 'Could not format this code: ' + 'invalid_token_'.repeat(30) },
        ]) {
          await page.evaluate(reply => window.nextReply = reply, reply);
          await format.click();
          await page.waitForFunction(() => document.querySelector('.cs-status').classList.contains('cs-visible-status'));
          assert.equal(await status.textContent(), reply.error || 'Already formatted.');
          assert.equal(await format.isEnabled(), true);
          const layout = await status.evaluate(message => {
            const toolbar = message.closest('.cs-toolbar');
            const bounds = message.getBoundingClientRect();
            const controls = document.querySelector('.cs-actions').getBoundingClientRect();
            return {
              inToolbar: !!toolbar,
              visible: bounds.top >= 0 && bounds.bottom <= innerHeight && bounds.left >= 0 && bounds.right <= innerWidth,
              nearControls: bounds.top >= controls.bottom && bounds.top - controls.bottom < 24,
              toolbarVisible: !!toolbar && toolbar.getBoundingClientRect().top >= 0,
              codeContinuesBelowScreen: document.querySelector('.cs-code').getBoundingClientRect().bottom > innerHeight,
              noHorizontalOverflow: message.scrollWidth <= message.clientWidth,
            };
          });
          assert.deepEqual(layout, {
            inToolbar: true, visible: true, nearControls: true, toolbarVisible: true,
            codeContinuesBelowScreen: true, noHorizontalOverflow: true,
          }, `richText=${richText}, width=${width}`);
          assert.equal(await page.locator('.joplin-source').textContent(), source);
        }
        await page.emulateMedia({ media: 'print' });
        assert.equal(await status.isVisible(), false);
        await page.emulateMedia({ media: 'screen' });
        await page.evaluate(() => window.nextReply = { ok: true, action: 'cancelled' });
        await format.click();
        assert.equal(await status.textContent(), '');
        assert.ok((await status.boundingBox()).height <= 1);
        await page.close();
      }
    }
  } finally { await browser.close(); }
});

test('the first toolbar click survives editor selection handlers and never opens the source editor', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const md = new MarkdownIt();
    renderer({ contentScriptId: 'codeStudioRenderer' }).plugin(md);
    const source = 'const a={x:1};\n';
    await page.setContent('<p contenteditable="true">Editor selection starts here</p>' + md.render('```js\n' + source + '```'));
    await page.addStyleTag({ content: await readFile('dist/code-studio.css', 'utf8') });
    await page.evaluate(() => {
      window.previews = 0;
      window.sourceEdits = 0;
      window.editorGestures = [];
      window.webviewApi = { postMessage: async () => {
        window.previews++;
        return new Promise(resolve => window.cancelPreview = () => resolve({ ok: true, action: 'cancelled' }));
      } };
      window.tinymce = { activeEditor: { getDoc: () => document, on() {} } };
      // Rich Text selection may redraw a non-editable block before click bubbles to the document.
      document.body.addEventListener('mousedown', event => {
        const card = event.target.closest('.cs-card');
        if (card && event.target.closest('button')) { window.editorGestures.push('mousedown'); card.innerHTML = card.innerHTML; }
      });
      document.body.addEventListener('click', event => {
        if (event.target.closest('.cs-card')) { window.editorGestures.push('click'); event.stopImmediatePropagation(); }
      });
      document.body.addEventListener('dblclick', event => {
        if (event.target.closest('.joplin-editable')) window.sourceEdits++;
      });
    });
    await page.addScriptTag({ path: 'dist/viewer.js' });
    const format = page.getByRole('button', { name: 'Format code' });
    await page.locator('p').click();
    await format.locator('span').click();
    assert.equal(await page.evaluate(() => window.previews), 1);
    assert.deepEqual(await page.evaluate(() => window.editorGestures), []);
    await format.dblclick();
    assert.equal(await page.evaluate(() => window.previews), 1);
    assert.equal(await page.evaluate(() => window.sourceEdits), 0);
    await page.evaluate(() => window.cancelPreview());
    await format.focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => window.previews), 2);
    await page.evaluate(() => window.cancelPreview());
    await page.getByRole('button', { name: 'Wrap long lines' }).click();
    assert.equal(await page.getByRole('button', { name: 'Wrap long lines' }).getAttribute('aria-pressed'), 'true');
    await page.locator('.cs-line-text').dblclick();
    assert.equal(await page.evaluate(() => window.sourceEdits), 1);
    assert.equal(await page.locator('.joplin-source').textContent(), source);
  } finally { await browser.close(); }
});

test('copy is exact, wrapping aligns numbers, updates do not duplicate handlers', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 620, height: 800 } });
    const md = new MarkdownIt();
    renderer({ pluginId: 'local.lpowers.code-studio', contentScriptId: 'codeStudioRenderer' }).plugin(md);
    const code = '/* long\n   multiline comment */\n\n\tconst greeting = "λ 👋 <>&";\n' + 'x'.repeat(300) + '\n';
    const html = md.render('```javascript title="test.js"\n' + code + '```');
    await page.setContent(html);
    await page.addStyleTag({ content: await readFile('dist/code-studio.css', 'utf8') });
    await page.evaluate(() => {
      window.copies = [];
      window.webviewApi = { postMessage: async (id, message) => {
        window.copies.push({ id, ...message }); return { ok: true };
      } };
    });
    await page.addScriptTag({ path: 'dist/viewer.js' });
    await page.addScriptTag({ path: 'dist/viewer.js' });
    await page.getByRole('button', { name: 'Copy code' }).click();
    const copies = await page.evaluate(() => window.copies);
    assert.equal(copies.length, 1);
    assert.equal(copies[0].text, code);
    assert.equal(copies[0].id, 'codeStudioRenderer');
    assert.equal(await page.locator('.cs-copy-button span').textContent(), 'Copied');
    const positions = await page.locator('.cs-line').evaluateAll(rows => rows.map(r => r.getBoundingClientRect().y));
    assert.equal(positions.length, 5);
    for (let i = 1; i < positions.length; i++) assert.ok(Math.abs(positions[i] - positions[i - 1] - 24.5) < 1);
    assert.ok(await page.locator('.cs-code').evaluate(e => e.scrollWidth > e.clientWidth));
    await page.getByRole('button', { name: 'Wrap long lines' }).click();
    assert.equal(await page.getByRole('button', { name: 'Wrap long lines' }).getAttribute('aria-pressed'), 'true');
    assert.ok(await page.locator('.cs-code').evaluate(e => e.scrollWidth <= e.clientWidth + 1));
    // Simulate Joplin replacing the rendered note, retaining the document listener.
    await page.evaluate(html => document.body.innerHTML = html, html);
    await page.getByRole('button', { name: 'Copy code' }).click();
    assert.equal(await page.evaluate(() => window.copies.length), 2);
    await page.getByRole('button', { name: 'Copy code' }).focus();
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => window.copies.length), 3);
    await page.getByRole('button', { name: 'Wrap long lines' }).focus();
    await page.keyboard.press('Space');
    assert.equal(await page.getByRole('button', { name: 'Wrap long lines' }).getAttribute('aria-pressed'), 'true');
    await page.evaluate(() => { window.webviewApi.postMessage = async () => { throw Error('denied'); }; });
    await page.getByRole('button', { name: 'Copy code' }).click();
    assert.equal(await page.locator('.cs-copy-button span').textContent(), 'Retry');
    assert.match(await page.locator('.cs-status').textContent(), /Could not copy/);
  } finally { await browser.close(); }
});

test('format preview leaves source intact until Apply and records an editor undo transaction', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const md = new MarkdownIt();
    renderer({ contentScriptId: 'codeStudioRenderer' }).plugin(md);
    const original = 'const a={x:1};\n';
    await page.setContent(md.render('```js\n' + original + '```'));
    await page.evaluate(() => {
      window.events = [];
      window.nextReply = { ok: true, action: 'cancelled' };
      window.webviewApi = { postMessage: async () => window.nextReply };
      window.tinymce = { activeEditor: {
        getDoc: () => document, mode: { isReadOnly: () => false }, nodeChanged() {},
        on(events, handler) { window.editorUndoHandler = handler; },
        undoManager: { transact(fn) { window.events.push('undo transaction'); fn(); } },
        fire(event) { window.events.push(event); },
      } };
    });
    await page.addScriptTag({ path: 'dist/viewer.js' });
    await page.getByRole('button', { name: 'Format code' }).click();
    assert.equal(await page.locator('.joplin-source').textContent(), original);
    await page.evaluate(() => window.nextReply = { ok: true, action: 'copyFormatted' });
    await page.getByRole('button', { name: 'Format code' }).click();
    assert.equal(await page.locator('.joplin-source').textContent(), original);
    await page.evaluate(() => window.nextReply = {
      ok: true, action: 'apply', formatted: 'const a = { x: 1 };\n', lineCount: 1,
      rowsHtml: '<span class="cs-line" data-line="1"><span class="cs-line-text">const a = { x: 1 };</span></span>',
    });
    await page.getByRole('button', { name: 'Format code' }).click();
    await page.waitForFunction(() => document.querySelector('.joplin-source').textContent === 'const a = { x: 1 };\n');
    assert.deepEqual(await page.evaluate(() => window.events), ['undo transaction', 'joplinChange']);
    await page.evaluate(() => window.nextReply = { ok: false, error: 'Syntax error: <img src=x>' });
    await page.getByRole('button', { name: 'Format code' }).click();
    assert.equal(await page.locator('.joplin-source').textContent(), 'const a = { x: 1 };\n');
    assert.equal(await page.locator('.cs-status').textContent(), 'Syntax error: <img src=x>');
    assert.equal(await page.locator('img').count(), 0);
    assert.equal(await page.getByRole('button', { name: 'Format code' }).isEnabled(), true);
    await page.evaluate(() => {
      document.querySelector('.cs-format-button').disabled = true;
      window.editorUndoHandler();
    });
    assert.equal(await page.getByRole('button', { name: 'Format code' }).isEnabled(), true);
    assert.equal(await page.locator('.cs-status').textContent(), '');
  } finally { await browser.close(); }
});

test('Retro display saves through Markdown, survives rerendering, and keeps Copy and Format tied to raw source', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 360, height: 720 } });
    const md = new MarkdownIt();
    renderer({ contentScriptId: 'codeStudioRenderer' }).plugin(md);
    const source = '10 PRINT "<>& £ λ"\n20 END\n';
    let body = '```c64 title="my retro file.bas"\n' + source + '```\n';
    const messages = [];
    await page.exposeFunction('saveRetro', message => {
      messages.push(message);
      if (message.action !== 'retro') return { ok: true, action: 'cancelled' };
      const { setRetroInfo } = require('../dist/retro.js');
      const { replaceFence } = require('../dist/replaceFence.js');
      const info = setRetroInfo(message.info, message.enabled);
      const change = replaceFence(body, message, message.text, info);
      body = body.slice(0, change.from) + change.insert + body.slice(change.to);
      return { ok: true, info };
    });
    await page.setContent(md.render(body));
    await page.addStyleTag({ content: await readFile('dist/code-studio.css', 'utf8') + await readFile('dist/retro.css', 'utf8') });
    await page.evaluate(() => window.webviewApi = { postMessage: (_, message) => window.saveRetro(message) });
    await page.addScriptTag({ path: 'dist/viewer.js' });
    const checkbox = page.getByRole('checkbox', { name: 'Retro display' });
    await checkbox.click();
    await page.waitForFunction(() => document.querySelector('.cs-card').dataset.csRetro === 'c64');
    assert.equal(await checkbox.isChecked(), true);
    assert.equal(body, '```c64 title="my retro file.bas" retro\n' + source + '```\n');
    assert.equal(await page.locator('.joplin-source').textContent(), source);
    await page.evaluate(html => document.body.innerHTML = html, md.render(body));
    assert.equal(await checkbox.isChecked(), true);
    await page.getByRole('button', { name: 'Format code' }).click();
    assert.equal(messages.at(-1).info, 'c64 title="my retro file.bas" retro');
    await page.getByRole('button', { name: 'Copy code' }).click();
    assert.equal(messages.at(-1).action, 'copy');
    assert.equal(messages.at(-1).text, source);
    await checkbox.focus();
    await page.keyboard.press('Space');
    await page.waitForFunction(() => !document.querySelector('.cs-card').hasAttribute('data-cs-retro'));
    assert.equal(await checkbox.isChecked(), false);
    assert.equal(body, '```c64 title="my retro file.bas"\n' + source + '```\n');
    assert.equal(await page.locator('.cs-code').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(11, 14, 20)');
    await page.evaluate(() => window.webviewApi.postMessage = async () => ({ ok: false, error: 'This note is read-only.' }));
    await checkbox.click();
    await page.waitForFunction(() => document.querySelector('.cs-status').textContent.includes('read-only'));
    assert.equal(await checkbox.isChecked(), false);
  } finally { await browser.close(); }
});

test('Rich Text Retro display changes fence metadata in an Undo transaction and rejects read-only notes', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage();
    const md = new MarkdownIt();
    renderer({ contentScriptId: 'codeStudioRenderer' }).plugin(md);
    const source = '10 PRINT "HELLO"\n';
    await page.setContent(md.render('```bbc-basic\n' + source + '```'));
    await page.evaluate(() => {
      window.events = [];
      window.undoSnapshots = [];
      window.redo = [];
      window.readOnly = false;
      window.tinymce = { activeEditor: {
        getDoc: () => document, mode: { isReadOnly: () => window.readOnly }, nodeChanged() {},
        on(_, handler) { window.editorUndoHandler = handler; },
        undoManager: { transact(fn) { window.undoSnapshots.push(document.body.innerHTML); window.events.push('transaction'); fn(); } },
        fire(event) { window.events.push(event); },
      } };
      document.body.addEventListener('dblclick', () => window.events.push('source editor'));
      document.body.addEventListener('mousedown', event => {
        if (event.target.closest('button')) { window.events.push('selection'); document.body.innerHTML = document.body.innerHTML; }
      });
    });
    await page.addScriptTag({ path: 'dist/viewer.js' });
    const checkbox = page.getByRole('checkbox', { name: 'Retro display' });
    await checkbox.click();
    assert.equal(await checkbox.isChecked(), true);
    assert.equal(await page.locator('.joplin-source').getAttribute('data-joplin-source-open'), '```bbc-basic retro\n');
    assert.equal(await page.locator('.joplin-source').textContent(), source);
    assert.deepEqual(await page.evaluate(() => window.events), ['transaction', 'joplinChange']);
    await page.evaluate(() => {
      window.redo.push(document.body.innerHTML);
      document.body.innerHTML = window.undoSnapshots.pop();
      window.editorUndoHandler();
    });
    assert.equal(await checkbox.isChecked(), false);
    assert.equal(await page.locator('.cs-card').getAttribute('data-cs-retro'), null);
    assert.equal(await page.locator('.cs-card').getAttribute('data-cs-info'), 'bbc-basic');
    await page.evaluate(() => { document.body.innerHTML = window.redo.pop(); window.editorUndoHandler(); });
    assert.equal(await checkbox.isChecked(), true);
    await checkbox.focus();
    await page.keyboard.press('Enter');
    assert.equal(await checkbox.isChecked(), false);
    assert.equal(await page.locator('.joplin-source').getAttribute('data-joplin-source-open'), '```bbc-basic\n');
    await page.evaluate(() => window.readOnly = true);
    await checkbox.click();
    assert.equal(await checkbox.isChecked(), false);
    assert.match(await page.getByRole('status').textContent(), /read-only/);
    assert.equal(await page.locator('.joplin-source').textContent(), source);
  } finally { await browser.close(); }
});

test('Rich Text uses current source settings after native code edits and repeated Retro toggles', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const md = new MarkdownIt();
    renderer({ contentScriptId: 'codeStudioRenderer' }).plugin(md);
    const source = '10 PRINT "HELLO"\n';
    for (const previous of ['javascript', 'c64 retro']) {
      const page = await browser.newPage();
      await page.setContent(md.render('```' + previous + '\n' + source + '```'));
      await page.evaluate(() => {
        window.messages = [];
        window.webviewApi = { postMessage: async (_, message) => { window.messages.push(message); return { ok: true, action: 'cancelled' }; } };
        window.tinymce = { activeEditor: {
          getDoc: () => document, mode: { isReadOnly: () => false }, on() {}, nodeChanged() {},
          undoManager: { transact(fn) { fn(); } }, fire() {},
        } };
      });
      await page.addScriptTag({ path: 'dist/viewer.js' });
      // Joplin's native source dialog retains the outer editable element and replaces its contents.
      await page.evaluate(html => {
        const template = document.createElement('div'); template.innerHTML = html;
        document.querySelector('.joplin-editable').innerHTML = template.querySelector('.joplin-editable').innerHTML;
      }, md.render('```bbc-basic title="listing.bas" retro-mode=6-red\n' + source + '```'));
      const checkbox = page.getByRole('checkbox', { name: 'Retro display' });
      await page.getByRole('button', { name: 'Format code' }).click();
      assert.deepEqual(await page.evaluate(() => window.messages.map(({ language, info }) => ({ language, info }))), [
        { language: 'bbc-basic', info: 'bbc-basic title="listing.bas" retro-mode=6-red' },
      ]);
      // A stale tick state alone must also recover, without a preceding Format or refresh event.
      await page.evaluate(previous => { document.querySelector('.cs-card').dataset.csInfo = previous; }, previous);
      for (const enabled of [true, false, true, false, true]) {
        await checkbox.click();
        assert.equal(await checkbox.isChecked(), enabled, `previous=${previous}, enabled=${enabled}`);
        assert.equal(await page.locator('.cs-card').getAttribute('data-cs-language'), 'bbc-basic');
        assert.equal(await page.locator('.cs-card').getAttribute('data-cs-retro'), enabled ? 'bbc' : null);
        assert.equal(await page.locator('.cs-card').getAttribute('data-cs-retro-mode'), enabled ? '6-red' : null);
        assert.equal(await page.locator('.joplin-source').getAttribute('data-joplin-source-open'), '```bbc-basic title="listing.bas" retro-mode=6-red' + (enabled ? ' retro' : '') + '\n');
        assert.equal(await page.locator('.joplin-source').textContent(), source);
      }
      await page.getByRole('button', { name: 'Format code' }).click();
      assert.deepEqual(await page.evaluate(() => window.messages.map(({ language, info }) => ({ language, info }))), [
        { language: 'bbc-basic', info: 'bbc-basic title="listing.bas" retro-mode=6-red' },
        { language: 'bbc-basic', info: 'bbc-basic title="listing.bas" retro-mode=6-red retro' },
      ]);
      // Native note refreshes also need to update the outer palette before another click.
      await page.evaluate(html => {
        const template = document.createElement('div'); template.innerHTML = html;
        document.querySelector('.joplin-editable').innerHTML = template.querySelector('.joplin-editable').innerHTML;
        document.dispatchEvent(new Event('joplin-noteDidUpdate'));
      }, md.render('```msx-basic retro\n' + source + '```'));
      assert.equal(await page.locator('.cs-card').getAttribute('data-cs-retro'), 'msx');
      await checkbox.click();
      assert.equal(await checkbox.isChecked(), false);
      await checkbox.click();
      assert.equal(await checkbox.isChecked(), true);
      assert.equal(await page.locator('.joplin-source').getAttribute('data-joplin-source-open'), '```msx-basic retro\n');
      await page.evaluate(html => {
        const template = document.createElement('div'); template.innerHTML = html;
        document.querySelector('.joplin-editable').innerHTML = template.querySelector('.joplin-editable').innerHTML;
        document.dispatchEvent(new Event('joplin-noteDidUpdate'));
      }, md.render('```javascript\nconst value = 1;\n```'));
      assert.equal(await page.locator('.cs-card').getAttribute('data-cs-retro'), null);
      assert.equal(await page.locator('.cs-card').getAttribute('data-cs-language'), 'javascript');
      assert.equal(await checkbox.count(), 0);
      await page.close();
    }
  } finally { await browser.close(); }
});
