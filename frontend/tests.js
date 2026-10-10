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
check('enforceAgree drops an echoed LinkedIn: label', enforceAgree('LinkedIn: Grateful. Agree?') === 'Grateful. Agree?');
check('enforceAgree drops an echoed Human line and label',
  enforceAgree('Human: I forgot my umbrella.\nLinkedIn: Soaked. Agree?') === 'Soaked. Agree?');
check('enforceAgree keeps Agree? followed by emoji or hashtags',
  enforceAgree('Grateful. Agree? 🤪 #blessed') === 'Grateful. Agree? 🤪 #blessed');
check('enforceAgree appends when Agree? is only in an earlier line',
  enforceAgree('Agree? Maybe.\nGrateful.') === 'Agree? Maybe.\nGrateful.\n\nAgree?');
check('enforceAgree keeps a "Here\'s what I learned:" opener',
  enforceAgree("Here's what I learned from getting fired: nothing. Agree?") === "Here's what I learned from getting fired: nothing. Agree?");
check('enforceAgree drops a "Here is the post:" preamble',
  enforceAgree('Here is the rewritten LinkedIn post:\n\nGrateful. Agree?') === 'Grateful. Agree?');

let [msgs, rest] = splitNdjson('{"response":"Hi"}\n{"respon');
check('splitNdjson parses whole lines', msgs.length === 1 && msgs[0].response === 'Hi');
check('splitNdjson keeps the partial line', rest === '{"respon');
[msgs, rest] = splitNdjson(rest + 'se":"🚀"}\n');
check('splitNdjson finishes a line split across chunks', msgs[0].response === '🚀' && rest === '');
check('splitNdjson skips blank lines', splitNdjson('\n\n')[0].length === 0);

check('cosine of identical vectors is 1', Math.abs(cosine([1, 2], [1, 2]) - 1) < 1e-9);
check('cosine of orthogonal vectors is 0', cosine([1, 0], [0, 1]) === 0);
check('cosine with a zero vector is 0, not NaN', cosine([0, 0], [1, 1]) === 0);
check('topK returns indices best first', topK([1, 0], [[0, 1], [1, 0], [1, 1]], 2).join() === '1,2');
check('topK with k larger than corpus returns all', topK([1, 0], [[1, 0]], 3).join() === '0');

const W = ['synergy', 'journey', 'thought leader', '🚀'];
check('synergyScore counts every hit, 10 points each', synergyScore('Synergy! synergy on my journey 🚀', W).score === 40);
check('synergyScore lists each word once, in list order', synergyScore('🚀 synergy synergy', W).buzzwords.join() === 'synergy,🚀');
check('synergyScore matches multi-word terms', synergyScore('A Thought Leader.', W).buzzwords.join() === 'thought leader');
check('synergyScore caps at 100', synergyScore('synergy '.repeat(20), W).score === 100);
check('synergyScore of plain text is 0', synergyScore('I ate a sandwich.', W).score === 0);

console.log(fails ?`${fails} FAILED` : 'ALL PASS');
if (typeof document !== 'undefined') document.title = fails ? 'FAIL' : 'PASS';
if (typeof process !== 'undefined') process.exitCode = fails ? 1 : 0;
