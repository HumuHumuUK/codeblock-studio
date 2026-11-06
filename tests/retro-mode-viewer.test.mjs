import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import MarkdownIt from 'markdown-it';
import { chromium } from 'playwright';
const require = createRequire(import.meta.url);
const renderer = require('../dist/renderer.js').default;
const { replaceFence } = require('../dist/replaceFence.js');
const { setRetroInfo, setBbcMode } = require('../dist/retro.js');

test('BBC selectors save in both editor paths, retain the mode while off, and respect Undo and read-only notes', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const md = new MarkdownIt(); renderer({ contentScriptId: 'codeStudioRenderer' }).plugin(md);
    for (const rich of [false, true]) {
      const page = await browser.newPage({ viewport: { width: 360, height: 720 } });
      const code = '10 FOR I=1 TO 3\n20 PRINT "retro-mode=7";I\n30 NEXT I\n';
      let body = '```bbc-basic retro title="retro-mode=7.bas"\n' + code + '```\n';
      const messages = [];
      await page.exposeFunction('saveDisplay', message => {
        messages.push(message);
        if (message.action !== 'retro') return { ok: true, action: 'cancelled' };
        let info = setRetroInfo(message.info, message.enabled);
        if (message.mode !== undefined) info = setBbcMode(info, message.mode);
        const change = replaceFence(body, message, message.text, info);
        body = body.slice(0, change.from) + change.insert + body.slice(change.to);
        return { ok: true, info };
      });
      await page.setContent(md.render(body));
      await page.addStyleTag({ content: await readFile('dist/code-studio.css', 'utf8') + await readFile('dist/retro.css', 'utf8') });
      await page.evaluate(rich => {
        window.undoSnapshots = []; window.editorGestures = []; window.readOnly = false;
        window.webviewApi = { postMessage: (_, message) => window.saveDisplay(message) };
        if (rich) window.tinymce = { activeEditor: {
          getDoc: () => document, mode: { isReadOnly: () => window.readOnly },
          on(_, handler) { window.undoHandler = handler; }, nodeChanged() {}, fire() {},
          undoManager: { transact(fn) { window.undoSnapshots.push(document.body.innerHTML); fn(); } },
        } };
        for (const event of ['mousedown', 'click', 'dblclick', 'keydown']) document.body.addEventListener(event, e => {
          if (e.target.closest('select')) window.editorGestures.push(event);
        });
      }, rich);
      await page.addScriptTag({ path: 'dist/viewer.js' });
      const select = page.getByRole('combobox', { name: 'BBC display mode' });
      const checkbox = page.getByRole('checkbox', { name: 'Retro display' });
      await select.click(); await page.keyboard.press('Escape');
      await select.focus(); await page.keyboard.press('Home'); await page.keyboard.press('Enter');
      await page.waitForFunction(() => document.querySelector('.cs-card').dataset.csRetroMode === '0');
      await select.selectOption('6-red');
      await page.waitForFunction(() => document.querySelector('.cs-card').dataset.csRetroMode === '6-red');
      assert.equal(await page.locator('.cs-code').evaluate(node => getComputedStyle(node).backgroundColor), 'rgb(255, 0, 0)');
      assert.equal(await page.locator('.joplin-source').textContent(), code);
      assert.deepEqual(await page.evaluate(() => window.editorGestures), []);
      assert.equal(await page.locator('.cs-toolbar').evaluate(node => node.scrollWidth <= node.clientWidth), true);
      if (rich) {
        await page.evaluate(() => { document.body.innerHTML = window.undoSnapshots.pop(); window.undoHandler(); });
        assert.equal(await select.inputValue(), '0');
        assert.equal(await page.locator('.cs-card').getAttribute('data-cs-retro-mode'), '0');
        await select.selectOption('6-red');
      } else {
        assert.ok(body.startsWith('```bbc-basic retro title="retro-mode=7.bas" retro-mode=6-red\n'));
        await page.evaluate(html => document.body.innerHTML = html, md.render(body));
        assert.equal(await select.inputValue(), '6-red');
      }
      await checkbox.click();
      await page.waitForFunction(() => document.querySelector('.cs-retro-mode').hidden);
      assert.equal(await select.isVisible(), false);
      assert.ok((await page.locator('.cs-card').getAttribute('data-cs-info')).includes('retro-mode=6-red'));
      await checkbox.click();
      await page.waitForFunction(() => !document.querySelector('.cs-retro-mode').hidden);
      assert.equal(await select.inputValue(), '6-red');
      await page.getByRole('button', { name: 'Format code' }).click();
      assert.ok(messages.at(-1).info.includes('retro-mode=6-red'));
      assert.equal(messages.at(-1).text, code);
      await page.evaluate(rich => {
        if (rich) window.readOnly = true;
        else window.webviewApi.postMessage = async () => ({ ok: false, error: 'This note is read-only.' });
      }, rich);
      await select.selectOption('1');
      await page.waitForFunction(() => document.querySelector('.cs-status').textContent.includes('read-only'));
      assert.equal(await select.inputValue(), '6-red');
      assert.equal(await page.locator('.joplin-source').textContent(), code);
      await page.close();
    }
  } finally { await browser.close(); }
});
