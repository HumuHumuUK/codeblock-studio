import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { chromium } from 'playwright';
import hljs from 'highlight.js';
const require = createRequire(import.meta.url);
const { codeLanguages } = require('../dist/renderer.js');

test('the language catalogue includes bundled highlighting, formatter labels and retro aliases without duplicates', () => {
  const choices = codeLanguages();
  assert.equal(new Set(choices.map(choice => choice.value)).size, choices.length);
  assert.equal(new Set(choices.map(choice => choice.label.toLowerCase())).size, choices.length);
  const spellings = choices.flatMap(choice => [choice.value, ...choice.aliases]);
  assert.equal(new Set(spellings).size, spellings.length);
  for (const value of hljs.listLanguages()) {
    for (const name of [value, ...(hljs.getLanguage(value).aliases || [])]) assert.ok(spellings.includes(name), name);
  }
  for (const value of ['python', 'ruby', 'pascal', 'fortran', 'rust', 'mjs', 'terraform', 'text', 'c64', 'bbc-basic', 'mac-basic', 'stos', 'gfa-basic', 'msx', 'zx81', 'dragon32', 'archimedes', 'oric-atmos']) {
    assert.ok(choices.some(choice => (choice.value === value || choice.aliases.includes(value)) && choice.label), value);
  }
  const choiceFor = value => choices.find(choice => choice.value === value || choice.aliases.includes(value));
  for (const names of [['python', 'py'], ['javascript', 'js', 'mjs', 'cjs'], ['bbc-basic', 'bbc', 'bbcbasic', 'bbc-micro'], ['c64', 'c64-basic', 'commodore-basic'], ['dragon-basic', 'dragon32', 'dragon64'], ['oric-basic', 'oric', 'oric-atmos']]) {
    for (const name of names) assert.equal(choiceFor(name), choiceFor(names[0]), name);
  }
  for (const names of [['json', 'jsonc', 'json5'], ['javascript', 'jsx'], ['typescript', 'tsx'], ['html', 'xml', 'xhtml', 'svg'], ['bash', 'sh', 'zsh', 'console'], ['hcl', 'terraform', 'opentofu'], ['bbc-basic', 'bbc-basic-v', 'bbc-basic-vi'], ['gwbasic', 'qbasic']]) {
    assert.equal(new Set(names.map(choiceFor)).size, names.length, names.join(', '));
    for (const name of names) assert.ok(choiceFor(name), name);
  }
  assert.match(choiceFor('c64').label, /Commodore 64/);
  assert.equal(choices.some(choice => !choice.value), false);
});

test('the native code dialog supports filtered choices, mouse/keyboard selection, custom labels and repeated opening', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 360, height: 760 } });
    await page.setContent('<style>.tox-dialog{width:320px}.tox-form__group{display:flex;flex-direction:column}input{box-sizing:border-box;width:100%;height:32px}.tox-menu{background:white;border:1px solid #888}.tox-collection__item--active{background:#cef}</style><p id="note">Unchanged note</p><iframe id="editor"></iframe>');
    await page.evaluate(() => {
      window.handlers = {};
      window.saved = undefined;
      const frame = document.querySelector('iframe');
      window.readyTinyMce = { activeEditor: {
        getDoc: () => frame.contentDocument,
        getContainer: () => document.body,
        on(name, handler) { (window.handlers[name] ||= []).push(handler); },
        off(name, handler) { window.handlers[name] = window.handlers[name].filter(value => value !== handler); },
      } };
      window.openCode = (language = '', disabled = false, otherDialog = false, existingList = false, readOnly = false) => {
        document.querySelector('.tox-dialog')?.remove();
        const dialog = document.createElement('form');
        dialog.className = 'tox-dialog';
        dialog.innerHTML = '<div class="tox-form__group"><label for="language">Language</label><input class="tox-textfield" id="language"></div><textarea class="tox-textarea"></textarea><button type="submit">OK</button><button type="button" id="cancel">Cancel</button>';
        const input = dialog.querySelector('input');
        const textarea = dialog.querySelector('textarea');
        input.value = language; input.disabled = disabled; input.readOnly = readOnly;
        if (existingList) input.setAttribute('list', 'another-plugin');
        textarea.value = '10 PRINT "<>& £ λ"\n20 END\n';
        window.data = otherDialog ? { url: language } : { languageInput: language, codeTextArea: textarea.value };
        input.addEventListener('input', () => window.data.languageInput = input.value);
        dialog.addEventListener('keydown', event => {
          if (event.key === 'Enter' && event.target === input) { event.preventDefault(); dialog.requestSubmit(); }
        });
        dialog.addEventListener('keyup', event => {
          if (event.key === 'Escape') dialog.remove();
        });
        dialog.addEventListener('submit', event => { event.preventDefault(); window.saved = { ...window.data }; dialog.remove(); });
        dialog.querySelector('#cancel').onclick = () => dialog.remove();
        document.body.append(dialog);
        window.dialogApi = {
          getData: () => ({ ...window.data }),
          setData(data) { Object.assign(window.data, data); input.value = window.data.languageInput; },
        };
        input.focus();
        for (const handler of window.handlers.OpenWindow || []) handler({ dialog: window.dialogApi });
      };
    });
    const frame = page.frames().find(frame => frame !== page.mainFrame());
    await frame.addScriptTag({ path: 'dist/viewer.js' });
    await frame.addScriptTag({ path: 'dist/viewer.js' });
    await frame.evaluate(() => new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    assert.equal(await page.evaluate(() => window.handlers.OpenWindow), undefined);
    await page.evaluate(() => window.tinymce = window.readyTinyMce);
    await frame.locator('body').dispatchEvent('focusin');
    assert.equal(await page.evaluate(() => window.handlers.OpenWindow.length), 1);
    await page.evaluate(() => window.openCode());
    const input = page.getByRole('combobox', { name: 'Language', exact: true });
    const list = page.getByRole('listbox', { name: 'Languages' });
    assert.equal(await list.isVisible(), false);
    assert.equal(await input.getAttribute('aria-expanded'), 'false');
    await page.locator('textarea').focus();
    await input.focus();
    assert.equal(await list.isVisible(), false);
    await input.pressSequentially('pyt');
    assert.equal(await input.inputValue(), 'python');
    assert.deepEqual(await input.evaluate(node => [node.selectionStart, node.selectionEnd]), [3, 6]);
    assert.equal(await list.isVisible(), false);
    assert.equal(await page.evaluate(() => window.data.languageInput), 'python');
    await page.keyboard.press('Enter');
    assert.equal(await page.evaluate(() => window.saved), undefined);
    assert.deepEqual(await input.evaluate(node => [node.selectionStart, node.selectionEnd]), [6, 6]);
    await input.fill('');
    await input.pressSequentially('pyt');
    await page.keyboard.press('Backspace');
    assert.equal(await input.inputValue(), 'pyt');
    await page.keyboard.press('Backspace');
    assert.equal(await input.inputValue(), 'py');
    await input.pressSequentially('t');
    await page.keyboard.press('Escape');
    assert.equal(await input.inputValue(), 'pyt');
    assert.equal(await page.evaluate(() => window.data.languageInput), 'pyt');
    assert.equal(await list.isVisible(), false);
    await input.fill('');
    await input.pressSequentially('PYT');
    assert.equal(await input.inputValue(), 'PYThon');
    await page.keyboard.press('Escape');
    await input.fill('py');
    assert.equal(await input.inputValue(), 'py');
    assert.equal(await page.evaluate(() => window.data.languageInput), 'py');
    await input.fill('my-custom-language');
    assert.equal(await input.inputValue(), 'my-custom-language');
    assert.equal(await list.isVisible(), false);
    await input.fill('pt');
    await input.evaluate(node => node.setSelectionRange(1, 1));
    await input.pressSequentially('y');
    assert.equal(await input.inputValue(), 'pyt');
    assert.deepEqual(await input.evaluate(node => [node.selectionStart, node.selectionEnd]), [2, 2]);
    for (const inputType of ['insertFromPaste', 'insertCompositionText']) {
      await input.evaluate((node, inputType) => {
        node.value = 'pyt'; node.setSelectionRange(3, 3);
        node.dispatchEvent(new InputEvent('input', { bubbles: true, inputType, isComposing: inputType === 'insertCompositionText' }));
      }, inputType);
      assert.equal(await input.inputValue(), 'pyt');
      assert.equal(await list.isVisible(), false);
    }
    await page.getByRole('button', { name: 'Show language choices' }).click();
    assert.equal(await list.getByRole('option').count(), codeLanguages().length);
    await input.fill('BBC');
    assert.equal(await list.getByRole('option').first().textContent(), 'BBC BASIC (bbc-basic)');
    assert.equal(await list.getByRole('option').filter({ hasText: /^BBC BASIC \(/ }).count(), 1);
    await input.fill('py');
    assert.equal(await list.getByRole('option', { name: 'Python', exact: true }).count(), 1);
    await input.fill('c64-basic');
    assert.equal(await list.getByRole('option').count(), 1);
    await input.fill('Commodore');
    assert.equal(await list.isVisible(), true);
    assert.equal(await list.getByRole('option').count(), 1);
    assert.equal(await list.getByRole('option').filter({ hasText: 'Python' }).count(), 0);
    await page.keyboard.press('ArrowDown');
    assert.match(await input.getAttribute('aria-activedescendant'), /code-studio-languages-0$/);
    await page.keyboard.press('Enter');
    assert.equal(await input.inputValue(), 'commodore-basic');
    assert.equal(await list.isVisible(), false);
    assert.equal(await page.evaluate(() => window.saved), undefined);
    await page.getByRole('button', { name: 'Show language choices' }).click();
    await input.fill('Archimedes');
    await list.getByRole('option', { name: 'Archimedes BBC BASIC (archimedes-basic)', exact: true }).click();
    assert.equal(await input.inputValue(), 'archimedes-basic');
    await page.getByRole('button', { name: 'Show language choices' }).click();
    assert.equal(await list.getByRole('option').count(), codeLanguages().length);
    const bounds = await list.boundingBox();
    assert.ok(bounds.width <= 320 && bounds.height <= 245);
    const positions = await list.getByRole('option').evaluateAll(nodes => nodes.slice(0, 3).map(node => node.getBoundingClientRect().top));
    assert.ok(positions[1] > positions[0] && positions[2] > positions[1]);
    await page.keyboard.press('Escape');
    assert.equal(await list.isVisible(), false);
    assert.equal(await input.isVisible(), true);
    await page.getByRole('button', { name: 'Show language choices' }).click();
    await input.fill('my-custom-language');
    assert.equal(await list.getByRole('option').count(), 0);
    assert.match(await list.getByRole('status').textContent(), /typed label/);
    await page.keyboard.press('Tab');
    assert.equal(await list.isVisible(), false);
    await page.getByRole('button', { name: 'OK', exact: true }).click();
    assert.deepEqual(await page.evaluate(() => window.saved), { languageInput: 'my-custom-language', codeTextArea: '10 PRINT "<>& £ λ"\n20 END\n' });
    assert.equal(await page.locator('#note').textContent(), 'Unchanged note');
    await page.evaluate(() => { window.saved = undefined; window.openCode('bbc-basic'); });
    await input.fill('Dragon'); await page.keyboard.press('ArrowUp'); await page.keyboard.press('Enter');
    assert.ok((await input.inputValue()).startsWith('dragon'));
    await page.getByRole('button', { name: 'Cancel', exact: true }).click();
    assert.equal(await page.evaluate(() => window.saved), undefined);
    for (const args of [['katex', true], ['https://example.com', false, true], ['python', false, false, true], ['python', false, false, false, true]]) {
      await page.evaluate(args => window.openCode(...args), args);
      assert.equal(await page.locator('[data-cs-language-picker]').count(), 0);
      assert.equal(await page.locator('#language').inputValue(), args[0]);
    }
  } finally { await browser.close(); }
});
