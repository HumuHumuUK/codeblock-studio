// Inspect control words only; never rewrite a BASIC statement or its data.
function statements(line: string, apostropheComments: boolean): string[] {
  const result: string[] = [];
  let statement = '';
  let quoted = false;
  let start = true;
  let data = false;
  for (let index = 0; index < line.length; index++) {
    if (start) {
      const keyword = line.slice(index).match(/^[ \t]*(REM|DATA)\b/i)?.[1].toUpperCase();
      if (keyword === 'REM') break;
      data = keyword === 'DATA';
      start = false;
    }
    const char = line[index];
    if (!quoted && !data && /[Rr]/.test(char) && (index === 0 || /[^A-Za-z0-9_$%]/.test(line[index - 1])) && /^REM\b/i.test(line.slice(index, index + 4))) break;
    if (char === '"') {
      quoted = !quoted;
      statement += ' ';
    } else if (!quoted && char === ':') {
      result.push(statement.trim().toUpperCase());
      statement = '';
      start = true;
    } else if (!quoted && char === "'" && apostropheComments && !data) {
      break;
    } else {
      statement += quoted ? ' ' : char;
    }
  }
  result.push(statement.trim().toUpperCase());
  return result;
}

export function formatBasic(code: string, dialect: string): string {
  const pc = dialect === 'qbasic' || dialect === 'gwbasic';
  const structured = dialect === 'qbasic' || dialect === 'amos';
  const repeat = dialect === 'bbc' || dialect === 'amos';
  const whileLoop = pc || dialect === 'bbc' || dialect === 'locomotive' || dialect === 'amos';
  const stack: string[] = [];
  const lines = code.replace(/\r\n?/g, '\n').split('\n');
  const width = lines.reduce((max, line) => Math.max(max, line.match(/^[ \t]*(\d+)/)?.[1].length || 0), 0);
  let outputLength = lines.length - 1;
  const reserve = (length: number) => {
    outputLength += length;
    if (outputLength > 500000) throw new Error('The formatted BASIC listing would exceed 500,000 characters.');
  };
  const result = lines.map(line => {
    if (!line.trim()) { reserve(line.length); return line; }
    const numbered = line.match(/^[ \t]*(\d+)([ \t]*)(.*)$/);
    const body = numbered ? numbered[3] : line.replace(/^[ \t]*/, '');
    const parts = statements(body, pc || dialect === 'amos');
    let indent = stack.length;
    for (const [index, part] of parts.entries()) {
      let close = '';
      if (/^NEXT\b/.test(part)) close = 'for';
      else if (repeat && /^UNTIL\b/.test(part)) close = 'repeat';
      else if (whileLoop && /^(?:WEND|ENDWHILE|END WHILE)\b/.test(part)) close = 'while';
      else if (structured && /^(?:ENDIF|END IF)\b/.test(part)) close = 'if';
      else if (structured && /^LOOP\b/.test(part)) close = 'do';
      else if (structured && /^END (?:SUB|FUNCTION|PROCEDURE)\b/.test(part)) close = 'procedure';
      if (close && stack[stack.length - 1] === close) {
        const count = close === 'for' ? part.split(',').length : 1;
        for (let level = 0; level < count && stack[stack.length - 1] === close; level++) stack.pop();
        if (index === 0) indent = stack.length;
      } else if (structured && /^(?:ELSE|ELSEIF|ELSE IF)\b/.test(part)) {
        if (index === 0 && stack[stack.length - 1] === 'if') indent = stack.length - 1;
      } else if (/^FOR\b/.test(part)) stack.push('for');
      else if (repeat && /^REPEAT\b/.test(part)) stack.push('repeat');
      else if (whileLoop && /^WHILE\b/.test(part)) stack.push('while');
      else if (structured && /^IF\b/.test(part) && (/\bTHEN\s*$/.test(part) || (dialect === 'amos' && !/\bTHEN\b/.test(part)))) stack.push('if');
      else if (structured && /^DO(?:\s|$)/.test(part)) stack.push('do');
      else if (structured && /^(?:SUB|FUNCTION|PROCEDURE)\b/.test(part)) stack.push('procedure');
    }
    // Bound the size of generated indentation for deeply nested pasted listings.
    const indentWidth = Math.min(indent, 20) * 2;
    reserve(body.length + indentWidth + (numbered ? Math.max(width, numbered[1].length) + 1 : 0));
    const padding = ' '.repeat(indentWidth);
    return numbered ? numbered[1].padStart(width) + ' ' + padding + body : padding + body;
  }).join('\n');
  return result;
}
