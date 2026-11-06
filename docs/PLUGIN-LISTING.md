# Code Block Studio

## Short description

Readable code blocks, offline formatting previews and retro computer displays for Joplin Desktop.

## Catalogue description

**Read, format and enjoy code in your Joplin notes.**

Code Block Studio makes code easier to read with syntax highlighting, line numbers, optional filenames and a clear, consistent font. Copy, Wrap and Format stay within reach as you scroll.

- **Format with confidence.** Compare the original and formatted code side by side before applying changes to one block. Linked scrolling and visible whitespace changes help you review the result. Normal editor Undo restores an applied change.
- **Find your language quickly.** Type to complete a language name, or open the searchable dropdown to browse languages, aliases and retro computers. Custom labels still work.
- **Work with everyday languages.** Format Python, JavaScript, TypeScript, Bash, PowerShell, SQL, Go, C/C++, Lua, Dart, Rust, web templates, configuration files and supported BASIC dialects. Highlighting covers additional languages.
- **Bring back the classics.** Tick Retro display for original-style fonts and familiar screen colours from Commodore 64, BBC Micro, ZX Spectrum, Amstrad CPC, Apple II, IBM PC, Atari, Amiga, Macintosh, MSX, ZX81, Dragon, Archimedes and Oric Atmos. BBC presets include Modes 0–7 and the distinctive blue/red Mode 6 displays. The choice is saved with each block and follows it into the formatting comparison.
- **Keep code on your computer.** Fonts, highlighting and formatters are bundled locally. No accounts, AI services, analytics or runtime downloads are required. Code snippets are never executed.

Works in Joplin Desktop's Rich Text editor and Markdown preview. Notes remain ordinary Markdown, and copied code excludes line numbers and display decoration.

Try the downloadable **77-example Markdown note**, with main programming languages first and retro systems towards the end. Start with the [examples and installer on GitHub](https://github.com/HumuHumuUK/codeblock-studio/releases/tag/v1.7.5).

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
| `images/retro-displays.png` | Commodore 64, BBC Micro, ZX Spectrum and Amstrad CPC code blocks with saved retro displays. |
| `images/bbc-modes.png` | BBC Micro bitmap and teletext presets, including the blue/red Mode 6 screens. |
| `images/language-picker.png` | Search the Rich Text language dropdown by language, alias or computer name. |
| `images/wrapped-code.png` | Wrap long code lines within a card while retaining their original line numbers. |

The screenshots are generated from the actual bundled plugin components with fictional examples. They do not show a complete Joplin application window. No customer notes or third-party product screenshots are included.

## Compatibility and publication status

Requires Joplin Desktop 3.7.22 or later, matching the Linux development checks. Windows and macOS have not been live-tested; mobile is unsupported. The catalogue package changes metadata and presentation only; plugin runtime behaviour is unchanged from the 1.7.4 preview.

Catalogue publication was requested on 6 November 2026, with this copy and a six-image gallery prepared for review. Version 1.7.5 applies the write-up to the README and registers all six screenshots in the catalogue/installer metadata. Leonard verified his npm account, enabled 2FA and approved the reviewed package upload. [npm version 1.7.5](https://www.npmjs.com/package/joplin-plugin-code-block-studio) is publicly available, and its downloaded tarball exactly matches the reviewed original. Joplin catalogue ingestion remains pending.

Joplin's website uses the manifest description for its short Description section and the package's README for the detailed write-up. Public source, screenshots and preview installers are hosted at [HumuHumuUK/codeblock-studio on GitHub](https://github.com/HumuHumuUK/codeblock-studio). Optional development support is available through [Ko-fi](https://ko-fi.com/W4J72A4KLF). See [publication preparation](PUBLISHING.md).
