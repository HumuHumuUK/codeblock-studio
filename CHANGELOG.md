# Change history

## 1.3.3 — 5 November 2026 (publication candidate)

- Moved formatting feedback, including “Already formatted” and errors, into the sticky toolbar directly below Format, Wrap and Copy so it stays visible on long code blocks.
- Kept Format clickable after feedback and allowed long messages to wrap within narrow note panes.
- Added optional Ko-fi support links in the README, package metadata and GitHub Sponsor configuration, and public GitHub source/homepage metadata.

## 1.3.2 — 5 November 2026 (publication candidate)

- Added catalogue descriptions, component screenshots, original icons and publication guidance; public submission remains on hold.
- Credited Leonard Powers for concept/design and Ada (OpenAI Codex) for coding/implementation under Leonard's direction. Updated the author name and copyright notice.
- Added the catalogue metadata JSON with installer hash, `dist` build alias, npm keyword and package file allowlist. Included the original licence and credits in the installer.
- Updated Markdown-it to 14.3.3 and esbuild to 0.28.1, and selected Lodash ES 4.18.1 through an override, to resolve the reported dependency advisories.

## 1.3.1 — 5 November 2026

- Moved toolbar mouse/click handling ahead of Rich Text selection handlers, and kept double-clicks on controls out of the source editor.
- Kept both comparison backgrounds black, with neutral original-side highlights and green additions only around edited text.
- Added visible changed spaces/tabs, added/removed line breaks, final-newline differences and hatched alignment gaps.
- Replaced the size-based positional comparison with whitespace-aware line anchors and jsdiff, keeping large reformatted blocks aligned as extra lines are inserted.

## 1.3.0 — 5 November 2026

- Linked vertical scrolling in the Original/Formatted preview: scrolling either pane moves both.
- Added aligned comparison rows, source line numbers, `−`/`+` change markers and stronger highlighting within changed lines, including whitespace.
- Kept Copy and Apply tied to the exact original/formatted code, without comparison padding or markup.
- Clarified how to download the actual installer from Gitea.

## 1.2.1 — 5 November 2026

- Renamed Code Studio to **Code Block Studio** in the plugin listing, settings, menu and future welcome notes.
- Updated the description, keywords and documentation.
- Retained the plugin ID and saved preferences. Existing notes are not rewritten by the rename.
- Collected the complete project with development documentation and release files.

## 1.2.0 — 5 November 2026

- Added local formatting for Python, Bash/POSIX shell, Go, C, C++, C#, Java, Objective-C and Protocol Buffers.
- Added SQL dialects, XML/SVG, TOML, PHP, GraphQL, Vue and Angular.
- Bundled the formatter engines and WebAssembly assets, with licence notices.

## 1.1.0 — 5 November 2026

- Added a Format button for supported, explicitly labelled code blocks.
- Added an Original/Formatted preview with Apply formatting, Copy formatted, Copy original and Cancel.
- Preserved native Undo in Markdown and Rich Text editors.
- Initially supported JavaScript/JSX, TypeScript/TSX, JSON/JSONC/JSON5, HTML, CSS/SCSS/Less, YAML and Markdown.

## 1.0.1 — 5 November 2026

- Kept the toolbar visible while scrolling within long code blocks.
- Retained static toolbar positioning for print.

## 1.0.0 — 4 November 2026

- Introduced dark code cards, syntax highlighting, line numbers and bundled JetBrains Mono.
- Added Copy, per-block wrapping, filenames and optional styling of inline snippets.
- Supported rendered code blocks in Markdown preview and the Rich Text editor.
