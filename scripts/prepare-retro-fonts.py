"""Regenerate the bundled CC BY-SA font variants with FontTools (not needed to build)."""
from pathlib import Path

from fontTools.pens.transformPen import TransformPen
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.ttLib import TTFont

ROOT = Path(__file__).resolve().parent.parent / 'assets' / 'retro-fonts'


def variant(source, target, name, x=1, y=1, cell=None, omit=()):
    font = TTFont(ROOT / source, recalcTimestamp=False)
    glyphs = font.getGlyphSet()
    outlines = {}
    for glyph_name in font.getGlyphOrder():
        pen = TTGlyphPen(glyphs)
        glyphs[glyph_name].draw(TransformPen(pen, (x, 0, 0, y, 0, 0)))
        outlines[glyph_name] = pen.glyph()
    for glyph_name, outline in outlines.items():
        font['glyf'][glyph_name] = outline
        advance, bearing = font['hmtx'][glyph_name]
        font['hmtx'][glyph_name] = (round(advance * x), round(bearing * x))
    if cell:
        for codepoint, glyph_name in font.getBestCmap().items():
            if 32 <= codepoint <= 126:
                font['hmtx'][glyph_name] = (cell, font['hmtx'][glyph_name][1])
    for table in font['cmap'].tables:
        if table.isUnicode():
            for codepoint in omit:
                table.cmap.pop(codepoint, None)
    for table, fields in [('hhea', ['ascent', 'descent', 'lineGap']),
                          ('OS/2', ['sTypoAscender', 'sTypoDescender', 'sTypoLineGap', 'usWinAscent', 'usWinDescent'])]:
        for field in fields:
            setattr(font[table], field, round(getattr(font[table], field) * y))
    for record in font['name'].names:
        if record.nameID in (1, 3, 4, 6):
            value = name.replace(' ', '') if record.nameID == 6 else name
            record.string = value.encode(record.getEncoding())
    font.save(ROOT / target)


variant('bbc-bitmap/bbc-micro.ttf', 'bbc-bitmap/code-studio-bbc-narrow.ttf', 'Code Studio BBC Narrow', x=0.5)
variant('bbc-bitmap/bbc-micro.ttf', 'bbc-bitmap/code-studio-bbc-wide.ttf', 'Code Studio BBC Wide', x=2)
variant('atari-st/atari-st-low-res.ttf', 'atari-st/code-studio-st.ttf', 'Code Studio ST', cell=1024)
variant('archimedes/acorn-archimedes.ttf', 'archimedes/code-studio-archimedes.ttf', 'Code Studio Archimedes', y=2, cell=1024)
# Empty upstream glyphs must fall back rather than silently hide pasted characters.
variant('oric/oric-atmos.ttf', 'oric/code-studio-oric.ttf', 'Code Studio Oric', x=2, y=2, cell=768, omit=(95, 96, 126))
