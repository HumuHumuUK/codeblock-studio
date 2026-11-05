# Development

## Setup and checks

Run commands from the project root. Install Node.js and npm; the project migration was checked on this laptop with Node.js 26.13.0 and npm 11.20.0. The build uses the system `tar` command. Browser tests use Chromium at `/usr/bin/chromium`; change the executable path in `tests/viewer.test.mjs` when developing elsewhere.

```sh
npm ci
npm run typecheck
npm run build
npm test
```

`npm ci` installs the versions in `package-lock.json`. The build bundles the plugin into `dist/`, then writes `publish/local.lpowers.code-studio.jpl`, the matching catalogue metadata JSON and `publish/SHA256SUMS`. `npm run dist` is an alias for that build. Joplin does not need Node.js, Chromium or system language formatters installed separately to run the finished plugin.

The tests cover renderer behaviour, exact copying, wrapping, formatting, block targeting, Undo integration, catalogue metadata and distribution contents. Full historical desktop checks are kept separately from public source exports; passing browser tests alone does not establish that a new Joplin version works correctly. See [publication preparation](PUBLISHING.md) for the required live acceptance checks.

## Important dependency choices

- The WASM formatters receive packaged bytes through an explicit loader. Their browser entry points are used without runtime downloads.
- Prettier imports inside formatter plugins resolve to `prettier/standalone` during bundling. This keeps Node configuration-loading helpers out of the Joplin runtime bundle.
- TOML uses the pinned pure JavaScript plugin. Its parser and lexer share the pinned root Chevrotain version; do not replace this with a native addon without checking portability.
- Keep `vendor-licenses/`, bundled dependency notices and the font licence in release packages.
- The `lodash-es` override selects 4.18.1 to address security advisories while retaining the existing Chevrotain/TOML parser versions. Markdown-it 14.3.3 and esbuild 0.28.1 address their reported advisories. Recheck compatibility and the audit when changing these pins.
- Joplin declarations and the API shim are in `api/`, with their generator licence.

## Trying a new build

In Joplin Desktop, open **Tools → Options → Plugins**, use the gear menu to install from a file, select the generated `.jpl`, then restart Joplin. Use the normal UI to quit so pending note edits can be saved.

Keep the plugin ID `local.lpowers.code-studio` when upgrading an existing installation. Despite the historical filename, its display name is Code Block Studio. Renaming the ID would produce a separate plugin with separate preferences.

For a change to formatting or editor integration, check both Markdown preview and Rich Text. Verify Apply, Cancel, both Copy choices and native Undo. Compare the saved code and surrounding note content. Use disposable examples; do not replace user notes for testing.

## Releases

Public source and preview installers are hosted on GitHub. npm and Joplin catalogue publication remain on hold; see [publication preparation](PUBLISHING.md) for the remaining live checks and publication steps. Use `npm run screenshots` to regenerate the fictional-example component screenshots and original icons after a build; its assertions verify that the captured controls and source preservation work.

1. Keep the version consistent in `src/manifest.json`, `package.json` and the root package entry in `package-lock.json`.
2. Update the change history, documentation and validation results.
3. Run the checks above and the desktop checks appropriate to the change.
4. Copy the intended installer to `releases/vVERSION/`. Keep an already distributed installer unchanged; a rebuild can have a different archive hash because of timestamps.
5. Export source from the committed project using `git archive --format=zip --prefix=codeblock-studio/ HEAD`. Exclude release binaries from that source export so it contains only source and documentation.
6. Record SHA-256 checksums for the installer and source archive, and verify archive contents before distribution.

Generated dependencies, `dist/`, `publish/`, local work and `archive/` are excluded from Git. Only the current release files under `releases/` are intended for distribution.
