# Change history

## 1.7.5 — 6 November 2026 (npm release)

- Prepared the first npm/Joplin catalogue package with the reviewed description and README write-up, plus six screenshots covering code cards, formatting, retro displays, BBC modes, language search and wrapping.
- Published the reviewed package on npm and verified the downloaded tarball against the preserved original. Joplin catalogue ingestion is a separate, pending step.
- Set the minimum Joplin Desktop version to 3.7.22, matching the Linux development checks, and retained the existing plugin ID and settings. Windows/macOS remain unverified; mobile is unsupported.
- Kept the 1.7.4 release files unchanged. Plugin runtime behaviour is unchanged from 1.7.4.

## Unreleased

- Set the public preparation checkout's Git email to the existing GitHub noreply address so public commits do not inherit the private development email.
- Added a manual public-source preparation command that exports committed development files into a fresh public checkout for review, preserving separate histories and leaving publication manual.
- Included an importable Markdown test note beside the installer and in its checksums, with all retro screen families enabled and examples for every supported formatter language/dialect.
- Reorganised the 77-example note with main programming languages first, then web, data/configuration and SQL, followed by the retro computers and BBC display modes. Added readable headings, section links and updated test instructions.

## 1.7.4 — 6 November 2026 (public preview)

- Published matching Gitea and GitHub prereleases with the installer, metadata, 77-example Markdown note, reviewed source ZIP and checksums. The release preserves the validated build bytes; Joplin catalogue publication remains on hold.
- Removed the extra blank top row and leading black rule from the BBC Mode 6 blue/red screens. Black gaps now span the full width, with eight parts coloured paper to two parts black gap, in code cards and both formatting comparison panes.

## 1.7.3 — 6 November 2026 (local candidate)

- Fixed Retro display using stale settings after saving a language change in the Rich Text code editor. Toggling now reads the current source language and fence settings, so it cannot restore the previous language or act on an outdated tick state.
- Refresh the outer screen style after Joplin updates a block. Format also reads the current source settings, keeping its comparison in the correct language and retro display.

## 1.7.2 — 6 November 2026 (local candidate)

- Removed repeated language choices caused by showing aliases as separate rows. The catalogue now has 240 named choices covering the same 440 accepted language spellings; Python/py, JavaScript/js and the retro short names remain searchable in one row per language.
- Consolidated Commodore 64 and Dragon 32/64 synonym rows. Kept distinct formats/dialects such as JSON/JSONC/JSON5, JSX/TSX, HTML/XML/XHTML/SVG, Bash/POSIX/Zsh, shell sessions and BASIC versions separately labelled.
- Preserved direct typed aliases, closed-field completion, custom labels and the existing dropdown keyboard behaviour. Choosing a row uses its primary language label; existing note fences are not rewritten by the catalogue cleanup.

## 1.7.1 — 6 November 2026 (local candidate)

- Kept the language dropdown closed when opening the code editor or focusing the Language field. Click the arrow to browse, with arrow-key access retained.
- Added completion inside the closed field while typing language prefixes. Suggested endings are selected; Enter accepts, Escape restores the typed prefix, and Backspace/Delete remain usable. Custom labels and filtering an explicitly opened list remain supported.

## 1.7.0 — 6 November 2026 (local candidate)

- Made the Language field in Joplin’s Rich Text code-block editing window a searchable dropdown, with suggestions from the bundled highlighting and formatter languages, aliases and retro computer names. Custom typed labels remain supported.
- Added mouse selection, arrow-key navigation, Enter to accept a suggestion and Escape to dismiss it. Joplin retains its existing code field, OK/Cancel controls and save path; Markdown typing is unchanged.
- Generated the suggestion catalogue at build time from the renderer’s existing language data, keeping it local without adding a runtime dependency. Disabled/read-only fields, unrelated dialogs and existing language pickers are left alone.

## 1.6.0 — 6 November 2026 (local candidate)

- Added Macintosh Microsoft BASIC/QuickBASIC, Atari ST STOS/GFA, MSX, ZX81, Dragon 32/64, Archimedes BBC BASIC V/VI and Oric Atmos labels, local fonts and documented screen palettes. Macintosh uses Monaco for code and Chicago for its caption; Dragon retains inverse-uppercase lowercase rendering.
- Added saved BBC mode presets for Modes 0–7, with narrow/wide bitmap proportions and blue/red Mode 6 screens with black inter-row gaps. Mode 7 remains the default for existing blocks. Unticking Retro display retains the selected mode; native Undo restores changes.
- Both formatting comparison panes use the selected BBC mode. Added samples for every new dialect/system and BBC preset to the importable Markdown note.
- Retained original font downloads and licences alongside five clearly named CC BY-SA geometry/spacing variants; missing Oric glyphs fall back visibly instead of disappearing. No system fonts or runtime downloads are needed.

## 1.5.0 — 6 November 2026 (local candidate)

- Added a Retro display checkbox to machine-specific BASIC code blocks, saving the choice with each block and retaining native editor Undo. Unticking restores ordinary highlighting without changing the code.
- Bundled unchanged fonts for C64, BBC Micro Mode 7, ZX Spectrum, Amstrad CPC, Apple II, IBM VGA, Atari 8-bit and Amiga Topaz, with familiar screen colours and a C64 border. Fonts, upstream attribution and licences remain available offline.
- Both formatting comparison panes follow the selected retro screen while retaining change marks and linked scrolling. Copy and Apply continue to use raw code.
- Added short fence aliases including `c64`, `bbc`, `spectrum` and `amstrad`, plus checks for saved flags, quoted filenames, exact metadata-only edits, read-only notes, font loading, palettes and Undo/Redo.

## 1.4.0 — 5 November 2026 (publication candidate)

- Added offline formatting for PowerShell 7, Lua, Dart, Rust 2021, Dockerfile and Terraform/OpenTofu/HCL, plus Oracle PL/SQL, Snowflake, DuckDB, Redshift, DB2 and Hive SQL dialects.
- Added conservative layout formatting for generic BASIC, BBC BASIC, Sinclair BASIC, Commodore BASIC V2, Locomotive BASIC, Applesoft, GW-BASIC, QBasic, Atari BASIC and AMOS. Program numbers, statement text, case, strings, comments, DATA and physical statement boundaries are preserved.
- Added local HCL syntax colouring, recognisable language labels, per-language examples and practical/retro formatting guidance. All languages retain the existing preview, Copy, Apply and editor Undo paths.
- Cached asynchronous formatter initialisation, checked PowerShell token/literal preservation, and included the new WASM engines, upstream notices and source locations in the installer.

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
