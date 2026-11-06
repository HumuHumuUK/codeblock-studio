import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readlinkSync, rmSync, symlinkSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';

const script = fileURLToPath(new URL('../scripts/prepare-public.mjs', import.meta.url));
const git = (cwd, ...args) => execFileSync('git', args, {
  cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
  env: { ...process.env, GIT_AUTHOR_NAME: 'Publication test', GIT_AUTHOR_EMAIL: 'test@example.invalid',
    GIT_COMMITTER_NAME: 'Publication test', GIT_COMMITTER_EMAIL: 'test@example.invalid' },
}).trim();

function fixture(t, exclusions = true) {
  const root = mkdtempSync(join(tmpdir(), 'codeblock-public-test-'));
  t.after(() => rmSync(root, { recursive: true, force: true }));
  const source = join(root, 'development');
  const publicSource = join(root, 'public-source');
  const privateRemote = join(root, 'codeblock-studio.git');
  const publicRemote = join(root, 'codeblock-studio-public.git');
  mkdirSync(source);
  mkdirSync(publicSource);
  git(source, 'init', '--quiet', '--initial-branch=main');
  git(publicSource, 'init', '--quiet', '--initial-branch=main');
  writeFileSync(join(source, 'README.md'), 'Approved source\n');
  writeFileSync(join(source, 'new.txt'), 'New public file\n');
  symlinkSync('README.md', join(source, 'readme-link'));
  mkdirSync(join(source, 'archive'));
  writeFileSync(join(source, 'archive', 'private.txt'), 'Private evidence\n');
  writeFileSync(join(source, 'VALIDATION.md'), 'Local records\n');
  writeFileSync(join(source, '.gitignore'), 'work/\n');
  if (exclusions) writeFileSync(join(source, '.gitattributes'), '/archive/** export-ignore\n/VALIDATION.md export-ignore\n');
  git(source, 'add', '--force', '.');
  git(source, 'commit', '--quiet', '-m', 'Private development');
  git(root, 'clone', '--quiet', '--bare', source, privateRemote);
  git(source, 'remote', 'add', 'origin', privateRemote);
  writeFileSync(join(publicSource, 'README.md'), 'Previously public\n');
  writeFileSync(join(publicSource, 'removed.txt'), 'Old public file\n');
  git(publicSource, 'add', '.');
  git(publicSource, 'commit', '--quiet', '-m', 'Independent public history');
  git(root, 'clone', '--quiet', '--bare', publicSource, publicRemote);
  return { source, privateRemote, publicRemote };
}

test('public preparation stages committed files and deletions without transferring private history or pushing', t => {
  const { source, privateRemote, publicRemote } = fixture(t);
  const privateHead = git(privateRemote, 'rev-parse', 'main');
  const publicHead = git(publicRemote, 'rev-parse', 'main');
  writeFileSync(join(source, 'README.md'), 'Uncommitted work must stay local\n');
  writeFileSync(join(source, 'untracked.txt'), 'Untracked work must stay local\n');
  const output = execFileSync(process.execPath, [script], { cwd: source, encoding: 'utf8' });
  const checkout = output.match(/^Public review checkout: (.+)$/m)[1];
  assert.equal(readFileSync(join(checkout, 'README.md'), 'utf8'), 'Approved source\n');
  assert.equal(readFileSync(join(checkout, 'new.txt'), 'utf8'), 'New public file\n');
  assert.equal(readlinkSync(join(checkout, 'readme-link')), 'README.md');
  for (const name of ['archive', 'VALIDATION.md', 'removed.txt', 'untracked.txt']) assert.equal(existsSync(join(checkout, name)), false, name);
  assert.match(git(checkout, 'diff', '--cached', '--name-status'), /D\s+removed\.txt/);
  assert.match(git(checkout, 'diff', '--cached', '--name-status'), /A\s+new\.txt/);
  assert.equal(git(checkout, 'rev-parse', 'HEAD'), publicHead);
  assert.equal(git(checkout, 'remote', 'get-url', 'origin'), publicRemote);
  assert.notEqual(spawnSync('git', ['cat-file', '-e', privateHead], { cwd: checkout }).status, 0);
  assert.equal(git(privateRemote, 'rev-parse', 'main'), privateHead);
  assert.equal(git(publicRemote, 'rev-parse', 'main'), publicHead);
  assert.equal(readFileSync(join(source, 'README.md'), 'utf8'), 'Uncommitted work must stay local\n');
});

test('public preparation refuses committed private files when export exclusions are missing', t => {
  const { source, publicRemote } = fixture(t, false);
  const publicHead = git(publicRemote, 'rev-parse', 'main');
  const result = spawnSync(process.execPath, [script], { cwd: source, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /Refusing to prepare public files containing archive/);
  assert.equal(git(publicRemote, 'rev-parse', 'main'), publicHead);
});

test('public preparation refuses a public repository containing private history', t => {
  const { source, privateRemote, publicRemote } = fixture(t);
  rmSync(publicRemote, { recursive: true });
  git(source, 'clone', '--quiet', '--bare', privateRemote, publicRemote);
  const result = spawnSync(process.execPath, [script], { cwd: source, encoding: 'utf8' });
  assert.equal(result.status, 1);
  assert.match(result.stderr, /public repository shares private history/);
});
