import { format } from 'prettier/standalone';
import * as babel from 'prettier/plugins/babel';
import * as estree from 'prettier/plugins/estree';
import * as typescript from 'prettier/plugins/typescript';
import * as html from 'prettier/plugins/html';
import * as postcss from 'prettier/plugins/postcss';
import * as yaml from 'prettier/plugins/yaml';
import * as markdown from 'prettier/plugins/markdown';
import * as graphql from 'prettier/plugins/graphql';
import xml from '@prettier/plugin-xml';
import * as toml from 'prettier-plugin-toml';
import * as phpPlugin from '@prettier/plugin-php';
import type { Plugin } from 'prettier';
import { format as sqlFormat, type SqlLanguage } from 'sql-formatter';
import { initSync as initPython, format as pythonFormat } from '@wasm-fmt/ruff_fmt/web';
import { initSync as initShell, format as shellFormat } from '@wasm-fmt/shfmt/web';
import { initSync as initGo, format as goFormat } from '@wasm-fmt/gofmt/web';
import { initSync as initClang, format as clangFormat } from '@wasm-fmt/clang-format/web';
import { formatParser } from './formatLanguages';

let loadAsset: ((filename: string) => Uint8Array) | undefined;
const initialized = new Set<string>();
export function setFormatterAssetLoader(loader: (filename: string) => Uint8Array): void {
  loadAsset = loader;
}
function initialize(name: string, init: (bytes: any) => unknown): void {
  if (initialized.has(name)) return;
  if (!loadAsset) throw new Error('The bundled formatter could not be loaded. Restart Joplin and try again.');
  // Always load packaged bytes explicitly; no formatter fetches code or binaries.
  init(loadAsset(name));
  initialized.add(name);
}

export async function formatCode(code: string, language: string): Promise<string> {
  const parser = formatParser(language);
  if (!parser) throw new Error('Formatting is not available for this language.');
  if (code.length > 500000) throw new Error('This block is too large to format. The limit is 500,000 characters.');
  if (parser === 'python') {
    initialize('ruff_fmt_bg.wasm', initPython);
    return pythonFormat(code, 'snippet.py', {
      indent_style: 'space', indent_width: 4, line_width: 100, line_ending: 'lf',
      quote_style: 'preserve',
    });
  }
  if (parser.startsWith('shell-')) {
    initialize('shfmt.wasm', initShell);
    return shellFormat(code, parser === 'shell-bash' ? 'snippet.bash' : 'snippet.sh', {
      indent: 2, simplify: false, minify: false,
    });
  }
  if (parser === 'gofmt') {
    initialize('gofmt.wasm', initGo);
    return goFormat(code);
  }
  if (parser.startsWith('clang-')) {
    initialize('clang-format.wasm', initClang);
    const kind = parser.slice(6);
    const filenames: Record<string, string> = { c: 'snippet.c', cpp: 'snippet.cpp', csharp: 'snippet.cs', java: 'snippet.java', objc: 'snippet.m', proto: 'snippet.proto' };
    return clangFormat(code, filenames[kind], kind === 'csharp'
      ? '{BasedOnStyle: Microsoft, ColumnLimit: 100}'
      : '{BasedOnStyle: LLVM, IndentWidth: 2, ColumnLimit: 100}');
  }
  if (parser.startsWith('sql-')) {
    return sqlFormat(code, { language: parser.slice(4) as SqlLanguage, tabWidth: 2, keywordCase: 'upper' }).replace(/\n*$/, '\n');
  }
  return format(code, {
    parser, plugins: [babel, estree, typescript, html, postcss, yaml, markdown, graphql, xml, toml, phpPlugin as unknown as Plugin],
    tabWidth: 2, printWidth: 100, endOfLine: 'lf', embeddedLanguageFormatting: 'off',
    // XML text and mixed content may be whitespace-sensitive.
    xmlWhitespaceSensitivity: 'strict',
  });
}
