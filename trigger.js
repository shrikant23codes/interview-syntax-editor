const TYPE_KEYWORDS = ['func', 'struct', 'interface', 'map', 'chan'];

export function shouldTrigger(line, cursorColumn) {

  const trimmedEnd = line.replace(/\s+$/, '');
  if (!trimmedEnd) return false;
  if (cursorColumn <= trimmedEnd.length) return false;

  const trimmedStart = trimmedEnd.trimStart();

  if (trimmedStart.startsWith('//')) return false;
  if (trimmedStart.startsWith('/*')) return false;

  const lastChar = trimmedEnd.slice(-1);
  if (lastChar === ';' || lastChar === '}' || lastChar === ')') return false;

  // 1. Ends with type keyword
  for (const kw of TYPE_KEYWORDS) {
    if (new RegExp(`(?:^|\\s)${kw}$`).test(trimmedEnd)) return true;
  }

  // 2. Incomplete var declaration
  if (/^var\s+\w+\s*$/.test(trimmedStart)) return true;
  if (/^var\s+\w+\s+(func|map|struct|interface|chan)$/.test(trimmedStart)) return true;

  // 3. Incomplete type declaration
  if (/^type\s+\w+\s+\w*$/.test(trimmedStart)) return true;

  // 4. Function / method signature stub
  if (/^func\s*\(\w+\s+\*?\w+$/.test(trimmedStart)) return true;
  if (/^func\s+\w+\s*\($/.test(trimmedStart)) return true;
  if (/^func\s+\w+\s+\w+\s*\($/.test(trimmedStart)) return true;
  if (/^func\s+\w+\s+\([\w\s*]+\)\s+\w+\s*\($/.test(trimmedStart)) return true;

  // 5. Assignment without RHS
  if (/:=\s*$/.test(trimmedEnd)) return true;
  if (/(?<![=!<>\+\-\*/%&|^:])=\s*$/.test(trimmedEnd)) return true;
  
  // 6. Unbalanced parens
  const openParens = (trimmedEnd.match(/\(/g) || []).length;
  const closeParens = (trimmedEnd.match(/\)/g) || []).length;
  if (openParens > closeParens) return true;

  // 7. Unbalanced brackets
  const openBrackets = (trimmedEnd.match(/\[/g) || []).length;
  const closeBrackets = (trimmedEnd.match(/\]/g) || []).length;
  if (openBrackets > closeBrackets) return true;

  // 8. Type assertion stub
  if (/\.\(\s*$/.test(trimmedEnd)) return true;

  // 9. Incomplete struct literal (exclude bare keywords)
  const lit = trimmedEnd.match(/(\w+)\{\s*$/);
  if (lit && !TYPE_KEYWORDS.includes(lit[1])) return true;

  return false;
}
let lastKeyTime = 0;

export function isTypingFast() {
  const now = Date.now();
  const interval = now - lastKeyTime;
  lastKeyTime = now;
  return interval < 100;
}

export function resetTypingTimer() {
  lastKeyTime = 0;
}