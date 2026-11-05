# Architecture

## Components

| File | Responsibility |
| --- | --- |
| `src/index.ts` | Registers settings, content scripts, the welcome command, clipboard messages and the native formatting dialog. |
| `src/renderer.ts` | Styles supported Markdown fences, highlights code, adds controls and preserves Joplin round-trip metadata. |
| `src/viewer.ts` | Handles Copy, Wrap and Format in rendered notes, including Rich Text application and Undo behavior. |
| `src/editor.ts` | Registers the Markdown editor command that applies formatting through the active editor. |
| `src/replaceFence.ts` | Locates and validates the selected fence against the current document before replacing its code. |
| `src/formatLanguages.ts` | Maps explicit language labels and aliases to formatter engines. |
| `src/formatCode.ts` | Runs bundled formatters and loads their packaged WASM assets. |
| `src/formatBasic.ts` | Preserves retro BASIC statements while aligning line numbers and indenting recognised blocks. |
| `src/code-studio.css` | Dark cards, font, line numbers, wrapping, sticky toolbar and print styling. |
| `src/formatPreview.ts` | Builds the escaped, aligned Original/Formatted comparison and change highlights. |
| `src/formatDialog.ts` | Links vertical scrolling in both preview panes, including after reopening the dialog. |
| `src/formatDialog.css` | Comparison layout, line numbers, change colours and typography. |
| `scripts/build.mjs` | Bundles runtime code, copies assets and licences, and packages the Joplin installer. |

## Rendering and copying

The Markdown-it content script renders ordinary fenced code blocks as dark cards. Diagram fences are delegated to Joplin or their own plugins. Highlight.js supplies syntax colours; multiline highlight spans are split into balanced visual rows. The plugin bundles JetBrains Mono.

Line numbers and controls are presentation elements. The hidden `joplin-source` element retains the original code and the opening/closing fence metadata Joplin needs when converting Rich Text back to Markdown. Copy reads the source text and asks the plugin process to write it to Joplin's clipboard API.

The toolbar uses sticky positioning within the card. `overflow: clip` on the card allows it to remain visible while the note scrolls; print styling returns it to a static position. The live status element sits inside this non-editable toolbar. Formatting feedback appears on its own wrapping row below the controls, keeping “Already formatted” and errors visible on long blocks; empty feedback occupies no row. Print styling hides feedback.

## Formatting

Only an explicit supported language label enables Format. Automatic highlighting guesses do not select a formatter. Code is limited to 500,000 characters for this operation.

The viewer sends the original code, language, fence info and fence index to the plugin process. It formats locally and opens Joplin's native preview dialog. Cancel and the two Copy actions do not edit the note. Apply checks that the selected note has not changed, then uses the appropriate editor path.

The comparison uses whitespace-free line keys for alignment only, so changed indentation and interior spacing remain paired. Exact raw text determines character-level highlights using bundled jsdiff. Unique matching lines anchor the comparison before jsdiff aligns the intervening regions. Added/removed lines have hatched partner rows, keeping both panes the same height; vertical scroll events in either pane move the other. Horizontal scrolling remains independent. Both panes have neutral black backgrounds, with grey removed text and green added text. Changed spaces/tabs receive visible `·`/`→` overlays that retain their original widths; added/removed line breaks use `↵`, missing final line breaks use `∅`, and carriage returns use `␍`. The dialog script uses a single delegated listener that survives HTML replacement.

Common leading/trailing lines are aligned first. Line comparison has a shared 200 ms budget and a maximum edit distance of 4,000 within each gap between unique anchors. If a gap exhausts the budget, only that gap uses positional pairing; subsequent anchors remain aligned. Character highlighting has a separate shared 200 ms budget, with at most 20 ms and 2,000 edits per line; exhausted regions receive a broader highlight. All source lines, including their final newline state, are preserved. Copy/Apply use the raw strings rather than comparison markup, whitespace symbols or padding rows. The dialog script is packaged and loaded through Joplin's `dialogs.addScript` API.

- **Markdown:** the custom editor command reads the current document, verifies the target, and replaces only the matching fence through an editor transaction. The replacement preserves container prefixes, fence boundaries and surrounding text, and re-parses the result for validation.
- **Rich Text:** the viewer uses TinyMCE's Undo transaction to update the hidden source, fence metadata and highlighted rows, then signals `joplinChange` and `nodeChanged` so Joplin saves the edit.

Rich Text detection uses the parent window's TinyMCE instance. The iframe's `tinymce` property can be shadowed by a DOM element. Avoid changing a Rich Text Format button's disabled state while opening a preview: TinyMCE can capture generated button state in its Undo snapshots. The viewer also resets transient controls on Undo/Redo.

Toolbar clicks are handled during document capture, before the editor's block-selection handlers. Mouse down/up and double-click events on toolbar controls are consumed so selection cannot replace the clicked control or open the source editor. The code itself retains Joplin's normal source-edit gestures. Keyboard controls use the same capture approach. Joplin's [Rich Text source-edit listener](https://github.com/laurent22/joplin/blob/v3.7.22/packages/app-desktop/gui/NoteEditor/NoteBody/TinyMCE/utils/useEditDialogEventListeners.ts) handles double-clicks inside `joplin-editable` blocks; its handler does not exclude plugin toolbar buttons.

## Formatter engines

- Prettier: JavaScript, TypeScript, JSON, web templates/styles, YAML, Markdown and GraphQL, with plugins for XML, TOML and PHP.
- Ruff WASM: Python, four spaces and preserved quote style.
- shfmt WASM: Bash/POSIX shell, two spaces and no simplification.
- gofmt WASM: standard Go formatting.
- clang-format WASM: C-family languages and Protocol Buffers.
- SQL Formatter: the supported SQL dialects.
- StyLua WASM: Lua, two-space indentation and no require sorting.
- Dart WASM: dart_style; version 0.3.0 is pinned because 0.4.0 failed a basic valid-input probe.
- Scalar rustfmt WASM: Rust 2021, with import and module reordering disabled. The browser entry accepts explicit packaged bytes; its compressed artifact is expanded at build time, so runtime decompression/downloads are unnecessary. WASI exposes only an in-memory work directory.
- dprint WASM: Dockerfile and Terraform/OpenTofu/HCL, initialised from packaged bytes with no external processes.
- Prettier PowerShell: PowerShell 7 layout, with token/literal preservation checked before returning output. It retains aliases, cmdlets, hashtable order and keyword case; it rejects synthesised delimiters rather than repairing malformed code.
- Local BASIC layout formatter: generic BASIC, BBC, Sinclair, Commodore V2, Locomotive, Applesoft, GW-BASIC, QBasic, Atari BASIC and AMOS. It changes only leading layout whitespace and normalises line endings. It does not parse/execute programs or change statement boundaries, casing, data or program numbers. Indentation is bounded and overlarge output is rejected.

Formatter initialisation promises are cached per asset, so concurrent first requests share a load. Failed initialisation is removed from the cache for retry. HCL has a local Highlight.js grammar, including heredocs; BASIC dialect labels use generic BASIC syntax colouring.

See the README for labels and aliases. None of these engines executes code, and no formatter makes network requests. Syntax rejection varies by formatter; this feature is not a compiler or semantic validator.
