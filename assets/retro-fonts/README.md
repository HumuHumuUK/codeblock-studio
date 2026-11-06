# Bundled retro fonts

Downloaded from the upstream sources below on 6 November 2026. Original downloads are retained unchanged. The five clearly named Code Studio variants described below adjust geometry or spacing under their upstream CC BY-SA licence; the originals and all companion notices are included alongside them. The plugin uses local CSS family aliases; it does not install system fonts or fetch fonts at runtime.

| Screen | File | Credit and source | Licence |
| --- | --- | --- | --- |
| Commodore 64 | `PetMe64.ttf` | Rebecca G. Bettencourt / Kreative Software, [Retro Computing Fonts](https://www.kreativekorp.com/software/fonts/retro/), [original archive](https://www.kreativekorp.com/swdownload/fonts/retro/petme.zip) | Relay Fonts Free Use 1.2f; `KREATIVE-FreeLicense.txt` |
| BBC Micro Mode 7 | `bedstead.otf` | Ben Harris, [Bedstead 3.261](https://bjh21.me.uk/bedstead/), [original archive](https://bjh21.me.uk/bedstead/bedstead-3.261.zip); based on the Mullard SAA5050 teletext character generator | CC0 1.0; `BEDSTEAD-COPYING.txt` |
| ZX Spectrum | `Speccy.ttf` | Rebecca G. Bettencourt / Kreative Software, [Retro Computing Fonts](https://www.kreativekorp.com/software/fonts/retro/), [original archive](https://www.kreativekorp.com/swdownload/fonts/retro/speccy.zip) | Relay Fonts Free Use 1.2f; `KREATIVE-FreeLicense.txt` |
| Amstrad CPC | `cpc464.woff2` | Damian Vila, [CPC464](https://github.com/damianvila/font-cpc464), [current project](https://codeberg.org/Dmian/font-cpc464); downloaded from the archived author's GitHub repository because the replacement download URL was unavailable | CC0 1.0; `CPC464-LICENCE.txt`, `CPC464-README.md` |
| Apple II 40-column | `PrintChar21.ttf` | Rebecca G. Bettencourt / Kreative Software, [Retro Computing Fonts](https://www.kreativekorp.com/software/fonts/retro/), [original archive](https://www.kreativekorp.com/swdownload/fonts/retro/pr.zip) | Relay Fonts Free Use 1.2f; `KREATIVE-FreeLicense.txt` |
| IBM DOS / QBasic | `Web437_IBM_VGA_8x16.woff` | VileR, [Ultimate Oldschool PC Font Pack 2.2](https://int10h.org/oldschool-pc-fonts/), [original webfont archive](https://int10h.org/oldschool-pc-fonts/download/oldschool_pc_font_pack_v2.2_web.zip) | CC BY-SA 4.0; `IBM-VGA-LICENSE.txt`, `IBM-VGA-README.txt` |
| Atari 8-bit | `CandyAntics.ttf` | Rebecca G. Bettencourt / Kreative Software, [Retro Computing Fonts](https://www.kreativekorp.com/software/fonts/retro/), [original archive](https://www.kreativekorp.com/swdownload/fonts/retro/candy.zip) | Relay Fonts Free Use 1.2f; `KREATIVE-FreeLicense.txt` |
| Amiga Topaz 8 / Workbench 1.3 | `amiga-topaz/amiga-topaz.ttf` | Patrick H. Lauke, [Amiga Topaz](https://fontstruct.com/fontstructions/show/675155/amiga_topaz), [original archive](https://fontstruct.com/font_archives/download/675155) | CC BY 3.0; `amiga-topaz/license.txt`, `amiga-topaz/readme.txt` |

| Macintosh code | `mac-monaco/monaco-9.ttf` | Techstar01, based on Jamie Place, [Monaco 9](https://fontstruct.com/fontstructions/show/1744750) | CC BY-SA 3.0; directory licence/readme |
| Macintosh caption | `mac-chicago/chicago-12.ttf` | Damien Guard, [Chicago 12](https://fontstruct.com/fontstructions/show/918536); proportional face used only for captions | CC BY-SA 3.0; directory licence/readme |
| Atari ST / STOS / GFA | `atari-st/code-studio-st.ttf` | Damien Guard, [Atari ST Low Res](https://fontstruct.com/fontstructions/show/464053) | CC BY-SA 3.0; directory licence/readme/CHANGES |
| MSX | `msx/msx-international.ttf` | Patrick H. Lauke, [MSX International+](https://fontstruct.com/fontstructions/show/2310019) | CC BY 3.0; directory licence/readme |
| ZX81 | `zx81/zx81-vdu.ttf` | soxhead2000 / Matthew Eagles, [ZX81 VDU](https://fontstruct.com/fontstructions/show/353509) | CC BY-SA 3.0; directory licence/readme |
| Dragon 32/64 | `HotCoCo.ttf` | Rebecca G. Bettencourt / Kreative Software, [Hot CoCo](https://www.kreativekorp.com/swdownload/fonts/retro/hotcoco.zip); original MC6847, not the later MC6847T1 font | Relay Fonts Free Use 1.2f; `KREATIVE-FreeLicense.txt` |
| Acorn Archimedes | `archimedes/code-studio-archimedes.ttf` | Damien Guard, [Acorn Archimedes](https://fontstruct.com/fontstructions/show/1413139) | CC BY-SA 3.0; directory licence/readme/CHANGES |
| Oric Atmos | `oric/code-studio-oric.ttf` | Damien Guard, [Oric Atmos](https://fontstruct.com/fontstructions/show/1631835), based on his Magic5 font | CC BY-SA 3.0; directory licence/readme/CHANGES |
| BBC bitmap modes | `bbc-bitmap/bbc-micro.ttf`, `code-studio-bbc-narrow.ttf`, `code-studio-bbc-wide.ttf` | Damien Guard, [BBC Micro](https://fontstruct.com/fontstructions/show/1009080); original TrueType download | CC BY-SA 3.0; directory licence/readme/CHANGES |

The Relay Fonts licence permits free redistribution and embedding, with attribution and the licence, but prohibits modification and selling font copies. These font files retain those terms; the plugin's MIT licence does not relicense them. Keep the supplied notices and documentation with the fonts in both source and installers.

These are outline/webfont reproductions of the original character designs, with some extended Unicode coverage, rather than machine emulators. Unsupported Unicode falls back to the bundled modern font or system monospace. The browser still renders the original source characters; the plugin never converts case or replaces characters to imitate a ROM encoding.

The original screen palettes are representative defaults: C64 blue/light blue (Pepto palette), BBC white/black, Spectrum black/non-bright white, CPC yellow/blue, Apple II green monochrome, GW-BASIC grey/black, QBasic grey/blue, Atari light blue/blue and Amiga white/blue. Actual hardware colours varied with video standard, monitor and settings. BASIC commands inside a listing do not change the displayed palette or font.

## Derived font variants

Generated on 6 November 2026 by Ada (OpenAI Codex), under Leonard Powers’ direction, using `scripts/prepare-retro-fonts.py` and FontTools. These derivatives remain CC BY-SA 3.0. Rebuilding the plugin uses the checked-in font binaries and does not require Python or FontTools.

- BBC Narrow halves glyph widths and advances for Modes 0/3; BBC Wide doubles them for Modes 2/5. Modes 1/4/6 use the original bitmap font. Font outlines retain the original pixel design.
- ST normalises ASCII advances to an eight-pixel cell (the upstream asterisk is one pixel narrower).
- Archimedes doubles vertical geometry for the tall display and normalises the caret advance to the common cell.
- Oric doubles geometry to match the other fonts’ display scale and normalises ASCII advances to its six-pixel cell. Empty upstream underscore, grave accent and tilde mappings are removed so those source characters remain visible through font fallback. No replacement glyph is invented. Its lowercase glyphs are retained.

Each derivative has a new internal family/PostScript name and filename. Original files, attribution, licence and readme remain in the same directory. No Relay Fonts file is modified.

## Screen presets and limits

New defaults are Macintosh black/white, Atari ST STOS white/black, MSX white/medium blue (`COLOR 15,4,4`, TMS9918 palette colour 4 represented as #5455ed), ZX81 black/white, Dragon dark green/light green, Archimedes white/black and Oric Atmos black/white. RGB values approximate the documented palette on a modern display; analogue video, television adjustment and hardware revisions varied.

BBC bitmap Modes 0/3 use narrow 80-column proportions, 1/4/6 use 40-column proportions and 2/5 use wide 20-column proportions. Modes 3/6 use ten scanlines per character row, including two fixed black gap scanlines; Mode 6 blue/red presets expose those gaps. Other bitmap modes use eight scanlines. Mode 7 retains Bedstead. These proportions do not impose a fixed screen width or execute VDU/MODE commands, emulate flashing palettes, or provide full teletext control codes.

The Dragon font maps lowercase characters to inverse uppercase forms, reflecting the MC6847 ROM. Its sample is uppercase. ZX81 samples are uppercase too; unsupported Unicode falls back without changing source characters.

References: [BBC Micro user guide mode table](https://galax.xyz/DOWNLOAD/BBCMUG.PDF), [STOS user guide](https://www.exxosforum.co.uk/atari/STOSFLOPPY/STOSDPLANG/STOS_User_Guide.pdf), [MSX BASIC guide](https://hansotten.file-hunter.com/uploads/files/msxbasicjvc.pdf), [Dragon BASIC manual](https://www.dragondata.co.uk/Publications/BASIC-MAN/DRAGON_32_BASIC_MANUAL_rel-v2.pdf), [RISC OS BBC BASIC guide](https://www.riscos.com/support/developers/bbcbasic/part1/bbcbasic.html), [Oric Atmos manual](https://thespider.oric.org/manuals/Oric-Atmos_Manual.pdf), and the linked font authors’ research and specimen pages. The red Mode 6 preset also follows the user-supplied screenshot. These are static code displays, not emulators.

## SHA-256 of bundled font files

```text
05037a960fa0d0e9be079ce2aa63c82594019269ddfdcb6d2e6851fb3770f03a  CandyAntics.ttf
56dfcac846e90496226e0d0c1100b52326cb4d5558d9d2478fa2cba9c0d7bcda  HotCoCo.ttf
1a5a4bf4af2076345480b1a99490a16503f0f5c167e200c8e7644fd40b72d9fd  PetMe64.ttf
c199b39eeae2a817c4f44bd1bdbcbead974e87dc4c7401193db831be2f2470e1  PrintChar21.ttf
47ea29f13de1e8174bffdfd25243c9e43c2d0c2e8b790d3ac8515f4841b8cb09  Speccy.ttf
0f09694548cd0190408ffd60d64f105f6784025980c20bca796efbf16632c5a3  Web437_IBM_VGA_8x16.woff
d1089fbacb79de5ca001cc8ad81dad9ed3739a56ed88a54551af2a29f28e5dad  amiga-topaz/amiga-topaz.ttf
23325bca0c5b8896cfdf5bc3ff6616e9afe351027ee7ca8380f6173300818326  archimedes/acorn-archimedes.ttf
0adc8fc9e152e1c5bbc8e65088eabdfa12d531edde132644c27bae0d513332e9  archimedes/code-studio-archimedes.ttf
3c06288d938f505cb4c64848de12b72e23261b3548aaf2582f9af931352ff627  atari-st/atari-st-low-res.ttf
77a94ef49a2a71ee614ddda5805587fc92fcdd08d2ae51315cf7c6e53ad3f175  atari-st/code-studio-st.ttf
dd024f0535cf39dab2fa6d1d0c43fc179d3d147134d3f8790ebe4f52fcf446ee  bbc-bitmap/bbc-micro.ttf
cf20ee39740c45aeeb75b62ce75be0ab0322d570d19fa208902aaf5d379ca8e3  bbc-bitmap/code-studio-bbc-narrow.ttf
973c99239a9bc34fff91eb098d0a42d712adbca1c491489948ea5014646273f3  bbc-bitmap/code-studio-bbc-wide.ttf
9473c5671c703d26e728a8187f8d30ca7a19497ee17cc5b076bd0fb6e2986007  bedstead.otf
b91f0178b01c5b161ef2547e7f82304095ee7d33316faab48f4b51d6df7557be  cpc464.woff2
188e6b5d6c75a723d6380bd1479dc0ba8aa4112cec84aa9d3ef788cd9f8edd91  mac-chicago/chicago-12.ttf
c2c4f3db81119a6003f59fda4edd3600aaf067a592c0e650ad051649b30029cf  mac-monaco/monaco-9.ttf
592f6d099ab5cbed3ebab13be9c3c3e302e295f2328b27a6a510a558367efcc0  msx/msx-international.ttf
6d19056c91afee36f4a516b34031544428361306decfd4a70502caa45aa0166e  oric/code-studio-oric.ttf
db43731c341db751680a9d7b6769fca568a6daee784ec777f4808e276f420aa7  oric/oric-atmos.ttf
f76334052f07729c0aa1eea60c287c1b254ef63336b77d638b125c9db482a914  zx81/zx81-vdu.ttf
```
