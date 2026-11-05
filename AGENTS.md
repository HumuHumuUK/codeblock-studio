# Code Block Studio

This is a Joplin Desktop plugin, written in TypeScript and bundled with esbuild.

- Keep the display name **Code Block Studio** and the existing plugin ID `local.lpowers.code-studio`. The ID and preference keys preserve installed settings across upgrades.
- Runtime source is in `src/`; `api/` contains Joplin's supplied API declarations and shim. Preserve its licence.
- Formatters, fonts and highlighting must work locally. Do not execute note snippets or add network calls.
- Applying formatting must target one code block, show a preview and retain native editor Undo. Markdown preview and Rich Text use different application paths.
- Read `docs/ARCHITECTURE.md` before changing the editor or renderer integration.
- Use `npm ci`, `npm run typecheck`, `npm run build`, then `npm test` for a clean validation. Browser tests expect `/usr/bin/chromium`.
- Generated files are in `dist/` and `publish/`; edit the source instead. Keep dependency licences in packaged installers.
- `archive/` contains local research, note snapshots and installation backups. It must remain outside Git, release archives and public documentation excerpts.
- Update `CHANGELOG.md`, `VALIDATION.md` and the relevant documentation when behavior changes. Keep version fields in the manifest, package and lockfile consistent.
