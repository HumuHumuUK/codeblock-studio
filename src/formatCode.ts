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
import powershell from 'prettier-plugin-powershell';
import type { Plugin } from 'prettier';
import { format as sqlFormat, type SqlLanguage } from 'sql-formatter';
import { initSync as initPython, format as pythonFormat } from '@wasm-fmt/ruff_fmt/web';
import { initSync as initShell, format as shellFormat } from '@wasm-fmt/shfmt/web';
import { initSync as initGo, format as goFormat } from '@wasm-fmt/gofmt/web';
import { initSync as initClang, format as clangFormat } from '@wasm-fmt/clang-format/web';
import { initSync as initLua, format as luaFormat } from '@wasm-fmt/lua_fmt/web';
import initDart, { format as dartFormat } from '@wasm-fmt/dart_fmt/dart_fmt.js';
// This entry accepts packaged bytes instead of resolving an unbundled Node asset.
import { init as initRust, format as rustFormat } from '../node_modules/@scalar/rust-fmt/dist/index.browser.js';
import { createFromBuffer, type Formatter } from '@dprint/formatter';
import { formatParser } from './formatLanguages';
import { formatBasic } from './formatBasic';

let loadAsset: ((filename: string) => Uint8Array) | undefined;
const initialized = new Map<string, Promise<unknown>>();
const dprint = new Map<string, Formatter>();

function powershellTokens(code: string): { text: string; start: number; end: number }[] {
  const tokens: { text: string; start: number; end: number }[] = [];
  const word = /[\p{L}\p{N}_$]+(?:-[\p{L}\p{N}_]+)*|\?\?=|\?\?|&&|\|\||\+\+|--|\+=|-=|\*=|\/=|::|\.\.|[^\s]/uy;
  for (let index = 0; index < code.length;) {
    if (/\s/.test(code[index])) { index++; continue; }
    const start = index;
    const quote = code[index];
    if (code.startsWith('<#', index)) {
      const end = code.indexOf('#>', index + 2);
      index = end < 0 ? code.length : end + 2;
    } else if (/^@["'][ \t]*\r?\n/.test(code.slice(index))) {
      const end = code.indexOf('\n' + code[index + 1] + '@', index + 2);
      index = end < 0 ? code.length : end + 3;
    } else if (quote === '#') {
      const end = code.indexOf('\n', index);
      index = end < 0 ? code.length : end - (code[end - 1] === '\r' ? 1 : 0);
    } else if (quote === '"' || quote === "'") {
      index++;
      while (index < code.length) {
        if (quote === '"' && code[index] === '`') { index += 2; continue; }
        if (code[index++] === quote) {
          if (quote === "'" && code[index] === "'") { index++; continue; }
          break;
        }
      }
    } else if (quote === '`') {
      index = Math.min(code.length, index + (code[index + 1] === '\r' ? 3 : 2));
    } else {
      word.lastIndex = index;
      index += word.exec(code)![0].length;
    }
    const token = code.slice(start, index);
    tokens.push({ text: token.startsWith('<#') ? token.replace(/\r\n?/g, '\n') : token, start, end: index });
  }
  return tokens;
}
export function setFormatterAssetLoader(loader: (filename: string) => Uint8Array): void {
  loadAsset = loader;
}
function initialize(name: string, init: (bytes: any) => unknown): Promise<unknown> {
  if (initialized.has(name)) return initialized.get(name)!;
  if (!loadAsset) throw new Error('The bundled formatter could not be loaded. Restart Joplin and try again.');
  // Always load packaged bytes explicitly; no formatter fetches code or binaries.
  const ready = Promise.resolve().then(() => init(loadAsset!(name))).catch(error => {
    initialized.delete(name);
    throw error;
  });
  initialized.set(name, ready);
  return ready;
}

export async function formatCode(code: string, language: string): Promise<string> {
  const parser = formatParser(language);
  if (!parser) throw new Error('Formatting is not available for this language.');
  if (code.length > 500000) throw new Error('This block is too large to format. The limit is 500,000 characters.');
  if (parser === 'python') {
    await initialize('ruff_fmt_bg.wasm', initPython);
    return pythonFormat(code, 'snippet.py', {
      indent_style: 'space', indent_width: 4, line_width: 100, line_ending: 'lf',
      quote_style: 'preserve',
    });
  }
  if (parser.startsWith('shell-')) {
    await initialize('shfmt.wasm', initShell);
    return shellFormat(code, parser === 'shell-bash' ? 'snippet.bash' : 'snippet.sh', {
      indent: 2, simplify: false, minify: false,
    });
  }
  if (parser === 'gofmt') {
    await initialize('gofmt.wasm', initGo);
    return goFormat(code);
  }
  if (parser.startsWith('clang-')) {
    await initialize('clang-format.wasm', initClang);
    const kind = parser.slice(6);
    const filenames: Record<string, string> = { c: 'snippet.c', cpp: 'snippet.cpp', csharp: 'snippet.cs', java: 'snippet.java', objc: 'snippet.m', proto: 'snippet.proto' };
    return clangFormat(code, filenames[kind], kind === 'csharp'
      ? '{BasedOnStyle: Microsoft, ColumnLimit: 100}'
      : '{BasedOnStyle: LLVM, IndentWidth: 2, ColumnLimit: 100}');
  }
  if (parser.startsWith('sql-')) {
    return sqlFormat(code, { language: parser.slice(4) as SqlLanguage, tabWidth: 2, keywordCase: 'upper' }).replace(/\n*$/, '\n');
  }
  if (parser.startsWith('basic-')) return formatBasic(code, parser.slice(6));
  if (parser === 'lua') {
    await initialize('lua_fmt_bg.wasm', initLua);
    return luaFormat(code, { indent_style: 'space', indent_width: 2, line_width: 100, line_ending: 'lf', sort_requires: false });
  }
  if (parser === 'dart') {
    await initialize('dart_fmt.wasm', initDart);
    return dartFormat(code, 'snippet.dart', { line_width: 100, line_ending: 'lf' });
  }
  if (parser === 'rust') {
    await initialize('rust_fmt.wasm', bytes => initRust({ bytes, encoding: 'none' }));
    return rustFormat(code, { edition: '2021', styleEdition: '2021', newlineStyle: 'Unix', reorderImports: false, reorderModules: false });
  }
  if (parser === 'dockerfile' || parser === 'terraform' || parser === 'hcl') {
    const engine = parser === 'dockerfile' ? 'dockerfile' : 'terraform';
    await initialize(`${engine}.wasm`, bytes => {
      const formatter = createFromBuffer(bytes);
      formatter.setConfig({ lineWidth: 100, indentWidth: 2, newLineKind: 'lf' }, {});
      dprint.set(engine, formatter);
    });
    return dprint.get(engine)!.formatText({ filePath: parser === 'dockerfile' ? 'Dockerfile' : `snippet.${parser === 'terraform' ? 'tf' : 'hcl'}`, fileText: code });
  }
  const result = await format(code, {
    parser, plugins: [babel, estree, typescript, html, postcss, yaml, markdown, graphql, xml, toml, phpPlugin as unknown as Plugin, powershell],
    tabWidth: 2, printWidth: 100, endOfLine: 'lf', embeddedLanguageFormatting: 'off',
    // XML text and mixed content may be whitespace-sensitive.
    xmlWhitespaceSensitivity: 'strict',
    powershellKeywordCase: 'preserve', powershellRewriteAliases: false,
    powershellRewriteWriteHost: false, powershellSortHashtableKeys: false,
  });
  if (parser === 'powershell') {
    const original = powershellTokens(code);
    const formatted = powershellTokens(result);
    const contexts: string[] = [];
    let index = 0;
    let changed = false;
    for (const token of formatted) {
      if (token.text === original[index]?.text) {
        if (['{', '(', '['].includes(token.text)) contexts.push(token.text === '{' && original[index - 1]?.text === '@' ? 'hashtable' : token.text);
        else if (['}', ')', ']'].includes(token.text)) contexts.pop();
        index++;
      } else if (token.text === ';' && contexts[contexts.length - 1] === 'hashtable'
        && index > 0 && original[index + 1]?.text === '='
        && /[\p{L}\p{N}_$"'\])}]$/u.test(original[index - 1].text)
        && /\r?\n/.test(code.slice(original[index - 1].end, original[index]?.start))) {
        // A compact hashtable needs separators where entries previously had newlines.
        continue;
      } else { changed = true; break; }
    }
    if (changed || index !== original.length) {
      throw new Error('The PowerShell formatter changed a token or literal. The original code has been kept.');
    }
  }
  return result;
}
