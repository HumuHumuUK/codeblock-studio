import test from 'node:test';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
const require = createRequire(import.meta.url);
const { formatCode, setFormatterAssetLoader } = require('../dist/formatCode.js');
setFormatterAssetLoader(name => readFileSync(new URL(`../dist/${name}`, import.meta.url)));
const { replaceFence } = require('../dist/replaceFence.js');

test('format supported languages locally and keep output valid', async () => {
  const cases = [
    ['javascript', 'function hello(name){return {name:name,items:[1,2,3]}}', /function hello\(name\) \{/],
    ['typescript', 'const answer:number=42;', /answer: number = 42/],
    ['json', '{"answer":42,"items":[1,2]}', /"answer": 42/],
    ['html', '<div> <span>hello</span> </div>', /<span>hello<\/span>/],
    ['css', 'a{color:red;margin:0}', /\n  color: red;\n/],
    ['yaml', 'items: [1,2,3]', /\[1, 2, 3\]/],
    ['markdown', '# Heading\n\n*   one\n*   two', /- one\n- two/],
  ];
  for (const [language, source, pattern] of cases) {
    const result = await formatCode(source, language);
    assert.match(result, pattern, language);
    assert.equal(await formatCode(result, language), result, `${language} is stable on repeated formatting`);
  }
  assert.deepEqual(JSON.parse(await formatCode('{"a":1,"b":[2,3]}', 'json')), { a: 1, b: [2, 3] });
});

test('invalid code and unsupported languages fail rather than rewriting source', async () => {
  await assert.rejects(formatCode('const = ;', 'javascript'));
  await assert.rejects(formatCode('echo hello', 'fish'), /not available/);
  await assert.rejects(formatCode('x'.repeat(500001), 'javascript'), /too large/);
});

test('replace only the chosen fence, retaining filenames and surrounding text', () => {
  const body = 'Before\n\n```js title="a.js"\nconst a=1;\n```\n\nBetween\n\n```js\nconst a=1;\n```\n\nAfter\n';
  const change = replaceFence(body, { text: 'const a=1;\n', language: 'js', info: 'js', fenceIndex: 1 }, 'const a = 1;\n');
  const updated = body.slice(0, change.from) + change.insert + body.slice(change.to);
  assert.equal(updated, body.replace('Between\n\n```js\nconst a=1;', 'Between\n\n```js\nconst a = 1;'));
});

test('preserve blockquote/list indentation, CRLF and fence boundaries', () => {
  for (const [body, info] of [
    ['> ```js\n> function x(){return 1}\n> ```\n', 'js'],
    ['- ```js\n  function x(){return 1}\n  ```\n', 'js'],
    ['   ```js\n   function x(){return 1}\n   ```\n', 'js'],
    ['```js\r\nfunction x(){return 1}\r\n```\r\n', 'js'],
  ]) {
    const result = replaceFence(body, { text: 'function x(){return 1}\n', language: 'js', info, fenceIndex: 0 }, 'function x() {\n  return 1;\n}\n');
    assert.match(result.insert, /  return 1;/);
    assert.equal(result.insert.includes('\r\n'), body.includes('\r\n'));
  }
  const change = replaceFence('```md\nold\n```\n', { text: 'old\n', language: 'md', info: 'md', fenceIndex: 0 }, '```js\nnew\n```\n');
  assert.match(change.insert, /^````md\n/);
  assert.match(change.insert, /\n````\n$/);
});

test('refuse stale targets and unclosed fences', () => {
  const target = { text: 'old\n', language: 'js', info: 'js', fenceIndex: 0 };
  assert.throws(() => replaceFence('```js\nnew\n```\n', target, 'formatted\n'), /changed/);
  assert.throws(() => replaceFence('```js\nold\n', target, 'formatted\n'), /Close/);
});
