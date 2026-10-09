import { describe, expect, mock, test } from 'claude-code/testing'

import { classify } from '../hooks/router'

describe('classify', () => {
  test('simple edits go to the cheap model', () => {
    expect(classify('fix the typo in README.md')).toBe('cheap')
    expect(classify('rename these files to kebab-case')).toBe('cheap')
    expect(classify('correggi il refuso nel titolo')).toBe('cheap')
  })

  test('anything that needs thinking stays on the main model', () => {
    expect(classify('plan my launch')).toBe('main')
    expect(classify('fix the typo and then debug the login flow')).toBe('main')
    expect(classify('why does this test fail?')).toBe('main')
    expect(classify('')).toBe('main')
    expect(classify('rename ' + 'x'.repeat(400))).toBe('main')
  })
})

test('/router off and on toggles the router', async ($, on) => {
  mock.store(on)
  on('ui.status', () => ({ value: undefined }))
  expect((await $.command.run({ command: 'router', args: 'off' } as never)).text).toContain('off')
  expect((await $.command.run({ command: 'router', args: '' } as never)).text).toContain('off')
  expect((await $.command.run({ command: 'router', args: 'on' } as never)).text).toContain('on')
})

test('a simple turn runs its steps on the cheap model', async ($, on) => {
  mock.store(on)
  const seen: string[] = []
  on('turn.start', ($, e) => ({ turnId: e.turnId }))
  on('ui.status', () => ({ value: undefined }))
  on('turn.step', async function* ($, e) {
    seen.push(e.model)
    return { turnId: e.turnId, index: e.index, answer: '', toolUses: [] } as never
  })
  await $.turn.start({ text: 'fix the typo in the title', turnId: 't1' })
  for await (const _ of $.turn.step({ turnId: 't1', index: 0, model: 'claude-opus-5-5', messageCount: 1 })) {
  }
  await $.turn.start({ text: 'plan the migration', turnId: 't2' })
  for await (const _ of $.turn.step({ turnId: 't2', index: 0, model: 'claude-opus-5-5', messageCount: 1 })) {
  }
  expect(seen).toEqual(['claude-haiku-5-5', 'claude-opus-5-5'])
})
