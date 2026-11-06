import { execFileSync } from 'node:child_process';
import { cpSync, lstatSync, mkdirSync, mkdtempSync, readdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';

const git = (args, cwd = process.cwd()) => execFileSync('git', args, {
  cwd, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'],
}).trim();

try {
  const root = git(['rev-parse', '--show-toplevel']);
  const origin = git(['remote', 'get-url', 'origin'], root);
  const publicRemote = origin.replace(/([/:])codeblock-studio(\.git)?$/, '$1codeblock-studio-public$2');
  if (publicRemote === origin) throw new Error('Run this from the private codeblock-studio checkout with its Gitea origin.');

  git(['fetch', '--quiet', '--no-tags', 'origin', 'main'], root);
  const source = git(['rev-parse', 'FETCH_HEAD'], root);
  const work = join(root, 'work');
  mkdirSync(work, { recursive: true });
  const review = mkdtempSync(join(work, 'public-update-'));
  const exported = join(review, 'export');
  const archive = join(review, 'source.tar');
  const checkout = join(review, 'public');
  mkdirSync(exported);
  git(['archive', '--format=tar', `--output=${archive}`, source], root);
  execFileSync('tar', ['-xf', archive, '-C', exported]);
  for (const name of ['.git', 'archive', 'releases', 'work', 'VALIDATION.md', 'docs/PROJECT.md', 'docs/RESEARCH.md', 'code-studio-preview.png']) {
    const path = join(exported, name);
    const entry = lstatSync(path, { throwIfNoEntry: false });
    if (entry?.isDirectory() && readdirSync(path).length === 0) {
      rmSync(path, { recursive: true });
    } else if (entry) {
      throw new Error(`Refusing to prepare public files containing ${name}; check the committed export exclusions.`);
    }
  }

  // Clone only public history; never copy the private checkout's Git directory.
  git(['clone', '--quiet', '--no-local', '--single-branch', '--branch', 'main', '--', publicRemote, checkout], root);
  const privateRoots = new Set(git(['rev-list', '--max-parents=0', source], root).split('\n'));
  if (git(['rev-list', '--max-parents=0', 'HEAD'], checkout).split('\n').some(commit => privateRoots.has(commit))) {
    throw new Error('The public repository shares private history; review the repositories before publishing.');
  }
  for (const name of readdirSync(checkout)) {
    if (name !== '.git') rmSync(join(checkout, name), { recursive: true, force: true });
  }
  cpSync(exported, checkout, { recursive: true, verbatimSymlinks: true });
  git(['add', '-A'], checkout);
  rmSync(exported, { recursive: true });
  rmSync(archive);
  console.log(`Committed Gitea source: ${source}`);
  console.log(`Public review checkout: ${checkout}`);
  console.log(git(['diff', '--cached', '--stat'], checkout) || 'No public file changes.');
  console.log('Review git diff --cached in that checkout, then commit, validate and push origin main.');
  console.log('Finally, use Synchronize Now on the public Gitea repository to update GitHub.');
  console.log('No commits, pushes, tags or mirror synchronisations were performed.');
} catch (error) {
  console.error(error.stderr?.toString().trim() || error.message);
  process.exitCode = 1;
}
