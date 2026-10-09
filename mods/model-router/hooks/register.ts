import type { EngineInterface, Register } from 'claude-code'

import { classify } from './router'

const CHEAP_MODEL = 'claude-haiku-5-5'
const ENABLED_KEY = 'enabled'

async function isEnabled($: EngineInterface) {
  return (await $.store.get(ENABLED_KEY)) !== false
}

export const register: Register = on => {
  // The route each turn took, by turn id; a reload starts it over, which only
  // means a turn already running keeps the session's model.
  const routes = new Map<string, 'cheap' | 'main'>()

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: 'router',
      description: 'Model router: /router on, /router off, or /router to see its state',
      argumentHint: '[on|off]',
    })
    return next(e)
  })

  on('command.run', { command: 'router' }, async ($, e) => {
    const arg = (e.args ?? '').trim().toLowerCase()
    if (arg === 'on' || arg === 'off') {
      await $.store.set(ENABLED_KEY, arg === 'on')
      if (arg === 'off') $.ui.status(undefined)
    }
    const state = (await isEnabled($)) ? 'on' : 'off'
    return { text: `Model router is ${state}. Simple requests go to ${CHEAP_MODEL}.` }
  })

  on('turn.start', async ($, e, next) => {
    if (await isEnabled($)) {
      const route = classify(e.text)
      routes.set(e.turnId, route)
      $.ui.status(route === 'cheap' ? `router: ${CHEAP_MODEL}` : undefined)
    }
    return next(e)
  })

  on('turn.complete', async ($, e, next) => {
    routes.delete(e.turnId)
    return next(e)
  })

  // Only the main loop is routed; subagents keep the model they were given.
  on('turn.step', async function* ($, e, next) {
    if (e.agentId === undefined && routes.get(e.turnId) === 'cheap') {
      return yield* next({ ...e, model: CHEAP_MODEL, effort: undefined })
    }
    return yield* next(e)
  })
}
