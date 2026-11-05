import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { languageFixtures } from './language-fixtures.mjs';
const require = createRequire(import.meta.url);
const { formatCode, setFormatterAssetLoader } = require('../dist/formatCode.js');
setFormatterAssetLoader(name => readFileSync(new URL(`../dist/${name}`, import.meta.url)));

for (const [language, source] of languageFixtures) {
  test(`${language}: bundled formatter produces stable output`, async () => {
    const result = await formatCode(source, language);
    assert.ok(result.length > 0);
    assert.equal(await formatCode(result, language), result);
    assert.ok(result.endsWith('\n'));
  });
}

test('Python uses four spaces and preserves comments, strings and f-string expressions', async () => {
  const source = '# keep this comment\ndef greet( name ):\n return f"Hello, {name!r}"\n';
  const result = await formatCode(source, 'python');
  assert.equal(result, '# keep this comment\ndef greet(name):\n    return f"Hello, {name!r}"\n');
});

test('shell formatting preserves quoted awk code and literal heredoc contents', async () => {
  const awk = "awk '\nfunction value(s) {\n  return s\n}\n{ print value($0) }\n'";
  const heredoc = "cat <<'EOF'\n  Keep  this spacing $literal\nEOF\n";
  const result = await formatCode(`#!/bin/bash\nif true;then\n${awk}\nfi\n${heredoc}`, 'bash');
  assert.ok(result.includes(awk));
  assert.ok(result.includes("  Keep  this spacing $literal\nEOF\n"));
  assert.ok(result.includes("'EOF'"));
});

test('Python and shell syntax errors cannot produce replacement code', async () => {
  await assert.rejects(formatCode('def broken(:\n pass\n', 'python'));
  await assert.rejects(formatCode('if true; then\n echo "broken"\n', 'bash'));
});

test('XML preserves whitespace-sensitive mixed content', async () => {
  const result = await formatCode('<p>Hello <b>world</b> !</p>', 'xml');
  assert.ok(result.includes('Hello <b>world</b> !'));
});
