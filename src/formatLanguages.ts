const parsers: Record<string, string> = {
  javascript: 'babel', js: 'babel', jsx: 'babel', mjs: 'babel', cjs: 'babel',
  typescript: 'typescript', ts: 'typescript', tsx: 'typescript',
  json: 'json', jsonc: 'json', json5: 'json5',
  html: 'html', css: 'css', scss: 'scss', less: 'less',
  yaml: 'yaml', yml: 'yaml', markdown: 'markdown', md: 'markdown',
  python: 'python', py: 'python',
  bash: 'shell-bash', sh: 'shell-posix', shell: 'shell-posix', shellscript: 'shell-posix',
  go: 'gofmt', golang: 'gofmt',
  c: 'clang-c', cpp: 'clang-cpp', 'c++': 'clang-cpp', cc: 'clang-cpp', cxx: 'clang-cpp',
  csharp: 'clang-csharp', cs: 'clang-csharp', 'c#': 'clang-csharp',
  java: 'clang-java', objc: 'clang-objc', objectivec: 'clang-objc', 'objective-c': 'clang-objc',
  proto: 'clang-proto', protobuf: 'clang-proto',
  sql: 'sql-sql', postgresql: 'sql-postgresql', postgres: 'sql-postgresql', pgsql: 'sql-postgresql',
  mysql: 'sql-mysql', mariadb: 'sql-mariadb', sqlite: 'sql-sqlite',
  tsql: 'sql-transactsql', transactsql: 'sql-transactsql', bigquery: 'sql-bigquery',
  xml: 'xml', xhtml: 'xml', svg: 'xml', toml: 'toml', php: 'php',
  graphql: 'graphql', gql: 'graphql', vue: 'vue', angular: 'angular',
};
export function formatParser(language: string): string | undefined {
  const key = language.toLowerCase();
  return Object.prototype.hasOwnProperty.call(parsers, key) ? parsers[key] : undefined;
}

export interface FormatTarget {
  text: string;
  info: string;
  language: string;
  fenceIndex: number;
}

export function safeFence(markup: string, content: string): string {
  const marker = markup[0] === '~' ? '~' : '`';
  let length = Math.max(3, markup.length);
  for (const line of content.split('\n')) {
    const run = line.trimStart().match(marker === '`' ? /^`+/ : /^~+/)?.[0].length || 0;
    if (run >= length) length = run + 1;
  }
  return marker.repeat(length);
}
