import { build } from 'esbuild';
import { mkdir, rm, copyFile, readFile, writeFile, readdir, cp } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { brotliDecompressSync } from 'node:zlib';
import { createRequire } from 'node:module';
const buildRequire = createRequire(import.meta.url);

await rm('dist', { recursive: true, force: true });
await mkdir('dist');
const runtime = await build({ entryPoints: ['src/index.ts', 'src/renderer.ts', 'src/editor.ts', 'src/formatCode.ts', 'src/replaceFence.ts', 'src/formatPreview.ts', 'src/retro.ts'], outdir: 'dist',
  bundle: true, platform: 'node', format: 'cjs', target: 'es2020', minify: true, keepNames: true, metafile: true,
  // Formatter plugins use Prettier's document builders. Resolve those imports
  // to the portable standalone build, keeping Node's config loader out.
  plugins: [{ name: 'standalone-prettier', setup(bundler) {
    bundler.onResolve({ filter: /^prettier$/ }, () => ({ path: buildRequire.resolve('prettier/standalone') }));
  } }],
  // Each WASM loader receives explicit bytes; its unused URL default is never called.
  logOverride: { 'empty-import-meta': 'silent' } });
await build({ entryPoints: ['src/viewer.ts', 'src/formatDialog.ts'], outdir: 'dist',
  bundle: true, platform: 'browser', format: 'iife', target: 'es2020', minify: true,
  define: { codeStudioLanguages: JSON.stringify(buildRequire('../dist/renderer.js').codeLanguages()) } });
for (const f of ['manifest.json', 'code-studio.css', 'formatDialog.css', 'retro.css']) await copyFile(`src/${f}`, `dist/${f}`);
await cp('assets/retro-fonts', 'dist/retro-fonts', { recursive: true });
for (const f of ['LICENSE', 'CREDITS.md']) await copyFile(f, `dist/${f}`);
await mkdir('dist/assets');
for (const size of [48, 128]) await copyFile(`assets/icon-${size}.png`, `dist/assets/icon-${size}.png`);
await copyFile('node_modules/@fontsource/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2', 'dist/jetbrains-mono.woff2');
await copyFile('node_modules/@fontsource/jetbrains-mono/LICENSE', 'dist/FONT-LICENSE.txt');
await copyFile('node_modules/highlight.js/LICENSE', 'dist/HIGHLIGHT-LICENSE.txt');
await copyFile('node_modules/prettier/LICENSE', 'dist/PRETTIER-LICENSE.txt');
await copyFile('node_modules/markdown-it/LICENSE', 'dist/MARKDOWN-IT-LICENSE.txt');
await copyFile('node_modules/prettier/THIRD-PARTY-NOTICES.md', 'dist/PRETTIER-NOTICES.md');
let dependencyLicenses = '';
for (const [name, filename] of [
  ['argparse', 'LICENSE'], ['entities', 'LICENSE'], ['linkify-it', 'LICENSE'],
  ['mdurl', 'LICENSE'], ['punycode.js', 'LICENSE-MIT.txt'], ['uc.micro', 'LICENSE.txt'],
]) {
  dependencyLicenses += `${name}\n${await readFile(`node_modules/${name}/${filename}`, 'utf8')}\n\n`;
}
await writeFile('dist/MARKDOWN-IT-DEPENDENCIES.txt', dependencyLicenses);
const wasmAssets = [
  ['@wasm-fmt/ruff_fmt/ruff_fmt_bg.wasm', 'ruff_fmt_bg.wasm'], ['@wasm-fmt/shfmt/shfmt.wasm', 'shfmt.wasm'],
  ['@wasm-fmt/gofmt/gofmt.wasm', 'gofmt.wasm'], ['@wasm-fmt/clang-format/clang-format.wasm', 'clang-format.wasm'],
  ['@wasm-fmt/lua_fmt/lua_fmt_bg.wasm', 'lua_fmt_bg.wasm'], ['@wasm-fmt/dart_fmt/dart_fmt.wasm', 'dart_fmt.wasm'],
  ['@dprint/dockerfile/plugin.wasm', 'dockerfile.wasm'], ['@dprint/terraform/plugin.wasm', 'terraform.wasm'],
  ['@scalar/rust-fmt/rust_fmt.wasm.br', 'rust_fmt.wasm'],
];
for (const [source, file] of wasmAssets) {
  const bytes = await readFile(`node_modules/${source}`);
  await writeFile(`dist/${file}`, source.endsWith('.br') ? brotliDecompressSync(bytes) : bytes);
}
const bundledPackages = new Set(Object.keys(runtime.metafile.inputs)
  .map(path => path.match(/^(.*node_modules\/(?:@[^/]+\/)?[^/]+)\//)?.[1]).filter(Boolean));
for (const name of ['@dprint/dockerfile', '@dprint/terraform']) bundledPackages.add(`node_modules/${name}`);
let allLicenses = '';
for (const directory of [...bundledPackages].sort()) {
  const pkg = JSON.parse(await readFile(`${directory}/package.json`, 'utf8'));
  allLicenses += `\n${pkg.name} ${pkg.version} (${pkg.license || 'See licence below'})\n`;
  for (const name of (await readdir(directory)).filter(name => /^(licen[cs]e|copying|notice|third.party)/i.test(name))) {
    try { allLicenses += `${name}\n${await readFile(`${directory}/${name}`, 'utf8')}\n`; } catch { /* directory */ }
  }
}
await writeFile('dist/BUNDLED-DEPENDENCY-LICENSES.txt', allLicenses);
await mkdir('dist/vendor-licenses');
for (const file of await readdir('vendor-licenses')) await copyFile(`vendor-licenses/${file}`, `dist/vendor-licenses/${file}`);
await cp('node_modules/@scalar/rust-fmt/licenses', 'dist/vendor-licenses/rust', { recursive: true });
const manifest = JSON.parse(await readFile('src/manifest.json', 'utf8'));
await mkdir('publish', { recursive: true });
const examples = await readFile('examples/code-block-studio.md');
await writeFile('publish/code-block-studio-examples.md', examples);
const archive = `publish/${manifest.id}.jpl`;
execFileSync('tar', ['--format=ustar', '-cf', archive, '-C', 'dist',
  'index.js', 'renderer.js', 'editor.js', 'viewer.js', 'formatDialog.js', 'manifest.json', 'code-studio.css', 'formatDialog.css',
  'jetbrains-mono.woff2', 'retro.css', 'retro-fonts', 'LICENSE', 'CREDITS.md', 'FONT-LICENSE.txt', 'HIGHLIGHT-LICENSE.txt', 'PRETTIER-LICENSE.txt', 'MARKDOWN-IT-LICENSE.txt', 'PRETTIER-NOTICES.md', 'MARKDOWN-IT-DEPENDENCIES.txt',
  'BUNDLED-DEPENDENCY-LICENSES.txt', 'vendor-licenses', 'assets', ...wasmAssets.map(([, file]) => file)]);
const hash = createHash('sha256').update(await readFile(archive)).digest('hex');
let publishCommit = '';
try {
  if (!execFileSync('git', ['status', '--porcelain'], { encoding: 'utf8' }).trim()) {
    const branch = execFileSync('git', ['rev-parse', '--abbrev-ref', 'HEAD'], { encoding: 'utf8' }).trim();
    const commit = execFileSync('git', ['rev-parse', 'HEAD'], { encoding: 'utf8' }).trim();
    publishCommit = `${branch}:${commit}`;
  }
} catch { /* Source exports have no Git metadata. */ }
const info = JSON.stringify({ ...manifest, _publish_hash: `sha256:${hash}`, _publish_commit: publishCommit }, null, 2) + '\n';
await writeFile(`publish/${manifest.id}.json`, info);
const infoHash = createHash('sha256').update(info).digest('hex');
const examplesHash = createHash('sha256').update(examples).digest('hex');
await writeFile('publish/SHA256SUMS', `${hash}  ${manifest.id}.jpl\n${infoHash}  ${manifest.id}.json\n${examplesHash}  code-block-studio-examples.md\n`);
console.log(`Built ${archive}`);
