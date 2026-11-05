import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import MarkdownIt from 'markdown-it';
import { languageFixtures } from './language-fixtures.mjs';
const require = createRequire(import.meta.url);
const childProcess = require('node:child_process');
const { formatCode, setFormatterAssetLoader } = require('../dist/formatCode.js');
const { default: renderer, escapeHtml } = require('../dist/renderer.js');
const loads = new Map();
setFormatterAssetLoader(name => {
  loads.set(name, (loads.get(name) || 0) + 1);
  return readFileSync(new URL(`../dist/${name}`, import.meta.url));
});
const retro = ['basic', 'bbc-basic', 'sinclair-basic', 'commodore-basic', 'locomotive-basic', 'applesoft', 'gwbasic', 'qbasic', 'atari-basic', 'amos'];
const statements = code => code.split('\n').map(line => line.replace(/^[ \t]*(\d+)[ \t]*/, '$1:').replace(/^[ \t]+/, ''));

test('new engines load only packaged assets, including concurrent first use', async () => {
  const fetch = globalThis.fetch;
  const processMethods = ['exec', 'execSync', 'execFile', 'execFileSync', 'spawn', 'spawnSync', 'fork'];
  const originals = new Map(processMethods.map(name => [name, childProcess[name]]));
  globalThis.fetch = () => { throw new Error('Unexpected network access'); };
  for (const name of processMethods) childProcess[name] = () => { throw new Error('Unexpected external process'); };
  try {
    for (const language of ['lua', 'dart', 'rust', 'dockerfile', 'terraform', 'hcl', 'powershell']) {
      const source = languageFixtures.find(fixture => fixture[0] === language)[1];
      const [first, second] = await Promise.all([formatCode(source, language), formatCode(source, language)]);
      assert.equal(first, second, language);
    }
    for (const name of ['lua_fmt_bg.wasm', 'dart_fmt.wasm', 'rust_fmt.wasm', 'dockerfile.wasm', 'terraform.wasm']) assert.equal(loads.get(name), 1, name);
  } finally {
    globalThis.fetch = fetch;
    for (const [name, method] of originals) childProcess[name] = method;
  }
});

test('failed asset initialisation can be retried', async () => {
  setFormatterAssetLoader(() => { throw new Error('Temporary missing asset'); });
  await assert.rejects(formatCode('package example\n', 'go'), /Temporary missing asset/);
  setFormatterAssetLoader(name => readFileSync(new URL(`../dist/${name}`, import.meta.url)));
  assert.equal(await formatCode('package example\n', 'go'), 'package example\n');
});

test('retro formatting preserves every source line, number, statement, string and comment', async () => {
  const source = '10 REM " : FOR fake=1 TO 9\n20 FOR I=1 TO 3\n30 PRINT "NEXT:  DATA  ";I\n40 DATA FOR, NEXT, "A:  B", O\'Brien\n50 IF I=2 THEN PRINT "a":PRINT "b"\n60 NEXT I\n100 END\n';
  for (const language of retro) {
    const formatted = await formatCode(source, language);
    assert.deepEqual(statements(formatted), statements(source), language);
    assert.match(formatted, /^ 30   PRINT "NEXT:  DATA  ";I$/m, language);
    assert.equal(await formatCode(formatted, language), formatted);
  }
});

test('BASIC indentation recognises loop boundaries without changing inline statements', async () => {
  const source = '10 FOR I=1 TO 2:FOR J=1 TO 2\n20 PRINT I;J\n30 NEXT J,I\n40 FOR K=1 TO 2:PRINT K:NEXT K\n50 PRINT "outside"';
  assert.equal(await formatCode(source, 'commodore-basic'), '10 FOR I=1 TO 2:FOR J=1 TO 2\n20     PRINT I;J\n30 NEXT J,I\n40 FOR K=1 TO 2:PRINT K:NEXT K\n50 PRINT "outside"');
  const qbasic = "IF ready THEN\nPRINT \"ELSE: END IF\" ' NEXT: FOR fake=1 TO 9\nELSE\nPRINT \"No\"\nEND IF\n";
  assert.equal(await formatCode(qbasic, 'qbasic'), "IF ready THEN\n  PRINT \"ELSE: END IF\" ' NEXT: FOR fake=1 TO 9\nELSE\n  PRINT \"No\"\nEND IF\n");
  assert.equal(await formatCode('10 IF ready THEN\n20 PRINT "unchanged scope"\n', 'sinclair-basic'), '10 IF ready THEN\n20 PRINT "unchanged scope"\n');
  assert.equal(await formatCode('10 IF ready THEN REM FOR I=1 TO 3:NEXT:FOR J=1 TO 9\n20 PRINT "outside"\n', 'commodore-basic'), '10 IF ready THEN REM FOR I=1 TO 3:NEXT:FOR J=1 TO 9\n20 PRINT "outside"\n');
  const bbc = '10 REPEAT\n20 CamelCase%=CamelCase%+1\n30 UNTIL CamelCase%=3\n';
  assert.equal(await formatCode(bbc, 'bbc-basic'), '10 REPEAT\n20   CamelCase%=CamelCase%+1\n30 UNTIL CamelCase%=3\n');
});

test('BASIC handles large blank listings and bounds generated output', async () => {
  const blank = '\n'.repeat(160000);
  assert.equal(await formatCode(blank, 'basic'), blank);
  await assert.rejects(formatCode('FOR I=1 TO 9\n'.repeat(1000) + 'PRINT "x"\n'.repeat(20000), 'qbasic'), /exceed/);
  await assert.rejects(formatCode('1'.repeat(100000) + ' PRINT 1\n' + '10 PRINT 2\n'.repeat(10), 'basic'), /exceed/);
});

test('PowerShell preserves literals, comments, aliases, cmdlets and hashtable order', async () => {
  const literal = "$text = @'\n  Keep  this $literal\n'@\n";
  const source = literal + '<# keep  comment\n across lines #>\n' + "$value='a  b'\n$items=@{z=1;a=2}\nWrite-Host $text\nls\n";
  const result = await formatCode(source, 'powershell');
  assert.ok(result.includes(literal));
  assert.ok(result.includes('<# keep  comment\n across lines #>'));
  assert.ok(result.includes("'a  b'"));
  assert.match(result, /Write-Host \$text/);
  assert.match(result, /^ls$/m);
  assert.ok(result.indexOf('z = 1') < result.indexOf('a = 2'));
  await assert.rejects(formatCode('function Broken {\n', 'powershell'), /changed a token/);
  await assert.rejects(formatCode('$text = "unfinished\n', 'powershell'));
  assert.equal(await formatCode('# keep comment\r\n$x=1\r\n', 'powershell'), '# keep comment\n$x = 1\n');
  assert.equal(await formatCode('$h = @{\nName = "Ada"\nCount = 3\n}\n', 'powershell'), '$h = @{ Name = "Ada"; Count = 3 }\n');
});

test('Dockerfile commands and HCL heredoc text remain literal', async () => {
  const docker = "FROM alpine\nRUN <<'EOF'\n  echo 'a  b'\nEOF\n";
  assert.equal(await formatCode(docker, 'dockerfile'), docker);
  const hcl = 'script = <<EOT\n  keep  this $literal\nEOT\n';
  assert.equal(await formatCode(hcl, 'hcl'), hcl);
});

test('syntax errors in new WASM engines fail and later valid requests still work', async () => {
  for (const [language, source] of [['lua', 'local ='], ['dart', 'void broken( {'], ['rust', 'fn broken('], ['terraform', 'locals { name =']]) {
    await assert.rejects(formatCode(source, language), undefined, language);
    const valid = languageFixtures.find(fixture => fixture[0] === language)[1];
    assert.ok((await formatCode(valid, language)).length > 0);
  }
});

test('new language cards offer Format, retain exact source and escape HCL heredocs', () => {
  const md = new MarkdownIt();
  renderer({ contentScriptId: 'test' }).plugin(md);
  for (const [language, source] of languageFixtures.slice(23)) {
    const html = md.render('```' + language + '\n' + source + '```\n');
    assert.match(html, /data-cs-action="format"/, language);
    assert.ok(html.includes(escapeHtml(source)), language);
  }
  const html = md.render('```terraform\ndescription = <<-EOT\n<script>alert("x")</script>\nEOT\n```\n');
  assert.match(html, /hljs-string/);
  assert.ok(!html.includes('<script>'));
  assert.match(html, /&lt;script&gt;/);
});

test('documentation includes a working example for every new formatter label', async () => {
  const md = new MarkdownIt();
  const examples = md.parse(readFileSync('examples/code-block-studio.md', 'utf8'), {}).filter(token => token.type === 'fence');
  for (const [language, source] of languageFixtures.slice(23)) {
    const example = examples.find(token => token.info.split(/\s/)[0] === language);
    assert.ok(example, language);
    assert.equal(example.content, source, language);
  }
});
