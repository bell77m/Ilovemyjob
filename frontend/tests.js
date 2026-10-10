// Plain checks for lib.js. Browser: open tests.html (title shows PASS/FAIL). Node: see AGENTS.md Commands.
let fails = 0;
function check(name, cond) {
  if (!cond) fails++;
  console.log((cond ? 'ok   ' : 'FAIL ') + name);
}

const fired = { human: 'I got fired.', linkedin: 'Thrilled.' };
check('buildPrompt puts examples before the user text',
  buildPrompt('I overslept.', 7, [fired]) ===
  'Human: I got fired.\nLinkedIn: Thrilled.\n\nCringe level: 7/10\nHuman text: I overslept.');
check('buildPrompt without examples is level plus text',
  buildPrompt('x', 3, []) === 'Cringe level: 3/10\nHuman text: x');
check('buildPrompt reverse flips example order and drops cringe',
  buildPrompt('Thrilled to announce...', 7, [fired], true) ===
  'LinkedIn: Thrilled.\nHuman: I got fired.\n\nLinkedIn post: Thrilled to announce...');

check('enforceAgree appends Agree? when missing', enforceAgree('Grateful. #Growth') === 'Grateful. #Growth\n\nAgree?');
check('enforceAgree keeps an existing Agree?', enforceAgree('Grateful. Agree?') === 'Grateful. Agree?');
check('enforceAgree ignores case and trailing whitespace', enforceAgree('grateful. agree?  \n') === 'grateful. agree?');
check('enforceAgree on empty output is just Agree?', enforceAgree('') === 'Agree?');

let [msgs, rest] = splitNdjson('{"response":"Hi"}\n{"respon');
check('splitNdjson parses whole lines', msgs.length === 1 && msgs[0].response === 'Hi');
check('splitNdjson keeps the partial line', rest === '{"respon');
[msgs, rest] = splitNdjson(rest + 'se":"🚀"}\n');
check('splitNdjson finishes a line split across chunks', msgs[0].response === '🚀' && rest === '');
check('splitNdjson skips blank lines', splitNdjson('\n\n')[0].length === 0);

console.log(fails ? `${fails} FAILED` : 'ALL PASS');
if (typeof document !== 'undefined') document.title = fails ? 'FAIL' : 'PASS';
if (typeof process !== 'undefined') process.exitCode = fails ? 1 : 0;
