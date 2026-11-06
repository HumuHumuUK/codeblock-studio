import { formatParser } from './formatLanguages';

export const retroFonts = [
  'PetMe64.ttf', 'bedstead.otf', 'Speccy.ttf', 'cpc464.woff2',
  'PrintChar21.ttf', 'Web437_IBM_VGA_8x16.woff', 'CandyAntics.ttf', 'amiga-topaz/amiga-topaz.ttf',
  'mac-monaco/monaco-9.ttf', 'mac-chicago/chicago-12.ttf', 'atari-st/code-studio-st.ttf',
  'msx/msx-international.ttf', 'zx81/zx81-vdu.ttf', 'HotCoCo.ttf',
  'archimedes/code-studio-archimedes.ttf', 'oric/code-studio-oric.ttf',
  'bbc-bitmap/bbc-micro.ttf', 'bbc-bitmap/code-studio-bbc-narrow.ttf', 'bbc-bitmap/code-studio-bbc-wide.ttf',
];

const machines: Record<string, string> = {
  'basic-commodore': 'c64', 'basic-bbc': 'bbc', 'basic-sinclair': 'spectrum',
  'basic-locomotive': 'cpc', 'basic-applesoft': 'apple', 'basic-gwbasic': 'dos',
  'basic-qbasic': 'qbasic', 'basic-atari': 'atari', 'basic-amos': 'amiga',
  'basic-mac': 'mac', 'basic-macquick': 'mac', 'basic-stos': 'st', 'basic-gfa': 'st',
  'basic-msx': 'msx', 'basic-zx81': 'zx81', 'basic-dragon': 'dragon',
  'basic-archimedes': 'archimedes', 'basic-oric': 'oric',
};

export const bbcModes: Record<string, string> = {
  '7': 'Mode 7 · Teletext', '0': 'Mode 0 · 80 columns', '1': 'Mode 1 · 40 columns',
  '2': 'Mode 2 · 20 columns', '3': 'Mode 3 · 80 columns', '4': 'Mode 4 · 40 columns',
  '5': 'Mode 5 · 20 columns', '6-blue': 'Mode 6 · Blue', '6-red': 'Mode 6 · Red',
};

export function isBbcMode(mode: unknown): mode is string {
  return typeof mode === 'string' && Object.prototype.hasOwnProperty.call(bbcModes, mode);
}

export function retroMachine(language: string): string | undefined {
  return machines[formatParser(language) || ''];
}

// Treat quoted titles as a single field, so a filename containing “retro” is untouched.
const infoFields = /(?:[^\s"']+|"[^"]*"|'[^']*')+/g;
export function hasRetro(info: string): boolean {
  return (info.match(infoFields) || []).slice(1).includes('retro');
}

export function bbcMode(info: string): string {
  const mode = (info.match(infoFields) || []).slice(1).find(field => field.startsWith('retro-mode='))?.slice(11);
  return isBbcMode(mode) ? mode : '7';
}

export function setBbcMode(info: string, mode: string): string {
  if (!isBbcMode(mode)) throw new Error('Unknown BBC display mode.');
  const withoutMode = info.replace(/[ \t]+((?:[^\s"']+|"[^"]*"|'[^']*')+)/g,
    (field, value) => value.startsWith('retro-mode=') ? '' : field);
  return withoutMode + ' retro-mode=' + mode;
}

export function setRetroInfo(info: string, enabled: boolean): string {
  if (enabled) return hasRetro(info) ? info : info + ' retro';
  return info.replace(/[ \t]+((?:[^\s"']+|"[^"]*"|'[^']*')+)/g,
    (field, value) => value === 'retro' ? '' : field);
}
