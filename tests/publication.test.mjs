import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';

test('catalogue metadata matches the installer and the package contains only intended public files', async () => {
  const pkg = JSON.parse(await readFile('package.json', 'utf8'));
  const manifest = JSON.parse(await readFile('src/manifest.json', 'utf8'));
  const info = JSON.parse(await readFile(`publish/${manifest.id}.json`, 'utf8'));
  const installer = `publish/${manifest.id}.jpl`;
  const hash = createHash('sha256').update(await readFile(installer)).digest('hex');
  assert.equal(info._publish_hash, `sha256:${hash}`);
  assert.equal(info.author, 'Leonard Powers');
  assert.equal(info.version, pkg.version);
  const { _publish_hash, _publish_commit, ...metadata } = info;
  assert.deepEqual(metadata, manifest);
  const credits = execFileSync('tar', ['-xOf', installer, 'CREDITS.md'], { encoding: 'utf8' });
  assert.match(credits, /Concept and design: Leonard Powers/);
  assert.match(credits, /Coding and implementation: Ada \(OpenAI Codex\)/);
  assert.match(execFileSync('tar', ['-xOf', installer, 'LICENSE'], { encoding: 'utf8' }), /Copyright \(c\) 2026 Leonard Powers/);
  const packed = JSON.parse(execFileSync('npm', ['pack', '--dry-run', '--json', '--ignore-scripts'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }))[0];
  const files = packed.files.map(file => file.path);
  assert.ok(pkg.name.startsWith('joplin-plugin-'));
  assert.ok(pkg.keywords.includes('joplin-plugin'));
  for (const name of [`publish/${manifest.id}.jpl`, `publish/${manifest.id}.json`, 'CREDITS.md', 'LICENSE', 'README.md']) assert.ok(files.includes(name), name);
  assert.equal(files.some(name => /^(src|api|node_modules|archive|work|releases|\.git)\//.test(name)), false);
  for (const screenshot of manifest.screenshots) {
    assert.ok(files.includes(screenshot.src), screenshot.src);
    const png = await readFile(screenshot.src);
    assert.equal(png.subarray(1, 4).toString(), 'PNG');
    assert.ok(png.readUInt32BE(16) >= 900);
    assert.ok(screenshot.label.length > 20);
  }
  for (const [size, filename] of Object.entries(manifest.icons)) {
    assert.ok(files.includes(filename), filename);
    const png = await readFile(filename);
    assert.equal(png.readUInt32BE(16), Number(size));
    assert.equal(png.readUInt32BE(20), Number(size));
  }
  const readme = await readFile('README.md', 'utf8');
  assert.doesNotMatch(readme, /192\.168\.\d+\.\d+|\/home\/[^/]+\/|ssh:\/\//);
});
