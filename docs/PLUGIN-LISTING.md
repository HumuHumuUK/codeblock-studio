# Code Block Studio

## Short description

Readable code blocks with syntax highlighting, sticky Copy controls and offline formatting previews with aligned scrolling and visible changes.

## Catalogue description

**Read, compare and tidy code in your Joplin notes.**

Code Block Studio gives fenced code blocks a clear, consistent presentation: dark cards, syntax colours, line numbers, optional filenames and the bundled JetBrains Mono font. Copy, Wrap and Format remain within reach while you scroll through long snippets.

Copy the original code without line numbers or other decoration. Wrap a long line without losing its original line number. For supported languages, choose Format to compare the original and proposed result before changing your note.

The comparison panes scroll together and keep matching code aligned when formatting inserts extra lines. Precise highlights show edited text, including spaces, tabs and line breaks. Apply updates the chosen code block; Copy original and Copy formatted leave the note unchanged. Normal editor Undo can restore an applied change.

Formatting is available for explicitly labelled Python, Bash/POSIX shell, JavaScript, TypeScript, SQL dialects, Go, C-family languages, Lua, Dart, Rust, PowerShell 7, Dockerfile, Terraform/HCL, retro BASIC listings, web templates/styles and several data formats. Syntax highlighting supports more languages than formatting; unsupported formatters are not offered.

The Rich Text code-block editing window has a searchable Language dropdown. It stays closed on entry, completes language prefixes inside the field as you type, and opens for browsing when you click the arrow or use arrow keys. The open list filters by language, alias or retro computer name, with mouse or arrow-key/Enter selection. Each language appears once; aliases remain searchable and directly typeable. Custom typed labels are also accepted.

Machine-specific BASIC blocks offer a saved Retro display checkbox: original-style fonts and familiar screen colours for C64, BBC Micro Mode 7, ZX Spectrum, Amstrad CPC, Apple II, DOS BASIC, Atari 8-bit, Amiga, Macintosh, Atari ST, MSX, ZX81, Dragon, Archimedes and Oric Atmos. BBC blocks also have saved bitmap/teletext mode presets, including blue/red Mode 6 with black inter-row gaps. The same screen appears on both sides of the formatting comparison. Fonts are bundled locally with their original licences.

The cards work in Joplin Desktop's Rich Text editor and Markdown preview. Notes remain ordinary Markdown, and the Markdown source editor remains a source view.

All formatters, highlighting code and fonts are bundled. Processing stays on the device: no accounts, AI services, analytics, system formatter installations or execution of snippets.

## How it works

1. Add a fenced code block with a language label such as `python`, `bash`, `javascript` or `sql`.
2. Read the styled card in Rich Text or Markdown preview, then choose Copy, Wrap or Format.
3. Review the linked comparison and decide whether to apply the result, copy it or cancel.

Highlighting uses Highlight.js. Bundled formatters include Ruff, shfmt, gofmt, clang-format, Prettier, StyLua, dart_style, rustfmt, dprint and SQL Formatter, plus conservative retro BASIC layout formatting. The comparison uses whitespace-aware alignment and jsdiff; its visual markers are excluded from copied and applied code. No formatter sends code to a remote service.

## Credits

**Concept and design: Leonard Powers.**

**Coding and implementation: Ada (OpenAI Codex), under Leonard Powers' direction.**

Ada is Leonard's AI coding assistant in OpenAI Codex. This is a development credit; the plugin itself uses no AI services. Original plugin licence: MIT. Bundled libraries and fonts retain their own licences.

## Screenshot captions

| Image | Caption |
| --- | --- |
| `images/code-cards.png` | Python and SQL code cards, with syntax highlighting, line numbers, filename labels and Format, Wrap and Copy controls. |
| `images/format-comparison.png` | Original and formatted Python aligned side by side, with visible added spaces and a blank line. Scroll either pane to move both. |
| `images/wrapped-code.png` | Wrap long code lines within a card while retaining their original line numbers. |

The screenshots are generated from the actual bundled plugin components with fictional examples. They do not show a complete Joplin application window. No customer notes or third-party product screenshots are included.

## Compatibility and publication status

Desktop support only. The manifest currently declares Joplin 3.3 as its minimum; verification of that minimum and final live acceptance of the current candidate are pending. Earlier releases were checked on Linux with Joplin Desktop 3.7.22. Windows, macOS and mobile have not been live-tested.

The plugin is not yet published to npm or the Joplin catalogue. Public source, screenshots and preview installers are hosted at [HumuHumuUK/codeblock-studio on GitHub](https://github.com/HumuHumuUK/codeblock-studio). Optional development support is available through [Ko-fi](https://ko-fi.com/W4J72A4KLF). See [publication preparation](PUBLISHING.md).
