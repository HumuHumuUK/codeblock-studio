import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { execFileSync } from 'node:child_process';
import MarkdownIt from 'markdown-it';
import { chromium } from 'playwright';

const require = createRequire(import.meta.url);
const renderer = require('../dist/renderer.js').default;
const { bbcMode, bbcModes, hasRetro, isBbcMode, setBbcMode, setRetroInfo, retroMachine, retroFonts } = require('../dist/retro.js');
const { replaceFence } = require('../dist/replaceFence.js');
const { formatPreview } = require('../dist/formatPreview.js');
const { formatCode, setFormatterAssetLoader } = require('../dist/formatCode.js');
setFormatterAssetLoader(name => readFileSync(new URL(`../dist/${name}`, import.meta.url)));
const md = new MarkdownIt();
renderer({ contentScriptId: 'codeStudioRenderer' }).plugin(md);

const profiles = [
  ['c64', 'c64', 'CS C64', 'rgb(53, 40, 121)'],
  ['bbc-basic', 'bbc', 'CS BBC Mode 7', 'rgb(0, 0, 0)'],
  ['sinclair-basic', 'spectrum', 'CS Spectrum', 'rgb(215, 215, 215)'],
  ['locomotive-basic', 'cpc', 'CS CPC', 'rgb(0, 0, 128)'],
  ['applesoft', 'apple', 'CS Apple II', 'rgb(0, 0, 0)'],
  ['gwbasic', 'dos', 'CS DOS', 'rgb(0, 0, 0)'],
  ['qbasic', 'qbasic', 'CS DOS', 'rgb(0, 0, 128)'],
  ['atari-basic', 'atari', 'CS Atari', 'rgb(40, 90, 159)'],
  ['amos', 'amiga', 'CS Amiga', 'rgb(0, 85, 170)'],
  ['mac-basic', 'mac', 'CS Macintosh', 'rgb(255, 255, 255)'],
  ['stos', 'st', 'CS ST', 'rgb(0, 0, 0)'],
  ['msx-basic', 'msx', 'CS MSX', 'rgb(84, 85, 237)'],
  ['zx81-basic', 'zx81', 'CS ZX81', 'rgb(255, 255, 255)'],
  ['dragon-basic', 'dragon', 'CS Dragon', 'rgb(0, 255, 0)'],
  ['archimedes-basic', 'archimedes', 'CS Archimedes', 'rgb(0, 0, 0)'],
  ['oric-basic', 'oric', 'CS Oric', 'rgb(255, 255, 255)'],
];
const source = '10 FOR I=1 TO 3\n20 PRINT "HELLO";I\n30 NEXT I\n100 END\n';

test('the importable sample note enables every retro screen and all examples format without execution', async () => {
  const examples = md.parse(await readFile('examples/code-block-studio.md', 'utf8'), {}).filter(token => token.type === 'fence');
  const machines = new Set();
  for (const token of examples) {
    const language = token.info.split(/\s+/)[0];
    const formatted = await formatCode(token.content, language);
    assert.equal(typeof formatted, 'string', language);
    if (retroMachine(language)) {
      assert.equal(hasRetro(token.info), true, language);
      machines.add(retroMachine(language));
    }
  }
  assert.deepEqual([...machines].sort(), profiles.map(profile => profile[1]).sort());
  for (const language of ['javascript', 'jsx', 'typescript', 'tsx', 'json', 'jsonc', 'json5', 'html', 'css', 'scss', 'less', 'yaml', 'markdown']) {
    assert.ok(examples.some(token => token.info === language), language);
  }
  for (const mode of Object.keys(bbcModes)) assert.ok(examples.some(token => token.info.includes('retro-mode=' + mode)), mode);
  for (const language of ['mac-basic', 'mac-quickbasic', 'stos', 'gfa-basic', 'msx-basic', 'zx81-basic', 'dragon-basic', 'archimedes-basic', 'oric-basic']) {
    assert.ok(examples.some(token => token.info.startsWith(language + ' retro')), language);
  }
});

test('BBC mode metadata validates presets and preserves unrelated and quoted fields', () => {
  const info = 'bbc-basic title="retro-mode=6-red retro" custom="keep this"';
  assert.equal(bbcMode(info), '7');
  for (const mode of Object.keys(bbcModes)) {
    const changed = setBbcMode(setRetroInfo(info, true), mode);
    assert.equal(changed, info + ' retro retro-mode=' + mode);
    assert.equal(bbcMode(changed), mode);
    assert.equal(bbcMode(setRetroInfo(changed, false)), mode);
    assert.equal(setBbcMode(changed, '7'), info + ' retro retro-mode=7');
    const rendered = md.render('```' + changed + '\n' + source + '```');
    assert.ok(rendered.includes('data-cs-retro-mode="' + mode + '"'));
    assert.ok(formatPreview(source, source, 'bbc-basic', true, mode).includes('data-cs-retro-mode="' + mode + '"'));
  }
  for (const value of ['__proto__', '<script>', '8', '', null, 6]) assert.equal(isBbcMode(value), false);
  assert.throws(() => setBbcMode(info, 'invalid'), /Unknown BBC/);
  assert.equal(bbcMode('bbc-basic retro retro-mode=unsafe'), '7');
  assert.doesNotMatch(formatPreview(source, source, 'bbc-basic', false, '6-red'), /data-cs-retro-mode/);
});

test('retro controls follow explicit machine labels and aliases, preserving normal highlighting', async () => {
  for (const [canonical, aliases] of [
    ['c64', ['commodore-basic', 'c64-basic', 'C64']],
    ['bbc-basic', ['bbc', 'bbc-micro', 'bbcbasic']],
    ['sinclair-basic', ['spectrum', 'zx-spectrum']],
    ['locomotive-basic', ['amstrad', 'amstrad-cpc', 'cpc']],
    ['mac-basic', ['macintosh', 'mac-quickbasic']],
    ['stos', ['stos-basic', 'gfa-basic', 'gfa']],
    ['msx-basic', ['msx', 'msx2']],
    ['zx81-basic', ['zx81']],
    ['dragon-basic', ['dragon32', 'dragon64']],
    ['archimedes-basic', ['archimedes', 'bbc-basic-v', 'bbc-basic-vi']],
    ['oric-basic', ['oric', 'oric-atmos']],
  ]) {
    for (const language of [canonical, ...aliases]) {
      assert.equal(retroMachine(language), retroMachine(canonical));
      assert.equal(await formatCode(source, language), await formatCode(source, canonical));
      const html = md.render('```' + language + '\n' + source + '```');
      assert.match(html, /role="checkbox".*aria-checked="false"/);
      assert.match(html, /hljs-string/);
      assert.doesNotMatch(html, /data-cs-retro=/);
      assert.match(md.render('```' + language + ' retro\n' + source + '```'), /data-cs-retro=/);
    }
  }
  for (const language of ['basic', 'python', 'text', '', 'unknown', 'mermaid']) {
    assert.doesNotMatch(md.render('```' + language + ' retro\n' + source + '```'), /cs-retro-button|data-cs-retro=/);
    assert.doesNotMatch(formatPreview(source, source, language, true), /data-cs-retro=/);
  }
});

test('the saved flag does not consume quoted filenames or other fence settings', () => {
  for (const info of ['c64 title="my retro file.bas"', "bbc-basic title='retro'", 'c64 title="retro" custom="x y"']) {
    assert.equal(hasRetro(info), false);
    assert.equal(setRetroInfo(info, false), info);
    const enabled = setRetroInfo(info, true);
    assert.equal(hasRetro(enabled), true);
    assert.equal(setRetroInfo(enabled, true), enabled);
    assert.equal(setRetroInfo(enabled, false), info);
  }
  assert.equal(setRetroInfo('c64 retro title="retro" retro', false), 'c64 title="retro"');
});

test('saving Retro display changes only the selected opening fence, including nested and CRLF notes', () => {
  for (const [prefix, eol, marker] of [['', '\n', '```'], ['> ', '\r\n', '~~~~'], ['  ', '\n', '````']]) {
    const info = 'c64 title="my retro file.bas"';
    const listing = '10 PRINT "<>& £ λ"\n\n20 END\n';
    const fence = prefix + marker + info + eol + listing.split('\n').slice(0, -1).map(line => prefix + line + eol).join('') + prefix + marker + eol;
    const body = 'Before\n\n' + fence + '\nAfter\n\n' + fence;
    const target = { text: listing, language: 'c64', info, fenceIndex: 1 };
    const newInfo = setRetroInfo(info, true);
    const change = replaceFence(body, target, listing, newInfo);
    const updated = body.slice(0, change.from) + change.insert + body.slice(change.to);
    assert.equal(updated, body.slice(0, body.lastIndexOf(info)) + newInfo + body.slice(body.lastIndexOf(info) + info.length));
    const tokens = md.parse(updated, {}).filter(token => token.type === 'fence');
    assert.equal(tokens[1].content, listing);
    assert.equal(tokens[1].info, newInfo);
    assert.match(md.render(updated), /aria-checked="true"/);
    const undo = replaceFence(updated, { ...target, info: newInfo }, listing, info);
    assert.equal(updated.slice(0, undo.from) + undo.insert + updated.slice(undo.to), body);
    assert.throws(() => replaceFence(updated, target, listing, newInfo), /changed/);
    assert.throws(() => replaceFence(body, target, listing, info + '\n```\nunsafe'), /preserve/);
  }
});

test('both Markdown editor versions save fence settings through their normal edit transaction', () => {
  const editorPlugin = require('../dist/editor.js').default;
  const target = { text: source, language: 'c64', info: 'c64', fenceIndex: 0 };
  const body = '```c64\n' + source + '```\n';
  let command, dispatched, legacyChange;
  const view = { state: { doc: { toString: () => body } }, dispatch: change => dispatched = change };
  editorPlugin().plugin({ cm6: true, editor: view, registerCommand: (_, handler) => command = handler });
  assert.equal(command(target, source, 'c64 retro').ok, true);
  assert.deepEqual(dispatched.changes, { from: 0, to: 6, insert: '```c64 retro' });
  view.state.readOnly = true;
  assert.throws(() => command(target, source, 'c64 retro'), /read-only/);
  editorPlugin().plugin({ defineExtension: (_, handler) => command = handler });
  const legacy = { getValue: () => body, getOption: () => false, posFromIndex: index => index,
    replaceRange: (...args) => legacyChange = args };
  assert.equal(command.call(legacy, target, source, 'c64 retro').ok, true);
  assert.deepEqual(legacyChange, ['```c64 retro', 0, 6, '+codeStudioFormat']);
  assert.throws(() => command.call({ ...legacy, getOption: () => true }, target, source, 'c64 retro'), /read-only/);
});

test('every retro font loads locally and cards and comparison panes share the same palette', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 760 } });
    const requests = [];
    await page.route('https://code-studio.test/**', async route => {
      const filename = new URL(route.request().url()).pathname.slice(1);
      requests.push(filename);
      await route.fulfill({ body: await readFile('dist/' + filename), contentType: filename.endsWith('.css') ? 'text/css' : 'application/octet-stream' });
    });
    const styles = '<base href="https://code-studio.test/"><link rel="stylesheet" href="code-studio.css"><link rel="stylesheet" href="formatDialog.css"><link rel="stylesheet" href="retro.css">';
    const modes = Object.keys(bbcModes).map(mode => ['bbc-basic', 'bbc', ['0', '3'].includes(mode) ? 'CS BBC Narrow' : ['2', '5'].includes(mode) ? 'CS BBC Wide' : mode === '7' ? 'CS BBC Mode 7' : 'CS BBC Bitmap', mode === '6-red' ? 'rgb(255, 0, 0)' : mode === '6-blue' ? 'rgb(0, 0, 255)' : 'rgb(0, 0, 0)', mode]);
    const widths = {};
    for (const [language, machine, family, background, mode] of [...profiles, ...modes]) {
      await page.setContent(styles + md.render('```' + language + ' retro' + (mode ? ' retro-mode=' + mode : '') + '\n' + source + '```') + formatPreview(source, ' 10 FOR I=1 TO 3\n 20   PRINT "HELLO";I\n 30 NEXT I\n100 END\n', language, true, mode));
      await page.evaluate(() => document.fonts.ready);
      assert.equal(await page.locator('.cs-card').getAttribute('data-cs-retro'), machine);
      for (const selector of ['.cs-code', '.cs-format-column pre']) {
        const appearance = await page.locator(selector).evaluateAll(nodes => nodes.map(node => {
          const style = getComputedStyle(node);
          return { background: style.backgroundColor, font: style.fontFamily, loaded: document.fonts.check('16px ' + style.fontFamily.split(',')[0]) };
        }));
        for (const style of appearance) {
          assert.equal(style.background, background, language);
          assert.ok(style.font.includes(family), language);
          assert.equal(style.loaded, true, language);
        }
      }
      const ink = await page.locator('.cs-code').evaluate(node => getComputedStyle(node).color);
      for (const colour of await page.locator('.cs-line-text span').evaluateAll(nodes => nodes.map(node => getComputedStyle(node).color))) assert.equal(colour, ink);
      assert.equal(await page.locator('.joplin-source').textContent(), source);
      assert.ok(await page.locator('.cs-diff-formatted mark').count() > 0);
      if (mode) widths[mode] = await page.locator('.cs-code').evaluate(node => {
        const style = getComputedStyle(node), canvas = document.createElement('canvas');
        const context = canvas.getContext('2d'); context.font = style.fontSize + ' ' + style.fontFamily;
        return context.measureText('MMMMMMMM').width;
      });
    }
    assert.equal(widths['1'], widths['0'] * 2);
    assert.equal(widths['2'], widths['1'] * 2);
    for (const font of retroFonts) assert.ok(requests.includes('retro-fonts/' + font), font);
    const assets = renderer({}).assets().map(asset => asset.name);
    const entries = execFileSync('tar', ['-tf', 'publish/local.lpowers.code-studio.jpl'], { encoding: 'utf8' }).split('\n');
    for (const name of ['retro.css', ...retroFonts.map(font => 'retro-fonts/' + font)]) {
      assert.ok(assets.includes(name), name);
      assert.ok(entries.includes(name), name);
    }
    for (const name of ['KREATIVE-FreeLicense.txt', 'BEDSTEAD-COPYING.txt', 'CPC464-LICENCE.txt', 'IBM-VGA-LICENSE.txt', 'amiga-topaz/license.txt', 'README.md']) assert.ok(entries.includes('retro-fonts/' + name), name);
    // A narrow toolbar must still expose the full checkbox label and every action.
    await page.setViewportSize({ width: 320, height: 760 });
    assert.equal(await page.getByRole('checkbox', { name: 'Retro display' }).isVisible(), true);
    assert.equal(await page.locator('.cs-toolbar').evaluate(node => node.scrollWidth <= node.clientWidth), true);
  } finally { await browser.close(); }
});

test('BBC Mode 6 starts with text and has full-width 8:2 paper/gap bands in cards and both comparison panes', async () => {
  const browser = await chromium.launch({ executablePath: '/usr/bin/chromium', headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1100, height: 700 } });
    await page.route('https://code-studio.test/**', async route => {
      const filename = new URL(route.request().url()).pathname.slice(1);
      await route.fulfill({ body: await readFile('dist/' + filename), contentType: filename.endsWith('.css') ? 'text/css' : 'application/octet-stream' });
    });
    const styles = '<base href="https://code-studio.test/"><link rel="stylesheet" href="code-studio.css"><link rel="stylesheet" href="formatDialog.css"><link rel="stylesheet" href="retro.css">';
    const listing = Array.from({ length: 12 }, (_, index) => `${index + 1} PRINT "HELLO"`).join('\n') + '\n';
    for (const mode of ['6-blue', '6-red']) for (const size of [16, 24]) for (const comparison of [false, true]) {
      const html = comparison ? formatPreview(listing, listing, 'bbc-basic', true, mode)
        : md.render('```bbc-basic retro retro-mode=' + mode + '\n' + listing + '```');
      await page.setContent(styles + html);
      await page.addStyleTag({ content: `[data-cs-retro] { --cs-font-size:${size}px !important; } .cs-card { margin:0; } .cs-format-preview { line-height:20px; } .cs-code, .cs-format-column pre { flex:none; height:100px; }` });
      await page.evaluate(() => document.fonts.ready);
      const panes = page.locator(comparison ? '.cs-format-column pre' : '.cs-code');
      for (const pane of await panes.all()) {
        const firstRow = pane.locator(comparison ? '.cs-diff-line' : '.cs-line').first();
        assert.equal((await firstRow.boundingBox()).y, (await pane.boundingBox()).y, 'No blank row or border above the first text row');
        for (const scrollTop of [0, 7]) {
          await pane.evaluate((node, value) => node.scrollTop = value, scrollTop);
          const png = await pane.screenshot();
          const pixels = await page.evaluate(async base64 => {
            const image = new Image(); image.src = 'data:image/png;base64,' + base64; await image.decode();
            const canvas = document.createElement('canvas'); canvas.width = image.width; canvas.height = image.height;
            const context = canvas.getContext('2d'); context.drawImage(image, 0, 0);
            return [1, image.width - 24].map(x => Array.from({ length: 60 }, (_, y) => Array.from(context.getImageData(x, y, 1, 1).data).slice(0, 3).join(',')));
          }, png.toString('base64'));
          const pitch = size * 1.25;
          const paper = mode === '6-blue' ? '0,0,255' : '255,0,0';
          for (const column of pixels) for (const [y, colour] of column.entries()) {
            assert.equal(colour, (y + scrollTop) % pitch < size ? paper : '0,0,0', `${mode}, ${size}px, comparison=${comparison}, scroll=${scrollTop}, y=${y}`);
          }
        }
      }
      if (!comparison) assert.equal(await page.locator('.joplin-source').textContent(), listing);
    }
  } finally { await browser.close(); }
});
