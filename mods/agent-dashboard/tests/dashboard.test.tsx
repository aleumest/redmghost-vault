import { expect, mock, test } from 'claude-code/testing'

const PANE = { component: 'Pane', requestId: 'agent-dashboard' } as const

test('the pane lists running agents first', async ($, on) => {
  mock.clock(on)
  on('ui.status', () => ({ value: undefined }))
  on('agent.list', () => ({ value: [
    { id: 'a1', description: 'Drafting the script', type: 'writer', status: 'completed' },
    { id: 'a2', description: 'Reading the sources', type: 'research', status: 'running' },
  ] }) as never)
  on('ui.open', () => ({ value: { isPlaced: true } }) as never)
  await $.command.run({ command: 'dashboard', args: '' } as never)
  for (const surface of ['terminal', 'desktop'] as const) {
    const ui = await $.ui.mount({ plugin: 'agent-dashboard', surface, ...PANE, props: {} as never })
    expect(await ui.find({ type: 'Text', text: /1 running · 1 finished/ })).toBeDefined()
    expect(await ui.find({ type: 'Text', text: /Reading the sources/ })).toBeDefined()
    await ui.unmount()
  }
})
