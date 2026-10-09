import { atom, read, update } from 'claude-code'
import type { EngineInterface, Register } from 'claude-code'

import type { AgentRow } from '../types'

const PANE = 'agent-dashboard'
const TITLE = 'Your agents'
const POLL_MS = 2000
const agents = atom({ plugin: 'agent-dashboard', key: 'agents' } as const, [])

const ACTIVE = new Set(['pending', 'running', 'waiting'])

async function refresh($: EngineInterface) {
  const list = await $.agent.list()
  const rows: AgentRow[] = list.map(a => ({
    id: a.id,
    description: a.description,
    type: a.type,
    status: a.status,
  }))
  const same = (old: AgentRow[]) =>
    old.length === rows.length &&
    old.every((r, i) => r.id === rows[i]?.id && r.status === rows[i]?.status)
  await update($, agents, old => (same(old ?? []) ? old : rows))

  const running = rows.filter(r => ACTIVE.has(r.status)).length
  $.ui.status(running > 0 ? `agents: ${running} running` : undefined)
}

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'dashboard',
      description: 'Show a live dashboard of your agents in a pane',
    })
    $.clock.every(POLL_MS, () => refresh($))
    return next(e)
  })

  on('command.run', { command: 'dashboard' }, async $ => {
    await refresh($)
    await $.ui.open({ id: PANE, title: TITLE })
    return { text: 'Agent dashboard opened.' }
  })

  on('ui.render', { component: 'Pane', requestId: PANE }, async ($, e) => {
    const { Box, Text } = $.ui.resolve(e)
    const rows = await read($, agents)
    const active = rows.filter(r => ACTIVE.has(r.status))
    const done = rows.filter(r => !ACTIVE.has(r.status))
    const room = Math.max(1, (e.viewport?.rows ?? 24) - 6)

    return (
      <Box flexDirection="column">
        <Text bold>
          {active.length} running · {done.length} finished
        </Text>
        {rows.length === 0 && <Text dimColor>No agents yet. Ask Claude to run some in the background.</Text>}
        {[...active, ...done].slice(0, room).map(r => (
          <Text dimColor={!ACTIVE.has(r.status)}>
            {r.status.padEnd(9)} {r.description || r.type} <Text dimColor>({r.type})</Text>
          </Text>
        ))}
      </Box>
    )
  })
}
