import { expect, test } from 'vitest'
import { buildPrompt, cosine, enforceAgree, synergyScore, topK } from './cringe'

const fired = { human: 'I got fired.', linkedin: 'Thrilled.' }

test('buildPrompt puts examples before the user text', () => {
  expect(buildPrompt('I overslept.', 7, [fired])).toBe(
    'Human: I got fired.\nLinkedIn: Thrilled.\n\nCringe level: 7/10\nHuman text: I overslept.')
})
test('buildPrompt without examples is level plus text', () => {
  expect(buildPrompt('x', 3, [])).toBe('Cringe level: 3/10\nHuman text: x')
})
test('buildPrompt reverse flips example order and drops cringe', () => {
  expect(buildPrompt('Thrilled to announce...', 7, [fired], true)).toBe(
    'LinkedIn: Thrilled.\nHuman: I got fired.\n\nLinkedIn post: Thrilled to announce...')
})

test('enforceAgree appends Agree? when missing', () => {
  expect(enforceAgree('Grateful. #Growth')).toBe('Grateful. #Growth\n\nAgree?')
})
test('enforceAgree keeps an existing Agree?', () => {
  expect(enforceAgree('Grateful. Agree?')).toBe('Grateful. Agree?')
})
test('enforceAgree ignores case and trailing whitespace', () => {
  expect(enforceAgree('grateful. agree?  \n')).toBe('grateful. agree?')
})
test('enforceAgree on empty output is just Agree?', () => {
  expect(enforceAgree('')).toBe('Agree?')
})
test('enforceAgree drops an echoed LinkedIn: label', () => {
  expect(enforceAgree('LinkedIn: Grateful. Agree?')).toBe('Grateful. Agree?')
})
test('enforceAgree drops an echoed Human line and label', () => {
  expect(enforceAgree('Human: I forgot my umbrella.\nLinkedIn: Soaked. Agree?')).toBe('Soaked. Agree?')
})
test('enforceAgree keeps Agree? followed by emoji or hashtags', () => {
  expect(enforceAgree('Grateful. Agree? 🤪 #blessed')).toBe('Grateful. Agree? 🤪 #blessed')
})
test('enforceAgree appends when Agree? is only in an earlier line', () => {
  expect(enforceAgree('Agree? Maybe.\nGrateful.')).toBe('Agree? Maybe.\nGrateful.\n\nAgree?')
})
test('enforceAgree keeps a "Here\'s what I learned:" opener', () => {
  expect(enforceAgree("Here's what I learned from getting fired: nothing. Agree?"))
    .toBe("Here's what I learned from getting fired: nothing. Agree?")
})
test('enforceAgree drops a "Here is the post:" preamble', () => {
  expect(enforceAgree('Here is the rewritten LinkedIn post:\n\nGrateful. Agree?')).toBe('Grateful. Agree?')
})

test('cosine of identical vectors is 1', () => {
  expect(cosine([1, 2], [1, 2])).toBeCloseTo(1, 9)
})
test('cosine of orthogonal vectors is 0', () => {
  expect(cosine([1, 0], [0, 1])).toBe(0)
})
test('cosine with a zero vector is 0, not NaN', () => {
  expect(cosine([0, 0], [1, 1])).toBe(0)
})
test('topK returns indices best first', () => {
  expect(topK([1, 0], [[0, 1], [1, 0], [1, 1]], 2)).toEqual([1, 2])
})
test('topK with k larger than corpus returns all', () => {
  expect(topK([1, 0], [[1, 0]], 3)).toEqual([0])
})

const W = ['synergy', 'journey', 'thought leader', '🚀']
test('synergyScore counts every hit, 10 points each', () => {
  expect(synergyScore('Synergy! synergy on my journey 🚀', W).score).toBe(40)
})
test('synergyScore lists each word once, in list order', () => {
  expect(synergyScore('🚀 synergy synergy', W).buzzwords).toEqual(['synergy', '🚀'])
})
test('synergyScore matches multi-word terms', () => {
  expect(synergyScore('A Thought Leader.', W).buzzwords).toEqual(['thought leader'])
})
test('synergyScore caps at 100', () => {
  expect(synergyScore('synergy '.repeat(20), W).score).toBe(100)
})
test('synergyScore of plain text is 0', () => {
  expect(synergyScore('I ate a sandwich.', W).score).toBe(0)
})
