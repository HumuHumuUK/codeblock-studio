# Architecture

## Components

| File | Responsibility |
| --- | --- |
| `src/index.ts` | Registers settings, content scripts, the welcome command, clipboard messages and the native formatting dialog. |
| `src/renderer.ts` | Styles supported Markdown fences, highlights code, adds controls and preserves Joplin round-trip metadata. |
| `src/viewer.ts` | Handles Copy, Wrap and Format in rendered notes, including Rich Text application and Undo behavior. |
| `src/languagePicker.ts` | Adds searchable language choices to the native TinyMCE code-source dialog. |
| `src/editor.ts` | Registers the Markdown editor command that applies formatting through the active editor. |
| `src/replaceFence.ts` | Locates and validates the selected fence against the current document before replacing its code. |
| `src/formatLanguages.ts` | Maps explicit language labels and aliases to formatter engines. |
| `src/formatCode.ts` | Runs bundled formatters and loads their packaged WASM assets. |
| `src/formatBasic.ts` | Preserves retro BASIC statements while aligning line numbers and indenting recognised blocks. |
| `src/retro.ts`, `src/retro.css` | Maps machine-specific BASIC labels to local fonts/palettes and reads/writes the per-fence `retro` flag. |
| `src/code-studio.css` | Dark cards, font, line numbers, wrapping, sticky toolbar and print styling. |
| `src/formatPreview.ts` | Builds the escaped, aligned Original/Formatted comparison and change highlights. |
| `src/formatDialog.ts` | Links vertical scrolling in both preview panes, including after reopening the dialog. |
| `src/formatDialog.css` | Comparison layout, line numbers, change colours and typography. |
| `scripts/build.mjs` | Bundles runtime code, copies assets and licences, and packages the Joplin installer. |

## Rendering and copying

The Markdown-it content script renders ordinary fenced code blocks as dark cards. Diagram fences are delegated to Joplin or their own plugins. Highlight.js supplies syntax colours; multiline highlight spans are split into balanced visual rows. The plugin bundles JetBrains Mono.

Line numbers and controls are presentation elements. The hidden `joplin-source` element retains the original code and the opening/closing fence metadata Joplin needs when converting Rich Text back to Markdown. Copy reads the source text and asks the plugin process to write it to Joplin's clipboard API.

The toolbar uses sticky positioning within the card. `overflow: clip` on the card allows it to remain visible while the note scrolls; print styling returns it to a static position. The live status element sits inside this non-editable toolbar. Formatting feedback appears on its own wrapping row below the controls, keeping “Already formatted” and errors visible on long blocks; empty feedback occupies no row. Print styling hides feedback.

Machine-specific BASIC blocks also have a checkbox button for Retro display, using the same capture-phase mouse and keyboard handling as other controls. Its `retro` flag is stored in the fence info, outside the code; quoted filenames containing that word are not flags. Markdown uses the existing editor command with an optional replacement info string. When only metadata changes, `replaceFence` validates the current target and replaces just the opening line, preserving code bytes, container indentation, line endings and other blocks. Rich Text updates `data-joplin-source-open` and the generated card in one TinyMCE Undo transaction, then signals the normal save events. Undo/Redo refreshes the checkbox, info and palette from the restored source metadata. Read-only editors reject toggles.

Joplin's native source dialog replaces only an editable block's inner HTML, leaving the outer card's data attributes stale. The hidden source's `data-joplin-language` and opening fence are authoritative: the viewer synchronises the outer language, info, checkbox and palette before Retro/Format actions, on initial load and on `joplin-noteDidUpdate`. This prevents a language edit or stale tick state from making a toggle fail or restoring the previous language. The native dialog and Undo transaction paths remain unchanged.

The renderer and native comparison dialog load the same `retro.css` and 19 registered font files, including five named CC BY-SA geometry/spacing variants. The palette is applied to the code surface; Macintosh captions also use Chicago. Cards hide their generated gutter and suppress syntax colours in retro mode; comparison panes retain line numbers, change highlights and aligned rows. Generic BASIC has no machine profile. The original font licences, notices, provenance and hashes ship under `retro-fonts/`; no font is downloaded or installed at runtime.

BBC mode choices use a whitelisted standalone `retro-mode=` field, independently of the `retro` flag. The selector is hidden when the checkbox is off; its saved value remains. Both the host message boundary and shared metadata helper reject unknown modes. TinyMCE mode changes use the same transaction path as checkbox changes; Undo/Redo rebuilds the selector and data attributes from source metadata. Capture handlers stop editor gestures on the native select without preventing its normal mouse/keyboard behaviour. The comparison receives the same validated mode. Font variants have genuine advance widths, avoiding transformed text that would break wrapping and horizontal scrolling. Mode 6 gradients use local scrolling backgrounds and the same row pitch in cards and comparisons. Mode 6 surfaces omit the usual screen border and vertical padding, so the first text row begins immediately and black gaps span the width instead of stopping at coloured side gutters. Paper occupies 1em and the gap 0.25em of each 1.25em row; the bands remain aligned while scrolling and scaling the font.

## Language chooser

The renderer exports a catalogue assembled from its existing labels, Highlight.js language names/aliases and explicit formatter labels. Entries are grouped by case-insensitive display name, with a primary spelling chosen from the formatter labels first, then Highlight.js canonical names. Other spellings are stored as searchable aliases instead of repeated rows. Catalogue-only names distinguish JSONC/JSON5, XHTML and Zsh, and consolidate the C64 and Dragon 32/64 synonyms. Shell-session highlighting remains separate from POSIX shell scripts despite Highlight.js using the canonical name `shell`. The build embeds this catalogue in the viewer bundle using an esbuild define; the viewer does not import Highlight.js or fetch another asset to populate the list.

In Rich Text, the viewer registers a TinyMCE `OpenWindow` listener once per editor. Attachment is attempted when scripts load, on the next animation frame, and on editor focus/double-click so late initialisation is covered. The listener recognises the native code-source dialog by its `languageInput` and `codeTextArea` data fields, then augments its existing enabled Language input. Unrelated dialogs, read-only/disabled fields and inputs already owning a datalist are untouched. The listener is removed when the iframe unloads.

The combobox/listbox uses the parent document and TinyMCE menu classes. Filtering/ranking matches primary values, display names and aliases. Directly typed aliases are accepted without being expanded to the primary value; inline completion also recognises those spellings. Native browser datalist navigation conflicted with TinyMCE’s dialog keyboard handling, so a local suggestion list handles only navigation/selection keys. Selection calls the dialog’s public `setData` API for `languageInput`; code, OK/Cancel, submission and note/editor transactions remain owned by Joplin. The list stays closed on attachment/focus. In the closed field, ordinary text insertion can complete a language-value prefix through `setData`, selecting only the suggested suffix. Exact aliases, deletion, paste, composition and edits away from the end do not trigger replacement. Enter accepts the suffix without submitting; Escape restores the typed prefix. Consumed navigation/selection keys also consume their matching keyup because TinyMCE handles dialog Escape on key release. Explicit arrow-button/keyboard opening exposes the list, where typing filters language names and aliases. A label without a match can still be submitted as typed. This integration relies on the [native code-dialog structure](https://github.com/laurent22/joplin/blob/v3.7.22/packages/app-desktop/gui/NoteEditor/NoteBody/TinyMCE/utils/useEditDialog.ts) verified against Joplin 3.7.22 / TinyMCE 6.8.5 and the [TinyMCE dialog events](https://www.tiny.cloud/docs/tinymce/6/events/#openwindow); a changed dialog structure safely retains the ordinary field. It does not alter Markdown autocomplete.

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
- Local BASIC layout formatter: generic BASIC, BBC, Sinclair, Commodore V2, Locomotive, Applesoft, GW-BASIC, QBasic, Atari BASIC, AMOS, Macintosh Microsoft BASIC/QuickBASIC, STOS/GFA, MSX, ZX81, Dragon, Archimedes and Oric Atmos. It changes only leading layout whitespace and normalises line endings. It does not parse/execute programs or change statement boundaries, casing, data or program numbers. Indentation is bounded and overlarge output is rejected.

Formatter initialisation promises are cached per asset, so concurrent first requests share a load. Failed initialisation is removed from the cache for retry. HCL has a local Highlight.js grammar, including heredocs; BASIC dialect labels use generic BASIC syntax colouring.

See the README for labels and aliases. None of these engines executes code, and no formatter makes network requests. Syntax rejection varies by formatter; this feature is not a compiler or semantic validator.
