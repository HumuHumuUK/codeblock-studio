# Code Block Studio for Joplin

Read, compare and tidy code in your notes. (c)

Code Block Studio turns fenced code blocks in Joplin Desktop into readable dark cards, with syntax highlighting, line numbers, optional filenames and the bundled JetBrains Mono font. Format, Wrap and Copy stay within reach as you scroll through long snippets.

Preview formatting for Python, Bash, PowerShell, JavaScript, TypeScript, SQL, Go, C/C++, Lua, Dart, Rust, infrastructure configuration and retro BASIC listings before changing a note. The Original and Formatted panes scroll together, keep matching code aligned, and show the spaces, tabs and line breaks that changed. Apply the result to one code block, copy it instead, or cancel. Normal editor Undo restores an applied change.

All highlighting and formatting run locally. There are no accounts, AI services, analytics or runtime downloads, and snippets are never executed.

**Concept and design: Leonard Powers.** **Coding and implementation: Ada (OpenAI Codex), under Leonard Powers' direction.** See [credits](CREDITS.md).

![Python and SQL code cards with line numbers and Format, Wrap and Copy controls.](docs/images/code-cards.png)

![Formatting comparison with aligned code, precise space highlights and an added blank line.](docs/images/format-comparison.png)

These images show the actual plugin renderer and comparison components in Chromium with fictional sample code. They are component screenshots, rather than captures of a complete Joplin window.

## Use it

Code Block Studio applies to fenced code blocks in Joplin's **Rich Text editor** and **Markdown preview**. The Markdown source editor stays an editable source view.

In the Markdown editor, enter:

````markdown
```python title="hello.py"
def greet(name: str) -> str:
    return f"Hello, {name}!"

print(greet("Joplin"))
```
````

Specify a language such as `python`, `javascript`, `typescript`, `bash`, `powershell`, `sql`, `json`, `html`, `css`, `yaml`, `cpp` or `rust` for reliable colours. Highlight.js includes many more languages and aliases. Untagged fences can detect a language; this is a best guess. Use `text` to disable highlighting for a block. Unknown language names display safely as plain text. Existing Mermaid, maths and common diagram fences are delegated to Joplin or their own plugins.

In the Rich Text editor’s code-block editing window, **Language** stays closed when the window opens or the field gains focus. Typing a language prefix completes the matching name inside the field (for example `pyt` → `python`), with the suggested ending selected so you can keep typing. Enter accepts it; Escape restores what you typed. Click the arrow to browse the list, then type to filter by language, alias or computer name (for example `BBC` or `Commodore`). Click a suggestion, or use ↑/↓ and Enter. Arrow keys can also open the list for keyboard access. Each language appears once; short names such as `py`, `js`, `bbc` and `c64` still find its entry and remain valid when typed directly. Distinct variants such as JSON, JSONC and JSON5 remain separate. Custom labels remain supported. Choose **OK** to save through Joplin as usual. Markdown fence typing is unchanged.

![Searchable language chooser in the code-block editing window, filtered to BBC BASIC.](docs/images/language-picker.png)

- **Copy** puts the original code on the clipboard, including indentation, blank lines and the final newline. It excludes numbers, language labels and filenames. A successful write shows “Copied”; an error shows “Retry”.
- **Wrap** toggles long-line wrapping separately for each card. A wrapped line keeps one line number. The per-card toggle lasts until the note is rendered again.
- **Retro display** appears for machine-specific BASIC labels. Tick it for that computer's bundled font and familiar screen colours; untick it to restore normal highlighting. The choice is saved with the block, works in both comparison panes, and supports editor Undo. See [retro display](#retro-display).
- **Format** opens an Original / Formatted preview for supported languages. Scroll either pane to move both together. Matching code stays aligned even when formatting adds lines, with line numbers and hatched gaps for the extra rows. By default both panes keep a black background: grey highlights show removed text in the original, and green highlights show additions in the formatted code. Changed spaces appear as `·`, tabs as `→`, added/removed line breaks as `↵`, and a changed missing final line break as `∅`. Choose **Apply formatting** to update only that code block, or **Copy formatted** / **Copy original** to copy without editing the note. **Cancel** leaves it unchanged. Use the editor's normal **Undo** to restore an applied change.
- The toolbar stays at the top of the note view while scrolling through a long code block, keeping Format, Wrap and Copy within reach. It moves away when you scroll past that block.
- **`title="hello.py"`** is optional and adds a filename to the header.
- Short inline snippets also get a dark background and code font.

![A long JavaScript line wrapped within its code card.](docs/images/wrapped-code.png)

## How it works

Add an ordinary Markdown code fence with a language label. The plugin styles that block in the rendered note, and Copy reads the preserved source text. Highlighting does not rewrite the code.

When you choose Format, a bundled formatter processes that block on your device and opens the comparison. Added display gaps and whitespace symbols help you review the changes; they are excluded from copied and applied code. Apply checks the target and updates the selected block through the active editor, retaining normal Undo. Notes continue to use ordinary Markdown when the plugin is removed.

Formatting is available for explicitly labelled code blocks:

| Languages | Fence labels and aliases |
| --- | --- |
| Python | `python`, `py` |
| Bash and POSIX shell | `bash`, `sh`, `shell`, `shellscript` |
| Go | `go`, `golang` |
| PowerShell 7 | `powershell`, `ps1`, `pwsh`, `ps` |
| Lua | `lua` |
| Dart | `dart` |
| Rust (2021 edition) | `rust`, `rs` |
| Dockerfile | `dockerfile` |
| Terraform / OpenTofu and HCL | `terraform`, `tf`, `opentofu`, `hcl` |
| C, C++, C#, Java, Objective-C, Protocol Buffers | `c`, `cpp` / `c++`, `csharp` / `cs` / `c#`, `java`, `objc`, `proto` / `protobuf` |
| SQL dialects | `sql`, `postgresql` / `postgres` / `pgsql`, `mysql`, `mariadb`, `sqlite`, `tsql`, `bigquery` |
| Additional SQL dialects | `plsql` / `oracle`, `snowflake`, `duckdb`, `redshift`, `db2`, `hive` |
| JavaScript and TypeScript | `javascript` / `js`, `jsx`, `typescript` / `ts`, `tsx` |
| Web templates and styles | `html`, `vue`, `angular`, `css`, `scss`, `less` |
| Data and configuration | `json`, `jsonc`, `json5`, `yaml` / `yml`, `xml`, `svg`, `toml` |
| Other | `php`, `graphql` / `gql`, `markdown` / `md` |
| Generic numbered BASIC | `basic` |
| BBC Micro / Master | `bbc-basic`, `bbcbasic`, `bbc`, `bbc-micro` |
| ZX Spectrum | `sinclair-basic`, `spectrum`, `zx-spectrum` |
| Commodore 64 | `commodore-basic`, `c64-basic`, `c64` |
| Amstrad CPC | `locomotive-basic`, `amstrad`, `amstrad-cpc`, `cpc` |
| Apple II | `applesoft` |
| DOS BASIC | `gwbasic`, `qbasic` |
| Atari 8-bit / Amiga | `atari-basic`, `amos` |
| Macintosh | `mac-basic` / `macintosh`, `mac-quickbasic` |
| Atari ST | `stos` / `stos-basic`, `gfa-basic` / `gfa` |
| MSX / MSX2 | `msx-basic`, `msx`, `msx2` |
| ZX81 | `zx81-basic`, `zx81` |
| Dragon 32/64 | `dragon-basic`, `dragon32`, `dragon64` |
| Acorn Archimedes | `archimedes-basic`, `archimedes`, `bbc-basic-v`, `bbc-basic-vi` |
| Oric Atmos | `oric-basic`, `oric`, `oric-atmos` |

Use `bash` for Bash-specific scripts and `sh` for POSIX shell scripts. Languages without a bundled formatter, including Fish and Zsh, retain highlighting and copying; their Format button is omitted. Guessed languages also omit Format, so add an explicit fence label to enable it.

The [example note](examples/code-block-studio.md) contains 77 ready-to-format blocks, with the main programming languages first, then web, data/configuration and SQL. Retro computers and BBC display modes are grouped at the end. Import or paste it into Joplin to try the previews.

### Practical languages

PowerShell formatting targets PowerShell 7, including its multiline pipeline syntax. Compatibility of the formatted result with Windows PowerShell 5.1 is not guaranteed. Aliases, cmdlets, keyword casing and hashtable order are preserved; an additional token/literal check rejects changes to code or literal text, including attempts to repair missing braces. Explicit separators may replace existing line breaks between hashtable entries. It is not a complete PowerShell syntax validator.

Lua uses StyLua with two spaces; Dart uses dart_style; Rust uses rustfmt with Rust 2021 syntax and style. Rust import/module reordering is disabled. Dockerfile instructions use dprint's formatter; commands and heredoc bodies are never executed. Terraform/OpenTofu and HCL use the HCL/OpenTofu formatter without requiring Terraform or OpenTofu to be installed.

### Retro display

Machine-specific BASIC blocks offer a **Retro display** checkbox beside Format. It uses fonts based on the original character designs, bundled with the installer: C64, BBC Micro Mode 7 (Bedstead), ZX Spectrum, Amstrad CPC, Apple II, IBM VGA for DOS BASIC, Atari 8-bit Amiga Topaz, Macintosh Monaco, Atari ST, MSX, ZX81, Dragon, Archimedes and Oric Atmos. Generic `basic` has no single machine style and keeps the normal display.

The screens use familiar colours: C64 blue with a light-blue border, BBC white on black, Spectrum black on light grey, CPC yellow on blue, Apple II green on black, GW-BASIC grey on black, QBasic grey on blue, Atari light blue on blue and Amiga white on blue. Retro text uses one ink colour, without modern syntax colours or the card's extra line-number gutter. Unticking restores the normal font, colours and gutter. Both formatting comparison panes use the chosen screen, while keeping change marks and linked scrolling.

BBC blocks also show a **BBC display mode** selector while Retro display is ticked. Mode 7 keeps the teletext face; Modes 0–6 use the bitmap character design with the appropriate narrow, normal or wide proportions. Modes 3/6 include the black gaps between text rows. Mode 6 has white-on-blue and white-on-red presets, including the red screen supplied as a reference. The choice stays with the block even while Retro display is unticked. Existing BBC blocks without a mode field remain in Mode 7.

Mode 6 starts at the first text row, without an extra rule above it. Its black gaps run across the screen, taking two of each ten scanlines; the same proportions apply in both formatting comparison panes and scale with the text size.

New defaults are Macintosh black on white (Monaco for code, Chicago for the caption), STOS white on black, MSX white on blue, ZX81 black on white, Dragon dark green on light green, Archimedes white on black and Oric Atmos black on white. The Dragon font displays lowercase codes as inverse uppercase; the sample is uppercase. The Oric profile specifically uses Atmos lowercase characters. Missing glyphs use visible font fallback. Screen colours follow documented defaults, approximated for modern RGB displays.

For example, use `bbc-basic retro retro-mode=6-red` for the red Mode 6 display. All presets also appear on both sides of Format. Display settings never execute screen commands, enforce a fixed column count or change copied/applied code.

![Additional retro screens for Macintosh, STOS, MSX, ZX81, Dragon, Archimedes and Oric Atmos.](docs/images/retro-expanded.png)

![BBC mode proportions, including blue and red Mode 6 with black inter-row gaps.](docs/images/bbc-modes.png)

The choice is saved as a `retro` field after the language in that block's fence info. For example:

````markdown
```c64 retro title="hello.bas"
10 PRINT "HELLO"
20 GOTO 10
```
````

The checkbox changes only the fence settings; the code and Copy output stay intact. Editor Undo restores the previous choice. Other Joplin desktops with this plugin can read the saved choice after note sync. Without the plugin, it remains an ordinary code fence. Colours are representative defaults rather than a running computer: commands such as `MODE`, `INK`, `PAPER` or `POKE` do not alter the display. Fonts and licence details are recorded in [bundled retro fonts](assets/retro-fonts/README.md).

![C64, BBC Micro Mode 7, ZX Spectrum and Amstrad CPC code cards with Retro display enabled.](docs/images/retro-displays.png)

![C64 formatting comparison using the same retro font and blue screen in both panes.](docs/images/retro-comparison.png)

### Retro BASIC listings

Retro formatting aligns existing program line numbers and indents recognised loops and structured blocks with two spaces. For example:

````markdown
```commodore-basic
10 FOR I=1 TO 3
20 PRINT "HELLO";I
30 NEXT I
100 END
```
````

The preview aligns `10`, `20` and `30` with `100`, and indents the `PRINT` line inside the loop. Those are actual BASIC program numbers; the card's gutter numbers remain separate.

The formatter preserves statement text, variable/keyword case, strings, `REM` comments, `DATA` payloads and physical statement boundaries. It never renumbers a program, expands abbreviated keywords, splits colon-separated statements or joins lines. BASIC line endings become LF; the final-newline state is preserved. Deep indentation is capped at 20 levels.

This is conservative layout formatting for text listings, not a BASIC interpreter or complete syntax validator. Compact/tokenised keyword forms and unfamiliar constructs are retained rather than expanded; loop/block indentation depends on recognised, separated control words. Syntax colouring uses the generic BASIC grammar, so machine-specific commands may have plain colouring. Tokenised tape/disk images must first be exported as text.

All formatters are bundled and run locally when requested. Python uses Ruff with four-space indentation and preserved quote style; shell uses shfmt with two spaces; Go uses gofmt's standard style. C-family code uses clang-format (Microsoft style for C#, LLVM style with two spaces for the others). SQL uses uppercase keywords and two-space indentation. Prettier handles the remaining languages, generally using two spaces and a preferred width of 100 columns. XML preserves whitespace-sensitive mixed content. Most formatters use LF line endings; Terraform/HCL preserves the source line endings.

Formatting changes layout, not program execution: snippets are never run, shell simplification is disabled, and Python docstring examples are left alone. A parsing failure displays an error without changing the code; formatters do not replace a compiler or validate every language error. Clicking Format on already-formatted code shows “Already formatted” directly below the toolbar buttons. Formatting feedback stays with the sticky toolbar as you scroll, and Format remains available. No system Python, shell formatter, Go compiler or C compiler installation is required.

Open **Tools → Code Block Studio: Open welcome and examples** to create or reopen the example note. The first invocation adds one note to the selected notebook. Reopening it does not replace your edits.

## Preferences

Under **Tools → Options → Code Block Studio**, choose line numbers, default wrapping, code font size (10–24px), language detection and inline styling. If an existing view does not immediately refresh, switch to another note and back.

Code Block Studio is independent of the Joplin theme, so the cards stay dark in a light or dark notebook. The font ships inside the plugin; no font download or system installation is needed. Code and highlighting stay on the device. There are no network requests or analytics in the plugin.

## Install or remove

Requires Joplin Desktop; the declared minimum is 3.3. Earlier versions were checked on Joplin Desktop 3.7.22 for Linux. Final live acceptance of the current candidate, and verification of the minimum version, remain pending. Windows, macOS and mobile have not been live-tested; mobile is not declared as supported.

This is a publication candidate and is not yet listed in the official plugin catalogue. Download the preview installer from [GitHub Releases](https://github.com/HumuHumuUK/codeblock-studio/releases), then install it manually:

1. Open **Tools → Options → Plugins**.
2. Choose the gear menu → **Install from file** and select `local.lpowers.code-studio.jpl`.
3. Restart Joplin.

Download the actual `.jpl` installer file, rather than saving a repository's file-view web page. A fresh local build is available under `publish/`.

The build also supplies `publish/code-block-studio-examples.md`. Import it into Joplin as a Markdown file to try all 16 retro screen families, BBC mode presets and examples for every supported formatter language/dialect. The retro displays start enabled; untick them to compare with normal highlighting. No sample code is executed.

Disable overlapping code-block appearance plugins if they interfere with the cards.

To remove Code Block Studio, disable or uninstall it under Plugins and restart. Notes remain ordinary Markdown. The example note can be deleted separately.

## Build from source

Use a current Node.js LTS release and npm:

```sh
npm ci
npm run typecheck
npm run build
npm test
```

The build creates `publish/local.lpowers.code-studio.jpl` and its checksum. It uses the official Joplin API declarations and API global, bundles the implementation with esbuild, and creates the same plain tar archive format as Joplin's plugin generator.

The browser interaction test expects Chromium at `/usr/bin/chromium`; adjust that path in `tests/viewer.test.mjs` for another OS. Runtime code has no dependency on Chromium or Node being installed separately from Joplin.

## Project files

- [Development guide](docs/DEVELOPMENT.md) — setup, build, tests and release checks.
- [Architecture](docs/ARCHITECTURE.md) — rendering, formatting, copying and editor integration.
- [Plugin listing](docs/PLUGIN-LISTING.md) — reusable catalogue description and screenshot captions.
- [Publication preparation](docs/PUBLISHING.md) — package checks, current submission guidance and remaining decisions.
- [Change history](CHANGELOG.md) and [credits](CREDITS.md).
- [Examples](examples/code-block-studio.md) for trying the supported formatters.
- `publish/` contains the current local build, catalogue metadata and checksums after building from source.

Local working files, research snapshots and installation backups are excluded from public distribution.

## Compatibility and behaviour

- Rendering does not modify note contents. Applying a formatting preview explicitly edits the chosen code block through the active editor, preserving Undo. Joplin's documented `joplin-editable` and `joplin-source` metadata preserves source when Rich Text converts the note back to Markdown.
- Syntax colours cover recognised languages; formatting is available for the explicitly labelled languages listed above.
- Print styles wrap code, retain colours and hide the toolbar buttons.
- The bundled font covers Latin text. Other scripts and emoji use the platform's fallback fonts.
- Standard fenced blocks are styled; arbitrary HTML `<pre>` elements and indented code blocks are left to Joplin.
- Diagram language names excluded from styling: `mermaid`, `math`, `katex`, `abc`, `plantuml`, `drawio`, `graphviz`, `dot`, `nomnoml`, `markmap`.

## Support development

If Code Block Studio is useful to you, you can [buy me a coffee on Ko-fi](https://ko-fi.com/W4J72A4KLF). Support is entirely optional.

## Sources and licences

Original plugin implementation: MIT, see `LICENSE`. Bundled dependency notices are included in the plugin archive.

- [Joplin plugin development](https://joplinapp.org/help/api/get_started/plugins/)
- [Joplin Markdown renderer API and Rich Text round-trip metadata](https://joplinapp.org/api/references/plugin_api/enums/contentscripttype.html)
- [Highlight.js](https://github.com/highlightjs/highlight.js) — BSD 3-Clause
- [JetBrains Mono](https://github.com/JetBrains/JetBrainsMono) — SIL Open Font License 1.1
- [Prettier](https://prettier.io/docs/browser/) — MIT, with bundled third-party notices
- [Ruff formatter for WebAssembly](https://github.com/wasm-fmt/ruff_fmt) — MIT, with Ruff notices
- [shfmt for WebAssembly](https://github.com/wasm-fmt/shfmt) and [gofmt for WebAssembly](https://github.com/wasm-fmt/gofmt) — bundled upstream and Go/TinyGo notices
- [clang-format for WebAssembly](https://github.com/wasm-fmt/clang-format) — includes LLVM Apache 2.0 with LLVM exceptions
- [SQL Formatter](https://github.com/sql-formatter-org/sql-formatter), [Prettier XML](https://github.com/prettier/plugin-xml), [Prettier TOML](https://github.com/un-ts/toml-tools/tree/master/packages/prettier-plugin-toml) and [Prettier PHP](https://github.com/prettier/plugin-php) — bundled dependency licences
- [jsdiff](https://github.com/kpdecker/jsdiff) — local comparison of code lines and characters, BSD-3-Clause
- [Markdown-it](https://github.com/markdown-it/markdown-it) — MIT, used to locate the chosen block in the current Markdown editor document
- [StyLua WASM](https://github.com/wasm-fmt/lua_fmt), [Dart formatter WASM](https://github.com/wasm-fmt/dart_fmt), [Scalar rustfmt WASM](https://github.com/scalar/formatters), [dprint Dockerfile](https://github.com/dprint/dprint-plugin-dockerfile), [dprint Terraform/HCL](https://github.com/dprint/dprint-plugin-terraform) and [Prettier PowerShell](https://github.com/Nick2bad4u/Prettier-Plugin-Powershell) — bundled wrapper and upstream notices; see `vendor-licenses/SOURCE-NOTICES.txt` for source locations and licence details

This is an independent plugin, not a fork of CodePerfect. Its source was consulted as a comparison, alongside the official Joplin API.
