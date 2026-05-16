import { shouldTrigger } from './trigger.js';

const tests = [
  // Should trigger
  { line: 'func ', col: 6, expect: true, desc: 'ends with func keyword' },
  { line: 'struct ', col: 8, expect: true, desc: 'ends with struct keyword' },
  { line: 'interface ', col: 11, expect: true, desc: 'ends with interface keyword' },
  { line: 'map ', col: 5, expect: true, desc: 'ends with map keyword' },
  { line: 'chan ', col: 6, expect: true, desc: 'ends with chan keyword' },
  { line: 'var x ', col: 7, expect: true, desc: 'var declaration incomplete' },
  { line: 'var x func', col: 11, expect: true, desc: 'var x func' },
  { line: 'var x map', col: 10, expect: true, desc: 'var x map' },
  { line: 'func (r *Repo', col: 14, expect: true, desc: 'method receiver stub' },
  { line: 'func getName(', col: 14, expect: true, desc: 'func name open paren' },
  { line: 'func doSomething() string {', col: 28, expect: false, desc: 'func body open, not a trigger' },
  { line: 'x := ', col: 6, expect: true, desc: ':= no RHS' },
  { line: 'x = ', col: 5, expect: true, desc: '= no RHS' },
  { line: 'make(chan', col: 10, expect: true, desc: 'unbalanced paren' },
  { line: 'var m map[str', col: 14, expect: true, desc: 'unbalanced bracket' },
  { line: 'x.(', col: 4, expect: true, desc: 'type assertion stub' },
  { line: 'SomeStruct{', col: 12, expect: true, desc: 'incomplete struct literal' },
  { line: 'type User str', col: 14, expect: true, desc: 'type decl incomplete' },
  { line: 'func (r *Repo) Get(', col: 20, expect: true, desc: 'method with receiver open paren' },
  // Should NOT trigger
  { line: '', col: 1, expect: false, desc: 'empty line' },
  { line: '   ', col: 4, expect: false, desc: 'whitespace only' },
  { line: '// comment', col: 11, expect: false, desc: 'comment' },
  { line: '/* comment', col: 11, expect: false, desc: 'block comment' },
  { line: 'func main() {}', col: 15, expect: false, desc: 'already complete with }' },
  { line: 'x := 5', col: 7, expect: false, desc: 'complete assignment' },
  { line: 'var x int', col: 10, expect: false, desc: 'complete var decl' },
  { line: 'if x == ', col: 9, expect: false, desc: '== operator' },
  { line: 'if x != ', col: 9, expect: false, desc: '!= operator' },
  { line: 'x.(Type)', col: 9, expect: false, desc: 'complete type assertion' },
  { line: 'SomeStruct{}', col: 13, expect: false, desc: 'complete struct literal' },
  { line: 'x := 5;', col: 8, expect: false, desc: 'ends with semicolon' },
  { line: 'myfunc ', col: 8, expect: false, desc: 'keyword inside identifier' },
  { line: 'var x = 10', col: 11, expect: false, desc: 'complete var assignment' },
  { line: 'func main() {', col: 14, expect: false, desc: 'func body open brace, not stub' },
];

let passed = 0;
let failed = 0;

for (const t of tests) {
  const result = shouldTrigger(t.line, t.col);
  const ok = result === t.expect;
  if (ok) { passed++; console.log(`  ✓ ${t.desc}`); }
  else    { failed++; console.log(`  ✗ ${t.desc} — expected ${t.expect}, got ${result}`); }
}

console.log(`\n${passed}/${tests.length} passed`);
if (failed) process.exit(1);