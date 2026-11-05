declare module 'prettier-plugin-toml' {
  import type { Plugin } from 'prettier';
  export const languages: Plugin['languages'];
  export const parsers: Plugin['parsers'];
  export const printers: Plugin['printers'];
  export const options: Plugin['options'];
}
